const texts = ["GBK REBORN", "Dunia yang Terpecah", "🌟 Petualangan tak terbatas menantimu! 🌟"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    let currentText = texts[textIndex].substring(0, charIndex);
    document.getElementById("text").innerText = currentText;

    if (!isDeleting) {
        charIndex++;
        if (charIndex > texts[textIndex].length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }
    } else {
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
}

document.addEventListener("DOMContentLoaded", typeEffect);