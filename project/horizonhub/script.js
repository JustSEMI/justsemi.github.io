const copyBtn = document.getElementById('copy-btn');
const loadstring = document.getElementById('loadstring').innerText;
const toast = document.getElementById('toast');

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(loadstring).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

let toastTimeout;
function showToast() {
    toast.classList.add('show');
    
    if(toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Fade in content smoothly on load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.main-content').style.opacity = '1';
});

// --- Dropdown Logic ---
const dropdownBtn = document.getElementById('games-dropdown-btn');
const gamesListContainer = document.getElementById('games-list');

if (dropdownBtn && gamesListContainer) {
    dropdownBtn.addEventListener('click', () => {
        dropdownBtn.classList.toggle('active');
        if (dropdownBtn.classList.contains('active')) {
            gamesListContainer.style.maxHeight = gamesListContainer.scrollHeight + "px";
        } else {
            gamesListContainer.style.maxHeight = "0px";
        }
    });
}
