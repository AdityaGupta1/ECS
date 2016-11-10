/*
 Player bullet creation
 */
function playerShoot() {
    if (game.input.activePointer.isDown) {
        if (game.time.now > nextFire && playerBullets.countDead() > 0) {
            nextFire = game.time.now + fireRate;
            var bullet = playerBullets.getFirstDead();
            bullet.reset(player.x + (player.width / 2), player.y + (player.height / 2
                ));
            setTimeout(function () {
                bullet.kill();
            }, getWeaponStat('lifetime'));
            game.physics.arcade.moveToPointer(bullet, getWeaponStat('speed'));
            bullet.anchor.set(0.5);
            bullet.rotation = game.physics.arcade.angleToPointer(bullet) + (pi / 4);
            game.world.sendToBack(bullet);
        }
    }
}

/*
 Eight-way movement with normalized diagonal speed
 */
function eightWayMovement() {
    var movement = 0;
    var speed = getStat("speed") * 10;
    var diagonalSpeed = speed / sqrt2;

    // create a unique movement number for each key combination
    if (wKey.isDown) {
        movement += 1;
    }

    if (sKey.isDown) {
        movement += 2;
    }

    if (aKey.isDown) {
        movement += 4;
    }

    if (dKey.isDown) {
        movement += 8;
    }

    // switch on each unique number
    switch (movement) {
        // up
        case 1:
        // left-right-up
        case 13:
            player.body.velocity.x = 0;
            player.body.velocity.y = -speed;
            break;
        // down
        case 2:
        // left-right-down
        case 14:
            player.body.velocity.x = 0;
            player.body.velocity.y = speed;
            break;
        // right
        case 4:
        // up-down-right
        case 7:
            player.body.velocity.x = -speed;
            player.body.velocity.y = 0;
            break;
        // left
        case 8:
        // up-down-left
        case 11:
            player.body.velocity.x = speed;
            player.body.velocity.y = 0;
            break;
        // up-down
        case 3:
        // left-right
        case 12:
        // all four
        case 15:
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            break;
        // up-left
        case 5:
            player.body.velocity.x = -diagonalSpeed;
            player.body.velocity.y = -diagonalSpeed;
            break;
        // up-right
        case 9:
            player.body.velocity.x = diagonalSpeed;
            player.body.velocity.y = -diagonalSpeed;
            break;
        // down-left
        case 6:
            player.body.velocity.x = -diagonalSpeed;
            player.body.velocity.y = diagonalSpeed;
            break;
        // down-right
        case 10:
            player.body.velocity.x = diagonalSpeed;
            player.body.velocity.y = diagonalSpeed;
            break;
        default:
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
    }
}