const crackLog = document.querySelector('.crack-log');
const passwordInput = document.getElementById('password');
const crackBtn = document.querySelector('.crack-btn');
const crackingTimeSpan = document.querySelector('#cracking-time');
const currentAttemptSpan = document.querySelector('#current-attempt');

function sleep() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

async function crackPassword(desiredLength, prefix, target, foundRef, charset) {
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
        await crackPassword(desiredLength, prefix + charset[i], target, foundRef, charset);
    }
}

function getCharsetFromPassword(password) {
    let charset = '';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ ';

    if (/[a-z]/.test(password)) charset += lowers;
    if (/[A-Z]/.test(password)) charset += uppers;
    if (/[0-9]/.test(password)) charset += digits;
    if (/[^a-zA-Z0-9]/.test(password)) charset += symbols;
    
    if (!charset) charset = lowers;

    return charset;
}

async function handleCrackClick() {
    const target = passwordInput.value;
    if (!target) {
        currentAttemptSpan.textContent = 'None';
        crackingTimeSpan.textContent = 'Enter a password first.';
        return;
    }

    const charset = getCharsetFromPassword(target);

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

    const foundRef = { found: false };
    await crackPassword(target.length, '', target, foundRef, charset);
    running = false;

    crackingTimeSpan.textContent = foundRef.found
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
