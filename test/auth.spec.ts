import * as profileFunc from '../api/auth/handler';
import { expect } from 'chai';

const AWS = require('aws-sdk-mock');

AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
    callback(null, {Item: {Key: 'Value'}});
});

describe('first test', () => {

    it('first it', (done) => {
        return new Promise((resolve, reject) => {
            const event = {
                principalId: 'asasdasd| assdasdassd'
            };
            const context = {};
            const callback = (ctx, data) => {
                console.log(data);
                if (data.statusCode == 200) {
                    resolve(data);
                    done();
                } else {
                    reject(data);
                }
            };
            profileFunc.getProfile(event, context, callback);
        });
    });

});