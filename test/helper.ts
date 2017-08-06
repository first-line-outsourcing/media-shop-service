import * as AWS from 'aws-sdk';

export function removeItemFromTable(tableName, done?) {

    const db = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000/'
    });

    const params = {
        TableName: tableName
    };
    db.scan(params).promise()
        .then((data: any) => {
            if (data.Count === 0) {
                done();
            }
            data.Items.forEach((item, index) => {
                const params = {
                    TableName: tableName,
                    ConditionExpression: 'attribute_exists(id)',
                    Key: {
                        id: item.id
                    }
                };
                db.delete(params).promise()
                    .then(() => {
                        if (data.Count - 1 === index) {
                            done();
                        }
                    });
            });
        });
}

export function findIdBySocialSocialId(social, socialId, tableName) {
    const db = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000/'
    });

    const params = {
        TableName: tableName,
        FilterExpression: 'socialId = :socialId and social = :social',
        ExpressionAttributeValues: {
            ':socialId': socialId,
            ':social': social
        }
    };
    return db.scan(params).promise()
        .then((data) => {
            if (!data.Items || !data.Items.length) {
                return Promise.reject({
                    statusCode: 404,
                    message: `An item could not be found with id: ${socialId}`
                });
            }
            return data.Items[0].id;
        });
}
