// Footer year
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = String(new Date().getFullYear());

// 0. Tubes 3D Background (Hero)
(async () => {
  const canvas = document.getElementById('tubes-canvas');
  const hero = document.getElementById('tubes-hero');
  if (!canvas || !hero) return;

  try {
    const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
    const TubesCursor = module.default;

    const app = TubesCursor(canvas, {
      tubes: {
        // Warm orange / coral / amber — matches site accent (no purple)
        colors: ['#FF4500', '#ff8c42', '#e8b84a'],
        lights: {
          intensity: 200,
          colors: ['#FF4500', '#fe8a2e', '#ffd166', '#60aed5']
        }
      }
    });

    hero.addEventListener('click', () => {
      if (!app || !app.tubes) return;
      const randomColors = (count) => new Array(count)
        .fill(0)
        .map(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
      app.tubes.setColors(randomColors(3));
      app.tubes.setLightsColors(randomColors(4));
    });
  } catch (error) {
    console.error('Failed to load TubesCursor:', error);
  }
})();

// 1. Reveal Elements on Scroll using Intersection Observer
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 2. Navbar Scroll Effect
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('py-4', 'bg-[#050505]/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
    nav.classList.remove('py-8', 'bg-transparent');
  } else {
    nav.classList.remove('py-4', 'bg-[#050505]/80', 'backdrop-blur-md', 'border-b', 'border-white/5');
    nav.classList.add('py-8', 'bg-transparent');
  }
});

// 2.1 Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (navToggle && mobileMenu) {
  const setMenuOpen = (open) => {
    mobileMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('is-open'));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      setMenuOpen(false);
    }
  });
}

// 3. Simple Parallax Logic
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  // Move cards in opposite directions slightly for depth
  document.querySelectorAll('.parallax-card-up').forEach(el => {
    el.style.setProperty('--scroll-offset-up', `${scrolled * -0.05}px`);
  });
  document.querySelectorAll('.parallax-card-down').forEach(el => {
    el.style.setProperty('--scroll-offset-down', `${scrolled * 0.05}px`);
  });
});

// 4. Update Time Clock
function updateTime() {
  const clockEl = document.getElementById('current-time');
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
  }
}
setInterval(updateTime, 60000);
updateTime();

// 5. Hero Content Parallax
const heroWrapper = document.getElementById('hero-content-wrapper');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (heroWrapper && scrolled < 1000) {
    heroWrapper.style.transform = `translateY(${scrolled * 0.4}px)`;
    heroWrapper.style.opacity = Math.max(0, 1 - scrolled / 600);
  }
});

// 6. Active nav highlight while scrolling
const sectionIds = ['about', 'skills', 'works', 'experience', 'education', 'contact'];
const navLinks = document.querySelectorAll('.nav-link');
const sectionSpy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle('nav-link--active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionSpy.observe(el);
});

// 7. Contact Form — try local API, fall back to mailto (GitHub Pages)
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('form-status');
const contactSubmit = document.getElementById('contact-submit');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (contactStatus) {
      contactStatus.textContent = 'Sending...';
      contactStatus.classList.remove('form-status--success', 'form-status--error');
    }
    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.classList.add('btn-disabled');
    }

    const formData = new FormData(contactForm);
    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      hcaptchaToken: formData.get('h-captcha-response')
    };

    const openMailto = () => {
      const subject = encodeURIComponent(`Portfolio contact from ${payload.firstName} ${payload.lastName}`);
      const body = encodeURIComponent(
        `${payload.message}\n\n—\n${payload.firstName} ${payload.lastName}\n${payload.email}\n${payload.phone || ''}`
      );
      window.location.href = `mailto:Bishtvansh491@gmail.com?subject=${subject}&body=${body}`;
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      contactForm.reset();
      if (window.hcaptcha) window.hcaptcha.reset();
      if (contactStatus) {
        contactStatus.textContent = 'Message sent successfully.';
        contactStatus.classList.add('form-status--success');
      }
    } catch (error) {
      // GitHub Pages has no /api/contact — open mail client instead
      openMailto();
      if (contactStatus) {
        contactStatus.textContent = 'Opening your email app…';
        contactStatus.classList.add('form-status--success');
      }
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.classList.remove('btn-disabled');
      }
    }
  });
}
