const LEVEL_WIDTH = 5;

var express = require('express');
var router = express.Router();
module.exports = router;

const levelsDb = require('../lib/levels');
const tileDb = require('../lib/tiles');
const findOptions = {sort: {timestamp: -1}, limit: 20}

router.get('/level/:id', function(req,res){
    Promise.all([
        router.handlebars.getTemplate('views/partials/level.handlebars', {precompiled: true}),
        levelsDb.retrieveById(req.params.id)
    ]).then(
        level => res.render('partials/level', {
            name: level[1].name,
            tiles: level[1].tiles,
            height: level[1].height,
            width: level[1].width,
            templates: [{'name': 'level', 'template': level[0]}]
        })
    ).catch(console.error);
});

router.get('/create', function(req, res){
    res.render("levelSelect/create");
});

router.post('/create', function(req, res){
    var levelObject = readLevelInput(
        req.body.message.trim(),
        req.body.name.trim(),
        req.user.username.trim());
    
    levelsDb.create(levelObject).then(
        ()=> res.redirect(req.baseUrl + '/')
    ).catch(console.error);
});

var readLevelInput = function(_input, _name, _username) {
    console.log(_input);
    let tiles = new Array();

    // say the input is 33 characters long.
    // 33 % 10 = 3
    let extra = _input.length%LEVEL_WIDTH;
    console.log("extra tiles "+extra);
    // even if extra is 0, this still works
    // rows = (33-3)/10 = 3
    let numRows = (_input.length-extra)/LEVEL_WIDTH;
    console.log("num rows"+ numRows);
    for(let j = 0; j<numRows; j++){
        tiles[j] = new Array();
        for(let i = 0; i<LEVEL_WIDTH; i++){
            // when i = 5 and j = 1*10
            // get the 15th character
            let char = _input[(j*LEVEL_WIDTH)+i];
            tile = {
                character: char,
                //effect: tileDb.retrieveByChar(char),
                row: i,
                col: j
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
            console.log("extra char "+ i + " is "+ char);
            tile = {
                character: char,
                //effect: tileDb.retrieveByChar(char),
                row: numRows,
                col: i
            };
            console.log("row " +tile.row+ ", col "+ tile.col);
            tiles[numRows][i] = tile;
        }
        numRows+=1;
    }
    
    var level = {
        name: _name,
        createdBy: _username,
        rating: 0,
        winRate: 0,
        // thumbnail: ,
        height: numRows,
        width: LEVEL_WIDTH,
        tiles: tiles,
        message: _input,
        timestamp: Date.now()
    };
    return level;
};

router.get("/", function(req,res){
    //res.render("levelSelect/select");
    Promise.all([
        router.handlebars.getTemplate('views/levelSelect/select.handlebars', {precompiled: true}),
        levelsDb.retrieve(findOptions)
    ]).then(
        results => res.render('levelSelect/select', {
            levels: results[1],
            templates: [{'name': 'levelSelect', 'template': results[0]}]
        })
    ).catch(console.error);
});