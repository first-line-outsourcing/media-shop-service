import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { HelperForTests, fakeOrder } from './helper';
import * as orderHandler from '../api/order/handler';
import * as profileHandler from '../api/profile/handler';

const HFT = new HelperForTests();

function beforeTests(done) {
  process.env.ORDER_TABLE = HFT.getEnvVar('ORDER_TABLE');
  process.env.USER_TABLE = HFT.getEnvVar('USER_TABLE');
  process.env.IS_OFFLINE = 'true';
  HFT.removeItemFromTable(process.env.USER_TABLE, done);
}

function afterTests() {
  delete process.env.ORDER_TABLE;
  delete process.env.USER_TABLE;
  delete process.env.IS_OFFLINE;
}

describe('checking create new order', () => {

  before(beforeTests);
  after(afterTests);
  const tmpFakeOrder: any = fakeOrder;
  const profile: any = {
    firstName: 'Semyon',
    lastName: 'Ermolenko',
    social: 'vkontakte',
    nickName: 'sem.ermolenko',
    socialId: '95851704',
    currency: '$',
    picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4',
  };

  it('create profile before update', () => {
    return LT(profileHandler.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: profile,
      })
      .expectResult((result) => {
        profile['id'] = result.id;
        expect(result).to.exist;
        expect(result.isNew).to.equal(true);
        delete result.isNew;
        for (const key of Object.keys(result)) {
          expect(result[key]).to.equal(profile[key]);
        }
      });
  });

  it('when create order by user', () => {
    return LT(orderHandler.createOrder)
      .event({
        body: fakeOrder,
        principalId: 'vkontakte|95851704'
      })
      .expectResult((result) => {
        expect(result).to.exist;
        tmpFakeOrder['id'] = result.id;
      });
  });

  it('when create order by user but user not found', () => {
    return LT(orderHandler.createOrder)
      .event({
        body: fakeOrder,
        principalId: 'vkontakte'
      })
      .expectError();
  });

  it('when get fake orders if from and to is exist', () => {
    return LT(orderHandler.getByRangeDates)
      .event({
        query: {
          from: '2014-01-01',
          to: '2015-01-01',
          isFake: false
        }
      })
      .expectResult((result) => expect(result).to.exist);
  });

  it('when get fake orders if from and to is not exist', () => {
    return LT(orderHandler.getByRangeDates)
      .event({
        query: {
          isFake: true
        }
      })
      .expectResult((result) => expect(result).to.exist);
  });

  it('when get profile by id', () => {
    return LT(orderHandler.getByProfileId)
      .event({
        path: {
          id: profile.id
        }
      })
      .expectResult((result) => expect(result).to.exist);
  });

  it('when get profile by bad id', () => {
    return LT(orderHandler.getByProfileId)
      .event({
        path: {
          id: 'bla bla'
        }
      })
      .expectResult((result) => expect(result.length).to.equal(0));
  });

  it('when get order by id', () => {
    return LT(orderHandler.getById)
      .event({
        path: {
          id: tmpFakeOrder.id
        }
      })
      .expectResult((result) => expect(result).to.exist);
  });

  it('when get order by bad id', () => {
    return LT(orderHandler.getById)
      .event({
        path: {
          id: 'bla blaa'
        }
      })
      .expectResult((result) => expect(result).to.equal(undefined));
  });
});

