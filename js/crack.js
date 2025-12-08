const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const crackLog = document.querySelector('.crack-log');
const passwordInput = document.getElementById('password');
const crackBtn = document.querySelector('.crack-btn');
const crackingTimeSpan = document.querySelector('#cracking-time');
const currentAttemptSpan = document.querySelector('#current-attempt');

function sleep() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

async function recurseAttempt(desiredLength, prefix, target, foundRef) {
    if (foundRef.found) return;

    if (prefix.length === desiredLength) {
        currentAttemptSpan.textContent = prefix;
        if (prefix === target) {
            foundRef.found = true;
            return;
        }
        await sleep(); // yield to keep UI responsive
        return;
    }

    for (let i = 0; i < charset.length && !foundRef.found; i++) {
        await recurseAttempt(desiredLength, prefix + charset[i], target, foundRef);
    }
}

async function crackPassword(target, maxLength) {
    const foundRef = { found: false };

    for (let len = 1; len <= maxLength && !foundRef.found; len++) {
        await recurseAttempt(len, '', target, foundRef);
    }

    return foundRef.found;
}

async function handleCrackClick() {
    const target = passwordInput.value;
    if (!target) {
        currentAttemptSpan.textContent = 'None';
        crackingTimeSpan.textContent = 'Enter a password first.';
        return;
    }

    crackBtn.disabled = true;
    crackBtn.textContent = 'Cracking...';
    currentAttemptSpan.textContent = 'Starting...';

    let running = true;
    let startTime = performance.now();
    function updateRunningTime() {
        if (!running) return;
        const now = performance.now();
        const elapsed = ((now - startTime) / 1000).toFixed(3);
        crackingTimeSpan.textContent = `${elapsed}s`;
        requestAnimationFrame(updateRunningTime);
    }
    updateRunningTime();

    const found = await crackPassword(target, target.length);
    running = false;

    crackingTimeSpan.textContent = found
        ? `${((performance.now() - startTime) / 1000).toFixed(3)}s`
        : 'Exhausted search without a match.';

    crackBtn.disabled = false;
    crackBtn.textContent = 'Crack';
}

function init() {
    if (!crackBtn || !currentAttemptSpan || !crackLog || !passwordInput) {
        console.error('Required elements not found');
        return;
    }
    crackBtn.addEventListener('click', handleCrackClick);
}

init();
