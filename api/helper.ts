import { existsSync, readFile, unlink, } from 'fs';
import { DynamoDB } from 'aws-sdk';
const nodemailer = require('nodemailer');

export const nodemailerMailgun = nodemailer.createTransport({
  service: 'Mailgun',
  host: 'smtp.mailgun.org',
  port: 465,
  auth: {
    user: 'postmaster@support.bestmood.tech',
    pass: 'e2242ac7e2c433e58ec90ae81559f14b'
  }
});

export function errorHandler(callback, customMessage?) {
  return (err) => {
    console.log('Function Error: ', err);
    callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : customMessage || '[500] Internal Server Error');
  };
}

export function readFilePromise(filename): Promise<Buffer> {
  return new Promise(function (resolve, reject) {
    readFile(filename, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

export function removeFilePromise(tmpFileLocation): Promise<any> {
  return new Promise(function (resolve, reject) {
    if (!existsSync(tmpFileLocation)) {
      return resolve();
    }
    unlink(tmpFileLocation, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function log(...args) {
  if(process.env.IS_OFFLINE) { return; }
  console.log.apply(console, args);
}

export class Dynamo {
  protected db;
  constructor(IS_OFFLINE?) {
    if (process.env.IS_OFFLINE || IS_OFFLINE) {
      this.db = new DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000/',
      });
    } else {
      this.db = new DynamoDB.DocumentClient();
    }
  }

  static converter(data) {
    return DynamoDB.Converter.unmarshall(data);
  }
}