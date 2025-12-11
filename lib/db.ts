import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || "";
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Global variable hack untuk development agar koneksi tidak numpuk saat hot-reload
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
export const DB_NAME = 'db_perizinan_lh'; // Sesuaikan nama DB