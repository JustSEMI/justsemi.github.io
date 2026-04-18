const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', (e) => {
    // 1. Cek apakah browser mendukung fitur ini
    if (!document.startViewTransition) {
        // Fallback kalau browser jadul
        document.body.classList.toggle('dark-mode');
        return;
    }

    // 2. Ambil titik kordinat klik kursor
    const x = e.clientX;
    const y = e.clientY;

    // 3. Tanam koordinat tersebut ke dalam CSS sebagai root variable
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

    // 4. Jalankan animasi transisinya
    document.startViewTransition(() => {
        document.body.classList.toggle('dark-mode');
    });
});