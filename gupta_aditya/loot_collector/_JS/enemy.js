/**
 * creates a pool of enemy bullets
 */
function createEnemyBulletGroup(sprite) {
    var enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

    // 500 bullet pool
    enemyBullets.createMultiple(500, sprite);
    enemyBullets.setAll('checkWorldBounds', true);
    enemyBullets.setAll('outOfBoundsKill', true);

    // add it to enemy bullet list for bullet-player collision handling
    enemyBulletList.push(enemyBullets);

    return enemyBullets;
}

/**
 * enemy constructor
 */
function Enemy(x, y, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense, shots, arc) {
    Phaser.Sprite.call(this, game, x, y, sprite);

    // set general variables
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.movementType = movementType;
    this.movementSpeed = movementSpeed;
    this.bullets = bullet;
    this.bulletSpeed = bulletSpeed;
    this.bulletDamage = bulletDamage;
    this.defense = defense;

    // shooting variables
    this.fireDelay = fireDelay;
    this.nextFire = game.time.now + this.fireDelay + (game.rnd.integerInRange(0, this.fireDelay / 2.5) - (this.fireDelay / 5));
    this.shots = shots;
    this.arc = arc;

    //movement variables
    this.movementDelay = 0;
    this.nextMove = 0;

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.body.collideWorldBounds = true;
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * enemy update
 */
Enemy.prototype.update = function () {
    // fire bullets
    if (game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.alive && player.alive) {
        this.nextFire = game.time.now + this.fireDelay + (game.rnd.integerInRange(0, this.fireDelay / 2.5) - (this.fireDelay / 5));

        // create point to fire at
        var point = new Phaser.Point(player.x + (player.width / 2), player.y + (player.height / 2));
        // rotate it if enemy fires multiple shots
        if (this.shots > 1) {
            point.rotate(this.x, this.y, -(((this.shots - 1) * this.arc) / 2), false);
        }

        for (var i = 0; i < this.shots; i++) {
            // get first dead bullet from pool
            var bullet = this.bullets.getFirstDead();
            // revive bullet
            bullet.reset(this.x + (this.width / 2), this.y + (this.height / 2));
            // fixes rotation
            bullet.anchor.set(0.5);
            bullet.damage = this.bulletDamage;

            // radians, not degrees
            bullet.rotation = game.physics.arcade.moveToXY(bullet, point.x, point.y, this.bulletSpeed) + (pi / 4);
            game.world.sendToBack(bullet);

            // rotate to next shotgun point
            if (this.shots > 1) {
                point.rotate(this.x, this.y, this.arc, false);
            }
        }
    }

    switch (this.movementType) {
        // randomly change velocity
        case 'random':
            if (game.time.now > this.nextMove) {
                this.nextMove = game.time.now + this.movementDelay;
                // makes it more random
                this.movementDelay = game.rnd.integerInRange(500, 1000);

                // random angle - integerInRange() is inclusive of both parameters
                var angle = game.rnd.integerInRange(1, 360);
                // normalize movement speed
                this.body.velocity.x = Math.cos(angle) * this.movementSpeed;
                this.body.velocity.y = Math.sin(angle) * this.movementSpeed;
            }
            break;
        // stay in place
        case 'stationary':
            // do nothing
            break;
        // just in case I put an invalid movement type
        default:
            console.log(this.sprite + ' has an invalid movement type!');
            break;
    }
};

/**
 * damages an enemy
 */
function damageEnemy(enemy, damage) {
    var defense = enemy.defense;
    // similar to player, damage dealt has to be at least 10% of original damage
    var finalDamage = Math.round((damage - defense) < (damage * 0.1) ? ((damage) * 0.1) : ((damage) - defense));
    // decrement health by finalDamage
    enemy.health -= finalDamage;
    // check if enemy is dead
    if (enemy.health <= 0) {
        enemy.kill();
    }

    createDamageText(enemy.x, enemy.y - 5, finalDamage);
}

/**
 * called when a player bullet hits an enemy
 */
function enemyDamageHandler(enemy, playerBullet) {
    playerBullet.kill();
    damageEnemy(enemy, getStat('attack'));
}

/**
 * creates multiple enemies
 */
function createEnemies(number, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense, shots, arc) {
    for (var i = 0; i < number; i++) {
        // random x and y positions
        var randomX = game.rnd.integerInRange(100, canvasWidth - 100);
        var randomY = game.rnd.integerInRange(100, canvasHeight - 100);
        var enemy = new Enemy(randomX, randomY, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense, shots, arc);
        enemies.add(enemy);
    }
}

function allEnemiesDead() {
    return enemies.getFirstAlive() == null;
}