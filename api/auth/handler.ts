const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

import db from './db';

const AUTH0_CLIENT_ID = 'hfDx6WXS2nkcLUhOcHe0Xq34lZE3wfrH';
const AUTH0_CLIENT_SECRET = 'wvSHEEB3V_VvnuwxIDWSqukWoI3tTcqf28YYpKndZEXn3pYj3Q0ueJTDpR6ZT_B8';

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse: any = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument: any = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne: any = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

const createResponse = (statusCode, body) => (
    {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS
        },
        body,
    }
);

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export const auth = (event, context, cb) => {
    if (event.authorizationToken) {
        // remove "bearer " from token
        console.log('event', JSON.stringify(event));
        const token = event.authorizationToken.substring(7);
        const options = {
            audience: AUTH0_CLIENT_ID,
        };
        console.log('token', token);
        const secretBuffer = new Buffer(AUTH0_CLIENT_SECRET, 'base64');
        jwt.verify(token, secretBuffer, options, (err, decoded) => {
            if (err) {
                cb('Unauthorized');
            } else {
                console.log('authorized');
                cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
            }
        });
    } else {
        cb('Unauthorized');
    }
};

export async function getAllItems(event, context, callback) {
    console.log('getAllItems', JSON.stringify(event));
    try {
        const token = event.headers.Authorization.substring(7);
        const items = await db.getItems(event.principalId);
        return callback(null, createResponse(200, items));
    } catch (err) {
        return callback(
            null,
            createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
        );
    }
}

export async function getProfile(event, context, callback) {
    console.log('getProfile', JSON.stringify(event));
    try {
        const social = event.principalId.split('|')[0];
        const id = event.principalId.split('|')[1];
        const item = await db.getProfileByToken(id, social);

        return callback(null, createResponse(200, item));
    } catch (err) {
        return callback(
            null,
            createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
        );
    }
}

export async function updateProfile(event, context, callback) {
    console.log('updateProfile', JSON.stringify(event.body));
    try {
        const social = event.principalId.split('|')[0];
        const id = event.principalId.split('|')[1];
        await db.updateProfile(id, social, event.body.field, event.body.value);

        return callback(null, createResponse(200, null));
    } catch (err) {
        return callback(
            null,
            createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
        );
    }
}

export async function createProfile(event, context, callback) {
    console.log('createProfile', JSON.stringify(event));

    try {
        const social = event.principalId.split('|')[0];
        const id = event.principalId.split('|')[1];
        const item = await db.createProfile(id, social, event.body);

        return callback(null, createResponse(201, item));
    } catch (err) {
        return callback(
            null,
            createResponse(err.responseStatusCode || 500, { message: err.message || 'Internal server error' }),
        );
    }
}