//SYSTEM INITIALIZATION & UTILS
// Init Lenis (Smooth Scroll)
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

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Prevent Context Menu on canvas
document.addEventListener('contextmenu', event => {
    if (event.target.tagName.toLowerCase() === 'canvas') {
        event.preventDefault();
    }
});

// Toast Utility
function showToast(message) {
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

// Fetch user location API globally
fetch('https://get.geojs.io/v1/ip/geo.json')
    .then(res => res.json())
    .catch(() => { }); // Silent catch

// SOCIAL MEDIA LINKS
if (typeof CONFIG !== 'undefined' && CONFIG.socialLinks) {
    const socialContainer = document.getElementById('social-links-container');
    if (socialContainer) {
        socialContainer.innerHTML = '';
        CONFIG.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.className = 'social-btn-flat';
            a.title = link.name;
            const i = document.createElement('i');
            i.className = link.icon;
            a.appendChild(i);
            socialContainer.appendChild(a);
        });
    }
}

// TIMEZONE WIDGET
if (typeof CONFIG !== 'undefined' && CONFIG.enableTimezoneWidget) {
    const tzWidget = document.getElementById('timezone-widget');
    const tzTime = document.getElementById('timezone-time');
    if (tzWidget && tzTime) {
        tzWidget.style.display = 'flex';
        setInterval(() => {
            const now = new Date();
            tzTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    }
}

// TAB TITLE ANIMATION
if (typeof CONFIG !== 'undefined' && CONFIG.enableTabTitleAnimation) {
    const tabTitleText = CONFIG.tabTitleText || "whoami";
    let tabTitleIndex = 1;
    let isTabTyping = true;

    function animateTabTitle() {
        const typeSpeed = CONFIG.tabTitleTypingSpeed || 250;
        const deleteSpeed = CONFIG.tabTitleDeletingSpeed || 100;
        const pauseDuration = CONFIG.tabTitlePauseDuration || 3000;

        if (isTabTyping) {
            document.title = tabTitleText.substring(0, tabTitleIndex) + "_";
            tabTitleIndex++;
            if (tabTitleIndex > tabTitleText.length) {
                isTabTyping = false;
                document.title = tabTitleText; // deleted text
                setTimeout(animateTabTitle, pauseDuration); // hold for 3 seconds
                return;
            }
            setTimeout(animateTabTitle, typeSpeed); // typing speed
        } else {
            document.title = tabTitleText.substring(0, tabTitleIndex) + "_";
            tabTitleIndex--;
            if (tabTitleIndex === 0) {
                isTabTyping = true;
            }
            setTimeout(animateTabTitle, deleteSpeed); // deleted speed
        }
    }

    // Start animation
    setTimeout(animateTabTitle, 1000);
}

// ENTER SCREEN & TERMINAL
const enterScreen = document.getElementById('enter-screen');
const mainContent = document.querySelector('.main-content');
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
setTimeout(typeTerminal, 600);

// Enter screen click event
if (enterScreen && mainContent) {
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

        // Trigger Zero Gravity randomly based on config chance
        if (typeof CONFIG !== 'undefined' && typeof CONFIG.zeroGravityChance === 'number') {
            if (Math.random() <= CONFIG.zeroGravityChance) {
                if (typeof toggleZeroGravity === 'function') toggleZeroGravity();
            }
        }

        // Play background audio
        if (typeof bgAudio !== 'undefined') {
            bgAudio.play().then(() => {
                if (typeof initVisualizer === 'function') initVisualizer();
                if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                const playPauseBtn = document.getElementById('play-pause-btn');
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
            }).catch(e => console.log("Audio play failed:", e));
        }

        // Start typewriter effect
        if (typeof isTyping !== 'undefined' && !isTyping) {
            isTyping = true;
            setTimeout(typeWriter, 500);
        }
    });
}

// TYPEWRITER EFFECT
const bioTexts = typeof CONFIG !== 'undefined' && CONFIG.bioTexts ? CONFIG.bioTexts : [];
const typewriterElement = document.getElementById('typewriter');
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isTyping = false;

