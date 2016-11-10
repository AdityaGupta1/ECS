var treasure = '<img src="_img/treasure.png" alt="treasure chest" class="main-image">';
var dragon = '<img src="_img/dragon.png" alt="dragon" class="main-image">';
var potion = '<img src="_img/potion.png" alt="potion" class="main-image">';
var sword = '<img src="_img/sword.png" alt="sword" class="main-image">';
// small potion icon for inventory
var potionBuff = '<img src="_img/potion.png" alt="small-potion" class="small-image">';
var score = 0;
var highScore = 0;
var treasureMessages = ["You got some dank loot!", "You found some treasure!", "You found a secret gold stash!"];
var deathMessages = ["The dragon ate you!", "The dragon sat on you and squished you!", "The dragon bored you to death with classical literature!"];
var potionMessages = ["You found an invisiblity potion!", "This invisiblity potion will help you hide from the dragon.", "Wow! A magical potion!"];
// number of potions in inventory
var potions = 0;

/*
picks random element from array
*/
function pickRandomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function playGame() {
    if (Math.random() > 0.9) {
        // saved by potion
        if (potions > 0) {
            document.getElementById("game-image").innerHTML = sword;
			potions--;
			document.getElementById("inventory").innerHTML = "Inventory: " + potions + potionBuff;
            document.getElementById("game-text").innerHTML = "You drank an invisibility potion to escape from the dragon.";
		// no potions in inventory, killed by dragon
        } else {
            document.getElementById("game-image").innerHTML = dragon;
			// random death message
            document.getElementById("game-text").innerHTML = pickRandomFromArray(deathMessages);
            score = 0;
        }
    } else if (Math.random() > 0.88) {
		// random potion message
        document.getElementById("game-image").innerHTML = potion;
        document.getElementById("game-text").innerHTML = pickRandomFromArray(potionMessages);
        potions++;
		// add potion to inventory
		document.getElementById("inventory").innerHTML = "Inventory: " + potions + potionBuff;
    } else {
        // random treasure message
        document.getElementById("game-image").innerHTML = treasure;
        document.getElementById("game-text").innerHTML = pickRandomFromArray(treasureMessages);
		// add random amount of treasure
        score += Math.ceil(Math.random() * 10);
		// check if score is higher than highscore, if so, update high score
        if (score > highScore) {
            highScore = score;
            document.getElementById("high-score").innerHTML = "High Score: " + highScore;
        }
    }
	
	// update inventory if no potions are left
	if (potions === 0) {
		document.getElementById("inventory").innerHTML = "Inventory: empty";
	}

	// update score
    document.getElementById("score").innerHTML = "Score: " + score;
}