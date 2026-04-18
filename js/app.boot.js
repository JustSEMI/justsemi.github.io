document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const startBtn = document.getElementById('start-btn');
    const muteBtn = document.getElementById('mute-toggle');
    const speakerOn = document.getElementById('speaker-on');
    const speakerOff = document.getElementById('speaker-off');

    const playlist = [
        '/assets/audio/MONTAGEM_KOKORO.webm',
        '/assets/audio/HOMAGE_FUNK.webm',
    ];
    const randomTrackIndex = Math.floor(Math.random() * playlist.length);
    const selectedTrack = playlist[randomTrackIndex];
    
    const music = new Audio(selectedTrack);
    music.loop = true; 
    music.volume = 0.2; 

    if (sessionStorage.getItem('systemInitialized') === 'true') {
        preloader.style.display = 'none';
        music.muted = true;
        if (speakerOn && speakerOff) {
            speakerOn.style.display = 'none';
            speakerOff.style.display = 'block';
        }
    } else {
        startBtn.addEventListener('click', () => {
            music.play().catch(error => {
                console.log("Autoplay is HARAM.");
            });

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
});