import * as profileFunc from '../api/auth/handler';
import { expect } from 'chai';
import * as AWS from 'aws-sdk-mock';
import * as LT from 'lambda-tester';

describe('first test', () => {

    it('first it', () => {
        const datata = {Key: 'Value'};

        // AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
        //     console.log('params', params);
        //     callback(null, {Item: datata});
        // });

        return LT(profileFunc.getProfile)
            .event({
                principalId: 'asasdasd| assdasdassd'
            })
            .expectResult((result) => {
                console.log(result);
                expect(result).to.exist;
                expect(result).to.equal(datata);
            });
    });

    it('first it', (done) => {
        const datata = {Key: 'Value'};

        // AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
        //     callback(null, {Item: datata});
        // });
        new Promise((resolve, reject) => {
            const event = {
                principalId: 'asasdasd| assdasdassd'
            };
            const context = {};
            const callback = (ctx, data) => {
                if (data) {
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