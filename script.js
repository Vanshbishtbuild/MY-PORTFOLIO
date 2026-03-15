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
        colors: ['#f967fb', '#53bc28', '#6958d5'],
        lights: {
          intensity: 200,
          colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
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

// 6. Contact Form Submission
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
      if (window.hcaptcha) {
        window.hcaptcha.reset();
      }
      if (contactStatus) {
        contactStatus.textContent = 'Message sent successfully.';
        contactStatus.classList.add('form-status--success');
      }
    } catch (error) {
      if (contactStatus) {
        contactStatus.textContent = error.message || 'Something went wrong.';
        contactStatus.classList.add('form-status--error');
      }
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.classList.remove('btn-disabled');
      }
    }
  });
}
