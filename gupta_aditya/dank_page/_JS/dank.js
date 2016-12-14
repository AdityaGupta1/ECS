// list of style link ids
var ids = ['body', 'p', 'h1', 'img', 'ul', 'div'];
// number of style sheets
var styleSheets = 5;
// play some dank music
document.getElementById('danker-music').play();

/**
 * randomize the CSS documents used
 */
function randomCSS () {
    for (var index in ids) {
        var id = ids[index];
        // set css of style element with "id" to a random css from its folder
        document.getElementById(id).setAttribute('href', '_CSS/' + id + '/style' + Math.ceil(Math.random() * styleSheets) + '.css');
    }
}

// change CSS every 1/5 of a second
var changeCSS = setInterval(randomCSS, 40);

/**
 * used from console to stop changing CSS (for debug)
 */
function stop() {
    clearInterval(changeCSS);
}