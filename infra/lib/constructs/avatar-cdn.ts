import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface AvatarCdnProps {
  bucket: s3.IBucket;
}

export class AvatarCdn extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: AvatarCdnProps) {
    super(scope, id);

    const cachePolicy = new cloudfront.CachePolicy(this, 'AvatarCachePolicy', {
      cachePolicyName: 'AvatarCachePolicy',
      defaultTtl: cdk.Duration.seconds(86400),
      maxTtl: cdk.Duration.seconds(604800),
      minTtl: cdk.Duration.seconds(0),
    });

    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'AvatarResponseHeaders', {
      responseHeadersPolicyName: 'AvatarSecurityHeaders',
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        contentSecurityPolicy: {
          contentSecurityPolicy: "default-src 'none'",
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
      },
    });

    this.distribution = new cloudfront.Distribution(this, 'AvatarDistribution', {
      comment: 'Agentis Hub Avatar CDN',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.bucket, {
          originPath: '/',
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy,
        responseHeadersPolicy,
      },
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'Avatar CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'Avatar CloudFront distribution ID',
    });
  }
}
