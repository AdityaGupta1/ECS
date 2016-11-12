function createEnemyBulletGroup(sprite) {
    var enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

    enemyBullets.createMultiple(100, sprite);
    enemyBullets.setAll('checkWorldBounds', true);
    enemyBullets.setAll('outOfBoundsKill', true);

    enemyBulletList.push(enemyBullets);

    return enemyBullets;
}

function Enemy(x, y, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense) {
    Phaser.Sprite.call(this, game, x, y, sprite);

    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.movementType = movementType;
    this.movementSpeed = movementSpeed;
    this.bullets = bullet;
    this.bulletSpeed = bulletSpeed;
    this.bulletDamage = bulletDamage;
    this.fireDelay = fireDelay;
    this.nextFire = fireDelay;
    this.defense = defense;

    game.physics.arcade.enable(this);

    this.body.collideWorldBounds = true;
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

var nextMove = 0;
var movementDelay = 0;

Enemy.prototype.update = function () {
    // fire bullets
    if (game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.alive) {
        this.nextFire = game.time.now + this.fireDelay;
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.x + (this.width / 2), this.y + (this.height / 2));
        // fixes rotation
        bullet.anchor.set(0.5);
        bullet.damage = this.bulletDamage;
        // radians, not degrees
        bullet.rotation = game.physics.arcade.moveToXY(bullet, player.x + (player.width / 2), player.y + (player.height / 2), this.bulletSpeed * 100) + (pi / 4);
        game.world.sendToBack(bullet);
        // kill bullet after a certain amount of time
        setTimeout(function () {
            bullet.kill();
        }, 1500);
    }

    switch (this.movementType) {
        case 'random':
            if (game.time.now > nextMove) {
                nextMove = game.time.now + movementDelay;
                movementDelay = game.rnd.integerInRange(500, 1000);

                var angle = game.rnd.integerInRange(1, 360);
                this.body.velocity.x = Math.cos(angle) * this.movementSpeed;
                this.body.velocity.y = Math.sin(angle) * this.movementSpeed;
            }
            break;
        default:
            console.log(this.sprite + ' does not have a movement type set!');
            break;
    }
};

function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    if (enemy.health <= 0) {
        enemy.kill();
    }
}

function enemyDamageHandler(enemy, playerBullet) {
    playerBullet.kill();
    damageEnemy(enemy, getStat('attack'));
}