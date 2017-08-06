import * as profileFunc from '../api/auth/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { removeItemFromTable } from './helper';

describe('first test', () => {
    before((done) => {
        process.env.USERS_TABLE = 'bmt-media-shop-service-users';
        process.env.IS_OFFLINE = 'true';
        removeItemFromTable(process.env.USERS_TABLE, done);
    });

    after(() => {
        delete process.env.USERS_TABLE;
        delete process.env.IS_OFFLINE;
    });

    it('when create profile', () => {
        const datata = {
            firstName: 'Semyon',
            lastName: 'Ermolenko',
            social: 'vkontakte',
            nickName: 'sem.ermolenko',
            socialId: '95851704',
            currency: '$',
            picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
        };

        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: datata
            })
            .expectResult((result) => {
            console.log(result);
                delete result.body.id;
                expect(result.body).to.exist;
                for (const key of Object.keys(result.body)) {
                    if (typeof result.body[key] === 'string') {
                        expect(result.body[key]).to.equal(datata[key]);
                    }
                }
            });
    });

    it('when create profile but this profile is exist in db', () => {
        const datata = {
            firstName: 'Semyon',
            lastName: 'Ermolenko',
            social: 'vkontakte',
            nickName: 'sem.ermolenko',
            socialId: '95851704',
            currency: '$',
            picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
        };

        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: datata
            })
            .expectResult((result) => {
                expect(result.body).to.equal(undefined);
            });
    });

    it('when get profile and this profile exist in db', () => {
        const datata = {
            firstName: 'Semyon',
            lastName: 'Ermolenko',
            social: 'vkontakte',
            nickName: 'sem.ermolenko',
            socialId: '95851704',
            currency: '$',
            picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
        };

        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: datata
            })
            .expectResult((result) => {
                delete result.id;
                expect(result).to.exist;
                for (const key of Object.keys(result)) {
                    if (typeof result[key] === 'string') {
                        expect(result[key]).to.equal(datata[key]);
                    }
                }
            });
    });

});