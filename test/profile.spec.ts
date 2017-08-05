import * as profileFunc from '../api/auth/handler';
import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import * as LT from 'lambda-tester';

describe('first test', () => {
    before(() => {
        process.env.USERS_TABLE = 'users-table';
        process.env.IS_OFFLINE = 'true';
    });

    after(() => {
        delete process.env.USERS_TABLE;
        delete process.env.IS_OFFLINE;
    });
    it('first it', () => {
        const datata = {Key: 'Value'};

        return LT(profileFunc.getProfile)
            .event({
                principalId: '95851704| vkontakte',
                body: {
                    firstName: 'Semyon',
                    lastName: 'Ermolenko',
                    address: [],
                    social: 'vkontakte',
                    nickName: 'sem.ermolenko',
                    socialId: '95851704',
                    currency: '$',
                    orders: [],
                    id: 'e26dd4a0-788d-11e7-af16-07f34f74bd2b',
                    picture: ''
                }
            })
            .expectResult((result) => {
                console.log(result);
                expect(result).to.exist;
                expect(result).to.equal(datata);
            });
    });

    xit('first it', (done) => {
        const datata = {Key: 'Value'};

        // AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
        //     callback(null, {Item: datata});
        // });
        new Promise((resolve, reject) => {
            const event = {
                principalId: '95851704| vkontakte',
                body: {
                    firstName: 'Semyon',
                    lastName: 'Ermolenko',
                    address: [],
                    social: 'vkontakte',
                    nickName: 'sem.ermolenko',
                    socialId: '95851704',
                    currency: '$',
                    orders: [],
                    id: 'e26dd4a0-788d-11e7-af16-07f34f74bd2b',
                    picture: ''
                }
            };
            const context = {};
            const callback = (ctx, data) => {
                console.log('data=', data);
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