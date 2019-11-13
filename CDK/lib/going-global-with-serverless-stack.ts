import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import iam = require('@aws-cdk/aws-iam');
import certificate = require('@aws-cdk/aws-certificatemanager');
import route53 = require('@aws-cdk/aws-route53');
import route53_targets = require('@aws-cdk/aws-route53-targets');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import elbv2Targets = require('@aws-cdk/aws-elasticloadbalancingv2-targets');
import { labeledStatement } from '@babel/types';

interface globalStackProps extends cdk.StackProps {
  certArn: string;
  customDomain: string;
}

export class GoingGlobalWithServerlessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: globalStackProps) {
    super(scope, id, props);

    // --- GLOBALS --- ///
    // IAM Policy
    const lambdaDynamoDbStatement = new iam.PolicyStatement();
    lambdaDynamoDbStatement.addActions('*');
    lambdaDynamoDbStatement.addResources('arn:aws:dynamodb:*')
    

    // --- LOAD BALANCER WITH GLOBAL ACCELERATOR --- //
    // VPC
    const vpc = new ec2.Vpc(this, 'VPC');

    // Lambda function
    const getGlobalALB = new lambda.Function(this, 'getGlobalALB', {
      runtime: lambda.Runtime.NODEJS_8_10,
      code: lambda.Code.asset('lambda'),
      handler: 'getStuff.handler',
      environment: {
        'STATUS':'200'
      } 
    });

    getGlobalALB.addToRolePolicy(lambdaDynamoDbStatement);

    // Application Load Balancer
    const lambdaTarget = new elbv2Targets.LambdaTarget(getGlobalALB)

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const albTargetGroup = new elbv2.ApplicationTargetGroup(this, 'lambdaTargetGroup',{
      targets: [lambdaTarget],
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: "/health",
        timeout: cdk.Duration.seconds(5)
      }
    });

    const listener = lb.addListener('Listener', {
      port: 80,
      open: true,
      defaultTargetGroups: [albTargetGroup]

    });

    // --- API GATEWAY WITH ROUTE53 --- //
    const ddbGlobal = new lambda.Function(this, 'ddbGlobalHandler', {
      runtime: lambda.Runtime.NODEJS_8_10,
      code: lambda.Code.asset('lambda'),
      handler: 'writeDynamo.handler' 
    });

    ddbGlobal.addToRolePolicy(lambdaDynamoDbStatement);

    // Certificate
    const certificateArn = props.certArn;
    const cert = certificate.Certificate.fromCertificateArn(this, 'Certificate', certificateArn)

    // API Gateway 
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

