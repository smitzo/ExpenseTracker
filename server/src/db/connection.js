import mongoose from 'mongoose';
const pools = new Map();
export async function database(uri) {
  if (!pools.has(uri)) {
    const connection = mongoose.createConnection(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      autoIndex: false,
    });
    const pending = connection.asPromise().catch(async (error) => {
      if (pools.get(uri) === pending) pools.delete(uri);
      await connection.close().catch(() => {});
      throw error;
    });
    pools.set(uri, pending);
  }
  return (await pools.get(uri)).db;
}
export async function disconnect(uri) {
  const entries = uri === undefined ? [...pools] : pools.has(uri) ? [[uri, pools.get(uri)]] : [];
  for (const [key, pending] of entries) if (pools.get(key) === pending) pools.delete(key);
  await Promise.all(
    entries.map(async ([, pending]) => {
      const connection = await pending;
      await connection.close();
    }),
  );
}
export const collection = (db, name) => db.collection('v2_' + name);
