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
      TableName: process.env.ORDERS_TABLE as string
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

     return Promise.all([this.db.scan(paramsUsersTable).promise(), this.db.scan(paramsOrdersTable).promise()])
      .then(([profiles, orders]) => {
        console.log('data from usersTable = ', profiles);
        console.log('data from ordersTable = ', orders);
        orders.Items.forEach((order) => {
          let orderedByProfile = profiles.Items.find((profile) => profile.id === order.orderedBy);
          console.log(orderedByProfile.firstName);
          order.formProfile.firstName = orderedByProfile.firstName;
          order.formProfile.lastName = orderedByProfile.lastName;
          formedOrders.push(order);
          console.log('asd', formedOrders);
        });
        return formedOrders;
      })
       .then((data) => Promise.resolve(data));


  }

  public createOrder (id, orderData) {

    orderData.orderedBy = id;

      const params = {
        TableName: process.env.ORDERS_TABLE as string,
        Item: orderData
      };

      return this.db.put(params).promise();
  }

  public getOrdersByProfile (id) {
    console.log('id = ', id);
    const params = {
      TableName: process.env.ORDERS_TABLE as string,
      FilterExpression: "orderedBy = :id",
      ExpressionAttributeValues: {
        ":id": id.toString()
      }
    };

    return this.db.scan(params).promise();
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