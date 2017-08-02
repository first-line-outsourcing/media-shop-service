import * as AWS from 'aws-sdk';

export class Profile {
    private db;

    constructor() {
        if (process.env.IS_OFFLINE) {
            this.db = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000/'
            });
        } else {
            this.db = new AWS.DynamoDB.DocumentClient();
        }
    }

    public create(id, social, userData) {
        const params = {
            TableName: process.env.USERS_TABLE as string,
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
        return this.db.put(params);
    }

    public get(id: string, social: string) {
        const params = {
            TableName: process.env.USERS_TABLE as string,
            Key: {
                id,
                social
            },
        };
        return this.db.get(params).promise();
    }

    public update(id, social, field, value) {
        const params = {
            TableName: process.env.USERS_TABLE as string,
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
        return this.db.update(params).promise();
    }

    public getAll() {
        const params = {
            TableName: process.env.USERS_TABLE as string
        };
        return this.db.scan(params).promise();
    }
}