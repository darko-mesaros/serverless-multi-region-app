exports.handler = async function(event) {

    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    var UUID = requore('uuid/v4');
    // Set the region 
    var region = process.env.AWS_REGION
    AWS.config.update({region: region});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var uuid = UUID();

    var params = {
    TableName: 'dynamodb_going_global',
    Item: {
        'feedback_id' : uuid,
        'value' : 'This valua is written from: ' + region
    }
    };

    // Call DynamoDB to add the item to the table
    ddb.putItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data);
    }
    });


};
