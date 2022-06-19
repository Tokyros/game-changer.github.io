const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const assets = JSON.parse(params.data);

const audioCollect = new Audio('./sounds/collect.mp3');
const audioFail = new Audio('./sounds/fail.wav');

const gameContainer = document.querySelector('.gameContainer');
const scoreDiv = document.querySelector('.score text');
let gameState = 'start';
let distance = 0;
let speed = 0.4;
let isKeyDown = false;
let nextCollectable = 0;
let score = 0;
const maxSpeed = 4;

const player = {
    y: 50,
    div: document.createElement('div'),
    velocity: 5,
    direction: 1,
}

let collectables = [];

window.addEventListener('message', (e) => {
    console.log(e.data);
    if (e.data === 'start') {
        startGame();
    }
})

function startGame() {

    collectables = [];
    player.y = 50;
    player.velocity = 5;
    player.direction = 1;
    distance = 0;
    speed = 0.4;
    isKeyDown = false;
    nextCollectable = 0;
    score = 0;

    document.querySelectorAll('.collectable').forEach(collectable => {
        gameContainer.removeChild(collectable);
    });

    gameState = 'running';
    renderGame();
}

function setPlayerUp() {
    isKeyDown = true;
    player.velocity = 3;
    player.direction = -1;
    player.div.style.setProperty('--rz', '-3deg');
}

function setPlayerDown() {
    isKeyDown = false;
    player.velocity = 1.5;
    player.direction = 1;
    player.div.style.setProperty('--rz', '10deg');
}

gameContainer.addEventListener('mousedown', setPlayerUp);
gameContainer.addEventListener('mouseup', setPlayerDown);
gameContainer.addEventListener('mouseleave', setPlayerDown);
gameContainer.addEventListener('touchstart', setPlayerUp);
gameContainer.addEventListener('touchend', setPlayerDown);
gameContainer.addEventListener('contextmenu', function(e){ e.preventDefault(); });

// window.onkeydown = function(e) {
//     if (e.keyCode === 32 && !isKeyDown) {
//         if (gameState === 'running') {
//             setPlayerUp();
//         } else if ((gameState === 'start') || (gameState === 'ended')) {
//             startGame();
//         }
//     }
// }
// window.onkeyup = function(e) { if (e.keyCode === 32 && isKeyDown) { setPlayerDown(); }}

initGame();
function initGame() {
    gameContainer.style.backgroundImage = `url(${assets.background})`;
    
    player.div.classList = 'player';
    player.div.style.backgroundImage = `url(${assets.player})`;

    gameContainer.appendChild(player.div);
}

function renderGame() {

    if (gameState !== 'running') {
        return false;    
    }
 
    player.y = Math.min(90, Math.max(10, player.y + (player.velocity * player.direction * 0.3)));

    if ((player.y <= 10) || (player.y >= 90)) {
        endGame();
    }
    player.velocity = Math.max(1, player.velocity * 0.95 );

    player.div.style.setProperty('--playerY', `${player.y}%`);

    distance += speed;
    gameContainer.style.setProperty('--backgroundX', `${distance / -100 * window.innerWidth}px`);
    
    if (nextCollectable < distance) {
        createCollectable();
        nextCollectable += 40 + Math.random() * 20;
    }
    
    collectables.forEach((collectable, ix) => {
        collectable.x -= speed;

        if ((collectable.x > 10) && (collectable.x < 20) && (player.y + 10 > collectable.y - 5) && (player.y  - 10 < collectable.y + 5)) {
            if (collectable.type === 'trophy') {
                audioCollect.play();
                killCollectable(collectable, ix);
                score += 100;
            } else if (collectable.type === 'obstacle') {
                audioCollect.play();
                killCollectable(collectable, ix);
                endGame();
            }
        }

        if (collectable.x < -10) {
            gameContainer.removeChild(collectable.div);
            collectables.splice(ix, 1);
        } else {
            collectable.div.style.setProperty('--collectableX', `${collectable.x}%`);
        }
    });

    score += speed * 0.3 ;
    scoreDiv.innerHTML = `Score: ${Math.round(score)}`;

    speed = Math.min(maxSpeed, speed * 1.0001);
    requestAnimationFrame(renderGame);
}

function createCollectable() {

    const type = (Math.random() > 0.4) ? 'trophy' : 'obstacle';
    const collectable = {
        type: type,
        img: `url(${assets[type]})`,
        y: Math.random() * 90 + 5,
        x: 100,
        div: document.createElement('div'),
    } 
    collectable.div.classList = `collectable collectable-${collectable.type}`;
    collectable.div.style.backgroundImage = collectable.img;
    collectable.div.style.setProperty('--collectableY', `${collectable.y}%`);
    collectables.push(collectable);
    
    gameContainer.appendChild(collectable.div);
}

function killCollectable(collectable, ix) {
    for (let i = 0; i < 6; i++) {
        const miniCollectable = document.createElement('div');
        miniCollectable.classList = 'miniCollectable';
        miniCollectable.style.left = `${collectable.x}%`;
        miniCollectable.style.top = `${collectable.y}%`;
        miniCollectable.style.backgroundImage = collectable.img;
        miniCollectable.style.setProperty('--tx', `${Math.random() * 150}px`);
        miniCollectable.style.setProperty('--ty', `${Math.random() * 100 - 50}px`);
        gameContainer.appendChild(miniCollectable);

        setTimeout(() => {
            gameContainer.removeChild(miniCollectable);            
        }, 250);
    }

    gameContainer.removeChild(collectable.div);
    collectables.splice(ix, 1);
}

function endGame() {
    gameState = 'ended';
    window.parent.postMessage({
        type: 'lose',
        score: score
    }, '*')
}