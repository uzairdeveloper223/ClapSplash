const UI = {
    btnToggleMic: document.getElementById('toggle-mic-btn'),
    btnStopAudio: document.getElementById('stop-audio-btn'),
    dotMicStatus: document.getElementById('mic-status-dot'),
    textMicStatus: document.getElementById('mic-status-text'),
    sliderSensitivity: document.getElementById('sensitivity-slider'),
    valSensitivity: document.getElementById('sensitivity-value'),
    sliderDebounce: document.getElementById('debounce-slider'),
    valDebounce: document.getElementById('debounce-value'),
    sliderVolume: document.getElementById('volume-slider'),
    valVolume: document.getElementById('volume-value'),
    logContainer: document.getElementById('event-log'),
    audioPlayer: document.getElementById('audio-player'),
    packSelector: document.getElementById('pack-selector'),
    soundSelector: document.getElementById('sound-selector'),
    soundSelectorGroup: document.getElementById('sound-selector-group'),
    btnAbout: document.getElementById('about-btn'),
    btnCloseModal: document.getElementById('close-modal-btn'),
    modalAbout: document.getElementById('about-modal'),
    btnSuggest: document.getElementById('suggest-btn'),
    btnCloseSuggest: document.getElementById('close-suggest-btn'),
    modalSuggest: document.getElementById('suggest-modal'),
    formSuggest: document.getElementById('suggest-form'),
    formResult: document.getElementById('form-result')
};

let audioContext = null;
let analyser = null;
let microphoneStream = null;
let isListening = false;
let animationFrameId = null;

let threshold = parseInt(UI.sliderSensitivity.value, 10);
let debounceMs = parseInt(UI.sliderDebounce.value, 10);
let lastClapTime = 0;

let soundPacks = [];
let allSounds = []; // Flat list for shuffle

function logEvent(message) {
    const entry = document.createElement('div');
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    entry.textContent = `[${timestamp}] ${message}`;
    UI.logContainer.prepend(entry);
    
    while (UI.logContainer.children.length > 50) {
        UI.logContainer.removeChild(UI.logContainer.lastChild);
    }
}

function updateStatus(state, message) {
    UI.dotMicStatus.dataset.state = state;
    UI.textMicStatus.textContent = message;
}

async function initConfig() {
    try {
        const response = await fetch('config.json');
        const data = await response.json();
        soundPacks = data.packs;
        
        soundPacks.forEach(pack => {
            const option = document.createElement('option');
            option.value = pack.id;
            option.textContent = pack.name;
            UI.packSelector.appendChild(option);
            
            allSounds = allSounds.concat(pack.sounds);
        });

        // Set default to Anime => Anime Ah
        UI.packSelector.value = 'anime';
        updateSoundSelector('anime');
        UI.soundSelector.value = 'anime-ah';
        updateAudioSource();

    } catch (err) {
        logEvent('Failed to load config.json: ' + err.message);
    }
}

function updateSoundSelector(packId) {
    if (packId === 'shuffle') {
        UI.soundSelectorGroup.style.display = 'none';
        return;
    }
    UI.soundSelectorGroup.style.display = 'flex';
    UI.soundSelector.innerHTML = '';
    
    const pack = soundPacks.find(p => p.id === packId);
    if (pack) {
        pack.sounds.forEach(sound => {
            const option = document.createElement('option');
            option.value = sound.id;
            option.textContent = sound.name;
            option.dataset.path = sound.path;
            UI.soundSelector.appendChild(option);
        });
    }
}

function updateAudioSource() {
    if (UI.packSelector.value === 'shuffle') return; // Shuffle handles it dynamically
    
    const selectedOption = UI.soundSelector.options[UI.soundSelector.selectedIndex];
    if (selectedOption) {
        UI.audioPlayer.src = selectedOption.dataset.path;
    }
}

function stopAudio() {
    UI.audioPlayer.pause();
    UI.audioPlayer.currentTime = 0;
    UI.btnStopAudio.style.display = 'none';
    logEvent("Playback stopped by user.");
}

function playSound() {
    logEvent("Clap detected!");
    
    if (UI.packSelector.value === 'shuffle') {
        const randomSound = allSounds[Math.floor(Math.random() * allSounds.length)];
        UI.audioPlayer.src = randomSound.path;
        logEvent(`Shuffled: ${randomSound.name}`);
    } else {
        const selectedOption = UI.soundSelector.options[UI.soundSelector.selectedIndex];
        if (selectedOption) {
             logEvent(`Playing: ${selectedOption.textContent}`);
        }
    }

    UI.audioPlayer.currentTime = 0;
    UI.audioPlayer.play().catch(err => {
        logEvent(`Playback failed: ${err.message}`);
    });
}

