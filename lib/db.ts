import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

const uri = process.env.MONGO_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

// Deklarasi global agar TypeScript tidak protes
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // Mode Development: Gunakan variabel global agar koneksi awet saat hot-reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Mode Production: Selalu buat koneksi baru
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Cukup export clientPromise saja.
// Tidak perlu export DB_NAME lagi.

// --- TAMBAHKAN FUNGSI INI AGAR ERROR HILANG ---
export async function getDb() {
  const client = await clientPromise;
  
  // Ganti 'sipewas_db' dengan nama database kamu yang sebenarnya
  // Atau lebih baik simpan di .env sebagai DB_NAME
  return client.db(process.env.DB_NAME);
}
// ----------------------------------------------

export default clientPromise;