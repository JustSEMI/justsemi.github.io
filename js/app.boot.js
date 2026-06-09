
let lenis;
if (typeof Lenis !== 'undefined') {
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
        });

        function raf(time) {
            if (lenis) lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } catch (e) {
        console.error("Failed to initialize Lenis scroll:", e);
    }
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target !== '#') {
            if (lenis) {
                lenis.scrollTo(target);
            } else {
                const targetEl = document.querySelector(target);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
});


const navbar = document.querySelector('.nav');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('is-scrolled');
        } else {
            navbar.classList.remove('is-scrolled');
        }
    });
}


const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const roles = ["IoT Developer", "Laravel 13 & Frontend Dev", "Computer Engineering Student"];
    const roleTextElement = document.getElementById('hero-badge-text');

    const playlist = [
        'assets/audio/Glory.webm',
        'assets/audio/Rainbows.webm',
    ];

    let currentTrackIndex = Math.floor(Math.random() * playlist.length);

    window.music = new Audio(playlist[currentTrackIndex]);
    window.music.loop = false;
    window.music.volume = 0.3;


    const musicWidget = document.getElementById('music-widget');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicPrevBtn = document.getElementById('music-prev-btn');
    const musicNextBtn = document.getElementById('music-next-btn');
    const musicCloseBtn = document.getElementById('music-close-btn');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const playIcon = document.getElementById('music-play-icon');
    const pauseIcon = document.getElementById('music-pause-icon');
    const musicTitle = document.getElementById('music-title');
    const musicArtist = document.getElementById('music-artist');


    const updateMusicWidget = () => {
        if (!musicTitle || !musicArtist) return;
        const trackUrl = playlist[currentTrackIndex];
        const filename = trackUrl.substring(trackUrl.lastIndexOf('/') + 1);
        const trackTitle = filename.replace('.webm', '').replace('%20', ' ');
        musicTitle.textContent = trackTitle;
        musicArtist.textContent = "JustSEMI's Choice";
    };

    updateMusicWidget();

    const changeTrack = (index) => {
        currentTrackIndex = index;
        const wasPlaying = !music.paused;

        music.src = playlist[currentTrackIndex];
        updateMusicWidget();

        if (wasPlaying) {
            music.play().catch(err => console.log("Playback prevented:", err));
        }
    };

    if (musicPlayBtn) {
        musicPlayBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play().catch(err => console.log("Playback prevented:", err));
            } else {
                music.pause();
            }
        });
    }

    if (musicPrevBtn) {
        musicPrevBtn.addEventListener('click', () => {
            const newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            const wasPlaying = !music.paused;
            changeTrack(newIndex);
            if (!wasPlaying) {
                music.play().catch(err => console.log("Playback prevented:", err));
            }
        });
    }

    if (musicNextBtn) {
        musicNextBtn.addEventListener('click', () => {
            const newIndex = (currentTrackIndex + 1) % playlist.length;
            const wasPlaying = !music.paused;
            changeTrack(newIndex);
            if (!wasPlaying) {
                music.play().catch(err => console.log("Playback prevented:", err));
            }
        });
    }

    music.addEventListener('ended', () => {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        changeTrack(nextIndex);
        music.play().catch(err => console.log("Playback prevented:", err));
    });

    if (musicCloseBtn) {
        musicCloseBtn.addEventListener('click', () => {
            if (musicWidget) musicWidget.classList.add('is-hidden');
            if (musicToggleBtn) musicToggleBtn.classList.add('is-visible');
        });
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', () => {
            if (musicWidget) musicWidget.classList.remove('is-hidden');
            if (musicToggleBtn) musicToggleBtn.classList.remove('is-visible');
        });
    }

    music.addEventListener('play', () => {
        if (musicWidget) musicWidget.classList.add('is-playing');
        if (musicToggleBtn) musicToggleBtn.classList.add('is-playing');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    });

    music.addEventListener('pause', () => {
        if (musicWidget) musicWidget.classList.remove('is-playing');
        if (musicToggleBtn) musicToggleBtn.classList.remove('is-playing');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });





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




    async function fetchWithCache(url, cacheKey, expiryMs = 15 * 60 * 1000) {
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(`${cacheKey}_time`);
        const now = Date.now();

        if (cached && cachedTime && (now - parseInt(cachedTime) < expiryMs)) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Gagal mengurai data cache:", e);
            }
        }

        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(`${cacheKey}_time`, now.toString());
                return data;
            } else if (response.status === 403 || response.status === 429) {
                console.warn(`Batas limit API tercapai. Menggunakan cache kedaluwarsa untuk ${url}`);
                if (cached) return JSON.parse(cached);
                throw new Error("Batas limit API terlampaui dan tidak ada cache tersedia");
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Gagal memuat ${url}:`, error);
            if (cached) {
                console.warn("Menggunakan cache kedaluwarsa karena kegagalan koneksi");
                return JSON.parse(cached);
            }
            throw error;
        }
    }


    async function fetchGitHubStats() {
        const username = 'JustSEMI';

        try {
            const profileData = await fetchWithCache(`https://api.github.com/users/${username}`, `github_profile_${username}`);
            const followersEl = document.getElementById('github-followers');
            const reposEl = document.getElementById('github-repos');
            if (followersEl) followersEl.textContent = profileData.followers;
            if (reposEl) reposEl.textContent = profileData.public_repos;

            const events = await fetchWithCache(`https://api.github.com/users/${username}/events/public`, `github_events_${username}`);
            const commitListContainer = document.getElementById('commits-list');
            if (commitListContainer) {
                commitListContainer.innerHTML = '';

                const pushEvents = Array.isArray(events) ? events.filter(e => e.type === 'PushEvent') : [];
                if (pushEvents.length > 0) {
                    let commitsShown = 0;
                    pushEvents.forEach(event => {
                        if (commitsShown >= 4) return;
                        const repoName = event.repo.name.replace(`${username}/`, '');
                        const timestamp = new Date(event.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        });

                        if (event.payload.commits && Array.isArray(event.payload.commits)) {
                            event.payload.commits.forEach(commit => {
                                if (commitsShown >= 4) return;

                                const commitEl = document.createElement('div');
                                commitEl.className = 'commit-item';
                                commitEl.innerHTML = `
                                    <div class="commit-meta">
                                        <span class="commit-repo">${repoName}</span>
                                        <span class="commit-date">${timestamp}</span>
                                    </div>
                                    <p class="commit-message" title="${commit.message}">${commit.message}</p>
                                `;
                                commitListContainer.appendChild(commitEl);
                                commitsShown++;
                            });
                        }
                    });

                    if (commitsShown === 0) {
                        commitListContainer.innerHTML = '<div class="no-data">Tidak ada aktivitas commit publik terbaru.</div>';
                    }
                } else {
                    commitListContainer.innerHTML = '<div class="no-data">Tidak ada aktivitas commit publik terbaru.</div>';
                }
            }

            const repos = await fetchWithCache(`https://api.github.com/users/${username}/repos?per_page=100`, `github_repos_${username}`);

            let totalStars = 0;
            let totalForks = 0;
            const languages = {};

            if (repos && Array.isArray(repos)) {
                repos.forEach(repo => {
                    if (repo.fork) return;
                    totalStars += repo.stargazers_count;
                    totalForks += repo.forks_count;

                    if (repo.language) {
                        languages[repo.language] = (languages[repo.language] || 0) + 1;
                    }
                });
            }

            const starsEl = document.getElementById('github-stars');
            const forksEl = document.getElementById('github-forks');
            if (starsEl) starsEl.textContent = totalStars;
            if (forksEl) forksEl.textContent = totalForks;

            const totalLangRepos = Object.values(languages).reduce((a, b) => a + b, 0);
            if (totalLangRepos > 0) {
                const langEntries = Object.entries(languages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4);

                const barContainer = document.getElementById('languages-bar');
                const legendContainer = document.getElementById('languages-legend');

                if (barContainer && legendContainer) {
                    barContainer.innerHTML = '';
                    legendContainer.innerHTML = '';

                    const colors = {
                        'Python': '#3572A5',
                        'C++': '#f34b7d',
                        'HTML': '#e34c26',
                        'CSS': '#563d7c',
                        'JavaScript': '#f1e05a',
                        'Lua': '#000080',
                        'PHP': '#4F5D95',
                        'C': '#555555'
                    };
                    const defaultColor = '#94a3b8';

                    langEntries.forEach(([lang, count]) => {
                        const percentage = Math.round((count / totalLangRepos) * 100);
                        const color = colors[lang] || defaultColor;

                        const segment = document.createElement('div');
                        segment.className = 'bar-segment';
                        segment.style.width = `${percentage}%`;
                        segment.style.backgroundColor = color;
                        segment.title = `${lang}: ${percentage}%`;
                        barContainer.appendChild(segment);

                        const legendItem = document.createElement('span');
                        legendItem.className = 'legend-item';
                        legendItem.innerHTML = `
                            <span class="color-dot" style="background-color: ${color}"></span>
                            ${lang} (${percentage}%)
                        `;
                        legendContainer.appendChild(legendItem);
                    });
                }
            }

            if (repos && Array.isArray(repos)) {
                document.querySelectorAll('.project-card').forEach(card => {
                    const href = card.getAttribute('href');
                    if (href && href.startsWith('https://github.com/')) {
                        const repoPath = href.replace('https://github.com/', '');
                        const parts = repoPath.split('/');
                        const repoName = parts.length > 1 ? parts[1] : null;

                        if (repoName) {
                            const repoData = repos.find(r => r && r.name && r.name.toLowerCase() === repoName.toLowerCase());
                            if (repoData) {
                                let statsRow = card.querySelector('.project-meta-stats');
                            if (!statsRow) {
                                statsRow = document.createElement('div');
                                statsRow.className = 'project-meta-stats';
                                const tagsEl = card.querySelector('.project-tags');
                                if (tagsEl) {
                                    card.insertBefore(statsRow, tagsEl);
                                } else {
                                    card.appendChild(statsRow);
                                }
                            }

                            statsRow.innerHTML = `
                                <div class="project-meta-stat" title="GitHub Stars">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    <span>${repoData.stargazers_count}</span>
                                </div>
                                <div class="project-meta-stat" title="GitHub Forks">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="18" cy="18" r="3" />
                                        <circle cx="6" cy="6" r="3" />
                                        <circle cx="6" cy="18" r="3" />
                                        <path d="M18 15V9a4 4 0 0 0-4-4H9" />
                                        <line x1="6" y1="9" x2="6" y2="15" />
                                    </svg>
                                    <span>${repoData.forks_count}</span>
                                </div>
                            `;
                            }
                        }
                    }
                });
            }

        } catch (error) {
            console.error("Gagal memuat statistik GitHub:", error);
            const commitListContainer = document.getElementById('commits-list');
            if (commitListContainer) {
                commitListContainer.innerHTML = '<div class="no-data">Gagal memuat aktivitas dari GitHub.</div>';
            }
        }
    }


    function initDiscordLanyard() {
        const DISCORD_USER_ID = '773408954352009216';
        const cardContainer = document.getElementById('discord-presence');
        if (!cardContainer) return;

        let socket = null;
        let heartbeatInterval = null;
        let fallbackTimer = null;

        function updateLanyardPresence(data) {
            if (!data) return;

            const user = data.discord_user;
            const status = data.discord_status || 'offline';
            const customStatus = data.activities ? data.activities.find(act => act.type === 4) : null;
            const activeActivities = data.activities ? data.activities.filter(act => act.type !== 4) : [];

            let avatarUrl = '';
            if (user.avatar) {
                const isGif = user.avatar.startsWith('a_');
                avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGif ? 'gif' : 'png'}?size=128`;
            } else {
                const defaultAvatarIndex = (parseInt(user.id) >> 22) % 6;
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
            }

            const username = user.global_name || user.username;
            const tagText = user.discriminator && user.discriminator !== '0' ? `#${user.discriminator}` : `@${user.username}`;

            let cardHtml = `
                <div class="discord-user-info">
                    <div class="discord-avatar-container">
                        <img class="discord-avatar" src="${avatarUrl}" alt="${username}'s Discord Avatar" />
                        <span class="discord-status-dot ${status}" title="Status: ${status}"></span>
                    </div>
                    <div class="discord-user-details">
                        <div class="discord-name-wrap">
                            <span class="discord-name">${username}</span>
                            <span class="discord-tag">${tagText}</span>
                        </div>
                        ${customStatus && customStatus.state ? `<div class="discord-custom-status">${customStatus.state}</div>` : ''}
                    </div>
                </div>
            `;

            let activityHtml = '';

            const spotify = data.spotify;
            const listeningToSpotify = data.listening_to_spotify;

            if (listeningToSpotify && spotify) {
                activityHtml = `
                    <div class="discord-activity">
                        <img class="discord-activity-art" src="${spotify.album_art_url}" alt="Album Art" />
                        <div class="discord-activity-details">
                            <span class="discord-activity-title">Mendengarkan Spotify</span>
                            <span class="discord-activity-name">${spotify.song}</span>
                            <span class="discord-activity-state">oleh ${spotify.artist}</span>
                        </div>
                    </div>
                `;
            } else if (activeActivities.length > 0) {
                const activity = activeActivities[0];
                let activityArt = 'https://lanyard.eggsy.xyz/assets/discord.svg';

                if (activity.assets && activity.assets.large_image) {
                    if (activity.assets.large_image.startsWith('mp:external/')) {
                        activityArt = `https://media.discordapp.net/${activity.assets.large_image.replace('mp:', '')}`;
                    } else if (activity.application_id) {
                        activityArt = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                    }
                }

                activityHtml = `
                    <div class="discord-activity">
                        <img class="discord-activity-art" src="${activityArt}" alt="${activity.name}" onerror="this.src='https://lanyard.eggsy.xyz/assets/discord.svg'" />
                        <div class="discord-activity-details">
                            <span class="discord-activity-title">Sedang Bermain</span>
                            <span class="discord-activity-name">${activity.name}</span>
                            ${activity.details ? `<span class="discord-activity-state">${activity.details}</span>` : ''}
                        </div>
                    </div>
                `;
            }

            if (activityHtml) {
                cardHtml += activityHtml;
            }

            cardContainer.innerHTML = cardHtml;
        }


        async function startHttpFallback() {
            if (fallbackTimer) return;

            const fetchPresence = async () => {
                try {
                    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
                    if (res.ok) {
                        const json = await res.json();
                        if (json.success && json.data) {
                            updateLanyardPresence(json.data);
                        }
                    }
                } catch (e) {
                    console.error("Lanyard HTTP fallback error:", e);
                }
            };

            await fetchPresence();
            fallbackTimer = setInterval(fetchPresence, 15000);
        }


        function connectWebSocket() {
            if (socket) {
                try { socket.close(); } catch(e){}
            }

            socket = new WebSocket('wss://api.lanyard.rest/socket');

            socket.onopen = () => {
                if (fallbackTimer) {
                    clearInterval(fallbackTimer);
                    fallbackTimer = null;
                }
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.op === 1) {
                        const interval = msg.d.heartbeat_interval;

                        socket.send(JSON.stringify({
                            op: 2,
                            d: { subscribe_to_id: DISCORD_USER_ID }
                        }));

                        if (heartbeatInterval) clearInterval(heartbeatInterval);
                        heartbeatInterval = setInterval(() => {
                            if (socket.readyState === WebSocket.OPEN) {
                                socket.send(JSON.stringify({ op: 3 }));
                            }
                        }, interval);
                    } else if (msg.op === 0) {
                        if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
                            updateLanyardPresence(msg.d);
                        }
                    }
                } catch (e) {
                    console.error("Lanyard WS message parsing error:", e);
                }
            };

            socket.onerror = (err) => {
                console.warn("Lanyard WebSocket error, switching to HTTP fallback...", err);
                startHttpFallback();
            };

            socket.onclose = () => {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                setTimeout(() => {
                    if (!fallbackTimer) {
                        connectWebSocket();
                    }
                }, 5000);
            };
        }

        connectWebSocket();
    }

    fetchGitHubStats();
    initDiscordLanyard();

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
    "👋 Halo, fellow Developer! Welcome to my system LOL.",
);

document.addEventListener('DOMContentLoaded', () => {
    const xrBtn = document.getElementById('xray-trigger');
    if (xrBtn) {
        xrBtn.onclick = () => document.body.classList.toggle('xray-mode');
    }
});

// Hero Section Parallax Animation using GSAP and ScrollTrigger
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.registerPlugin(ScrollTrigger);

    // Hero Vertical Parallax
    gsap.to(".layer-fast", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to(".layer-slow", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    if (typeof document.fonts !== 'undefined') {
        document.fonts.ready.then(() => {
            ScrollTrigger.refresh();
        });
    }
}