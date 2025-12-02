// === PRELOADER HANDLER (ditambahkan) ===
(function() {
  const pre = document.getElementById('preloader');
  // sembunyikan scroll selama preloader aktif
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  // Menunggu seluruh resource termuat
  window.addEventListener('load', () => {
    // beri waktu sedikit agar animasi maskReveal selesai (900ms di CSS)
    setTimeout(() => {
      if (!pre) return;
      pre.classList.add('hidden');

      // setelah transisi selesai, lepaskan overflow dan remove node (bersih)
      setTimeout(() => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        // optional: remove preloader from DOM after hidden
        try {
          pre.remove();
        } catch(e) { /* ignore */ }
      }, 800);
    }, 700); // berikan 700ms sebelum mulai hide
  });
})();

// ===== Slider dasar (dipindahkan dari CSS) =====
const slider = document.querySelector('.materi-slider');
const slides = document.querySelectorAll('.materi-slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let index = 0;

function showSlide(i) {
  if (i < 0) index = slides.length - 1;
  else if (i >= slides.length) index = 0;
  else index = i;
  if (slider) slider.style.transform = `translateX(-${index * 100}%)`;
}

if (nextBtn) nextBtn.addEventListener('click', () => showSlide(index + 1));
if (prevBtn) prevBtn.addEventListener('click', () => showSlide(index - 1));

// ===== Fitur modern (gabung jadi satu file) =====

// Navbar hide/reveal on scroll
(function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > lastY && y > 120) navbar.classList.add('nav-hidden');
    else navbar.classList.remove('nav-hidden');
    if (y > 20) navbar.classList.add('nav-solid');
    else navbar.classList.remove('nav-solid');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Mobile nav toggle
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    }
  });
})();

// Magnetic buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--mx', `${mx}%`);
    btn.style.setProperty('--my', `${my}%`);
  });
});

// Anggota card ripple & tilt
document.querySelectorAll('.anggota-card').forEach(card => {
  card.addEventListener('pointerenter', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
  let raf = null;
  const onMove = e => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `translateY(-6px) rotateX(${py * -3}deg) rotateY(${px * 3}deg) scale(1.02)`;
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf);
    card.style.transform = '';
  };
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', onLeave);
});

// Slider enhancements: dots, swipe, keys, progress (no autoplay)
(function() {
  const sliderEl = document.querySelector('.materi-slider');
  const slidesEl = Array.from(document.querySelectorAll('.materi-slide'));
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  const dotsWrap = document.querySelector('.slider-dots');
  const progressBar = document.querySelector('.slider-progress .bar');

  if (!sliderEl || slidesEl.length === 0) return;

  let idx = 0;

  const updateUI = () => {
    sliderEl.style.transform = `translateX(-${idx * 100}%)`;
    if (dotsWrap) {
      dotsWrap.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('active', i === idx);
      });
    }
    if (progressBar) {
      const pct = ((idx + 1) / slidesEl.length) * 100;
      progressBar.style.width = `${pct}%`;
    }
  };

  const goTo = (i) => {
    if (i < 0) idx = slidesEl.length - 1;
    else if (i >= slidesEl.length) idx = 0;
    else idx = i;
    updateUI();
  };

  // Create dots
  if (dotsWrap) {
    slidesEl.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  // Buttons
  prev && prev.addEventListener('click', () => goTo(idx - 1));
  next && next.addEventListener('click', () => goTo(idx + 1));

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(idx - 1);
    if (e.key === 'ArrowRight') goTo(idx + 1);
  });

  // Swipe/drag
  let startX = 0, dx = 0, isDown = false;
  const onStart = (e) => {
    isDown = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
  };
  const onMove = (e) => {
    if (!isDown) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = x - startX;
    const pct = dx / sliderEl.clientWidth * 100;
    sliderEl.style.transition = 'none';
    sliderEl.style.transform = `translateX(calc(-${idx * 100}% + ${pct}%))`;
  };
  const onEnd = () => {
    if (!isDown) return;
    isDown = false;
    sliderEl.style.transition = '';
    if (Math.abs(dx) > sliderEl.clientWidth * 0.15) {
      goTo(idx + (dx < 0 ? 1 : -1));
    } else {
      updateUI();
    }
    dx = 0;
  };
  sliderEl.addEventListener('mousedown', onStart);
  sliderEl.addEventListener('mousemove', onMove);
  sliderEl.addEventListener('mouseup', onEnd);
  sliderEl.addEventListener('mouseleave', onEnd);
  sliderEl.addEventListener('touchstart', onStart, { passive: true });
  sliderEl.addEventListener('touchmove', onMove, { passive: true });
  sliderEl.addEventListener('touchend', onEnd);

  // Init
  updateUI();
})();

