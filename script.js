// Init Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Loop
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Click to Enter
const enterScreen = document.getElementById('enter-screen');
const mainContent = document.querySelector('.main-content');

// Terminal Enter Screen Logic
const terminalTextEl = document.getElementById('terminal-text');
const terminalLines = [
    "CLICK ANYWHERE TO ENTER"
];

let termLineIndex = 0;
let termCharIndex = 0;
let termCurrentText = "";

function typeTerminal() {
    if (!terminalTextEl) return;
    
    if (termLineIndex < terminalLines.length) {
        const line = terminalLines[termLineIndex];
        
        if (termCharIndex < line.length) {
            termCurrentText += line.charAt(termCharIndex);
            terminalTextEl.innerHTML = termCurrentText;
            termCharIndex++;
            setTimeout(typeTerminal, Math.random() * 50 + 10);
        } else {
            termCurrentText += "<br>";
            termLineIndex++;
            termCharIndex = 0;
            
            if (termLineIndex !== terminalLines.length) {
                setTimeout(typeTerminal, 2000);
            }
        }
    }
}

// Mulai animasi terminal
setTimeout(typeTerminal, 600);

// Typewriter
const bioTexts = typeof CONFIG !== 'undefined' && CONFIG.bioTexts ? CONFIG.bioTexts : [];

const typewriterElement = document.getElementById('typewriter');
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isTyping = false;

// Typewriter Logic
function typeWriter() {
    const currentText = bioTexts[textIndex];
    let typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.typingSpeed !== undefined ? CONFIG.typingSpeed : 50;

    if (isDeleting) {
        // Delete text
        charIndex--;
        typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.deletingSpeed !== undefined ? CONFIG.deletingSpeed : 30;
    } else {
        // Type text
        charIndex++;
    }

    // Replace \n with <br>
    let textToShow = currentText.substring(0, charIndex);
    typewriterElement.innerHTML = textToShow.replace(/\n/g, '<br>');

    // Delete or type text
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.pauseDuration !== undefined ? CONFIG.pauseDuration : 5000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;

        // Randomly select next text
        let nextIndex = textIndex;
        if (bioTexts.length > 1) {
            while (nextIndex === textIndex) {
                nextIndex = Math.floor(Math.random() * bioTexts.length);
            }
        }
        textIndex = nextIndex;

        typeSpeed = 500; // 500ms
    }

    setTimeout(typeWriter, typeSpeed);
}

// Local audio player
const PLAYLIST = typeof CONFIG !== 'undefined' && CONFIG.playlist ? CONFIG.playlist : [];

// Shuffle/Order playlist
let shuffledPlaylist = [...PLAYLIST];
if (typeof CONFIG !== 'undefined' && CONFIG.randomizePlaylist) {
    shuffledPlaylist.sort(() => Math.random() - 0.5);
}

let currentSongIndex = 0;
let isFirstSongLoad = true;

const bgAudio = new Audio();
bgAudio.volume = 0.5;

const titleElement = document.getElementById('local-song-title');
const artistElement = document.getElementById('local-song-artist');
const coverElement = document.getElementById('local-song-cover');

function fallbackTitle(path) {
    if (titleElement) {
        const fileName = path.split('/').pop().split('.mp3')[0];
        titleElement.textContent = fileName.replace(/[-_]/g, ' ');
    }
}

function loadSong(index) {
    const songPath = shuffledPlaylist[index];
    bgAudio.src = songPath;
    
    // Set custom start time from config if specified
    const startTime = typeof CONFIG !== 'undefined' && CONFIG.playlistStartTime ? CONFIG.playlistStartTime : 0;
    if (startTime > 0 && isFirstSongLoad) {
        isFirstSongLoad = false;
        bgAudio.addEventListener('loadedmetadata', function onLoaded() {
            if (startTime < bgAudio.duration) {
                bgAudio.currentTime = startTime;
            }
            bgAudio.removeEventListener('loadedmetadata', onLoaded);
        });
    }

    if (titleElement) titleElement.textContent = "Loading...";
    if (artistElement) {
        artistElement.textContent = "Unknown Artist";
        artistElement.style.display = 'none';
    }
    if (coverElement) {
        coverElement.style.display = 'none';
        coverElement.src = '';
    }

    // Load song metadata using jsmediatags
    try {
        if (window.jsmediatags) {
            const absoluteUrl = new URL(songPath, window.location.href).href;
            window.jsmediatags.read(absoluteUrl, {
                onSuccess: function (tag) {
                    const tags = tag.tags;

                    if (tags.title && titleElement) {
                        titleElement.textContent = tags.title;
                    } else {
                        fallbackTitle(songPath);
                    }

                    if (tags.artist && artistElement) {
                        artistElement.textContent = tags.artist;
                        artistElement.style.display = 'block';
                    }

                    if (tags.picture && coverElement) {
                        const picture = tags.picture;
                        let base64String = "";
                        const pictureData = picture.data;
                        for (let i = 0; i < pictureData.length; i++) {
                            base64String += String.fromCharCode(pictureData[i]);
                        }
                        const base64Url = `data:${picture.format};base64,${btoa(base64String)}`;

                        coverElement.src = base64Url;
                        coverElement.style.display = 'block';
                    }
                },
                onError: function (error) {
                    console.log('Error reading tags:', error);
                    fallbackTitle(songPath);
                }
            });
        } else {
            fallbackTitle(songPath);
        }
    } catch (e) {
        console.log('JSMediaTags error:', e);
        fallbackTitle(songPath);
    }
}