function typeWriter() {
    if (!typewriterElement || bioTexts.length === 0) return;

    const currentText = bioTexts[textIndex];
    let typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.typingSpeed !== undefined ? CONFIG.typingSpeed : 50;

    if (isDeleting) {
        charIndex--;
        typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.deletingSpeed !== undefined ? CONFIG.deletingSpeed : 30;
    } else {
        charIndex++;
    }

    let textToShow = currentText.substring(0, charIndex);
    typewriterElement.innerHTML = textToShow.replace(/\n/g, '<br>');

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typeSpeed = typeof CONFIG !== 'undefined' && CONFIG.pauseDuration !== undefined ? CONFIG.pauseDuration : 5000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        let nextIndex = textIndex;
        if (bioTexts.length > 1) {
            while (nextIndex === textIndex) {
                nextIndex = Math.floor(Math.random() * bioTexts.length);
            }
        }
        textIndex = nextIndex;
        typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
}

// AUDIO PLAYER & VISUALIZER
const PLAYLIST = typeof CONFIG !== 'undefined' && CONFIG.playlist ? CONFIG.playlist : [];
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
    if (shuffledPlaylist.length === 0) return;
    const songPath = shuffledPlaylist[index];
    bgAudio.src = songPath;

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
loadSong(currentSongIndex);

bgAudio.addEventListener('ended', playNextSong);

