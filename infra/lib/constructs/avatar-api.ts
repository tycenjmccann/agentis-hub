import * as path from 'path';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2Authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface AvatarApiProps {
  bucket: s3.IBucket;
  cdnDomain: string;
  jwtIssuer: string;
  jwtAudience: string[];
}

export class AvatarApi extends Construct {
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: AvatarApiProps) {
    super(scope, id);

    const usersTableArn = `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/Users`;

    const sharedEnvironment: Record<string, string> = {
      AVATARS_BUCKET_NAME: props.bucket.bucketName,
      CDN_DOMAIN: props.cdnDomain,
      USERS_TABLE_NAME: 'Users',
      MAX_FILE_SIZE_BYTES: '5242880',
      ALLOWED_FORMATS: 'jpeg,png',
    };

    const uploadHandler = new lambda.Function(this, 'UploadHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/handlers/avatar/upload')),
      reservedConcurrentExecutions: 50,
      tracing: lambda.Tracing.ACTIVE,
      environment: sharedEnvironment,
    });

    uploadHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:DeleteObject', 's3:GetObject'],
        resources: [`${props.bucket.bucketArn}/*`],
      })
    );

    uploadHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
        resources: [usersTableArn],
      })
    );

    const deleteHandler = new lambda.Function(this, 'DeleteHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/handlers/avatar/delete')),
      reservedConcurrentExecutions: 50,
      tracing: lambda.Tracing.ACTIVE,
      environment: sharedEnvironment,
    });

    deleteHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:DeleteObject', 's3:GetObject'],
        resources: [`${props.bucket.bucketArn}/*`],
      })
    );

    deleteHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
        resources: [usersTableArn],
      })
    );

    const jwtAuthorizer = new apigwv2Authorizers.HttpJwtAuthorizer('JwtAuthorizer', props.jwtIssuer, {
      jwtAudience: props.jwtAudience,
    });

    // API Gateway v2 default payload size is 10MB; Lambda validation enforces 5MB limit
    this.httpApi = new apigwv2.HttpApi(this, 'AvatarApi', {
      apiName: 'AvatarApi',
      corsPreflight: {
        allowOrigins: ['https://app.agentis-hub.com', 'http://localhost:3000'],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.DELETE, apigwv2.CorsHttpMethod.OPTIONS],
        allowHeaders: ['Authorization', 'Content-Type'],
      },
    });

    const uploadIntegration = new apigwv2Integrations.HttpLambdaIntegration('UploadIntegration', uploadHandler);
    const deleteIntegration = new apigwv2Integrations.HttpLambdaIntegration('DeleteIntegration', deleteHandler);

    this.httpApi.addRoutes({
      path: '/api/users/{userId}/avatar',
      methods: [apigwv2.HttpMethod.POST],
      integration: uploadIntegration,
      authorizer: jwtAuthorizer,
    });

    this.httpApi.addRoutes({
      path: '/api/users/{userId}/avatar',
      methods: [apigwv2.HttpMethod.DELETE],
      integration: deleteIntegration,
      authorizer: jwtAuthorizer,
    });

    const cfnStage = this.httpApi.defaultStage?.node.defaultChild as apigwv2.CfnStage;
    cfnStage.defaultRouteSettings = {
      throttlingBurstLimit: 100,
      throttlingRateLimit: 50,
    };
  }
}
