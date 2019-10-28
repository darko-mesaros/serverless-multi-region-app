// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var UUID = require('uuid/v4');
// Set the region 
var region = process.env.AWS_REGION
AWS.config.update({region: region});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var uuid = UUID();

exports.handler = (event, context, callback) => {
    var params = {
    TableName: 'dynamodb_going_global',
    Item: {
        'feedback_id' : {S: UUID()},
        'value' : {S: 'This value is written from: ' + region}
    }
    };

    // Call DynamoDB to add the item to the table
    ddb.putItem(params, function(err, data) {
    if (err) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: `ERROR:  ${data}\n`
        };
    } else {
        console.log("Success", data);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: `Hello! You have written to a Global DynamoDB table from  ${region}\n`
        };
    }
    });


};

