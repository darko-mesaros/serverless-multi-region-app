import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import iam = require('@aws-cdk/aws-iam');
import certificate = require('@aws-cdk/aws-certificatemanager');
import route53 = require('@aws-cdk/aws-route53');
import route53_targets = require('@aws-cdk/aws-route53-targets');

interface globalStackProps extends cdk.StackProps {
  certArn: string;
  customDomain: string;
}

export class GoingGlobalWithServerlessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: globalStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const ddbGlobal = new lambda.Function(this, 'ddbGlobalHandler', {
      runtime: lambda.Runtime.NODEJS_8_10,
      code: lambda.Code.asset('lambda'),
      handler: 'writeDynamo.handler' 
    });

    // IAM Policy
    const lambdaDynamoDbStatement = new iam.PolicyStatement();
    lambdaDynamoDbStatement.addActions('*');
    lambdaDynamoDbStatement.addResources('arn:aws:dynamodb:*')

    ddbGlobal.addToRolePolicy(lambdaDynamoDbStatement);

    // Certificate
    const certificateArn = props.certArn;
    const cert = certificate.Certificate.fromCertificateArn(this, 'Certificate', certificateArn)

//    const api = new apigw.RestApi(this, 'global.rup12.xyz', {
    const domain = props.customDomain;
    const api = new apigw.RestApi(this, domain, {
      domainName: {
        domainName: domain,
        certificate: cert
      }
    });

    const integGlobal = new apigw.LambdaIntegration(ddbGlobal);
    const apiGlobal = api.root.addResource('global');
    apiGlobal.addMethod('GET',integGlobal); 

  }
}

