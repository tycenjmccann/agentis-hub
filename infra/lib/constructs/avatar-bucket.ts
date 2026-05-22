import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AvatarBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'AvatarsBucket', {
      bucketName: `agentis-hub-avatars-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      versioned: false,
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          prefix: 'avatars/',
          expiration: cdk.Duration.days(90),
        },
      ],
      cors: [
        {
          allowedOrigins: ['https://app.agentis-hub.com', 'http://localhost:3000'],
          allowedMethods: [s3.HttpMethods.GET],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag', 'Content-Length'],
          maxAge: 3600,
        },
      ],
    });

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'DenyNonHttps',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      })
    );

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.bucket.bucketArn,
      description: 'Avatar S3 bucket ARN',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'Avatar S3 bucket name',
    });
  }
}
