const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://nforbescci_db_user:iXD6QxML6g4hNVb1@cluster0.t13z8kf.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const result = await db.collection('users').updateMany(
      {},
      { $addToSet: { personas: 'administrator' } }
    );
    console.log(`Updated ${result.modifiedCount} users to be administrators.`);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
