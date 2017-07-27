const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

export function add(event, context, callback) {
    const data = event.body;
    const params = {
        TableName: process.env.TABLE_REVIEWS,
        Item: {
            id: uuid.v1(),
            username: data.username,
            rate: data.rate,
            createDate: data.createDate,
            productID: data.productID,
            text: data.text
        }
    };
    dynamoDB.put(params, (error, result) => {
        if (error) {
            console.log(error);
            return callback(error.statusCode ? `[${error.statusCode}] ${error.message}`: '[500] Internal Server Error');
        }

        const response = {
            statusCode: 200,
            body: "Succes"
        };
        callback(null, response);
    })
}


export function getProductID(event, context, callback) {
    const params = {
        TableName: process.env.TABLE_REVIEWS,
        FilterExpression: "#productID = :pID",
        ExpressionAttributeNames: {
            "#productID": "productID",
        },
        ExpressionAttributeValues: {
            ":pID": event.path.productID
        }
    };

    dynamoDB.scan(params, (error, result) => {
        if (error) {
            console.error(error);
            return callback(error.statusCode ? `[${error.statusCode}] ${error.message}`: '[500] Internal Server Error');
        }
        const response = {
            statusCode: 200,
            data: result.Items
        };
        callback(null, response);
    })
}

export function reviewsTrigger(event, context, callback) {
    console.log('reviews trigger');
    console.log(JSON.stringify(event));
}