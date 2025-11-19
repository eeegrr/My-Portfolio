/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close');
/* Menu Show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

/* Menu Hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav-link');

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu');
    // When we click on each nav-link, we remove the show-menu class
    navMenu.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
    const header = document.getElementById('header');
    this.scrollY >= 50 ? header.classList.add('blur-header') : header.classList.remove('blur-header');
}
window.addEventListener('scroll', blurHeader);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
    const scrollUp = document.getElementById('scroll-up')
    this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
        : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== CURSOR ===============*/
document.addEventListener('mousemove', e => {
    const cursor = document.querySelector('.cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

/*=============== FIREFLIES ===============*/
(function () {
    const COUNT = 15; // number of fireflies
    const home = document.querySelector(".home .fireflies");
    if (!home) return;

    const styleTag = document.createElement("style");
    document.head.appendChild(styleTag);

    function rand(min, max) { return Math.random() * (max - min) + min; }
    function rndInt(min, max) { return Math.floor(rand(min, max)); }

    for (let i = 0; i < COUNT; i++) {
        const f = document.createElement("div");
        f.className = "firefly";

        // make them move & pulse slower
        const rotateDur = rand(28, 45).toFixed(2) + "s";    // VERY slow rotation
        const flashDur = rndInt(14000, 28000) + "ms";        // slow glow
        const flashDelay = rndInt(8000, 20000) + "ms";       // long pause between flashes
        const travelDur = rndInt(400, 900) + "s";            // super slow drifting

        // per-firefly keyframes for movement
        const kfName = `firefly-move-${i}`;
        const steps = rndInt(16, 28);

        let kf = `@keyframes ${kfName} {`;
        for (let s = 0; s <= steps; s++) {
            const pct = (s * (100 / steps)).toFixed(3) + "%";
            const x = rand(0, 100).toFixed(2);
            const y = rand(0, 100).toFixed(2);
            const scale = (rand(0.25, 1.0)).toFixed(2);
            kf += `${pct} { top:${y}%; left:${x}%; transform:scale(${scale}); }`;
        }
        kf += `}`;
        styleTag.sheet.insertRule(kf, styleTag.sheet.cssRules.length);

        // animations
        f.style.animation = `${kfName} ${travelDur} ease-in-out alternate infinite`;
        f.style.setProperty("--rotateDur", rotateDur);
        f.style.setProperty("--flashDur", flashDur);
        f.style.setProperty("--flashDelay", flashDelay);

        styleTag.sheet.insertRule(
            `.home .firefly[data-i="${i}"]::before{animation-duration:var(--rotateDur);}`,
            styleTag.sheet.cssRules.length
        );
        styleTag.sheet.insertRule(
            `.home .firefly[data-i="${i}"]::after{animation-duration:var(--rotateDur),var(--flashDur);animation-delay:0ms,var(--flashDelay);}`,
            styleTag.sheet.cssRules.length
        );

        f.dataset.i = i;
        home.appendChild(f);
    }
})();

/*=============== Work change picture ===============*/

document.querySelectorAll('.work').forEach(section => {
    const mainImage = section.querySelector('.mainImage');
    const circles = section.querySelectorAll('.circle');

    circles.forEach(circle => {
        circle.addEventListener('click', () => {
            circles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');

            const newSrc = circle.getAttribute('data-image');
            mainImage.style.opacity = 0;

            setTimeout(() => {
                mainImage.src = newSrc;
                requestAnimationFrame(() => { mainImage.style.opacity = 1; });
            }, 400); // half of 0.8s
        });
    });
});

/*=============== SWIPER ===============*/

new Swiper('.card-wrapper', {
    loop: true,
    spaceBetween: 30,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});

/*=============== ABOUT ME BUTTONS ===============*/
(function () {
    const circles = Array.from(document.querySelectorAll('.hobby-circles .circle'));
    const overlayImg = document.querySelector('.overlayImage');

    // Start with no selection
    clearSelection();
    circles.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });

    circles.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');
            if (isActive) {
                // Clicking the active one -> unselect
                clearSelection();
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
                return;
            }

            // Deactivate others
            circles.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });

            // Activate this one
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            applySelection(btn);
        });
    });

    function applySelection(btn) {
        const src = btn.getAttribute('data-overlay');
        if (src) {
            const img = new Image();
            img.onload = () => {
                overlayImg.src = src;
                overlayImg.classList.add('is-visible');
            };
            img.src = src;
        }
    }

    function clearSelection() {
        if (!overlayImg) return;
        overlayImg.removeAttribute('src');
        overlayImg.classList.remove('is-visible');
    }
})();

