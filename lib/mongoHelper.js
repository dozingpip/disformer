const MongoClient = require('mongodb').MongoClient;
// const mongoOptions = require('../config/mongodb-options');
const clientPromise = MongoClient.connect(process.env.DB_URI);
module.exports.getDb = () => clientPromise.then((client) => client.db(process.env.DB_NAME)).catch(console.error);