const jwt = require('jsonwebtoken');
import { Profile } from './profile';

const profile = new Profile();

const AUTH0_CLIENT_ID = 'hfDx6WXS2nkcLUhOcHe0Xq34lZE3wfrH';
const AUTH0_CLIENT_SECRET = 'wvSHEEB3V_VvnuwxIDWSqukWoI3tTcqf28YYpKndZEXn3pYj3Q0ueJTDpR6ZT_B8';

// Policy helper function
function generatePolicy(principalId, effect, resource) {
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
}

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export function auth(event, context, cb) {
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
}

export function getAllProfiles(event, context, callback) {
    console.log('getAllItems', JSON.stringify(event));
    profile.getAll()
        .then((data) => callback(null, data.Items))
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error'));
}

export function getProfile(event, context, callback) {
    console.log('getProfile', JSON.stringify(event));
    const [social, id] = event.principalId.split('|');
    const user = event.body;
    profile.get(id, social, user)
        .then((data) => {
            // console.log('profile= ', data);
            callback(null, data);
        })
        .catch((error) => {
            // console.log('error= ', error);
            callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
        });
}

export function updateProfile(event, context, callback) {
    console.log('updateProfile', JSON.stringify(event.body));
    const id = event.path.id;
    profile.update(id, event.body.field, event.body.value)
        .then(() => callback())
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later'));
}


