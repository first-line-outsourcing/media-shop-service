const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export function add(event, context, callback) {
    const params = {
        TableName: 'reviews',
        Item: {
            id: Math.floor(Math.random() * 1000 + 1).toString(),
            userID: 'user id',
            productID: 'product id',
            productType: 'product type',
            text: 'review text'
        }
    };
    dynamoDB.put(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could`t adding review'));
            return;
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    })
}


export function getProductID(event, context, callback) {
    const params = {
        TableName: 'reviews',
        FilterExpression: "#productID = :pID",
        ExpressionAttributeNames: {
            "#productID": "productID",
        },
        ExpressionAttributeValues: {
            ":pID": event.pathParameters.productID
        }

    };

    dynamoDB.scan(params, (error, result) => {
        if (error) {
            console.log(params);
            console.error(error);
            callback(new Error('Could`t fetch reviews with product id '+event.pathParameters.productID));
            return;
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    })
}

export function reviewsTrigger(event, context, callback) {
    console.log('reviews trigger');
    console.log(JSON.stringify(event));
}