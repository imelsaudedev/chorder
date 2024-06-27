import * as mongoDB from "mongodb";

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const DB_NAME = "chorder";

type DBData = {
  client: mongoDB.MongoClient;
  db: mongoDB.Db;
};

export async function getDB(): Promise<DBData> {
  if (!CONNECTION_STRING) {
    throw new Error("MONGO_CONNECTION_STRING is not set");
  }
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(CONNECTION_STRING);
  await client.connect();
  return { client, db: client.db(DB_NAME) };
}
