// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
var region = process.env.AWS_REGION
var tableName = 'dynamodb_going_global_ALB'
AWS.config.update({region: region});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context, callback) => {
    //var item = event.pathParameters.proxy;
    
    console.log("Current Path: ", event.path);
    
    if (event.path === "/health") {
        var statusCode = parseInt(process.env.STATUS, 10);
        callback(null, { statusCode: statusCode, headers: {'Content-Type':'text/plain'},body: `Health Check: ${statusCode} in region : ${region}`});
    } else { 
        var pathvariables = event.path.split('/')
        var params = {
            TableName: tableName,
            Key: {
                'item_id' : {S: pathvariables[2]}
            }
        };
    
        // Call DynamoDB to read the item from the table
        ddb.getItem(params, function(err, data) {
            if (err) {
            console.log("Error", err);
            } else {
            //console.log("Success", data.Item);
            callback(null, { statusCode: 200, headers: {'Content-Type':'text/plain'},body: `Data from DynamoDB, comfing from ${region}: ${JSON.stringify(data, null, 2)} `})
            
            }
        });
    }


};

