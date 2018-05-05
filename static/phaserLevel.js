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
    tiles: []
};

var game = new Phaser.Game(config);
var platforms;
var player;

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
                this.load.image('tile at r '+i+', c '+j, '/images/bomb.png');
            }
        }
    }
    
}

function createLevel(_input, w, h){
    config.width = w;
    config.height = h;

    config.tiles = stringToTiles(_input);
}

function create ()
{
    this.add.image(400, 300, 'sky').setOrigin(0, 0);
    this.add.image(400, 300, 'star');

    platforms = this.physics.add.staticGroup();
    console.log("boop" + config.tiles.length);
    for(let i = 0; i< config.tiles.length; i++){
        console.log("row "+ i);
        for(let j = 0; j<config.tiles[i].length; j++){
            console.log("x "+ config.tiles[i][j].col*colWidth+ ", y: "+ config.tiles[i][j].row*rowHeight);
            platforms.create(config.tiles[i][j].col*colWidth, config.tiles[i][j].row*rowHeight, 'tile at r '+i+', c '+j);
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