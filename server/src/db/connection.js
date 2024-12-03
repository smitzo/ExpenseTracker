import mongoose from 'mongoose';
let pending;
export async function database(uri) {
  if (!pending)
    pending = mongoose
      .createConnection(uri, {
        maxPoolSize: 5,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        autoIndex: false,
      })
      .asPromise()
      .catch((error) => {
        pending = undefined;
        throw error;
      });
  const connection = await pending;
  return connection.db;
}
export async function disconnect() {
  if (pending) {
    const c = await pending;
    await c.close();
    pending = undefined;
  }
}
export const collection = (db, name) => db.collection('v2_' + name);