function processAudio() {
    if (!isListening || !analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let highFreqEnergy = 0;
    const startIndex = Math.floor(analyser.frequencyBinCount * 0.1); 
    const endIndex = Math.floor(analyser.frequencyBinCount * 0.5);

    for (let i = startIndex; i < endIndex; i++) {
        highFreqEnergy += dataArray[i];
    }
    
    const averageEnergy = highFreqEnergy / (endIndex - startIndex);

    if (averageEnergy > threshold) {
        const now = performance.now();
        if (now - lastClapTime > debounceMs) {
            playSound();
            lastClapTime = now;
        }
    }

    animationFrameId = requestAnimationFrame(processAudio);
}

async function startListening() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        microphoneStream = stream;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.2;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        isListening = true;
        updateStatus("active", "Listening...");
        UI.btnToggleMic.textContent = "Stop Listening";
        UI.btnToggleMic.dataset.primary = "false";
        logEvent("Microphone active.");
        
        processAudio();
    } catch (err) {
        updateStatus("error", "Permission Denied");
        logEvent(`Mic error: ${err.message}`);
    }
}

function stopListening() {
    isListening = false;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    updateStatus("inactive", "Microphone Offline");
    UI.btnToggleMic.textContent = "Start Listening";
    UI.btnToggleMic.dataset.primary = "true";
    logEvent("Microphone deactivated.");
}

// Event Listeners
UI.btnToggleMic.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

UI.btnStopAudio.addEventListener('click', stopAudio);

UI.packSelector.addEventListener('change', (e) => {
    updateSoundSelector(e.target.value);
    updateAudioSource();
});

UI.soundSelector.addEventListener('change', updateAudioSource);

UI.sliderSensitivity.addEventListener('input', (e) => {
    threshold = parseInt(e.target.value, 10);
    UI.valSensitivity.textContent = threshold;
});

UI.sliderDebounce.addEventListener('input', (e) => {
    debounceMs = parseInt(e.target.value, 10);
    UI.valDebounce.textContent = debounceMs;
});

UI.sliderVolume.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    UI.audioPlayer.volume = vol;
    UI.valVolume.textContent = Math.round(vol * 100) + '%';
});

UI.audioPlayer.addEventListener('play', () => {
    UI.btnStopAudio.style.display = 'block';
});

UI.audioPlayer.addEventListener('ended', () => {
    UI.btnStopAudio.style.display = 'none';
});

UI.audioPlayer.addEventListener('pause', () => {
    UI.btnStopAudio.style.display = 'none';
});

window.addEventListener('beforeunload', stopListening);

UI.btnAbout.addEventListener('click', () => {
    UI.modalAbout.style.display = 'flex';
});

UI.btnCloseModal.addEventListener('click', () => {
    UI.modalAbout.style.display = 'none';
});

UI.modalAbout.addEventListener('click', (e) => {
    if (e.target === UI.modalAbout) {
        UI.modalAbout.style.display = 'none';
    }
});

// Suggest Modal Events
UI.btnSuggest.addEventListener('click', () => {
    UI.modalSuggest.style.display = 'flex';
});

UI.btnCloseSuggest.addEventListener('click', () => {
    UI.modalSuggest.style.display = 'none';
});

UI.modalSuggest.addEventListener('click', (e) => {
    if (e.target === UI.modalSuggest) {
        UI.modalSuggest.style.display = 'none';
    }
});

// Web3Forms AJAX Submission
UI.formSuggest.addEventListener('submit', function(e) {
    e.preventDefault();
    UI.formResult.textContent = "Sending suggestion...";
    UI.formResult.style.color = "var(--text-secondary)";
    
    const formData = new FormData(UI.formSuggest);
    
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Accept': 'application/json' // Prevents Redirect
        },
        body: formData
    })
    .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
            UI.formResult.textContent = "Suggestion successfully sent!";
            UI.formResult.style.color = "var(--success)";
            UI.formSuggest.reset();
        } else {
            UI.formResult.textContent = json.message || "Failed to send.";
            UI.formResult.style.color = "var(--error)";
        }
    })
    .catch(error => {
        UI.formResult.textContent = "Network error. Try again.";
        UI.formResult.style.color = "var(--error)";
    });
});

// Init
initConfig();
