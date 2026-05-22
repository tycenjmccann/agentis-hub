import { describe, it, expect } from 'vitest';
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AvatarServiceStack } from '../../infra/lib/avatar-stack';

function createTemplate(): Template {
  const app = new cdk.App({
    context: {
      jwtIssuer: 'https://auth.agentis-hub.com',
      jwtAudience: 'agentis-hub-api',
    },
  });
  const stack = new AvatarServiceStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
  return Template.fromStack(stack);
}

describe('AvatarServiceStack', () => {
  describe('S3 Bucket', () => {
    it('has Block Public Access enabled', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('has SSE-S3 encryption', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      });
    });
  });

  describe('CloudFront Distribution', () => {
    it('exists with HTTPS redirect', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: Match.objectLike({
            ViewerProtocolPolicy: 'redirect-to-https',
          }),
        },
      });
    });
  });

  describe('Lambda Functions', () => {
    it('upload handler has correct runtime, memory, and timeout', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
        MemorySize: 512,
        Timeout: 30,
        Architectures: ['arm64'],
      });
    });

    it('delete handler has correct runtime, memory, and timeout', () => {
      const template = createTemplate();
      const functions = template.findResources('AWS::Lambda::Function', {
        Properties: {
          Runtime: 'nodejs20.x',
          MemorySize: 512,
          Timeout: 30,
        },
      });
      expect(Object.keys(functions).length).toBe(2);
    });

    it('has IAM policies granting S3 and DynamoDB access', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['s3:PutObject']),
              Effect: 'Allow',
            }),
          ]),
        },
      });

      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['dynamodb:GetItem']),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });

  describe('API Gateway', () => {
    it('has correct routes', () => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'POST /api/users/{userId}/avatar',
      });
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: 'DELETE /api/users/{userId}/avatar',
      });
    });
  });
});
