import { errorHandler, log } from '../helper';
import { ProfileManager } from './profile.manager';
import { Profile } from './profile.model';

export function getAll(event, context, callback) {
  const manager = new ProfileManager();
  manager.getAll()
    .then((data) => callback(null, data))
    .catch(errorHandler(callback));
}

export async function findOrCreate(event, context, callback) {
  const [social, id] = event.principalId.split('|');
  const user = event.body;
  console.dir(user);
  log('FindOrCreate Profile. Incoming data: ', '\n social: ', social, ' id: ', id, '\n body: ', user);

  const manager = new ProfileManager();
  try {
    const profile = await manager.findOrCreate(id, social, user);
    console.dir(profile);
    callback(null, profile);
  } catch (e) {
    errorHandler(callback)(e);
  }
}

export function update(event, context, callback) {
  const id = event.path.id;
  const body = event.body;

  log('Update Profile. Incoming data: ', ' \n id: ', id, '\n body: ', body);

  const manager = new ProfileManager();

  manager.update(id, body.field, body.value)
    .then(() => callback())
    .catch(err => {
      let message = err.code === 'ConditionalCheckFailedException' ?
        `[404] An item could not be found with id: ${id}` : err.message;
      errorHandler(callback, message)(err);
    });
}
