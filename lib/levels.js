const LEVEL_WIDTH = 15;

const ObjectId = require('mongodb').ObjectId;
const db = require("./mongoHelper").getDb();
const collectionPromise = db.then(db => db.collection("levels")).catch(console.error);

module.exports.create = level => collectionPromise.then(_client => _client.insertOne(level)).catch(console.error);

module.exports.retrieve = (options = null) => collectionPromise.then(_client => _client.find({}, options).toArray());
module.exports.retrieveById = id => collectionPromise.then(c => c.findOne({_id: ObjectId(id)})).catch(console.error);

module.exports.updateById = (id, wins, tries) => collectionPromise.then(
    c=>c.findOneAndUpdate({_id: ObjectId(id)}, {$set: {wins: wins, tries:tries}})).catch(console.error);

module.exports.readLevelInput = function(_input, _name, _username) {
	console.log(_input);
	let tiles = new Array();

	// say the input is 33 characters long.
	// 33 % 10 = 3
	let extra = _input.length%LEVEL_WIDTH;
	// even if extra is 0, this still works
	// rows = (33-3)/10 = 3
	let numRows = (_input.length-extra)/LEVEL_WIDTH;
	for(let j = 0; j<numRows; j++){
		tiles[j] = new Array();
		for(let i = 0; i<LEVEL_WIDTH; i++){
			// when i = 5 and j = 1*10
			// get the 15th character
			let char = _input[(j*LEVEL_WIDTH)+i];
			tile = {
				character: char,
				row: j,
				col: i
			}
			
			
			tiles[j][i] = tile;
		}
	}
	
	// take care of the extra few characters
	// need an extra row for these
	if(extra){
		tiles[numRows] = new Array();
		for(let i = 0; i<extra; i++){
			let char = _input[(numRows*LEVEL_WIDTH)+i];
			tile = {
				character: char,
				row: numRows,
				col: i
			};
			tiles[numRows][i] = tile;
		}
		numRows+=1;
	}
	
	var level = {
		name: _name,
		createdBy: _username,
		rating: 0,
		wins: 0,
		tries: 0,
		// thumbnail: ,
		height: numRows,
		width: LEVEL_WIDTH,
		tiles: tiles,
		message: _input,
		timestamp: Date.now()
	};
	return level;
};