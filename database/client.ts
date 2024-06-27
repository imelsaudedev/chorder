import * as mongoDB from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'chorder';

type DBData = {
  client: mongoDB.MongoClient;
  db: mongoDB.Db;
};

export async function getDB(): Promise<DBData> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(MONGODB_URI);
  await client.connect();
  return { client, db: client.db(DB_NAME) };
}
