'use client';

function createSlowFunc(func, timeout) {
    let busy = false;
    function slowRecurse () {
        if (busy)
            return;
        busy = true;

        setTimeout(() => {
            const recurse = func();
            busy = false;

            if (recurse)
                slowRecurse();
        }, timeout);
    }
    return slowRecurse;
}


let spinCounter = 0;
let actualSpinCounter = 0;

function checkSpinDisplay() {
    // console.info("> Spin Level: ", spinCounter, actualSpinCounter);
    // #main-loading-div
    let div = document.getElementById("main-loading-div");
    if (div === null)
        return;
    let counter = actualSpinCounter;
    if (actualSpinCounter < 1 && spinCounter > 0)
        counter = 1;
    if (counter < 1)
        return div.style.display = "none";
    div.style.display = "block";

    // set size
    let size = 25 + counter * 2;
    if (size > 50)
        size = 50;
    div.style.width = size + "px";
    div.style.height = size + "px";

    // set right and bottom position to make it centered
    div.style.right = (20 + (20 - size / 2)) + "px";
    div.style.bottom = (20 + (20 - size / 2)) + "px";

    // change color
    let color = (170 + counter * 30) % 360;
    div.style.borderLeft = `4px solid hsl(${color}deg, 100%, 80%)`;
}

const slowIncrease = createSlowFunc(() => {
    if (actualSpinCounter >= spinCounter) {
        checkSpinDisplay();
        return false;
    }

    actualSpinCounter++;
    checkSpinDisplay();
    return true;
}, 200);

const slowDecrease = createSlowFunc(() => {
    if (actualSpinCounter <= spinCounter) {
        checkSpinDisplay();
        return false;
    }

    actualSpinCounter--;
    checkSpinDisplay();
    return true;
}, 300);

export function SpinLevelAdd() {
    spinCounter++;
    checkSpinDisplay();
    slowIncrease();
}

export function SpinLevelRemove() {
    spinCounter--;
    if (spinCounter < 0)
        spinCounter = 0;
    slowDecrease();
}

export async function SpinActivity(callback) {
    let res = null;
    SpinLevelAdd();
    try {
        res = await callback();
    } catch (e) {
        SpinLevelRemove();
        throw e;
    }
    SpinLevelRemove();
    return res;
}