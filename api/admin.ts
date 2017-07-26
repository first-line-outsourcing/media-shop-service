const faker = require('faker');

import db from './auth/db';
import { Promocode } from './promocode/promocode';

export async function getSelling (event, context, callback) {

  console.log('event = ', event);

  const from = event.query.from ? `${event.query.from}-01-01` : '2014-01-01';
  const to = event.query.to ? `${event.query.to}-11-31` : '2017-12-31';

  let selling: any[] = [];
  let profiles;

  try {
    profiles = await db.getItems();
  } catch (err) {
    return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
  }

  console.log('user orders =', JSON.stringify(profiles));

  profiles['items'].forEach((profile) => {
    profile.orders.forEach((order) => {
      order['formProfile'].firstName = profile.firstName ? profile.firstName : '';
      order['formProfile'].lastName = profile.lastName ? profile.lastName : '';
      selling.push(order);
    })
  });

  let lastIndex = getRandom(500);

  for (let i = 0; i < lastIndex; i++) {
    selling.push({
      orders: getOrders(),
      total: getRandom(1000),
      formProfile: {
        promoCode: Promocode.generatePromocode(5),
        address: getAddress(),
        payment: getKeyPayment(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      addressOrder: getAddress(),
      date: new Date(faker.date.between(from, to))
    });
  }

  callback(null,selling);
}

function getRandom (max) {
  return Math.floor(Math.random() * (max + 1));
}

function getKeyType () {
  let type = ['music', 'game', 'movie'];
  return type[getRandom(type.length)];
}

function getKeyPayment () {
  let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
  return payment[getRandom(payment.length)];
}

function getAddress () {
  return {
    streetAddress: faker.address.streetAddress(),
    addressLine2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
    country: faker.address.country()
  }
}

function getOrders () {
  let orders: Array<any> = [];
  let lastIndex = 2 + getRandom(10);

  for (let i = 0; i < lastIndex; i++) {
    orders.push({
      id: faker.random.number(),
      type: getKeyType(),
      name: faker.lorem.words(),
      cover: faker.image.imageUrl(),
      description: faker.lorem.paragraph(),
      price: getRandom(100)
    })
  }
  return orders;
}