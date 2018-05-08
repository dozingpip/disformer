const rowHeight = 30;
const colWidth = 30;

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	tiles: [],
	lineSpacing: 5
};

var game = new Phaser.Game(config);
var platforms;
var player;
var exitPoints;
var damage;
var score = 0;
var health = 3;
var scoreText;
var healthText;
var heal;
var up;
var down;
var left;
var right;
var points;
var question;
var pause;

var tileLetters = "fduhtvpolrs?.!";
var tileEmojiCodes = {
"fire": "/images/png/emoji_u1f525.png",
"cat": "/images/png/emoji_u1f638.png",
"exclaim": "/images/png/emoji_u1f359.png",
"spikes": "/images/png/emoji_u1f409.png",
"bomb": "/images/png/emoji_u1f4a3.png",
"heal": "/images/png/emoji_u1f359.png",
"exit": "/images/png/emoji_u1f6aa.png",
"default": "/images/png/emoji_u1f601.png",
"coin": "/images/png/emoji_u1f4b0.png",
"pause": "/images/png/emoji_u23f8.png",
"left": "/images/png/emoji_u2b05.png",
"right": "/images/png/emoji_u1f449.png",
"down": "/images/png/emoji_u1f44e.png",
"up": "/images/png/emoji_u1f199.png",
"question": "/images/png/emoji_u2753.png",
"thorns": "/images/png/emoji_u1f339.png"};

function preload ()
{
	for (var key in tileEmojiCodes) {
		this.load.image(key, tileEmojiCodes[key], colWidth, rowHeight);
	}
	this.load.image('sky', '/images/sky.png');
	this.load.image('ground', '/images/platform.png', config.width, 10);
	this.load.image('star', '/images/star.png');
	this.load.spritesheet('dude', 
		'/images/dude.png',
		{ frameWidth: 32, frameHeight: 48 }
	);
	checkTilesExist();
	
}

function createLevel(_input){
	config.tiles = _input;
}

function create ()
{
	var startX = 20;
	var startY = 300;
	platforms = this.physics.add.staticGroup();
	tiles = this.physics.add.staticGroup();
	exitPoints = this.physics.add.staticGroup();
	damage = this.physics.add.staticGroup();
	up = this.physics.add.staticGroup();
	down = this.physics.add.staticGroup();
	left = this.physics.add.staticGroup();
	right = this.physics.add.staticGroup();
	question = this.physics.add.staticGroup();
	heal = this.physics.add.staticGroup();
	points = this.physics.add.staticGroup();
	pause = this.physics.add.staticGroup();
	// var sky = this.add.image(400, 300, 'sky');
	// sky.scrollFactorY = 0;
	
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
	scoreText.scrollFactorY = 0;
	healthText = this.add.text(16, 48, 'heath: '+health, { fontSize: '32px', fill: '#fff' });
	healthText.scrollFactorY = 0;

	console.log("num tiles " + config.tiles.length);
	var lastY;
	for(let i = 0; i< config.tiles.length; i++){
		for(let j = 0; j<config.tiles[i].length; j++){
			cell = config.tiles[i][j];
			x = startX+cell.col*colWidth;
			y = startY+cell.row*rowHeight+(config.lineSpacing*rowHeight*cell.row);
			lastY = y;
			charToEffect(cell.character, x, y);
			text = this.add.text(x, y+10, cell.character, {
				font: "14px Viga",
				color: "white"
			});
		}
	}
	platforms.create(config.width/2, lastY, 'ground');

	this.physics.world.setBounds(0, 0, config.width, lastY);
	
	player = this.physics.add.sprite(100, 200, 'dude');

	player.setBounce(0.2);
	
	player.setCollideWorldBounds(true);
	this.cameras.main.setSize(config.width, config.height);
	this.cameras.main.setBounds(0, 0, config.width, lastY);
	this.cameras.main.startFollow(player);

	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'dude', frame: 4 } ],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1
	});

	player.body.setGravityY(300);
	this.physics.add.collider(player, tiles);
	this.physics.add.collider(player, platforms, damagePlayer);
	this.physics.add.collider(player, damage, damagePlayer);
	this.physics.add.collider(player, exitPoints, exitLevel);
	this.physics.add.collider(player, up, upTeleport);
	this.physics.add.collider(player, down, downTeleport);
	this.physics.add.collider(player, left, leftMove);
	this.physics.add.collider(player, right, rightMove);
	this.physics.add.collider(player, question, questionTile);
	this.physics.add.collider(player, heal, healPlayer);
	this.physics.add.collider(player, points, addPoint);
	this.physics.add.collider(player, pause, pauseInteraction);
	cursors = this.input.keyboard.createCursorKeys();
}

