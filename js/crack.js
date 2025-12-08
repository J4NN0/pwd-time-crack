const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const attemptSpan = document.querySelector('#password-attempts span');
const crackLog = document.querySelector('.crack-log');
const passwordInput = document.getElementById('password');
const crackBtn = document.querySelector('.crack-btn');

function sleep() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

async function recurseAttempt(desiredLength, prefix, target, foundRef) {
    if (foundRef.found) return;

    if (prefix.length === desiredLength) {
        attemptSpan.textContent = prefix;
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
        attemptSpan.textContent = 'None';
        crackLog.textContent = 'Enter a password first.';
        return;
    }

    crackBtn.disabled = true;
    crackBtn.textContent = 'Cracking...';
    crackLog.textContent = 'Running...';
    attemptSpan.textContent = 'Starting...';

    const startTime = performance.now();
    const found = await crackPassword(target, target.length);
    const endTime = performance.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(3);

    crackLog.textContent = found
        ? `Password found: ${attemptSpan.textContent}\nTime: ${elapsedTime}s`
        : 'Exhausted search without a match.';

    crackBtn.disabled = false;
    crackBtn.textContent = 'Crack';
}

function init() {
    if (!crackBtn || !attemptSpan || !crackLog || !passwordInput) {
        console.error('Required elements not found');
        return;
    }
    crackBtn.addEventListener('click', handleCrackClick);
}

init();
