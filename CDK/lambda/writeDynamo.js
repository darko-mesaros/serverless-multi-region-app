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
            callback(err, { statusCode: 500, headers: {'Content-Type':'text/plain'},body: `Error ${err}`})
    
        } else {
            callback(null, { statusCode: 200, headers: {'Content-Type':'text/plain'},body: `Hello! You have written to the Global table from: ${region}`})
            
        }
        });


};

