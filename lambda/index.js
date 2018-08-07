
var AWSXRay = require("aws-xray-sdk-core");
var logger = require('winston');
AWSXRay.setLogger(logger);
var AWS = AWSXRay.captureAWS(require('aws-sdk'));

var ddb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    var table = "xrayk8s";


    console.log('Received event:', JSON.stringify(event, null, 2));

    var response = {};

    var id = Math.floor(new Date() / 1000);
    var username = event.username;
    var message = event.message;


    var params = {
    TableName:table,
        Item:{
            "id":{N:""+id+""},
            "message": {S:message},
            "username": {S:username}
        }
    };

console.log("Adding a new message to DynamoDB: "+message);
response.message = "Adding a new message to DynamoDB: "+message;

AWSXRay.captureAsyncFunc("## dynamodb", function(subsegment) {
    ddb.putItem(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            response.message = "Unable to add item. Error JSON:", JSON.stringify(err, null, 2);
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            response.message = "Added item:", JSON.stringify(data, null, 2);
        }
    });
    subsegment.addAnnotation("username",username);
    subsegment.addAnnotation("message",message);

    subsegment.close();
});

    callback(null, response);
};
