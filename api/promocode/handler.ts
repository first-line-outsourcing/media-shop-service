import { CheckBody, CreateBody, Promocode } from './promocode';

export function create(event, context, callback) {
  const id = event.path.id;

  console.log('id: ', id);

  const data: CreateBody = event.body;

  console.log('data: ', data);

  let persent: number;

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

  const promocode: Promocode = new Promocode();

  promocode.create(id, persent)
    .then((data) => {
      console.log('------------->', JSON.stringify(data))
      callback(null, { persent })
    })
    .catch((err) => {
      console.log('Error, when create promocode: ', err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` :
        '[500] Server error. Please try later (can not create a promocode)');
    });
}

export function check(event, context, callback) {
  const id = event.path.id;

  console.log('id: ', id);

  const data: CheckBody = event.body;

  console.log('data: ', data);

  if (!data.hasOwnProperty('promocode')) {
    return callback('[400] Body must have a promocode.');
  }

  const promocode: Promocode = new Promocode();

  promocode.check(id, data.promocode)
    .then((data) => callback(null, { persent: data }))
    .catch((err) => {
      console.log('Error, when check promocode: ', err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` :
        '[500] Server error. Please try later (can not check a promocode)')
    });
}

export function get(event, context, callback) {
  const id = event.path.id;

  console.log('id: ', id);

  const promocode: Promocode = new Promocode();

  promocode.get(id)
    .then((data) => callback(null,
      { promocode: data.Item && data.Item.promocode ? data.Item.promocode : '',
        persent: data.Item && data.Item.persent ? data.Item.persent : 0 }))
    .catch((err) => {
      console.log('Error, when remove promocode: ', err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` :
        '[500] Server error. Please try later (can not get a promocode)');
    });
}

export function remove(event, context, callback){
  const id = event.path.id;

  console.log('id:', id);

  const promocode: Promocode = new Promocode();
  promocode.remove(id)
    .then(() => callback(null, { message: 'Promocode is deleted' }))
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` :
        '[500] Server error. Please try later (can not remove a promocode)');
    })



}

