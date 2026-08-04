const CONFIG = {
    // typewrite
    bioTexts: [
        "LAGI BELAJAR LUA dan LUAU",
        "The gravity here seems highly unstable...",
        "POLIJE SIP",
        "DEV HORIZON HUB"
    ],
    typingSpeed: 50,
    deletingSpeed: 30,
    pauseDuration: 5000,

    // tab title animation
    enableTabTitleAnimation: true,
    tabTitleText: "@bluezex",
    tabTitleTypingSpeed: 100,
    tabTitleDeletingSpeed: 50,
    tabTitlePauseDuration: 5000,

    // lanyard API
    // harus join discord Lanyard biar work
    discordUserId: '773408954352009216', // DiscordID
    useDiscordAvatar: true,
    fallbackAvatar: '',


    // social media links
    socialLinks: [
        { name: 'Website', icon: 'ph-globe', url: './project/website/' },
        { name: 'Github', icon: 'ph-fill ph-github-logo', url: 'https://github.com/JustSEMI' },
        { name: 'Discord', icon: 'ph-fill ph-discord-logo', url: 'http://discordapp.com/users/773408954352009216' },
        { name: 'Steam', icon: 'ph-fill ph-steam-logo', url: 'https://steamcommunity.com/profiles/76561199162257006/' },
        { name: 'Spotify', icon: 'ph-fill ph-spotify-logo', url: 'https://open.spotify.com/user/312x2wjkk2yqzmli5pal3xhfdlwu' },
        { name: 'HorizonHub', icon: 'ph-fill ph-code', url: './project/horizonhub/' }
    ],

    // timezone widget
    enableTimezoneWidget: true,

    // counter API
    // bebas mau pakai namespace apa, mau nama pribadi ata random string juga bisa
    counterNamespace: 'QNQzsQM7mSZynOzq4tIlD9EhY1KcVXXP', // ini pake random string, bukan API nya asli awoakwaokwoawka

    // playlist
    // Masukkan path lagu yang ada di folder assets/music/
    playlistStartTime: 0,
    randomizePlaylist: false,
    visualizerStyle: 'both', // 'circle', 'bar', atau 'both'
    visualizerBarsCount: 16,
    visualizerSymmetric: true,
    playlist: [
        'assets/music/BANG BANG BANG!.m4a',
    ],

    // constellation
    enableConstellation: true,
    constellationMinSize: 120, // min size %
    constellationMaxSize: 170, // max size %

    // shooting star
    enableStarfall: true,
    starfallInterval: 1000,
    starfallChance: 1,

    // Zero Gravity Effect
    zeroGravityChance: 0.5
};
