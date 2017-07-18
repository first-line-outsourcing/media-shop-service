import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid';
const dynamoDb = new DynamoDB.DocumentClient();

export function create(event, context, callback) {
  const data = event.body;
  if (!data || !data.hasOwnProperty('id')) {
    return callback(data);
  }

  let promocode = generatePromocode(5);

  dynamoDb.put({
      TableName: process.env.PROMOCODE_TABLE as string,
      Item: {
        id: uuid.v1(),
        user: data.id,
        promocode,
        persent: 10
      }
    }, (err) => {
      callback(err, {promocode, persent: 10});
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