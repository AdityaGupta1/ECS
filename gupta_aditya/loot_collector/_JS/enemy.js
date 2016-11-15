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

function Enemy(x, y, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletLifetime, bulletDamage, fireDelay, defense) {
    Phaser.Sprite.call(this, game, x, y, sprite);

    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.movementType = movementType;
    this.movementSpeed = movementSpeed;
    this.bullets = bullet;
    this.bulletSpeed = bulletSpeed;
    this.bulletLifetime = bulletLifetime;
    this.bulletDamage = bulletDamage;
    this.defense = defense;

    // shooting variables
    this.fireDelay = fireDelay;
    this.nextFire = game.time.now + this.fireDelay + (game.rnd.integerInRange(0, this.fireDelay / 2.5) - (this.fireDelay / 5));

    //movement variables
    this.movementDelay = 0;
    this.nextMove = 0;

    game.physics.arcade.enable(this);

    this.body.collideWorldBounds = true;
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
    // fire bullets
    if (game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.alive && player.alive) {
        this.nextFire = game.time.now + this.fireDelay + (game.rnd.integerInRange(0, this.fireDelay / 2.5) - (this.fireDelay / 5));
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
        }, this.bulletLifetime);
    }

    switch (this.movementType) {
        case 'random':
            if (game.time.now > this.nextMove) {
                this.nextMove = game.time.now + this.movementDelay;
                this.movementDelay = game.rnd.integerInRange(500, 1000);

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

function damageEnemy (enemy, damage) {
    var defense = this.defense;
    // similar to player, damage dealt has to be at least 10% of original damage
    enemy.health -= (damage - defense) < (damage * 0.1) ? ((damage) * 0.1) : ((damage) - defense);
    if (enemy.health <= 0) {
        enemy.kill();
    }
}

function enemyDamageHandler(enemy, playerBullet) {
    playerBullet.kill();
    damageEnemy(enemy, getStat('attack'));
}