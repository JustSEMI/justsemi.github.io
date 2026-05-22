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
    const greetingText = document.getElementById('greeting-text');
    const roles = ["IoT Developer", "Laravel 13 & Frontend Dev", "Computer Engineering Student"];
    const roleTextElement = document.getElementById('hero-badge-text');
    
    const playlist = [
        'assets/audio/Glory.webm',
        'assets/audio/Rainbows.webm',
    ];

    const randomTrackIndex = Math.floor(Math.random() * playlist.length);
    const selectedTrack = playlist[randomTrackIndex];

    window.music = new Audio(selectedTrack);
    window.music.loop = true;
    window.music.volume = 0.3;

    // Spotify Widget Elements
    const spotifyWidget = document.getElementById('spotify-widget');
    const spotifyPlayBtn = document.getElementById('spotify-play-btn');
    const playIcon = document.getElementById('spotify-play-icon');
    const pauseIcon = document.getElementById('spotify-pause-icon');
    const spotifyTitle = document.getElementById('spotify-title');
    const spotifyArtist = document.getElementById('spotify-artist');

    // Update track details in Spotify widget
    const updateSpotifyWidget = () => {
        if (!spotifyTitle || !spotifyArtist) return;
        const filename = selectedTrack.substring(selectedTrack.lastIndexOf('/') + 1);
        const trackTitle = filename.replace('.webm', '').replace('%20', ' ');
        spotifyTitle.textContent = trackTitle;
        spotifyArtist.textContent = "JustSEMI's Choice";
    };

    updateSpotifyWidget();

    // Toggle play/pause
    if (spotifyPlayBtn) {
        spotifyPlayBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play().catch(err => console.log("Playback prevented:", err));
            } else {
                music.pause();
            }
        });
    }

    // Sync play state to UI
    music.addEventListener('play', () => {
        if (spotifyWidget) spotifyWidget.classList.add('is-playing');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    });

    music.addEventListener('pause', () => {
        if (spotifyWidget) spotifyWidget.classList.remove('is-playing');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });

    // Greetings Splash Screen Animation
    const greetings = ["Bluezex", "Oprexzzz", "JustSEMI"];
    let greetingIndex = 0;

    function cycleGreetings() {
        if (!greetingText || !preloader) return;
        
        if (greetingIndex < greetings.length) {
            greetingText.classList.remove('active');
            setTimeout(() => {
                greetingText.innerHTML = `<span>•</span> ${greetings[greetingIndex]}`;
                greetingText.classList.add('active');
                
                // Update progress bar
                const progressBar = document.getElementById('preloader-bar');
                if (progressBar) {
                    const progress = ((greetingIndex + 1) / greetings.length) * 100;
                    progressBar.style.width = `${progress}%`;
                }
                
                greetingIndex++;
                setTimeout(cycleGreetings, 280);
            }, 120);
        } else {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1200);
                sessionStorage.setItem('systemInitialized', 'true');
            }, 400);
        }
    }

    if (sessionStorage.getItem('systemInitialized') === 'true') {
        if (preloader) preloader.style.display = 'none';
    } else {
        // Start greeting cycle
        if (greetingText) {
            greetingText.classList.add('active');
            const progressBar = document.getElementById('preloader-bar');
            if (progressBar) {
                progressBar.style.width = `${(1 / greetings.length) * 100}%`;
            }
            setTimeout(cycleGreetings, 350);
        }
    }

    // Rotating Hero Titles
    let roleIndex = 0;
    function rotateRoleText() {
        if (!roleTextElement) return;
        
        roleTextElement.style.opacity = 0;
        roleTextElement.style.transform = 'translateY(-8px)';
        
        setTimeout(() => {
            roleIndex = (roleIndex + 1) % roles.length;
            roleTextElement.textContent = roles[roleIndex];
            
            roleTextElement.style.opacity = 1;
            roleTextElement.style.transform = 'translateY(0)';
            
            setTimeout(rotateRoleText, 3500);
        }, 300);
    }

    if (roleTextElement) {
        roleTextElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        roleTextElement.style.display = 'inline-block';
        setTimeout(rotateRoleText, 3500);
    }

    // Visibility and focus sync
    let wasPlayingBeforeBlur = false;

    const pauseMusic = () => {
        if (!music.paused) {
            wasPlayingBeforeBlur = true;
            music.pause();
        } else {
            wasPlayingBeforeBlur = false;
        }
    };

    const playMusic = () => {
        if (wasPlayingBeforeBlur) {
            music.play().catch(error => console.log("Autoplay prevented on resume."));
        }
    };

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