// 
loadSong(currentSongIndex);

// 
bgAudio.addEventListener('ended', playNextSong);

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
    loadSong(currentSongIndex);
    bgAudio.play().catch(e => console.log(e));
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
}

function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
    loadSong(currentSongIndex);
    bgAudio.play().catch(e => console.log(e));
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
}

const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const localProgressBar = document.getElementById('local-progress-bar');
const localProgressContainer = document.getElementById('local-progress-container');
const localTimeDisplay = document.getElementById('local-time');

// Enter screen click event
enterScreen.addEventListener('click', () => {
    enterScreen.style.opacity = '0';
    setTimeout(() => {
        enterScreen.style.visibility = 'hidden';
    }, 1000);

    mainContent.style.opacity = '1';
    mainContent.style.pointerEvents = 'none'; // Allow events to pass through to background
    mainContent.classList.add('visible');

    // Init Constellation after click
    if (typeof initConstellation === 'function') {
        initConstellation();
    }

    // Play background audio
    bgAudio.play().then(() => {
        initVisualizer();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
    }).catch(e => console.log("Audio play failed:", e));

    // Start typewriter effect
    if (!isTyping) {
        isTyping = true;
        setTimeout(typeWriter, 500);
    }
});

// Audio visualizer
let audioCtx, analyser, dataArray, visualizerBars = [];
let audioSourceConnected = false;

function initVisualizer() {
    if (audioSourceConnected) return;

    if (window.location.protocol === 'file:') return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    // Connect audio element to analyser
    const source = audioCtx.createMediaElementSource(bgAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 64; // Small size for fewer bars
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const visualizerContainer = document.getElementById('audio-visualizer');
    if (visualizerContainer) {
        visualizerContainer.innerHTML = '';
        const numBars = 10;
        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            visualizerContainer.appendChild(bar);
            visualizerBars.push(bar);
        }
    }

    audioSourceConnected = true;
    requestAnimationFrame(updateVisualizer);
}

// Update visualizer bars based on audio data
function updateVisualizer() {
    if (!audioCtx) return;

    analyser.getByteFrequencyData(dataArray);

    const numBars = visualizerBars.length;
    for (let i = 0; i < numBars; i++) {
        // Skip
        const value = dataArray[i + 2];
        const height = Math.max(3, (value / 255) * 18);
        if (visualizerBars[i]) {
            visualizerBars[i].style.height = `${height}px`;
        }
    }

    requestAnimationFrame(updateVisualizer);
}

// Toggle play/pause state of background audio
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (bgAudio.paused) {
            bgAudio.play();
            playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
        } else {
            bgAudio.pause();
            playPauseBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
        }
    });
}

// Toggle previous/next song on button click
if (prevBtn) prevBtn.addEventListener('click', playPrevSong);
if (nextBtn) nextBtn.addEventListener('click', playNextSong);

const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

function updateMuteIcon(vol, muted) {
    if (!muteBtn) return;
    if (muted || vol == 0) {
        muteBtn.innerHTML = '<i class="ph-fill ph-speaker-slash"></i>';
    } else if (vol < 0.5) {
        muteBtn.innerHTML = '<i class="ph-fill ph-speaker-low"></i>';
    } else {
        muteBtn.innerHTML = '<i class="ph-fill ph-speaker-high"></i>';
    }
}

if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        bgAudio.muted = !bgAudio.muted;
        updateMuteIcon(bgAudio.volume, bgAudio.muted);
    });
}

