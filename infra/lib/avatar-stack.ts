import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AvatarBucket } from './constructs/avatar-bucket';
import { AvatarCdn } from './constructs/avatar-cdn';
import { AvatarApi } from './constructs/avatar-api';

export class AvatarServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('service', 'avatar');
    cdk.Tags.of(this).add('team', 'backend');

    const avatarBucket = new AvatarBucket(this, 'AvatarBucket');

    const avatarCdn = new AvatarCdn(this, 'AvatarCdn', {
      bucket: avatarBucket.bucket,
    });

    new AvatarApi(this, 'AvatarApi', {
      bucket: avatarBucket.bucket,
      cdnDomain: avatarCdn.distribution.distributionDomainName,
      jwtIssuer: this.node.tryGetContext('jwtIssuer') || process.env.JWT_ISSUER || 'https://auth.agentis-hub.com',
      jwtAudience: [this.node.tryGetContext('jwtAudience') || process.env.JWT_AUDIENCE || 'agentis-hub-api'],
    });
  }
}
