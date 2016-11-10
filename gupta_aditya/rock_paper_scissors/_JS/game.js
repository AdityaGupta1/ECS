var wins = 0;
var losses = 0;
var ties = 0;

// possible computer choices
var choices = [
    "rock",
    "paper",
    "scissors"
];

// user choice : computer choice
var loss = {
    "rock": "paper",
    "paper": "scissors",
    "scissors": "rock"
};

var rockImg = '<img src="_img/rock.png" class="small-image"';
var paperImg = '<img src="_img/paper.png" class="small-image"';
var scissorsImg = '<img src="_img/scissors.png" class="small-image"';
var explodeImg = '_img/explode.png';

// maps choices to images
var imgs = {
    "rock": rockImg,
    "paper": paperImg,
    "scissors": scissorsImg
};

// variables that will be concatenated to the end of img strings
var userChoiceID = ' id="user-img">';
var computerChoiceID = ' id="computer-img">';

function shake(id) {
	document.getElementById(id).style.transform = "rotate(" + (Math.floor(Math.random() * 40) - 20) + "deg)";
}


function playGame() {
    // gets radio button value
    var userChoice = document.querySelector('input[name = "user-choice"]:checked').value;

    // computer chooses randomly
    var computerChoice = choices[Math.floor(Math.random() * 3)];

    var gameText;
    var outcome = "loss";

    // finds outcome
    if (userChoice === computerChoice) {
        ties++;
        gameText = "You and the computer chose the same thing.";
        outcome = "tie";
    } else if (loss[userChoice] === computerChoice) {
        losses++;
        gameText = "You lost... better luck next time!";
        outcome = "loss";
    } else {
        wins++;
        gameText = "You won! Nice job!";
        outcome = "win";
    }

    console.log(outcome);

    // displays outcome text
    document.getElementById("game-text").innerHTML = gameText;
    document.getElementById("choices").innerHTML = "Your choice: " + imgs[userChoice] + userChoiceID + "; Computer's choice: " + imgs[computerChoice] + computerChoiceID;
    document.getElementById("count").innerHTML = "Wins: " + wins + "; Losses: " + losses + "; Ties: " + ties;

    // disable button for animation
    document.getElementById("play-button").disabled = true;

    var shakeCount = 0;
    var maxShakeCount = 10;
    var shakeDelay = 100;
    var shakeInterval =  setInterval(function() {
        shake("user-img");
		shake("computer-img");
        shakeCount++;

        if (shakeCount === maxShakeCount) {
            clearInterval(shakeInterval);
        }
    }, shakeDelay);

    setTimeout(function(){
        if (outcome === "win") {
            document.getElementById("computer-img").src = explodeImg;
        } else if (outcome === "loss") {
            document.getElementById("user-img").src = explodeImg;
        } else {
            document.getElementById("user-img").src = explodeImg;
            document.getElementById("computer-img").src = explodeImg;
        }
        document.getElementById("play-button").disabled = false;
    }, maxShakeCount * shakeDelay);
}