import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getItems = userToken =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users'
        };

        db.scan(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log('data', data);
                resolve({items: data.Items});
            }
        });
    });

const getProfileByToken = (token) =>
    new Promise((resolve, reject) => {
        console.log('userToken', token);
        const params = {
            TableName: 'bmt-media-shop-service-users',
            Key: {
                userToken: token
            },
        };

        db.get(params, (err, data) => {
            console.log('data', data);
            if (err) {
                reject(err);
            } else if (!data.Item) {
                const notFoundError = new Error(`An item could not be found with id: ${token}`);

                notFoundError.message = '404';

                reject(notFoundError);
            } else {
                delete data.Item['userToken'];
                resolve(data.Item);
            }
        });
    });

const createProfile = (userToken, userData) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users',
            ConditionExpression: 'attribute_not_exists(userToken)',
            Item: {
                userToken,
                firstName: userData.firstName,
                lastName: userData.lastName,
                country: userData.country,
                currency: userData.currency,
                name: userData.name,
                nickName: userData.nickName,
                orders: userData.orders,
                picture: userData.picture,
                address: userData.address
            },
        };

        db.put(params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    });

const updateProfile = (token, field, value) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users',
            ReturnValues: 'NONE',
            ConditionExpression: 'attribute_exists(userToken)',
            UpdateExpression: `SET #field = :value`,
            Key: {
                userToken: token
            },
            ExpressionAttributeNames: {
                '#field': field,
            },
            ExpressionAttributeValues: {
                ':value': value,
            },
        };

        db.update(params, (err) => {
            if (err) {
                if (err.code === 'ConditionalCheckFailedException') {
                    const notFoundError = new Error(`An item could not be found with id: ${token}`);

                    notFoundError.message = '404';

                    reject(notFoundError);
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });

const deleteProfile = (userId, itemId) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'items',
            ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
            Key: {
                id: itemId,
                userId,
            },
        };

        db.delete(params, (err) => {
            if (err) {
                if (err.code === 'ConditionalCheckFailedException') {
                    const notFoundError = new Error(`An item could not be found with id: ${itemId}`);

                    notFoundError.message = '404';

                    reject(notFoundError);
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });

export default {getItems, getProfileByToken, createProfile, updateProfile, deleteProfile};
