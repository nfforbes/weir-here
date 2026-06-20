const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://nforbescci_db_user:iXD6QxML6g4hNVb1@cluster0.t13z8kf.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    // In mongoose, the default DB is 'test' if not specified in URI, let's list collections in test or weirhere
    const db = client.db('test');
    const users = await db.collection('users').find({}).toArray();
    console.log(users);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
