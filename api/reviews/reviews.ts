import { DynamoDB } from 'aws-sdk';
const uuid = require('uuid');

export class Reviews {
  private db;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  public add(data) {
    const params = {
      TableName: process.env.REVIEWS_TABLE,
      Item: {
        id: uuid.v1(),
        username: data.username,
        rate: data.rate,
        createDate: data.createDate,
        productID: data.productID,
        text: data.text
      }
    };
    return this.db.put(params).promise();
  }

  public getByProductID(id) {
    const params = {
      TableName: process.env.REVIEWS_TABLE,
      FilterExpression: "productID = :pID",
      ExpressionAttributeValues: {
        ":pID": id
      }
    };

    return this.db.scan(params).promise();
  }
}