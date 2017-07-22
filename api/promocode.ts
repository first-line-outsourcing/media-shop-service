import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export function create(event, context, callback) {
  const data = event.body;
  if (!data || !data.hasOwnProperty('id') || !data.hasOwnProperty('social')) {
    return callback('[400] Body must have an id and social.');
  }

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

  let promocode = generatePromocode(5);

  dynamoDb.put({
      TableName: process.env.PROMOCODE_TABLE as string,
      Item: {
        id: data.id,
        social: data.social,
        promocode,
        persent
      }
    }, (err) => {
      if (err) {
        console.log(err);
        return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
      }
      callback(null, { promocode, persent });
    });
}

export function check(event, context, callback) {
  const data = event.body;
  if (!data || !data.hasOwnProperty('id') || !data.hasOwnProperty('social') || !data.hasOwnProperty('promocode')) {
    return callback('[400] Body must have an id, social and promocode.');
  }

  dynamoDb.get({
    TableName: process.env.PROMOCODE_TABLE as string,
    Key: {
      id: data.id,
      social: data.social
    }
  }, (err, item) => {
    console.log('Promocode', item);
    if (err) {
      console.log(err);
      return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    }
    if (item.Item && item.Item.hasOwnProperty('id')) {
      if (item.Item['promocode'] === data.promocode) {
        dynamoDb.delete({
          TableName: process.env.PROMOCODE_TABLE as string,
          Key: {
            id: data.id,
            social: data.social
          }
        }, (err) => {
          if (err) {
            console.log(err);
            return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
          }
          callback(null, { persent: item.Item ? item.Item['persent'] : 0 });
        });
      } else {
        callback('[400] Invalid promocode.');
      }
    } else {
      callback('[400] This user has not promocode.');
    }
  });
}

export function get(event, context, callback) {
  const data = event.path;
  if (!data || !data.hasOwnProperty('id') || !data.hasOwnProperty('social')) {
    return callback('[400] Path must have an id and social.');
  }

  console.log('id:', data.id);
  console.log('social:', data.social);
  dynamoDb.get({
    TableName: process.env.PROMOCODE_TABLE as string,
    Key: {
      id: data.id,
      social: data.social
    }
  }, (err, item) => {
    console.log('Promocode', item);
    if (err) {
      console.log(err);
      return callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    }
    callback(null, { promocode: item.Item ? item.Item['promocode'] : '', persent: item.Item ? item.Item['persent'] : 0});
  });
}

function generatePromocode(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = 'BESTMOOD-';
  for (let i = 0; i < length; i++ ) {
    code += possible.charAt(Math.random() * possible.length)
  }
  code+='-TECH';
  return code;
}