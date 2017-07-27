import { Reviews } from './reviews';

export function add(event, context, callback) {
  const reviews = new Reviews();
  reviews.add(event.body)
    .then(() => {
      callback(
        null,
        {
          statusCode: 200,
          body: "Success"
        }
      );
    })
    .catch((error) => {
      console.log(error);
      return callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
    })
}

export function getByProductID(event, context, callback) {
  const reviews = new Reviews();
  reviews.getByProductID(event.path.productID)
    .then((data) => {
      console.log(data);
      callback(
        null,
        {
          statusCode: 200,
          body: data.Items
        }
      );
    })
    .catch((error) => {
      console.log(error);
      return callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
    })
}