// Update volume slider UI based on audio volume
function updateVolumeSliderUI(vol) {
    if (volumeSlider) {
        const percent = vol * 100;
        volumeSlider.style.background = `linear-gradient(to right, #fff ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%)`;
    }
}

if (volumeSlider) {
    // Initial UI state
    updateVolumeSliderUI(volumeSlider.value);

    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value;
        bgAudio.volume = vol;
        bgAudio.muted = false; // Unmute when slider is moved
        updateMuteIcon(vol, bgAudio.muted);
        updateVolumeSliderUI(vol);
    });
}

// Update progress bar and time display on time update
bgAudio.addEventListener('timeupdate', () => {
    if (bgAudio.duration) {
        const progressPercent = (bgAudio.currentTime / bgAudio.duration) * 100;
        if (localProgressBar) localProgressBar.style.width = `${progressPercent}%`;

        const currentMins = Math.floor(bgAudio.currentTime / 60);
        const currentSecs = Math.floor(bgAudio.currentTime % 60);
        if (localTimeDisplay) {
            localTimeDisplay.textContent = `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
        }
    }
});

// Seek to a specific position in the audio on progress bar click
if (localProgressContainer) {
    localProgressContainer.addEventListener('click', (e) => {
        const width = localProgressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = bgAudio.duration;
        if (duration) {
            bgAudio.currentTime = (clickX / width) * duration;
        }
    });
}

// Fetch and display users Discord status using Lanyard API
const DISCORD_USER_ID = typeof CONFIG !== 'undefined' && CONFIG.discordUserId ? CONFIG.discordUserId : '773408954352009216'; // DiscordID

const lanyardAvatar = document.getElementById('lanyard-avatar');
const lanyardStatus = document.getElementById('lanyard-status');
const lanyardUsername = document.getElementById('lanyard-username');
const lanyardDiscriminator = document.getElementById('lanyard-discriminator');
const lanyardActivity = document.getElementById('lanyard-activity');

function connectLanyard() {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    // Handle WebSocket open event
    ws.onopen = () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: DISCORD_USER_ID
            }
        }));
    };

    // Handle incoming messages from the Lanyard API
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.op === 0) {
            updateDiscordCard(data.d);
        }
    };

    ws.onclose = () => {
        // Reconnect after 5 seconds on close
        setTimeout(connectLanyard, 5000);
    };
}

function updateDiscordCard(data) {
    const user = data.discord_user;

    // Update avatar if available
    if (user.avatar) {
        const isGif = user.avatar.startsWith('a_');
        const ext = isGif ? 'gif' : 'png';
        lanyardAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
    }

    // Update username
    lanyardUsername.textContent = '@' + user.username;

    // Update discriminator if available
    if (user.discriminator && user.discriminator !== "0") {
        lanyardUsername.textContent += `#${user.discriminator}`;
    }

    // Update clan tag if available
    const clanTagPill = document.getElementById('clan-tag-pill');
    if (clanTagPill && user.primary_guild && user.primary_guild.tag) {
        clanTagPill.style.display = 'flex';
        document.getElementById('clan-tag-text').textContent = user.primary_guild.tag;

        const clanBadgeIcon = document.getElementById('clan-badge-icon');
        if (clanBadgeIcon && user.primary_guild.badge) {
            clanBadgeIcon.src = `https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png`;
            clanBadgeIcon.style.display = 'block';
        } else if (clanBadgeIcon) {
            clanBadgeIcon.style.display = 'none';
        }
    } else if (clanTagPill) {
        clanTagPill.style.display = 'none';
    }

    // Update badges if available
    const badgesContainer = document.getElementById('discord-badges');
    if (badgesContainer) {
        badgesContainer.innerHTML = '';
        const flags = user.public_flags;
        const badges = [];

        if (flags & 1) badges.push({ name: 'Discord Staff', icon: 'discord-staff.svg' });
        if (flags & 2) badges.push({ name: 'Partnered Server Owner', icon: 'discord-partner.svg' });
        if (flags & 4) badges.push({ name: 'HypeSquad Events', icon: 'hype-squad-events.svg' });
        if (flags & 8) badges.push({ name: 'Bug Hunter Level 1', icon: 'discord-bug-hunter-green.svg' });
        if (flags & 64) badges.push({ name: 'House Bravery', icon: 'hype-squad-bravery.svg' });
        if (flags & 128) badges.push({ name: 'House Brilliance', icon: 'hype-squad-brilliance.svg' });
        if (flags & 256) badges.push({ name: 'House Balance', icon: 'hype-squad-balance.svg' });
        if (flags & 512) badges.push({ name: 'Early Supporter', icon: 'discord-early-supporter.svg' });
        if (flags & 16384) badges.push({ name: 'Bug Hunter Level 2', icon: 'discord-bug-hunter-gold.svg' });
        if (flags & 131072) badges.push({ name: 'Early Verified Bot Developer', icon: 'discord-bot-dev.svg' });
        if (flags & 4194304) badges.push({ name: 'Active Developer', icon: 'active-developer.svg' });

        // Update Nitro badge if avatar is a GIF
        if (user.avatar && user.avatar.startsWith('a_')) {
            badges.push({ name: 'Nitro', icon: 'discord-nitro.svg' });
        }

        badges.forEach(b => {
            const img = document.createElement('img');
            img.src = b.url ? b.url : `https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/${b.icon}`;
            img.alt = b.name;
            img.title = b.name;
            img.className = 'badge';
            badgesContainer.appendChild(img);
        });
    }

    // Update status indicator
    lanyardStatus.className = 'lanyard-status-indicator';
    lanyardStatus.classList.add(data.discord_status);

    // Update avatar glow if available
    if (lanyardAvatar) {
        lanyardAvatar.className = 'avatar'; // Reset
        lanyardAvatar.classList.add(data.discord_status);
    }

    // Update activity text and player if available
    let activityText = data.discord_status === 'offline' ? "Offline" : "Online";
    const activityPlayer = document.getElementById('activity-player');
    const activityIcon = document.getElementById('activity-icon');
    const activityTitle = document.getElementById('activity-title');
    const activityCover = document.getElementById('activity-cover');
    const activityName = document.getElementById('activity-name');
    const activityDetails = document.getElementById('activity-details');
    const activityState = document.getElementById('activity-state');
    const progressContainer = document.getElementById('activity-progress-container');
    const timeContainer = document.getElementById('activity-time');

    // Update activity text and player if available
    if (data.listening_to_spotify) {
        activityText = `Listening ${data.spotify.song} by ${data.spotify.artist}`;

        if (activityPlayer) activityPlayer.style.display = 'flex';

        activityIcon.className = 'ph-fill ph-spotify-logo';
        activityIcon.style.color = '#1ed760';
        activityTitle.textContent = 'Listening to Spotify';
        activityTitle.style.color = '#1ed760';

        activityCover.src = data.spotify.album_art_url;
        activityCover.style.display = 'block';

        activityName.textContent = data.spotify.song;

        activityDetails.textContent = data.spotify.artist;
        activityDetails.style.display = 'block';

        activityState.style.display = 'none';
        progressContainer.style.display = 'block';
        timeContainer.style.display = 'flex';

        updateActivityProgress(data.spotify.timestamps);
    } else {
        stopActivityProgress();
        let isActivityShown = false;

        if (data.activities && data.activities.length > 0) {
            const gameStatus = data.activities.find(a => a.type === 0);
            const customStatus = data.activities.find(a => a.type === 4);

            if (gameStatus) {
                activityText = `Playing ${gameStatus.name}`;
                isActivityShown = true;

                if (activityPlayer) activityPlayer.style.display = 'flex';

                activityIcon.className = 'ph-fill ph-game-controller';
                activityIcon.style.color = 'var(--text-secondary)';
                activityTitle.textContent = 'Playing a game';
                activityTitle.style.color = 'var(--text-secondary)';

                if (gameStatus.assets && gameStatus.assets.large_image) {
                    let imageUrl = gameStatus.assets.large_image;
                    if (imageUrl.startsWith('mp:external/')) {
                        imageUrl = imageUrl.replace('mp:external/', 'https://media.discordapp.net/external/');
                    } else {
                        imageUrl = `https://cdn.discordapp.com/app-assets/${gameStatus.application_id}/${imageUrl}.png`;
                    }
                    activityCover.src = imageUrl;
                    activityCover.style.display = 'block';
                } else {
                    activityCover.style.display = 'none';
                }

                activityName.textContent = gameStatus.name;

                if (gameStatus.details) {
                    activityDetails.textContent = gameStatus.details;
                    activityDetails.style.display = 'block';
                } else {
                    activityDetails.style.display = 'none';
                }

                if (gameStatus.state) {
                    activityState.textContent = gameStatus.state;
                    activityState.style.display = 'block';
                } else {
                    activityState.style.display = 'none';
                }

                progressContainer.style.display = 'none';

                if (gameStatus.timestamps && gameStatus.timestamps.start) {
                    timeContainer.style.display = 'flex';
                    timeContainer.style.justifyContent = 'flex-start';
                    updateActivityElapsed(gameStatus.timestamps.start);
                } else {
                    timeContainer.style.display = 'none';
                }
            } else if (customStatus && customStatus.state) {
                activityText = customStatus.state;
            }
        }

        if (!isActivityShown && activityPlayer) {
            activityPlayer.style.display = 'none';
        }
    }

    lanyardActivity.textContent = activityText;
}

// Update activity progress bar if available
let activityInterval;
function updateActivityProgress(timestamps) {
    clearInterval(activityInterval);
    const start = timestamps.start;
    const end = timestamps.end;
    const totalDuration = end - start;

    const progressEl = document.getElementById('activity-progress-bar');
    const timeCurrentEl = document.getElementById('activity-time-current');
    const timeTotalEl = document.getElementById('activity-time-total');

    document.getElementById('activity-time').style.justifyContent = 'space-between';
    if (timeTotalEl) timeTotalEl.style.display = 'block';

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    if (timeTotalEl) timeTotalEl.textContent = formatTime(totalDuration);

    activityInterval = setInterval(() => {
        const now = new Date().getTime();
        let current = now - start;
        if (current > totalDuration) current = totalDuration;
        if (current < 0) current = 0;

        const percentage = (current / totalDuration) * 100;
        if (progressEl) progressEl.style.width = `${percentage}%`;
        if (timeCurrentEl) timeCurrentEl.textContent = formatTime(current);

        if (current >= totalDuration) {
            clearInterval(activityInterval);
        }
    }, 1000);

    const initialNow = new Date().getTime();
    let initialCurrent = initialNow - start;
    if (initialCurrent < 0) initialCurrent = 0;
    const initialPercentage = (initialCurrent / totalDuration) * 100;
    if (progressEl) progressEl.style.width = `${initialPercentage}%`;
    if (timeCurrentEl) timeCurrentEl.textContent = formatTime(initialCurrent);
}

function updateActivityElapsed(start) {
    clearInterval(activityInterval);
    const timeCurrentEl = document.getElementById('activity-time-current');
    const timeTotalEl = document.getElementById('activity-time-total');

    if (timeTotalEl) timeTotalEl.style.display = 'none';

    function formatElapsed(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} elapsed`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} elapsed`;
    }

    activityInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - start;
        if (timeCurrentEl) timeCurrentEl.textContent = formatElapsed(elapsed);
    }, 1000);

    const initialNow = new Date().getTime();
    const initialElapsed = initialNow - start;
    if (timeCurrentEl) timeCurrentEl.textContent = formatElapsed(initialElapsed);
}