/*=============== EYES ===============*/

document.addEventListener('DOMContentLoaded', () => {
    const eyes = document.querySelectorAll('.eye');

    document.addEventListener('mousemove', (event) => {
        eyes.forEach((eye) => {
            const rect = eye.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;   // eye center X
            const cy = rect.top + rect.height / 2;   // eye center Y

            const dx = event.clientX - cx;
            const dy = event.clientY - cy;

            const angle = Math.atan2(dy, dx);

            // how far pupil can move from center (as a fraction of eye size)
            const maxOffset = rect.width * 0.2; // 20% of eye width, tweak if needed

            const offsetX = Math.cos(angle) * maxOffset;
            const offsetY = Math.sin(angle) * maxOffset;

            // pass offsets into CSS vars used by ::after
            eye.style.setProperty('--pupil-x', `${offsetX}px`);
            eye.style.setProperty('--pupil-y', `${offsetY}px`);
        });
    });
});


/*=============== SEND MESSAGE ===============*/
(function () {
    'use strict';

    // ---------- Query DOM ----------
    const form = document.querySelector('.contact-form');
    if (!form) {
        console.warn('contact.js: .contact-form not found');
        return;
    }

    const fullName = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    // Success panel element (should exist in markup; if not, we create one)
    let successPanel = document.getElementById('contact-success');

    // If user didn't include a success panel, create a simple one (transparent overlay style)
    if (!successPanel) {
        successPanel = document.createElement('div');
        successPanel.id = 'contact-success';
        successPanel.setAttribute('aria-hidden', 'true');
        successPanel.style.display = 'none';
        // inner content will be wrapped into .success-card by the setup below
        successPanel.innerHTML = `
      <h3>Thanks — message sent!</h3>
      <p>I'll get back to you as soon as possible.</p>
      <button id="success-close" class="pop-btn" type="button">Close</button>
    `;
        document.body.appendChild(successPanel);
    }

    // ensure there is a close button and an inner success-card wrapper for styling
    let successClose = successPanel.querySelector('#success-close') || null;
    if (!successPanel.querySelector('.success-card')) {
        const inner = document.createElement('div');
        inner.className = 'success-card';
        // move existing children into the inner card
        while (successPanel.firstChild) inner.appendChild(successPanel.firstChild);
        successPanel.appendChild(inner);
    }
    successClose = successPanel.querySelector('#success-close');

    // ---------- Helpers: show/hide errors ----------
    function showErrorFor(fieldEl, msg) {
        if (!fieldEl) return;
        const container = fieldEl.closest('.field');
        if (!container) return;
        const errorTxt = container.querySelector('.error-txt');
        if (errorTxt) errorTxt.textContent = msg;
        container.classList.add('error');
        fieldEl.setAttribute('aria-invalid', 'true');
    }

    function hideErrorFor(fieldEl) {
        if (!fieldEl) return;
        const container = fieldEl.closest('.field');
        if (!container) return;
        container.classList.remove('error');
        fieldEl.removeAttribute('aria-invalid');
    }

    function isValidEmail(v) {
        // reasonable client-side check
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
    }

    function validateField(fieldEl) {
        const val = (fieldEl.value || '').trim();

        if (fieldEl === email) {
            if (val === '') {
                showErrorFor(fieldEl, "Email address can't be blank");
                return false;
            }
            if (!isValidEmail(val)) {
                showErrorFor(fieldEl, 'Please enter a valid email address');
                return false;
            }
            hideErrorFor(fieldEl);
            return true;
        }

        // name & message
        if (val === '') {
            const defaultMsg = fieldEl.tagName.toLowerCase() === 'textarea'
                ? "Message can't be blank"
                : "Name can't be blank";
            showErrorFor(fieldEl, defaultMsg);
            return false;
        }

        hideErrorFor(fieldEl);
        return true;
    }

    function validateAll() {
        const a = validateField(fullName);
        const b = validateField(email);
        const c = validateField(message);
        return a && b && c;
    }

    // ---------- Overlay show/hide (exported to window) ----------
    function showContactSuccess() {
        successPanel.classList.add('open');
        successPanel.setAttribute('aria-hidden', 'false');
        successPanel.style.display = 'flex';
        const btn = successPanel.querySelector('#success-close');
        if (btn) btn.focus();
        document.documentElement.style.overflow = 'hidden';
    }

    function hideContactSuccess() {
        successPanel.classList.remove('open');
        successPanel.setAttribute('aria-hidden', 'true');
        successPanel.style.display = 'none';
        document.documentElement.style.overflow = '';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
    }

    window.showContactSuccess = showContactSuccess;
    window.hideContactSuccess = hideContactSuccess;

    // close handlers
    if (successClose) {
        successClose.addEventListener('click', () => {
            hideContactSuccess();
            form.reset();
        });
    }

    // click overlay outside card to close
    successPanel.addEventListener('click', (evt) => {
        const card = successPanel.querySelector('.success-card');
        if (card && !card.contains(evt.target)) {
            hideContactSuccess();
        }
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && successPanel.classList.contains('open')) {
            hideContactSuccess();
        }
    });

    // ---------- Utility: derive FormSubmit AJAX endpoint ----------
    function ajaxUrlFor(formEl) {
        try {
            const action = (formEl.getAttribute('action') || '').trim();
            if (!action) return null;
            if (action.includes('/ajax/')) return action;
            const url = new URL(action);
            return `${url.protocol}//${url.host}/ajax${url.pathname}`;
        } catch (err) {
            if (typeof formEl.action === 'string' && formEl.action.includes('/')) {
                return formEl.action.replace('/submit', '/ajax/submit');
            }
            console.warn('contact.js: cannot compute ajaxUrlFor', err);
            return null;
        }
    }

    // ---------- Live validation listeners (attach once) ----------
    [fullName, email, message].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    // ---------- Submit handler (AJAX to FormSubmit) ----------
    let sending = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (sending) return;
        const ok = validateAll();
        if (!ok) {
            const firstInvalid = form.querySelector('.field.error .form-input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const fd = new FormData(form);
        const ajaxUrl = ajaxUrlFor(form);
        if (!ajaxUrl) {
            form.submit();
            return;
        }

        sending = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-disabled', 'true');
        }

        try {
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: fd,
                credentials: 'omit'
            });

            if (response.ok) {
                let json = null;
                try { json = await response.json(); } catch (err) { json = null; }

                if (response.status === 200 && (json === null || json.success === true || json.message)) {
                    showContactSuccess();
                    form.reset();
                } else {
                    console.warn('contact.js: unexpected FormSubmit response', json);
                    const card = successPanel.querySelector('.success-card');
                    if (card) {
                        card.querySelector('h3').textContent = 'Thanks — but there was a hiccup';
                        card.querySelector('p').textContent = 'Your message was received by FormSubmit but the server returned a non-standard response. If you don’t get an email, please try again later.';
                    }
                    showContactSuccess();
                }
            } else {
                console.warn('contact.js: network response not ok', response.status);
                alert('Sending failed. Please try again later or email directly.');
            }
        } catch (err) {
            console.error('contact.js: submit error', err);
            alert('Network error when sending message. Please try again later.');
        } finally {
            sending = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-disabled');
            }
        }
    });

    window._contactDebug = {
        show: showContactSuccess,
        hide: hideContactSuccess
    };
})();
