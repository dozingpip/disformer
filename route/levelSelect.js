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
            message: level[1].message,
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
    
    var level = {
        name: _name,
        createdBy: _username,
        rating: 0,
        winRate: 0,
        // thumbnail: ,
        height: numRows,
        width: LEVEL_WIDTH,
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