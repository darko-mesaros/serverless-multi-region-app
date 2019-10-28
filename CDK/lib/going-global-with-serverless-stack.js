"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const apigw = require("@aws-cdk/aws-apigateway");
const iam = require("@aws-cdk/aws-iam");
const certificate = require("@aws-cdk/aws-certificatemanager");
class GoingGlobalWithServerlessStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        lambdaDynamoDbStatement.addResources('arn:aws:dynamodb:*');
        ddbGlobal.addToRolePolicy(lambdaDynamoDbStatement);
        // Certificate
        const certificateArn = props.certArn;
        const cert = certificate.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
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
        apiGlobal.addMethod('GET', integGlobal);
    }
}
exports.GoingGlobalWithServerlessStack = GoingGlobalWithServerlessStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29pbmctZ2xvYmFsLXdpdGgtc2VydmVybGVzcy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdvaW5nLWdsb2JhbC13aXRoLXNlcnZlcmxlc3Mtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBc0M7QUFDdEMsOENBQStDO0FBQy9DLGlEQUFrRDtBQUNsRCx3Q0FBeUM7QUFDekMsK0RBQWdFO0FBU2hFLE1BQWEsOEJBQStCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0QsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUF1QjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw2Q0FBNkM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDakMsT0FBTyxFQUFFLHFCQUFxQjtTQUMvQixDQUFDLENBQUM7UUFFSCxhQUFhO1FBQ2IsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMxRCx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFFMUQsU0FBUyxDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBRW5ELGNBQWM7UUFDZCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUVoRywrREFBK0Q7UUFDM0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUMxQyxVQUFVLEVBQUU7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0QsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUMsV0FBVyxDQUFDLENBQUM7SUFFekMsQ0FBQztDQUNGO0FBcENELHdFQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgbGFtYmRhID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWxhbWJkYScpO1xuaW1wb3J0IGFwaWd3ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWFwaWdhdGV3YXknKTtcbmltcG9ydCBpYW0gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtaWFtJyk7XG5pbXBvcnQgY2VydGlmaWNhdGUgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJyk7XG5pbXBvcnQgcm91dGU1MyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1yb3V0ZTUzJyk7XG5pbXBvcnQgcm91dGU1M190YXJnZXRzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXJvdXRlNTMtdGFyZ2V0cycpO1xuXG5pbnRlcmZhY2UgZ2xvYmFsU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgY2VydEFybjogc3RyaW5nO1xuICBjdXN0b21Eb21haW46IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEdvaW5nR2xvYmFsV2l0aFNlcnZlcmxlc3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogZ2xvYmFsU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG4gICAgY29uc3QgZGRiR2xvYmFsID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnZGRiR2xvYmFsSGFuZGxlcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU184XzEwLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuYXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ3dyaXRlRHluYW1vLmhhbmRsZXInIFxuICAgIH0pO1xuXG4gICAgLy8gSUFNIFBvbGljeVxuICAgIGNvbnN0IGxhbWJkYUR5bmFtb0RiU3RhdGVtZW50ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoKTtcbiAgICBsYW1iZGFEeW5hbW9EYlN0YXRlbWVudC5hZGRBY3Rpb25zKCcqJyk7XG4gICAgbGFtYmRhRHluYW1vRGJTdGF0ZW1lbnQuYWRkUmVzb3VyY2VzKCdhcm46YXdzOmR5bmFtb2RiOionKVxuXG4gICAgZGRiR2xvYmFsLmFkZFRvUm9sZVBvbGljeShsYW1iZGFEeW5hbW9EYlN0YXRlbWVudCk7XG5cbiAgICAvLyBDZXJ0aWZpY2F0ZVxuICAgIGNvbnN0IGNlcnRpZmljYXRlQXJuID0gcHJvcHMuY2VydEFybjtcbiAgICBjb25zdCBjZXJ0ID0gY2VydGlmaWNhdGUuQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsICdDZXJ0aWZpY2F0ZScsIGNlcnRpZmljYXRlQXJuKVxuXG4vLyAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ3cuUmVzdEFwaSh0aGlzLCAnZ2xvYmFsLnJ1cDEyLnh5eicsIHtcbiAgICBjb25zdCBkb21haW4gPSBwcm9wcy5jdXN0b21Eb21haW47XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWd3LlJlc3RBcGkodGhpcywgZG9tYWluLCB7XG4gICAgICBkb21haW5OYW1lOiB7XG4gICAgICAgIGRvbWFpbk5hbWU6IGRvbWFpbixcbiAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGludGVnR2xvYmFsID0gbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGRkYkdsb2JhbCk7XG4gICAgY29uc3QgYXBpR2xvYmFsID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2dsb2JhbCcpO1xuICAgIGFwaUdsb2JhbC5hZGRNZXRob2QoJ0dFVCcsaW50ZWdHbG9iYWwpOyBcblxuICB9XG59XG5cbiJdfQ==