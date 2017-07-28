const faker = require('faker');

import {DynamoDB} from 'aws-sdk';
import { Promocode } from '../promocode/promocode';

export class AdminPanel {

  private db;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  public getOrders (from, to) {

    let formedOrders: any[] = [];


    const paramsUsersTable = {
      TableName: process.env.USERS_TABLE as string
    };

    const paramsOrdersTable = {
      TableName: process.env.Orders_TABLE as string
    };

    let lastIndex = getRandom(500);

    for (let i = 0; i < lastIndex; i++) {
      formedOrders.push({
        items: getItems(),
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

    Promise.all([this.db.scan(paramsUsersTable), this.db.scan(paramsOrdersTable)])
      .then(([profiles, orders]) => orders.forEach((order) => {
        console.log('data from usersTable = ', JSON.stringify(profiles));
        console.log('data from ordersTable = ', JSON.stringify(orders));
        let orderedByProfile = profiles.find((profile) => profile.id === order.orderedBy);
        order.formProfile.firstName = orderedByProfile.firstName;
        order.formProfile.lastName = orderedByProfile.lastName;
        formedOrders.push(order);
      }));

    console.log('Formed orders =', JSON.stringify(formedOrders));

    return new Promise((resolve, reject)=> resolve(formedOrders));
  }

  public createOrder (id, orderData) {

    orderData.orderedBy = id;

      const params = {
        TableName: process.env.ORDER_TABLE as string,
        Item: orderData
      };

      return this.db.put(params).promise();
  }
}

function getRandom (max) {
  return Math.floor(Math.random() * (max + 1));
}

function getKeyType () {
  let type = ['music', 'game', 'movie'];
  return type[getRandom(type.length-1)];
}

function getKeyPayment () {
  let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
  return payment[getRandom(payment.length-1)];
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

function getItems () {
  let orders: any[] = [];
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