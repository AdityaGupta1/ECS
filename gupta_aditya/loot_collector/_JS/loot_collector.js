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
    'attack': 50,
    'vitality': 50
};

// player firing
var fireRate = 0;
var nextFire = 0;

// health
var nextRegen = 0;
var playerHealthBar;
var damageTextStyle = {font: "16px Verdana", fill: "#FF0000"};

// enemy bullets
var enemyBulletList = [];

// rounds
var round = 1;
var betweenRounds = true;

// math
const pi = Math.PI;
const sqrt2 = Math.sqrt(2);

// lessons (for between rounds)
// [[Lesson, Question, [Correct Answer, Answer, Answer, Answer]]]
var lessons = [['When creating variables or functions in JavaScript, you should always follow naming conventions. Names should be in camelcase, meaning that the first word should be lowercase and the first letters of the following words should be uppercase.\n\nFor example: thisIsAVariable, thisIsAnotherVariable, thisIsAFunction(), etc.', 'Question A', ['Correct Answer A', 'Answer A2', 'Answer A3', 'Answer A4']],
    ['Lesson B', 'Question B', ['Correct Answer B', 'Answer B2', 'Answer B3', 'Answer B4']],
    ['Lesson C', 'Question C', ['Correct Answer C', 'Answer C2', 'Answer C3', 'Answer C4']]];
var lessonTextStyle = {font: '24pt Verdana', fill: 'white', wordWrap: true, wordWrapWidth: 800};
var answerTextStyle = {font: '18pt Verdana', fill: 'white', wordWrap: true, wordWrapWidth: 800};

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
    game.load.image('player_bullet', '_img/player_bullet/player_bullet.png');

    // enemies
    game.load.image('small_demon', '_img/enemy/small_demon.png');
    game.load.image('fire_skull', '_img/enemy/fire_skull.png');
    game.load.image('crystal_minion', '_img/enemy/crystal_minion.png');
    game.load.image('crystal_golem', '_img/enemy/crystal_golem.png');
    game.load.image('blue_skull', '_img/enemy/blue_skull.png');
    game.load.image('reaper', '_img/enemy/reaper.png');

    // enemy bullets
    game.load.image('small_demon_bullet', '_img/enemy_bullet/small_demon_bullet.png');
    game.load.image('fire_skull_bullet', '_img/enemy_bullet/fire_skull_bullet.png');
    game.load.image('crystal_minion_bullet', '_img/enemy_bullet/crystal_minion_bullet.png');
    game.load.image('crystal_golem_bullet', '_img/enemy_bullet/crystal_golem_bullet.png');
    game.load.image('blue_skull_bullet', '_img/enemy_bullet/blue_skull_bullet.png');
    game.load.image('reaper_bullet', '_img/enemy_bullet/reaper_bullet.png');
}

/**
 * create sprites, bind keys, general pre-game stuff
 */
function create() {
    // background color
    game.stage.backgroundColor = '#C6C6C6';

    // all enemies will be part of this group
    enemies = game.add.group();

    // add player
    player = game.add.sprite(500, 300, 'wizard');
    player.bringToTop();
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // add player bullet group
    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    game.physics.enable(playerBullets, Phaser.Physics.ARCADE);

    // 500 bullet pool
    playerBullets.createMultiple(500, 'player_bullet');
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);

    // bind keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    player.body.collideWorldBounds = true;

    // health bar config (color, position, etc.)
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

    // create health bar
    playerHealthBar = new HealthBar(game, playerHealthBarConfig)

    // first lesson
    startLesson();

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
    setTimeout(function () {
        damageText.kill();
    }, 500);
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
    fireRate = (1 / getStat('dexterity')) * 20000;

    // player movement, shooting, health regeneration
    eightWayMovement();
    playerShoot();
    regenLife();

    // check if all enemies are dead; if so, advance to next round
    if (allEnemiesDead() && !betweenRounds) {
        round++;
        startLesson();
    }
}

function startRound() {
    // createEnemies(number, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense, shots, arc);
    switch (round) {
        case 1:
            createEnemies(10, 'small_demon', 200, 'random', 300, createEnemyBulletGroup('small_demon_bullet'), 250, 25, 1000, 5, 1, 0);
            createEnemies(2, 'fire_skull', 500, 'random', 100, createEnemyBulletGroup('fire_skull_bullet'), 100, 20, 500, 10, 3, pi / 6);
            break;
        case 2:
            createEnemies(7, 'crystal_minion', 400, 'random', 150, createEnemyBulletGroup('crystal_minion_bullet'), 200, 50, 2000, 10, 2, pi / 4);
            createEnemies(1, 'crystal_golem', 1000, 'random', 75, createEnemyBulletGroup('crystal_golem_bullet'), 100, 70, 1000, 20, 9, pi / 8);
            break;
        case 3:
            createEnemies(7, 'blue_skull', 300, 'random', 400, createEnemyBulletGroup('blue_skull_bullet'), 400, 30, 500, 5, 1, 0);
            createEnemies(1, 'reaper', 700, 'random', 200, createEnemyBulletGroup('reaper_bullet'), 200, 50, 1000, 10, 12, pi / 6);
            break;
        // just in case the round variable is incorrectly set
        default:
            console.log("game is on an invalid round (round " + round + ")");
            break;
    }
}

function startLesson() {
    betweenRounds = true;
    // get all text needed for lesson
    var lessonTexts = lessons[round - 1];
    var damageText = game.add.text(50, 50, lessonTexts[0], lessonTextStyle);
    game.physics.enable(damageText, Phaser.Physics.ARCADE);
    // betweenRounds = false;
    // startRound();
}