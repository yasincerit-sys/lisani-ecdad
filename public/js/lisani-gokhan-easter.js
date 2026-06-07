/**
 * Gökhan Abi easter egg — kamera ikonuna dokununca ses çalar.
 * Ses: public/audio/gokhan-abi-call.mp4 (ekran kaydından yalnızca ses)
 */
(function () {
    'use strict';

    const AUDIO_FILE = 'gokhan-abi-call.mp4';

    let mediaEl = null;
    let missingNotified = false;
    let callStatusTimer = null;

    function getSrc() {
        return window.LISANI_ASSETS?.gokhanAudio || '';
    }

    function getMediaEl() {
        if (mediaEl) return mediaEl;
        mediaEl = document.getElementById('gokhan-abi-media');
        return mediaEl;
    }

    function el(id) {
        return document.getElementById(id);
    }

    function toast(msg, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type || 'info');
        }
    }

    function showHint(show) {
        const hint = el('gokhan-abi-audio-hint');
        if (hint) hint.classList.toggle('hidden', !show);
    }

    function checkSourceAvailable() {
        const src = getSrc();
        if (!src) return Promise.resolve(false);
        return fetch(src, { method: 'HEAD', cache: 'no-store' })
            .then((r) => r.ok)
            .catch(() => false);
    }

    function notifyMissingOnce() {
        if (missingNotified) return;
        missingNotified = true;
        toast('Gökhan Abi ses dosyası bulunamadı (public/audio/gokhan-abi-call.mp4).', 'error');
    }

    function prepareMedia() {
        const media = getMediaEl();
        const src = getSrc();
        if (!media || !src) return null;
        media.volume = 1;
        media.muted = false;
        media.loop = false;
        const source = media.querySelector('source');
        if (source && source.src !== src && !source.src.endsWith(AUDIO_FILE)) {
            source.src = src;
        } else if (!source && media.src !== src) {
            media.src = src;
        }
        return media;
    }

    function stopAudio() {
        const media = getMediaEl();
        if (!media) return;
        media.pause();
        try {
            media.currentTime = 0;
        } catch (_) { /* ignore */ }
        showHint(false);
    }

    function playGokhanSound(onFail) {
        const media = prepareMedia();
        const src = getSrc();
        if (!media || !src) {
            notifyMissingOnce();
            if (onFail) onFail();
            return;
        }

        checkSourceAvailable().then((ok) => {
            if (!ok) {
                notifyMissingOnce();
                showHint(true);
                if (onFail) onFail();
                return;
            }

            try {
                media.currentTime = 0;
            } catch (_) { /* ignore */ }
            media.load();
            const attempt = media.play();
            if (attempt && typeof attempt.then === 'function') {
                attempt
                    .then(() => showHint(false))
                    .catch(() => {
                        showHint(true);
                        if (onFail) onFail();
                    });
            }
        });
    }

    function playCameraAudio() {
        playGokhanSound(() => {
            toast('Sesi açmak için kamera ikonuna tekrar dokun.', 'info');
        });
    }

    function clearCallStatusTimer() {
        if (callStatusTimer) {
            clearInterval(callStatusTimer);
            callStatusTimer = null;
        }
    }

    function resetCallOverlay() {
        clearCallStatusTimer();
        const overlay = el('gokhan-video-call-overlay');
        const actions = el('gokhan-call-actions');
        const connected = el('gokhan-call-connected');
        const status = el('gokhan-call-status');
        if (overlay) overlay.classList.add('hidden');
        if (actions) actions.classList.remove('hidden');
        if (connected) connected.classList.add('hidden');
        if (status) status.textContent = 'Seni arıyor…';
    }

    function startCallStatusPulse() {
        const status = el('gokhan-call-status');
        let tick = 0;
        clearCallStatusTimer();
        callStatusTimer = setInterval(() => {
            tick += 1;
            if (status) {
                status.textContent = tick % 2 === 0 ? 'Görüntülü arama…' : 'Seni arıyor…';
            }
        }, 900);
    }

    function showIncomingCallOverlay() {
        const overlay = el('gokhan-video-call-overlay');
        const actions = el('gokhan-call-actions');
        const connected = el('gokhan-call-connected');
        const status = el('gokhan-call-status');
        if (overlay) overlay.classList.remove('hidden');
        if (actions) actions.classList.remove('hidden');
        if (connected) connected.classList.add('hidden');
        if (status) status.textContent = 'Seni arıyor…';
        startCallStatusPulse();
        if (window.lucide) lucide.createIcons();
    }

    function startVideoCall() {
        showIncomingCallOverlay();
        playCameraAudio();
    }

    function rejectVideoCall() {
        clearCallStatusTimer();
        resetCallOverlay();
        stopAudio();
        toast('Görüntülü arama reddedildi.', 'info');
    }

    function acceptVideoCall() {
        clearCallStatusTimer();
        const actions = el('gokhan-call-actions');
        const connected = el('gokhan-call-connected');
        const status = el('gokhan-call-status');
        if (actions) actions.classList.add('hidden');
        if (connected) connected.classList.remove('hidden');
        if (status) status.textContent = 'Bağlanıyor…';

        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
            if (status) status.textContent = 'Bağlandı';
            toast('Gokhan Abi ile görüşme başladı! 📹', 'success');
        }, 650);
    }

    function endVideoCall() {
        resetCallOverlay();
        stopAudio();
        toast('Görüşme sonlandırıldı.', 'info');
    }

    function stopAll() {
        resetCallOverlay();
        stopAudio();
    }

    window.LisaniGokhanEaster = {
        playCameraAudio,
        playAudio: playCameraAudio,
        stopAudio: stopAll,
        checkSourceAvailable,
        startVideoCall,
        acceptVideoCall,
        rejectVideoCall,
        endVideoCall,
    };
})();
