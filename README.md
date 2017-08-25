<img src="https://github.com/BestMood-Tech/media-shop/blob/master/src/assets/BMT.png" alt="alt text" width="25%">

# media-shop-service
Serverless API for Media shop https://github.com/BestMood-Tech/media-shop

[![CircleCI](https://circleci.com/gh/BestMood-Tech/media-shop-service.svg?style=svg)](https://circleci.com/gh/BestMood-Tech/media-shop-service)

# API Docs
https://s3.eu-central-1.amazonaws.com/bmt-media-shop-service-docs/index.html

# Do not forget

- Create empty dir `documentation`
- Create `.env` text file in the root of the project with all private environment variables

Example: 

```
AUTH0_CLIENT_ID = aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
AUTH0_CLIENT_SECRET = AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
``` 

# NPM commands

- **start**: deploy to the AWS
- **test**: run unit tests locally
- **serverless-offline**: start local development environment
- **raml**: generate raml docs to the documentation folder
- **ramlhtml**: generate html docs from raml source
- **documentation**: generate docs. *raml* + *ramlhtml*
- **deploy**: deploy to AWS + generate docs + sync docs folder with S3 docs bucket

