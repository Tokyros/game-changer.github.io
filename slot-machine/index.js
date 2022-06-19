const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const handle = document.querySelector('.handle');
handle.disabled = false;               

// const preGameData = {
//     handleColor: 'aqua',
//     lightColor: 'yellow',
//     backColor: '#444',
//     icons: [
//         './icons/icon-01.png',
//         './icons/icon-02.png',
//         './icons/icon-03.png',
//         './icons/icon-04.png',
//         './icons/icon-05.png',
//         './icons/icon-06.png',
//         './icons/icon-07.png',
//     ]
// }
// console.log(JSON.stringify(preGameData));
// console.log(params.data);

// http://127.0.0.1:5500/slot01/?data={%22handleColor%22:%22aqua%22,%22lightColor%22:%22yellow%22,%22backColor%22:%22%23444%22,%22icons%22:[%22./icons/icon-01.png%22,%22./icons/icon-02.png%22,%22./icons/icon-03.png%22,%22./icons/icon-04.png%22,%22./icons/icon-05.png%22,%22./icons/icon-06.png%22,%22./icons/icon-07.png%22]}

const gameData = JSON.parse(params.data);
const gameContainer = document.querySelector('.gameContainer');
gameContainer.style.setProperty('--handleColor', gameData.handleColor);
gameContainer.style.setProperty('--lightColor', gameData.lightColor);
gameContainer.style.setProperty('--backColor', gameData.backColor);
gameContainer.style.setProperty('--scale', gameData.scale);

const audioCrank = new Audio('./sounds/lever.mp3');
const audioSpin = new Audio('./sounds/Loop-long-spin.mp3');
const audioSpinEnd = new Audio('./sounds/spin-end_2.mp3');
const audioWin = new Audio('./sounds/win.wav');
const audioFail = new Audio('./sounds/fail.wav');

const iconsCount = gameData?.icons?.length;

const forceWin = {
    winEveryXgames: 3,
    nextIcon: Math.floor(Math.random() * iconsCount),
    count: 0,
}

const slots = [
    document.querySelector('.slot1'),
    document.querySelector('.slot2'),
    document.querySelector('.slot3')
];
let slotValues = [];

handle.addEventListener('mousedown', handleDown);
handle.addEventListener('touchstart', handleDown);
handle.addEventListener('mouseup', handleUp);
handle.addEventListener('touchend', handleUp);

let handleVelocity = 0;
let isHandleDown = false;
let endCount = 0;

function handleDown() {
    if (!isHandleDown) {
        isHandleDown = true;
        handleVelocity = 0;
        sethandleVelocity();
        audioCrank.play();
    }
}

function handleUp() {
    isHandleDown = false;
}

function sethandleVelocity() {

    if (isHandleDown) {
        handleVelocity = Math.min(60, handleVelocity + 1);
        requestAnimationFrame(sethandleVelocity)
    } else {
        if (handleVelocity > 30) {
            spinSlots();
        }
    }
}

function spinSlots() {

    handle.disabled = true;
    handle.classList.remove('win');
    endCount = 0;

    //Clear icons
    document.querySelectorAll('.slot-icon_last').forEach(icon => {
        icon.classList.remove('slot-icon_last');
        icon.classList.add('slot-icon_out');
        icon.addEventListener('animationend', () => {
            icon.parentElement.removeChild(icon);
        });
    });

    spinSlot(0, handleVelocity * (Math.random() + 1));
    spinSlot(1, handleVelocity * (Math.random() + 1));
    spinSlot(2, handleVelocity * (Math.random() + 1));
    
    audioSpin.currentTime = 0;
    audioSpin.play();

}

function spinSlot(ix, velocity, last=false) {

    const slot = slots[ix];
    const value = (Math.floor(Math.random() * iconsCount) + (slotValues[ix] || 0)) % iconsCount;
    slotValues[ix] = value;
    
    const icon = document.createElement('div');
    icon.classList = last ? 'slot-icon_last' : 'slot-icon';
    
    if (last) {
        forceWin.count++;
        if (params.win || (forceWin.count > ((forceWin.winEveryXgames - 1) * 3))) {
            icon.style.backgroundImage = `url(${gameData.icons[params.win || forceWin.nextIcon]})`;
            slotValues[ix] = params.win || forceWin.nextIcon;
            
        } else {
            icon.style.backgroundImage = `url(${gameData.icons[value]})`;
        }
        endGame(ix);
        
    } else {
        icon.style.backgroundImage = `url(${gameData.icons[value]})`;
        const duration = (Math.pow((60 - velocity) / 60, 2) + 0) * 420;
        icon.style.setProperty('--duration', `${duration}ms`);
        icon.addEventListener('animationend', () => {
            slot.removeChild(icon);
        });
    
        if (duration < 400) {
            setTimeout(() => {
                spinSlot(ix, velocity - 1);
            }, duration / 2);
        } else {
            spinSlot(ix, 0, true);
        }
    }

    slot.appendChild(icon);
}

spinSlot(0, 0, true);
spinSlot(1, 0, true);
spinSlot(2, 0, true);

function endGame(ix) {
    if (handle.disabled) {
        endCount += (ix + 1);
        if (endCount === 6) {
            setTimeout(() => {
                if (slotValues[0] === slotValues[1] && slotValues[0] === slotValues[2]) {
                    //win
                    handle.classList.add('win');
                    audioWin.play();
                    window.parent.postMessage({
                        type: 'win',
                        icon: gameData?.icons[slotValues[0]]
                    }, '*')                  
                } else {
                    audioFail.play();
                    handle.disabled = false;               
                }
            }, 1000);
            if (forceWin.count > ((forceWin.winEveryXgames - 1) * 3)) {
                forceWin.count = 0;
                forceWin.nextIcon = Math.floor(Math.random() * iconsCount);
            }
            audioSpin.pause();
            audioSpinEnd.currentTime = 0.5;
            audioSpinEnd.play();

            // setTimeout(() => {
            // }, 1000);
        }
    }
}