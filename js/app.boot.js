const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target !== '#') lenis.scrollTo(target);
        if (sidebar.classList.contains('active')) sidebar.classList.remove('active');
    });
});

const navbar = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        navbar.classList.add('is-scrolled');
    } else {
        navbar.classList.remove('is-scrolled');
    }
});

const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', (e) => {
    if (!document.startViewTransition) {
        document.body.classList.toggle('dark-mode');
        return;
    }

    const x = e.clientX;
    const y = e.clientY;

    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    document.startViewTransition(() => {
        document.body.classList.toggle('dark-mode');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const startBtn = document.getElementById('start-btn');
    const muteBtn = document.getElementById('mute-toggle');
    const speakerOn = document.getElementById('speaker-on');
    const speakerOff = document.getElementById('speaker-off');
    const playlist = [
        'assets/audio/Glory.webm',
        'assets/audio/Rainbows.webm',
    ];

    const randomTrackIndex = Math.floor(Math.random() * playlist.length);
    const selectedTrack = playlist[randomTrackIndex];

    window.music = new Audio(selectedTrack);
    window.music.loop = true;
    window.music.volume = 0.3;

    const pauseMusic = () => {
        if (!music.paused) {
            music.pause();
        }
    };

    const playMusic = () => {
        if (!music.muted && sessionStorage.getItem('systemInitialized') === 'true') {
            music.play().catch(error => console.log("Menunggu USER."));
        }
    };

    if (sessionStorage.getItem('systemInitialized') === 'true') {
        preloader.style.display = 'none';
        music.muted = true;
        if (speakerOn && speakerOff) {
            speakerOn.style.display = 'none';
            speakerOff.style.display = 'block';
        }
    } else {
        startBtn.addEventListener('click', () => {
            music.play().catch(error => console.log("Autoplay dicegah."));
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 1000);
            sessionStorage.setItem('systemInitialized', 'true');
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (music.muted) {
                music.muted = false;
                music.play();
                speakerOn.style.display = 'block';
                speakerOff.style.display = 'none';
            } else {
                music.muted = true;
                speakerOn.style.display = 'none';
                speakerOff.style.display = 'block';
            }
        });
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    window.addEventListener("blur", () => {
        pauseMusic();
    });

    window.addEventListener("focus", () => {
        if (!document.hidden) {
            playMusic();
        }
    });
});

const asciiLogo = `
   _____  ______  __  __  _____ 
  / ____||  ____||  \\/  ||_   _|
 | (___  | |__   | \\  / |  | |  
  \\___ \\ |  __|  | |\\/| |  | |  
  ____) || |____ | |  | | _| |_ 
 |_____/ |______||_|  |_||_____|
`;

console.log(
    `%c${asciiLogo}`,
    "color: #00ffff; font-weight: bold; font-family: monospace; text-shadow: 0 0 10px #00ffff;"
);

console.log(
    "👋 Halo, fellow Developer! Welcome to my system.",
);

document.addEventListener('DOMContentLoaded', () => {
    const xrayTrigger = document.getElementById('xray-trigger');
    const body = document.body;
    const xrBtn = document.getElementById('xray-trigger');
    xrBtn.onclick = () => document.body.classList.toggle('xray-mode');
});