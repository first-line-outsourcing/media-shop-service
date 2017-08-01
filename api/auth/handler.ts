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

export async function getAllItems(event, context, callback) {
  console.log('getAllItems', JSON.stringify(event));
  try {
    const items = await db.getItems();
    return callback(null, items);
  } catch (err) {
    return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
  }
}

export async function getProfile(event, context, callback) {
  console.log('getProfile', JSON.stringify(event));
  try {
    const [social, socialId] = event.principalId.split('|');
    const user = event.body;

    const item = await db.getProfile(socialId, social, user);
    return callback(null, item);
  } catch (err) {
    return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
  }
}

export async function updateProfile(event, context, callback) {
  console.log('updateProfile', JSON.stringify(event.body));
  try {
    const id = event.path.id;
    await db.updateProfile(id, event.body.field, event.body.value);

    return callback(null, null);
  } catch (err) {
    return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
  }
}
