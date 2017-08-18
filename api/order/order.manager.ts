import { ProfileManager } from '../profile/profile.manager';
import { PromocodeManager } from '../promocode/promocode.manager';
import { Order } from './order.model';
import { Dynamo, nodemailerMailgun } from '../helper';
import { printByTrigger } from '../invoice/handler';

const faker = require('faker');

export class OrderManager extends Dynamo {
  private profileManager: ProfileManager;

  constructor() {
    super();
    this.profileManager = new ProfileManager();
  }

  /************* Public methods ********* ****/
  public create(orderData): Promise<Order> {
    const order = new Order(orderData);
    const params = OrderManager.getParams({
      Item: order,
    });
    return this.db.put(params).promise().then(() => order);
  }

  public getAll(): Promise<Order[]> {
    return this.db.scan(OrderManager.getParams()).promise()
      .then(data => data.Items.map(item => new Order(item)));
  }

  public getByRangeDates(from: string, to: string): Promise<Order[]> {
    const params = OrderManager.getParams({
      FilterExpression: '#createdAt > :from AND #createdAt < :to',
      ExpressionAttributeNames: {
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':from': from,
        ':to': to,
      },
    });

    const pOrders = this.db.scan(params).promise().then(data => data.Items.map(item => new Order(item)));

    return Promise.all([this.profileManager.getAll(), pOrders])
      .then(([profiles, orders]) => {
        console.log('data from usersTable = ', profiles);
        console.log('data from ordersTable = ', orders);
        orders.forEach((order: Order) => {
          let profile = profiles.find((profile) => profile.id === order.createdBy);
          if (profile) {
            order.formProfile.firstName = profile.firstName;
            order.formProfile.lastName = profile.lastName;
          }
        });
        return orders;
      });
  }

  public getByProfileId(id: string): Promise<Order[]> {
    const params = OrderManager.getParams({
      FilterExpression: 'createdBy = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
    });

    return this.db.scan(params).promise().then(data => data.Items.map(item => new Order(item)));
  }

  public getById(id) {
    const params = OrderManager.getParams({
      Key: {
        id,
      },
    });
    return this.db.get(params).promise()
      .then((data) => data.Item);
  }

  public notification(data, context, cb) {
    const order = new Order(Dynamo.converter(data));
    printByTrigger(order, context, cb)
      .then((user) => {
        console.log(user);
        if (user['email']) {
          nodemailerMailgun.sendMail({
            from: 'BMT',
            to: `${user['email']}`,
            subject: 'Media shop - BMT',
            text: 'Link to Invoice?',
            html: `
              <div>
                <h1>Notification</h1>
                <p>
                  <a href="https://s3.eu-central-1.amazonaws.com/${process.env.PDF_BUCKET}/${order.id}">Invoice link</a>
                </p>
              </div>
            `
          }, (error, response) => {
            if (error) {
              console.error(error)
            } else {
              cb(null, response);
            }
          });
        }
      })
  }

  /************* Private methods ********* ****/

  /************* Static methods ********* ****/

  static getParams(params?) {
    return Object.assign({
      TableName: process.env.ORDER_TABLE as string,
    }, params || {});
  }

  static makeFakeOrders(count: number, from?: string, to?: string): Promise<Order[]> {
    let formedOrders: any[] = [];

    for (let i = 0; i < count; i++) {
      formedOrders.push(new Order({
        products: OrderManager.fakeProducts(),
        total: OrderManager.randomNumber(1000),
        formProfile: {
          promoCode: PromocodeManager.generatePromocode(5),
          address: OrderManager.fakeAddress(),
          payment: OrderManager.randomKeyPayment(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
        addressOrder: OrderManager.fakeAddress(),
        createdAt: new Date(faker.date.between(from || '2017-01-01T20:57:36.159Z', to || '2017-06-01T20:57:36.159Z')),
      }));
    }
    return Promise.resolve(formedOrders);
  }

  static randomNumber(max): number {
    return Math.floor(Math.random() * (max + 1));
  }

  static randomKeyType(): string {
    let type = ['music', 'game', 'movie'];
    return type[OrderManager.randomNumber(type.length - 1)];
  }

  static randomKeyPayment(): string {
    let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
    return payment[OrderManager.randomNumber(payment.length - 1)];
  }

  static fakeAddress(): any {
    return {
      streetAddress: faker.address.streetAddress(),
      addressLine2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
      country: faker.address.country(),
    };
  }

  static fakeProducts(): any[] {
    let products: any[] = [];
    let lastIndex = 2 + OrderManager.randomNumber(10);

    for (let i = 0; i < lastIndex; i++) {
      products.push({
        id: faker.random.number(),
        type: OrderManager.randomKeyType(),
        name: faker.lorem.words(),
        cover: faker.image.imageUrl(),
        description: faker.lorem.paragraph(),
        price: OrderManager.randomNumber(100),
      });
    }
    return products;
  }
}
