import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://anantanand900:anantanand900@cluster0.lx3wgs5.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0";

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}


