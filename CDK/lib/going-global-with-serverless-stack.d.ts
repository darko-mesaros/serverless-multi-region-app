import cdk = require('@aws-cdk/core');
interface globalStackProps extends cdk.StackProps {
    certArn: string;
    customDomain: string;
}
export declare class GoingGlobalWithServerlessStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: globalStackProps);
}
export {};
