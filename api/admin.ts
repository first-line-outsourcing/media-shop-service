const faker = require('faker');

export function getSelling (event, context, callback) {
  console.log('event = ', event);
  console.log('event = ', context);

  let from = event.query.from ? `${event.query.from}-01-01` : '2014-01-01';
  let to = event.query.to ? `${event.query.to}-11-31` : '2016-11-31';

  let selling: Array<any> = [];
  let lastIndex = getRandom(500);

  for (let i = 0; i < lastIndex; i++) {
    selling.push({
      orders: getOrders(),
      total: getRandom(1000),
      formProfile: {
        promoCode: faker.lorem.word(),
        address: getAddress(),
        payment: getKeyPayment(getRandom(5)),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      addressOrder: getAddress(),
      date: new Date(faker.date.between(from, to))
    });
  }
  console.log('selling = ', selling);
  callback(null,selling);
}

function getRandom (max) {
  return Math.floor(Math.random() * (max + 1));
}

function getKeyType (key) {
  let type = ['music', 'game', 'movie'];
  return type[key];
}

function getKeyPayment (key) {
  let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
  return payment[key];
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
      type: getKeyType(getRandom(3)),
      name: faker.lorem.words(),
      cover: faker.image.imageUrl(),
      description: faker.lorem.paragraph(),
      price: getRandom(100)
    })
  }
  return orders;
}