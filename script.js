// DOM Elements
const canvas = document.getElementById('math-canvas');
const ctx = canvas.getContext('2d');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');
const bookContainer = document.getElementById('book-container');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');

// --- Canvas Animation ---
let particles = [];
const symbols = ['π', 'Σ', '∫', '∞', '△', 'ϕ', 'e', 'θ', 'λ', '√', '≈'];
let canvasWidth, canvasHeight;

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.reset();
        // Start at random y
        this.y = Math.random() * canvasHeight;
        // Fade in gradually
        this.alpha = Math.random() * 0.5;
    }

    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + 20;
        this.size = Math.random() * 14 + 10;
        this.speed = Math.random() * 0.5 + 0.1;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.4 + 0.1; // Max opacity
    }

    update() {
        this.y -= this.speed;
        this.rotation += this.rotationSpeed;

        // Fade in/out
        if (this.y > canvasHeight - 100 && this.alpha < this.targetAlpha) {
            this.alpha += 0.01;
        } else if (this.y < 50) {
            this.alpha -= 0.01;
        }

        if (this.alpha < 0) this.alpha = 0;

        if (this.y < -20) {
            this.reset();
        }
    }

    draw() {
        ctx.font = `${this.size}px 'Cormorant Garamond'`;
        ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`; // Gold
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    // Adjust density based on screen width
    const density = window.innerWidth < 600 ? 15 : 40;
    for (let i = 0; i < density; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

// --- Typewriter Effect ---
function typeWriter(element, text, speed = 100, callback) {
    let i = 0;
    element.innerHTML = '<span class="cursor">|</span>';

    function type() {
        if (i < text.length) {
            const cursor = element.querySelector('.cursor');
            const span = document.createElement('span');
            span.textContent = text.charAt(i);
            element.insertBefore(span, cursor);
            i++;
            // Randomize speed slightly for "human" feel
            const randomSpeed = speed + (Math.random() * 50 - 25);
            setTimeout(type, randomSpeed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// --- Content Rendering ---
function renderChapters() {
    CONFIG.chapters.forEach((chapter, index) => {
        const section = document.createElement('section');
        section.classList.add('chapter');

        // Header
        const header = document.createElement('div');
        header.classList.add('chapter-header');
        header.innerHTML = `
            <span class="chapter-number">Chapter ${index + 1}</span>
            <h2>${chapter.title}</h2>
        `;

        // Intro Text with Drop Cap
        const intro = document.createElement('p');
        intro.classList.add('chapter-intro');
        // Extract first letter for drop cap
        const firstLetter = chapter.description.charAt(0);
        const restText = chapter.description.slice(1);
        intro.innerHTML = `<span class="drop-cap">${firstLetter}</span>${restText}`;

        // Gallery
        const gallery = document.createElement('div');
        gallery.classList.add('gallery');

        chapter.images.forEach(imgSrc => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');

            const img = document.createElement('img');
            img.src = `assets/${imgSrc}`;
            img.alt = chapter.title;
            img.loading = "lazy";

            // Random footnote
            const footnote = document.createElement('div');
            footnote.classList.add('math-footnote');
            const randomQuote = CONFIG.quotes[Math.floor(Math.random() * CONFIG.quotes.length)];
            footnote.textContent = `fig.${Math.floor(Math.random() * 100)}: ${randomQuote}`;

            item.appendChild(img);
            item.appendChild(footnote);
            gallery.appendChild(item);
        });

        section.appendChild(header);
        section.appendChild(intro);
        section.appendChild(gallery);

        bookContainer.appendChild(section);
    });
}

// --- Intersection Observer (Fade In) ---
function initObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.chapter').forEach(chapter => {
        observer.observe(chapter);
    });
}

// --- Music Player ---
let isPlaying = false;
musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-music"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
    } else {
        // Attempt to play
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        }).catch(e => {
            console.log("Autoplay prevented or no source", e);
            alert("Please ensure an audio file is present in assets/music.mp3");
        });
    }
    isPlaying = !isPlaying;
});

// --- Initialization ---
window.addEventListener('load', () => {
    resizeCanvas();
    animateParticles();

    // Start Typewriter
    setTimeout(() => {
        typeWriter(heroTitle, CONFIG.hero.headline, 100, () => {
            // After title, type subtitle
            setTimeout(() => {
                heroSubtitle.textContent = CONFIG.hero.subHeadline;
                heroSubtitle.style.opacity = 1;
            }, 500);
        });
    }, 1000);

    renderChapters();
    initObserver();
});

window.addEventListener('resize', resizeCanvas);
