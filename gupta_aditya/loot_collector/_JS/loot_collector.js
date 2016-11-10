// initialize game
var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update
});

// sprites
var sprites = [];
var player;
var t1_bullet;
var playerBullets;
var enemyBullets;
var enemies;

// wasd keys
var wKey;
var sKey;
var aKey;
var dKey;

// player stats
var playerStats = {
    "life": 500,
    "attack": 50,
    "defense": 10,
    "speed": 40,
    "dexterity": 40
};

// player weapon stats
var weaponStats = {
    "damage": 50,
    "speed": 300,
    "lifetime": 750
};

// player firing
var fireRate = 0;
var nextFire = 0;

// math
const pi = Math.PI;
const sqrt2 = Math.sqrt(2);

function getStat(stat) {
    return playerStats[stat];
}

function getWeaponStat(stat) {
    return weaponStats[stat];
}

function preload() {
    // player
    game.load.image('wizard', '_img/player/wizard.png');

    // player bullets
    game.load.image('t1_bullet', '_img/player_bullet/t1_bullet.png');

    // enemies
    game.load.image('small_demon', '_img/enemy/small_demon.png');

    // enemy bullets
    game.load.image('small_demon_bullet', '_img/enemy_bullet/small_demon_bullet.png');
}

function create() {
    game.add.plugin(Phaser.Plugin.Debug);

    game.stage.backgroundColor = '#c6c6c6';

    enemies = game.add.group();

    player = game.add.sprite(500, 300, 'wizard');
    player.bringToTop();
    sprites.push(player);

    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    playerBullets.physicsBodyType = Phaser.Physics.ARCADE;

    playerBullets.createMultiple(100, 't1_bullet');
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);

    for (var i = 0; i < sprites.length; i++) {
        game.physics.enable(sprites[i], Phaser.Physics.ARCADE);
    }

    // bind keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    fireRate = getStat("dexterity") * 10;

    enemies.add(new Enemy(500, 300, 'small_demon', 500, 'random', 300, createEnemyBulletGroup("small_demon_bullet"), 5, 50, 1000));

    player.body.collideWorldBounds = true;
}

function update() {
    eightWayMovement();
    playerShoot();
}