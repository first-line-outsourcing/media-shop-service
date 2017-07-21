import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();

const getItems = () =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users'
        };

        db.scan(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({items: data.Items});
            }
        });
    });

const getProfileByToken = (id, social) =>
    new Promise((resolve, reject) => {
        console.log('id', id);
        const params = {
            TableName: 'bmt-media-shop-service-users',
            Key: {
                id,
                social
            },
        };

        db.get(params, (err, data) => {
            console.log('data', data);
            if (err) {
                reject(err);
            } else if (!data.Item) {
                const notFoundError = new Error(`An item could not be found with id: ${id}`);

                notFoundError.message = '404';

                reject(notFoundError);
            } else {
                delete data.Item['userToken'];
                resolve(data.Item);
            }
        });
    });

const createProfile = (id, social, userData) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users',
            ConditionExpression: 'attribute_not_exists(id)',
            Item: {
                id,
                social,
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

const updateProfile = (id, social, field, value) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users',
            ReturnValues: 'NONE',
            ConditionExpression: 'attribute_exists(id) AND attribute_exists(social)',
            UpdateExpression: `SET #field = :value`,
            Key: {
                id,
                social
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
                    const notFoundError = new Error(`An item could not be found with id: ${id}`);

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

const deleteProfile = (id, social) =>
    new Promise((resolve, reject) => {
        const params = {
            TableName: 'bmt-media-shop-service-users',
            ConditionExpression: 'attribute_exists(id) AND attribute_exists(social)',
            Key: {
                id,
                social,
            },
        };

        db.delete(params, (err) => {
            if (err) {
                if (err.code === 'ConditionalCheckFailedException') {
                    const notFoundError = new Error(`An item could not be found with id: ${id}`);

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
