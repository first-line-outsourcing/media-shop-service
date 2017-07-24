import { Promocode } from './promocode';

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
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
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
    .then((data) => callback(null, { persent: data[0] }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error')
    });
}

export function get(event, context, callback) {
  const [social, id] = event.principalId.split('|');

  console.log('id:', id);
  console.log('social:', social);

  const promocode = new Promocode();

  promocode.get(id, social)
    .then((data) => callback(null, { promocode: data.Item.promocode, persent: data.Item.persent }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    });
}

