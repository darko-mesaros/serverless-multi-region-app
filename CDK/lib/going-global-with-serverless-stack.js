"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const lambda = require("@aws-cdk/aws-lambda");
const apigw = require("@aws-cdk/aws-apigateway");
const iam = require("@aws-cdk/aws-iam");
const certificate = require("@aws-cdk/aws-certificatemanager");
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
const elbv2Targets = require("@aws-cdk/aws-elasticloadbalancingv2-targets");
class GoingGlobalWithServerlessStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // --- GLOBALS --- ///
        // IAM Policy
        const lambdaDynamoDbStatement = new iam.PolicyStatement();
        lambdaDynamoDbStatement.addActions('*');
        lambdaDynamoDbStatement.addResources('arn:aws:dynamodb:*');
        // --- LOAD BALANCER WITH GLOBAL ACCELERATOR --- //
        // VPC
        const vpc = new ec2.Vpc(this, 'VPC');
        // Lambda function
        const getGlobalALB = new lambda.Function(this, 'getGlobalALB', {
            runtime: lambda.Runtime.NODEJS_8_10,
            code: lambda.Code.asset('lambda'),
            handler: 'getStuff.handler',
            environment: {
                'STATUS': '200'
            }
        });
        getGlobalALB.addToRolePolicy(lambdaDynamoDbStatement);
        // Application Load Balancer
        const lambdaTarget = new elbv2Targets.LambdaTarget(getGlobalALB);
        const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
            vpc,
            internetFacing: true
        });
        const albTargetGroup = new elbv2.ApplicationTargetGroup(this, 'lambdaTargetGroup', {
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
        const cert = certificate.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
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
        apiGlobal.addMethod('GET', integGlobal);
    }
}
exports.GoingGlobalWithServerlessStack = GoingGlobalWithServerlessStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29pbmctZ2xvYmFsLXdpdGgtc2VydmVybGVzcy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdvaW5nLWdsb2JhbC13aXRoLXNlcnZlcmxlc3Mtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBc0M7QUFDdEMsd0NBQXlDO0FBQ3pDLDhDQUErQztBQUMvQyxpREFBa0Q7QUFDbEQsd0NBQXlDO0FBQ3pDLCtEQUFnRTtBQUdoRSw2REFBOEQ7QUFDOUQsNEVBQTZFO0FBUTdFLE1BQWEsOEJBQStCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0QsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzQkFBc0I7UUFDdEIsYUFBYTtRQUNiLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUQsdUJBQXVCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBRzFELG1EQUFtRDtRQUNuRCxNQUFNO1FBQ04sTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyQyxrQkFBa0I7UUFDbEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDN0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ2pDLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsV0FBVyxFQUFFO2dCQUNYLFFBQVEsRUFBQyxLQUFLO2FBQ2Y7U0FDRixDQUFDLENBQUM7UUFFSCxZQUFZLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFdEQsNEJBQTRCO1FBQzVCLE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUVoRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO1lBQ3ZELEdBQUc7WUFDSCxjQUFjLEVBQUUsSUFBSTtTQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7WUFDaEYsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ3ZCLFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2pDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUU7WUFDMUMsSUFBSSxFQUFFLEVBQUU7WUFDUixJQUFJLEVBQUUsSUFBSTtZQUNWLG1CQUFtQixFQUFFLENBQUMsY0FBYyxDQUFDO1NBRXRDLENBQUMsQ0FBQztRQUVILHNDQUFzQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzlELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUNqQyxPQUFPLEVBQUUscUJBQXFCO1NBQy9CLENBQUMsQ0FBQztRQUVILFNBQVMsQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUVuRCxjQUFjO1FBQ2QsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFFNUYsZUFBZTtRQUNmLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDMUMsVUFBVSxFQUFFO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixXQUFXLEVBQUUsSUFBSTthQUNsQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXpDLENBQUM7Q0FDRjtBQTlFRCx3RUE4RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IGVjMiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lYzInKTtcbmltcG9ydCBsYW1iZGEgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtbGFtYmRhJyk7XG5pbXBvcnQgYXBpZ3cgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtYXBpZ2F0ZXdheScpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBjZXJ0aWZpY2F0ZSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInKTtcbmltcG9ydCByb3V0ZTUzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXJvdXRlNTMnKTtcbmltcG9ydCByb3V0ZTUzX3RhcmdldHMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3Mtcm91dGU1My10YXJnZXRzJyk7XG5pbXBvcnQgZWxidjIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2MicpO1xuaW1wb3J0IGVsYnYyVGFyZ2V0cyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyLXRhcmdldHMnKTtcbmltcG9ydCB7IGxhYmVsZWRTdGF0ZW1lbnQgfSBmcm9tICdAYmFiZWwvdHlwZXMnO1xuXG5pbnRlcmZhY2UgZ2xvYmFsU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgY2VydEFybjogc3RyaW5nO1xuICBjdXN0b21Eb21haW46IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEdvaW5nR2xvYmFsV2l0aFNlcnZlcmxlc3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogZ2xvYmFsU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gLS0tIEdMT0JBTFMgLS0tIC8vL1xuICAgIC8vIElBTSBQb2xpY3lcbiAgICBjb25zdCBsYW1iZGFEeW5hbW9EYlN0YXRlbWVudCA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KCk7XG4gICAgbGFtYmRhRHluYW1vRGJTdGF0ZW1lbnQuYWRkQWN0aW9ucygnKicpO1xuICAgIGxhbWJkYUR5bmFtb0RiU3RhdGVtZW50LmFkZFJlc291cmNlcygnYXJuOmF3czpkeW5hbW9kYjoqJylcbiAgICBcblxuICAgIC8vIC0tLSBMT0FEIEJBTEFOQ0VSIFdJVEggR0xPQkFMIEFDQ0VMRVJBVE9SIC0tLSAvL1xuICAgIC8vIFZQQ1xuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdWUEMnKTtcblxuICAgIC8vIExhbWJkYSBmdW5jdGlvblxuICAgIGNvbnN0IGdldEdsb2JhbEFMQiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ2dldEdsb2JhbEFMQicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU184XzEwLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuYXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ2dldFN0dWZmLmhhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgJ1NUQVRVUyc6JzIwMCdcbiAgICAgIH0gXG4gICAgfSk7XG5cbiAgICBnZXRHbG9iYWxBTEIuYWRkVG9Sb2xlUG9saWN5KGxhbWJkYUR5bmFtb0RiU3RhdGVtZW50KTtcblxuICAgIC8vIEFwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXJcbiAgICBjb25zdCBsYW1iZGFUYXJnZXQgPSBuZXcgZWxidjJUYXJnZXRzLkxhbWJkYVRhcmdldChnZXRHbG9iYWxBTEIpXG5cbiAgICBjb25zdCBsYiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnTEInLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnRlcm5ldEZhY2luZzogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3QgYWxiVGFyZ2V0R3JvdXAgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cCh0aGlzLCAnbGFtYmRhVGFyZ2V0R3JvdXAnLHtcbiAgICAgIHRhcmdldHM6IFtsYW1iZGFUYXJnZXRdLFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgaW50ZXJ2YWw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgcGF0aDogXCIvaGVhbHRoXCIsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDUpXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBsaXN0ZW5lciA9IGxiLmFkZExpc3RlbmVyKCdMaXN0ZW5lcicsIHtcbiAgICAgIHBvcnQ6IDgwLFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIGRlZmF1bHRUYXJnZXRHcm91cHM6IFthbGJUYXJnZXRHcm91cF1cblxuICAgIH0pO1xuXG4gICAgLy8gLS0tIEFQSSBHQVRFV0FZIFdJVEggUk9VVEU1MyAtLS0gLy9cbiAgICBjb25zdCBkZGJHbG9iYWwgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdkZGJHbG9iYWxIYW5kbGVyJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzhfMTAsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5hc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiAnd3JpdGVEeW5hbW8uaGFuZGxlcicgXG4gICAgfSk7XG5cbiAgICBkZGJHbG9iYWwuYWRkVG9Sb2xlUG9saWN5KGxhbWJkYUR5bmFtb0RiU3RhdGVtZW50KTtcblxuICAgIC8vIENlcnRpZmljYXRlXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSBwcm9wcy5jZXJ0QXJuO1xuICAgIGNvbnN0IGNlcnQgPSBjZXJ0aWZpY2F0ZS5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4odGhpcywgJ0NlcnRpZmljYXRlJywgY2VydGlmaWNhdGVBcm4pXG5cbiAgICAvLyBBUEkgR2F0ZXdheSBcbiAgICBjb25zdCBkb21haW4gPSBwcm9wcy5jdXN0b21Eb21haW47XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWd3LlJlc3RBcGkodGhpcywgZG9tYWluLCB7XG4gICAgICBkb21haW5OYW1lOiB7XG4gICAgICAgIGRvbWFpbk5hbWU6IGRvbWFpbixcbiAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGludGVnR2xvYmFsID0gbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGRkYkdsb2JhbCk7XG4gICAgY29uc3QgYXBpR2xvYmFsID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2dsb2JhbCcpO1xuICAgIGFwaUdsb2JhbC5hZGRNZXRob2QoJ0dFVCcsaW50ZWdHbG9iYWwpOyBcblxuICB9XG59XG5cbiJdfQ==