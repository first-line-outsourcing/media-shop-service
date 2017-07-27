import { DynamoDB } from 'aws-sdk';
import { int } from 'aws-sdk/clients/datapipeline';

export class Promocode {

  private db;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  public create(id: string, social: string, persent: number): Promise {
    const promocode = Promocode.generatePromocode(5);

    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Item: {
        id,
        social,
        promocode,
        persent
      }
    };

    return this.db.put(params).promise();
  }

  public check(id: string, social: string, promocode: string): Promise<number> {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
        Key: {
          id,
          social
      }
    };

    return this.db.get(params).promise()
      .then((data) => {
        if (data.Item && data.Item.promocode === promocode) {
          return data.Item.persent;
        } else {
          return Promise.reject({ statusCode: 400, message: 'Invalid promocode'});
        }
      });
  }

  public get(id: string, social: string): Promise<PromocodeData> {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id,
        social
      }
    };

    return this.db.get(params).promise();
  }

  public remove(id: string, social: string): Promise {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id,
        social
      }
    };

    return this.db.delete(params).promise();
  }

  public static generatePromocode(length: number): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = 'BESTMOOD-';
    for (let i = 0; i < length; i++ ) {
      code += possible.charAt(Math.random() * possible.length)
    }
    code+='-TECH';
    return code;
  }
}

interface PromocodeData {
  Item: {
    id: string,
    social: string,
    promocode: string,
    persent: number
  }
}

export interface CreateBody {
  isNewUser: boolean,
  orderCount: number
}

export interface CheckBody {
  promocode: string
}
