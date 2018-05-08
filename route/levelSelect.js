var express = require('express');
var router = express.Router();
module.exports = router;

const levelsDb = require('../lib/levels');
const findOptions = {sort: {timestamp: -1}, limit: 20}

router.get('/level/:id', function(req,res){
	Promise.all([
		router.handlebars.getTemplate('views/partials/level.handlebars', {precompiled: true}),
		levelsDb.retrieveById(req.params.id)
	]).then(
		level => res.render('partials/level', {
			name: level[1].name,
			message: level[1].message,
			tiles: JSON.stringify(level[1].tiles),
			templates: [{'name': 'level', 'template': level[0]}]
		})
	).catch(console.error);
});

router.get('/lost/:id', function(req,res){
	console.log("lost");
	let id = req.params.id;
	levelsDb.retrieveById(id).then(
		function(result){
			levelsDb.updateById(id, result.wins, result.tries+1).then(
				res.redirect(req.baseUrl)
			);
		}
	).catch(console.error);
});

router.get('/won/:id', function(req,res){
	console.log("won");
	let id = req.params.id;
	levelsDb.retrieveById(id).then(
		function(result){
			levelsDb.updateById(id, result.wins+1, result.tries+1).then(
				res.redirect(req.baseUrl)
			);
		}
	).catch(console.error);
});

router.get('/create', function(req, res){
	res.render("levelSelect/create");
});

router.post('/create', function(req, res){
	var levelObject = levelsDb.readLevelInput(
		req.body.message.trim(),
		req.body.name.trim(),
		req.user.username.trim());
	
	levelsDb.create(levelObject).then(
		()=> res.redirect(req.baseUrl + '/')
	).catch(console.error);
});

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