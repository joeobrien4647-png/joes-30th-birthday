/* ============================================
   Party Tools Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initSoundboard();
    initSpeechTimer();
    initPartySubNav();
});

/* ============================================
   Soundboard
   ============================================ */
function initSoundboard() {
    const buttons = document.querySelectorAll('.sound-btn');

    if (!buttons.length) return;

    // Web Audio API for generating sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
        airhorn: () => playTone([350, 450, 550], 0.5, 'sawtooth'),
        applause: () => playNoise(1.5),
        drumroll: () => playDrumroll(),
        birthday: () => playMelody([262, 262, 294, 262, 349, 330]),
        cheers: () => playTone([400, 500, 600], 0.3, 'sine'),
        woohoo: () => playTone([300, 400, 500, 600], 0.4, 'sine'),
        fail: () => playTone([400, 300, 200], 0.5, 'sawtooth'),
        rimshot: () => playRimshot()
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.dataset.sound;
            if (sounds[sound]) {
                this.classList.add('playing');
                sounds[sound]();
                setTimeout(() => this.classList.remove('playing'), 300);
            }
        });
    });

    function playTone(frequencies, duration, type) {
        frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(audioContext.currentTime + i * 0.1);
            osc.stop(audioContext.currentTime + duration + i * 0.1);
        });
    }

    function playNoise(duration) {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        noise.buffer = buffer;
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        noise.connect(gain);
        gain.connect(audioContext.destination);
        noise.start();
    }

    function playDrumroll() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => playTone([100 + Math.random() * 50], 0.05, 'square'), i * 50);
        }
    }

    function playRimshot() {
        playTone([200], 0.1, 'square');
        setTimeout(() => playTone([150], 0.1, 'square'), 100);
        setTimeout(() => playTone([300, 400], 0.2, 'triangle'), 200);
    }

    function playMelody(notes) {
        notes.forEach((note, i) => {
            setTimeout(() => playTone([note], 0.3, 'sine'), i * 300);
        });
    }
}

/* ============================================
   Speech Timer
   ============================================ */
function initSpeechTimer() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const progressFill = document.getElementById('timer-progress-fill');
    const status = document.getElementById('timer-status');
    const presets = document.querySelectorAll('.timer-preset');

    if (!display || !startBtn) return;

    let totalTime = 120; // Default 2 minutes
    let timeLeft = totalTime;
    let interval = null;
    let isRunning = false;

    presets.forEach(preset => {
        preset.addEventListener('click', function() {
            if (isRunning) return;

            presets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            totalTime = parseInt(this.dataset.time);
            timeLeft = totalTime;
            updateDisplay();
            updateProgress();
        });
    });

    startBtn.addEventListener('click', function() {
        if (isRunning) return;

        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        status.textContent = 'Speech in progress...';

        interval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgress();

            if (timeLeft <= 30) {
                display.classList.add('warning');
            }
            if (timeLeft <= 10) {
                display.classList.remove('warning');
                display.classList.add('danger');
            }

            if (timeLeft <= 0) {
                clearInterval(interval);
                isRunning = false;
                status.textContent = "Time's up! 🎉";
                triggerConfetti();
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        }, 1000);
    });

    pauseBtn.addEventListener('click', function() {
        if (!isRunning) return;

        clearInterval(interval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        status.textContent = 'Paused';
    });

    resetBtn.addEventListener('click', function() {
        clearInterval(interval);
        isRunning = false;
        timeLeft = totalTime;
        updateDisplay();
        updateProgress();
        display.classList.remove('warning', 'danger');
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        status.textContent = 'Ready to time a speech!';
    });

    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        display.querySelector('.timer-minutes').textContent = mins.toString().padStart(2, '0');
        display.querySelector('.timer-seconds').textContent = secs.toString().padStart(2, '0');
    }

    function updateProgress() {
        const percentage = (timeLeft / totalTime) * 100;
        progressFill.style.width = percentage + '%';
    }
}

/* ============================================
   Sub-navigation scroll highlighting
   ============================================ */
function initPartySubNav() {
    const subNavLinks = document.querySelectorAll('.sub-nav-links a');
    const sections = document.querySelectorAll('.section[id]');

    if (!subNavLinks.length || !sections.length) return;

    // Highlight active sub-nav link on scroll
    window.addEventListener('scroll', function () {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                subNavLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector('.sub-nav-links a[href="#' + section.id + '"]');
                if (activeLink) activeLink.classList.add('active');
            }
        });
    });
}
