
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const backgroundImage = urlParams.get('backgroundImage');
const gameImage = urlParams.get('image');
const titleColor = urlParams.get('color');
const borderColor = urlParams.get('borderColor') || 'transparent';

const clickAudio = new Audio('63532__florian-reinke__click2.wav');
const disabledClickAudio = new Audio('disabled.mp3');

let clicksCounter = 0;
const maxClicks = 100;
let gameStarted = false;

passCssVar();
const resizeObserver = new ResizeObserver(passCssVar);

resizeObserver.observe(document.getElementById('container'));

function passCssVar() {
    const containerEl = document.getElementById('container');
    const containerWidth = containerEl.clientWidth;
    const containerHeight = containerEl.clientHeight;

    const tileWidth = containerWidth / 3 - 4;
    const tileHeight = containerHeight / 3  - 4;
    
    document.querySelectorAll('.tile').forEach(el => {
        el.style.setProperty('--var-img', `url(${gameImage})`);
        el.style.setProperty('--tile-width', `${tileWidth}px`)
        el.style.setProperty('--tile-height', `${tileHeight}px`)
        el.style.setProperty('--container-width', `${containerWidth}px`)
        el.style.setProperty('--container-height', `${containerHeight}px`)
        el.style.setProperty('--border-color', `${borderColor}`)
    });
}

function updateCounter(currentClicks) {
    clicksCounter=currentClicks;
}

window.addEventListener('message', (ev) => {
    if (ev.data === 'start') {
        restart();
    }
});

function swapTiles(cell1, cell2) {
    var temp = document.getElementById(cell1).className;
    document.getElementById(cell1).className = document.getElementById(cell2).className;
    document.getElementById(cell2).className = temp;
}

function shuffle() {
    updateCounter(0);
    gameStarted = true;
    //real shuffle

    // for (var row = 1; row <= 3; row++) { 
    //     for (var column = 1; column <= 3; column++) { 

    //         var row2 = Math.floor(Math.random() * 3 + 1); 
    //         var column2 = Math.floor(Math.random() * 3 + 1);

    //         swapTiles("cell" + row + column, "cell" + 2 + 2 ); 
    //     }
    // }

    // shuffle for marketing
    swapTiles("cell32", "cell33" )
    swapTiles("cell22", "cell32" )
    swapTiles("cell12", "cell22" )
    swapTiles("cell11", "cell12" )
    swapTiles("cell21", "cell11" )

    swapTiles("cell31", "cell21" )
    swapTiles("cell32", "cell31" )
    swapTiles("cell22", "cell32" )
    swapTiles("cell23", "cell22" )
    swapTiles("cell33", "cell23" )

}

function restart() {
    const containerWin =  document.querySelector('.container-win');
    if(!!containerWin) {
        containerWin.className = 'container';
    }
    passCssVar();
    shuffle();
}

function winGame() {
    document.getElementById('container').className = 'container-win';
    setTimeout(() => {
        window.parent.postMessage('win', '*');
    }, 2000);
}

function checkIsWin() {
    const tiles = document.querySelectorAll('.tile');
    const tilesArr = [...tiles];
        if(tilesArr.every((el, idx) => el.className.includes(idx +1))) {
            winGame();
   }
}


function clickTile(clickedRow, emptyRow) {
    clickAudio.play();
    updateCounter(clicksCounter+1)
    swapTiles(clickedRow, emptyRow);
    checkIsWin();
}


function onClickTile(row, column) {
    var cell = document.getElementById("cell" + row + column);
    var tile = cell.className;

    if (tile != "tile9" && !!gameStarted) {
        //Checking if white tile on the right
        if (column < 3) {
            if (document.getElementById("cell" + row + (column + 1)).className == "tile tile9") {
                clickTile("cell" + row + column, "cell" + row + (column + 1));
                return;
            }
        }
        //Checking if white tile on the left
        if (column > 1) {
            if (document.getElementById("cell" + row + (column - 1)).className == "tile tile9") {
                clickTile("cell" + row + column, "cell" + row + (column - 1));
                return;
            }
        }
        //Checking if white tile is above
        if (row > 1) {
            if (document.getElementById("cell" + (row - 1) + column).className == "tile tile9") {
                clickTile("cell" + row + column, "cell" + (row - 1) + column);
                return;
            }
        }
        //Checking if white tile is below
        if (row < 3) {
            if (document.getElementById("cell" + (row + 1) + column).className == "tile tile9") {
                clickTile("cell" + row + column, "cell" + (row + 1) + column);
                return;
            }
        }
        disabledClickAudio.cloneNode(true).play();
    }

}