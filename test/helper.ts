import { config } from 'aws-sdk';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { join, normalize } from 'path';
import { Dynamo } from '../api/helper';

config.update({
  accessKeyId: 'YOURKEY',
  secretAccessKey: 'YOURSECRET',
});

export class HelperForTests extends Dynamo {
  yaml;
  serverlessFilePath = normalize(join(__dirname, '../serverless.yml'));

  constructor() {
    super(true);
    this.yaml = safeLoad(readFileSync(this.serverlessFilePath, 'utf8'));
  }

  public removeItemFromTable(tableName, done?) {
    const params = {
      TableName: tableName,
    };
    this.db.scan(params).promise()
      .then((data: any) => {
        if (data.Count === 0) {
          done();
        }
        data.Items.forEach((item, index) => {
          const params = {
            TableName: tableName,
            ConditionExpression: 'attribute_exists(id)',
            Key: {
              id: item.id,
            },
          };
          this.db.delete(params).promise()
            .then(() => {
              if (data.Count - 1 === index) {
                done();
              }
            });
        });
      });
  }

  public getEnvVar(tableName) {
    return this.yaml.provider.environment[tableName].replace('${self:service}', this.yaml.service);
  }
}

export const fakeOrder = {
  products:
    [{
      id: 315635,
      type: 'movie',
      name: 'Spider-Man: Homecoming',
      cover: 'https://image.tmdb.org/t/p/w780/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg',
      description: 'Following the events of Captain America: Civil War, Peter Parker, with the help of his mentor Tony Stark, tries to balance his life as an ordinary high school student in Queens, New York City, with fighting crime as his superhero alter ego Spider-Man as a new threat, the Vulture, emerges.',
      vote: 7.4,
      voteCount: 2448,
      price: 14.8,
      year: '2017',
      count: 1,
      total: 14.8
    },
      {
        id: 324852,
        type: 'movie',
        name: 'Despicable Me 3',
        cover: 'https://image.tmdb.org/t/p/w780/5qcUGqWoWhEsoQwNUrtf3y3fcWn.jpg',
        description: 'Gru and his wife Lucy must stop former \'80s child star Balthazar Bratt from achieving world domination.',
        vote: 6.2,
        voteCount: 1304,
        price: 12.4,
        year: '2017',
        count: 1,
        total: 12.4
      }],
  total: 27.2,
  tax: 3.54,
  currency: '$',
  grandTotal: 30.74,
  formProfile:
    {
      address:
        {
          streetAddress: 'sd',
          addressLine2: 'df',
          city: 'sdf',
          state: 'fds',
          zip: 'fds',
          country: 'Austria'
        },
      payment: 'Bitcoin'
    },
  addressOrder:
    {
      streetAddress: 'sd',
      addressLine2: 'df',
      city: 'sdf',
      state: 'fds',
      zip: 'fds',
      country: 'Austria'
    }
};