function playNextSong() {
    if (shuffledPlaylist.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
    loadSong(currentSongIndex);
    bgAudio.play().catch(e => console.log(e));
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
}

function playPrevSong() {
    if (shuffledPlaylist.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
    loadSong(currentSongIndex);
    bgAudio.play().catch(e => console.log(e));
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
}

const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

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
if (prevBtn) prevBtn.addEventListener('click', playPrevSong);
if (nextBtn) nextBtn.addEventListener('click', playNextSong);

// Audio visualizer
let audioCtx, analyser, dataArray, visualizerBars = [];
let audioSourceConnected = false;
let canvasVisualizerCtx = null;
let avatarCanvas = null;

function initVisualizer() {
    if (audioSourceConnected) return;
    if (window.location.protocol === 'file:') return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaElementSource(bgAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const style = typeof CONFIG !== 'undefined' && CONFIG.visualizerStyle ? CONFIG.visualizerStyle : 'bar';
    const showCircle = style === 'circle' || style === 'both';
    const showBar = style === 'bar' || style === 'both';

    if (showCircle) {
        avatarCanvas = document.getElementById('avatar-visualizer');
        if (avatarCanvas) {
            avatarCanvas.style.display = 'block';
            avatarCanvas.width = 320;
            avatarCanvas.height = 320;
            canvasVisualizerCtx = avatarCanvas.getContext('2d');
        }
    } else {
        avatarCanvas = document.getElementById('avatar-visualizer');
        if (avatarCanvas) avatarCanvas.style.display = 'none';
    }

    if (showBar) {
        const visualizerContainer = document.getElementById('audio-visualizer');
        if (visualizerContainer) {
            visualizerContainer.style.display = 'flex';
            visualizerContainer.innerHTML = '';
            let numBars = typeof CONFIG !== 'undefined' && CONFIG.visualizerBarsCount !== undefined ? CONFIG.visualizerBarsCount : 10;
            if (numBars > 40) numBars = 40; // Batasi maksimal bar agar tidak merusak layout
            for (let i = 0; i < numBars; i++) {
                const bar = document.createElement('div');
                bar.className = 'visualizer-bar';
                visualizerContainer.appendChild(bar);
                visualizerBars.push(bar);
            }
        }
    } else {
        const visualizerContainer = document.getElementById('audio-visualizer');
        if (visualizerContainer) visualizerContainer.style.display = 'none';
    }

    audioSourceConnected = true;
    requestAnimationFrame(updateVisualizer);
}

function updateVisualizer() {
    if (!audioCtx) return;
    analyser.getByteFrequencyData(dataArray);

    const style = typeof CONFIG !== 'undefined' && CONFIG.visualizerStyle ? CONFIG.visualizerStyle : 'bar';
    const isMobile = window.innerWidth <= 768; // Deteksi perangkat mobile
    const showCircle = (style === 'circle' || style === 'both') && !isMobile;
    const showBar = style === 'bar' || style === 'both';

    if (canvasVisualizerCtx && avatarCanvas) {
        canvasVisualizerCtx.clearRect(0, 0, avatarCanvas.width, avatarCanvas.height);
    }

    if (showCircle && canvasVisualizerCtx && avatarCanvas) {

        const centerX = avatarCanvas.width / 2;
        const centerY = avatarCanvas.height / 2;

        // Bass pulse ambil rata-rata frekuensi terendah
        let bassSum = 0;
        for (let i = 0; i < 5; i++) {
            bassSum += dataArray[i];
        }
        const bassAvg = bassSum / 5;
        const pulseRadius = 72 + (bassAvg / 255) * 8; // Denyut dasar ring

        const isSymmetric = typeof CONFIG !== 'undefined' && CONFIG.visualizerSymmetric !== undefined ? CONFIG.visualizerSymmetric : true;

        let numBars = typeof CONFIG !== 'undefined' && CONFIG.visualizerBarsCount !== undefined ? CONFIG.visualizerBarsCount : 128;
        if (isSymmetric && numBars % 2 !== 0) numBars += 1; // WAJIB genap agar bisa dibagi 2 dengan pas
        if (numBars < 64) numBars = 128; // Resolusi tinggi agar garisnya mulus

        const barWidth = (2 * Math.PI) / numBars;
        const limitBars = isSymmetric ? numBars / 2 : numBars;

        // Fokus pada 50% frekuensi awal agar lebih rapi dan responsif ke irama
        const activeBins = Math.floor(dataArray.length * 0.5);
        const step = Math.max(1, Math.floor(activeBins / limitBars));

        // Pengaturan gaya garis
        canvasVisualizerCtx.shadowBlur = 15;
        canvasVisualizerCtx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        canvasVisualizerCtx.lineWidth = 3.5;
        canvasVisualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        canvasVisualizerCtx.lineJoin = 'round';
        canvasVisualizerCtx.beginPath();

        for (let i = 0; i <= numBars; i++) {
            const currentI = i === numBars ? 0 : i; // Tutup loop dengan mulus

            // Logika pencerminan
            let dataIndex;
            if (isSymmetric) {
                dataIndex = currentI < limitBars ? currentI : numBars - 1 - currentI;
            } else {
                dataIndex = currentI;
            }

            const value = dataArray[dataIndex * step] || 0;

            // Rumus eksponensial
            let barHeight = Math.pow(value / 255, 1.8) * 30; // atau (value / 255) * 30 tapi noise
            //let barHeight = (value / 255) * 30

            // if (dataIndex < limitBars * 0.2) {
            //     barHeight *= 1.2; 
            // }

            const angle = currentI * barWidth - Math.PI / 2;
            const finalRadius = pulseRadius + barHeight;

            const x = centerX + Math.cos(angle) * finalRadius;
            const y = centerY + Math.sin(angle) * finalRadius;

            if (i === 0) {
                canvasVisualizerCtx.moveTo(x, y);
            } else {
                canvasVisualizerCtx.lineTo(x, y);
            }
        }

        canvasVisualizerCtx.closePath();
        canvasVisualizerCtx.stroke();
        // Fill dihapus karena membuat efek putih berantakan di belakang avatar
    }

    if (showBar) {
        const numBars = visualizerBars.length;
        for (let i = 0; i < numBars; i++) {
            const value = dataArray[i + 2];
            const height = Math.max(3, (value / 255) * 18);
            if (visualizerBars[i]) {
                visualizerBars[i].style.height = `${height}px`;
                visualizerBars[i].style.boxShadow = 'none';
                visualizerBars[i].style.opacity = '1';
            }
        }
    }
    requestAnimationFrame(updateVisualizer);
}

// Volume Controls
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

function updateVolumeSliderUI(vol) {
    if (volumeSlider) {
        const percent = vol * 100;
        volumeSlider.style.background = `linear-gradient(to right, #fff ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%)`;
    }
}

if (volumeSlider) {
    updateVolumeSliderUI(volumeSlider.value);
    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value;
        bgAudio.volume = vol;
        bgAudio.muted = false;
        updateMuteIcon(vol, bgAudio.muted);
        updateVolumeSliderUI(vol);
    });
}

// Progress Bar
const localProgressBar = document.getElementById('local-progress-bar');
const localProgressContainer = document.getElementById('local-progress-container');
const localTimeDisplay = document.getElementById('local-time');

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

// DISCORD LANYARD API
const DISCORD_USER_ID = typeof CONFIG !== 'undefined' && CONFIG.discordUserId ? CONFIG.discordUserId : '773408954352009216';
const lanyardAvatar = document.getElementById('lanyard-avatar');
const lanyardStatus = document.getElementById('lanyard-status');
const lanyardUsername = document.getElementById('lanyard-username');
const lanyardActivity = document.getElementById('lanyard-activity');

if (lanyardAvatar && typeof CONFIG !== 'undefined' && CONFIG.fallbackAvatar) {
    lanyardAvatar.src = CONFIG.fallbackAvatar;
}

function connectLanyard() {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    ws.onopen = () => {
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: DISCORD_USER_ID }
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.op === 0) {
            updateDiscordCard(data.d);
        }
    };

    ws.onclose = () => {
        setTimeout(connectLanyard, 5000);
    };
}

