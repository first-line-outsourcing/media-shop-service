import { Promocode } from './promocode';
import { DynamoDB } from 'aws-sdk';

export function create(event, context, callback) {
  const [social, id] = event.principalId.split('|');

  console.log('id:', id);
  console.log('social:', social);

  const data = event.body;

  console.log('data:', data);

  let persent;

  if (data.isNewUser) {
    persent = 10;
  } else {
    let orderRange = data.orderCount / 5;
    if (!data.hasOwnProperty('orderCount') || !orderRange || data.orderCount % 5 !== 0) {
      return callback('[400] Not new user must have order count a multiple of five.');
    }
    switch (orderRange) {
      case 1:
        persent = 20;
        break;
      case 2:
        persent = 30;
        break;
      case 3:
        persent = 40;
        break;
      default:
        persent = 50;
    }
  }

  const promocode = new Promocode();

  promocode.create(id, social, persent)
    .then((data) => callback(null, { persent }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
    });
}

export function check(event, context, callback) {
  const [social, id] = event.principalId.split('|');

  console.log('id:', id);
  console.log('social:', social);

  const data = event.body;

  console.log('data:', data);

  if (!data.hasOwnProperty('promocode')) {
    return callback('[400] Body must have a promocode.');
  }

  const promocode = new Promocode();

  promocode.check(id, social, data.promocode)
    .then((data) => callback(null, { persent: data }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later')
    });
}

export function get(event, context, callback) {
  const [social, id] = event.principalId.split('|');

  console.log('id:', id);
  console.log('social:', social);

  const promocode = new Promocode();

  promocode.get(id, social)
    .then((data) => callback(null,
      { promocode: data.Item && data.Item.promocode ? data.Item.promocode : '',
        persent: data.Item && data.Item.persent ? data.Item.persent : 0 }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Server error. Please try later');
    });
}

export function remove(event, context, callback){
  const data = event.Records[0].dynamodb;
  console.log(data);

  const keys = DynamoDB.Converter.unmarshall(data.Keys);
  console.log('keys:', keys);

  const newImage = DynamoDB.Converter.unmarshall(data.NewImage);
  const oldImage =  DynamoDB.Converter.unmarshall(data.OldImage);
  console.log(newImage);
  console.log(oldImage);

  if(newImage.orders && oldImage.orders && newImage.orders.length > oldImage.orders.length) {
    const promoCode = newImage.orders[newImage.orders.length - 1].formProfile.promoCode;
    if (promoCode) {
      const promocode = new Promocode();
      promocode.check(keys.id, keys.social, promoCode)
        .then(() => promocode.remove(keys.id, keys.social))
        .then(() => console.log('Promocode is removed'))
        .catch((err) => console.log(err))
    }
  }

}

