import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set.");
}

const client = new MongoClient(process.env.MONGODB_URI);

let db: Db;

export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db("exampro");
  }
  return db;
}
