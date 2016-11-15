// initialize game
var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'loot-collector', {
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
    'maxLife': 500,
    'life': 500,
    'attack': 50,
    'defense': 10,
    'speed': 40,
    'dexterity': 50
};

// player firing
var fireRate = 0;
var nextFire = 0;

// health
var nextRegen = 0;
var regenRate = 100;
var playerHealthBar;

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
    playerBullets.physicsBodyType = Phaser.Physics.ARCADE;

    // 100 bullet pool
    playerBullets.createMultiple(100, 't1_bullet');
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);

    // bind keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    fireRate = getStat('dexterity') * 10;

    for (var i = 0; i < 1; i++) {
        var enemy = new Enemy(100, 100, 'small_demon', 500, 'random', 300, createEnemyBulletGroup('small_demon_bullet'), 2, 1500, 25, 1000, 10);
        enemies.add(enemy);
    }

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

// called when an enemy bullet hits the player
function playerDamageHandler(player, enemyBullet) {
    enemyBullet.kill();
    var damage = enemyBullet.damage;
    var defense = getStat('defense');
    // defense subtracts from damage, but the enemy bullet has to deal at least 10% of its original damage
    var finalDamage = (damage - defense) < (damage * 0.1) ? ((damage) * 0.1) : ((damage) - defense);

    changeStat('life', -finalDamage);

    if (getStat('life') < 0) {
        player.kill();
    }

    var damageTextStyle = {font: "16px Verdana", fill: "#FF0000"};
    var damageText = game.add.text(player.x, player.y + 5, '-' + finalDamage, damageTextStyle);
}

function update() {
    // check if player is touching enemy bullets
    for (var i = 0; i < enemyBulletList.length; i++) {
        game.physics.arcade.overlap(player, enemyBulletList[i], playerDamageHandler, null, this);
    }

    game.physics.arcade.overlap(enemies, playerBullets, enemyDamageHandler, null, this);

    playerHealthBar.setPercent((getStat('life') / getStat('maxLife')) * 100);

    eightWayMovement();
    playerShoot();
    regenLife();
}