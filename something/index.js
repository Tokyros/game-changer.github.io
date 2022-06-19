const PLAYER_CLASS = 'x'
const COMPUTER_CLASS = 'circle'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const computerEl = urlParams.get('computer');
const playerEl = urlParams.get('player');
const boardColor = urlParams.get('color') || 'black';
const borderSize = urlParams.get('borderSize') || '1';

const cellElements = document.querySelectorAll('[data-cell]')
const boardElement = document.getElementById('board')
const root = document.querySelector(':root');
const computerClickAudio = new Audio('219068__annabloom__click2.wav');
computerClickAudio.preload= 'auto';
const playerClickAudio = new Audio('536315__eeeeeeeeeeeeeeeeilas__screen-tap.mp3');
playerClickAudio.preload = 'auto';
const winAudio = new Audio('win.wav');
winAudio.preload = 'auto'



const resizeObserver = new ResizeObserver(updateCssVar);
resizeObserver.observe(boardElement);

updateCssVar()

function updateCssVar() {
    const containerWidth = boardElement.clientWidth;
    const containerHeight = boardElement.clientHeight;

    const cellWidth = containerWidth / 3 - 2;
    const cellHeight = containerHeight / 3  - 2;
    root.style.setProperty('--cell-width', `${cellWidth}px`)
    root.style.setProperty('--cell-height', `${cellHeight}px`)

}

root.style.setProperty('--player-element', `url(${playerEl})`)
root.style.setProperty('--computer-element', `url(${computerEl})`)
root.style.setProperty('--board-color', boardColor)
root.style.setProperty('--border-size', `${borderSize}px`)

const WINNING_COMBINATIONS = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],

	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
]


resizeObserver.observe(boardElement);
let isPlayerTurn = true

startGame()

window.addEventListener('message', (ev) => {
    if (ev.data === 'start') {
        startGame();
    }
});

function startGame() {
	isPlayerTurn = true
	cellElements.forEach(cell => {
		cell.classList.remove(PLAYER_CLASS)
		cell.classList.remove(COMPUTER_CLASS)
		cell.removeEventListener('click', handleCellClick)
		cell.addEventListener('click', handleCellClick, { once: true })
	})
}

function handleCellClick(e) {
	const cell = e.target
	const currentClass = isPlayerTurn ? PLAYER_CLASS : COMPUTER_CLASS
	placeMark(cell, currentClass)
    const winRow = checkWin(currentClass);
	if (!!winRow) {
        winAudio.play();
		endGame(false, winRow, currentClass)
    }else if(isDraw()) {
        winAudio.play();
        endGame(true)
	} else {
        if(isPlayerTurn) {
            playComputerTurn()
        }
	}
}

function placeMark(cell, currentClass) {
    playerClickAudio.cloneNode(true).play();
    setTimeout(() => {
        playerClickAudio.pause();
        playerClickAudio.currentTime = 0;
    }, 1000);
	cell.classList.add(currentClass)
}

function isAlmostWin(classToCheck) {
    const enemyClass = classToCheck === COMPUTER_CLASS ? PLAYER_CLASS : COMPUTER_CLASS;
    return WINNING_COMBINATIONS.find(combination => {
        const numOfPlayerSigns = combination.reduce((prev, index) => {
            if(cellElements[index].classList.contains(classToCheck)){
                return prev +1
            }
            if(cellElements[index].classList.contains(enemyClass)) {
                return prev -1
            }
            return prev;
        }, 0)
        return numOfPlayerSigns == 2
    })
}

function getEmptyCell(options) {
   return options.find((index) => cellElements[index].className === 'cell')
}

function clickOnCell(idx) {
    computerClickAudio.cloneNode(true).play();
    setTimeout(() => {
        computerClickAudio.pause();
        computerClickAudio.currentTime = 0;
    }, 1000);
    cellElements[idx].click();
}

function playComputerTurn() {
    isPlayerTurn = false;
    const playerAlmostWinningRow = isAlmostWin(PLAYER_CLASS);
    const computerAlmostWinningRow = isAlmostWin(COMPUTER_CLASS);
    if(!!computerAlmostWinningRow) {
        clickOnCell(getEmptyCell(computerAlmostWinningRow) || 0)
    }
    else if(!!playerAlmostWinningRow) {
        clickOnCell(getEmptyCell(playerAlmostWinningRow) || 0)
    } else {
        const optionsList = [0,1,2,3,4,5,6,7,8].sort( () => .5 - Math.random() );
        clickOnCell(getEmptyCell(optionsList))
    }
    isPlayerTurn = true;
}

function isDraw() {
	return [...cellElements].every(cell => {
		return cell.classList.contains(PLAYER_CLASS) || cell.classList.contains(COMPUTER_CLASS)
	})
}

function checkWin(currentClass) {
	return WINNING_COMBINATIONS.find(combination => {
		return combination.every(index => {
			return cellElements[index].classList.contains(currentClass)
		})
	})
}

function endGame(draw, winRow) {
    boardElement.className = 'board board-win';
    if(draw) {
        window.parent.postMessage('draw', '*');
    } else {
        winRow.map((idx) => {
            cellElements[idx].classList.add('win')
        })
        setTimeout(() => {
            isPlayerTurn ?  window.parent.postMessage('win', '*') : window.parent.postMessage('loss', '*');
        }, 2000);
    }
}