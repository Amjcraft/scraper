const MongoDB = require('mongodb').MongoClient;

const collectionMethods = Object.keys(require('mongodb').Collection.prototype);

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

const client = new MongoDB(MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


async function MongoDBConnection() { 
  try {
    await client.connect();
    const database = client.db("texas_parks");
    return database;
  } catch {
    console.log('Mongo Instance Error')
  }
} 

module.exports = MongoDBConnection;
