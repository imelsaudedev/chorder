import * as mongoDB from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'chorder';

export type DBData = {
  client: mongoDB.MongoClient;
  db: mongoDB.Db;
};

export async function getDB(dbData?: DBData): Promise<DBData> {
  if (dbData) {
    return dbData;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(MONGODB_URI);
  await client.connect();
  return { client, db: client.db(DB_NAME) };
}
