/* ============================================
   SOMOX — Antigravity Physics Engine + UI
   ============================================ */

// ── Cursor ──────────────────────────────────
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');

let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    setTimeout(() => {
        trail.style.left = mx + 'px';
        trail.style.top  = my + 'px';
    }, 80);
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.6)';
    trail.style.transform  = 'translate(-50%,-50%) scale(0.7)';
});
document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    trail.style.transform  = 'translate(-50%,-50%) scale(1)';
});

// ── Navbar scroll state ──────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile menu ──────────────────────────────
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(a => {
    a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
    });
});

// ── Smooth anchor scrolling ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ── Stat counter animation ───────────────────
function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();
    const update = now => {
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

// ── Reveal on scroll ─────────────────────────
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, i * 80);

            // Trigger counters if inside hero stats
            entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// Also observe hero stats directly
const heroStatObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
            heroStatObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) heroStatObs.observe(statsEl);

// ── Contact form ─────────────────────────────
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('.btn-primary');
        btn.querySelector('span').textContent = 'Sending...';
        setTimeout(() => {
            btn.style.display = 'none';
            formSuccess.style.display = 'block';
            form.reset();
        }, 1200);
    });
}

// ── Parallax mouse on hero objects ───────────
const heroSection = document.getElementById('hero');
if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
        const rect  = heroSection.getBoundingClientRect();
        const cx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        const cy = (e.clientY - rect.top  - rect.height / 2) / rect.height;

        document.querySelectorAll('.float-obj').forEach(obj => {
            const speed = parseFloat(obj.dataset.speed) || 0.3;
            const dx = cx * speed * 60;
            const dy = cy * speed * 40;
            obj.style.marginLeft = dx + 'px';
        });

        // Move orbs gently
        const orbs = document.querySelectorAll('.orb');
        orbs.forEach((orb, i) => {
            const factor = (i + 1) * 0.015;
            orb.style.transform = `translate(${cx * 40 * factor}px, ${cy * 30 * factor}px) scale(1)`;
        });
    });
}

// ── Antigravity Canvas Particles ─────────────
(function initCanvas() {
    const canvas = document.getElementById('antigravityCanvas');
    const ctx    = canvas.getContext('2d');

    let W, H;
    const particles = [];
    const PARTICLE_COUNT = 120;

    const COLORS = [
        [99, 102, 241],   // indigo
        [6,  182, 212],   // cyan
        [168, 85, 247],   // purple
        [16,  185, 129],  // emerald
        [245, 158, 11],   // amber
    ];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor(respawn) {
            this.reset(respawn);
        }

        reset(respawn) {
            this.x = Math.random() * W;
            this.y = respawn ? H + Math.random() * 100 : Math.random() * H;
            this.size = Math.random() * 2.5 + 0.5;

            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.r = c[0]; this.g = c[1]; this.b = c[2];

            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = -(Math.random() * 0.8 + 0.2);  // upward
            this.life = 0;
            this.maxLife = Math.random() * 300 + 200;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
            this.type = Math.floor(Math.random() * 3);  // 0=circle, 1=square, 2=tri
            this.size3d = Math.random() * 6 + 3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.life++;

            // Slight drift
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vx = Math.max(-0.8, Math.min(0.8, this.vx));

            if (this.y < -80 || this.life > this.maxLife) {
                this.reset(true);
            }
        }

        draw() {
            const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
            if (alpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle   = `rgb(${this.r},${this.g},${this.b})`;
            ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},0.5)`;

            if (this.type === 0) {
                // Circle
                ctx.beginPath();
                ctx.arc(0, 0, this.size3d / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 1) {
                // Square
                const s = this.size3d;
                ctx.strokeRect(-s/2, -s/2, s, s);
            } else {
                // Triangle
                const s = this.size3d;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.866, s * 0.5);
                ctx.lineTo(-s * 0.866, s * 0.5);
                ctx.closePath();
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle(false));
    }

    // Mouse repulsion
    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        ctx.clearRect(0, 0, W, H);

        // Draw connection lines
        ctx.lineWidth = 0.4;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i], p2 = particles[j];
                const dx = p1.x - p2.x, dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                    const alpha = (1 - dist/100) * 0.12;
                    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            // Mouse repulsion
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.8;
                p.vx += (dx/dist) * force * 0.4;
                p.vy += (dy/dist) * force * 0.3;
            }

            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
})();

// ── Active nav highlight ──────────────────────
const sections = document.querySelectorAll('section[id], div[id="hero"]');
const navLinks  = document.querySelectorAll('.nav-links a');

const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === '#' + entry.target.id) {
                    link.style.color = 'white';
                }
            });
        }
    });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => activeObs.observe(s));

// ── Service card tilt on hover ────────────────
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width  - 0.5;
        const cy = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${-cy*8}deg) rotateY(${cx*8}deg)`;
        card.style.perspective = '1000px';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ── Work card tilt ────────────────────────────
document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width  - 0.5;
        const cy = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `rotateX(${-cy*5}deg) rotateY(${cx*5}deg)`;
        card.style.perspective = '1000px';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