// Lightbox untuk gambar materi
(function() {
  const lb = document.querySelector('.lightbox');
  const img = lb?.querySelector('.lightbox-image');
  const close = lb?.querySelector('.lightbox-close');
  const backdrop = lb?.querySelector('.lightbox-backdrop');

  if (!lb || !img) return;

  document.querySelectorAll('.materi-content img').forEach(source => {
    source.addEventListener('click', () => {
      img.src = source.src;
      img.alt = source.alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const dismiss = () => {
    lb.classList.remove('open');
    img.src = '';
    document.body.style.overflow = '';
  };
  close?.addEventListener('click', dismiss);
  backdrop?.addEventListener('click', dismiss);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismiss();
  });
})();

// Scroll reveal
(function() {
  const toReveal = [
    ...document.querySelectorAll('.anggota-card'),
    ...document.querySelectorAll('.materi-content'),
    ...document.querySelectorAll('.home h2, .subtitle, .hero-buttons')
  ];
  toReveal.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  toReveal.forEach(el => io.observe(el));
})();

// Parallax hero background
(function() {
  const home = document.querySelector('.home');
  if (!home) return;
  let rafId = null;
  const onScroll = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      home.style.backgroundPosition = `center ${Math.max(0, y * -0.05)}px`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// GSAP optional polish (jika tersedia)
(function() {
  if (!window.gsap) return;
  gsap.from('.logo-area', { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out' });
  gsap.utils.toArray('.nav-menu a').forEach((a, i) => {
    gsap.from(a, { y: -14, opacity: 0, delay: 0.05 * i, duration: 0.4, ease: 'power2.out' });
  });
})();

// === Cursor Custom ===
(function() {
  const root = document.querySelector('.cursor');
  if (!root) return;
  const dot = root.querySelector('.cursor-dot');
  const ring = root.querySelector('.cursor-ring');

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  let rafId = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  const move = (e) => {
    x = e.clientX; y = e.clientY;
    // trail kecil
    const trail = document.createElement('span');
    trail.className = 'cursor-trail';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 600);
  };

  const render = () => {
    tx = lerp(tx, x, 0.25);
    ty = lerp(ty, y, 0.25);
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    ring.style.left = `${tx}px`;
    ring.style.top = `${ty}px`;
    rafId = requestAnimationFrame(render);
  };

  const setState = (state, on) => {
    const cls = `cursor--${state}`;
    if (on) root.classList.add(cls);
    else root.classList.remove(cls);
  };

  window.addEventListener('mousemove', move, { passive: true });
  window.addEventListener('mousedown', () => {
    setState('down', true);
    // ripple
    const ripple = document.createElement('span');
    ripple.className = 'cursor-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  }, { passive: true });
  window.addEventListener('mouseup', () => setState('down', false), { passive: true });

  // Context-based states
  const linkSelector = 'a, button, .btn, .nav-menu a, .prev, .next';
  const imgSelector = '.materi-content img';
  const cardSelector = '.anggota-card';

  const delegate = (sel, enterState) => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => setState(enterState, true));
      el.addEventListener('mouseleave', () => setState(enterState, false));
    });
  };

  delegate(linkSelector, 'link');
  delegate(imgSelector, 'image');
  delegate(cardSelector, 'card');

  // Start
  render();
})();

// === Background glow parallax kecil (sinkron dengan gerakan mouse) ===
(function() {
  const layer = document.querySelector('.bg-glow');
  if (!layer) return;
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mx = (e.clientX / w - 0.5) * 8; // max 8px shift
    my = (e.clientY / h - 0.5) * 8;
    layer.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }, { passive: true });
})();
