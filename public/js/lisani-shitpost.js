/**
 * Shitpost modu — Instagram trendleri + mizah
 * Geri al: window.LisaniShitpost.revert()
 * Aç: window.LisaniShitpost.enable()
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'lisani_shitpost';
    const REV_KEY = 'lisani_shitpost_rev';
    const DEFAULT_ON = !!window.LISANI_SHITPOST_DEFAULT;
    const SERVER_REV = parseInt(String(window.LISANI_SHITPOST_REV || '3'), 10) || 3;
    const ORIGINAL_TITLE = document.title;

    const IG_STORIES = [
        { emoji: '🦍', label: 'goril_abi' },
        { emoji: '📉', label: 'çöküş' },
        { emoji: '💅', label: 'girl_grip' },
        { emoji: '🧠', label: 'delulu' },
        { emoji: '📚', label: 'academic_weapon' },
        { emoji: '🫠', label: 'plan_b' },
        { emoji: '📸', label: 'photo_dump' },
        { emoji: '✨', label: 'demure' },
    ];

    const IG_TRENDS = [
        {
            tag: 'Trend · Haziran 2026',
            title: 'Supportive / Disappointed / Sarcastic / Flirty',
            body: 'Aynı cümleyi 4 modda söyle: "Osmanlıca çalıştım" — destekleyici, hayal kırıklığı, alaycı, flört.',
        },
        {
            tag: 'Reels · POV',
            title: 'POV: Osmanlıca testine girmeden 3 dk önce',
            body: 'Delulu is the solulu. Kelime ezberlemedin ama main character energy var, yeter.',
        },
        {
            tag: 'Carousel · My Top 10',
            title: 'Top 10 bahanelerim (teste girmedim)',
            body: '1) Wi‑Fi gitti 2) Goril çıktı 3) Reels bitti 4) Plan B 5) Master of none…',
        },
    ];

    const POV_LINES = [
        'POV: Kariyer moduna 6 kere tıklayıp videoyu buldun',
        'POV: "Very mindful, very demure" diye Osmanlıca okuyorsun',
        'POV: Plan A çalışmadı, Plan B de yok, Plan C: goril',
        'POV: Academic weapon modu açık ama silah jam yaptı',
    ];

    const FLOAT_STICKERS = ['delulu ✨', 'girl grip 💅', 'add yours ➕', 'plan B 🫠', 'very demure'];

    const TOAST_JOKES = [
        'Trend: supportive modda "aferin", disappointed modda notun belli',
        'Do you wanna çalışmak? — Hayır. — Story at o zaman',
        'Can we reschedule? Ders yok, shitpost var',
    ];

    const TEXT_SWAPS = [
        { sel: '.lisani-desktop-brand__title', text: 'Lisanı Reels 💀' },
        { sel: '#auth-container h1.theme-text-main', text: 'Osmanlıca değil Instagram SEO' },
        { sel: '#ai-screen-title', text: 'Analytics (fake)' },
        { sel: '#kariyer-home-card-btn h3', text: 'Kariyer Modu (cap)' },
        { sel: '#kariyer-home-card-btn .space-y-1 p', text: 'POV: Haritada level yok, goril var.' },
        { sel: '#kariyer-home-card-btn .space-y-1 span.uppercase', text: 'Brat Summer 🏝️' },
        { sel: '#career-intro-wrapper h4', text: 'Coming soon (yalan)' },
        { sel: '#career-intro-wrapper .lisani-kariyer-copy p', text: 'Plan A: kariyer. Plan B: goril. Plan C: Reels.' },
        { sel: '.lisani-kariyer-badge', text: 'Add Yours · shitpost' },
        { sel: '#home-hadis-turkce', text: '"Delulu is the solulu"' },
    ];

    const TAB_LABELS = ['📉 Stats', '🏠 Feed', '🔤 Harfler', '📜 POV', '⚙️ Ayar'];

    let textBackup = [];
    let tabBackup = [];
    let marqueeEl = null;
    let injectedWrap = null;
    let floatEls = [];
    let toastTimer = null;
    let povIndex = 0;
    let applied = false;

    function readStoredState() {
        try {
            return {
                mode: localStorage.getItem(STORAGE_KEY),
                rev: parseInt(localStorage.getItem(REV_KEY) || '0', 10) || 0,
            };
        } catch (_) {
            return { mode: null, rev: 0 };
        }
    }

    function persistState(on) {
        try {
            localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
            localStorage.setItem(REV_KEY, String(SERVER_REV));
        } catch (_) { /* ignore */ }
    }

    function isEnabled() {
        if (typeof window.lisaniShitpostIsEnabled === 'function') {
            return window.lisaniShitpostIsEnabled();
        }
        const { mode, rev } = readStoredState();
        if (mode === '1') return true;
        if (mode === '0' && rev >= SERVER_REV) return false;
        return DEFAULT_ON;
    }

    function backupAndSet(el, text) {
        if (!el || el.dataset.shitpostDone === '1') return;
        textBackup.push({ el, text: el.textContent });
        el.textContent = text;
        el.dataset.shitpostDone = '1';
    }

    function swapTexts() {
        TEXT_SWAPS.forEach(({ sel, text }) => {
            try {
                document.querySelectorAll(sel).forEach((el) => backupAndSet(el, text));
            } catch (_) { /* ignore */ }
        });

        const kaynak = document.getElementById('home-hadis-kaynak');
        if (kaynak && kaynak.dataset.shitpostDone !== '1') {
            textBackup.push({ el: kaynak, html: kaynak.innerHTML });
            kaynak.innerHTML = 'Kaynak: <strong>Instagram Trends · Haz 2026</strong>';
            kaynak.dataset.shitpostDone = '1';
        }

        document.querySelectorAll('#bottom-bar .lisani-nav-tab__label').forEach((el, i) => {
            if (!TAB_LABELS[i] || el.dataset.shitpostDone === '1') return;
            tabBackup.push({ el, text: el.textContent });
            el.textContent = TAB_LABELS[i];
            el.dataset.shitpostDone = '1';
        });

        const konuBtn = document.querySelector('#btn-konu-anlatimi span');
        if (konuBtn && konuBtn.dataset.shitpostDone !== '1') {
            tabBackup.push({ el: konuBtn, text: konuBtn.textContent });
            konuBtn.textContent = 'Konu · Carousel';
            konuBtn.dataset.shitpostDone = '1';
        }
    }

    function restoreTexts() {
        textBackup.forEach((item) => {
            if (!item.el || !item.el.isConnected) return;
            if (item.html != null) item.el.innerHTML = item.html;
            else item.el.textContent = item.text;
            delete item.el.dataset.shitpostDone;
        });
        tabBackup.forEach(({ el, text }) => {
            if (el && el.isConnected) {
                el.textContent = text;
                delete el.dataset.shitpostDone;
            }
        });
        textBackup = [];
        tabBackup = [];
    }

    function buildMarqueeText() {
        return '📸 SHITPOST · POV · Girl Grip · delulu · goril · geri almak için "geri al" de · ';
    }

    function addMarquee() {
        if (marqueeEl) return;
        const host = document.getElementById('app-container') || document.getElementById('auth-container') || document.body;
        if (!host) return;
        marqueeEl = document.createElement('div');
        marqueeEl.className = 'lisani-shitpost-marquee';
        marqueeEl.setAttribute('aria-hidden', 'true');
        marqueeEl.innerHTML = `<span>${buildMarqueeText()}</span>`;
        host.insertBefore(marqueeEl, host.firstChild);
    }

    function removeMarquee() {
        if (marqueeEl) {
            marqueeEl.remove();
            marqueeEl = null;
        }
    }

    function injectInstagramUI() {
        const homeScreen = document.getElementById('screen-home');
        if (!homeScreen) return;
        if (injectedWrap && injectedWrap.isConnected) return;

        injectedWrap = document.createElement('div');
        injectedWrap.id = 'lisani-shitpost-ig-wrap';

        const storiesHtml = IG_STORIES.map(
            (s) => `
            <div class="lisani-ig-story">
                <div class="lisani-ig-story__ring">
                    <div class="lisani-ig-story__avatar">${s.emoji}</div>
                </div>
                <span class="lisani-ig-story__label">${s.label}</span>
            </div>`
        ).join('');

        const trendsHtml = IG_TRENDS.map(
            (t) => `
            <div class="lisani-ig-trend-card">
                <span class="lisani-ig-trend-card__tag">${t.tag}</span>
                <div class="lisani-ig-trend-card__title">${t.title}</div>
                <div class="lisani-ig-trend-card__body">${t.body}</div>
            </div>`
        ).join('');

        const pov = POV_LINES[povIndex % POV_LINES.length];
        povIndex += 1;

        injectedWrap.innerHTML = `
            <div class="lisani-ig-stories">${storiesHtml}</div>
            <div class="lisani-ig-pov">
                <div class="lisani-ig-pov__label">REELS · POV</div>
                <div class="lisani-ig-pov__text">${pov}</div>
                <span class="lisani-ig-add-yours">Add Yours ➕</span>
            </div>
            <div class="lisani-ig-acting">
                <div class="lisani-ig-acting__cell">Supportive<br>"Harikasın"</div>
                <div class="lisani-ig-acting__cell">Disappointed<br>"Yine mi 0"</div>
                <div class="lisani-ig-acting__cell">Sarcastic<br>"Vay be"</div>
                <div class="lisani-ig-acting__cell">Flirty<br>"Hocam…"</div>
            </div>
            <div class="lisani-ig-trends">${trendsHtml}</div>
        `;

        const anchor = homeScreen.querySelector('.glass-card, .lisani-glass-panel, .theme-gradient-card, .lisani-desktop-brand');
        if (anchor) homeScreen.insertBefore(injectedWrap, anchor);
        else homeScreen.insertBefore(injectedWrap, homeScreen.firstChild);
    }

    function removeInstagramUI() {
        if (injectedWrap) {
            injectedWrap.remove();
            injectedWrap = null;
        }
    }

    function addFloatStickers() {
        removeFloatStickers();
        FLOAT_STICKERS.slice(0, 3).forEach((text, i) => {
            const el = document.createElement('div');
            el.className = `lisani-shitpost-float lisani-shitpost-float--${i + 1}`;
            el.textContent = text;
            document.body.appendChild(el);
            floatEls.push(el);
        });
    }

    function removeFloatStickers() {
        floatEls.forEach((el) => el.remove());
        floatEls = [];
    }

    function startTrendToasts() {
        stopTrendToasts();
        if (typeof window.showToast !== 'function') return;
        toastTimer = setInterval(() => {
            if (!isEnabled()) return;
            const joke = TOAST_JOKES[Math.floor(Math.random() * TOAST_JOKES.length)];
            window.showToast(joke, 'info');
        }, 32000);
    }

    function stopTrendToasts() {
        if (toastTimer) {
            clearInterval(toastTimer);
            toastTimer = null;
        }
    }

    function apply() {
        if (!isEnabled()) return;
        document.documentElement.classList.add('lisani-shitpost');
        document.title = 'Lisanı Reels · Trend Modu 📸';
        addMarquee();
        swapTexts();
        injectInstagramUI();
        addFloatStickers();
        if (!applied && typeof window.showToast === 'function') {
            window.showToast('📸 Shitpost modu açık — geri almak için "geri al" de', 'info');
        }
        applied = true;
        startTrendToasts();
    }

    function revert() {
        persistState(false);
        applied = false;
        document.documentElement.classList.remove('lisani-shitpost');
        document.title = ORIGINAL_TITLE;
        restoreTexts();
        removeMarquee();
        removeInstagramUI();
        removeFloatStickers();
        stopTrendToasts();
        if (typeof window.showToast === 'function') {
            window.showToast('Shitpost kapandı. Normal mod.', 'success');
        }
    }

    function enable() {
        persistState(true);
        applied = false;
        apply();
    }

    function boot() {
        if (!isEnabled()) {
            document.documentElement.classList.remove('lisani-shitpost');
            return;
        }
        apply();
    }

    window.LisaniShitpost = { isEnabled, enable, revert, boot };

    boot();
    document.addEventListener('DOMContentLoaded', boot);
    document.addEventListener('appReady', boot);
})();
