/**
 * Gökhan Abi easter egg — kamera ikonuna dokununca ses çalar.
 * Ses: public/audio/gokhan-abi-call.mp4 (ekran kaydından yalnızca ses)
 */
(function () {
    'use strict';

    const AUDIO_FILE = 'gokhan-abi-call.mp4';
    const GOKHAN_VOLUME_GAIN = 45;

    let mediaEl = null;
    let missingNotified = false;
    let callStatusTimer = null;
    let audioLoopActive = false;
    let playGeneration = 0;
    let audioContext = null;
    let gainNode = null;

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

    function bindLoopHandler(media) {
        if (media._gokhanLoopBound) return;
        media._gokhanLoopBound = true;
        media.addEventListener('ended', () => {
            if (!audioLoopActive) return;
            try {
                media.currentTime = 0;
                const retry = media.play();
                if (retry && typeof retry.catch === 'function') retry.catch(() => {});
            } catch (_) { /* ignore */ }
        });
    }

    function ensureAudioGain(media) {
        if (!media) return;
        media.volume = 1;
        media.muted = false;

        if (gainNode) {
            gainNode.gain.value = GOKHAN_VOLUME_GAIN;
            return;
        }

        if (media._gokhanGainSetup) return;

        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;

            audioContext = audioContext || new Ctx();
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {});
            }

            const source = audioContext.createMediaElementSource(media);
            gainNode = audioContext.createGain();
            gainNode.gain.value = GOKHAN_VOLUME_GAIN;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            media._gokhanGainSetup = true;
        } catch (_) {
            /* MediaElementSource yalnızca bir kez bağlanabilir veya API desteklenmiyor */
        }
    }

    function prepareMedia() {
        const media = getMediaEl();
        const src = getSrc();
        if (!media || !src) return null;
        ensureAudioGain(media);
        media.loop = true;
        bindLoopHandler(media);
        const source = media.querySelector('source');
        if (source && source.src !== src && !source.src.endsWith(AUDIO_FILE)) {
            source.src = src;
        } else if (!source && media.src !== src) {
            media.src = src;
        }
        return media;
    }

    function stopAudio() {
        playGeneration += 1;
        audioLoopActive = false;
        const media = getMediaEl();
        if (!media) return;
        media.loop = false;
        media.removeAttribute('loop');
        try {
            media.pause();
        } catch (_) { /* ignore */ }
        try {
            media.currentTime = 0;
        } catch (_) { /* ignore */ }
        try {
            media.load();
        } catch (_) { /* ignore */ }
        showHint(false);
    }

    function playGokhanSound(onFail) {
        const media = prepareMedia();
        const src = getSrc();
        const gen = ++playGeneration;
        audioLoopActive = true;
        if (!media || !src) {
            notifyMissingOnce();
            if (onFail) onFail();
            return;
        }

        checkSourceAvailable().then((ok) => {
            if (gen !== playGeneration) return;

            if (!ok) {
                notifyMissingOnce();
                showHint(true);
                if (onFail) onFail();
                return;
            }

            if (gen !== playGeneration) return;

            ensureAudioGain(media);
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {});
            }

            try {
                media.currentTime = 0;
            } catch (_) { /* ignore */ }
            media.loop = true;
            media.load();
            const attempt = media.play();
            if (attempt && typeof attempt.then === 'function') {
                attempt
                    .then(() => {
                        if (gen !== playGeneration) {
                            stopAudio();
                            return;
                        }
                        showHint(false);
                    })
                    .catch(() => {
                        if (gen !== playGeneration) return;
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
        stopAudio();
        clearCallStatusTimer();
        resetCallOverlay();
        toast('Görüntülü arama reddedildi.', 'info');
    }

    function acceptVideoCall() {
        stopAudio();
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
        stopAudio();
        resetCallOverlay();
        toast('Görüşme sonlandırıldı.', 'info');
    }

    function stopAll() {
        stopAudio();
        resetCallOverlay();
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