function stopActivityProgress() {
    clearInterval(activityInterval);
}
connectLanyard();

async function updateViewCounter() {
    try {
        const namespace = typeof CONFIG !== 'undefined' && CONFIG.counterNamespace ? CONFIG.counterNamespace : 'SEMIII';
        const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/visits/up`);
        const data = await response.json();

        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement && data.count) {
            viewCountElement.textContent = data.count.toLocaleString();
        }
    } catch (error) {
        console.error('Gagal memuat view counter:', error);
        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement) viewCountElement.textContent = "0";
    }
}
updateViewCounter();

// Starfall
if (typeof CONFIG !== 'undefined' && CONFIG.enableStarfall) {
    const interval = CONFIG.starfallInterval !== undefined ? CONFIG.starfallInterval : 1000;
    const chance = CONFIG.starfallChance !== undefined ? CONFIG.starfallChance : 1;

    setInterval(() => {
        if (Math.random() < chance) {
            createShootingStar();
        }
    }, interval);
}

function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Random position within viewport
    const startX = Math.random() * (window.innerWidth * 1.5);
    const startY = Math.random() * -(window.innerHeight * 0.8);

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    const bgContainer = document.querySelector('.bg-container');
    if (bgContainer) {
        bgContainer.appendChild(star);
        setTimeout(() => {
            star.remove();
        }, 5000); // ms
    }
}

// Constellations data
const constellationsData = {
    'ursa_major': {
        name: 'Ursa Major',
        viewBox: '0 0 300 300',
        textOffset: '-80px', // Pull the text much closer
        points: [
            { ra: 13.79, dec: 49.31 },
            { ra: 13.39, dec: 54.92 },
            { ra: 12.90, dec: 55.95 },
            { ra: 12.25, dec: 57.03 },
            { ra: 11.89, dec: 53.69 },
            { ra: 11.03, dec: 56.38 },
            { ra: 11.06, dec: 61.75 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
    },
    'cassiopeia': {
        name: 'Cassiopeia',
        viewBox: '0 0 300 300',
        points: [
            { ra: 0.15, dec: 59.15 },
            { ra: 0.67, dec: 56.53 },
            { ra: 0.94, dec: 60.71 },
            { ra: 1.43, dec: 60.23 },
            { ra: 1.90, dec: 63.67 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    'lyra': {
        name: 'Lyra',
        viewBox: '0 0 300 300',
        points: [
            { ra: 18.61, dec: 38.78 },
            { ra: 18.74, dec: 37.60 },
            { ra: 18.90, dec: 36.96 },
            { ra: 18.98, dec: 32.68 },
            { ra: 18.83, dec: 33.36 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]]
    },
    'scorpius': {
        name: 'Scorpius',
        viewBox: '0 0 300 300',
        points: [
            { ra: 16.08, dec: -19.80 },
            { ra: 16.00, dec: -22.62 },
            { ra: 16.49, dec: -26.43 },
            { ra: 16.84, dec: -34.29 },
            { ra: 17.62, dec: -43.00 },
            { ra: 17.56, dec: -37.10 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]
    },
    'crux': {
        name: 'Crux',
        viewBox: '0 0 300 300',
        points: [
            { ra: 12.51, dec: -57.10 },
            { ra: 12.25, dec: -58.73 },
            { ra: 12.78, dec: -59.68 },
            { ra: 12.43, dec: -63.08 },
            { ra: 12.35, dec: -60.40 }
        ],
        lines: [[0, 3], [1, 2]]
    },
    'orion': {
        name: 'Orion',
        viewBox: '0 0 300 300',
        points: [
            { ra: 5.91, dec: 7.40 },
            { ra: 5.41, dec: 6.33 },
            { ra: 5.66, dec: -1.93 },
            { ra: 5.60, dec: -1.20 },
            { ra: 5.53, dec: -0.28 },
            { ra: 5.78, dec: -9.66 },
            { ra: 5.23, dec: -8.20 },
            { ra: 5.58, dec: -5.90 }
        ],
        lines: [
            [0, 2], [1, 4],
            [2, 3], [3, 4],
            [2, 5], [4, 6],
            [3, 7]
        ]
    }
};

function drawConstellation(type) {
    const data = constellationsData[type];
    if (!data) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "constellation-wrapper");

    // Randomize Position anywhere on the screen!
    if (window.innerWidth > 768) {
        const randomTop = Math.floor(10 + Math.random() * 50);
        const isRightSide = Math.random() > 0.5;
        let randomLeft;

        if (isRightSide) {
            randomLeft = Math.floor(65 + Math.random() * 10); //
        } else {
            randomLeft = Math.floor(10 + Math.random() * 10); //
        }

        wrapper.style.top = `${randomTop}%`;
        wrapper.style.left = `${randomLeft}%`;
        wrapper.style.right = 'auto';
    } else {
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.right = '';
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "c-svg");
    svg.setAttribute("viewBox", "0 0 300 300");

    // Randomize size menggunakan pengaturan dari file config
    const minSize = typeof CONFIG !== 'undefined' && CONFIG.constellationMinSize !== undefined ? CONFIG.constellationMinSize : 120;
    const maxSize = typeof CONFIG !== 'undefined' && CONFIG.constellationMaxSize !== undefined ? CONFIG.constellationMaxSize : 170;
    const randomSize = Math.floor(minSize + Math.random() * (maxSize - minSize + 1));
    svg.style.width = `${randomSize}%`;

    //
    const padding = 40;
    const size = 300;

    // 1 RA = 15 degrees. Convert RA to degrees to match Dec scale.
    const pointsDeg = data.points.map(p => ({ ra: p.ra * 15, dec: p.dec }));

    let minRA = Infinity, maxRA = -Infinity, minDec = Infinity, maxDec = -Infinity;
    pointsDeg.forEach(p => {
        if (p.ra < minRA) minRA = p.ra;
        if (p.ra > maxRA) maxRA = p.ra;
        if (p.dec < minDec) minDec = p.dec;
        if (p.dec > maxDec) maxDec = p.dec;
    });

    const rangeRA = maxRA - minRA || 1;
    const rangeDec = maxDec - minDec || 1;

    // Calculate scale to preserve aspect ratio
    const scale = (size - padding * 2) / Math.max(rangeRA, rangeDec);

    // Calculate offset to center the constellation in the SVG
    const offsetX = padding + ((size - padding * 2) - (rangeRA * scale)) / 2;
    const offsetY = padding + ((size - padding * 2) - (rangeDec * scale)) / 2;

    // Calculate X and Y coordinates
    const projectedPoints = pointsDeg.map(p => {
        const x = offsetX + ((maxRA - p.ra) * scale);
        const y = offsetY + ((maxDec - p.dec) * scale);
        return [x, y];
    });

    // Draw lines
    data.lines.forEach(pair => {
        const line = document.createElementNS(svgNS, "line");
        const p1 = projectedPoints[pair[0]];
        const p2 = projectedPoints[pair[1]];
        line.setAttribute("x1", p1[0]);
        line.setAttribute("y1", p1[1]);
        line.setAttribute("x2", p2[0]);
        line.setAttribute("y2", p2[1]);
        line.setAttribute("class", "c-line");

        // Calculate line length for animation
        const length = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
        line.style.setProperty('--line-length', length);

        // Random stagger to draw naturally
        line.style.animationDelay = `${Math.random() * 1.5}s`;

        svg.appendChild(line);
    });

    // Draw stars
    projectedPoints.forEach((point, index) => {
        const isMajor = index === 0 || index === 1;
        const randomDelay = `${Math.random() * 3}s`; // Random stagger for stars

        // Outer glow
        const glowOuter = document.createElementNS(svgNS, "circle");
        glowOuter.setAttribute("cx", point[0]);
        glowOuter.setAttribute("cy", point[1]);
        glowOuter.setAttribute("r", isMajor ? "14" : "8");
        glowOuter.setAttribute("fill", "rgba(167, 216, 255, 0.08)");
        glowOuter.setAttribute("class", "c-glow");
        glowOuter.style.animationDelay = randomDelay;
        svg.appendChild(glowOuter);

        // Inner glow
        const glowMid = document.createElementNS(svgNS, "circle");
        glowMid.setAttribute("cx", point[0]);
        glowMid.setAttribute("cy", point[1]);
        glowMid.setAttribute("r", isMajor ? "8" : "5");
        glowMid.setAttribute("fill", "rgba(167, 216, 255, 0.2)");
        glowMid.setAttribute("class", "c-glow");
        glowMid.style.animationDelay = randomDelay;
        svg.appendChild(glowMid);

        // Star
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", point[0]);
        circle.setAttribute("cy", point[1]);
        circle.setAttribute("r", isMajor ? "3" : "1.5");
        circle.setAttribute("fill", "#ffffff");
        circle.setAttribute("class", "c-star");
        circle.style.animationDelay = randomDelay;
        svg.appendChild(circle);
    });

    wrapper.appendChild(svg);

    // Draw label
    const text = document.createElement("div");
    text.setAttribute("class", "c-text-html");
    text.textContent = data.name;

    // Apply custom text offset if specified in constellation data
    if (data.textOffset) {
        const baseOffset = parseFloat(data.textOffset);
        const scaleFactor = randomSize / 100;
        text.style.marginTop = `${baseOffset * scaleFactor}px`;
    }

    wrapper.appendChild(text);

    const bgContainer = document.querySelector('.bg-container');
    if (bgContainer) {
        const oldWrapper = bgContainer.querySelector('.constellation-wrapper');
        if (oldWrapper) oldWrapper.remove();

        bgContainer.appendChild(wrapper);
    }
}

// Fetch location
fetch('https://get.geojs.io/v1/ip/geo.json')
    .then(res => res.json())
// LOCATION & CONSTELLATION LOGIC
const cachedLat = localStorage.getItem('user_latitude');
const currentMonth = new Date().getMonth(); // Jan - Dec

function determineConstellation(lat) {
    let constellation = 'orion';

    if (lat > 20) {
        // Northern Hemisphere
        if (currentMonth >= 2 && currentMonth <= 4) constellation = 'ursa_major';
        else if (currentMonth >= 5 && currentMonth <= 7) constellation = 'lyra';
        else if (currentMonth >= 8 && currentMonth <= 10) constellation = 'cassiopeia';
        else constellation = 'orion';
    } else if (lat < -20) {
        // Southern Hemisphere
        if (currentMonth >= 2 && currentMonth <= 4) constellation = 'crux';
        else if (currentMonth >= 5 && currentMonth <= 7) constellation = 'scorpius';
        else if (currentMonth >= 8 && currentMonth <= 10) constellation = 'crux';
        else constellation = 'orion';
    } else {
        // Equator Hemisphere.
        if (currentMonth >= 2 && currentMonth <= 6) constellation = 'ursa_major';
        else if (currentMonth >= 7 && currentMonth <= 9) constellation = 'scorpius';
        else constellation = 'orion';
    }

    return constellation;
}

function initConstellation() {
    // when cached, use cached value; otherwise, fetch API and save to localStorage
    if (typeof CONFIG !== 'undefined' && CONFIG.enableConstellation) {
        if (cachedLat) {
            drawConstellation(determineConstellation(parseFloat(cachedLat)));
        } else {
            // Fetch API to get user's latitude and save to localStorage
            fetch('https://ipapi.co/json/')
                .then(response => {
                    if (!response.ok) throw new Error('API Rate limit / Error');
                    return response.json();
                })
                .then(data => {
                    const lat = parseFloat(data.latitude);
                    localStorage.setItem('user_latitude', lat); // Save latitude to localStorage
                    drawConstellation(determineConstellation(lat));
                })
                .catch(err => {
                    console.error("Gagal mendeteksi lokasi:", err);
                    drawConstellation(determineConstellation(0)); // Fallback to equator if API fails
                });
        }
    }
}

document.addEventListener('contextmenu', event => {
    if (event.target.tagName.toLowerCase() === 'canvas') {
        event.preventDefault();
    }
});

// zerogravity
let isFloating = false;
let isAnimatingGravity = false;

function showToast(message) {
    // Prevent overlapping toasts by removing existing ones
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function toggleZeroGravity() {
    if (isAnimatingGravity) return; // Prevent spamming
    isAnimatingGravity = true;

    isFloating = !isFloating;

    // Cooldown
    setTimeout(() => {
        isAnimatingGravity = false;
    }, 700);

    const elements = document.querySelectorAll('.profile-header-horizontal, .activity-player, .social-links-flat, .view-counter-flat, .local-player-flat, .location-pin, .volume-container, .constellation-wrapper');

    if (isFloating) {
        elements.forEach(el => {
            el.style.transition = ''; // Clean up any lingering inline transitions

            if (el.vanillaTilt) {
                const currentDisplay = window.getComputedStyle(el).display;
                el.vanillaTilt.destroy();
                if (currentDisplay !== 'none') {
                    el.style.display = currentDisplay;
                }
            }

            el.querySelectorAll('.js-tilt-glare').forEach(g => g.remove());

            el.classList.add('zero-gravity-float');
            const randomDuration = 3 + Math.random() * 5;
            el.style.setProperty('animation-duration', `${randomDuration}s`, 'important');
        });

        showToast('<i class="ph-fill ph-warning"></i> SYSTEM WARNING');
    } else {
        elements.forEach(el => {
            // Smoothly transition back from animation state
            const computedStyle = window.getComputedStyle(el);
            const currentTransform = computedStyle.transform;

            // Freeze current transform
            el.style.transform = currentTransform !== 'none' ? currentTransform : '';
            el.classList.remove('zero-gravity-float');
            el.style.removeProperty('animation-duration');

            // Temporarily apply transition
            el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

            void el.offsetWidth;

            el.style.transform = '';

            setTimeout(() => {
                el.style.transition = '';
                if (!isFloating && el.hasAttribute('data-tilt') && window.VanillaTilt) {
                    if (el.vanillaTilt) el.vanillaTilt.destroy(); // Prevent duplicates
                    el.querySelectorAll('.js-tilt-glare').forEach(g => g.remove());
                    VanillaTilt.init(el);
                }
            }, 600);
        });

        showToast('<i class="ph-fill ph-warning"></i> GRAVITY RESTORED');
    }
}

const avatarTrigger = document.querySelector('.avatar');
if (avatarTrigger && typeof CONFIG !== 'undefined' && CONFIG.enableEasterEgg) {
    avatarTrigger.style.cursor = 'crosshair';
    avatarTrigger.addEventListener('click', () => {
        toggleZeroGravity();
    });
}

// Console hint
if (typeof CONFIG !== 'undefined' && CONFIG.enableEasterEgg) {
    setTimeout(() => {
        console.log(
            "%c[SYSTEM WARNING]%c The gravity around the profile picture seems highly unstable... %c(Click it)",
            "color: #09090b; background: #a3e635; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
            "color: #a1a1aa; font-style: italic; padding-left: 8px;",
            "color: #f4f4f5; font-weight: bold; text-decoration: underline;"
        );
    }, 2000);
}
