// canvas dimensions
var canvasWidth = 1000;
var canvasHeight = 600;

// initialize game
var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, 'loot-collector', {
    preload: preload,
    create: create,
    update: update
});

// sprites
var player;
var t1_bullet;
var playerBullets;
var enemies;

// wasd keys
var wKey;
var sKey;
var aKey;
var dKey;

// player stats
var playerStats = {
    'maxLife': 1000,
    'life': 1000,
    'speed': 40,
    'defense': 10,
    'dexterity': 50,
    'attack': 50
};

// player firing
var fireRate = 0;
var nextFire = 0;

// health
var nextRegen = 0;
var regenRate = 100;
var playerHealthBar;
var damageTextStyle = {font: "16px Verdana", fill: "#FF0000"};

// enemy bullets
var enemyBulletList = [];

// math
const pi = Math.PI;
const sqrt2 = Math.sqrt(2);

function getStat(stat) {
    return playerStats[stat];
}

function setStat(stat, value) {
    playerStats[stat] = value;
}

function changeStat(stat, change) {
    setStat(stat, getStat(stat) + change);
}

/**
 * load images
 */
function preload() {
    // player
    game.load.image('wizard', '_img/player/wizard.png');

    // player bullets
    game.load.image('t1_bullet', '_img/player_bullet/t1_bullet.png');

    // enemies
    game.load.image('small_demon', '_img/enemy/small_demon.png');
    game.load.image('fire_skull', '_img/enemy/fire_skull.png');

    // enemy bullets
    game.load.image('small_demon_bullet', '_img/enemy_bullet/small_demon_bullet.png');
    game.load.image('fire_skull_bullet', '_img/enemy_bullet/fire_skull_bullet.png');
}

/**
 * create sprites, bind keys, general pre-game stuff
 */
function create() {
    // debug plugin (for development purposes)
    game.add.plugin(Phaser.Plugin.Debug);

    game.stage.backgroundColor = '#c6c6c6';

    // all enemies will be part of this group
    enemies = game.add.group();

    player = game.add.sprite(500, 300, 'wizard');
    player.bringToTop();
    game.physics.enable(player, Phaser.Physics.ARCADE);

    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    game.physics.enable(playerBullets, Phaser.Physics.ARCADE);

    // 500 bullet pool
    playerBullets.createMultiple(500, 't1_bullet');
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);

    // bind keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    createEnemies(10, 'small_demon', 200, 'random', 300, createEnemyBulletGroup('small_demon_bullet'), 250, 25, 1000, 10);
    createEnemies(2, 'fire_skull', 500, 'random', 100, createEnemyBulletGroup('fire_skull_bullet'), 100, 20, 500, 5);

    player.body.collideWorldBounds = true;

    var playerHealthBarConfig = {
        width: 200,
        height: 20,
        x: 110,
        y: 20,
        bg: {
            color: '#800000'
        },
        bar: {
            color: '#FF0000'
        },
        animationDuration: 50,
        flipped: false
    };

    playerHealthBar = new HealthBar(game, playerHealthBarConfig)
}

/**
 * creates a damage text which moves upwards then disappears
 */
function createDamageText(x, y, damage) {
    // add text
    var damageText = game.add.text(x, y - 5, '-' + damage, damageTextStyle);
    game.physics.enable(damageText, Phaser.Physics.ARCADE);
    // moves upwards
    damageText.body.velocity.y = -50;
    // dies after 0.5 seconds
    setTimeout(function (){
        damageText.kill();
    }, 500);
}

/**
 * called when an enemy bullet hits the player
 */
function playerDamageHandler(player, enemyBullet) {
    enemyBullet.kill();
    var damage = enemyBullet.damage;
    var defense = getStat('defense');
    // defense subtracts from damage, but the enemy bullet has to deal at least 10% of its original damage
    var finalDamage = (damage - defense) < (damage * 0.1) ? ((damage) * 0.1) : ((damage) - defense);

    // decrement life by finalDamage
    changeStat('life', -finalDamage);

    // check if player is dead
    if (getStat('life') <= 0) {
        player.kill();
    }

    // create damage text
    createDamageText(player.x, player.y - 5, finalDamage);
}

/**
 * general update
 */
function update() {
    // check if player is touching enemy bullets
    for (var i = 0; i < enemyBulletList.length; i++) {
        game.physics.arcade.overlap(player, enemyBulletList[i], playerDamageHandler, null, this);
    }

    // check if player bullets are touching enemies
    game.physics.arcade.overlap(enemies, playerBullets, enemyDamageHandler, null, this);

    // update health bar
    playerHealthBar.setPercent((getStat('life') / getStat('maxLife')) * 100);

    // update fire rate
    fireRate = (1/getStat('dexterity')) * 20000;

    // player movement, shooting, health regeneration
    eightWayMovement();
    playerShoot();
    regenLife();
}