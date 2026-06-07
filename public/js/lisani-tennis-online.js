/**
 * Kariyer Modu — gizli online tenis (oda kodu ile 1v1, Laravel API + polling)
 */
(function () {
    'use strict';

    const POLL_MS = 80;
    const INPUT_MS = 50;
    const SYNC_MS = 50;

    let roomCode = '';
    let role = null;
    let lobbyMode = 'create';
    let pollTimer = null;
    let inputTimer = null;
    let syncTimer = null;
    let waitTimer = null;
    let lastSeq = -1;
    let active = false;

    function apiFetch(url, options) {
        if (typeof window.apiFetch === 'function') {
            return window.apiFetch(url, options);
        }
        return Promise.reject(new Error('Giriş yapmanız gerekiyor.'));
    }

    function el(id) {
        return document.getElementById(id);
    }

    function isTennisUnlocked() {
        if (typeof window.getTennisUnlocked === 'function') return window.getTennisUnlocked();
        try {
            const uid = window.currentUser?.uid;
            const key = uid ? `lisani_tennis_unlocked_${uid}` : 'lisani_tennis_unlocked';
            return localStorage.getItem(key) === '1' || localStorage.getItem('lisani_tennis_unlocked') === '1';
        } catch (e) {
            return false;
        }
    }

    function showKariyerPanel(panel) {
        const intro = el('career-intro-wrapper');
        const online = el('kariyer-tennis-online-block');
        const game = el('tennis-game-container');
        const flappy = el('flappy-game-container');
        const gokhan = el('gokhan-abi-block');
        if (intro) intro.classList.toggle('hidden', panel !== 'intro');
        if (online) online.classList.toggle('hidden', panel !== 'online');
        if (game) game.classList.toggle('hidden', panel !== 'game');
        if (flappy) flappy.classList.add('hidden');
        if (gokhan) gokhan.classList.add('hidden');
        if (window.LisaniFlappy?.stop) window.LisaniFlappy.stop();
        if (window.LisaniGokhanEaster?.stopAudio) window.LisaniGokhanEaster.stopAudio();
    }

    function showLobbyView() {
        showKariyerPanel('online');
        const lobbyPanels = el('tennis-online-lobby-panels');
        const waitingPanel = el('tennis-online-waiting-panel');
        if (lobbyPanels) lobbyPanels.classList.remove('hidden');
        if (waitingPanel) waitingPanel.classList.add('hidden');
        updateLobbyModePanels();
    }

    function showWaitingView() {
        showKariyerPanel('online');
        const lobbyPanels = el('tennis-online-lobby-panels');
        const waitingPanel = el('tennis-online-waiting-panel');
        if (lobbyPanels) lobbyPanels.classList.add('hidden');
        if (waitingPanel) waitingPanel.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    function showGameView() {
        showKariyerPanel('game');
    }

    function setStatus(text) {
        const statusEl = el('tennis-online-status');
        if (statusEl) statusEl.textContent = text;
    }

    function setRoomCodeDisplay(code) {
        const codeEl = el('tennis-room-code-display');
        if (codeEl) codeEl.textContent = code || '------';
    }

    function updateLobbyModeButtons() {
        const createBtn = el('tennis-mode-create');
        const joinBtn = el('tennis-mode-join');
        if (createBtn) createBtn.classList.toggle('is-active', lobbyMode === 'create');
        if (joinBtn) joinBtn.classList.toggle('is-active', lobbyMode === 'join');
    }

    function updateLobbyModePanels() {
        const createPanel = el('tennis-online-panel-create');
        const joinPanel = el('tennis-online-panel-join');
        if (createPanel) createPanel.classList.toggle('hidden', lobbyMode !== 'create');
        if (joinPanel) joinPanel.classList.toggle('hidden', lobbyMode !== 'join');
        updateLobbyModeButtons();
    }

    window.setTennisOnlineLobbyMode = function (mode) {
        if (mode !== 'create' && mode !== 'join') return;
        lobbyMode = mode;
        if (typeof playClickSound === 'function') playClickSound();
        updateLobbyModePanels();
        if (mode === 'create') {
            setStatus('Oda oluştur, kodu arkadaşına gönder.');
        } else {
            setStatus('Arkadaşının oda kodunu gir.');
        }
    };

    window.handleTennisJoinKey = function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            window.joinTennisOnlineRoom();
        }
    };

    async function createRoom() {
        if (typeof playClickSound === 'function') playClickSound();
        try {
            const data = await apiFetch('/api/tennis/rooms', { method: 'POST', body: '{}' });
            roomCode = data.room.code;
            role = 'host';
            active = true;
            setRoomCodeDisplay(roomCode);
            setStatus('Arkadaşının katılmasını bekliyorsun…');
            showWaitingView();
            startWaitingPoll();
            showToast('Oda oluşturuldu! Kodu arkadaşına gönder. 🎾', 'success');
            loadInviteContacts();
            if (window.lucide) lucide.createIcons();
        } catch (e) {
            showToast(e.message || 'Oda oluşturulamadı.', 'error');
        }
    }

    async function joinRoom(code) {
        if (typeof playClickSound === 'function') playClickSound();
        const c = (code || '').trim().toUpperCase();
        if (c.length < 4) {
            showToast('Geçerli bir oda kodu gir.', 'error');
            return;
        }
        try {
            const data = await apiFetch('/api/tennis/rooms/' + encodeURIComponent(c) + '/join', {
                method: 'POST',
                body: '{}',
            });
            roomCode = data.room.code;
            role = data.room.role;
            active = true;
            if (data.room.status === 'playing') {
                beginOnlineMatch(data.room);
            } else {
                setStatus('Odaya katıldın, maç başlıyor…');
                showWaitingView();
                setRoomCodeDisplay(roomCode);
                startWaitingPoll();
            }
        } catch (e) {
            showToast(e.message || 'Odaya katılınamadı.', 'error');
        }
    }

    function startWaitingPoll() {
        stopWaitingPoll();
        waitTimer = setInterval(async () => {
            if (!roomCode || !active) return;
            try {
                const data = await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode));
                if (data.room.status === 'playing' && data.room.guest) {
                    stopWaitingPoll();
                    beginOnlineMatch(data.room);
                }
            } catch (e) {
                /* sessiz */
            }
        }, 1200);
    }

    function stopWaitingPoll() {
        if (waitTimer) {
            clearInterval(waitTimer);
            waitTimer = null;
        }
    }

    function beginOnlineMatch(room) {
        stopWaitingPoll();
        const opponent = room.opponent?.name || (role === 'host' ? room.guest?.name : room.host?.name) || 'Rakip';
        if (window.LisaniTennis) {
            window.LisaniTennis.setOnlineMode(true, role, roomCode, opponent);
        }
        el('kariyer-modal-container')?.classList.remove('hidden');
        showGameView();
        setStatus('Online maç · ' + opponent);
        setTimeout(() => {
            if (window.LisaniTennis) {
                window.LisaniTennis.startEngine();
                if (role === 'guest' && room.gameState) {
                    window.LisaniTennis.importState(normalizeGameState(room.gameState, room));
                }
            }
            startNetworkLoops();
            if (window.lucide) lucide.createIcons();
        }, 200);
        showToast('Online maç başladı! 🎾', 'success');
    }

    function normalizeGameState(gs, room) {
        return {
            ballX: gs.ballX,
            ballY: gs.ballY,
            ballSpeedX: gs.ballSpeedX,
            ballSpeedY: gs.ballSpeedY,
            ballTrail: gs.ballTrail || [],
            serveReady: gs.serveReady,
            countdown: gs.countdown,
            rallyHits: gs.rallyHits,
            hostScore: gs.hostScore ?? 0,
            guestScore: gs.guestScore ?? 0,
            matchOver: gs.matchOver,
            hostPaddleX: room.hostPaddleX,
            guestPaddleX: room.guestPaddleX,
            seq: gs.seq,
        };
    }

    function startNetworkLoops() {
        stopNetworkLoops();
        pollTimer = setInterval(pollState, POLL_MS);
        inputTimer = setInterval(sendInput, INPUT_MS);
        if (role === 'host') {
            syncTimer = setInterval(sendSync, SYNC_MS);
        }
    }

    function stopNetworkLoops() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        if (inputTimer) { clearInterval(inputTimer); inputTimer = null; }
        if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    }

    async function pollState() {
        if (!active || !roomCode || !window.LisaniTennis) return;
        try {
            const data = await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode));
            const room = data.room;
            if (role === 'host') {
                window.LisaniTennis.setRemotePaddleX(room.guestPaddleX ?? 124);
            } else {
                const gs = normalizeGameState(room.gameState, room);
                if ((gs.seq ?? 0) > lastSeq) {
                    lastSeq = gs.seq ?? 0;
                    window.LisaniTennis.importState(gs);
                }
            }
        } catch (e) {
            /* ağ hatası */
        }
    }

    async function sendInput() {
        if (!active || !roomCode || !window.LisaniTennis?.isOnline()) return;
        const paddleX = window.LisaniTennis.getLocalPaddleX();
        try {
            await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode) + '/input', {
                method: 'POST',
                body: JSON.stringify({ paddleX }),
            });
        } catch (e) {
            /* sessiz */
        }
    }

    async function sendSync() {
        if (!active || !roomCode || role !== 'host' || !window.LisaniTennis) return;
        const st = window.LisaniTennis.exportState();
        const payload = {
            gameState: {
                ballX: st.ballX,
                ballY: st.ballY,
                ballSpeedX: st.ballSpeedX,
                ballSpeedY: st.ballSpeedY,
                ballTrail: st.ballTrail,
                serveReady: st.serveReady,
                countdown: st.countdown,
                rallyHits: st.rallyHits,
                hostScore: st.hostScore,
                guestScore: st.guestScore,
                matchOver: st.matchOver,
            },
            hostPaddleX: st.hostPaddleX,
            guestPaddleX: st.guestPaddleX,
        };
        try {
            const data = await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode) + '/sync', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            if (data.seq != null) lastSeq = data.seq;
        } catch (e) {
            /* sessiz */
        }
    }

    async function leaveRoom(notify) {
        stopWaitingPoll();
        stopNetworkLoops();
        if (roomCode) {
            try {
                await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode) + '/leave', {
                    method: 'POST',
                    body: '{}',
                });
            } catch (e) { /* ignore */ }
        }
        if (notify) showToast('Online odadan ayrıldın.', 'info');
        roomCode = '';
        role = null;
        active = false;
        lastSeq = -1;
        if (window.LisaniTennis) {
            window.LisaniTennis.setOnlineMode(false, null, '', '');
        }
    }

    function openLobby() {
        if (typeof playClickSound === 'function') playClickSound();
        if (!window._loginDone) {
            showToast('Online tenis için giriş yapmalısın.', 'info');
            return;
        }
        if (!isTennisUnlocked()) {
            showToast('Önce ayarlardan tenis şifresini gir. 🗝️', 'info');
            return;
        }
        if (window.LisaniTennisOnline) {
            window.LisaniTennisOnline.stop(false);
        }
        el('kariyer-modal-container')?.classList.remove('hidden');
        showLobbyView();
        setStatus('Oda oluştur veya arkadaşının koduna katıl.');
        if (window.lucide) lucide.createIcons();
    }

    function cancelOnline() {
        if (typeof playClickSound === 'function') playClickSound();
        leaveRoom(false);
        showKariyerPanel('intro');
    }

    async function copyRoomCode() {
        if (!roomCode) return;
        try {
            await navigator.clipboard.writeText(roomCode);
            showToast('Oda kodu kopyalandı!', 'success');
        } catch (e) {
            showToast('Kod: ' + roomCode, 'info');
        }
    }

    async function inviteContact(partnerId) {
        if (!roomCode) return;
        try {
            const data = await apiFetch('/api/tennis/rooms/' + encodeURIComponent(roomCode) + '/invite', {
                method: 'POST',
                body: JSON.stringify({ partner_id: parseInt(partnerId, 10) }),
            });
            await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiver_id: parseInt(partnerId, 10),
                    body: data.invite.message + ' (Kariyer Modu çift tık → Katıl)',
                }),
            });
            showToast('Davet mesajı gönderildi! 🎾', 'success');
        } catch (e) {
            showToast(e.message || 'Davet gönderilemedi.', 'error');
        }
    }

    async function loadInviteContacts() {
        const list = el('tennis-invite-list');
        if (!list) return;
        list.innerHTML = '<p class="text-[9px] text-cyan-200/60 text-center py-2">Yükleniyor…</p>';
        try {
            const data = await apiFetch('/api/messages/contacts');
            const contacts = data.contacts || [];
            if (!contacts.length) {
                list.innerHTML = '<p class="text-[9px] text-cyan-200/60 text-center py-2">Mesajlaştığın kişi yok. Oda kodunu paylaş.</p>';
                return;
            }
            list.innerHTML = contacts.map((c) => `
                <button type="button" class="lisani-glass-action w-full py-2 px-3 rounded-xl text-[10px] font-bold flex items-center gap-2" data-tennis-invite="${c.uid}">
                    <span class="text-base">${escapeHtml(c.avatar || '🐱')}</span>
                    <span class="truncate">${escapeHtml(c.name)}</span>
                </button>
            `).join('');
            list.querySelectorAll('[data-tennis-invite]').forEach((btn) => {
                btn.addEventListener('click', () => inviteContact(btn.getAttribute('data-tennis-invite')));
            });
        } catch (e) {
            list.innerHTML = '<p class="text-[9px] text-red-400 text-center py-2">Kişi listesi yüklenemedi.</p>';
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.LisaniTennisOnline = {
        createRoom,
        joinRoom,
        openLobby,
        cancelOnline,
        copyRoomCode,
        leaveRoom,
        resetKariyerPanels() {
            showKariyerPanel('intro');
        },
        stop(notify) {
            leaveRoom(!!notify);
        },
    };

    window.openTennisOnlineLobby = openLobby;
    window.createTennisOnlineRoom = createRoom;
    window.joinTennisOnlineRoom = () => {
        joinRoom(el('tennis-join-code-input')?.value || '');
    };
    window.cancelTennisOnline = cancelOnline;
    window.copyTennisRoomCode = copyRoomCode;

    document.addEventListener('DOMContentLoaded', () => {
        const createBtn = el('tennis-create-room-btn');
        const joinBtn = el('tennis-join-room-btn');
        const copyBtn = el('tennis-copy-code-btn');
        if (createBtn) createBtn.addEventListener('click', () => { createRoom(); });
        if (joinBtn) joinBtn.addEventListener('click', window.joinTennisOnlineRoom);
        if (copyBtn) copyBtn.addEventListener('click', copyRoomCode);
        updateLobbyModePanels();
    });
})();
