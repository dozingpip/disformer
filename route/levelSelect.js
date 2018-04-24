const LEVEL_WIDTH = 10;

var express = require('express');
var router = express.Router();
module.exports = router;

const levelsDb = require('../lib/levels');
const tileDb = require('../lib/tiles');
const findOptions = {sort: {timestamp: -1}, limit: 20}

router.get('/levels:id', function(req,res){
    levelsDb.retrieveById(req.params.id).then(
        level => res.json({error: null, data: {level: level}})
    ).catch(console.error);
});

router.get('/create', function(req, res){
    res.render("create");
});

router.get('/phaser', function(req, res){
    res.render("partials/level");
})

/**
 * This little helper function is common to both of post / and post /levels
 * @param req
 * @param res
 * @param next
 */
var readLevelInput = function(req,res,next) {
    let input = req.body.message;
    let tiles = [];

    // say the input is 33 characters long.
    // 33 % 10 = 3
    let extra = input.length%LEVEL_WIDTH;
    // even if extra is 0, this still works
    // rows = (33-3)/10 = 3
    let numRows = (input.length-extra)/LEVEL_WIDTH;
    for(let j = 0; j<numRows; j++){
        tiles[j] = [];
        for(let i = 0; i<LEVEL_WIDTH; i++){
            // when i = 5 and j = 1*10
            // get the 15th character
            let char = input[(j*LEVEL_WIDTH)+i];
            tile = {
                character: char,
                effect: tilesDb.retrieveByChar(char),
                row: i,
                col: j
            }
            tiles[tile.row][tile.col] = tile;
        }
    }
    
    // take care of the extra few characters
    // need an extra row for these
    if(extra){
        for(let i = 0; i<extra; i++){
            let char = input[(numRows*LEVEL_WIDTH)+i];
                tile = {
                    character: char,
                    effect: tilesDb.retrieveByChar(char),
                    row: i,
                    col: numRows+1
                }
                tiles[tile.row][tile.col] = tile;
        }
        numRows+=1;
    }
    
    var level = {
        name: req.body.levelName,
        createdBy: req.user.username,
        rating: 0,
        winRate: 0,
        // thumbnail: ,
        height: numRows,
        width: LEVEL_WIDTH,
        tiles: tiles,
        message: req.body.message,
        timestamp: Date.now()
    };
    levelsDb.create(level).catch(console.errors);
    next();
};

router.post('/', readLevelInput, function(req,res){
    res.redirect(303, req.baseUrl);
});

router.post('/levels', readLevelInput, function(req,res) {
    res.json({error: null, data: null});
});