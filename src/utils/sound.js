// src/utils/sound.js

const sounds = {
    click: new Audio('/sounds/click.mp3'),
    woof: new Audio('/sounds/woof_soft.mp3')
};

let soundEnabled = false; // Default to off

// Initialize sound preference from localStorage
if (typeof localStorage !== 'undefined') {
    const storedPreference = localStorage.getItem('soundEnabled');
    if (storedPreference === 'true') {
        soundEnabled = true;
    }
}

export const playSound = (soundName) => {
    if (soundEnabled && sounds[soundName]) {
        sounds[soundName].currentTime = 0; // Reset to start for quick successive plays
        sounds[soundName].play().catch(e => console.warn("Sound playback failed:", e)); // Catch potential errors
    }
};

export const toggleSound = () => {
    soundEnabled = !soundEnabled;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('soundEnabled', soundEnabled);
    }
    return soundEnabled;
};

export const isSoundEnabled = () => soundEnabled;