function updateDiscordCard(data) {
    const user = data.discord_user;
    const useDiscordAvatar = typeof CONFIG !== 'undefined' && CONFIG.useDiscordAvatar !== undefined ? CONFIG.useDiscordAvatar : true;

    if (useDiscordAvatar && user.avatar && lanyardAvatar) {
        const isGif = user.avatar.startsWith('a_');
        const ext = isGif ? 'gif' : 'png';
        lanyardAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
    }

    if (lanyardUsername) {
        lanyardUsername.textContent = '@' + user.username;
        if (user.discriminator && user.discriminator !== "0") {
            lanyardUsername.textContent += `#${user.discriminator}`;
        }
    }

    const clanTagPill = document.getElementById('clan-tag-pill');
    if (clanTagPill && user.primary_guild && user.primary_guild.tag) {
        clanTagPill.style.display = 'flex';
        const clanTagText = document.getElementById('clan-tag-text');
        if (clanTagText) clanTagText.textContent = user.primary_guild.tag;

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

    if (lanyardStatus) {
        lanyardStatus.className = 'lanyard-status-indicator';
        lanyardStatus.classList.add(data.discord_status);
    }
    if (lanyardAvatar) {
        lanyardAvatar.className = 'avatar';
        lanyardAvatar.classList.add(data.discord_status);
    }

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

    if (data.listening_to_spotify) {
        activityText = `Listening ${data.spotify.song} by ${data.spotify.artist}`;
        if (activityPlayer) activityPlayer.style.display = 'flex';

        if (activityIcon) {
            activityIcon.className = 'ph-fill ph-spotify-logo';
            activityIcon.style.color = '#1ed760';
        }
        if (activityTitle) {
            activityTitle.textContent = 'Listening to Spotify';
            activityTitle.style.color = '#1ed760';
        }
        if (activityCover) {
            activityCover.src = data.spotify.album_art_url;
            activityCover.style.display = 'block';
        }
        if (activityName) activityName.textContent = data.spotify.song;
        if (activityDetails) {
            activityDetails.textContent = data.spotify.artist;
            activityDetails.style.display = 'block';
        }
        if (activityState) activityState.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'block';
        if (timeContainer) timeContainer.style.display = 'flex';

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
                if (activityIcon) {
                    activityIcon.className = 'ph-fill ph-game-controller';
                    activityIcon.style.color = 'var(--text-secondary)';
                }
                if (activityTitle) {
                    activityTitle.textContent = 'Playing a game';
                    activityTitle.style.color = 'var(--text-secondary)';
                }

                if (gameStatus.assets && gameStatus.assets.large_image && activityCover) {
                    let imageUrl = gameStatus.assets.large_image;
                    if (imageUrl.startsWith('mp:external/')) {
                        imageUrl = imageUrl.replace('mp:external/', 'https://media.discordapp.net/external/');
                    } else {
                        imageUrl = `https://cdn.discordapp.com/app-assets/${gameStatus.application_id}/${imageUrl}.png`;
                    }
                    activityCover.src = imageUrl;
                    activityCover.style.display = 'block';
                } else if (activityCover) {
                    activityCover.style.display = 'none';
                }

                if (activityName) activityName.textContent = gameStatus.name;

                if (gameStatus.details && activityDetails) {
                    activityDetails.textContent = gameStatus.details;
                    activityDetails.style.display = 'block';
                } else if (activityDetails) {
                    activityDetails.style.display = 'none';
                }

                if (gameStatus.state && activityState) {
                    activityState.textContent = gameStatus.state;
                    activityState.style.display = 'block';
                } else if (activityState) {
                    activityState.style.display = 'none';
                }

                if (progressContainer) progressContainer.style.display = 'none';

                if (gameStatus.timestamps && gameStatus.timestamps.start && timeContainer) {
                    timeContainer.style.display = 'flex';
                    timeContainer.style.justifyContent = 'flex-start';
                    updateActivityElapsed(gameStatus.timestamps.start);
                } else if (timeContainer) {
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

    if (lanyardActivity) lanyardActivity.textContent = activityText;
}

let activityInterval;
function updateActivityProgress(timestamps) {
    clearInterval(activityInterval);
    const start = timestamps.start;
    const end = timestamps.end;
    const totalDuration = end - start;

    const progressEl = document.getElementById('activity-progress-bar');
    const timeCurrentEl = document.getElementById('activity-time-current');
    const timeTotalEl = document.getElementById('activity-time-total');
    const timeContainer = document.getElementById('activity-time');

    if (timeContainer) timeContainer.style.justifyContent = 'space-between';
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

// VIEW COUNTER
async function initViewCounter() {
    try {
        const namespace = typeof CONFIG !== 'undefined' && CONFIG.counterNamespace ? CONFIG.counterNamespace : 'SEMIII';
        const viewCountElement = document.getElementById('view-count');

        const now = Date.now();
        const lastVisit = localStorage.getItem('lastVisitTimestamp');
        const cooldown = 60 * 60 * 1000;

        if (lastVisit && (now - parseInt(lastVisit)) < cooldown) {
            const lastCount = localStorage.getItem('lastCount');
            if (viewCountElement && lastCount) {
                viewCountElement.textContent = parseInt(lastCount).toLocaleString();
            }
            return;
        }

        localStorage.setItem('lastVisitTimestamp', now.toString());
        const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/visits/up`);
        const data = await response.json();

        if (viewCountElement && data.count) {
            viewCountElement.textContent = data.count.toLocaleString();
            localStorage.setItem('lastCount', data.count);
        }
    } catch (error) {
        console.error('Failed to load view counter:', error);
        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement) {
            const lastCount = localStorage.getItem('lastCount');
            viewCountElement.textContent = lastCount ? parseInt(lastCount).toLocaleString() : "0";
        }
    }
}
initViewCounter();

// BACKGROUND EFFECTS (Starfall, Constellations, Zero Gravity)
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

    const startX = Math.random() * (window.innerWidth * 1.5);
    const startY = Math.random() * -(window.innerHeight * 0.8);

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    const bgContainer = document.querySelector('.bg-container');
    if (bgContainer) {
        bgContainer.appendChild(star);
        setTimeout(() => {
            star.remove();
        }, 5000);
    }
}

// Constellations
const constellationsData = {
    'ursa_major': {
        name: 'Ursa Major', viewBox: '0 0 300 300', textOffset: '-80px',
        points: [
            { ra: 13.79, dec: 49.31 }, { ra: 13.39, dec: 54.92 }, { ra: 12.90, dec: 55.95 },
            { ra: 12.25, dec: 57.03 }, { ra: 11.89, dec: 53.69 }, { ra: 11.03, dec: 56.38 },
            { ra: 11.06, dec: 61.75 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
    },
    'cassiopeia': {
        name: 'Cassiopeia', viewBox: '0 0 300 300',
        points: [
            { ra: 0.15, dec: 59.15 }, { ra: 0.67, dec: 56.53 }, { ra: 0.94, dec: 60.71 },
            { ra: 1.43, dec: 60.23 }, { ra: 1.90, dec: 63.67 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    'lyra': {
        name: 'Lyra', viewBox: '0 0 300 300',
        points: [
            { ra: 18.61, dec: 38.78 }, { ra: 18.74, dec: 37.60 }, { ra: 18.90, dec: 36.96 },
            { ra: 18.98, dec: 32.68 }, { ra: 18.83, dec: 33.36 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]]
    },
    'scorpius': {
        name: 'Scorpius', viewBox: '0 0 300 300',
        points: [
            { ra: 16.08, dec: -19.80 }, { ra: 16.00, dec: -22.62 }, { ra: 16.49, dec: -26.43 },
            { ra: 16.84, dec: -34.29 }, { ra: 17.62, dec: -43.00 }, { ra: 17.56, dec: -37.10 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]
    },
    'crux': {
        name: 'Crux', viewBox: '0 0 300 300',
        points: [
            { ra: 12.51, dec: -57.10 }, { ra: 12.25, dec: -58.73 }, { ra: 12.78, dec: -59.68 },
            { ra: 12.43, dec: -63.08 }, { ra: 12.35, dec: -60.40 }
        ],
        lines: [[0, 3], [1, 2]]
    },
    'orion': {
        name: 'Orion', viewBox: '0 0 300 300',
        points: [
            { ra: 5.91, dec: 7.40 }, { ra: 5.41, dec: 6.33 }, { ra: 5.66, dec: -1.93 },
            { ra: 5.60, dec: -1.20 }, { ra: 5.53, dec: -0.28 }, { ra: 5.78, dec: -9.66 },
            { ra: 5.23, dec: -8.20 }, { ra: 5.58, dec: -5.90 }
        ],
        lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [3, 7]]
    }
};

function drawConstellation(type) {
    const data = constellationsData[type];
    if (!data) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "constellation-wrapper");

    if (window.innerWidth > 768) {
        const randomTop = Math.floor(10 + Math.random() * 50);
        const isRightSide = Math.random() > 0.5;
        let randomLeft = isRightSide ? Math.floor(65 + Math.random() * 10) : Math.floor(10 + Math.random() * 10);
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

    const minSize = typeof CONFIG !== 'undefined' && CONFIG.constellationMinSize !== undefined ? CONFIG.constellationMinSize : 120;
    const maxSize = typeof CONFIG !== 'undefined' && CONFIG.constellationMaxSize !== undefined ? CONFIG.constellationMaxSize : 170;
    const randomSize = Math.floor(minSize + Math.random() * (maxSize - minSize + 1));
    svg.style.width = `${randomSize}%`;

    const padding = 40;
    const size = 300;
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
    const scale = (size - padding * 2) / Math.max(rangeRA, rangeDec);
    const offsetX = padding + ((size - padding * 2) - (rangeRA * scale)) / 2;
    const offsetY = padding + ((size - padding * 2) - (rangeDec * scale)) / 2;

    const projectedPoints = pointsDeg.map(p => [offsetX + ((maxRA - p.ra) * scale), offsetY + ((maxDec - p.dec) * scale)]);

    data.lines.forEach(pair => {
        const line = document.createElementNS(svgNS, "line");
        const p1 = projectedPoints[pair[0]];
        const p2 = projectedPoints[pair[1]];
        line.setAttribute("x1", p1[0]);
        line.setAttribute("y1", p1[1]);
        line.setAttribute("x2", p2[0]);
        line.setAttribute("y2", p2[1]);
        line.setAttribute("class", "c-line");

        const length = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
        line.style.setProperty('--line-length', length);
        line.style.animationDelay = `${Math.random() * 1.5}s`;
        svg.appendChild(line);
    });

    projectedPoints.forEach((point, index) => {
        const isMajor = index === 0 || index === 1;
        const randomDelay = `${Math.random() * 3}s`;

        const glowOuter = document.createElementNS(svgNS, "circle");
        glowOuter.setAttribute("cx", point[0]);
        glowOuter.setAttribute("cy", point[1]);
        glowOuter.setAttribute("r", isMajor ? "14" : "8");
        glowOuter.setAttribute("fill", "rgba(167, 216, 255, 0.08)");
        glowOuter.setAttribute("class", "c-glow");
        glowOuter.style.animationDelay = randomDelay;
        svg.appendChild(glowOuter);

        const glowMid = document.createElementNS(svgNS, "circle");
        glowMid.setAttribute("cx", point[0]);
        glowMid.setAttribute("cy", point[1]);
        glowMid.setAttribute("r", isMajor ? "8" : "5");
        glowMid.setAttribute("fill", "rgba(167, 216, 255, 0.2)");
        glowMid.setAttribute("class", "c-glow");
        glowMid.style.animationDelay = randomDelay;
        svg.appendChild(glowMid);

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

    const text = document.createElement("div");
    text.setAttribute("class", "c-text-html");
    text.textContent = data.name;

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

const cachedLat = localStorage.getItem('user_latitude');
const currentMonth = new Date().getMonth();

function determineConstellation(lat) {
    let constellation = 'orion';
    if (lat > 20) {
        if (currentMonth >= 2 && currentMonth <= 4) constellation = 'ursa_major';
        else if (currentMonth >= 5 && currentMonth <= 7) constellation = 'lyra';
        else if (currentMonth >= 8 && currentMonth <= 10) constellation = 'cassiopeia';
        else constellation = 'orion';
    } else if (lat < -20) {
        if (currentMonth >= 2 && currentMonth <= 4) constellation = 'crux';
        else if (currentMonth >= 5 && currentMonth <= 7) constellation = 'scorpius';
        else if (currentMonth >= 8 && currentMonth <= 10) constellation = 'crux';
        else constellation = 'orion';
    } else {
        if (currentMonth >= 2 && currentMonth <= 6) constellation = 'ursa_major';
        else if (currentMonth >= 7 && currentMonth <= 9) constellation = 'scorpius';
        else constellation = 'orion';
    }
    return constellation;
}

function initConstellation() {
    if (typeof CONFIG !== 'undefined' && CONFIG.enableConstellation) {
        if (cachedLat) {
            drawConstellation(determineConstellation(parseFloat(cachedLat)));
        } else {
            fetch('https://ipapi.co/json/')
                .then(response => {
                    if (!response.ok) throw new Error('API Rate limit / Error');
                    return response.json();
                })
                .then(data => {
                    const lat = parseFloat(data.latitude);
                    localStorage.setItem('user_latitude', lat);
                    drawConstellation(determineConstellation(lat));
                })
                .catch(err => {
                    console.error("Gagal mendeteksi lokasi:", err);
                    drawConstellation(determineConstellation(0));
                });
        }
    }
}

// zerogravity
let isFloating = false;
let isAnimatingGravity = false;

function toggleZeroGravity() {
    if (isAnimatingGravity) return;
    isAnimatingGravity = true;

    isFloating = !isFloating;

    setTimeout(() => {
        isAnimatingGravity = false;
    }, 700);

    const elements = document.querySelectorAll('.profile-header-horizontal, .activity-player, .social-links-flat, .view-counter-flat, .local-player-flat, .location-pin, .volume-container, .constellation-wrapper');

    if (isFloating) {
        elements.forEach(el => {
            el.style.transition = '';
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
    } else {
        elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const currentTransform = computedStyle.transform;

            el.style.transform = currentTransform !== 'none' ? currentTransform : '';
            el.classList.remove('zero-gravity-float');
            el.style.removeProperty('animation-duration');

            el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            void el.offsetWidth;
            el.style.transform = '';

            setTimeout(() => {
                el.style.transition = '';
                if (!isFloating && el.hasAttribute('data-tilt') && window.VanillaTilt) {
                    if (el.vanillaTilt) el.vanillaTilt.destroy();
                    el.querySelectorAll('.js-tilt-glare').forEach(g => g.remove());
                    VanillaTilt.init(el);
                }
            }, 600);
        });
    }
}

