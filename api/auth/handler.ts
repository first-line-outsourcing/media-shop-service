import { Profile } from '../auth/profile';
import * as AWS from 'aws-sdk';
import db from './db';

const jwt = require('jsonwebtoken');
const profile = new Profile();

const AUTH0_CLIENT_ID = 'hfDx6WXS2nkcLUhOcHe0Xq34lZE3wfrH';
const AUTH0_CLIENT_SECRET = 'wvSHEEB3V_VvnuwxIDWSqukWoI3tTcqf28YYpKndZEXn3pYj3Q0ueJTDpR6ZT_B8';

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse['principalId'] = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument['Version'] = '2012-10-17';
        policyDocument['Statement'] = [];
        const statementOne = {};
        statementOne['Action'] = 'execute-api:Invoke';
        statementOne['Effect'] = effect;
        statementOne['Resource'] = resource;
        policyDocument['Statement'][0] = statementOne;
        authResponse['policyDocument'] = policyDocument;
    }
    return authResponse;
};

function createResponse(statusCode, body) {
    return {
        statusCode,
        body
    }
}

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export const auth = (event, context, cb) => {
    if (event.authorizationToken) {
        // remove "bearer " from token
        console.log('event', JSON.stringify(event));
        const token = event.authorizationToken.substring(7);
        const options = {
            audience: AUTH0_CLIENT_ID,
        };
        const secretBuffer = new Buffer(AUTH0_CLIENT_SECRET, 'base64');
        jwt.verify(token, secretBuffer, options, (err, decoded) => {
            if (err) {
                cb('[401] Unauthorized');
            } else {
                cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
            }
        });
    } else {
        cb('[401] Unauthorized');
    }
};

export function getAllItems(event, context, callback) {
    console.log('getAllItems', JSON.stringify(event));
    profile.getAll()
        .then((data) => callback(null, data.Items))
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error'));
}

export function getProfile(event, context, callback) {
    console.log('getProfile', JSON.stringify(event));
    const [social, id] = event.principalId.split('|');
    profile.get(id, social)
        .then((data) => {
            console.log('profile= ', data);
            callback(null, data.Item);
        })
        .catch((error) => {
            console.log('error= ', error);
            callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error');
        });
}

export function updateProfile(event, context, callback) {
    console.log('updateProfile', JSON.stringify(event.body));
    const [social, id] = event.principalId.split('|');
    profile.update(id, social, event.body.field, event.body.value)
        .then(() => callback())
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error'));
}

export function createProfile(event, context, callback) {
    console.log('createProfile', event);
    const [social, id] = event.principalId.split('|');
    try {
        profile.create(id, social, event.body).promise()
            .then((data) => {
                console.log('handler create=', data);
                callback(null, data.Item)
            })
            .catch((error) => {
                console.log('create error=', error);
                if (error.statusCode === 400) {
                    callback(null, createResponse(400, 'User already exist'))
                } else {
                    callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error');
                }
            })
    }
    catch (error) {
        console.log('error', error);
    }
}