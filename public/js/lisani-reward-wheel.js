/**
 * Lisani — Bölüm sandığı çarkıfelek (bölüm bitince çark hakkı)
 */
(function () {
    'use strict';

    const WHEEL_COLORS = ['#22c55e', '#9333ea', '#1d4ed8', '#0d9488', '#dc2626', '#ea580c'];
    const POINTER_DEG = 270;

    const SEGMENTS = [
        { label: '25 XP', xp: 25, weight: 12 },
        { label: '50 XP', xp: 50, weight: 11 },
        { label: '50 XP', xp: 50, weight: 11 },
        { label: '75 XP', xp: 75, weight: 10 },
        { label: '100 XP', xp: 100, weight: 10 },
        { label: '100 XP', xp: 100, weight: 9 },
        { label: '150 XP', xp: 150, weight: 9 },
        { label: '150 XP', xp: 150, weight: 8 },
        { label: '200 XP', xp: 200, weight: 8 },
        { label: '250 XP', xp: 250, weight: 7 },
        { label: '500 XP', xp: 500, weight: 6 },
        { label: '500 XP', xp: 500, weight: 5 },
        { label: '750 XP', xp: 750, weight: 4 },
        { label: '1000 XP', xp: 1000, weight: 3 },
        { label: '1500 XP', xp: 1500, weight: 2 },
        { label: '2000 XP', xp: 2000, weight: 1 },
    ].map((seg, i) => ({ ...seg, color: WHEEL_COLORS[i % WHEEL_COLORS.length] }));

    let wheelCallback = null;
    let wheelSpinning = false;
    let wheelSvgCache = '';
    let activeChestBolumId = null;

    function wheelUid() {
        return (window.currentUser && (window.currentUser.id || window.currentUser.uid)) || 'guest';
    }

    function chestClaimedKey() {
        return `lisani_chest_claimed_${wheelUid()}`;
    }

    function getClaimedChests() {
        try {
            return JSON.parse(localStorage.getItem(chestClaimedKey()) || '[]');
        } catch (e) {
            return [];
        }
    }

    function markChestClaimed(bolumId) {
        if (!bolumId) return;
        try {
            const claimed = getClaimedChests();
            if (!claimed.includes(bolumId)) {
                claimed.push(bolumId);
                localStorage.setItem(chestClaimedKey(), JSON.stringify(claimed));
            }
        } catch (e) {}
    }

    window.canSpinRewardWheel = function (bolumId) {
        if (!bolumId) return false;
        if (typeof window.isBolumCompleted === 'function' && !window.isBolumCompleted(bolumId)) {
            return false;
        }
        return !getClaimedChests().includes(bolumId);
    };

    function pickSegment() {
        const total = SEGMENTS.reduce((s, x) => s + x.weight, 0);
        let r = Math.random() * total;
        for (let i = 0; i < SEGMENTS.length; i++) {
            r -= SEGMENTS[i].weight;
            if (r <= 0) return { seg: SEGMENTS[i], index: i };
        }
        return { seg: SEGMENTS[0], index: 0 };
    }

    function segmentLabelSvg(label) {
        return label.split(' ').join('\n');
    }

    function buildWheelSvg() {
        if (wheelSvgCache) return wheelSvgCache;

        const n = SEGMENTS.length;
        const slice = 360 / n;
        let inner = '';

        SEGMENTS.forEach((seg, i) => {
            const a1 = ((i * slice - 90) * Math.PI) / 180;
            const a2 = (((i + 1) * slice - 90) * Math.PI) / 180;
            const x1 = 50 + 45 * Math.cos(a1);
            const y1 = 50 + 45 * Math.sin(a1);
            const x2 = 50 + 45 * Math.cos(a2);
            const y2 = 50 + 45 * Math.sin(a2);
            const large = slice > 180 ? 1 : 0;
            inner += `<path d="M50,50 L${x1},${y1} A45,45 0 ${large},1 ${x2},${y2} Z" fill="${seg.color}" stroke="#111" stroke-width="0.35"/>`;

            const mid = ((i + 0.5) * slice - 90) * (Math.PI / 180);
            const tx = 50 + 30 * Math.cos(mid);
            const ty = 50 + 30 * Math.sin(mid);
            const rot = i * slice + slice / 2;
            const fs = seg.label.length > 7 ? '3.1' : '3.6';
            inner += `<text x="${tx}" y="${ty}" fill="#fff" font-size="${fs}" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rot},${tx},${ty})">${segmentLabelSvg(seg.label)}</text>`;
        });

        wheelSvgCache = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="none" stroke="#111" stroke-width="1.4"/>${inner}</svg>`;
        return wheelSvgCache;
    }

    function paintWheelDisc(el) {
        if (!el) return;
        el.innerHTML = buildWheelSvg();
        el.dataset.ready = '1';
    }

    function initWheelDom() {
        paintWheelDisc(document.getElementById('reward-wheel-disc'));
    }

    function bolumTitle(bolumId) {
        const list = window.LISANI_BOLUMLER || [];
        const b = list.find((x) => x.id === bolumId);
        return b ? b.title : 'Bölüm';
    }

    function setWheelModalCopy() {
        const title = document.getElementById('reward-wheel-title');
        const desc = document.getElementById('reward-wheel-desc');
        const spinBtn = document.getElementById('reward-wheel-spin-btn');
        const hub = document.querySelector('.lisani-carkifelek-hub');
        const ready = activeChestBolumId && window.canSpinRewardWheel(activeChestBolumId);

        if (title) {
            title.textContent = ready ? `${bolumTitle(activeChestBolumId)} — Sandık Ödülü!` : 'Sandık Ödülü';
        }
        if (desc) {
            desc.textContent = ready
                ? 'Bölümü tamamladın! Çarkı çevir, XP kazan.'
                : 'Bu sandık zaten açıldı.';
        }
        if (hub) {
            hub.innerHTML = ready ? '<span>ÖDÜL</span><span>ÇARK</span>' : '<span>SANDIK</span><span>🎁</span>';
        }
        if (spinBtn) {
            spinBtn.textContent = ready ? 'ÇEVİR!' : 'TAMAM';
            spinBtn.disabled = false;
            spinBtn.classList.toggle('is-done', !ready);
        }
    }

    function resetWheelDisc() {
        const disc = document.getElementById('reward-wheel-disc');
        if (disc) {
            disc.style.transition = 'none';
            disc.style.transform = 'rotate(0deg)';
        }
    }

    function openWheelModal(bolumId) {
        initWheelDom();
        wheelSpinning = false;
        activeChestBolumId = bolumId || null;

        const modal = document.getElementById('reward-wheel-modal');
        const result = document.getElementById('reward-wheel-result');
        const spinBtn = document.getElementById('reward-wheel-spin-btn');
        if (!modal) return false;

        if (result) {
            result.classList.add('hidden');
            result.innerHTML = '';
        }
        resetWheelDisc();
        setWheelModalCopy();

        const ready = activeChestBolumId && window.canSpinRewardWheel(activeChestBolumId);
        if (spinBtn) {
            spinBtn.onclick = ready ? () => window.spinRewardWheel() : () => window.closeRewardWheel(true);
        }

        modal.classList.remove('hidden');
        return true;
    }

    window.openBolumChestWheel = function (bolumId, ev) {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        if (typeof playClickSound === 'function') playClickSound();
        if (!bolumId || !window.canSpinRewardWheel(bolumId)) {
            if (typeof showToast === 'function') showToast('Bu sandık henüz hazır değil.', 'info');
            return;
        }
        wheelCallback = null;
        openWheelModal(bolumId);
    };

    window.showRewardWheel = function (onDone, bolumId) {
        wheelCallback = typeof onDone === 'function' ? onDone : null;
        if (bolumId && window.canSpinRewardWheel(bolumId)) {
            openWheelModal(bolumId);
            return;
        }
        if (wheelCallback) wheelCallback();
    };

    window.closeRewardWheel = function (skipCallback) {
        document.getElementById('reward-wheel-modal')?.classList.add('hidden');
        wheelSpinning = false;
        activeChestBolumId = null;
        if (!skipCallback && wheelCallback) {
            const cb = wheelCallback;
            wheelCallback = null;
            cb();
        } else {
            wheelCallback = null;
        }
        if (typeof window.renderBolumList === 'function') {
            window.renderBolumList();
        }
    };

    window.spinRewardWheel = function () {
        if (wheelSpinning || !activeChestBolumId || !window.canSpinRewardWheel(activeChestBolumId)) return;
        const disc = document.getElementById('reward-wheel-disc');
        const spinBtn = document.getElementById('reward-wheel-spin-btn');
        const result = document.getElementById('reward-wheel-result');
        if (!disc) {
            window.closeRewardWheel();
            return;
        }

        wheelSpinning = true;
        if (spinBtn) spinBtn.disabled = true;

        const { seg, index } = pickSegment();
        const slice = 360 / SEGMENTS.length;
        const target = POINTER_DEG - (index * slice + slice / 2);
        const spins = 6 + Math.floor(Math.random() * 2);
        const finalDeg = spins * 360 + target;
        const bolumId = activeChestBolumId;

        disc.style.transition = 'transform 4.5s cubic-bezier(0.1, 0.85, 0.15, 1)';
        disc.style.transform = `rotate(${finalDeg}deg)`;

        setTimeout(() => {
            markChestClaimed(bolumId);
            if (typeof window.addLisaniXp === 'function') window.addLisaniXp(seg.xp);
            if (typeof showToast === 'function') {
                showToast(`Sandık ödülü: +${seg.xp} XP!`, 'success');
            }
            if (result) {
                result.classList.remove('hidden');
                result.innerHTML = `<span class="text-xl font-black lisani-carkifelek-win">+${seg.xp} XP</span><span class="block text-[11px] theme-text-muted mt-1">${bolumTitle(bolumId)} sandığı açıldı</span>`;
            }
            if (spinBtn) {
                spinBtn.textContent = 'DEVAM ET';
                spinBtn.disabled = false;
                spinBtn.classList.add('is-done');
                spinBtn.onclick = () => window.closeRewardWheel();
            }
            wheelSpinning = false;
            setWheelModalCopy();
        }, 4600);
    };

    document.addEventListener('DOMContentLoaded', () => {
        initWheelDom();
    });
})();
