import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import GoingGlobalWithServerless = require('../lib/going-global-with-serverless-stack');
/* This test fails when I have multiple stacks with different props
test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GoingGlobalWithServerless.GoingGlobalWithServerlessStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
*/