function checkTilesExist(){
	console.log("checking if tiles exist yet");
	if(config.tiles.length >0){
		console.log("num tile rows"+config.tiles.length);
		return true;
	}else{
		console.log("nope, tiles don't exist");
		setTimeout(checkTilesExist, 250);
	}
}

function update ()
{
	if (cursors.left.isDown)
	{
		player.setVelocityX(-160);

		player.anims.play('left', true);
	}
	else if (cursors.right.isDown)
	{
		player.setVelocityX(160);

		player.anims.play('right', true);
	}
	else
	{
		player.setVelocityX(0);

		player.anims.play('turn');
	}

	if (cursors.up.isDown && player.body.touching.down)
	{
		player.setVelocityY(-530);
	}
}

function exitLevel(){
	console.log("good job");
	var id = window.location.href.substring(window.location.href.lastIndexOf("/"));
	window.location.href = "/levelSelect/won"+id;
}

function damagePlayer(player, tile){
	console.log("ow");
	if(health>0){
		health--;
		healthText.setText('Health: ' + health);
	}else{
		var id = window.location.href.substring(window.location.href.lastIndexOf("/"));
		window.location.href = "/levelSelect/lost"+id;
	}
	tile.disableBody(true, true);
}

function addPoint(player, tile){
	console.log("add point");
	score+=10;
	scoreText.setText('Score: ' + score);
	tile.disableBody(true, true);
}

function upTeleport(player, tile){
	console.log("up");
	var rand = down.getFirstAlive();
	if(rand!=null){
		player.setPosition(rand.x, rand.y+20);
		tile.disableBody(true, true);
	}
}

function downTeleport(player, tile){
	console.log("down");
	var rand = up.getFirstAlive();
	if(rand!=null){
		player.setPosition(rand.x, rand.y+20);
		tile.disableBody(true, true);
	}
}

function leftMove(player, tile){
	console.log("left");
	var rand = right.getFirstAlive();
	if(rand!=null){
		player.setPosition(rand.x, rand.y+20);
		tile.disableBody(true, true);
	}
}

function rightMove(player, tile){
	console.log("right");
	var rand = left.getFirstAlive();
	if(rand!=null){
		player.setPosition(rand.x, rand.y+20);
		tile.disableBody(true, true);
	}
}

function healPlayer(player, tile){
	console.log("heal");
	if(health<3){
		health++;
		healthText.setText('Health: ' + health);
	}
	tile.disableBody(true, true);
}

function pauseInteraction(){
	console.log("pause");
}

function questionTile(){
	console.log("question");
}

function charToEffect(char, x, y){
	var tile = "undefined";
	switch(char){
		case '.':
			tile = exitPoints.create(x, y, 'exit');
			//exitPoints.add(tile);
			break;
		case '!':
			// exit point with lots of points
			tile = exitPoints.create(x, y, 'exclaim');
			//exit.add(tile);
			points.add(tile);
			break;
		case 'f':// fire
			tile = damage.create(x, y, 'fire');
			//damage.add(tile);
			break;
		case 'd':
			tile = down.create(x, y, 'down');
			//down.add(tile);
			// set y velocity of tiles 1 row up to 200, goes down fast
			break;
		case 'u':
			tile = up.create(x, y, 'up');
			//up.add(tile);
			// set velocity of tiles 1 row down (what the player is standing on) to -200, goes up fast
			break;
		case 'h':
			tile = heal.create(x, y, 'heal');
			//heal.add(tile);
			// heals player 1 damage point
			break;
		case 't':// thorns
			tile = damage.create(x, y, 'thorns');
			//damage.add(tile);
			break;
		case 'v':
			// display how far away player is from exit point for a short amount of time
			break;
		case 'p':
			tile = pause.create(x, y, 'pause');
			//pause.add(tile);
			// pause surroundings.  nothing is interactable for 5 seconds
			break;
		case 'o':
			tile = points.create(x, y, 'coin');
			//points.add(tile);
			//collectible, means points
			break;
		case '?':
			tile = question.create(x, y, 'question');
			//question.add(tile);
			//points and random effect other than level exit
			break;
		case 'l':
			tile = left.create(x, y, 'left');
			//left.add(tile);
			// push the player left
			break;
		case 'r':
			tile = right.create(x, y, 'right');
			//right.add(tile);
			//push the player right
			break;
		case 's'://spikes
			tile = damage.create(x, y, 'spikes');
			//damage.add(tile);
			break;
		case ' ':
			console.log("gap!");
			break;
		default:
			console.log("unhandled character");
			tile = tiles.create(x, y, 'default');
			break;
	}
	return tile;
}