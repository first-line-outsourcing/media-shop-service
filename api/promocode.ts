import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid';
const dynamoDb = new DynamoDB.DocumentClient();

export async function create(event, context, callback) {
  const data = JSON.parse(event.body);
  if (!data || !data.hasOwnProperty('id')) {
    return callback(data);
  }


}

function generatePromocode() {

}