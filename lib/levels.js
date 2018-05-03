const ObjectId = require('mongodb').ObjectId;
const db = require("./mongoHelper").getDb();
const collectionPromise = db.then(db => db.collection("levels")).catch(console.error);

module.exports.create = level => collectionPromise.then(_client => _client.insertOne(level)).catch(console.error);

module.exports.retrieve = (options = null) => collectionPromise.then(_client => _client.find({}, options).toArray());
module.exports.retrieveById = id => collectionPromise.then(c => c.findOne({_id: ObjectId(id)})).catch(console.error);