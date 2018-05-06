const rowHeight = 30;
const colWidth = 30;
const LEVEL_WIDTH = 10;

var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
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
    lineSpacing: 2
};

var game = new Phaser.Game(config);
var platforms;
var player;
var exitPoints;

function preload ()
{
    this.load.image('sky', '/images/sky.png');
    this.load.image('ground', '/images/platform.png');
    this.load.image('star', '/images/star.png');
    this.load.image('bomb', '/images/bomb.png');
    this.load.spritesheet('dude', 
        '/images/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    if(checkTilesExist()){
        console.log("boop" + config.tiles.length);
        for(let i = 0; i< config.tiles.length; i++){
            console.log("row "+ i);
            for(let j = 0; j<config.tiles[i].length; j++){
                console.log("col "+j);
                this.load.image('tile', '/images/bomb.png');
            }
        }
    }
    
}

function createLevel(_input, w, h){
    config.tiles = _input;
    config.width = w*colWidth;
    config.height = h*rowHeight;
}

function create ()
{
    this.add.image(400, 300, 'sky').setOrigin(0, 0);
    this.add.image(400, 300, 'star');

    platforms = this.physics.add.staticGroup();
    exitPoints = this.physics.add.group();
    console.log("boop" + config.tiles.length);
    for(let i = 0; i< config.tiles.length; i++){
        console.log("row "+ i);
        for(let j = 0; j<config.tiles[i].length; j++){
            x = config.tiles[i][j].col*colWidth;
            y = config.tiles[i][j].row*rowHeight+(config.lineSpacing*rowHeight);
            console.log("x "+ x+ ", y: "+ y+ " spacing "+ config.lineSpacing*rowHeight);
            platforms.create(x, y, 'tile');
            //charToEffect(config.tiles[i][j].character);
        }
    }
    
    platforms.create(10, 10, 'bomb');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

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

    this.physics.add.collider(player, platforms);
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
        player.setVelocityY(-330);
    }
}

function stringToTiles(_input){
    var tiles = new Array();

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

    return tiles;
}

function playerOverlapWith(group, onOverlapFunction){
    this.physics.add.overlap(player, group, onOverlapFunction, null, this);
}

function charToEffect(char){
    switch(char){
        case '.':
            playerOverlapWith(exitPoints, exitLevel);
            break;
        case '!':
            // exit point with lots of points
            break;
        case 'f':// fire
            playerOverlapWith(damage, damagePlayer);
            break;
        case 'd':
            // set y velocity of tiles 1 row up to 200, goes down fast
            break;
        case 'u':
            // set velocity of tiles 1 row down (what the player is standing on) to -200, goes up fast
            break;
        case 'h':
            // heals player 1 damage point
            break;
        case 't':// thorns
            playerOverlapWith(damage, damagePlayer);
            break;
        case 'v':
            // display how far away player is from exit point for a short amount of time
            break;
        case 'p':
            // pause surroundings.  nothing is interactable for 5 seconds
            break;
        case 'o':
            //collectible, means points
            break;
        case '?':
            //points and random effect other than level exit
            break;
        case 'l':
            // push the player left
            break;
        case 'r':
            //push the player right
            break;
        case 's'://spikes
            playerOverlapWith(damage, damagePlayer);
            break;
        case ' ':
            console.log("gap!");
            break;
        default:
            console.log("unhandled character");
            break;
    }
}