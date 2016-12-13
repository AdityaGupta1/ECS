// possible locations for random page button
var possibleLinks = ["computer_history/", "hardware_form/", "hardware/", "dragon_treasure/", "rock_paper_scissors/", "loot_collector/", "dank_page/"];

/**
 * goes to a random page (computer history, dragon treasure, etc.)
 */
function randomPage() {
    // set window location to random link from possibleLinks
    window.location.href = possibleLinks[Math.floor(Math.random() * possibleLinks.length)];
}