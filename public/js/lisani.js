        // --- GEÇMİŞ TEST SONUÇLARI VERİ TABANI ---
        let testHistory = [];

        // --- TOPLAM PUAN DEĞİŞKENİ (GÜVENLİ TAKİP) ---
        let totalScore = 0;
        window._lisaniServerStats = null;

        const LISANI_XP_PER_CORRECT = 500;

        window.formatLisaniXp = function (xp) {
            return new Intl.NumberFormat('tr-TR').format(Math.max(0, Number(xp) || 0));
        };

        window.getLisaniProgress = function () {
            return {
                testHistory: testHistory.slice(),
                totalScore,
            };
        };

        window.setLisaniProgress = function (history, xp) {
            if (Array.isArray(history)) testHistory = history;
            if (typeof xp === 'number' && !Number.isNaN(xp)) totalScore = xp;
            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}
            updateLearningStats();
            updateUIPoints();
            if (typeof renderProgressChart === 'function') renderProgressChart();
            if (typeof renderQuizHistoryList === 'function') renderQuizHistoryList();
        };

        window.refreshAllLearningUI = function () {
            updateLearningStats();
            updateUIPoints();
            if (typeof renderProgressChart === 'function') renderProgressChart();
            if (typeof renderQuizHistoryList === 'function') renderQuizHistoryList();
            if (typeof window.updateDailyWheelHomeUI === 'function') window.updateDailyWheelHomeUI();
        };

        window.addLisaniXp = function (amount) {
            const n = Number(amount);
            if (!n || n <= 0 || Number.isNaN(n)) return;
            totalScore += n;
            updateUIPoints();
            updateLearningStats();
            try {
                localStorage.setItem('lisani_total_xp', String(totalScore));
            } catch (e) {}
            if (typeof window.syncProgressToServer === 'function') {
                window.syncProgressToServer();
            }
        };

        // --- BÖLÜM TABANLI SORU BANKASI (lisani-quiz-bank.js) ---
        const quizBank = window.LISANI_QUIZ_BANK || {};
        const BOLUMLER = window.LISANI_BOLUMLER || [];
        const BOLUM_INDEX = window.LISANI_BOLUM_INDEX || {};

        function shuffleQuizPool(arr) {
            const pool = arr.slice();
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            return pool;
        }

        function shuffleQuestionOptions(q) {
            const copy = { ...q, options: [...q.options] };
            for (let i = copy.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy.options[i], copy.options[j]] = [copy.options[j], copy.options[i]];
            }
            return copy;
        }

        function getBolumMeta(bolumId) {
            return BOLUMLER.find((b) => b.id === bolumId) || null;
        }

        function prepareBolumSession(bolumId, stepIndex = 0) {
            const pools = window.LISANI_POOLS || {};
            const meta = getBolumMeta(bolumId);
            let size = meta?.sessionSize || window.LISANI_QUESTIONS_PER_STEP || 4;
            if (stepIndex >= 1) size += 1;
            if (stepIndex >= 3) size += 1;
            if (bolumId === 'ceviri' || bolumId === 'ses') size += Math.floor(stepIndex / 2);
            if (bolumId === 'ses') size = Math.min(18, size);
            const bolumUsed = getBolumUsedQuestionKeys(bolumId);
            const pattern =
                typeof window.buildLisaniSessionTypes === 'function'
                    ? window.buildLisaniSessionTypes(bolumId, size, stepIndex)
                    : (window.LISANI_STEP_PATTERNS || [['card', 'speak', 'tiles']])[stepIndex % 5];

            const picked = [];
            const usedKeys = new Set();

            function qKey(q) {
                return `${q.type}|${q.word}|${(q.answerOrder || q.answer || '').toString()}`;
            }

            function pickFromPool(kind, minD, maxD, slot, pickCfg) {
                const pool = pools[kind] || [];
                const cfg = pickCfg || {};
                const filterBase = (q, diffOnly) => {
                    const d = q.difficulty || 2;
                    const key = qKey(q);
                    if (usedKeys.has(key) || bolumUsed.has(key)) return false;
                    if (diffOnly && (d < minD || d > maxD)) return false;
                    if (kind === 'tiles') {
                        const parts = q.tileParts || (q.answerOrder || []).length;
                        if (cfg.tilesPartMin && parts < cfg.tilesPartMin) return false;
                        if (cfg.tilesPartMax && parts > cfg.tilesPartMax) return false;
                    }
                    if (kind === 'letter' && cfg.allowLetter === false) return false;
                    return true;
                };

                let candidates = pool.filter((q) => filterBase(q, true));
                if (!candidates.length) {
                    candidates = pool.filter((q) => filterBase(q, false));
                }
                if (!candidates.length) {
                    candidates = pool.filter((q) => !usedKeys.has(qKey(q)));
                }
                if (kind === 'grammar' && window.LisaniGrammarPrep?.filterGrammarPool) {
                    const filtered = window.LisaniGrammarPrep.filterGrammarPool(candidates);
                    if (filtered.length) candidates = filtered;
                }
                if (!candidates.length) return null;

                if (bolumId === 'ses' || bolumId === 'ceviri') {
                    candidates.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
                    const hardCount = Math.max(2, Math.ceil(candidates.length * (bolumId === 'ses' ? 0.4 : 0.55)));
                    candidates = candidates.slice(0, hardCount);
                }

                const pickIdx =
                    (stepIndex * 11 + slot * 5 + (BOLUM_INDEX[bolumId] || 0) + kind.length) % candidates.length;
                const q = JSON.parse(JSON.stringify(candidates[pickIdx]));
                usedKeys.add(qKey(q));
                return q;
            }

            for (let i = 0; i < size; i++) {
                const kind = pattern[i];
                const diffRange =
                    typeof window.getLisaniBolumDiffRange === 'function'
                        ? window.getLisaniBolumDiffRange(bolumId, stepIndex, i, size)
                        : { minD: 1, maxD: 3, cfg: {} };
                const q = pickFromPool(kind, diffRange.minD, diffRange.maxD, i, diffRange.cfg);
                if (q) picked.push(q);
            }

            return picked.map((q) =>
                q.options && (q.type === 'card' || q.type === 'letter' || q.type === 'grammar')
                    ? shuffleQuestionOptions(q)
                    : q
            );
        }

        function loadBolumQuestionUsage() {
            try {
                return JSON.parse(localStorage.getItem('lisani_bolum_q_keys') || '{}');
            } catch (e) {
                return {};
            }
        }

        function getBolumUsedQuestionKeys(bolumId) {
            const all = loadBolumQuestionUsage();
            return new Set(all[bolumId] || []);
        }

        function appendBolumQuestionUsage(bolumId, keys) {
            if (!bolumId || !keys?.length) return;
            const all = loadBolumQuestionUsage();
            const prev = all[bolumId] || [];
            all[bolumId] = [...new Set([...prev, ...keys])];
            try {
                localStorage.setItem('lisani_bolum_q_keys', JSON.stringify(all));
            } catch (e) {}
        }

        const BOLUM_STEPS = () => window.LISANI_BOLUM_STEPS || 5;

        function bolumIdFromHint(hint) {
            if (!hint) return null;
            if (BOLUMLER.some((b) => b.id === hint)) return hint;
            const map = { 1: 'kelimeler', 2: 'eslestirme', 3: 'ceviri' };
            return map[Number(hint)] || null;
        }

        function getFirstIncompleteBolum() {
            return BOLUMLER.find((b) => !isBolumCompleted(b.id)) || null;
        }

        function getNextIncompleteBolum(afterId) {
            const idx = BOLUMLER.findIndex((b) => b.id === afterId);
            for (let i = idx + 1; i < BOLUMLER.length; i++) {
                if (!isBolumCompleted(BOLUMLER[i].id)) return BOLUMLER[i];
            }
            return null;
        }

        let quizAdvanceTimer = null;
        let learnCardAdvancePaused = false;
        let learnCardResumeAfterClose = false;
        let speechRecognition = null;
        let voiceListening = false;
        let speakListenTimer = null;
        let speakCountdownTimer = null;
        let speakListenDeadline = 0;
        let speakMediaStream = null;
        let speakAudioCtx = null;
        let speakAnalyser = null;
        let speakMeterRaf = null;
        let nativeSpeechListener = null;
        let micPermissionGranted = false;
        let tilesSelection = [];
        let tilesPickedIndices = new Set();
        let activeQuestionAnswered = false;
        const SPEAK_LISTEN_MS = () => (window.LISANI_SPEAK_LISTEN_SEC || 15) * 1000;
        const speakListenSecLabel = () => Math.round(SPEAK_LISTEN_MS() / 1000);

        // --- AKTİF SINAV PARAMETRELERİ ---
        let activeQuizQuestions = [];
        let activeBolumId = '';
        let activeBolumStep = 0;
        let activeSessionQuestionKeys = [];
        let pendingStepCompletion = false;
        let activeLevel = 1;
        let activeTestName = '';
        let activeQuestionIndex = 0;
        let activeCorrects = 0;
        let activeWrongs = 0;
        let activeLives = 3;
        const TEST_LIVES_MAX = 3;
        let activeWrongQuestions = [];
        let lastTestWrongQuestions = [];
        let isWrongReviewSession = false;
        let isGrammarDrillSession = false;
        let lastTestSummary = { correct: 0, wrong: 0, percent: 0 };

        function quizQuestionKey(q) {
            return `${q.type}|${q.word}|${(q.answerOrder || q.answer || '').toString()}`;
        }

        function recordWrongQuestion(q) {
            if (!q) return;
            const key = quizQuestionKey(q);
            if (!activeWrongQuestions.some((w) => quizQuestionKey(w) === key)) {
                activeWrongQuestions.push(JSON.parse(JSON.stringify(q)));
            }
        }

        // --- GİZLİ TENİS OYUNU (2D) ---
        const TENNIS_W = 480;
        const TENNIS_H = 300;
        const TENNIS_WIN = 7;
        let tennisCanvas = null;
        let tennisCtx = null;
        let tennisLoopId = null;
        let isTennisRunning = false;
        let tennisPaused = false;
        let tennisMatchOver = false;
        let tennisServeReady = false;
        let tennisCountdown = 0;
        let tennisRallyHits = 0;
        let tennisLastTime = 0;
        let tennisBallSpin = 0;
        let tennisBallRotation = 0;
        let tennisHitParticles = [];
        let tennisCourtCache = null;
        let tennisBotTargetX = null;
        let tennisBotReaction = 0;

        let ballX = TENNIS_W / 2;
        let ballY = TENNIS_H / 2;
        let ballSpeedX = 0;
        let ballSpeedY = 0;
        let ballRadius = 7;
        let ballTrail = [];

        let playerPaddleX = 110;
        let computerPaddleX = 110;
        const paddleWidth = 84;
        const paddleHeight = 16;
        const paddleHandleH = 10;

        let tennisPlayerScore = 0;
        let tennisComputerScore = 0;

        let keyLeftPressed = false;
        let keyRightPressed = false;
        let tennisPointerActive = false;

        let tennisOnlineMode = false;
        let tennisOnlineRole = null;
        let tennisOnlineRoomCode = '';
        let tennisOpponentName = '';
        let tennisRemotePaddleX = (TENNIS_W - paddleWidth) / 2;

        // RENK KOYULAŞTIRMA YARDIMCI FONKSİYONU
        function darkenColor(col, amt) {
            let usePound = false;
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
            let num = parseInt(col, 16);
            let r = (num >> 16) - amt;
            if (r > 255) r = 255;
            else if (r < 0) r = 0;
            let b = ((num >> 8) & 0x00FF) - amt;
            if (b > 255) b = 255;
            else if (b < 0) b = 0;
            let g = (num & 0x0000FF) - amt;
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
        }

        // HEX'ten RGB'ye Dönüştürücü (Dinamik Gölgeler İçin)
        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(s => s + s).join('');
            }
            const num = parseInt(hex, 16);
            return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
        }

        // 🔎 DİNAMİK YAZI BOYUTUNU GÜNCELLEME SİSTEMİ
        function updateFontSizeSetting(event) {
            playClickSound();
            const chosenSize = event.target.value;
            const bodyMain = document.getElementById('body-main');
            
            bodyMain.classList.remove('font-size-standard', 'font-size-large', 'font-size-xlarge');
            
            if (chosenSize === 'large') {
                bodyMain.classList.add('font-size-large');
                showToast("Bilişsel Odak Değişti! 🔎 Optik sinirlerin için taze bir görünüm alanı sağlandı.", "success");
            } else if (chosenSize === 'xlarge') {
                bodyMain.classList.add('font-size-xlarge');
                showToast("Büyüteç Etkisi! 🔎 Fotoreseptörlerin için en geniş okuma modu aktif edildi.", "success");
            } else {
                bodyMain.classList.add('font-size-standard');
                showToast("Doğal Görünüm Dengelendi! 🔎 Standart odaklama sistemine geri dönüldü.", "success");
            }
        }

        // --- 🌿 DOĞA YEŞİLİ TOAST BİLDİRİM MOTORU (Swipe-to-Dismiss destekli) ---
        let toastDismissTimer = null;
        let toastDragState = null;

        function showLoading(text = 'Lütfen bekleyin...') {
            const el = document.getElementById('loading-overlay');
            const txt = document.getElementById('loading-text');
            if (txt) txt.textContent = text;
            if (el) el.classList.remove('hidden');
        }

        function hideLoading() {
            const el = document.getElementById('loading-overlay');
            if (el) el.classList.add('hidden');
        }

        function showToast(message, type = 'info') {
            const toastBox = document.getElementById('toast-box');
            const toastMessage = document.getElementById('toast-message');
            const toastIcon = document.getElementById('toast-icon');

            toastMessage.innerText = message;

            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }
            toastDragState = null;
            toastBox.style.transition = '';
            toastBox.style.transform = '';
            toastBox.style.opacity = '';
            toastBox.style.cursor = '';

            const toastVariant = type === 'error' ? 'error' : 'success';
            toastBox.className = 'lisani-toast lisani-toast--' + toastVariant;

            if (type === 'error') {
                toastIcon.setAttribute('data-lucide', 'alert-triangle');
            } else if (type === 'info') {
                toastIcon.setAttribute('data-lucide', 'info');
            } else {
                toastIcon.setAttribute('data-lucide', 'leaf');
            }

            lucide.createIcons();

            requestAnimationFrame(() => {
                toastBox.classList.add('is-visible');
            });

            toastDismissTimer = setTimeout(() => { dismissToast(null); }, 3500);
        }

        // --- ✋ TOAST'I PROGRAMATİK OLARAK KAPAT ---
        function dismissToast(direction) {
            const toastBox = document.getElementById('toast-box');
            if (!toastBox) return;
            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }

            toastBox.classList.remove('is-visible');
            
            let offX = 0, offY = -80;
            if (direction === 'left') offX = -Math.max(window.innerWidth, 400);
            else if (direction === 'right') offX = Math.max(window.innerWidth, 400);
            
            toastBox.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
            toastBox.style.transform = `translate(${offX}px, ${offY}px)`;
            toastBox.style.opacity = '0';
            
            setTimeout(() => {
                toastBox.className = 'lisani-toast';
                toastBox.style.transform = '';
                toastBox.style.opacity = '';
                toastBox.style.transition = '';
            }, 300);
        }

        // --- 👆 TOAST'I KAYDIRARAK / DOKUNARAK KAPAT ---
        function initToastSwipe() {
            const toastBox = document.getElementById('toast-box');
            if (!toastBox) return;

            const getPoint = (e) => {
                const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
                return { x: t.clientX, y: t.clientY };
            };

            const onStart = (e) => {
                if (!toastBox.classList.contains('is-visible')) return;
                const p = getPoint(e);
                toastDragState = { startX: p.x, startY: p.y, dx: 0, dy: 0, startTime: Date.now() };
                toastBox.style.transition = 'none';
                toastBox.style.cursor = 'grabbing';
            };

            const onMove = (e) => {
                if (!toastDragState) return;
                const p = getPoint(e);
                toastDragState.dx = p.x - toastDragState.startX;
                toastDragState.dy = Math.min(0, p.y - toastDragState.startY); // sadece yukarı
                const maxAbs = Math.max(Math.abs(toastDragState.dx), Math.abs(toastDragState.dy));
                const op = Math.max(0.15, 1 - maxAbs / 220);
                toastBox.style.transform = `translate(${toastDragState.dx}px, ${toastDragState.dy}px)`;
                toastBox.style.opacity = String(op);
            };

            const onEnd = () => {
                if (!toastDragState) return;
                const { dx, dy, startTime } = toastDragState;
                const elapsed = Date.now() - startTime;
                const distance = Math.max(Math.abs(dx), Math.abs(dy));
                const velocity = distance / Math.max(1, elapsed);
                toastDragState = null;
                toastBox.style.cursor = '';

                if (distance < 6 && elapsed < 300) {
                    // Hızlı dokunuş -> kapat
                    dismissToast(null);
                } else if (distance > 55 || velocity > 0.35) {
                    // Kaydırma -> yöne göre kapat
                    if (Math.abs(dx) > Math.abs(dy)) {
                        dismissToast(dx > 0 ? 'right' : 'left');
                    } else {
                        dismissToast(null);
                    }
                } else {
                    // Geri yapış
                    toastBox.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
                    toastBox.style.transform = '';
                    toastBox.style.opacity = '';
                }
            };

            // Dokunmatik
            toastBox.addEventListener('touchstart', onStart, { passive: true });
            toastBox.addEventListener('touchmove', onMove, { passive: true });
            toastBox.addEventListener('touchend', onEnd);
            toastBox.addEventListener('touchcancel', onEnd);

            // Mouse (masaüstü test)
            toastBox.addEventListener('mousedown', (e) => { onStart(e); e.preventDefault(); });
            document.addEventListener('mousemove', (e) => { if (toastDragState) onMove(e); });
            document.addEventListener('mouseup', () => { if (toastDragState) onEnd(); });
        }

        // --- 🔉 YAPAY TOK TIKLAMA SESİ MOTORU ---
        function playClickSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const t = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.08);
            } catch(e) {}
        }

        function playSuccessSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const t = ctx.currentTime;
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t + i * 0.08);
                    gain.gain.setValueAtTime(0.22, t + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.18);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t + i * 0.08);
                    osc.stop(t + i * 0.08 + 0.2);
                });
            } catch (e) {}
        }

        // --- 🔉 TENİS OYUNU GONG SESİ MOTORU ---
        function playTennisBeep(pitch = 180, duration = 0.1) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {
                console.log("Tenis sesi çalınamadı:", e);
            }
        }

        // --- KULLANICI / AUTH YÖNETİMİ (Firebase) ---

        function avatarAssetsBase() {
            return (window.LISANI_ASSETS && window.LISANI_ASSETS.avatars) || '/images/avatars';
        }

        function teamAvatarImg(file) {
            const rev = window.LISANI_ASSETS?.avatarRev;
            const q = rev ? `?v=${rev}` : '';
            const src = `${avatarAssetsBase()}/${file}${q}`;
            return `<span class="avatar-glass-emblem"><img src="${src}" alt="" /></span>`;
        }

        const DEFAULT_AVATAR = 'team:besiktas.svg';

        const AVATAR_OPTIONS = [
            { type: 'besiktas', file: 'besiktas.svg', label: 'Beşiktaş' },
            { type: 'bursaspor', file: 'bursaspor.svg', label: 'Bursaspor' },
            { type: 'goztepe', file: 'goztepe.svg', label: 'Göztepe' },
            { type: 'eskisehirspor', file: 'eskisehirspor.svg', label: 'Eskişehirspor' },
            { type: 'saray', file: 'saray-kavvesi.svg', label: 'Saray Kavvesi' },
            { type: 'ayasofya', file: 'istanbul/ayasofya.svg', label: 'Ayasofya' },
            { type: 'ulucami', file: 'istanbul/ulucami.svg', label: 'Ulu Camii' },
            { type: 'galata', file: 'istanbul/galata.svg', label: 'Galata' },
            { type: 'kizkulesi', file: 'istanbul/kiz-kulesi.svg', label: 'Kız Kulesi' },
            { type: 'bogaz', file: 'istanbul/bogaz.svg', label: 'Boğaz' },
            { type: 'kopru', file: 'istanbul/kopru.svg', label: 'Köprü' },
            { type: 'eminonu', file: 'istanbul/eminonu.svg', label: 'Eminönü' },
            { type: 'balat', file: 'istanbul/balat.svg', label: 'Balat' },
            { type: 'camii', file: 'istanbul/camii.svg', label: 'Camii' },
            { type: 'sokak', file: 'istanbul/sokak.svg', label: 'Sokak' },
            { type: 'panorama', file: 'istanbul/panorama.svg', label: 'Panorama' },
            { type: 'gunbatimi', file: 'istanbul/gunbatimi.svg', label: 'Gün Batımı' },
        ];

        function extractAvatarSvgPath(value) {
            if (!value || typeof value !== 'string') return null;
            if (value.startsWith('team:')) return value.slice(5);
            const match = value.match(/avatars\/([^"?]+\.svg)/i);
            return match ? match[1] : null;
        }

        function resolveAvatarType(value) {
            const file = extractAvatarSvgPath(value);
            if (!file) return null;
            const found = AVATAR_OPTIONS.find((o) => o.file === file);
            return found ? found.type : null;
        }

        function serializeAvatarForSave(value) {
            if (typeof value === 'string' && (value.startsWith('team:') || value.startsWith('photo:'))) {
                return value;
            }
            if (isCustomPhotoAvatar(value)) {
                const storageMatch = value.match(/\/storage\/(avatars\/[^"?]+)/i);
                if (storageMatch) return `photo:${storageMatch[1]}`;
                return value;
            }
            const file = extractAvatarSvgPath(value);
            if (file) return `team:${file}`;
            return value;
        }

        function isLegacyEmojiAvatar(value) {
            return typeof value === 'string' && value.length <= 8 && !value.includes('<') && !value.includes('/');
        }

        function resolveLegacyAvatar(value) {
            if (!value || isLegacyEmojiAvatar(value)) return DEFAULT_AVATAR;
            if (typeof value === 'string' && value.includes('avatars/')) {
                const match = value.match(/avatars\/(.+\.svg)/i);
                if (match) return teamAvatarImg(match[1]);
            }
            return value;
        }

        function getAvatarLabel(type) {
            const found = AVATAR_OPTIONS.find((a) => a.type === type);
            return found ? found.label : type;
        }

        function isTeamAvatar(value) {
            return typeof value === 'string' && (value.startsWith('team:') || value.includes('avatar-glass-emblem'));
        }

        function isCustomPhotoAvatar(value) {
            return typeof value === 'string'
                && (value.startsWith('photo:') || (value.includes('<img') && !isTeamAvatar(value)));
        }

        function highlightAvatarSelection(selector, value, typeHint) {
            const activeType = typeHint || resolveAvatarType(value);
            document.querySelectorAll(selector).forEach((btn) => {
                const btnType = btn.getAttribute('data-avatar-type');
                const active = activeType ? btnType === activeType : false;
                btn.classList.toggle('selected', active);
                btn.classList.toggle('ring-2', active);
                btn.classList.toggle('ring-[var(--theme-primary)]', active);
            });
        }

        function avatarIconHtml(value, size) {
            if (isTeamAvatar(value) || (typeof value === 'string' && value.includes('<img') && !isCustomPhotoAvatar(value))) {
                return `<span class="flex ${size} items-center justify-center overflow-hidden rounded-full">${value}</span>`;
            }
            if (isCustomPhotoAvatar(value)) {
                return `<span class="flex ${size} items-center justify-center overflow-hidden rounded-full">${value}</span>`;
            }
            const textSize = size === 'h-8 w-8' ? 'text-2xl' : (size === 'h-7 w-7' ? 'text-xl' : 'text-3xl');
            return `<span class="${textSize} leading-none flex items-center justify-center">${value}</span>`;
        }

        function normalizeAvatarValue(value, userId) {
            if (!value || typeof value !== 'string') return DEFAULT_AVATAR;
            if (value.startsWith('team:')) return teamAvatarImg(value.slice(5));
            if (value.startsWith('photo:')) {
                const path = value.slice(6).replace(/^\/+/, '');
                const base = (window.LISANI_BASE || '').replace(/\/$/, '');
                return `<img src="${base}/storage/${path}" class="lisani-avatar-img" alt="" />`;
            }
            if (isCustomPhotoAvatar(value)) return value;
            const svgPath = extractAvatarSvgPath(value);
            if (svgPath) return teamAvatarImg(svgPath);
            return resolveLegacyAvatar(value);
        }

        function formatAvatarForDisplay(value, userId) {
            const normalized = normalizeAvatarValue(value, userId);
            if (!normalized) return DEFAULT_AVATAR;
            if (isCustomPhotoAvatar(normalized)) {
                const srcMatch = normalized.match(/src="([^"]+)"/);
                if (srcMatch) {
                    return `<img src="${srcMatch[1]}" class="lisani-avatar-img" alt="" />`;
                }
            }
            if (isTeamAvatar(normalized)) {
                return `<span class="avatar-display-glass">${normalized}</span>`;
            }
            return normalized;
        }

        function applyAvatarToContainer(container, value) {
            if (!container) return;
            container.innerHTML = formatAvatarForDisplay(value);
            const isVisual = isTeamAvatar(value) || isCustomPhotoAvatar(value);
            container.classList.remove('text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl');
            if (!isVisual) {
                const emojiSize = container.classList.contains('lisani-avatar-slot--sm')
                    ? 'text-xl'
                    : container.classList.contains('lisani-avatar-slot--lg')
                      ? 'text-3xl'
                      : 'text-2xl';
                container.classList.add(emojiSize);
            }
        }

        window.applyAvatarToContainer = applyAvatarToContainer;
        window.normalizeAvatarValue = normalizeAvatarValue;
        window.formatAvatarForDisplay = formatAvatarForDisplay;
        window.serializeAvatarForSave = serializeAvatarForSave;
        window.resolveAvatarType = resolveAvatarType;

        function resolveAvatarSlotClass(sizeClass) {
            const map = {
                xs: 'lisani-avatar-slot--xs',
                sm: 'lisani-avatar-slot--sm',
                md: 'lisani-avatar-slot--md',
                lg: 'lisani-avatar-slot--lg',
            };
            if (!sizeClass) return 'lisani-avatar-slot--sm';
            return map[sizeClass] || sizeClass;
        }

        function avatarSlotHtml(value, sizeClass, userId) {
            const slotClass = resolveAvatarSlotClass(sizeClass);
            const normalized = normalizeAvatarValue(value || DEFAULT_AVATAR, userId);
            const content = formatAvatarForDisplay(normalized, userId);
            const isVisual = isTeamAvatar(normalized) || isCustomPhotoAvatar(normalized);
            const emojiCls =
                !isVisual
                    ? slotClass.includes('--xs')
                        ? ' text-sm'
                        : slotClass.includes('--lg')
                          ? ' text-2xl'
                          : ' text-xl'
                    : '';
            return `<span class="lisani-avatar-slot ${slotClass} rounded-full inline-flex items-center justify-center flex-shrink-0${emojiCls}">${content}</span>`;
        }

        window.avatarSlotHtml = avatarSlotHtml;
        window.DEFAULT_AVATAR = DEFAULT_AVATAR;
        window.resolveLegacyAvatar = resolveLegacyAvatar;

        function createAvatarButton(opt, mode) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-avatar-type', opt.type);
            btn.setAttribute('data-avatar-file', opt.file);
            btn.setAttribute('data-avatar-value', `team:${opt.file}`);
            const emoji = teamAvatarImg(opt.file);
            const iconSize = mode === 'register' ? 'h-8 w-8' : 'h-7 w-7';
            const labelSize = mode === 'register' ? 'text-[8px]' : 'text-[7px]';
            btn.className = mode === 'register'
                ? 'avatar-option flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 transition-all duration-200 theme-border'
                : 'edit-avatar-option flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all duration-200 theme-border w-full';
            btn.innerHTML = `${avatarIconHtml(emoji, iconSize)}<span class="${labelSize} font-semibold theme-text-muted truncate max-w-full px-0.5">${opt.label}</span>`;
            if (mode === 'register') {
                btn.addEventListener('click', () => selectAvatar(opt.type));
            } else {
                btn.addEventListener('click', () => selectEditAvatar(opt.type));
            }
            return btn;
        }

        function createPhotoUploadButton(mode) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = mode === 'register'
                ? 'avatar-option flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed theme-border py-2.5 transition-all duration-200'
                : 'edit-avatar-option flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed theme-border py-2 transition-all duration-200 col-span-2';
            btn.innerHTML = mode === 'register'
                ? '<i data-lucide="camera" class="w-7 h-7 theme-text-muted"></i><span class="text-[8px] theme-text-muted font-semibold">Fotoğraf</span>'
                : '<i data-lucide="camera" class="w-3.5 h-3.5 theme-text-muted"></i><span class="text-[7px] theme-text-muted font-semibold">Fotoğraf</span>';
            btn.addEventListener('click', () => {
                if (mode === 'register') triggerAvatarUpload();
                else triggerEditAvatarUpload();
            });
            return btn;
        }

        function initAvatarGrids() {
            const regGrid = document.getElementById('avatar-grid');
            const editGrid = document.getElementById('edit-avatar-grid');
            if (regGrid) {
                regGrid.innerHTML = '';
                AVATAR_OPTIONS.forEach((opt) => regGrid.appendChild(createAvatarButton(opt, 'register')));
                regGrid.appendChild(createPhotoUploadButton('register'));
                highlightAvatarSelection('.avatar-option', selectedAvatarValue);
                const preview = document.getElementById('avatar-preview-big');
                const label = document.getElementById('avatar-preview-label');
                if (preview) applyAvatarToContainer(preview, selectedAvatarValue);
                if (label) label.textContent = getAvatarLabel(selectedAvatarType);
            }
            if (editGrid) {
                editGrid.innerHTML = '';
                AVATAR_OPTIONS.forEach((opt) => editGrid.appendChild(createAvatarButton(opt, 'edit')));
                editGrid.appendChild(createPhotoUploadButton('edit'));
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        let selectedAvatarType = 'besiktas';
        let selectedAvatarValue = DEFAULT_AVATAR;
        let editAvatarValue = DEFAULT_AVATAR;

        window.getSelectedAvatarValue = function () {
            return selectedAvatarValue;
        };
        window.getEditAvatarValue = function () {
            return editAvatarValue;
        };
        window.setEditAvatarValue = function (value) {
            editAvatarValue = value || DEFAULT_AVATAR;
        };

        let registeredUsers = {
            'ahmet': {
                name: 'Ahmet',
                email: 'ahmet@gmail.com',
                password: '123',
                avatar: '🐱'
            }
        };

        let currentUser = null;
        let currentUserRole = null; // 'hoca' veya 'ogrenci'

        // Rol seçimi
        function selectRole(role) {
            document.getElementById('reg-role').value = role;
            const hocaDiv = document.getElementById('reg-sinif-hoca-div');
            const ogrenciDiv = document.getElementById('reg-sinif-ogrenci-div');
            const hocaBtn = document.getElementById('role-btn-hoca');
            const ogrenciBtn = document.getElementById('role-btn-ogrenci');
            const activeClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn is-active';
            const inactiveClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn';
            if (role === 'hoca') {
                hocaBtn.className = activeClass;
                ogrenciBtn.className = inactiveClass;
                if (hocaDiv) hocaDiv.classList.remove('hidden');
                if (ogrenciDiv) ogrenciDiv.classList.add('hidden');
            } else {
                ogrenciBtn.className = activeClass;
                hocaBtn.className = inactiveClass;
                if (hocaDiv) hocaDiv.classList.add('hidden');
                if (ogrenciDiv) ogrenciDiv.classList.remove('hidden');
            }
        }

        function toggleAuthTab(tab) {
            playClickSound();
            const loginTab = document.getElementById('auth-tab-login');
            const registerTab = document.getElementById('auth-tab-register');
            const loginForm = document.getElementById('auth-form-login');
            const registerForm = document.getElementById('auth-form-register');
            const activeClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn is-active';
            const inactiveClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn';

            if (tab === 'login') {
                loginTab.className = activeClass;
                registerTab.className = inactiveClass;
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                registerTab.className = activeClass;
                loginTab.className = inactiveClass;
                registerForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
        }

        function selectAvatar(type) {
            playClickSound();
            const opt = AVATAR_OPTIONS.find((o) => o.type === type);
            if (!opt) return;
            selectedAvatarType = type;
            selectedAvatarValue = `team:${opt.file}`;
            highlightAvatarSelection('.avatar-option', selectedAvatarValue, type);

            const preview = document.getElementById('avatar-preview-big');
            const label = document.getElementById('avatar-preview-label');
            if (preview) applyAvatarToContainer(preview, selectedAvatarValue);
            if (label) label.textContent = getAvatarLabel(type);
        }

        function selectEditAvatar(type) {
            playClickSound();
            const opt = AVATAR_OPTIONS.find((o) => o.type === type);
            if (!opt) return;
            editAvatarValue = `team:${opt.file}`;
            highlightAvatarSelection('.edit-avatar-option', editAvatarValue, type);

            const preview = document.getElementById('edit-avatar-preview');
            applyAvatarToContainer(preview, editAvatarValue);
        }

        function triggerAvatarUpload() {
            playClickSound();
            document.getElementById('avatar-upload-input').click();
        }

        window.hydrateProgressFromServer = function (data) {
            if (!data || currentUserRole === 'hoca') return;

            window._lisaniServerStats = {
                tests_count: Number(data.tests_count) || 0,
                avg_success: Number(data.avg_success) || 0,
                total_xp: Number(data.total_xp) || 0,
            };

            const serverTests = Array.isArray(data.recent_tests) ? data.recent_tests : [];
            const hasDb =
                window._lisaniServerStats.tests_count > 0 ||
                window._lisaniServerStats.total_xp > 0 ||
                serverTests.length > 0;

            if (hasDb) {
                if (serverTests.length > 0) {
                    testHistory = serverTests.map((r, i) => ({
                        id: r.id || i + 1,
                        date: r.date || '',
                        level: r.level,
                        bolum: r.bolum,
                        step: r.step,
                        test: r.test || '',
                        correct: r.correct ?? 0,
                        wrong: r.wrong ?? 0,
                        percent: r.percent ?? 0,
                        score: r.percent ?? 0,
                    }));
                } else if (window._lisaniServerStats.tests_count === 0) {
                    testHistory = [];
                }
                totalScore = window._lisaniServerStats.total_xp;
            }

            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}

            window.refreshAllLearningUI();
        };

        // --- ÖĞRENİM İSTATİSTİKLERİNİ DİNAMİK HESAPLAMA VE GÜNCELLEME ---
        function updateLearningStats() {
            const solvedCountEl = document.getElementById('stats-solved-count');
            const avgSuccessEl = document.getElementById('stats-avg-success');
            const totalXpEl = document.getElementById('stats-total-xp');

            if (!solvedCountEl || !avgSuccessEl || !totalXpEl) return;

            const server = window._lisaniServerStats;
            const solvedCount =
                testHistory.length > 0 ? testHistory.length : server?.tests_count || 0;
            solvedCountEl.innerText = solvedCount;

            let avgSuccess = 0;
            if (testHistory.length > 0) {
                let totalSuccess = 0;
                testHistory.forEach((record) => {
                    totalSuccess += record.percent;
                });
                avgSuccess = Math.round(totalSuccess / testHistory.length);
            } else if (server) {
                avgSuccess = server.avg_success || 0;
            }

            avgSuccessEl.innerText = `%${avgSuccess}`;
            const xpVal = totalScore || server?.total_xp || 0;
            totalXpEl.innerText =
                typeof window.formatLisaniXp === 'function' ? window.formatLisaniXp(xpVal) : xpVal;
            totalXpEl.removeAttribute('title');
        }

        function triggerEditAvatarUpload() {
            playClickSound();
            document.getElementById('edit-avatar-upload-input').click();
        }

        function isYoneticiUser() {
            return currentUserRole === 'yonetici' || (window.currentUser && window.currentUser.role === 'yonetici');
        }
        window.isYoneticiUser = isYoneticiUser;

        function hasStudentFeatures(role) {
            const r = role || currentUserRole || (window.currentUser && window.currentUser.role);
            return r === 'ogrenci' || r === 'yonetici';
        }
        function hasTeacherFeatures(role) {
            const r = role || currentUserRole || (window.currentUser && window.currentUser.role);
            return r === 'hoca' || r === 'yonetici';
        }
        window.hasStudentFeatures = hasStudentFeatures;
        window.hasTeacherFeatures = hasTeacherFeatures;

        function canTrackStudents() {
            return isHocaUser() || isYoneticiUser();
        }
        window.canTrackStudents = canTrackStudents;

        function isHocaUser() {
            return currentUserRole === 'hoca' || (window.currentUser && window.currentUser.role === 'hoca');
        }
        window.isHocaUser = isHocaUser;

        function getHomeRoleBadgeText(role) {
            if (role === 'yonetici') return 'Yönetici';
            if (role === 'hoca') return 'Hoca';
            return 'Matbu Yolcusu';
        }

        function getSettingsRoleBadgeHtml(role) {
            if (role === 'yonetici') return '👑 Yönetici';
            if (role === 'hoca') return '📚 Hoca';
            return '🎒 Öğrenci';
        }

        window.updateHomeRoleBadge = function (role) {
            const el = document.getElementById('home-role-badge');
            if (!el) return;
            const r = role || currentUserRole || (window.currentUser && window.currentUser.role) || 'ogrenci';
            el.textContent = getHomeRoleBadgeText(r);
        };
        window.getSettingsRoleBadgeHtml = getSettingsRoleBadgeHtml;

        window.togglePasswordVisibility = function (inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input || !btn) return;
            if (typeof playClickSound === 'function') playClickSound();
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
            btn.setAttribute('title', show ? 'Şifreyi gizle' : 'Şifreyi göster');
            btn.innerHTML = show
                ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
                : '<i data-lucide="eye" class="w-4 h-4"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        function mapTestsToHistory(tests) {
            return (tests || []).map((r, i) => ({
                id: r.id || i + 1,
                date: r.date || '',
                level: r.level,
                test: r.test || '',
                correct: r.correct ?? 0,
                wrong: r.wrong ?? 0,
                percent: r.percent ?? 0,
                score: r.percent ?? 0,
            }));
        }

        function getDisplayProgressHistory() {
            return testHistory;
        }

        function updateGelisimScreenForRole() {
            const title = document.getElementById('ai-screen-title');
            const subtitle = document.getElementById('ai-screen-subtitle');
            const chartBadge = document.getElementById('ai-chart-badge-label');
            if (title) title.textContent = 'Gelişim Analizi';
            if (subtitle) subtitle.textContent = 'Uygulamada çözdüğünüz testlerin skor geçmişi';
            if (chartBadge) chartBadge.textContent = 'Skorlarım';
        }
        window.updateGelisimScreenForRole = updateGelisimScreenForRole;

        window.refreshProgressView = function () {
            renderProgressChart();
            renderQuizHistoryList();
            const history = getDisplayProgressHistory();
            if (history.length > 0) {
                showTrialDetail(history[history.length - 1].id);
            } else {
                const detailCard = document.getElementById('selected-trial-detail-card');
                if (detailCard) detailCard.classList.add('hidden');
            }
        };

        window.refreshGelisimTab = function () {
            if (canTrackStudents()) {
                if (typeof window.openHocaDashboard === 'function') window.openHocaDashboard();
                return;
            }
            if (typeof window.loadProgressFromServer === 'function') {
                window.loadProgressFromServer();
            } else {
                window.refreshProgressView();
            }
        };

        function bolumPlacementTier(bolumId) {
            if (bolumId === 'kelimeler' || bolumId === 'harfler') return 1;
            if (bolumId === 'eslestirme') return 2;
            return 3;
        }

        function nextTestRecordId() {
            return testHistory.length > 0 ? Math.max(...testHistory.map((h) => h.id)) + 1 : 1;
        }

        window.applyPlacementStartBolum = function (startBolumId) {
            const startIdx = BOLUMLER.findIndex((b) => b.id === startBolumId);
            if (startIdx <= 0) return;

            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
            let nextId = nextTestRecordId();

            for (let i = 0; i < startIdx; i++) {
                const b = BOLUMLER[i];
                if (isBolumCompleted(b.id)) continue;
                testHistory.push({
                    id: nextId++,
                    date: dateStr,
                    level: BOLUM_INDEX[b.id] || i + 1,
                    bolum: b.id,
                    test: b.title,
                    correct: 0,
                    wrong: 0,
                    percent: 100,
                    score: 100,
                    placementSkip: true,
                });
            }

            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}
            if (typeof renderBolumList === 'function') renderBolumList();
        };

        window.getPlacementQuestionPool = function () {
            const pools = window.LISANI_POOLS || {};
            const pool = [];

            function placementTier(kind, q) {
                const d = q.difficulty || 2;
                if (kind === 'letter') return d >= 2 ? 1 : 0;
                if (kind === 'card') return d >= 3 ? 2 : d >= 2 ? 1 : 0;
                if (kind === 'tiles') return d >= 4 ? 3 : d >= 3 ? 2 : 0;
                if (kind === 'speak') return d >= 4 ? 3 : d >= 3 ? 2 : 0;
                if (kind === 'grammar') return d >= 4 ? 4 : d >= 3 ? 3 : 0;
                return 0;
            }

            Object.keys(pools).forEach((kind) => {
                (pools[kind] || []).forEach((q) => {
                    if (!q.options || q.options.length < 2) return;
                    const tier = placementTier(kind, q);
                    if (!tier) return;
                    pool.push({ ...q, tier, level: tier, bolum: kind });
                });
            });
            return pool;
        };

        let placementState = null;
        let placementAdvanceTimer = null;
        let placementResumeAfterLearn = false;

        function recommendStartBolumFromPlacement(answers) {
            function tierPct(tier) {
                const rows = answers.filter((a) => a.tier === tier);
                if (!rows.length) return 0;
                return rows.filter((a) => a.correct).length / rows.length;
            }
            const t1 = tierPct(1);
            const t2 = tierPct(2);
            const t3 = tierPct(3);
            const t4 = tierPct(4);
            if (t1 < 0.55) return 'kelimeler';
            if (t2 < 0.55) return 'harfler';
            if (t3 < 0.55) return 'eslestirme';
            if (t4 < 0.5 || t3 < 0.75) return 'ceviri';
            return 'ses';
        }

        function buildPlacementLearnTip(q) {
            if (typeof window.buildLisaniLearnTip === 'function') return window.buildLisaniLearnTip(q);
            return q?.learnTip || q?.grammarNote || (q?.answer ? `Doğru cevap: «${q.answer}»` : '');
        }

        function renderPlacementQuestion() {
            if (!placementState) return;
            const q = placementState.questions[placementState.index];
            if (!q) return;

            const total = placementState.questions.length;
            const current = placementState.index + 1;
            const progressEl = document.getElementById('placement-progress');
            if (progressEl) progressEl.textContent = `Soru ${current}/${total}`;
            const progressFill = document.getElementById('placement-progress-fill');
            if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;

            const defaultPrompt = window.LISANI_CARD_PROMPT || 'Resme bak · doğru cevabı seç';
            const box = document.getElementById('placement-question-box');
            if (!box) return;

            const optionLabels = ['A', 'B', 'C', 'D'];
            const optionsHtml = q.options
                .map(
                    (opt, idx) => `
                <button type="button" class="lisani-placement-option lisani-glass-panel w-full py-3 px-3.5 rounded-xl text-xs font-bold text-left flex items-center gap-3 cursor-pointer active:scale-[0.98]" data-option="${opt.replace(/"/g, '&quot;')}">
                    <span class="lisani-quiz-option__letter">${optionLabels[idx] || '•'}</span>
                    <span class="flex-1 min-w-0 leading-relaxed">${opt}</span>
                </button>`
                )
                .join('');

            box.innerHTML = `
                <div class="lisani-placement-card lisani-glass-panel rounded-2xl p-5 text-center space-y-3">
                    <div class="text-4xl leading-none">${q.image || '📖'}</div>
                    <p class="text-[9px] theme-text-muted uppercase font-bold tracking-[0.2em]">${q.prompt || defaultPrompt}</p>
                    <h2 class="arabic-text text-2xl font-black theme-text-main lisani-quiz-arabic">${(q.word || '').replace(/\n/g, '<br>')}</h2>
                </div>
                <div class="lisani-placement-options space-y-3 mt-4">${optionsHtml}</div>`;

            box.querySelectorAll('.lisani-placement-option').forEach((btn) => {
                btn.onclick = () => {
                    if (placementAdvanceTimer) return;
                    const selected = btn.getAttribute('data-option');
                    const isCorrect = selected === q.answer;
                    placementState.answers.push({ tier: q.tier || 1, correct: isCorrect });

                    box.querySelectorAll('.lisani-placement-option').forEach((b) => {
                        b.disabled = true;
                        if (b.getAttribute('data-option') === q.answer) {
                            b.classList.add('lisani-quiz-option--correct');
                        } else if (b === btn && !isCorrect) {
                            b.classList.add('lisani-quiz-option--wrong');
                        }
                    });

                    const learnTip = !isCorrect ? buildPlacementLearnTip(q) : '';
                    let learnEl = document.getElementById('placement-learn-tip');
                    if (!learnEl && learnTip) {
                        learnEl = document.createElement('div');
                        learnEl.id = 'placement-learn-tip';
                        learnEl.className = 'lisani-learn-card lisani-learn-card--tap mt-3 text-[10px] leading-relaxed text-left';
                        learnEl.setAttribute('role', 'button');
                        learnEl.setAttribute('tabindex', '0');
                        box.appendChild(learnEl);
                    }
                    if (learnEl) {
                        if (learnTip) {
                            renderLearnCardChip(learnEl, q, learnTip, { pausePlacementAdvance: true });
                        } else {
                            learnEl.classList.add('hidden');
                            learnEl.innerHTML = '';
                        }
                    }

                    placementAdvanceTimer = setTimeout(() => {
                        placementAdvanceTimer = null;
                        placementState.index++;
                        if (placementState.index < placementState.questions.length) {
                            renderPlacementQuestion();
                        } else {
                            finishPlacementQuiz();
                        }
                    }, isCorrect ? 550 : learnTip ? 5000 : 900);
                };
            });
        }

        function finishPlacementQuiz() {
            const startBolumId = recommendStartBolumFromPlacement(placementState?.answers || []);
            const meta = getBolumMeta(startBolumId);
            const startTitle = meta?.title || startBolumId;

            if (window.LisaniDailyTasks?.applyPlacementResult) {
                window.LisaniDailyTasks.applyPlacementResult(startBolumId);
            } else if (typeof window.applyPlacementStartBolum === 'function') {
                window.applyPlacementStartBolum(startBolumId);
            }

            const qBox = document.getElementById('placement-question-box');
            const result = document.getElementById('placement-result');
            if (qBox) qBox.classList.add('hidden');
            if (result) {
                result.classList.remove('hidden');
                result.innerHTML = `
                    <div class="lisani-glass-panel rounded-2xl p-4 text-center space-y-3">
                        <p class="text-2xl">🎯</p>
                        <h4 class="text-sm font-extrabold theme-text-main">Başlangıç bölümün</h4>
                        <p class="text-xs theme-primary-color font-bold">${startTitle}</p>
                        <p class="text-[10px] theme-text-muted leading-relaxed">Önceki bölümler atlandı; uygun bölümden devam edeceksin.</p>
                        <button type="button" id="placement-start-btn" class="lisani-glass-action lisani-glass-action--primary w-full py-3 rounded-xl text-xs font-bold">Öğrenmeye Devam Et</button>
                    </div>`;
                document.getElementById('placement-start-btn')?.addEventListener('click', () => {
                    window.closePlacementModal();
                    if (typeof window.openLearnTests === 'function') {
                        window.openLearnTests(startBolumId);
                    }
                });
            }

            if (typeof showToast === 'function') {
                showToast(`Başlangıç bölümü: ${startTitle}`, 'success');
            }
            placementState = null;
        }

        window.launchPlacementQuiz = function (questions) {
            if (!questions?.length) return;
            if (placementAdvanceTimer) clearTimeout(placementAdvanceTimer);
            placementAdvanceTimer = null;

            placementState = {
                questions: questions.map(shuffleQuestionOptions),
                index: 0,
                answers: [],
            };

            const modal = document.getElementById('placement-modal');
            const qBox = document.getElementById('placement-question-box');
            const result = document.getElementById('placement-result');
            if (modal) modal.classList.remove('hidden');
            if (qBox) qBox.classList.remove('hidden');
            if (result) {
                result.classList.add('hidden');
                result.innerHTML = '';
            }
            const progressFill = document.getElementById('placement-progress-fill');
            if (progressFill) progressFill.style.width = `${(1 / questions.length) * 100}%`;
            renderPlacementQuestion();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        window.closePlacementModal = function () {
            if (placementAdvanceTimer) clearTimeout(placementAdvanceTimer);
            placementAdvanceTimer = null;
            placementState = null;
            document.getElementById('placement-modal')?.classList.add('hidden');
        };

        window.odevVerFromTest = function (bolumId, testName) {
            if (typeof window.__lisaniOdevVerFromTest === 'function') {
                window.__lisaniOdevVerFromTest(bolumId, testName);
                return;
            }
            const uid = currentUser?.uid || currentUser?.id;
            if (!uid) {
                showToast('Giriş gerekli.', 'error');
                return;
            }
            const meta = getBolumMeta(bolumId);
            const assign = { bolum: bolumId, label: meta?.title || bolumId };
            if (typeof window.odevVer === 'function') {
                window.odevVer(uid, assign);
                return;
            }
            showToast('Ödev servisi yüklenemedi. Sayfayı yenileyin.', 'error');
        };

        function updateTestsTabForRole() {
            const hint = document.getElementById('tests-hoca-hint');
            const studentHint = document.getElementById('tests-student-hint');
            const placementBtn = document.getElementById('tests-placement-btn');
            const yoneticiBar = document.getElementById('tests-yonetici-sinif-bar');
            const assignMode = isTestsAssignMode();
            if (hint) hint.classList.toggle('hidden', !assignMode);
            if (studentHint) studentHint.classList.toggle('hidden', assignMode);
            if (placementBtn) placementBtn.classList.toggle('hidden', assignMode || isYoneticiUser());
            if (yoneticiBar) {
                yoneticiBar.classList.toggle('hidden', !isYoneticiUser() || !window._testsAssignMode);
            }
            updateTestsAssignToggleUI();
            if (isYoneticiUser() && window._testsAssignMode && typeof window.loadTestsYoneticiSinifSelect === 'function') {
                window.loadTestsYoneticiSinifSelect();
            }
        }
        window.updateTestsTabForRole = updateTestsTabForRole;

        function hasLegacyBolumComplete(bolumId) {
            const meta = getBolumMeta(bolumId);
            const title = meta?.title || bolumId;
            return testHistory.some(
                (r) =>
                    (r.bolum === bolumId || String(r.test || '').trim() === title) &&
                    (r.step == null || r.step === undefined)
            );
        }

        function isBolumStepCompleted(bolumId, stepIndex) {
            if (hasLegacyBolumComplete(bolumId)) return true;
            const step = stepIndex + 1;
            return testHistory.some((r) => r.bolum === bolumId && Number(r.step) === step);
        }

        function countBolumStepsCompleted(bolumId) {
            if (hasLegacyBolumComplete(bolumId)) return BOLUM_STEPS();
            let n = 0;
            for (let i = 0; i < BOLUM_STEPS(); i++) {
                if (isBolumStepCompleted(bolumId, i)) n++;
            }
            return n;
        }

        function isBolumStepUnlocked(bolumId, stepIndex) {
            if (stepIndex <= 0) return true;
            return isBolumStepCompleted(bolumId, stepIndex - 1);
        }

        function getNextBolumStepIndex(bolumId) {
            for (let i = 0; i < BOLUM_STEPS(); i++) {
                if (!isBolumStepCompleted(bolumId, i)) return i;
            }
            return BOLUM_STEPS() - 1;
        }

        function isBolumCompleted(bolumId) {
            return countBolumStepsCompleted(bolumId) >= BOLUM_STEPS();
        }

        function isBolumUnlocked(bolumIndex) {
            if (bolumIndex <= 0) return true;
            const prev = BOLUMLER[bolumIndex - 1];
            return prev ? isBolumCompleted(prev.id) : true;
        }

        function getBolumIndex(bolumId) {
            return BOLUMLER.findIndex((b) => b.id === bolumId);
        }

        window.isBolumCompleted = isBolumCompleted;
        window.isBolumUnlocked = isBolumUnlocked;

        function getCompletedBolumRecord(bolumId) {
            const stepRecords = testHistory.filter((r) => r.bolum === bolumId && r.step != null);
            if (stepRecords.length) {
                return stepRecords.reduce((best, r) => ((r.percent ?? 0) > (best.percent ?? 0) ? r : best));
            }
            const meta = getBolumMeta(bolumId);
            const title = meta?.title || bolumId;
            return testHistory.find(
                (r) => r.bolum === bolumId || String(r.test || '').trim() === title
            );
        }

        function resetQuizPanels() {
            stopSpeechListening();
            if (quizAdvanceTimer) {
                clearTimeout(quizAdvanceTimer);
                quizAdvanceTimer = null;
            }
            document.getElementById('quiz-options-container')?.classList.remove('hidden');
            document.getElementById('quiz-match-area')?.classList.add('hidden');
            document.getElementById('quiz-voice-area')?.classList.add('hidden');
            document.getElementById('quiz-tiles-area')?.classList.add('hidden');
            document.getElementById('quiz-next-btn')?.classList.add('hidden');
            document.getElementById('quiz-feedback-box')?.classList.add('hidden');
            document.getElementById('quiz-learn-card')?.classList.add('hidden');
            document.getElementById('quiz-grammar-note')?.classList.add('hidden');
            document.querySelector('#quiz-active-view .lisani-quiz-question')?.classList.remove(
                'lisani-quiz-flash--ok',
                'lisani-quiz-flash--bad'
            );
            tilesSelection = [];
            tilesPickedIndices = new Set();
            activeQuestionAnswered = false;
        }

        function lockQuizQuestion() {
            activeQuestionAnswered = true;
        }

        function isQuizQuestionLocked() {
            return activeQuestionAnswered || !!quizAdvanceTimer;
        }

        function disableTileControls() {
            document.querySelectorAll('#quiz-tiles-grid button, #quiz-tiles-clear-btn, #quiz-tiles-check-btn').forEach((b) => {
                b.disabled = true;
            });
        }

        function stopSpeakMeterOnly() {
            if (speakMeterRaf) {
                cancelAnimationFrame(speakMeterRaf);
                speakMeterRaf = null;
            }
            if (speakAudioCtx) {
                speakAudioCtx.close().catch(() => {});
                speakAudioCtx = null;
            }
            speakAnalyser = null;
            resetSpeakMeterUI();
        }

        function resetSpeakMeterUI() {
            document.querySelectorAll('.lisani-speak-meter__bar').forEach((bar) => {
                bar.style.transform = 'scaleY(0.18)';
                bar.style.opacity = '0.35';
            });
        }

        function updateSpeakMeterUI(level) {
            const bars = document.querySelectorAll('.lisani-speak-meter__bar');
            const n = bars.length || 1;
            bars.forEach((bar, i) => {
                const dist = Math.abs(i / (n - 1 || 1) - 0.5);
                const boost = 1.15 - dist * 0.9;
                const barLevel = Math.max(0, level * boost);
                const h = 0.18 + Math.min(1, barLevel * 2.6) * 0.82;
                bar.style.transform = `scaleY(${h.toFixed(3)})`;
                bar.style.opacity = barLevel > 0.04 ? String(0.45 + barLevel * 0.55) : '0.35';
            });
        }

        function startSpeakMeter(stream) {
            stopSpeakMeterOnly();
            speakMediaStream = stream;
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                speakAudioCtx = new Ctx();
                const src = speakAudioCtx.createMediaStreamSource(stream);
                speakAnalyser = speakAudioCtx.createAnalyser();
                speakAnalyser.fftSize = 256;
                speakAnalyser.smoothingTimeConstant = 0.72;
                src.connect(speakAnalyser);
                const buf = new Uint8Array(speakAnalyser.frequencyBinCount);
                const tick = () => {
                    if (!speakAnalyser) return;
                    speakAnalyser.getByteFrequencyData(buf);
                    let sum = 0;
                    for (let i = 0; i < buf.length; i++) sum += buf[i];
                    const level = sum / buf.length / 255;
                    updateSpeakMeterUI(level);
                    speakMeterRaf = requestAnimationFrame(tick);
                };
                tick();
            } catch (e) {}
        }

        function stopNativeSpeechListening() {
            const plugin = window.Capacitor?.Plugins?.LisaniMic;
            if (plugin?.stopListening) {
                plugin.stopListening().catch(() => {});
            }
            if (nativeSpeechListener) {
                nativeSpeechListener.remove().catch(() => {});
                nativeSpeechListener = null;
            }
        }

        function stopSpeechListening() {
            voiceListening = false;
            if (speakListenTimer) {
                clearTimeout(speakListenTimer);
                speakListenTimer = null;
            }
            if (speakCountdownTimer) {
                clearInterval(speakCountdownTimer);
                speakCountdownTimer = null;
            }
            speakListenDeadline = 0;
            stopSpeakMeterOnly();
            stopNativeSpeechListening();
            if (speakMediaStream) {
                speakMediaStream.getTracks().forEach((t) => t.stop());
                speakMediaStream = null;
            }
            if (speechRecognition) {
                try {
                    speechRecognition.onresult = null;
                    speechRecognition.onerror = null;
                    speechRecognition.onend = null;
                    speechRecognition.stop();
                } catch (e) {}
                speechRecognition = null;
            }
        }

        function updateSpeakCountdownUI() {
            const el = document.getElementById('quiz-speak-timer');
            if (!el || !speakListenDeadline) return;
            const left = Math.max(0, Math.ceil((speakListenDeadline - Date.now()) / 1000));
            el.textContent = `${left} sn`;
            el.style.setProperty('--speak-pct', `${(left / (SPEAK_LISTEN_MS() / 1000)) * 100}%`);
        }

        function setQuizTypeBadge(type) {
            const meta = (window.LISANI_QUIZ_META || {})[type] || {};
            const badge = document.getElementById('quiz-type-badge');
            const wrap = document.getElementById('quiz-visual-wrap');
            const imgEl = document.getElementById('quiz-visual-image');
            if (badge) {
                if (meta.label) {
                    badge.textContent = meta.label;
                    badge.className = `lisani-quiz-type-badge lisani-quiz-type-badge--${type || 'card'}`;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
            if (wrap && imgEl) {
                if (type === 'card') {
                    wrap.classList.remove('hidden');
                } else {
                    imgEl.textContent = '';
                    wrap.classList.add('hidden');
                }
            }
        }

        function normalizeSpeechText(s) {
            return String(s || '')
                .toLowerCase()
                .trim()
                .replace(/[«»"'.,!?;:]/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/ı/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c');
        }

        function speechTokens(text) {
            return normalizeSpeechText(text)
                .split(' ')
                .map((t) => t.trim())
                .filter((t) => t.length > 1);
        }

        function speechTokenOverlap(spoken, target) {
            const spokenTokens = speechTokens(spoken);
            const targetTokens = speechTokens(target);
            if (!targetTokens.length || !spokenTokens.length) return false;
            const hits = targetTokens.filter((t) =>
                spokenTokens.some((s) => s === t || s.includes(t) || t.includes(s))
            );
            const ratio = activeBolumId === 'ses' ? 0.85 : activeBolumId === 'ceviri' ? 0.65 : 0.5;
            const need = targetTokens.length === 1 ? 1 : Math.max(2, Math.ceil(targetTokens.length * ratio));
            return hits.length >= need;
        }

        function speechMatchesSpeak(spoken, q) {
            const n = normalizeSpeechText(spoken);
            if (!n) return false;
            const skips = q.skipPhrases || ['su an konusamam', 'suan konusamam'];
            if (skips.some((p) => n.includes(normalizeSpeechText(p)))) return 'skip';
            const targets = (q.speakMatch || []).map(normalizeSpeechText);
            const tokens = speechTokens(n);

            for (const t of targets) {
                if (!t) continue;
                if (t.includes(' ') || t.length > 4) {
                    if (n.includes(t) || t.includes(n)) return true;
                    if (speechTokenOverlap(n, t)) return true;
                    continue;
                }
                if (n === t || tokens.includes(t)) return true;
            }

            if (q.speakHint) {
                const hint = normalizeSpeechText(q.speakHint);
                if (hint && (n === hint || tokens.includes(hint))) return true;
            }
            return false;
        }

        function speakSkipLabel() {
            return window.LISANI_SKIP_SPEAK_LABEL || 'Şuan konuşamam';
        }

        function isCapacitorApp() {
            return !!(
                window.Capacitor &&
                typeof window.Capacitor.isNativePlatform === 'function' &&
                window.Capacitor.isNativePlatform()
            );
        }

        function isMobileApp() {
            return (
                isCapacitorApp() ||
                /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
            );
        }

        function bindTapAction(el, handler) {
            if (!el || typeof handler !== 'function') return;
            let lastFire = 0;
            let touchStart = null;
            let pointerStart = null;

            const run = (e) => {
                const now = Date.now();
                if (now - lastFire < 400) return;
                lastFire = now;
                if (e && e.cancelable) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                try {
                    handler(e);
                } catch (err) {
                    console.error('bindTapAction', err);
                    if (typeof showToast === 'function') {
                        showToast('İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin.', 'error');
                    }
                }
            };

            const movedTooMuch = (x, y, start) => {
                if (!start) return false;
                return Math.abs(x - start.x) > 22 || Math.abs(y - start.y) > 22;
            };

            el.style.touchAction = 'manipulation';
            el.style.webkitTapHighlightColor = 'transparent';
            el.style.cursor = 'pointer';

            if (window.PointerEvent) {
                el.addEventListener(
                    'pointerdown',
                    (e) => {
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
                    },
                    { passive: true }
                );
                el.addEventListener(
                    'pointerup',
                    (e) => {
                        if (!pointerStart || e.pointerId !== pointerStart.id) return;
                        const start = pointerStart;
                        pointerStart = null;
                        if (movedTooMuch(e.clientX, e.clientY, start)) return;
                        run(e);
                    },
                    { passive: false }
                );
                el.addEventListener('pointercancel', () => {
                    pointerStart = null;
                });
            }

            const onTouchStart = (e) => {
                const t = e.changedTouches && e.changedTouches[0];
                if (!t) return;
                touchStart = { x: t.clientX, y: t.clientY };
            };

            const onTouchEnd = (e) => {
                const t = e.changedTouches && e.changedTouches[0];
                if (!t) return;
                if (movedTooMuch(t.clientX, t.clientY, touchStart)) {
                    touchStart = null;
                    return;
                }
                touchStart = null;
                run(e);
            };

            if (isMobileApp()) {
                el.addEventListener('touchstart', onTouchStart, { passive: true });
                el.addEventListener('touchend', onTouchEnd, { passive: false });
            }
            el.addEventListener('click', (e) => {
                if (isMobileApp() && Date.now() - lastFire < 520) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                run(e);
            });
        }
        window.bindTapAction = bindTapAction;

        function isTestsAssignMode() {
            if (isYoneticiUser() || isHocaUser()) return !!window._testsAssignMode;
            return false;
        }

        window.toggleTestsAssignMode = function (ev) {
            if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
            if (!isYoneticiUser() && !isHocaUser()) return;
            window._testsAssignMode = !window._testsAssignMode;
            updateTestsAssignToggleUI();
            renderBolumList();
            showToast(
                window._testsAssignMode ? 'Ödev ata modu — teste dokunun' : 'Test modu — çözmeye devam',
                'info'
            );
        };

        function updateTestsAssignToggleUI() {
            const btn = document.getElementById('tests-assign-toggle');
            if (!btn) return;
            btn.classList.toggle('hidden', !(isYoneticiUser() || isHocaUser()));
            btn.classList.toggle('is-active', !!window._testsAssignMode);
            btn.textContent = window._testsAssignMode ? 'Test Modu' : 'Ödev Ata';
        }

        function assignOdevFromBolumStep(bolum, stepIndex) {
            const testName = `Test ${stepIndex + 1}`;
            if (typeof window.odevVerFromTest === 'function') {
                window.odevVerFromTest(bolum.id, testName);
            }
        }

        function bindBolumAction(btn, bolum, stepIndex, assignMode) {
            const handler = assignMode
                ? () => assignOdevFromBolumStep(bolum, stepIndex)
                : () => startBolumStep(bolum.id, stepIndex);
            bindTapAction(btn, handler);
            btn.addEventListener(
                'keydown',
                (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handler(e);
                    }
                },
                false
            );
        }

        function ensureLisaniQuizBank() {
            if (window.LISANI_POOLS && Object.keys(window.LISANI_POOLS).length) return true;
            return false;
        }

        function startBolumStep(bolumId, stepIndex) {
            if (!ensureLisaniQuizBank()) {
                showToast('Soru bankası yükleniyor… Birkaç saniye sonra tekrar deneyin.', 'error');
                return;
            }
            const bolumIndex = getBolumIndex(bolumId);
            if (bolumIndex > 0 && !isBolumUnlocked(bolumIndex) && !isHocaUser() && !isYoneticiUser()) {
                showToast('Önce önceki bölümü tamamla.', 'info');
                return;
            }
            if (!isBolumStepUnlocked(bolumId, stepIndex) && !isYoneticiUser()) {
                showToast(`${stepIndex + 1}. test için önce ${stepIndex}. testi bitir.`, 'info');
                return;
            }
            launchQuizEngine(bolumId, stepIndex);
        }

        function resolveLisaniAssetUrl(url, fallbackPath) {
            const base = (window.LISANI_BASE || '').replace(/\/$/, '');
            const path = fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`;
            let raw = url || (base ? `${base}${path}` : path);
            if (/^https?:\/\//i.test(raw)) return raw;
            if (raw.startsWith('//')) return `${window.location.protocol}${raw}`;
            if (raw.startsWith('/')) return `${window.location.origin}${raw}`;
            return `${window.location.origin}/${String(raw).replace(/^\.\//, '')}`;
        }

        function getChestAssetUrls() {
            const assets = window.LISANI_ASSETS || {};
            const rev = assets.chestRev || '';
            const withRev = (url, file) => {
                const raw = resolveLisaniAssetUrl(url, `/images/chest/${file}`);
                if (!rev) return raw;
                const clean = String(raw).replace(/([?&])v=[^&]+/g, '');
                const sep = clean.includes('?') ? '&' : '?';
                return `${clean}${sep}v=${rev}`;
            };
            return {
                ready: withRev(assets.chestReady, 'treasure-chest-ready.png'),
                opened: withRev(assets.chestOpened, 'treasure-chest-opened.png'),
                locked: withRev(assets.chestLocked, 'treasure-chest-locked.png'),
            };
        }

        function initKariyerCoverImages() {
            const url = window.LISANI_ASSETS?.kariyerCover;
            if (!url) return;
            document.querySelectorAll('.lisani-kariyer-cover-bg').forEach((el) => {
                if (el.tagName === 'IMG' && el.getAttribute('src') !== url) {
                    el.src = url;
                }
            });
        }

        function treasureChestIcon(state) {
            const urls = getChestAssetUrls();
            const src = urls[state] || urls.ready;
            return `<span class="lisani-bolum-chest__icon lisani-bolum-chest__icon--${state}" aria-hidden="true">
                <img src="${src}" alt="" class="lisani-treasure-chest-img" width="256" height="256" decoding="async" loading="eager" draggable="false"${state === 'ready' ? ' fetchpriority="high"' : ''} />
            </span>`;
        }

        function createBolumChest(bolum, bolumUnlocked, assignMode) {
            const chest = document.createElement('button');
            chest.type = 'button';
            chest.className = 'lisani-bolum-chest';
            chest.setAttribute('aria-label', `${bolum.title} sandığı`);
            const completed = isBolumCompleted(bolum.id);
            const chestReady =
                !assignMode &&
                bolumUnlocked &&
                completed &&
                typeof window.canSpinRewardWheel === 'function' &&
                window.canSpinRewardWheel(bolum.id);
            const chestClaimed =
                !assignMode && bolumUnlocked && completed && !chestReady;

            if (!bolumUnlocked || assignMode) {
                chest.classList.add('is-hidden');
                chest.disabled = true;
            } else if (chestReady) {
                chest.classList.add('is-ready');
                chest.innerHTML = treasureChestIcon('ready');
                chest.onclick = () => {
                    if (typeof window.openBolumChestWheel === 'function') {
                        window.openBolumChestWheel(bolum.id);
                    }
                };
            } else if (chestClaimed) {
                chest.classList.add('is-opened');
                chest.innerHTML = treasureChestIcon('opened');
                chest.disabled = true;
            } else {
                chest.classList.add('is-locked');
                chest.innerHTML = treasureChestIcon('locked');
                chest.disabled = true;
            }
            return chest;
        }

        function createBolumRoundNode(bolum, turIndex, subIndex, assignMode, bolumUnlocked) {
            const node = document.createElement('button');
            node.type = 'button';
            const turClass = `lisani-bolum-tur--${turIndex + 1}`;
            const stepDone = isBolumStepCompleted(bolum.id, subIndex);
            const unlocked = assignMode || isYoneticiUser() || (bolumUnlocked && isBolumStepUnlocked(bolum.id, subIndex));
            let className = `lisani-bolum-node lisani-bolum-node--sub lisani-bolum-path-item--step-${subIndex + 1} ${turClass}`;
            if (stepDone) className += ' is-path-complete';
            if (!unlocked) className += ' is-locked';
            node.className = className;
            node.setAttribute('aria-label', `${bolum.title} · test ${subIndex + 1}`);
            node.innerHTML = stepDone
                ? `<span class="lisani-bolum-node__icon">✓</span>`
                : `<span class="lisani-bolum-node__num">${subIndex + 1}</span>`;
            if (!assignMode && !unlocked) {
                bindTapAction(node, () =>
                    showToast(`${subIndex + 1}. test için önce ${subIndex}. testi bitir.`, 'info')
                );
            } else {
                bindBolumAction(node, bolum, subIndex, assignMode);
            }
            return node;
        }

        function createBolumNodeTrack(bolum, turIndex, assignMode, bolumUnlocked) {
            const wrap = document.createElement('div');
            wrap.className = 'lisani-bolum-path-wrap';
            const track = document.createElement('div');
            track.className = 'lisani-bolum-node-track';
            for (let subIndex = 0; subIndex < BOLUM_STEPS(); subIndex++) {
                track.appendChild(createBolumRoundNode(bolum, turIndex, subIndex, assignMode, bolumUnlocked));
            }
            wrap.appendChild(track);
            wrap.appendChild(createBolumChest(bolum, bolumUnlocked, assignMode));
            return wrap;
        }

        function setTestsSubview(mode) {
            if (mode === 'list') {
                ['quiz-active-view', 'quiz-result-view'].forEach((id) => {
                    document.getElementById(id)?.classList.add('hidden');
                });
                document.getElementById('kariyer-modal-container')?.classList.remove('hidden');
                if (typeof renderBolumList === 'function') renderBolumList();
            } else {
                document.getElementById('kariyer-modal-container')?.classList.add('hidden');
                const showId =
                    mode === 'quiz'
                        ? 'quiz-active-view'
                        : mode === 'result'
                          ? 'quiz-result-view'
                          : null;
                ['quiz-active-view', 'quiz-result-view'].forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.classList.toggle('hidden', id !== showId);
                });
            }
        }

        function ensureTestsScreenVisible() {
            document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
            document.getElementById('screen-tests')?.classList.add('active');
            currentActiveScreen = 'tests';
        }

        function renderBolumList(highlightBolumId) {
            const container = document.getElementById('bolum-buttons-container');
            if (!container) return;
            container.innerHTML = '';
            const assignMode = isTestsAssignMode();
            let highlightEl = null;

            BOLUMLER.forEach((bolum, index) => {
                const yoneticiFreePlay = isYoneticiUser() && !assignMode;
                const bolumUnlocked = assignMode || yoneticiFreePlay || isBolumUnlocked(index);
                const stepsDone = countBolumStepsCompleted(bolum.id);
                const completed = stepsDone >= BOLUM_STEPS();
                const record = completed ? getCompletedBolumRecord(bolum.id) : null;
                const nextStep = getNextBolumStepIndex(bolum.id);
                const btn = document.createElement('button');
                btn.type = 'button';
                const turClass = `lisani-bolum-tur--${index + 1}`;
                let btnClass = `lisani-bolum-dot-btn ${turClass}${completed ? ' is-done' : ''}`;
                if (!bolumUnlocked) btnClass += ' is-bolum-locked';
                btn.className = btnClass;

                const metaText = assignMode
                    ? 'Ödev ver'
                    : !bolumUnlocked
                      ? 'Önceki bölümü bitir'
                      : completed
                        ? `Tamamlandı · %${record?.percent ?? 0}`
                        : `${stepsDone}/${BOLUM_STEPS()} test · ${bolum.desc}`;

                btn.innerHTML = `
                    <span class="lisani-bolum-dot-btn__circle">${completed ? '✓' : !bolumUnlocked ? '🔒' : bolum.icon}</span>
                    <span class="lisani-bolum-dot-btn__text">
                        <span class="lisani-bolum-dot-btn__label">${bolum.title}</span>
                        <span class="lisani-bolum-dot-btn__meta">${metaText}</span>
                    </span>`;

                if (bolumUnlocked) {
                    bindBolumAction(btn, bolum, nextStep, assignMode);
                } else {
                    bindTapAction(btn, () => showToast('Önce önceki bölümü tamamla.', 'info'));
                }

                const block = document.createElement('div');
                const blockCurve = index % 2 === 0 ? 'lisani-bolum-tur-block--c-reverse' : 'lisani-bolum-tur-block--c-normal';
                const chestSide = blockCurve.includes('c-normal') ? ' lisani-bolum-tur-block--chest-left' : '';
                block.className = `lisani-bolum-tur-block ${blockCurve}${chestSide}${!bolumUnlocked ? ' is-bolum-locked' : ''}`;
                block.appendChild(btn);

                block.appendChild(createBolumNodeTrack(bolum, index, assignMode, bolumUnlocked));

                if (highlightBolumId && bolum.id === highlightBolumId) {
                    btn.classList.add('is-highlight');
                    highlightEl = btn;
                }

                container.appendChild(block);
            });
            if (highlightEl) {
                setTimeout(() => {
                    highlightEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 120);
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function startBolum(bolumId) {
            startBolumStep(bolumId, getNextBolumStepIndex(bolumId));
        }

        function goBackToBolumler() {
            playClickSound();
            stopSpeechListening();
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;
            setTestsSubview('list');
            renderBolumList();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        window.goBackToLevels = goBackToBolumler;
        window.goBackToTestList = goBackToBolumler;

        function goBackFromQuiz() {
            playClickSound();
            stopSpeechListening();
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            if (activeQuestionIndex > 0 || activeCorrects > 0 || activeWrongs > 0) {
                if (!confirm('Bölümden çıkılsın mı? Bu oturumdaki ilerleme kaydedilmez.')) return;
            }
            goBackToBolumler();
        }
        window.goBackFromQuiz = goBackFromQuiz;

        function launchQuizEngine(bolumId, stepIndex = 0) {
            const meta = getBolumMeta(bolumId);
            if (!meta) {
                showToast('Bölüm bulunamadı.', 'error');
                return false;
            }
            const bolumIndex = getBolumIndex(bolumId);
            if (bolumIndex > 0 && !isBolumUnlocked(bolumIndex) && !isHocaUser() && !isYoneticiUser()) {
                showToast('Önce önceki bölümü tamamla.', 'info');
                return false;
            }
            if (!isBolumStepUnlocked(bolumId, stepIndex) && !isYoneticiUser()) {
                showToast(`${stepIndex + 1}. test için önce ${stepIndex}. testi bitir.`, 'info');
                return false;
            }
            if (!window.LISANI_POOLS || !Object.keys(window.LISANI_POOLS).length) {
                showToast('Soru bankası yüklenemedi. Bağlantıyı kontrol edip tekrar deneyin.', 'error');
                return false;
            }

            if (
                (bolumId === 'ceviri' || bolumId === 'ses') &&
                window.LisaniGrammarPrep?.ensureGrammarReady
            ) {
                window.LisaniGrammarPrep.ensureGrammarReady(bolumId, stepIndex, (ok) => {
                    if (ok) runQuizSession(bolumId, stepIndex);
                });
                return true;
            }
            return runQuizSession(bolumId, stepIndex);
        }

        function usesTestLives() {
            return !isGrammarDrillSession && !isWrongReviewSession;
        }

        function resetTestLives() {
            activeLives = TEST_LIVES_MAX;
            updateQuizLivesUI();
        }

        function updateQuizLivesUI() {
            const el = document.getElementById('quiz-lives-display');
            if (!el) return;
            if (!usesTestLives()) {
                el.classList.add('hidden');
                el.innerHTML = '';
                return;
            }
            el.classList.remove('hidden');
            const parts = [];
            for (let i = 0; i < TEST_LIVES_MAX; i++) {
                parts.push(
                    `<span class="lisani-life-heart${i < activeLives ? ' is-full' : ' is-empty'}" aria-hidden="true">${i < activeLives ? '♥' : '♡'}</span>`
                );
            }
            el.innerHTML = parts.join('');
            el.setAttribute('aria-label', `${activeLives} can kaldı`);
        }

        function registerQuizWrong() {
            activeWrongs++;
            if (usesTestLives()) {
                activeLives = Math.max(0, activeLives - 1);
                updateQuizLivesUI();
            }
            recordWrongQuestion(activeQuizQuestions[activeQuestionIndex]);
        }

        function eliminateFromTest() {
            if (quizAdvanceTimer) {
                clearTimeout(quizAdvanceTimer);
                quizAdvanceTimer = null;
            }
            pendingStepCompletion = false;
            stopSpeechListening();
            lastTestSummary = {
                correct: activeCorrects,
                wrong: activeWrongs,
                percent: Math.round((activeCorrects / Math.max(1, activeQuizQuestions.length)) * 100),
                eliminated: true,
            };
            lastTestWrongQuestions = activeWrongQuestions.map((q) => JSON.parse(JSON.stringify(q)));
            showQuizResultPanel(false, true);
            setTestsSubview('result');
            renderBolumList(activeBolumId);
            if (typeof maybePromptAppRating === 'function') maybePromptAppRating();
        }

        function runQuizSession(bolumId, stepIndex = 0) {
            const meta = getBolumMeta(bolumId);
            playClickSound();
            isGrammarDrillSession = false;
            activeBolumId = bolumId;
            activeBolumStep = stepIndex;
            activeLevel = BOLUM_INDEX[bolumId] || 1;
            activeTestName = `${meta.title} ${stepIndex + 1}/${BOLUM_STEPS()}`;
            activeQuestionIndex = 0;
            activeCorrects = 0;
            activeWrongs = 0;
            resetTestLives();
            activeWrongQuestions = [];
            isWrongReviewSession = false;
            pendingStepCompletion = false;
            activeSessionQuestionKeys = [];
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;

            const sessionQuestions = prepareBolumSession(bolumId, stepIndex);
            if (!sessionQuestions.length) {
                showToast('Bu bölüm henüz hazır değil.', 'info');
                return false;
            }

            activeQuizQuestions = JSON.parse(JSON.stringify(sessionQuestions));
            activeSessionQuestionKeys = activeQuizQuestions.map((q) => quizQuestionKey(q));

            if (window.LisaniDailyTasks && typeof window.LisaniDailyTasks.onBolumOpen === 'function') {
                window.LisaniDailyTasks.onBolumOpen(bolumId);
            }

            document.getElementById('active-quiz-title').innerText = activeTestName;
            document.getElementById('kariyer-modal-container')?.classList.add('hidden');
            ensureTestsScreenVisible();
            setTestsSubview('quiz');
            if (typeof switchTab === 'function') switchTab('tests', true, true);
            currentActiveScreen = 'tests';
            renderQuizQuestion();
            updateQuizLivesUI();
            if (typeof updateTestsTabForRole === 'function') updateTestsTabForRole();
            requestAnimationFrame(() => {
                document.getElementById('quiz-active-view')?.scrollIntoView({ block: 'start', behavior: 'auto' });
            });
            return true;
        }

        window.launchGrammarDrillSession = function (questions, topicId) {
            if (!questions?.length) return false;
            closeLearnCardDetail();
            isGrammarDrillSession = true;
            isWrongReviewSession = false;
            window._lisaniGrammarDrillTopic = topicId || '';
            activeBolumId = 'grammar-drill';
            activeBolumStep = 0;
            const topicTitle =
                (window.LISANI_GRAMMAR_TOPIC_TITLES && window.LISANI_GRAMMAR_TOPIC_TITLES[topicId]) ||
                topicId ||
                'Dil bilgisi';
            activeLevel = 4;
            activeTestName = `${topicTitle} · mini test`;
            activeQuestionIndex = 0;
            activeCorrects = 0;
            activeWrongs = 0;
            resetTestLives();
            activeWrongQuestions = [];
            pendingStepCompletion = false;
            activeSessionQuestionKeys = [];
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;

            activeQuizQuestions = questions.map((q) =>
                q.options ? shuffleQuestionOptions(JSON.parse(JSON.stringify(q))) : JSON.parse(JSON.stringify(q))
            );

            document.getElementById('active-quiz-title').innerText = activeTestName;
            document.getElementById('kariyer-modal-container')?.classList.add('hidden');
            ensureTestsScreenVisible();
            setTestsSubview('quiz');
            if (typeof switchTab === 'function') switchTab('tests', true, true);
            currentActiveScreen = 'tests';
            renderQuizQuestion();
            if (typeof showToast === 'function') {
                showToast('Mini test: en az 1 doğru gerekli.', 'info');
            }
            return true;
        };

        window.launchQuizEngine = launchQuizEngine;

        window.openLearnTests = function (bolumIdHint) {
            playClickSound();
            stopSpeechListening();
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;
            openKariyerModu(bolumIdHint);
        };

        window.startLevel = startBolum;
        window.startBolum = startBolum;
        window.startBolumStep = startBolumStep;
        window.renderBolumList = renderBolumList;

        window.startOdevTest = function (levelOrOdev, testName) {
            if (typeof levelOrOdev === 'object' && levelOrOdev !== null) {
                const odev = levelOrOdev;
                if (odev.bolum) {
                    const step = odev.step != null ? Number(odev.step) : 0;
                    if (typeof switchTab === 'function') switchTab('tests', true);
                    startBolumStep(odev.bolum, step);
                    return;
                }
                levelOrOdev = odev.level;
                testName = odev.test;
            }
            const legacyTestMap = { 'Test 1': 0, 'Test 2': 1, 'Test 3': 2, Genel: 4 };
            const step = legacyTestMap[testName];
            const bolum = BOLUMLER.find((b) => (BOLUM_INDEX[b.id] || 0) === Number(levelOrOdev));
            if (bolum) {
                if (typeof switchTab === 'function') switchTab('tests', true);
                launchQuizEngine(bolum.id, step != null ? step : 0);
                return;
            }
            if (typeof switchTab === 'function') switchTab('tests', true);
        };

        function setQuizPrompt(text) {
            const el = document.getElementById('quiz-prompt-label');
            if (el) el.textContent = text || 'Soru';
        }

        function showQuizVisual(image, word, type) {
            const wrap = document.getElementById('quiz-visual-wrap');
            const imgEl = document.getElementById('quiz-visual-image');
            const wordEl = document.getElementById('quiz-display-word');
            setQuizTypeBadge(type || 'card');
            if (type === 'card' && wrap) {
                wrap.classList.remove('hidden');
                if (imgEl) imgEl.textContent = image || '';
            }
            if (wordEl) wordEl.innerHTML = (word || '').replace(/\n/g, '<br>');
        }

        function animateQuizCard() {
            const panel = document.querySelector('.lisani-quiz-question');
            if (!panel) return;
            panel.classList.remove('is-entering');
            void panel.offsetWidth;
            panel.classList.add('is-entering');
        }

        let speakSessionId = 0;

        function getLearnCardDetail(source) {
            if (!source) return null;
            if (typeof source === 'string' && typeof window.buildLisaniLearnDetailFromTopic === 'function') {
                return window.buildLisaniLearnDetailFromTopic(source);
            }
            if (typeof window.buildLisaniLearnDetail === 'function') {
                return window.buildLisaniLearnDetail(source);
            }
            return {
                title: 'Öğrenme notu',
                summary: typeof window.buildLisaniLearnTip === 'function' ? window.buildLisaniLearnTip(source) : '',
                detail: source?.learnTip || source?.grammarNote || '',
                examples: source?.answer ? [`Doğru cevap: ${source.answer}`] : [],
            };
        }

        function renderLearnCardChip(el, source, summaryText, opts = {}) {
            if (!el) return;
            const summary = summaryText || (typeof window.buildLisaniLearnTip === 'function' ? window.buildLisaniLearnTip(source) : '');
            if (!summary) {
                el.classList.add('hidden');
                el.innerHTML = '';
                el.removeAttribute('data-learn-source');
                return;
            }
            el.classList.remove('hidden');
            el.classList.add('lisani-learn-card--tap');
            el.setAttribute('aria-hidden', 'false');
            el.innerHTML = `<span class="lisani-learn-card__icon" aria-hidden="true">📚</span><span class="lisani-learn-card__text">${summary}</span><span class="lisani-learn-card__cta">Detay için dokun →</span>`;
            el._lisaniLearnSource = source;
            el._lisaniLearnOpts = opts;
            if (!el._lisaniLearnBound) {
                el._lisaniLearnBound = true;
                const open = (e) => {
                    if (e) e.stopPropagation();
                    openLearnCardDetail(el._lisaniLearnSource, el._lisaniLearnOpts || {});
                };
                el.addEventListener('click', open);
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open(e);
                    }
                });
            }
        }

        window.openLearnCardDetail = function (source, opts = {}) {
            const detail = getLearnCardDetail(source);
            if (!detail) return;

            const modal = document.getElementById('learn-card-modal');
            const titleEl = document.getElementById('learn-card-modal-title');
            const summaryEl = document.getElementById('learn-card-modal-summary');
            const bodyEl = document.getElementById('learn-card-modal-detail');
            const examplesEl = document.getElementById('learn-card-modal-examples');
            const examplesWrap = document.getElementById('learn-card-modal-examples-wrap');

            if (titleEl) titleEl.textContent = detail.title || 'Bilgi kartı';
            if (summaryEl) summaryEl.textContent = detail.summary || '';
            if (bodyEl) bodyEl.textContent = detail.detail || '';
            if (examplesEl) {
                const examples = (detail.examples || []).filter(Boolean);
                examplesEl.innerHTML = examples
                    .map((ex) => `<li class="lisani-learn-modal__example arabic-text">${ex}</li>`)
                    .join('');
                if (examplesWrap) examplesWrap.classList.toggle('hidden', !examples.length);
            }

            const drillBtn = document.getElementById('learn-card-drill-btn');
            const topicId =
                opts.drillTopic || (typeof source === 'string' ? source : source?.grammarTopic || '');
            if (drillBtn) {
                if (topicId && (opts.showDrillAction || typeof source === 'string')) {
                    drillBtn.classList.remove('hidden');
                    drillBtn.onclick = () => {
                        if (window.LisaniGrammarPrep?.startTopicDrill) {
                            window.LisaniGrammarPrep.startTopicDrill(topicId);
                        }
                    };
                } else {
                    drillBtn.classList.add('hidden');
                    drillBtn.onclick = null;
                }
            }

            if (opts.pauseQuizAdvance && quizAdvanceTimer) {
                clearTimeout(quizAdvanceTimer);
                quizAdvanceTimer = null;
                learnCardAdvancePaused = true;
                learnCardResumeAfterClose = true;
            }

            if (opts.pausePlacementAdvance && placementAdvanceTimer) {
                clearTimeout(placementAdvanceTimer);
                placementAdvanceTimer = null;
                placementResumeAfterLearn = true;
            }

            if (modal) {
                const host = document.getElementById('app-container');
                if (host && modal.parentElement !== host) host.appendChild(modal);
                modal.classList.remove('hidden');
                modal.setAttribute('aria-hidden', 'false');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        window.closeLearnCardDetail = function () {
            document.getElementById('learn-card-modal')?.classList.add('hidden');
            document.getElementById('learn-card-modal')?.setAttribute('aria-hidden', 'true');

            if (learnCardResumeAfterClose) {
                learnCardResumeAfterClose = false;
                learnCardAdvancePaused = false;
                quizAdvanceTimer = setTimeout(() => {
                    quizAdvanceTimer = null;
                    activeQuestionIndex++;
                    if (activeQuestionIndex < activeQuizQuestions.length) {
                        renderQuizQuestion();
                    } else {
                        finishQuizEngine();
                    }
                }, 600);
            }

            if (placementResumeAfterLearn && placementState) {
                placementResumeAfterLearn = false;
                placementAdvanceTimer = setTimeout(() => {
                    placementAdvanceTimer = null;
                    placementState.index++;
                    if (placementState.index < placementState.questions.length) {
                        renderPlacementQuestion();
                    } else {
                        finishPlacementQuiz();
                    }
                }, 600);
            }
        };

        function proactiveLearnTip(q) {
            if (!q) return '';
            const hardBolum = activeBolumId === 'ses' || activeBolumId === 'ceviri';
            if (!hardBolum) return '';
            const d = q.difficulty || 2;
            if (activeBolumId === 'ses' && d < 4) return '';
            if (activeBolumId === 'ceviri' && d < 3) return '';
            return typeof window.buildLisaniLearnTip === 'function' ? window.buildLisaniLearnTip(q) : q.learnTip || '';
        }

        function showQuizLearnCard(q, isWrong) {
            const el = document.getElementById('quiz-learn-card');
            if (!el) return false;
            const tip =
                isWrong && typeof window.buildLisaniLearnTip === 'function'
                    ? window.buildLisaniLearnTip(q)
                    : isWrong
                      ? q?.learnTip || q?.grammarNote || ''
                      : '';
            if (!tip) {
                el.classList.add('hidden');
                el.innerHTML = '';
                el.setAttribute('aria-hidden', 'true');
                return false;
            }
            renderLearnCardChip(el, q, tip, { pauseQuizAdvance: true });
            return true;
        }

        function bindGrammarNoteTap(q) {
            const learnEl = document.getElementById('quiz-grammar-note');
            if (!learnEl || learnEl.classList.contains('hidden')) return;
            learnEl._lisaniLearnSource = q;
            if (!learnEl._lisaniLearnBound) {
                learnEl._lisaniLearnBound = true;
                const open = (e) => {
                    if (e) e.stopPropagation();
                    openLearnCardDetail(learnEl._lisaniLearnSource, { pauseQuizAdvance: false });
                };
                learnEl.addEventListener('click', open);
                learnEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open(e);
                    }
                });
            }
        }

        function grammarWrongFeedback(correct) {
            if (isGrammarDrillSession) return `✗ Yanlış — doğru cevap: «${correct}»`;
            if (activeBolumId === 'ceviri' || activeBolumId === 'ses') {
                return '✗ Yanlış — önce Kurallar bölümünden konuyu çalış';
            }
            return `✗ Yanlış — doğru cevap: «${correct}»`;
        }

        function applyQuizLearnHint(q) {
            const learnEl = document.getElementById('quiz-grammar-note');
            if (!learnEl) return;
            if (q.type === 'grammar') {
                const topicName =
                    (window.LISANI_GRAMMAR_TOPIC_TITLES && window.LISANI_GRAMMAR_TOPIC_TITLES[q.grammarTopic]) ||
                    'Dil bilgisi';
                const locked =
                    window.LisaniGrammarPrep &&
                    q.grammarTopic &&
                    !window.LisaniGrammarPrep.isTopicUnlocked(q.grammarTopic);
                learnEl.innerHTML = locked
                    ? `🔒 ${topicName} — önce çalış<span class="lisani-learn-card__cta-inline"> · detay</span>`
                    : `📖 ${topicName}<span class="lisani-learn-card__cta-inline"> · kuralı hatırla</span>`;
                learnEl.classList.remove('hidden');
                bindGrammarNoteTap(q);
                return;
            }
            const proactive = proactiveLearnTip(q);
            if (proactive) {
                learnEl.innerHTML = `📖 ${proactive}<span class="lisani-learn-card__cta-inline"> · detay</span>`;
                learnEl.classList.remove('hidden');
            } else {
                learnEl.textContent = '';
                learnEl.classList.add('hidden');
            }
            bindGrammarNoteTap(q);
        }

        function showQuizFeedback(isCorrect, customMsg) {
            const box = document.getElementById('quiz-feedback-box');
            const card = document.querySelector('#quiz-active-view .lisani-quiz-question');
            const msg = customMsg || (isCorrect ? '✓ Harika! Doğru cevap' : '✗ Yanlış cevap');
            if (box) {
                box.classList.remove('hidden', 'lisani-quiz-feedback--ok', 'lisani-quiz-feedback--bad');
                box.classList.add(isCorrect ? 'lisani-quiz-feedback--ok' : 'lisani-quiz-feedback--bad');
                box.textContent = msg;
                box.setAttribute('aria-hidden', 'false');
            }
            if (card) {
                card.classList.remove('lisani-quiz-flash--ok', 'lisani-quiz-flash--bad');
                void card.offsetWidth;
                card.classList.add(isCorrect ? 'lisani-quiz-flash--ok' : 'lisani-quiz-flash--bad');
            }
            const speakPanel = document.querySelector('.lisani-speak-panel');
            if (speakPanel) {
                speakPanel.classList.remove('lisani-speak-panel--ok', 'lisani-speak-panel--bad');
                speakPanel.classList.add(isCorrect ? 'lisani-speak-panel--ok' : 'lisani-speak-panel--bad');
            }
            if (isCorrect && typeof playSuccessSound === 'function') playSuccessSound();
        }

        function scheduleQuizAdvance(isCorrect, feedbackMsg) {
            const q = activeQuizQuestions[activeQuestionIndex];
            const showedLearn = !isCorrect && showQuizLearnCard(q, true);
            showQuizFeedback(isCorrect, feedbackMsg);
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            const delay = isCorrect ? 900 : showedLearn ? 4500 : 1100;
            quizAdvanceTimer = setTimeout(() => {
                quizAdvanceTimer = null;
                if (!isCorrect && usesTestLives() && activeLives <= 0) {
                    eliminateFromTest();
                    return;
                }
                activeQuestionIndex++;
                if (activeQuestionIndex < activeQuizQuestions.length) {
                    renderQuizQuestion();
                } else {
                    finishQuizEngine();
                }
            }, delay);
        }

        function renderQuizQuestion() {
            stopSpeechListening();
            resetQuizPanels();
            const q = activeQuizQuestions[activeQuestionIndex];
            if (!q) return;

            if (q.type === 'speak') {
                renderSpeakQuestion(q);
                return;
            }
            if (q.type === 'tiles') {
                renderTilesQuestion(q);
                return;
            }

            const total = activeQuizQuestions.length;
            const current = activeQuestionIndex + 1;
            const counterEl = document.getElementById('active-question-counter');
            if (counterEl) counterEl.innerText = `${current} / ${total}`;

            const progressBar = document.getElementById('quiz-progress-bar');
            if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;

            const defaultPrompt = window.LISANI_CARD_PROMPT || 'Resme bak · doğru cevabı seç';
            setQuizPrompt(q.prompt || defaultPrompt);
            showQuizVisual(q.image, q.word, q.type || 'card');

            const grammarNoteEl = document.getElementById('quiz-grammar-note');
            if (grammarNoteEl) {
                applyQuizLearnHint(q);
            }

            const container = document.getElementById('quiz-options-container');
            if (!container || !q.options) return;
            container.innerHTML = '';

            const optionLabels = ['A', 'B', 'C', 'D'];
            q.options.forEach((option, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.dataset.option = option;
                btn.className =
                    'lisani-quiz-option w-full py-3 px-3.5 rounded-xl theme-text-main text-xs font-bold transition-all text-left flex items-center gap-3 cursor-pointer active:scale-[0.98]';
                btn.innerHTML = `
                    <span class="lisani-quiz-option__letter">${optionLabels[idx] || '•'}</span>
                    <span class="flex-1 min-w-0 leading-relaxed">${option}</span>`;
                bindTapAction(btn, () => selectQuizOption(option, q.answer, btn));
                container.appendChild(btn);
            });

            animateQuizCard();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function isMobileSpeakDevice() {
            return (
                /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent || ''
                ) ||
                (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
            );
        }

        function needsMicUserGesture() {
            return isMobileSpeakDevice();
        }

        function isSecureMicContext() {
            return (
                window.isSecureContext === true ||
                location.protocol === 'https:' ||
                location.hostname === 'localhost' ||
                location.hostname === '127.0.0.1' ||
                isCapacitorApp()
            );
        }

        function micPermissionSettingsHint() {
            if (isCapacitorApp()) {
                return 'Mikrofon kapalı · Ayarlar → Uygulamalar → Lisanı Ecdad → İzinler → Mikrofon → İzin ver';
            }
            if (isMobileSpeakDevice()) {
                return 'Mikrofon kapalı · Ayarlar → Site → Mikrofon → İzin ver, sonra tekrar dokunun.';
            }
            return 'Mikrofon izni reddedildi · adres çubuğundaki kilit simgesinden izin verin.';
        }

        async function requestNativeMicPermission() {
            if (!isCapacitorApp()) return null;
            const plugin = window.Capacitor?.Plugins?.LisaniMic;
            if (!plugin || typeof plugin.requestPermission !== 'function') return null;
            try {
                const result = await plugin.requestPermission();
                return !!(result && result.granted);
            } catch (err) {
                if (err && err.data && typeof err.data.granted === 'boolean') {
                    return err.data.granted;
                }
                return false;
            }
        }

        function setSpeakStatus(text, listening) {
            const status = document.getElementById('quiz-voice-status');
            if (!status) return;
            status.classList.toggle('is-listening', !!listening);
            status.textContent = text;
        }

        function updateMicButtonState(mode) {
            const micBtn = document.getElementById('quiz-voice-mic-btn');
            if (!micBtn) return;
            const label = micBtn.querySelector('span');
            micBtn.classList.remove('is-listening', 'is-permission');
            if (mode === 'listening') {
                micBtn.classList.add('is-listening');
                if (label) label.textContent = 'Dinleniyor…';
            } else if (mode === 'permission') {
                micBtn.classList.add('is-permission');
                if (label) label.textContent = isMobileSpeakDevice() ? 'Mikrofon İzni Ver' : 'Dinlemeyi Başlat';
            } else if (mode === 'ready') {
                if (label) label.textContent = 'Tekrar Dinle';
            }
        }

        function hasWebSpeechRecognition() {
            return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        }

        function shouldUseNativeSpeech() {
            return (
                isCapacitorApp() &&
                !!(window.Capacitor?.Plugins?.LisaniMic?.startListening) &&
                (!hasWebSpeechRecognition() || /Android/i.test(navigator.userAgent || ''))
            );
        }

        function getNativeMicPlugin() {
            return window.Capacitor?.Plugins?.LisaniMic ?? null;
        }

        async function refreshMicPermissionUI() {
            const statusEl = document.getElementById('notif-mic-status');
            const settingsBtn = document.getElementById('notif-mic-settings-btn');
            if (!statusEl) return;

            let label = 'Henüz sorulmadı';
            if (!isSecureMicContext()) {
                label = 'HTTPS gerekli';
            } else if (!navigator.mediaDevices?.getUserMedia) {
                label = 'Bu cihaz desteklemiyor';
            } else {
                const plugin = getNativeMicPlugin();
                if (isCapacitorApp() && plugin?.checkPermission) {
                    try {
                        const result = await plugin.checkPermission();
                        label = result?.granted ? 'İzin verildi ✓' : 'İzin verilmedi';
                        micPermissionGranted = !!result?.granted;
                    } catch (e) {
                        label = micPermissionGranted ? 'İzin verildi ✓' : 'Kontrol edilemedi';
                    }
                } else if (navigator.permissions?.query) {
                    try {
                        const perm = await navigator.permissions.query({ name: 'microphone' });
                        label =
                            perm.state === 'granted'
                                ? 'İzin verildi ✓'
                                : perm.state === 'denied'
                                  ? 'Reddedildi'
                                  : 'Henüz sorulmadı';
                        if (perm.state === 'granted') micPermissionGranted = true;
                    } catch (e) {
                        label = micPermissionGranted ? 'İzin verildi ✓' : 'Henüz sorulmadı';
                    }
                } else {
                    label = micPermissionGranted ? 'İzin verildi ✓' : 'Henüz sorulmadı';
                }
            }

            statusEl.textContent = `Durum: ${label}`;
            if (settingsBtn) {
                settingsBtn.classList.toggle(
                    'hidden',
                    !(isCapacitorApp() && (label === 'Reddedildi' || label === 'İzin verilmedi'))
                );
            }
        }
        window.refreshMicPermissionUI = refreshMicPermissionUI;

        async function ensureMicPermission(forcePrompt) {
            if (micPermissionGranted && !forcePrompt) return true;
            if (!isSecureMicContext()) {
                setSpeakStatus('Mikrofon için güvenli bağlantı gerekli (HTTPS).');
                return false;
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setSpeakStatus('Bu cihazda mikrofon desteklenmiyor · «Şuan konuşamam» ile atlayın.');
                return false;
            }
            try {
                if (isCapacitorApp()) {
                    setSpeakStatus('Mikrofon izni isteniyor… İzin penceresinde «İzin ver» deyin.');
                    const nativeGranted = await requestNativeMicPermission();
                    if (nativeGranted === false) {
                        setSpeakStatus(micPermissionSettingsHint());
                        return false;
                    }
                }
                if (navigator.permissions && navigator.permissions.query) {
                    try {
                        const perm = await navigator.permissions.query({ name: 'microphone' });
                        if (perm.state === 'granted') {
                            micPermissionGranted = true;
                            if (typeof refreshMicPermissionUI === 'function') refreshMicPermissionUI();
                            return true;
                        }
                    } catch (e) {
                        /* Safari'de permissions.query desteklenmeyebilir */
                    }
                }
                if (!isCapacitorApp()) {
                    setSpeakStatus('Mikrofon izni isteniyor… İzin penceresine «İzin ver» deyin.');
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true },
                });
                stream.getTracks().forEach((t) => t.stop());
                micPermissionGranted = true;
                if (typeof refreshMicPermissionUI === 'function') refreshMicPermissionUI();
                setSpeakStatus('Mikrofon hazır · dinlemeyi başlatın.');
                return true;
            } catch (err) {
                micPermissionGranted = false;
                if (typeof refreshMicPermissionUI === 'function') refreshMicPermissionUI();
                const name = err && err.name ? err.name : '';
                if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                    setSpeakStatus(micPermissionSettingsHint());
                } else if (name === 'NotFoundError') {
                    setSpeakStatus('Mikrofon bulunamadı · kulaklık/mikrofon bağlantısını kontrol edin.');
                } else {
                    setSpeakStatus('Mikrofon açılamadı · tekrar deneyin veya «Şuan konuşamam» deyin.');
                }
                return false;
            }
        }
        window.ensureMicPermissionPublic = ensureMicPermission;

        function renderSpeakQuestion(q) {
            const total = activeQuizQuestions.length;
            const current = activeQuestionIndex + 1;
            const counterEl = document.getElementById('active-question-counter');
            if (counterEl) counterEl.innerText = `${current} / ${total}`;

            const progressBar = document.getElementById('quiz-progress-bar');
            if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;

            const speakPrompt = window.LISANI_SPEAK_PROMPT || 'Kelimeyi Türkçe okuyun';
            setQuizPrompt(q.prompt || speakPrompt);
            showQuizVisual(null, q.word, 'speak');

            applyQuizLearnHint(q);

            document.getElementById('quiz-options-container')?.classList.add('hidden');

            const voiceArea = document.getElementById('quiz-voice-area');
            const skipLabel = speakSkipLabel();
            const listenSec = speakListenSecLabel();
            const meterBars = Array.from({ length: 14 }, () => '<span class="lisani-speak-meter__bar"></span>').join('');
            const session = ++speakSessionId;
            if (voiceArea) {
                voiceArea.classList.remove('hidden');
                const micLabel = needsMicUserGesture() ? 'Mikrofon İzni Ver' : 'Dinlemeyi Başlat';
                const statusHint = needsMicUserGesture()
                    ? 'Konuşmak için önce mikrofona izin verin · telefon izin penceresinde «İzin ver» seçin'
                    : 'Konuş · ses çubuğu altta yükselir';
                voiceArea.innerHTML = `
                    <div class="lisani-speak-panel lisani-glass-panel rounded-2xl p-4 space-y-3">
                        <div class="flex items-center justify-center gap-3">
                            <div class="lisani-speak-timer-ring" aria-hidden="true">
                                <span id="quiz-speak-timer" class="lisani-speak-timer-ring__label">${listenSec} sn</span>
                            </div>
                            <button type="button" id="quiz-voice-mic-btn" class="lisani-voice-mic-btn lisani-voice-mic-btn--pro is-permission">
                                <i data-lucide="mic" class="w-5 h-5"></i>
                                <span>${micLabel}</span>
                            </button>
                        </div>
                        <p id="quiz-voice-status" class="text-[10px] theme-text-muted text-center lisani-voice-status leading-relaxed">${statusHint}</p>
                        <div class="lisani-speak-meter" id="quiz-speak-meter" aria-hidden="true">${meterBars}</div>
                        <button type="button" id="quiz-speak-skip-btn" class="lisani-glass-action w-full py-2.5 rounded-xl text-[11px] font-bold theme-text-muted">${skipLabel}</button>
                    </div>`;
                bindTapAction(document.getElementById('quiz-voice-mic-btn'), () => startSpeakAnswer(q));
                bindTapAction(document.getElementById('quiz-speak-skip-btn'), () => handleQuizSkip());
            }

            animateQuizCard();
            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (!needsMicUserGesture()) {
                setTimeout(() => {
                    if (session !== speakSessionId) return;
                    if (activeQuizQuestions[activeQuestionIndex] !== q) return;
                    startSpeakAnswer(q);
                }, 500);
            }
        }

        function renderTilesQuestion(q) {
            const total = activeQuizQuestions.length;
            const current = activeQuestionIndex + 1;
            const counterEl = document.getElementById('active-question-counter');
            if (counterEl) counterEl.innerText = `${current} / ${total}`;

            const progressBar = document.getElementById('quiz-progress-bar');
            if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;

            const tilesPrompt = window.LISANI_TILES_PROMPT || 'Kelimeleri sırayla seçin';
            setQuizPrompt(q.prompt || tilesPrompt);
            showQuizVisual(null, q.word, 'tiles');

            applyQuizLearnHint(q);

            document.getElementById('quiz-options-container')?.classList.add('hidden');
            document.getElementById('quiz-voice-area')?.classList.add('hidden');

            tilesSelection = [];
            tilesPickedIndices = new Set();
            const area = document.getElementById('quiz-tiles-area');
            if (!area) return;
            area.classList.remove('hidden');
            area.innerHTML = `
                <div id="quiz-tiles-answer" class="lisani-tiles-answer lisani-glass-panel rounded-xl p-3 min-h-[2.75rem] flex flex-wrap gap-1.5 items-center justify-center"></div>
                <div id="quiz-tiles-grid" class="lisani-tiles-grid grid grid-cols-2 sm:grid-cols-3 gap-2"></div>
                <div class="flex gap-2">
                    <button type="button" id="quiz-tiles-clear-btn" class="lisani-glass-action flex-1 py-2.5 rounded-xl text-[10px] font-bold theme-text-muted">Temizle</button>
                    <button type="button" id="quiz-tiles-check-btn" class="lisani-glass-action lisani-glass-action--primary flex-1 py-2.5 rounded-xl text-[10px] font-bold">Kontrol Et</button>
                </div>`;

            const grid = document.getElementById('quiz-tiles-grid');
            const answerEl = document.getElementById('quiz-tiles-answer');
            (q.tiles || []).forEach((tile, tileIdx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'lisani-tile-chip lisani-glass-panel py-2.5 px-2 rounded-xl text-[11px] font-bold theme-text-main';
                btn.textContent = tile;
                btn.dataset.tile = tile;
                btn.dataset.tileIdx = String(tileIdx);
                bindTapAction(btn, () => {
                    if (isQuizQuestionLocked()) return;
                    if (tilesSelection.length >= (q.answerOrder || []).length) return;
                    if (tilesPickedIndices.has(tileIdx)) return;
                    tilesPickedIndices.add(tileIdx);
                    tilesSelection.push(tile);
                    refreshTilesUI(q, answerEl, grid);
                });
                grid.appendChild(btn);
            });

            bindTapAction(document.getElementById('quiz-tiles-clear-btn'), () => {
                if (isQuizQuestionLocked()) return;
                tilesSelection = [];
                tilesPickedIndices = new Set();
                refreshTilesUI(q, answerEl, grid);
            });
            bindTapAction(document.getElementById('quiz-tiles-check-btn'), () => {
                if (tilesSelection.length < (q.answerOrder || []).length) {
                    showToast('Önce tüm kelimeleri seçin', 'info');
                    return;
                }
                checkTilesAnswer(q);
            });

            refreshTilesUI(q, answerEl, grid);
            animateQuizCard();
        }

        function refreshTilesUI(q, answerEl, grid) {
            if (answerEl) {
                answerEl.innerHTML =
                    tilesSelection.length === 0
                        ? '<span class="text-[10px] theme-text-muted">Seçilen kelimeler burada görünür</span>'
                        : tilesSelection
                              .map(
                                  (t) =>
                                      `<span class="lisani-tile-chip lisani-tile-chip--picked inline-flex py-1 px-2 rounded-lg text-[10px] font-bold">${t}</span>`
                              )
                              .join('');
            }
            grid?.querySelectorAll('button').forEach((btn) => {
                const idx = parseInt(btn.dataset.tileIdx, 10);
                const picked = tilesPickedIndices.has(idx);
                btn.disabled = picked || isQuizQuestionLocked();
                btn.classList.toggle('opacity-40', picked);
            });
        }

        function checkTilesAnswer(q) {
            if (isQuizQuestionLocked()) return;
            lockQuizQuestion();
            disableTileControls();
            const expected = (q.answerOrder || []).map((s) => normalizeSpeechText(s));
            const got = tilesSelection.map((s) => normalizeSpeechText(s));
            const isCorrect =
                got.length === expected.length && got.every((w, i) => w === expected[i]);
            const grid = document.getElementById('quiz-tiles-grid');
            const answerEl = document.getElementById('quiz-tiles-answer');
            const expectedLabel = (q.answerOrder || []).join(' ');
            if (isCorrect) {
                answerEl?.classList.add('lisani-tiles-answer--ok');
                finalizeQuizAnswer(true, null, '✓ Harika! Doğru cevap');
            } else {
                answerEl?.classList.add('lisani-tiles-answer--bad');
                if (answerEl) {
                    answerEl.innerHTML = `<span class="text-[10px] text-red-300 font-bold">Doğrusu: ${expectedLabel}</span>`;
                }
                finalizeQuizAnswer(false, null, `✗ Yanlış — doğru: «${expectedLabel}»`);
            }
        }

        async function startSpeakAnswer(q) {
            if (isQuizQuestionLocked() || voiceListening) return;

            if (!isSecureMicContext()) {
                setSpeakStatus('Telefonda mikrofon için HTTPS gerekli · site adresi https:// ile açılmalı.');
                return;
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setSpeakStatus('Mikrofon desteklenmiyor · «Şuan konuşamam» ile atlayın.');
                return;
            }

            stopSpeechListening();
            updateMicButtonState('permission');
            setSpeakStatus('Mikrofon hazırlanıyor…');

            const permitted = await ensureMicPermission();
            if (!permitted) {
                updateMicButtonState('permission');
                return;
            }

            if (shouldUseNativeSpeech()) {
                beginNativeSpeakListening(q);
                return;
            }

            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) {
                setSpeakStatus('Ses tanıma desteklenmiyor · Ayarlardan mikrofon izni verin veya «Şuan konuşamam» kullanın.');
                return;
            }

            navigator.mediaDevices
                .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
                .then((stream) => {
                    startSpeakMeter(stream);
                    beginSpeakListening(q, SR, document.getElementById('quiz-voice-status'), document.getElementById('quiz-voice-mic-btn'));
                })
                .catch((err) => {
                    const name = err && err.name ? err.name : '';
                    micPermissionGranted = false;
                    if (typeof refreshMicPermissionUI === 'function') refreshMicPermissionUI();
                    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                        setSpeakStatus(`${micPermissionSettingsHint()} · sonra «Mikrofon İzni Ver»e dokunun.`);
                    } else {
                        setSpeakStatus('Mikrofon açılamadı · tekrar deneyin veya atlayın.');
                    }
                    updateMicButtonState('permission');
                });
        }

        function beginNativeSpeakListening(q) {
            const plugin = getNativeMicPlugin();
            const status = document.getElementById('quiz-voice-status');
            const micBtn = document.getElementById('quiz-voice-mic-btn');
            if (!plugin?.startListening) {
                setSpeakStatus('Ses tanıma bu sürümde desteklenmiyor · «Şuan konuşamam» ile atlayın.');
                return;
            }

            voiceListening = true;
            speakListenDeadline = Date.now() + SPEAK_LISTEN_MS();
            updateSpeakCountdownUI();
            resetSpeakMeterUI();
            updateMicButtonState('listening');
            setSpeakStatus('Dinleniyor… metni Türkçe okuyun', true);

            let finalTranscript = '';
            let resolved = false;

            function finishListen(spoken) {
                if (resolved) return;
                resolved = true;
                stopSpeechListening();
                if (status) {
                    status.classList.remove('is-listening');
                    status.textContent = spoken ? `Duydum: «${spoken.trim()}»` : 'Süre doldu';
                }
                updateMicButtonState('ready');
                if (!spoken) {
                    handleQuizAnswer(false, null);
                    return;
                }
                const match = speechMatchesSpeak(spoken, q);
                if (match === 'skip') handleQuizSkip();
                else if (match) handleQuizAnswer(true, null);
                else handleQuizAnswer(false, null);
            }

            navigator.mediaDevices
                .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
                .then((stream) => startSpeakMeter(stream))
                .catch(() => {});

            speakCountdownTimer = setInterval(updateSpeakCountdownUI, 250);
            speakListenTimer = setTimeout(() => finishListen(finalTranscript.trim()), SPEAK_LISTEN_MS());

            const attachListener = async () => {
                if (nativeSpeechListener) {
                    await nativeSpeechListener.remove().catch(() => {});
                    nativeSpeechListener = null;
                }
                nativeSpeechListener = await plugin.addListener('speechRecognition', (data) => {
                    if (!voiceListening || resolved) return;
                    const text = (data && data.text ? String(data.text) : '').trim();
                    if (!text) return;
                    if (data.final) finalTranscript += `${text} `;
                    const combined = (data.final ? finalTranscript : `${finalTranscript}${text}`).trim();
                    if (status) status.textContent = `Dinleniyor: «${combined || text}»`;
                    const match = speechMatchesSpeak(combined || text, q);
                    if (match === 'skip' || match) finishListen(combined || text);
                });
            };

            attachListener()
                .then(() => plugin.startListening({ language: 'tr-TR' }))
                .catch(() => {
                    setSpeakStatus('Ses tanıma başlatılamadı · tekrar deneyin veya atlayın.');
                    updateMicButtonState('permission');
                    stopSpeechListening();
                });
        }

        function beginSpeakListening(q, SR, status, micBtn) {
            voiceListening = true;
            speakListenDeadline = Date.now() + SPEAK_LISTEN_MS();
            updateSpeakCountdownUI();
            resetSpeakMeterUI();

            if (speakAudioCtx && speakAudioCtx.state === 'suspended') {
                speakAudioCtx.resume().catch(() => {});
            }

            let finalTranscript = '';
            let resolved = false;

            function bestTranscriptFromResult(result) {
                let best = result[0]?.transcript || '';
                for (let i = 1; i < result.length; i++) {
                    const alt = result[i]?.transcript || '';
                    if (speechMatchesSpeak(alt, q)) return alt;
                    if (alt.length > best.length) best = alt;
                }
                return best;
            }

            function finishListen(spoken) {
                if (resolved) return;
                resolved = true;
                stopSpeechListening();
                if (status) {
                    status.classList.remove('is-listening');
                    status.textContent = spoken ? `Duydum: «${spoken.trim()}»` : 'Süre doldu';
                }
                if (micBtn) micBtn.classList.remove('is-listening');
                if (!spoken) {
                    handleQuizAnswer(false, null);
                    return;
                }
                const match = speechMatchesSpeak(spoken, q);
                if (match === 'skip') handleQuizSkip();
                else if (match) handleQuizAnswer(true, null);
                else handleQuizAnswer(false, null);
            }

            speechRecognition = new SR();
            speechRecognition.lang = 'tr-TR';
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.maxAlternatives = 5;

            if (status) {
                status.textContent = 'Dinleniyor… metni Türkçe okuyun';
                status.classList.add('is-listening');
            }
            if (micBtn) {
                micBtn.classList.add('is-listening');
                const label = micBtn.querySelector('span');
                if (label) label.textContent = 'Dinleniyor…';
            }

            speakCountdownTimer = setInterval(updateSpeakCountdownUI, 250);
            speakListenTimer = setTimeout(() => {
                finishListen(finalTranscript.trim());
            }, SPEAK_LISTEN_MS());

            speechRecognition.onresult = (ev) => {
                let interim = '';
                for (let i = ev.resultIndex; i < ev.results.length; i++) {
                    const t = bestTranscriptFromResult(ev.results[i]);
                    if (ev.results[i].isFinal) finalTranscript += `${t} `;
                    else interim += t;
                }
                const combined = (finalTranscript + interim).trim();
                if (status && combined) {
                    status.textContent = `Dinleniyor: «${combined}»`;
                }
                const match = speechMatchesSpeak(combined, q);
                if (match === 'skip') {
                    finishListen(combined);
                } else if (match) {
                    finishListen(combined);
                }
            };

            speechRecognition.onerror = (ev) => {
                if (ev.error === 'no-speech' || ev.error === 'aborted') return;
                if (ev.error === 'not-allowed') {
                    voiceListening = false;
                    if (status) status.textContent = 'Mikrofon izni reddedildi · atlayabilirsiniz.';
                    return;
                }
                if (status) status.textContent = 'Ses hatası · mikrofona tekrar dokunun.';
            };

            speechRecognition.onend = () => {
                if (voiceListening && Date.now() < speakListenDeadline && !resolved) {
                    try {
                        speechRecognition.start();
                    } catch (e) {}
                }
            };

            try {
                speechRecognition.start();
            } catch (e) {
                voiceListening = false;
                if (status) status.textContent = 'Mikrofon açılamadı · izin verin veya atlayın.';
            }
        }

        function handleQuizSkip() {
            if (isQuizQuestionLocked()) return;
            lockQuizQuestion();
            playClickSound();
            stopSpeechListening();
            const status = document.getElementById('quiz-voice-status');
            if (status) status.textContent = 'Atlandı — sorun değil.';
            finalizeQuizAnswer(true, null);
        }

        function finalizeQuizAnswer(isCorrect, correctOption, feedbackMsg) {
            if (correctOption) {
                document.querySelectorAll('#quiz-options-container button').forEach((b) => {
                    b.disabled = true;
                    if (b.dataset.option === correctOption) {
                        b.className =
                            'lisani-quiz-option lisani-quiz-option--correct w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                    }
                });
            }
            if (isCorrect) {
                activeCorrects++;
                totalScore += LISANI_XP_PER_CORRECT;
                updateUIPoints();
                updateLearningStats();
                if (window.LisaniDailyTasks?.onQuizCorrect) window.LisaniDailyTasks.onQuizCorrect();
            } else {
                registerQuizWrong();
            }
            scheduleQuizAdvance(isCorrect, feedbackMsg);
        }

        function handleQuizAnswer(isCorrect, correctOption, feedbackMsg) {
            if (isQuizQuestionLocked()) return;
            lockQuizQuestion();
            playClickSound();
            stopSpeechListening();
            finalizeQuizAnswer(
                isCorrect,
                correctOption,
                feedbackMsg || (isCorrect ? '✓ Harika! Doğru cevap' : '✗ Yanlış')
            );
        }

        function selectQuizOption(selected, correct, btn) {
            if (isQuizQuestionLocked()) return;
            lockQuizQuestion();
            playClickSound();
            stopSpeechListening();

            document.querySelectorAll('#quiz-options-container button').forEach((b) => {
                b.disabled = true;
                if (b.dataset.option === correct) {
                    b.className =
                        'lisani-quiz-option lisani-quiz-option--correct w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                }
            });

            const isCorrect = selected === correct;
            if (isCorrect) {
                btn.className =
                    'lisani-quiz-option lisani-quiz-option--correct w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                activeCorrects++;
                totalScore += LISANI_XP_PER_CORRECT;
                updateUIPoints();
                updateLearningStats();
                if (window.LisaniDailyTasks?.onQuizCorrect) window.LisaniDailyTasks.onQuizCorrect();
            } else {
                btn.className =
                    'lisani-quiz-option lisani-quiz-option--wrong w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                registerQuizWrong();
            }

            scheduleQuizAdvance(
                isCorrect,
                isCorrect ? '✓ Harika! Doğru cevap' : grammarWrongFeedback(correct)
            );
        }

        // Sonraki Soru veya Sınav Tamamlama
        function nextQuestion() {
            playClickSound();
            activeQuestionIndex++;
            if (activeQuestionIndex < activeQuizQuestions.length) {
                renderQuizQuestion();
            } else {
                finishQuizEngine();
            }
        }

        function finalizeStepCompletion() {
            if (!pendingStepCompletion) return;

            if (activeSessionQuestionKeys.length) {
                appendBolumQuestionUsage(activeBolumId, activeSessionQuestionKeys);
            }

            if (isBolumStepCompleted(activeBolumId, activeBolumStep)) {
                pendingStepCompletion = false;
                return;
            }

            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

            const newRecord = {
                id: testHistory.length > 0 ? Math.max(...testHistory.map((h) => h.id)) + 1 : 1,
                date: dateStr,
                level: activeLevel,
                bolum: activeBolumId,
                step: activeBolumStep + 1,
                test: activeTestName,
                correct: lastTestSummary.correct,
                wrong: lastTestSummary.wrong,
                percent: lastTestSummary.percent,
                score: lastTestSummary.percent,
            };

            testHistory.push(newRecord);
            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}

            if (window.LisaniDailyTasks?.onBolumStepComplete) {
                window.LisaniDailyTasks.onBolumStepComplete(activeBolumId);
            }

            if (isBolumCompleted(activeBolumId)) {
                if (window.LisaniDailyTasks?.onBolumComplete) {
                    window.LisaniDailyTasks.onBolumComplete(activeBolumId);
                } else if (window.LisaniDailyTasks?.onLevelComplete) {
                    window.LisaniDailyTasks.onLevelComplete(activeLevel);
                }
            }

            pendingStepCompletion = false;
        }

        function proceedAfterStepTest(wasBolumCompleteBefore, fromReview) {
            const stepJustDone = activeBolumStep + 1;
            const stepsTotal = BOLUM_STEPS();
            if (stepJustDone < stepsTotal && isBolumStepCompleted(activeBolumId, activeBolumStep)) {
                showToast(`${activeTestName} tamam · sırada test ${stepJustDone + 1}`, 'success');
            } else if (isBolumCompleted(activeBolumId)) {
                const nextBolum = getNextIncompleteBolum(activeBolumId);
                if (nextBolum) {
                    showToast(`${activeTestName} tamam · ${nextBolum.title} açıldı!`, 'success');
                } else {
                    showToast(`${activeTestName} tamam · tüm bölümler bitti!`, 'success');
                }
            }
            showQuizResultPanel(!!fromReview);
            renderBolumList(activeBolumId);

            const justCompletedBolum = !wasBolumCompleteBefore && isBolumCompleted(activeBolumId);
            if (
                justCompletedBolum &&
                typeof window.canSpinRewardWheel === 'function' &&
                window.canSpinRewardWheel(activeBolumId) &&
                typeof window.openBolumChestWheel === 'function'
            ) {
                setTimeout(() => {
                    showToast('Sandık açıldı! Çark hakkın hazır ✨', 'success');
                    window.openBolumChestWheel(activeBolumId);
                }, 900);
            }
        }

        // Sınav Tamamlama ve Gelişime Ekleme
        function finishQuizEngine() {
            if (quizAdvanceTimer) {
                clearTimeout(quizAdvanceTimer);
                quizAdvanceTimer = null;
            }

            if (isGrammarDrillSession) {
                isGrammarDrillSession = false;
                const correct = activeCorrects;
                const total = activeQuizQuestions.length;
                stopSpeechListening();
                setTestsSubview('list');
                if (window.LisaniGrammarPrep?.onDrillFinished) {
                    window.LisaniGrammarPrep.onDrillFinished(correct, total);
                }
                return;
            }

            if (isWrongReviewSession) {
                isWrongReviewSession = false;
                const fixed = activeCorrects;
                lastTestWrongQuestions = activeWrongQuestions.map((q) => JSON.parse(JSON.stringify(q)));
                const wasBolumCompleteBefore = isBolumCompleted(activeBolumId);
                finalizeStepCompletion();
                stopSpeechListening();
                showToast(
                    fixed > 0 ? `${fixed} yanlışı düzelttin!` : 'Tekrar turu bitti.',
                    fixed > 0 ? 'success' : 'info'
                );
                proceedAfterStepTest(wasBolumCompleteBefore, true);
                return;
            }

            const successPercent = Math.round((activeCorrects / activeQuizQuestions.length) * 100);
            lastTestSummary = {
                correct: activeCorrects,
                wrong: activeWrongs,
                percent: successPercent,
            };
            lastTestWrongQuestions = activeWrongQuestions.map((q) => JSON.parse(JSON.stringify(q)));
            pendingStepCompletion = true;

            stopSpeechListening();

            if (lastTestWrongQuestions.length > 0) {
                showToast(`${lastTestWrongQuestions.length} yanlış cevap kaydedildi.`, 'info');
            }

            const wasBolumCompleteBefore = isBolumCompleted(activeBolumId);
            finalizeStepCompletion();
            proceedAfterStepTest(wasBolumCompleteBefore);
        }

        function showQuizResultPanel(fromReview = false, eliminated = false) {
            const successPercent = lastTestSummary.percent ?? 0;
            const wasEliminated = eliminated || lastTestSummary.eliminated;

            document.getElementById('result-correct-count').innerText = String(lastTestSummary.correct ?? 0);
            document.getElementById('result-wrong-count').innerText = String(lastTestSummary.wrong ?? 0);

            const pctEl = document.getElementById('result-percent');
            pctEl.innerText = wasEliminated ? '—' : `%${successPercent}`;

            const ringFill = document.getElementById('result-score-ring-fill');
            if (ringFill) {
                const circumference = 2 * Math.PI * 42;
                const pctForRing = wasEliminated ? 0 : successPercent;
                const offset = circumference - (pctForRing / 100) * circumference;
                ringFill.style.strokeDasharray = `${circumference}`;
                ringFill.style.strokeDashoffset = `${offset}`;
            }

            const scoreRing = document.getElementById('result-score-ring');
            if (scoreRing) {
                scoreRing.classList.remove('is-good', 'is-mid', 'is-low');
                if (wasEliminated) {
                    scoreRing.classList.add('is-low');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-red-400';
                } else if (successPercent >= 80) {
                    scoreRing.classList.add('is-good');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-emerald-400';
                } else if (successPercent >= 60) {
                    scoreRing.classList.add('is-mid');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-blue-400';
                } else {
                    scoreRing.classList.add('is-low');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-amber-400';
                }
            }

            const subtitle = document.getElementById('quiz-result-subtitle');
            if (subtitle) {
                subtitle.textContent = wasEliminated
                    ? '3 yanlış cevap — bu testten elendin. Tekrar dene!'
                    : successPercent === 100
                      ? 'Tam puan! Sonuç kaydedildi'
                      : 'Sonucun gelişim grafiğine kaydedildi';
            }

            const retryBtn = document.getElementById('quiz-retry-wrongs-btn');
            if (retryBtn) {
                const hasWrongs = !wasEliminated && lastTestWrongQuestions.length > 0;
                retryBtn.classList.toggle('hidden', !hasWrongs);
                retryBtn.setAttribute('aria-hidden', hasWrongs ? 'false' : 'true');
                const label = document.getElementById('quiz-retry-wrongs-label');
                if (label) {
                    label.textContent = `Yanlışları Tekrar Öğren (${lastTestWrongQuestions.length})`;
                }
            }

            setTestsSubview('result');
            if (!wasEliminated) {
                renderProgressChart();
                renderQuizHistoryList();
                updateLearningStats();
                if (typeof window.syncProgressToServer === 'function') window.syncProgressToServer();
            }
            if (!fromReview && !wasEliminated) {
                showToast('Sınav tamamlandı! Sonuçlar grafiğe eklendi.', 'success');
            }
            if (!wasEliminated && typeof maybePromptAppRating === 'function') {
                maybePromptAppRating();
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        window.startWrongQuestionsReview = function () {
            if (!lastTestWrongQuestions.length) {
                showToast('Tekrar çözülecek yanlış soru yok.', 'info');
                return;
            }
            playClickSound();
            isWrongReviewSession = true;
            activeQuizQuestions = lastTestWrongQuestions.map((q) => JSON.parse(JSON.stringify(q)));
            activeQuestionIndex = 0;
            activeCorrects = 0;
            activeWrongs = 0;
            resetTestLives();
            activeWrongQuestions = [];
            if (quizAdvanceTimer) clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;
            setTestsSubview('quiz');
            renderQuizQuestion();
        };

        function finishQuizAndGoProgress() {
            playClickSound();
            setTestsSubview('list');
            if (typeof switchTab === 'function') switchTab('ai', true);
            if (typeof renderProgressChart === 'function') renderProgressChart();
        }
        window.finishQuizAndGoProgress = finishQuizAndGoProgress;

        function finishQuizAndGoHome() {
            playClickSound();
            setTestsSubview('list');
            if (typeof switchTab === 'function') switchTab('home', true);
        }
        window.finishQuizAndGoHome = finishQuizAndGoHome;

        function openQuizAnalysis() {
            playClickSound();
            document.getElementById('quiz-analysis-container').classList.remove('hidden');
        }

        function closeQuizAnalysis() {
            playClickSound();
            document.getElementById('quiz-analysis-container').classList.add('hidden');
        }

        function openEditProfile() {
            playClickSound();
            if (!currentUser) return;

            document.getElementById('edit-profile-username').value = currentUser.name;
            document.getElementById('edit-profile-email').value = currentUser.email;

            const preview = document.getElementById('edit-avatar-preview');
            editAvatarValue = currentUser.avatar;
            applyAvatarToContainer(preview, normalizeAvatarValue(currentUser.avatar, currentUser.uid));
            highlightAvatarSelection(
                '.edit-avatar-option',
                currentUser.avatar,
                resolveAvatarType(currentUser.avatar)
            );

            document.getElementById('edit-profile-container').classList.remove('hidden');
        }

        function closeEditProfile() {
            playClickSound();
            document.getElementById('edit-profile-container').classList.add('hidden');
        }

        // --- ZAMANA KARŞI (1 dk) ---
        const TIME_ATTACK_DURATION_MS = 60 * 1000;
        let timeAttackState = null;
        let timeAttackTimerId = null;

        function buildTimeAttackPool() {
            const pools = window.LISANI_POOLS || {};
            const out = [];
            ['card', 'letter'].forEach((kind) => {
                (pools[kind] || []).forEach((q) => {
                    if (!q.options || q.options.length < 2) return;
                    if (q.type === 'speak' || q.type === 'tiles') return;
                    out.push(JSON.parse(JSON.stringify({ ...q, type: q.type || kind })));
                });
            });
            if (out.length) return shuffleQuizPool(out);
            if (typeof window.getPlacementQuestionPool === 'function') {
                const placement = window.getPlacementQuestionPool().filter((q) => q.options && q.options.length >= 2);
                if (placement.length) return shuffleQuizPool(placement);
            }
            return [];
        }

        function formatTimeAttackClock(msLeft) {
            const totalSec = Math.max(0, Math.ceil(msLeft / 1000));
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            return `${m}:${String(s).padStart(2, '0')}`;
        }

        function updateTimeAttackHud() {
            if (!timeAttackState) return;
            const left = Math.max(0, timeAttackState.endAt - Date.now());
            const timerEl = document.getElementById('time-attack-timer');
            const fillEl = document.getElementById('time-attack-timer-fill');
            const scoreEl = document.getElementById('time-attack-live-score');
            if (timerEl) {
                timerEl.textContent = formatTimeAttackClock(left);
                timerEl.classList.toggle('is-urgent', left <= 10000);
            }
            if (fillEl) {
                const pct = Math.max(0, Math.min(100, (left / TIME_ATTACK_DURATION_MS) * 100));
                fillEl.style.width = `${pct}%`;
            }
            if (scoreEl) scoreEl.textContent = String(timeAttackState.correct);
        }

        function pullNextTimeAttackQuestion() {
            if (!timeAttackState) return null;
            if (timeAttackState.poolIndex >= timeAttackState.pool.length) {
                timeAttackState.pool = shuffleQuizPool(timeAttackState.pool);
                timeAttackState.poolIndex = 0;
            }
            const raw = timeAttackState.pool[timeAttackState.poolIndex++];
            return raw?.options ? shuffleQuestionOptions(raw) : null;
        }

        function renderTimeAttackQuestion() {
            if (!timeAttackState?.running) return;
            const box = document.getElementById('time-attack-question-box');
            if (!box) return;

            let q = null;
            for (let i = 0; i < 8; i++) {
                q = pullNextTimeAttackQuestion();
                if (q && q.options?.length >= 2) break;
            }
            if (!q) {
                box.innerHTML = '<p class="text-[11px] text-cyan-100/80 text-center py-8">Soru yüklenemedi.</p>';
                return;
            }

            timeAttackState.current = q;
            timeAttackState.locked = false;

            const defaultPrompt = window.LISANI_CARD_PROMPT || 'Doğru cevabı seç';
            const optionLabels = ['A', 'B', 'C', 'D'];
            const optionsHtml = q.options
                .map(
                    (opt, idx) => `
                <button type="button" class="lisani-time-attack-option lisani-glass-panel w-full py-3 px-3.5 rounded-xl text-[11px] font-bold text-left flex items-center gap-3 cursor-pointer active:scale-[0.98]" data-option="${String(opt).replace(/"/g, '&quot;')}">
                    <span class="lisani-quiz-option__letter">${optionLabels[idx] || '•'}</span>
                    <span class="flex-1 min-w-0 leading-relaxed text-white">${opt}</span>
                </button>`
                )
                .join('');

            const wordHtml = (q.word || '').replace(/\n/g, '<br>');
            box.innerHTML = `
                <div class="lisani-time-attack-card lisani-glass-panel rounded-2xl p-5 text-center space-y-2.5">
                    <div class="text-4xl leading-none">${q.image || '📖'}</div>
                    <p class="text-[9px] text-cyan-200/75 uppercase font-bold tracking-[0.18em]">${q.prompt || defaultPrompt}</p>
                    <h2 class="arabic-text text-2xl font-black text-white lisani-quiz-arabic leading-relaxed">${wordHtml}</h2>
                </div>
                <div class="lisani-time-attack-options space-y-2 mt-3">${optionsHtml}</div>`;

            box.querySelectorAll('.lisani-time-attack-option').forEach((btn) => {
                btn.onclick = () => {
                    if (!timeAttackState?.running || timeAttackState.locked) return;
                    timeAttackState.locked = true;
                    playClickSound();
                    const selected = btn.getAttribute('data-option');
                    const isCorrect = selected === q.answer;
                    timeAttackState.answered += 1;
                    if (isCorrect) {
                        timeAttackState.correct += 1;
                        if (typeof playSuccessSound === 'function') playSuccessSound();
                    }
                    updateTimeAttackHud();

                    box.querySelectorAll('.lisani-time-attack-option').forEach((b) => {
                        b.disabled = true;
                        if (b.getAttribute('data-option') === q.answer) {
                            b.classList.add('lisani-quiz-option--correct');
                        } else if (b === btn && !isCorrect) {
                            b.classList.add('lisani-quiz-option--wrong');
                        }
                    });

                    setTimeout(() => {
                        if (!timeAttackState?.running) return;
                        renderTimeAttackQuestion();
                    }, isCorrect ? 320 : 520);
                };
            });
        }

        function showTimeAttackResult() {
            const play = document.getElementById('time-attack-play');
            const result = document.getElementById('time-attack-result');
            const finalScore = document.getElementById('time-attack-final-score');
            const finalMeta = document.getElementById('time-attack-final-meta');
            if (play) play.classList.add('hidden');
            if (result) result.classList.remove('hidden');
            const correct = timeAttackState?.correct || 0;
            const answered = timeAttackState?.answered || 0;
            if (finalScore) finalScore.textContent = String(correct);
            if (finalMeta) {
                finalMeta.textContent =
                    answered > 0 ? `${answered} soru cevaplandı` : 'Hiç soru cevaplanmadı';
            }
            try {
                const key = 'lisani_time_attack_best';
                const prev = parseInt(localStorage.getItem(key) || '0', 10) || 0;
                if (correct > prev) localStorage.setItem(key, String(correct));
                const best = Math.max(prev, correct);
                if (finalMeta && best > 0) {
                    finalMeta.textContent += best === correct && correct > prev ? ' · Yeni rekor! 🎉' : ` · En iyi: ${best}`;
                }
            } catch (_) { /* ignore */ }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function finishTimeAttack() {
            if (!timeAttackState) return;
            timeAttackState.running = false;
            if (timeAttackTimerId) {
                clearInterval(timeAttackTimerId);
                timeAttackTimerId = null;
            }
            updateTimeAttackHud();
            showTimeAttackResult();
        }

        function stopTimeAttackSession(showResult) {
            if (timeAttackTimerId) {
                clearInterval(timeAttackTimerId);
                timeAttackTimerId = null;
            }
            if (showResult && timeAttackState?.running) {
                finishTimeAttack();
                return;
            }
            timeAttackState = null;
            document.getElementById('time-attack-play')?.classList.remove('hidden');
            document.getElementById('time-attack-result')?.classList.add('hidden');
            document.getElementById('time-attack-view')?.classList.add('hidden');
            document.getElementById('bolum-selection-view')?.classList.remove('hidden');
        }

        function startTimeAttackTick() {
            if (timeAttackTimerId) clearInterval(timeAttackTimerId);
            timeAttackTimerId = setInterval(() => {
                if (!timeAttackState?.running) return;
                updateTimeAttackHud();
                if (Date.now() >= timeAttackState.endAt) finishTimeAttack();
            }, 100);
        }

        window.startTimeAttack = function (event) {
            if (event) event.stopPropagation();
            playClickSound();

            const pool = buildTimeAttackPool();
            if (!pool.length) {
                if (typeof showToast === 'function') showToast('Zamana karşı soruları yüklenemedi.', 'error');
                return;
            }

            if (timeAttackTimerId) {
                clearInterval(timeAttackTimerId);
                timeAttackTimerId = null;
            }

            timeAttackState = {
                pool,
                poolIndex: 0,
                correct: 0,
                answered: 0,
                running: true,
                locked: false,
                endAt: Date.now() + TIME_ATTACK_DURATION_MS,
            };

            document.getElementById('bolum-selection-view')?.classList.add('hidden');
            document.getElementById('time-attack-view')?.classList.remove('hidden');
            document.getElementById('time-attack-play')?.classList.remove('hidden');
            document.getElementById('time-attack-result')?.classList.add('hidden');

            updateTimeAttackHud();
            startTimeAttackTick();
            renderTimeAttackQuestion();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        window.exitTimeAttack = function () {
            playClickSound();
            stopTimeAttackSession(false);
            document.getElementById('bolum-selection-view')?.classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        function preloadChestAssets(force) {
            if (window._lisaniChestPreloaded && !force) return;
            window._lisaniChestPreloaded = false;
            Object.values(getChestAssetUrls()).forEach((src) => {
                const img = new Image();
                img.src = src;
            });
            window._lisaniChestPreloaded = true;
        }

        function openKariyerModu(bolumIdHint, opts) {
            playClickSound();
            preloadChestAssets(true);
            if (typeof stopTimeAttackSession === 'function') stopTimeAttackSession(false);
            if (opts && opts.assignMode === true) {
                window._testsAssignMode = true;
            }
            const highlight = typeof bolumIdHint === 'string' ? bolumIdFromHint(bolumIdHint) : null;
            if (typeof renderBolumList === 'function') {
                renderBolumList(highlight || undefined);
            }
            document.getElementById('bolum-selection-view')?.classList.remove('hidden');
            document.getElementById('time-attack-view')?.classList.add('hidden');
            document.getElementById('kariyer-modal-container')?.classList.remove('hidden');
            if (typeof updateTestsTabForRole === 'function') updateTestsTabForRole();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        window.openHocaOdevAtama = function () {
            if (!isHocaUser() && !isYoneticiUser()) {
                showToast('Bu özellik hoca ve yönetici hesapları içindir.', 'error');
                return;
            }
            openKariyerModu(null, { assignMode: true });
            showToast('Teste dokunarak ödev atayabilirsiniz.', 'info');
        };

        function closeKariyerModu() {
            playClickSound();
            if (typeof stopTimeAttackSession === 'function') stopTimeAttackSession(false);
            document.getElementById('kariyer-modal-container')?.classList.add('hidden');
        }

        window.openKariyerModu = openKariyerModu;
        window.closeKariyerModu = closeKariyerModu;

        window.getTennisUnlocked = function () {
            return false;
        };

        window.syncTennisUnlockFromUser = function () {};

        function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedAvatarType = 'custom';
                    selectedAvatarValue = `<img src="${e.target.result}" class="lisani-avatar-img" alt="" />`;
                    const preview = document.getElementById('avatar-preview-big');
                    const label = document.getElementById('avatar-preview-label');
                    if (preview) applyAvatarToContainer(preview, selectedAvatarValue);
                    if (label) label.textContent = 'Fotoğrafım';
                    highlightAvatarSelection('.avatar-option', '');
                    showToast("Profil görseli yüklendi.", "success");
                };
                reader.readAsDataURL(file);
            }
        }

        function handleEditAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editAvatarValue = `<img src="${e.target.result}" class="lisani-avatar-img" alt="" />`;
                    applyAvatarToContainer(document.getElementById('edit-avatar-preview'), editAvatarValue);
                    highlightAvatarSelection('.edit-avatar-option', '');
                    showToast("Yeni görsel yüklendi. Kaydetmeyi unutmayın.", "success");
                };
                reader.readAsDataURL(file);
            }
        }

        // PROFİLİ DÜZENLEME DEĞİŞİKLİKLERİ
        function saveProfileChanges() {
            playClickSound();
            
            const nameInput = document.getElementById('edit-profile-username').value.trim();
            const emailInput = document.getElementById('edit-profile-email').value.trim();

            if (!nameInput) {
                showToast("Lütfen tüm alanları doldurun.", "error");
                return;
            }

            currentUser.name = nameInput;
            currentUser.email = emailInput;
            currentUser.avatar = editAvatarValue;

            document.getElementById('profile-screen-name').innerText = nameInput;
            document.getElementById('profile-screen-sub').innerHTML = getSettingsRoleBadgeHtml(currentUserRole);
            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${nameInput}! 👋`;
            if (typeof window.updateHomeRoleBadge === 'function') {
                window.updateHomeRoleBadge(currentUserRole);
            }

            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('profile-avatar-container')
            ];

            avatarContainers.forEach(container => {
                applyAvatarToContainer(container, editAvatarValue);
            });

            showToast("Profil güncellendi.", "success");
            closeEditProfile();
        }

        function quickLogin() {
            playClickSound();
            // Hızlı giriş: ilk localStorage kullanıcısını bul
            try {
                const saved = localStorage.getItem('lisani_registered_users');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const keys = Object.keys(parsed);
                    if (keys.length) {
                        const user = parsed[keys[0]];
                        document.getElementById('login-username').value = user.email || keys[0];
                        document.getElementById('login-password').value = user.password || '';
                        submitLogin();
                        return;
                    }
                }
            } catch(e) {}
            // Fallback: geliştirici girişi
            loginAsDeveloper();
        }

        async function submitLogin() {
            playClickSound();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('login-remember-me') ? document.getElementById('login-remember-me').checked : false;

            if (!usernameInput || !passwordInput) { showToast("İsim ve şifre boş bırakılamaz.", "error"); return; }

            // 1. ÖNCE YEREL — anında giriş
            try {
                const saved = localStorage.getItem('lisani_all_users');
                if (saved) {
                    const users = JSON.parse(saved);
                    const found = users.find(u => u.name.toLowerCase() === usernameInput.toLowerCase());
                    if (found) {
                        if (found.password !== passwordInput) { showToast("Şifre hatalı.", "error"); return; }
                        window._loginDone = true;
                        currentUserRole = found.role || 'ogrenci';
                        loginSuccess(found, rememberMe);
                        _firebaseLoginBg(found.email, passwordInput);
                        return;
                    }
                }
            } catch(e) {}

            // 2. Yerel bulunamazsa Firebase'e sor
            showLoading('Giriş yapılıyor...');
            try {
                await _waitFirebase();
                const snap = await window._db.collection('users').where('name', '==', usernameInput).limit(1).get();
                if (snap.empty) { hideLoading(); showToast("Bu isimde kayıtlı kullanıcı bulunamadı.", "error"); return; }
                const ud = snap.docs[0].data();
                const uid = snap.docs[0].id;
                await window._auth.signInWithEmailAndPassword(ud.email, passwordInput);
                window._loginDone = true;
                const user = { uid, name: ud.name, email: ud.email, avatar: ud.avatar || '🐱', role: ud.role || 'ogrenci', sinif: ud.sinif || null, password: passwordInput };
                currentUserRole = ud.role || 'ogrenci';
                _saveUserLocally(user);
                hideLoading();
                loginSuccess(user, rememberMe);
            } catch(e) {
                hideLoading();
                const msgs = { 'auth/wrong-password': 'Şifre hatalı.', 'auth/too-many-requests': 'Çok fazla deneme.', 'auth/invalid-credential': 'İsim veya şifre hatalı.' };
                showToast(msgs[e.code] || 'Giriş başarısız.', "error");
            }
        }

        function loginAsDeveloper() {
            playClickSound();
            const devUser = {
                name: "Geliştirici Alp 🛠️",
                email: "developer@temrin.ai",
                password: "dev",
                avatar: "🛠️",
                role: "hoca"
            };
            currentUserRole = "hoca";
            registeredUsers["geliştirici alp 🛠️"] = devUser;
            loginSuccess(devUser);
        }

        async function submitRegister() {
            playClickSound();
            const name = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'ogrenci';
            const sinif = role === 'hoca' ? (document.getElementById('reg-sinif') ? document.getElementById('reg-sinif').value.trim() : '') : '';

            if (!name || !password || !passwordConfirm) { showToast("Lütfen tüm alanları doldurun.", "error"); return; }
            if (password !== passwordConfirm) { showToast("Şifreler eşleşmiyor.", "error"); return; }
            if (password.length < 6) { showToast("Şifre en az 6 karakter olmalı.", "error"); return; }

            // İsim çakışması kontrolü
            try {
                const saved = localStorage.getItem('lisani_all_users');
                if (saved) {
                    const users = JSON.parse(saved);
                    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
                        showToast("Bu isim zaten alınmış.", "error"); return;
                    }
                }
            } catch(e) {}

            // ANINDA yerel kayıt — kullanıcı beklemez
            const nameSafe = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) || 'kullanici';
            const randStr = Math.random().toString(36).substring(2, 8);
            const email = nameSafe + '_' + randStr + '@lisaniecdad.app';
            const newUser = { uid: 'local_' + Date.now(), name, email, password, avatar: selectedAvatarValue, role, sinif, totalScore: 0 };
            _saveUserLocally(newUser);
            window._loginDone = true;
            currentUserRole = role;
            showToast("Hesap oluşturuldu!", "success");
            loginSuccess(newUser, true);

            // Arka planda Firebase'e kaydet
            _firebaseRegisterBg(newUser, role, sinif);
        }

        // --- ARKA PLAN FIREBASE YARDIMCILARI ---
        function _saveUserLocally(user) {
            try {
                const saved = localStorage.getItem('lisani_all_users');
                const users = saved ? JSON.parse(saved) : [];
                const idx = users.findIndex(u => u.name.toLowerCase() === user.name.toLowerCase());
                if (idx >= 0) users[idx] = { ...users[idx], ...user }; else users.push(user);
                localStorage.setItem('lisani_all_users', JSON.stringify(users));
            } catch(e) {}
        }

        async function _waitFirebase(timeout = 8000) {
            const start = Date.now();
            while (!window._firebaseReady && Date.now() - start < timeout)
                await new Promise(r => setTimeout(r, 300));
        }

        async function _firebaseLoginBg(email, password) {
            if (window._manualLogout) return; // Çıkış yapıldıysa arka plan girişi engelle
            try { await _waitFirebase(); if (window._auth && !window._manualLogout) await window._auth.signInWithEmailAndPassword(email, password); } catch(e) {}
        }

        async function _firebaseRegisterBg(user, role, sinif) {
            try {
                await _waitFirebase(15000);
                if (!window._auth) return;
                const cred = await window._auth.createUserWithEmailAndPassword(user.email, user.password);
                const uid = cred.user.uid;
                await window._db.collection('users').doc(uid).set({
                    name: user.name, email: user.email, avatar: user.avatar,
                    role, sinif, totalScore: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (role === 'hoca') {
                    await window._db.collection('siniflar').doc(uid).set({
                        hocaId: uid, hocaAdi: user.name,
                        sinifAdi: sinif || (user.name + "'in Grubu"),
                        ogrenciler: [], odevler: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                _saveUserLocally({ ...user, uid });
            } catch(e) { console.log('Firebase bg:', e.message); }
        }

        function loginSuccess(user, rememberMe = false, silent = false) {
            if (typeof window.isUserLoggedOutLocally === 'function' && window.isUserLoggedOutLocally()) {
                window.clearLocalUserSession();
                if (typeof window.syncAppShellVisibility === 'function') window.syncAppShellVisibility();
                return;
            }
            if (typeof window.clearUserLoggedOutFlag === 'function') {
                window.clearUserLoggedOutFlag();
            }
            currentUser = user;
            window.currentUser = user;
            currentUserRole = user.role || 'ogrenci';
            window._loginDone = true;
            window._manualLogout = false;
            try {
                sessionStorage.removeItem('lisani_user_logged_out');
            } catch (e) {}

            if (rememberMe) {
                try {
                    const sessionPayload = { ...user, tennisUnlocked: false };
                    const storedPwd =
                        user.password ||
                        (typeof window._resolveStoredPassword === 'function'
                            ? window._resolveStoredPassword(user.name, sessionPayload)
                            : '');
                    if (storedPwd) sessionPayload.password = storedPwd;
                    localStorage.setItem('lisani_session_user', JSON.stringify(sessionPayload));
                    localStorage.setItem('lisani_remember_me', 'true');
                    if (localStorage.getItem('lisani_remember_me_pref') !== 'false') {
                        localStorage.setItem('lisani_remember_me_pref', 'true');
                    }
                } catch(e) {}
            } else {
                try {
                    localStorage.removeItem('lisani_session_user');
                    localStorage.removeItem('lisani_remember_me');
                } catch(e) {}
            }
            try { localStorage.setItem('lisani_registered_users', JSON.stringify(registeredUsers)); } catch(e) {}
            
            const profileName = document.getElementById('profile-screen-name');
            const profileSub = document.getElementById('profile-screen-sub');
            if (profileName) profileName.innerText = user.name;
            if (profileSub) profileSub.innerHTML = getSettingsRoleBadgeHtml(currentUserRole);
            if (typeof window.updateHomeRoleBadge === 'function') {
                window.updateHomeRoleBadge(currentUserRole);
            }
            
            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('profile-avatar-container')
            ];
            avatarContainers.forEach(container => {
                applyAvatarToContainer(container, normalizeAvatarValue(user.avatar, user.uid));
            });

            syncTennisUnlockFromUser(user);

            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${user.name}! 👋`;
            syncAppShellVisibility();

            const afterLogin = async () => {
                if (typeof window.onLoginSuccessHook === 'function') {
                    await window.onLoginSuccessHook(user);
                } else {
                    updateLearningStats();
                }
                updateTestsTabForRole();
                updateGelisimScreenForRole();
                if (typeof window.updateDailyWheelHomeUI === 'function') window.updateDailyWheelHomeUI();
                if (!silent) {
                    showToast("Giriş yapıldı. İyi çalışmalar!", "success");
                    switchTab('home', true);
                }
            };
            afterLogin();
        }
        window.loginSuccess = loginSuccess;

        async function logoutApp() {
            if (typeof window.isUserLoggedOutLocally === 'function' && window.isUserLoggedOutLocally()) {
                if (typeof window.syncAppShellVisibility === 'function') window.syncAppShellVisibility();
                if (typeof toggleAuthTab === 'function') toggleAuthTab('login');
                return;
            }
            playClickSound();
            window._manualLogout = true;
            window.clearLocalUserSession();

            // Tüm yerel verileri temizle
            try {
                sessionStorage.setItem('lisani_user_logged_out', '1');
                localStorage.removeItem('lisani_session_user');
                localStorage.removeItem('lisani_remember_me');
                localStorage.setItem('lisani_remember_me_pref', 'false');
            } catch (e) {}

            if (typeof window.syncAppShellVisibility === 'function') {
                window.syncAppShellVisibility();
            }
            if (typeof toggleAuthTab === 'function') toggleAuthTab('login');

            if (window._auth) {
                try {
                    await window._auth.signOut();
                } catch (e) {}
            }

            if (typeof window.invalidateServerSession === 'function') {
                try {
                    await window.invalidateServerSession();
                } catch (e) {}
            }

            try {
                const loginUser = document.getElementById('login-username');
                if (loginUser) loginUser.value = '';
                const loginPass = document.getElementById('login-password');
                if (loginPass) loginPass.value = '';
                const ru = document.getElementById('reg-username');
                if (ru) ru.value = '';
                const re = document.getElementById('reg-email');
                if (re) re.value = '';
                const rp = document.getElementById('reg-password');
                if (rp) rp.value = '';
                const rpc = document.getElementById('reg-password-confirm');
                if (rpc) rpc.value = '';
            } catch (e) {}

            resetAppShellForLogout();
            if (typeof window.syncAppShellVisibility === 'function') {
                window.syncAppShellVisibility();
            }
            if (typeof toggleAuthTab === 'function') toggleAuthTab('login');
            if (window.LisaniTennisOnline) window.LisaniTennisOnline.stop(false);
            showToast('Çıkış yapıldı.', 'info');
        }
        window.logoutApp = logoutApp;

        // --- HOCA PANELİ ---
        // --- HOCA VERİ YÖNETİMİ (yerel + Firebase arka plan) ---
        function _getLocalSinif(hocaUid) {
            try {
                const s = localStorage.getItem('sinif_' + hocaUid);
                return s ? JSON.parse(s) : null;
            } catch(e) { return null; }
        }

        function _saveLocalSinif(hocaUid, data) {
            try { localStorage.setItem('sinif_' + hocaUid, JSON.stringify(data)); } catch(e) {}
        }

        function _initSinif(hocaUid) {
            let sinif = _getLocalSinif(hocaUid);
            if (!sinif) {
                const kisaKod = Math.random().toString(36).substring(2,5).toUpperCase() + Math.floor(100 + Math.random()*900);
                sinif = { hocaId: hocaUid, hocaAdi: currentUser.name, sinifAdi: currentUser.sinif || (currentUser.name + "'in Grubu"), kisaKod, ogrenciler: [], odevler: [] };
                _saveLocalSinif(hocaUid, sinif);
                // kisaKod = Firebase doc ID — direkt .doc(kisaKod).get() ile bulunur, where() gerekmez
                _waitFirebase().then(() => {
                    if (window._db) window._db.collection('siniflar').doc(kisaKod).set({ ...sinif, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
                });
            }
            if (!sinif.kisaKod) {
                sinif.kisaKod = Math.random().toString(36).substring(2,5).toUpperCase() + Math.floor(100+Math.random()*900);
                _saveLocalSinif(hocaUid, sinif);
                _waitFirebase().then(() => {
                    if (window._db) window._db.collection('siniflar').doc(sinif.kisaKod).set({ ...sinif, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
                });
            }
            return sinif;
        }

        async function loadHocaPanel(uid) {
            const sinif = _initSinif(uid);

            // Firebase'den güncel veriyi arka planda çek, sonra paneli güncelle
            _waitFirebase(5000).then(async () => {
                if (!window._db) return;
                try {
                    const snap = await window._db.collection('siniflar').doc(uid).get();
                    if (snap.exists) {
                        const fbData = snap.data();
                        // Firebase'deki öğrenci listesi daha güncel olabilir
                        const merged = { ...sinif, ...fbData };
                        _saveLocalSinif(uid, merged);
                        // Paneli güncelle (hâlâ açıksa)
                        if (document.getElementById('hoca-panel-modal')) _renderHocaPanel(uid, merged);
                    }
                } catch(e) {}
            });

            _renderHocaPanel(uid, sinif);
        }

        function _renderHocaPanel(uid, sinif) {
            const kod = uid; // Tam uid = sınıf kodu (hızlı direkt erişim)
            let allUsers = [];
            try { allUsers = JSON.parse(localStorage.getItem('lisani_all_users') || '[]'); } catch(e) {}

            let ogrencilerHTML = '';
            if (sinif.ogrenciler && sinif.ogrenciler.length > 0) {
                sinif.ogrenciler.forEach(oid => {
                    const o = allUsers.find(u => u.uid === oid) || { name: '(bilinmiyor)', avatar: '🎒', totalScore: 0 };
                    ogrencilerHTML += `<div class="flex items-center gap-2 py-2 border-b theme-border">
                        ${typeof window.avatarSlotHtml === 'function' ? window.avatarSlotHtml(o.avatar) : `<span class="text-xl">${o.avatar || '🎒'}</span>`}
                        <div class="flex-1"><div class="text-xs font-bold theme-text-main">${o.name}</div></div>
                        <span class="text-xs font-bold text-amber-400">${o.totalScore || 0} XP</span>
                    </div>`;
                });
            } else {
                ogrencilerHTML = '<p class="text-xs theme-text-muted text-center py-4">Henüz öğrenci yok.<br>Sınıf kodunu öğrencilerinize verin.</p>';
            }

            let odevlerHTML = '';
            if (sinif.odevler && sinif.odevler.length > 0) {
                sinif.odevler.slice(-3).reverse().forEach(o => {
                    let lbl = o.label || o.icerik;
                    if (!lbl && o.bolum) {
                        const meta = getBolumMeta(o.bolum);
                        lbl = `${meta?.title || o.bolum}${o.test ? ` — ${o.test}` : ''}`;
                    }
                    if (!lbl && o.level && o.test) {
                        const bolum = BOLUMLER.find((b) => (BOLUM_INDEX[b.id] || 0) === Number(o.level));
                        lbl = bolum ? `${bolum.title} — ${o.test}` : o.test;
                    }
                    if (!lbl) lbl = 'Ödev';
                    odevlerHTML += `<div class="py-1.5 border-b theme-border"><p class="text-xs theme-text-main">${lbl}</p><p class="text-[10px] theme-text-muted">${o.tarih}</p></div>`;
                });
            }

            let panel = document.getElementById('hoca-panel-modal');
            if (!panel) { panel = document.createElement('div'); panel.id = 'hoca-panel-modal'; panel.className = 'fixed inset-0 z-50 flex items-end justify-center'; document.body.appendChild(panel); }
            panel.innerHTML = `<div class="w-full max-w-sm bg-stone-950 rounded-t-3xl border-t border-stone-700 p-5 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-extrabold theme-text-main">📚 Hoca Paneli</h2>
                    <button onclick="document.getElementById('hoca-panel-modal').remove()" class="text-stone-500 hover:text-stone-300 text-xl">✕</button>
                </div>
                <div class="bg-stone-800/60 rounded-xl p-3 mb-4">
                    <p class="text-[10px] theme-text-muted mb-1">📎 Grup: <strong class="theme-text-main">${sinif.sinifAdi}</strong></p>
                    <p class="text-[10px] theme-text-muted mb-0.5">Sınıf Kodu (öğrencilere verin):</p>
                    <p class="text-2xl font-bold text-amber-400 font-mono tracking-widest">${sinif.kisaKod || kod.substring(0,8)}</p>
                </div>
                <h3 class="text-xs font-bold theme-text-main mb-2">👥 Öğrenciler (${sinif.ogrenciler.length})</h3>
                <div class="mb-4">${ogrencilerHTML}</div>
                ${odevlerHTML ? `<h3 class="text-xs font-bold theme-text-main mb-2">📋 Son Ödevler</h3><div class="mb-4">${odevlerHTML}</div>` : ''}
                <h3 class="text-xs font-bold theme-text-main mb-2">📝 Yeni Test Ödevi</h3>
                <p class="text-[10px] theme-text-muted mb-3">Aşağıdan bölüm seçerek ödev gönderin.</p>
                <div id="odev-test-picker" data-hoca-uid="${uid}"></div>
            </div>`;
            if (typeof window.initOdevTestPicker === 'function') {
                window.initOdevTestPicker(uid);
            }
        }

        function odevVer(hocaUid, levelArg, testArg) {
            const levelEl = document.getElementById('odev-level');
            const testEl = document.getElementById('odev-test');
            const level = levelArg || (levelEl ? parseInt(levelEl.value, 10) : 0);
            const test = testArg || (testEl ? testEl.value : '');
            if (!level || !test) { showToast("Lütfen seviye ve test seçin.", "error"); return; }
            const sinif = _getLocalSinif(hocaUid) || _initSinif(hocaUid);
            sinif.odevler.push({
                type: 'test',
                level,
                test,
                label: `Seviye ${level} — ${test}`,
                tarih: new Date().toLocaleDateString('tr-TR'),
                hocaAdi: currentUser.name
            });
            _saveLocalSinif(hocaUid, sinif);
            // Firebase arka plan
            _waitFirebase().then(() => {
                if (window._db) window._db.collection('siniflar').doc(hocaUid).update({ odevler: sinif.odevler }).catch(()=>{});
            });
            showToast("Ödev gönderildi!", "success");
            loadHocaPanel(hocaUid);
        }

        async function sinifaKatil(sinifKodu) {
            if (!currentUser || !sinifKodu || sinifKodu.trim().length < 4) { showToast("Geçerli bir sınıf kodu girin.", "error"); return; }
            const kod = sinifKodu.trim().toUpperCase();

            showLoading("Sınıfa katılınıyor...");

            try {
                await Promise.race([
                    _waitFirebase(5000),
                    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
                ]);
                if (!window._db) throw new Error("Bağlantı yok");

                // kisaKod = doc ID — direkt get, index gerekmez, çok hızlı
                const snap = await Promise.race([
                    window._db.collection('siniflar').doc(kod).get(),
                    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
                ]);

                if (!snap.exists) { hideLoading(); showToast("Sınıf bulunamadı. Kodu kontrol edin.", "error"); return; }

                const sd = snap.data();
                const ogrenciler = sd.ogrenciler || [];
                if (ogrenciler.includes(currentUser.uid)) { hideLoading(); showToast("Zaten bu sınıftasınız.", "info"); return; }

                ogrenciler.push(currentUser.uid);
                await window._db.collection('siniflar').doc(kod).update({ ogrenciler });
                _saveLocalSinif(kod, { ...sd, ogrenciler });
                _saveUserLocally({ ...currentUser, sinifKodu: kod });

                hideLoading();
                showToast("✅ " + sd.sinifAdi + " sınıfına katıldınız!", "success");
                const modal = document.getElementById('sinif-katil-modal');
                if (modal) modal.remove();

            } catch(e) {
                hideLoading();
                showToast(e.message === 'timeout' ? "Bağlantı zaman aşımı. İnternet bağlantınızı kontrol edin." : "Hata: " + e.message, "error");
            }
        }

        function showHocaPanel() {
            if (isYoneticiUser()) {
                if (typeof window.openHocaDashboard === 'function') {
                    window.openHocaDashboard();
                    if (typeof window.hocaDashSwitchPanel === 'function') {
                        window.hocaDashSwitchPanel('odev');
                    }
                }
                return;
            }
            if (!currentUser || currentUserRole !== 'hoca') {
                showToast("Bu özellik sadece hoca ve yönetici hesapları için.", "error");
                return;
            }
            loadHocaPanel(currentUser.uid);
        }

        function showSinifKatilModal() {
            let modal = document.getElementById('sinif-katil-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'sinif-katil-modal';
                modal.className = 'fixed inset-0 z-50 flex items-end justify-center';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `<div class="w-full max-w-sm bg-stone-900 rounded-t-3xl border-t border-stone-700 p-5">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-extrabold theme-text-main">🏫 Sınıfa Katıl</h2>
                    <button onclick="document.getElementById('sinif-katil-modal').remove()" class="text-stone-500 hover:text-stone-300">✕</button>
                </div>
                <p class="text-xs theme-text-muted mb-3">Hocanızdan aldığınız 8 haneli sınıf kodunu girin:</p>
                <input id="sinif-kod-input" type="text" maxlength="8" placeholder="ÖRN: AB1C2D3E" class="w-full p-3 rounded-xl border theme-border theme-card-bg theme-text-main text-sm font-mono font-bold uppercase focus:outline-none mb-3">
                <button onclick="sinifaKatil(document.getElementById('sinif-kod-input').value)" class="lisani-glass-action lisani-glass-action--primary w-full py-3 rounded-xl text-xs font-bold">Katıl</button>
            </div>`;
        }

        function updateUIPoints() {
            const ptsHome = document.getElementById('total-xp-display-home');
            const scoreDisplay = document.getElementById('home-score-display');
            const xpText =
                typeof window.formatLisaniXp === 'function'
                    ? `${window.formatLisaniXp(totalScore)} XP`
                    : `${totalScore} XP`;
            if (ptsHome) ptsHome.innerText = xpText;
            if (scoreDisplay)
                scoreDisplay.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5 fill-current text-amber-500"></i><span>${xpText}</span>`;
            lucide.createIcons();
        }

        // --- PRELINE UI GÖRÜNÜM / TEMA ---
        const COLOR_MODE_KEY = 'lisani_color_mode';
        const DEFAULT_COLOR_MODE = 'saray-kahvesi';
        const VALID_THEMES = ['sade', 'saray-kahvesi', 'derin-mavi', 'mavi-mor', 'beyaz-cam'];
        const THEME_CLASS_NAMES = VALID_THEMES.map((t) => 'theme-' + t);
        const THEME_META_COLORS = {
            sade: '#111111',
            'saray-kahvesi': '#120d0a',
            'derin-mavi': '#080c14',
            'mavi-mor': '#08061a',
            'beyaz-cam': '#e8edf4',
        };
        const THEME_PICKER_ITEMS = [
            {
                id: 'sade',
                label: 'Sade (Düz)',
                swatch: { kind: 'dot', style: 'background:#1a1a1a;border:1px solid #404040' },
            },
            {
                id: 'saray-kahvesi',
                label: 'Saray Kahvesi',
                badge: 'Varsayılan',
                recommended: true,
                swatch: { kind: 'gradient', style: 'background:linear-gradient(90deg,#9e6c4c,#4a3329)' },
            },
            {
                section: 'CAM / GRADYAN TEMALAR',
            },
            {
                id: 'beyaz-cam',
                label: 'Beyaz Gradyan',
                badge: 'Açık cam',
                swatch: {
                    kind: 'gradient',
                    style: 'background:linear-gradient(135deg,#f8fafc,#e0e7ff,#c7d2fe);border:1px solid rgba(148,163,184,0.35)',
                },
            },
            {
                id: 'mavi-mor',
                label: 'Mavi & Mor',
                swatch: { kind: 'gradient', style: 'background:linear-gradient(90deg,#2563eb,#6366f1,#9333ea)' },
            },
            {
                id: 'derin-mavi',
                label: 'Derin Mavi',
                swatch: { kind: 'gradient', style: 'background:linear-gradient(90deg,#3b82f6,#1e3a8a)' },
            },
        ];

        function bindThemePicker() {
            const picker = document.getElementById('theme-picker');
            if (!picker || picker.dataset.themeBound === '1') return;
            picker.dataset.themeBound = '1';
            picker.addEventListener('click', (event) => {
                const btn = event.target.closest('[data-color-mode]');
                if (!btn || !picker.contains(btn)) return;
                event.preventDefault();
                const mode = btn.getAttribute('data-color-mode');
                if (typeof setColorMode === 'function') {
                    setColorMode(mode);
                } else if (typeof window.lisaniPickTheme === 'function') {
                    window.lisaniPickTheme(mode);
                }
            });
        }

        function renderThemePicker(forceRebuild) {
            const picker = document.getElementById('theme-picker');
            if (!picker) return;

            const hasAll = VALID_THEMES.every((id) => picker.querySelector(`[data-color-mode="${id}"]`));
            if (!forceRebuild && hasAll) {
                bindThemePicker();
                return;
            }

            const parts = THEME_PICKER_ITEMS.map((item) => {
                if (item.section) {
                    return `<p class="theme-pick-section">${item.section}</p>`;
                }
                const badge = item.badge
                    ? ` <span class="theme-pick-btn__badge">${item.badge}</span>`
                    : '';
                const recommended = item.recommended ? ' is-recommended' : '';
                const swatchClass = item.swatch.kind === 'dot' ? 'theme-swatch-dot' : 'theme-swatch-gradient';
                const swatch = `<span class="${swatchClass}" style="${item.swatch.style}" aria-hidden="true"></span>`;
                return `<button type="button" data-color-mode="${item.id}" class="theme-pick-btn lisani-glass-panel${recommended}">
                    <span class="theme-pick-btn__label">${item.label}${badge}</span>
                    ${swatch}
                </button>`;
            });

            picker.innerHTML = parts.join('');
            picker.dataset.themeBound = '0';
            bindThemePicker();
        }

        function normalizeColorMode(mode) {
            if (VALID_THEMES.includes(mode)) return mode;
            if (mode === 'light') return 'beyaz-cam';
            if (mode === 'dark') return DEFAULT_COLOR_MODE;
            return DEFAULT_COLOR_MODE;
        }

        function highlightColorModeButtons() {
            const current = normalizeColorMode(localStorage.getItem(COLOR_MODE_KEY) || DEFAULT_COLOR_MODE);
            document.querySelectorAll('[data-color-mode]').forEach((btn) => {
                const active = btn.getAttribute('data-color-mode') === current;
                btn.classList.toggle('is-active', active);
            });
        }

        function applyDocumentColorMode(mode) {
            if (typeof window.lisaniPickTheme === 'function') {
                window.lisaniPickTheme(mode);
                return;
            }
            const theme = normalizeColorMode(mode);
            const root = document.documentElement;
            THEME_CLASS_NAMES.forEach((cls) => root.classList.remove(cls));
            root.classList.add('theme-' + theme);
            if (theme === 'beyaz-cam') {
                root.classList.remove('dark');
            } else {
                root.classList.add('dark');
            }
            const meta = document.getElementById('meta-theme-color');
            if (meta) meta.setAttribute('content', THEME_META_COLORS[theme] || '#100c0a');
        }

        function setColorMode(mode) {
            try {
                playClickSound();
            } catch (e) {}
            applyDocumentColorMode(mode);
            highlightColorModeButtons();
            if (typeof renderProgressChart === 'function') renderProgressChart();
            if (typeof showToast === 'function') {
                showToast('Renk teması güncellendi.', 'success');
            }
        }

        window.setColorMode = setColorMode;

        function initPrelineTheme() {
            document.documentElement.classList.add('preline-ui');
            renderThemePicker(false);
            applyDocumentColorMode(localStorage.getItem(COLOR_MODE_KEY) || DEFAULT_COLOR_MODE);
            highlightColorModeButtons();
        }

        function bootPrelineThemeEarly() {
            try {
                initPrelineTheme();
            } catch (e) {}
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootPrelineThemeEarly);
        } else {
            bootPrelineThemeEarly();
        }

        function initApkDownloadLink() {
            const cfg = window.LISANI_APK || {};
            const url = String(cfg.url || '').trim();
            const filename = String(cfg.filename || 'lisani-ecdad.apk').trim();
            const isNativeApp =
                window.Capacitor &&
                typeof window.Capacitor.isNativePlatform === 'function' &&
                window.Capacitor.isNativePlatform();
            const show = !!url && !isNativeApp;
            const el = document.getElementById('home-apk-download-row');
            if (!el) return;
            if (!show) {
                el.classList.add('hidden');
                return;
            }
            el.onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.setAttribute('download', filename);
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
            };
            el.classList.remove('hidden');
        }

        let currentActiveScreen = 'home';

        window.clearLocalUserSession = function () {
            currentUser = null;
            currentUserRole = null;
            window.currentUser = null;
            window._loginDone = false;
        };

        function syncAppShellVisibility() {
            const auth = document.getElementById('auth-container');
            const main = document.getElementById('main-application-flow');
            const loggedOutLocally =
                typeof window.isUserLoggedOutLocally === 'function' && window.isUserLoggedOutLocally();
            const loggedIn =
                !loggedOutLocally && window._loginDone === true && !!window.currentUser;
            if (loggedIn) {
                auth?.classList.add('hidden');
                main?.classList.remove('hidden');
            } else {
                main?.classList.add('hidden');
                auth?.classList.remove('hidden');
            }
        }
        window.syncAppShellVisibility = syncAppShellVisibility;

        function resetTabHighlightToHome() {
            const tabIds = ['ai', 'tests', 'hoca-dashboard', 'home', 'letters', 'osm-translate', 'settings'];
            tabIds.forEach((id) => {
                const tabBtn = document.getElementById(`tab-${id}`);
                if (!tabBtn) return;
                tabBtn.classList.remove('lisani-tab-active', 'font-black', 'theme-primary-color');
                tabBtn.classList.add('theme-text-muted');
                const icon = tabBtn.querySelector('i');
                if (icon) icon.style.transform = '';
                if (id === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.classList.remove('lisani-tab-label-active', 'font-black', 'theme-primary-color');
                        homeText.classList.add('theme-text-muted');
                    }
                }
            });
            const homeTab = document.getElementById('tab-home');
            if (homeTab) {
                homeTab.classList.remove('theme-text-muted');
                homeTab.classList.add('lisani-tab-active');
                const homeIcon = homeTab.querySelector('i');
                if (homeIcon) homeIcon.style.transform = 'scale(1.06)';
                const homeText = document.getElementById('tab-home-text');
                if (homeText) {
                    homeText.classList.remove('theme-text-muted');
                    homeText.classList.add('lisani-tab-label-active');
                }
            }
        }

        function resetAppShellForLogout() {
            currentActiveScreen = 'home';
            document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));

            const screensContainer = document.getElementById('screens-container');
            if (screensContainer) {
                screensContainer.classList.remove('lisani-screens--letters-only', 'lisani-screens--hoca-dash');
            }

            hideLoading();

            [
                'edit-profile-container',
                'notif-settings-panel',
                'kariyer-modal-container',
                'tennis-overlay',
                'gokhan-video-call-overlay',
            ].forEach((id) => document.getElementById(id)?.classList.add('hidden'));

            ['hoca-panel-modal', 'sinif-katil-modal', 'wa-mesajlar-overlay', 'yonetici-panel-modal'].forEach((id) =>
                document.getElementById(id)?.remove()
            );

            if (typeof window.cleanupMessagingForLogout === 'function') {
                window.cleanupMessagingForLogout();
            }

            if (window.LisaniTennisOnline && typeof window.LisaniTennisOnline.stop === 'function') {
                window.LisaniTennisOnline.stop(false);
            }

            setTennisUnlockState(false);

            document.getElementById('bottom-bar')?.classList.remove('hidden');
            document.getElementById('quiz-active-view')?.classList.add('hidden');
            document.getElementById('quiz-result-view')?.classList.add('hidden');
            document.getElementById('bolum-selection-view')?.classList.remove('hidden');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        window.resetAppShellForLogout = resetAppShellForLogout;

        function switchTab(screenId, force, preserveTestsSubview) {
            if (!screenId || (!force && screenId === currentActiveScreen)) return;

            if (screenId === 'ai' && isHocaUser()) {
                if (typeof window.openHocaDashboard === 'function') {
                    window.openHocaDashboard();
                    return;
                }
            }

            if (screenId === 'tests' && isHocaUser() && typeof hasStudentFeatures === 'function' && !hasStudentFeatures()) {
                const quizOpen = !document.getElementById('quiz-active-view')?.classList.contains('hidden');
                if (!quizOpen) {
                    screenId = 'hoca-dashboard';
                }
            }

            playClickSound();
            currentActiveScreen = screenId;

            const screens = document.querySelectorAll('.screen');
            screens.forEach((screen) => {
                screen.classList.remove('active');
            });

            const targetScreen = document.getElementById(`screen-${screenId}`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            if (screenId === 'ai') {
                updateGelisimScreenForRole();
                renderProgressChart();
                renderQuizHistoryList();
                if (testHistory.length > 0) {
                    showTrialDetail(testHistory[testHistory.length - 1].id);
                }
                if (typeof window.loadProgressFromServer === 'function') {
                    window.loadProgressFromServer();
                }
            }

            if (screenId === 'hoca-dashboard') {
                if (canTrackStudents()) {
                    if (typeof window.loadHocaDashboard === 'function') {
                        window.loadHocaDashboard(true);
                    } else if (typeof window.loadHocaProgressView === 'function') {
                        window.loadHocaProgressView(true);
                    }
                } else if (typeof switchTab === 'function') {
                    switchTab('home');
                }
            }

            if (screenId === 'home') {
                refreshDailyHadisIfNeeded();
            }

            if (screenId === 'tests') {
                const quizActive = !document.getElementById('quiz-active-view')?.classList.contains('hidden');
                const quizResult = !document.getElementById('quiz-result-view')?.classList.contains('hidden');
                if (!preserveTestsSubview && !quizActive && !quizResult) {
                    setTestsSubview('list');
                    if (typeof renderBolumList === 'function') renderBolumList();
                }
                updateTestsTabForRole();
            }

            if (screenId === 'settings') {
                renderThemePicker(false);
                highlightColorModeButtons();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            if (screenId === 'profile') {
                updateLearningStats();
                if (typeof window.loadProgressFromServer === 'function') {
                    window.loadProgressFromServer();
                }
                if (typeof window.loadLeaderboard === 'function') {
                    window.loadLeaderboard();
                }
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            if (screenId === 'osm-translate' && window.lucide) {
                lucide.createIcons();
            }

            const screensContainer = document.getElementById('screens-container');
            if (screensContainer) {
                screensContainer.classList.toggle('lisani-screens--letters-only', screenId === 'letters');
                screensContainer.classList.toggle('lisani-screens--hoca-dash', screenId === 'hoca-dashboard');
            }

            const tabIds = ['ai', 'hoca-dashboard', 'home', 'letters', 'osm-translate', 'settings'];
            const tabHighlightId =
                screenId === 'profile' || screenId === 'tests' ? 'home' : screenId;
            tabIds.forEach((id) => {
                const tabBtn = document.getElementById(`tab-${id}`);
                if (!tabBtn) return;

                tabBtn.classList.remove('lisani-tab-active', 'font-black', 'theme-primary-color');
                tabBtn.classList.add('theme-text-muted');

                const icon = tabBtn.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                }

                if (id === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.classList.remove('lisani-tab-label-active', 'font-black', 'theme-primary-color');
                        homeText.classList.add('theme-text-muted');
                    }
                }
            });

            const activeTab = document.getElementById(`tab-${tabHighlightId}`);
            if (activeTab) {
                activeTab.classList.remove('theme-text-muted');
                activeTab.classList.add('lisani-tab-active');

                const activeIcon = activeTab.querySelector('i');
                if (activeIcon) activeIcon.style.transform = 'scale(1.06)';

                if (tabHighlightId === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.classList.remove('theme-text-muted');
                        homeText.classList.add('lisani-tab-label-active');
                    }
                }
            }
        }

        window.switchTab = switchTab;

        // GÜNÜN HADİSLERİ VERİ TABANI
        const hadisList = [
            {
                osmanli: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا",
                turkce: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
                kaynak: "Buhârî, İlim, 12"
            },
            {
                osmanli: "خِيَارُكُمْ أَحْسَنُكُمْ أَخْلَاقًا",
                turkce: "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
                kaynak: "Buhârî, Edeb, 39"
            },
            {
                osmanli: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
                turkce: "Güzel söz sadakadır.",
                kaynak: "Buhârî, Cihâd, 128"
            },
            {
                osmanli: "تَهَادَوْا تَحَابُّوا",
                turkce: "Hediyeleşiniz ki birbirinizi sevesiniz.",
                kaynak: "Muvatta, Hüsnü'l-Huluk, 4"
            }
        ];

        let currentHadisIdx = 0;
        const HADIS_DAY_KEY = 'lisani_hadis_day';
        const HADIS_IDX_KEY = 'lisani_hadis_idx';

        function getHadisIndexForDate(date) {
            const d = date instanceof Date ? date : new Date(date);
            const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
            return dayOfYear % hadisList.length;
        }

        function getTodayDateKey() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        function renderHadisAtIndex(idx) {
            const hadis = hadisList[idx];
            if (!hadis) return;
            currentHadisIdx = idx;
            const elOsm = document.getElementById('home-hadis-osmanli');
            const elTr = document.getElementById('home-hadis-turkce');
            const elKy = document.getElementById('home-hadis-kaynak');
            if (elOsm) elOsm.innerText = hadis.osmanli;
            if (elTr) elTr.innerText = `"${hadis.turkce}"`;
            if (elKy) elKy.innerText = hadis.kaynak;
        }

        function initDailyHadis() {
            const todayKey = getTodayDateKey();
            let idx = getHadisIndexForDate(new Date());
            try {
                const savedDay = localStorage.getItem(HADIS_DAY_KEY);
                const savedIdx = parseInt(localStorage.getItem(HADIS_IDX_KEY) || '', 10);
                if (savedDay === todayKey && !Number.isNaN(savedIdx) && savedIdx >= 0 && savedIdx < hadisList.length) {
                    idx = savedIdx;
                } else {
                    localStorage.setItem(HADIS_DAY_KEY, todayKey);
                    localStorage.setItem(HADIS_IDX_KEY, String(idx));
                }
            } catch (e) {}
            renderHadisAtIndex(idx);
        }

        function refreshDailyHadisIfNeeded() {
            try {
                if (localStorage.getItem(HADIS_DAY_KEY) !== getTodayDateKey()) {
                    initDailyHadis();
                }
            } catch (e) {
                initDailyHadis();
            }
        }

        function nextHadis() {
            playClickSound();
            const idx = (currentHadisIdx + 1) % hadisList.length;
            renderHadisAtIndex(idx);
            try {
                localStorage.setItem(HADIS_DAY_KEY, getTodayDateKey());
                localStorage.setItem(HADIS_IDX_KEY, String(idx));
            } catch (e) {}
            showToast('Yeni hadis yüklendi.', 'success');
        }

        window.nextHadis = nextHadis;

        function formatTrialLabel(record) {
            if (record.test) return record.test;
            if (record.bolum) {
                const meta = getBolumMeta(record.bolum);
                return meta?.title || record.bolum;
            }
            if (record.level) {
                const bolum = BOLUMLER.find((b) => (BOLUM_INDEX[b.id] || 0) === Number(record.level));
                if (bolum && record.test) return `${bolum.title} — ${record.test}`;
                if (bolum) return bolum.title;
            }
            return 'Test';
        }

        // Detay analizi kartına geçmiş sınavı yükler
        function showTrialDetail(id) {
            const deneme = getDisplayProgressHistory().find((d) => d.id === id);
            if (!deneme) return;

            const detailCard = document.getElementById('selected-trial-detail-card');
            if (detailCard) detailCard.classList.remove('hidden');

            document.getElementById('detail-trial-title').innerText = `${formatTrialLabel(deneme)} Detayı`;
            document.getElementById('detail-trial-date').innerText = deneme.date;
            document.getElementById('detail-trial-corrects').innerText = `${deneme.correct} Doğru`;
            document.getElementById('detail-trial-wrongs').innerText = `${deneme.wrong} Yanlış`;
            document.getElementById('detail-trial-success').innerText = `%${deneme.percent} Başarı`;

            const successTextEl = document.getElementById('detail-trial-success');
            if (deneme.percent >= 80) {
                successTextEl.className = "text-sm font-black text-emerald-400 animate-pulse";
            } else if (deneme.percent >= 60) {
                successTextEl.className = "text-sm font-black text-blue-450";
            } else {
                successTextEl.className = "text-sm font-black text-amber-450";
            }
        }

        // Çözülen Sınavların Analiz Listesini Çizer
        function renderQuizHistoryList() {
            const listEl = document.getElementById('quiz-history-list');
            const countEl = document.getElementById('total-quizzes-solved');
            const detailCard = document.getElementById('selected-trial-detail-card');
            if (!listEl) return;

            const history = getDisplayProgressHistory();
            listEl.innerHTML = '';
            countEl.innerText = `Toplam: ${history.length} Sınav`;

            // Hiç test çözülmemişse boş durum mesajı göster ve detay kartını gizle
            if (history.length === 0) {
                if (detailCard) detailCard.classList.add('hidden');
                const emptyMsg = 'Henüz çözülen sınav yok';
                listEl.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <i data-lucide="clipboard-list" class="w-8 h-8 theme-text-muted opacity-50"></i>
                        <p class="text-[11px] theme-text-muted font-bold">${emptyMsg}</p>
                        <p class="text-[10px] theme-text-muted opacity-70">Test çözdükçe sonuçların burada listelenecek</p>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }

            history.slice().reverse().forEach(record => {
                const row = document.createElement('div');
                row.className = "lisani-glass-panel lisani-glass-history-row";
                row.onclick = () => {
                    playClickSound();
                    showTrialDetail(record.id);
                    showToast("Sınav detayı yüklendi.", "success");
                };
                
                row.innerHTML = `
                    <div class="flex items-center space-x-2.5">
                        <span class="text-xs font-bold theme-text-main">${formatTrialLabel(record)}</span>
                        <span class="text-[9px] theme-text-muted font-semibold">${record.date}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-[10px] text-emerald-400 font-bold">${record.correct}D</span>
                        <span class="text-[10px] text-red-400 font-bold mr-1.5">${record.wrong}Y</span>
                        <span class="text-[10px] font-black theme-primary-color bg-black/45 px-2.5 py-0.5 rounded-md">%${record.percent}</span>
                    </div>
                `;
                listEl.appendChild(row);
            });
        }

        // İNTERAKTİF TEST ANALİZ GRAPH SİSTEMİ (SVG)
        function renderProgressChart() {
            const svg = document.getElementById('progress-svg-chart');
            if (!svg) return;
            const history = getDisplayProgressHistory();
            svg.innerHTML = `
                <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.0" />
                    </linearGradient>
                </defs>
            `;

            if (history.length === 0) {
                const emptyText = 'Henüz tamamlanan test yok';
                svg.innerHTML += `<text x="250" y="130" fill="var(--theme-text-muted)" font-size="14" font-weight="bold" text-anchor="middle">${emptyText}</text>`;
                return;
            }

            const pointsCount = history.length;
            const maxScore = 100; 
            const width = 500; 
            const height = 260; 

            const marginL = 40;
            const marginR = 25;
            const marginT = 40; 
            const marginB = 35; 

            const usableW = width - marginL - marginR;
            const usableH = height - marginT - marginB;
            const bottomY = height - marginB; 

            const gridLevels = [0, 50, 100]; 
            const gridLabels = ["%0", "%50", "%100"];

            gridLevels.forEach((level, idx) => {
                const gy = bottomY - (level / maxScore) * usableH;
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", marginL);
                line.setAttribute("y1", gy);
                line.setAttribute("x2", width - marginR);
                line.setAttribute("y2", gy);
                line.setAttribute("stroke", "var(--lisani-chart-grid, var(--theme-border))");
                line.setAttribute("stroke-opacity", "0.55");
                line.setAttribute("stroke-width", "1");
                svg.appendChild(line);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", marginL - 10);
                text.setAttribute("y", gy + 4);
                text.setAttribute("fill", "var(--theme-text-muted)");
                text.setAttribute("font-size", "10");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("text-anchor", "end");
                text.textContent = gridLabels[idx];
                svg.appendChild(text);
            });

            let pointsArray = [];
            history.forEach((record, idx) => {
                const x = pointsCount > 1 ? marginL + (idx / (pointsCount - 1)) * usableW : marginL + usableW / 2;
                const percent = record.score / maxScore;
                const y = bottomY - percent * usableH;
                const axisLabel = `S${record.level}-T${record.id}`;

                pointsArray.push({
                    id: record.id,
                    x: x,
                    y: y,
                    percentLabel: `%${record.percent}`,
                    axisLabel: axisLabel
                });
            });

            pointsArray.forEach(pt => {
                const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                vLine.setAttribute("x1", pt.x);
                vLine.setAttribute("y1", pt.y);
                vLine.setAttribute("x2", pt.x);
                vLine.setAttribute("y2", bottomY);
                vLine.setAttribute("stroke", "var(--theme-primary)");
                vLine.setAttribute("stroke-opacity", "0.2");
                vLine.setAttribute("stroke-dasharray", "3,3");
                vLine.setAttribute("stroke-width", "1");
                svg.appendChild(vLine);
            });

            let pathData = "";
            if (pointsCount > 0) {
                pathData = `M ${pointsArray[0].x} ${pointsArray[0].y}`;
                for (let i = 0; i < pointsCount - 1; i++) {
                    const p0 = pointsArray[i];
                    const p1 = pointsArray[i + 1];
                    const cpX1 = p0.x + (p1.x - p0.x) / 2;
                    const cpY1 = p0.y;
                    const cpX2 = p0.x + (p1.x - p0.x) / 2;
                    const cpY2 = p1.y;
                    
                    pathData += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                }
            }

            if (pointsCount > 1 && pathData !== "") {
                const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const firstPt = pointsArray[0];
                const lastPt = pointsArray[pointsCount - 1];
                const areaData = `${pathData} L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`;
                
                areaPath.setAttribute("d", areaData);
                areaPath.setAttribute("fill", "url(#chart-area-grad)");
                svg.appendChild(areaPath);
            }

            if (pathData !== "") {
                const mainLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                mainLine.setAttribute("d", pathData);
                mainLine.setAttribute("fill", "none");
                mainLine.setAttribute("stroke", "var(--theme-primary)");
                mainLine.setAttribute("stroke-width", "3.5");
                mainLine.setAttribute("stroke-linecap", "round");
                svg.appendChild(mainLine);
            }

            pointsArray.forEach(pt => {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", pt.x);
                circle.setAttribute("cy", pt.y);
                circle.setAttribute("r", "6");
                circle.setAttribute("fill", "var(--lisani-chart-point-fill, #ffffff)"); 
                circle.setAttribute("stroke", "var(--theme-primary)"); 
                circle.setAttribute("stroke-width", "3");
                circle.style.cursor = "pointer";

                circle.onclick = function() {
                    playClickSound();
                    showTrialDetail(pt.id);
                    showToast("Çalışma istatistiği seçildi.", "success");
                };
                svg.appendChild(circle);

                const pctText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                pctText.setAttribute("x", pt.x);
                pctText.setAttribute("y", pt.y - 12);
                pctText.setAttribute("fill", "var(--theme-text-main)");
                pctText.setAttribute("font-size", "10");
                pctText.setAttribute("font-weight", "black");
                pctText.setAttribute("text-anchor", "middle");
                pctText.textContent = pt.percentLabel;
                svg.appendChild(pctText);

                const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                labelText.setAttribute("x", pt.x);
                labelText.setAttribute("y", bottomY + 20);
                labelText.setAttribute("fill", "var(--theme-text-muted)");
                labelText.setAttribute("font-size", "10");
                labelText.setAttribute("font-weight", "bold");
                labelText.setAttribute("text-anchor", "middle");
                labelText.textContent = pt.axisLabel;
                svg.appendChild(labelText);
            });
        }

        // --- HARFLER KILAVUZU MODÜLÜ ---
        const alphabet = [
            { name: 'Elif', ar: 'ا', sounds: 'A, E, I, İ', desc: 'Kelime başında ince seslilerde E, kalın seslilerde A sesi verir. Kendisinden sonraki harfe birleşmez.', f1: 'ا', f2: 'اـ', f3: 'ـاـ', f4: 'ـا' },
            { name: 'Be', ar: 'ب', sounds: 'B', desc: 'Türkçe kelimelerde bazen P sesine dönüşebilir.', f1: 'ب', f2: 'بـ', f3: 'ـبـ', f4: 'ـب' },
            { name: 'Pe', ar: 'پ', sounds: 'P', desc: 'Osmanlıca ve Farsçaya özgü üç noktalı harftir.', f1: 'پ', f2: 'پـ', f3: 'ـپـ', f4: 'ـپ' },
            { name: 'Te', ar: 'ت', sounds: 'T', desc: 'Yumuşak t sesini verir.', f1: 'ت', f2: 'تـ', f3: 'ـتـ', f4: 'ـت' },
            { name: 'Se', ar: 'ث', sounds: 'S (Pelte)', desc: 'Arapça kökenli kelimelerde peltek "S" sesini temsil eder.', f1: 'ث', f2: 'ثـ', f3: 'ـثـ', f4: 'ـث' },
            { name: 'Cim', ar: 'ج', sounds: 'C', desc: 'Standart c sesini karşılar.', f1: 'ج', f2: 'جـ', f3: 'ـجـ', f4: 'ـج' },
            { name: 'Çim', ar: 'چ', sounds: 'Ç', desc: 'Türkçe ve Farsça kelimeler için üretilen üç noktalı Ç harfidir.', f1: 'چ', f2: 'چـ', f3: 'ـچـ', f4: 'ـچ' },
            { name: 'Ha', ar: 'ح', sounds: 'H', desc: 'Boğazdan çıkarılan kalın "H" sesidir.', f1: 'ح', f2: 'حـ', f3: 'ـحـ', f4: 'ـح' },
            { name: 'Hı', ar: 'خ', sounds: 'H (Hırıltılı)', desc: 'Gırtlaktan hırıldatılarak okunan kalın h sesidir.', f1: 'خ', f2: 'خـ', f3: 'ـخـ', f4: 'ـخ' },
            { name: 'Dal', ar: 'د', sounds: 'D', desc: 'Kendinden sonraki harfle birleşmez.', f1: 'د', f2: 'د', f3: 'ـد', f4: 'ـد' },
            { name: 'Zel', ar: 'ذ', sounds: 'Z (Pelte)', desc: 'Peltek Z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ذ', f2: 'ذ', f3: 'ـذ', f4: 'ـذ' },
            { name: 'Rı', ar: 'ر', sounds: 'R', desc: 'Standart r sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ر', f2: 'ر', f3: 'ـر', f4: 'ـر' },
            { name: 'Ze', ar: 'ز', sounds: 'Z', desc: 'Sert z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ز', f2: 'ز', f3: 'ـز', f4: 'ـز' },
            { name: 'Je', ar: 'ژ', sounds: 'J', desc: 'Üç noktalı rı harfidir. Kendisinden sonraki harfe birleşmez.', f1: 'ژ', f2: 'ژ', f3: 'ـژ', f4: 'ـژ' },
            { name: 'Sin', ar: 'س', sounds: 'S', desc: 'İnce sesli kelimelerde S sesini karşılar.', f1: 'س', f2: 'سـ', f3: 'ـسـ', f4: 'ـس' },
            { name: 'Şın', ar: 'ش', sounds: 'Ş', desc: 'Standart ş sesini karşılar.', f1: 'ش', f2: 'شـ', f3: 'ـشـ', f4: 'ـش' },
            { name: 'Sad', ar: 'ص', sounds: 'S (Kalın)', desc: 'Kalın sesli kelimelerde "S" sesini temsil eder.', f1: 'ص', f2: 'صـ', f3: 'ـصـ', f4: 'ـص' },
            { name: 'Dad', ar: 'ض', sounds: 'D, Z', desc: 'Arapça kökenli kelimelere özel kalın bir sestir.', f1: 'ض', f2: 'ضـ', f3: 'ـضـ', f4: 'ـض' },
            { name: 'Tı', ar: 'ط', sounds: 'T (Kalın)', desc: 'Kalın sesli kelimelerde "T" ve bazen "D" sesini verir.', f1: 'ط', f2: 'طـ', f3: 'ـطـ', f4: 'ـط' },
            { name: 'Zı', ar: 'ظ', sounds: 'Z (Kalın)', desc: 'Kalın sesli kelimelerde kalın ve tok "Z" sesini temsil eder.', f1: 'ظ', f2: 'ظـ', f3: 'ـظـ', f4: 'ـظ' },
            { name: 'Ayın', ar: 'ع', sounds: 'A, E, I, İ, O, Ö, U, Ü', desc: 'Boğazdan gelen bir gırtlak sesidir.', f1: 'ع', f2: 'عـ', f3: 'ـعـ', f4: 'ـع' },
            { name: 'Gayın', ar: 'غ', sounds: 'Ğ, G', desc: 'Kalın sesli kelimelerde yumuşak g veya kalın g sesini verir.', f1: 'غ', f2: 'غـ', f3: 'ـغـ', f4: 'ـغ' },
            { name: 'Fe', ar: 'ف', sounds: 'F', desc: 'Standart f sesini karşılar.', f1: 'ف', f2: 'فـ', f3: 'ـفـ', f4: 'ـف' },
            { name: 'Kaf', ar: 'ق', sounds: 'K (Kalın)', desc: 'Kalın sesli kelimelerde gırtlaktan çıkan tok K sesini verir.', f1: 'ق', f2: 'قـ', f3: 'ـقـ', f4: 'ـق' },
            { name: 'Kef', ar: 'ك', sounds: 'K (İnce)', desc: 'İnce sesli kelimelerde ince K sesini karşılar.', f1: 'ك', f2: 'كـ', f3: 'ـكـ', f4: 'ـك' },
            { name: 'Gef', ar: 'گ', sounds: 'G', desc: 'Türkçe ve Farsçadaki yumuşak G/G sesleri için kullanılır.', f1: 'گ', f2: 'گـ', f3: 'ـگـ', f4: 'ـگ' },
            { name: 'Nef (Sağır Nun)', ar: 'ڭ', sounds: 'N, Ñ', desc: 'Genizden çıkan n (nazal n) sesidir. Türkçeye özeldir.', f1: 'ڭ', f2: 'ڭـ', f3: 'ـڭـ', f4: 'ـڭ' },
            { name: 'Lam', ar: 'ل', sounds: 'L', desc: 'Standart l sesini temsil eder.', f1: 'ل', f2: 'لـ', f3: 'ـلـ', f4: 'ـل' },
            { name: 'Mim', ar: 'م', sounds: 'M', desc: 'Standart m sesini temsil eder.', f1: 'م', f2: 'مـ', f3: 'ـمـ', f4: 'ـم' },
            { name: 'Nun', ar: 'ن', sounds: 'N', desc: 'Standart n sesini temsil eder.', f1: 'ن', f2: 'نـ', f3: 'ـنـ', f4: 'ـن' },
            { name: 'Vav', ar: 'و', sounds: 'V, O, Ö, U, Ü', desc: 'Hem ünsüz hem ünlü harf görevindedir. Birleşmez.', f1: 'و', f2: 'و', f3: 'ـو', f4: 'ـو' },
            { name: 'He', ar: 'ه', sounds: 'H, E, A', desc: 'Kelime sonunda gelince e veya a sesi verir.', f1: 'ه', f2: 'هـ', f3: 'ـهـ', f4: 'ـه' },
            { name: 'Lamelif', ar: 'لا', sounds: 'La', desc: 'Lam ve Elif harflerinin birleşiminden oluşan özel harf.', f1: 'لا', f2: 'لا', f3: 'ـلاـ', f4: 'ـلا' },
            { name: 'Ye', ar: 'ي', sounds: 'Y, I, İ', desc: 'Hem ünsüz hem ünlü harf görevindedir.', f1: 'ي', f2: 'يـ', f3: 'ـيـ', f4: 'ـي' },
            { name: 'Hemze', ar: 'ء', sounds: 'A, E, I, İ', desc: 'Kelime içinde es, kesinti veya ek ünlü seslerini karşılar.', f1: 'ء', f2: 'ء', f3: 'ء', f4: 'ء' }
        ];

        const LETTER_FORM_LABELS = { f1: 'Yalın', f2: 'Başta', f3: 'Ortada', f4: 'Sonda' };

        const LETTER_FORM_EXAMPLES = {
            Elif: { f1: { ar: 'ا', tr: 'Elif — yalın hal' }, f2: { ar: 'اسم', tr: 'ism — ad' }, f3: { ar: 'دنيا', tr: 'dünyâ — dünya' }, f4: { ar: 'قمرا', tr: 'kamer — ay' } },
            Be: { f1: { ar: 'ب', tr: 'Be — yalın hal' }, f2: { ar: 'باب', tr: 'bâb — kapı' }, f3: { ar: 'كتاب', tr: 'kitâb — kitap' }, f4: { ar: 'حب', tr: 'hub — sevgi' } },
            Pe: { f1: { ar: 'پ', tr: 'Pe — yalın hal' }, f2: { ar: 'پدر', tr: 'pedar — baba (Farsça)' }, f3: { ar: 'چپ', tr: 'çep — sol' }, f4: { ar: 'آب', tr: 'âb — su' } },
            Te: { f1: { ar: 'ت', tr: 'Te — yalın hal' }, f2: { ar: 'تاج', tr: 'tâc — taç' }, f3: { ar: 'كتاب', tr: 'kitâb — kitap' }, f4: { ar: 'بيت', tr: 'beyt — ev, mısra' } },
            Se: { f1: { ar: 'ث', tr: 'Se — yalın hal' }, f2: { ar: 'ثواب', tr: 'sevâb — ecir' }, f3: { ar: 'مثال', tr: 'mesâl — örnek' }, f4: { ar: 'حارث', tr: 'hâris — çiftçi' } },
            Cim: { f1: { ar: 'ج', tr: 'Cim — yalın hal' }, f2: { ar: 'جمال', tr: 'cemâl — güzellik' }, f3: { ar: 'مجلس', tr: 'meclis — meclis' }, f4: { ar: 'فرج', tr: 'ferc — ara, fırsat' } },
            Çim: { f1: { ar: 'چ', tr: 'Çim — yalın hal' }, f2: { ar: 'چراغ', tr: 'çirâğ — lamba' }, f3: { ar: 'آچق', tr: 'açıq — açık' }, f4: { ar: 'گوج', tr: 'göç — göç' } },
            Ha: { f1: { ar: 'ح', tr: 'Ha — yalın hal' }, f2: { ar: 'حكم', tr: 'hüküm — hüküm' }, f3: { ar: 'صحت', tr: 'sıhhat — sağlık' }, f4: { ar: 'صبح', tr: 'sabah — sabah' } },
            Hı: { f1: { ar: 'خ', tr: 'Hı — yalın hal' }, f2: { ar: 'خبر', tr: 'haber — haber' }, f3: { ar: 'مخزن', tr: 'mahzen — depo' }, f4: { ar: 'فلخ', tr: 'felah — kurtuluş' } },
            Dal: { f1: { ar: 'د', tr: 'Dal — yalın hal' }, f2: { ar: 'دين', tr: 'din — din' }, f3: { ar: 'مدرسه', tr: 'medrese — okul' }, f4: { ar: 'سعاد', tr: 'saâdet — mutluluk' } },
            Zel: { f1: { ar: 'ذ', tr: 'Zel — yalın hal' }, f2: { ar: 'ذهب', tr: 'zeheb — altın' }, f3: { ar: 'تذكر', tr: 'tezekkür — anma' }, f4: { ar: 'عذر', tr: 'ozr — mazeret' } },
            Rı: { f1: { ar: 'ر', tr: 'Rı — yalın hal' }, f2: { ar: 'رحمت', tr: 'rahmet — merhamet' }, f3: { ar: 'قرآن', tr: 'Kur\'ân — Kur\'an' }, f4: { ar: 'نور', tr: 'nûr — nur' } },
            Ze: { f1: { ar: 'ز', tr: 'Ze — yalın hal' }, f2: { ar: 'زمان', tr: 'zamân — zaman' }, f3: { ar: 'مزاج', tr: 'mizâc — mizaç' }, f4: { ar: 'عز', tr: 'izz — izzet' } },
            Je: { f1: { ar: 'ژ', tr: 'Je — yalın hal' }, f2: { ar: 'ژاله', tr: 'jâle — çiğ' }, f3: { ar: 'پژمرده', tr: 'pürmüre — solmuş' }, f4: { ar: 'مرژ', tr: 'marj — sınır' } },
            Sin: { f1: { ar: 'س', tr: 'Sin — yalın hal' }, f2: { ar: 'سلام', tr: 'selâm — selam' }, f3: { ar: 'مسجد', tr: 'mescid — cami' }, f4: { ar: 'نفس', tr: 'nefs — nefis' } },
            Şın: { f1: { ar: 'ش', tr: 'Şın — yalın hal' }, f2: { ar: 'شكر', tr: 'şükr — şükür' }, f3: { ar: 'مشكل', tr: 'müşkül — güç' }, f4: { ar: 'عشق', tr: 'aşk — aşk' } },
            Sad: { f1: { ar: 'ص', tr: 'Sad — yalın hal' }, f2: { ar: 'صبر', tr: 'sabr — sabır' }, f3: { ar: 'مصطفى', tr: 'Mustafâ — Mustafa' }, f4: { ar: 'ناصر', tr: 'nâsır — yardımcı' } },
            Dad: { f1: { ar: 'ض', tr: 'Dad — yalın hal' }, f2: { ar: 'ضيف', tr: 'daif — misafir' }, f3: { ar: 'مضمون', tr: 'mezmûn — konu' }, f4: { ar: 'فرض', tr: 'farz — farz' } },
            Tı: { f1: { ar: 'ط', tr: 'Tı — yalın hal' }, f2: { ar: 'طلب', tr: 'talab — istek' }, f3: { ar: 'مطلوب', tr: 'matlûb — aranan' }, f4: { ar: 'خط', tr: 'hatt — çizgi' } },
            Zı: { f1: { ar: 'ظ', tr: 'Zı — yalın hal' }, f2: { ar: 'ظهر', tr: 'zuhur — zuhur' }, f3: { ar: 'منظور', tr: 'menzûr — görünür' }, f4: { ar: 'حفظ', tr: 'hıfz — ezber' } },
            Ayın: { f1: { ar: 'ع', tr: 'Ayın — yalın hal' }, f2: { ar: 'علم', tr: 'ilm — ilim' }, f3: { ar: 'معنی', tr: 'ma\'nâ — anlam' }, f4: { ar: 'سمع', tr: 'sem\' — işitme' } },
            Gayın: { f1: { ar: 'غ', tr: 'Gayın — yalın hal' }, f2: { ar: 'غلام', tr: 'gulâm — delikanlı' }, f3: { ar: 'مغفر', tr: 'mağfur — bağışlanmış' }, f4: { ar: 'فراغ', tr: 'ferâğ — boşluk' } },
            Fe: { f1: { ar: 'ف', tr: 'Fe — yalın hal' }, f2: { ar: 'فكر', tr: 'fikr — düşünce' }, f3: { ar: 'مفتاح', tr: 'miftâh — anahtar' }, f4: { ar: 'حرف', tr: 'harf — harf' } },
            Kaf: { f1: { ar: 'ق', tr: 'Kaf — yalın hal' }, f2: { ar: 'قلم', tr: 'kalem — kalem' }, f3: { ar: 'مقام', tr: 'makâm — makam' }, f4: { ar: 'حق', tr: 'hak — hak' } },
            Kef: { f1: { ar: 'ك', tr: 'Kef — yalın hal' }, f2: { ar: 'كتاب', tr: 'kitâb — kitap' }, f3: { ar: 'مكتب', tr: 'makteb — yazı odası' }, f4: { ar: 'ملك', tr: 'melik — hükümdar' } },
            Gef: { f1: { ar: 'گ', tr: 'Gef — yalın hal' }, f2: { ar: 'گل', tr: 'gül — gül' }, f3: { ar: 'آغاج', tr: 'ağaç — ağaç' }, f4: { ar: 'دوست', tr: 'dost — dost' } },
            'Nef (Sağır Nun)': { f1: { ar: 'ڭ', tr: 'Nef — yalın hal' }, f2: { ar: 'ڭوزل', tr: 'güzel — güzel' }, f3: { ar: 'آڭ', tr: 'an — an' }, f4: { ar: 'قونڭ', tr: 'könüng — hükümdar' } },
            Lam: { f1: { ar: 'ل', tr: 'Lam — yalın hal' }, f2: { ar: 'ليل', tr: 'leyl — gece' }, f3: { ar: 'علم', tr: 'ilm — ilim' }, f4: { ar: 'جمال', tr: 'cemâl — güzellik' } },
            Mim: { f1: { ar: 'م', tr: 'Mim — yalın hal' }, f2: { ar: 'مدرسه', tr: 'medrese — okul' }, f3: { ar: 'محمد', tr: 'Muhammed — Muhammed' }, f4: { ar: 'علم', tr: 'ilm — ilim' } },
            Nun: { f1: { ar: 'ن', tr: 'Nun — yalın hal' }, f2: { ar: 'نور', tr: 'nûr — nur' }, f3: { ar: 'منظر', tr: 'menzara — manzara' }, f4: { ar: 'حسن', tr: 'husn — güzellik' } },
            Vav: { f1: { ar: 'و', tr: 'Vav — yalın hal' }, f2: { ar: 'ورد', tr: 'verd — gül' }, f3: { ar: 'دنيا', tr: 'dünyâ — dünya' }, f4: { ar: 'هنو', tr: 'henüz — henüz' } },
            He: { f1: { ar: 'ه', tr: 'He — yalın hal' }, f2: { ar: 'هوا', tr: 'havâ — hava' }, f3: { ar: 'محبه', tr: 'muhabbet — sevgi' }, f4: { ar: 'پاره', tr: 'pâre — parça' } },
            Lamelif: { f1: { ar: 'لا', tr: 'Lâm-Elif — birleşik harf' }, f2: { ar: 'لاب', tr: 'lâb — kap' }, f3: { ar: 'صلاح', tr: 'salâh — iyilik' }, f4: { ar: 'مولا', tr: 'mevlâ — efendi' } },
            Ye: { f1: { ar: 'ي', tr: 'Ye — yalın hal' }, f2: { ar: 'يوم', tr: 'yevm — gün' }, f3: { ar: 'حيات', tr: 'hayât — hayat' }, f4: { ar: 'على', tr: 'alâ — üzerine' } },
            Hemze: { f1: { ar: 'ء', tr: 'Hemze — yalın hal' }, f2: { ar: 'أمة', tr: 'ümmet — ümmet' }, f3: { ar: 'مسئله', tr: 'mesele — mesele' }, f4: { ar: 'قراء', tr: 'kurâ — okuyucular' } },
        };

        let _letterDetailCurrent = null;
        let _letterFormHandlersReady = false;

        function getLetterFormExample(letterName, formKey) {
            const custom = LETTER_FORM_EXAMPLES[letterName]?.[formKey];
            if (custom) return custom;
            const letter = alphabet.find((l) => l.name === letterName);
            if (!letter) return { ar: '—', tr: 'Örnek bulunamadı' };
            const formChar = letter[formKey] || letter.f1 || letter.ar;
            return {
                ar: formChar,
                tr: `${letter.name} harfi (${LETTER_FORM_LABELS[formKey] || formKey})`,
            };
        }

        function showLetterFormExample(letter, formKey, cellEl) {
            const example = getLetterFormExample(letter.name, formKey);
            const box = document.getElementById('letter-form-example');
            const arEl = document.getElementById('letter-example-ar');
            const trEl = document.getElementById('letter-example-tr');
            const labelEl = document.getElementById('letter-example-label');
            if (!box || !arEl || !trEl) return;

            document.querySelectorAll('.lisani-letters-form-cell').forEach((c) => c.classList.remove('is-selected'));
            if (cellEl) cellEl.classList.add('is-selected');

            if (labelEl) labelEl.textContent = LETTER_FORM_LABELS[formKey] || formKey;
            arEl.textContent = example.ar;
            trEl.textContent = example.tr;
            box.classList.remove('hidden');
        }

        function initLetterFormHandlers() {
            if (_letterFormHandlersReady) return;
            _letterFormHandlersReady = true;

            document.querySelectorAll('.lisani-letters-form-cell[data-form]').forEach((cell) => {
                const activate = () => {
                    if (!_letterDetailCurrent) return;
                    playClickSound();
                    showLetterFormExample(_letterDetailCurrent, cell.dataset.form, cell);
                };
                cell.addEventListener('click', activate);
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activate();
                    }
                });
            });
        }

        // Harfleri filtreleme (YENİ EK ÖZELLİK)
        function handleLettersSearch(event) {
            const query = event.target.value.toLowerCase().trim();
            const clearBtn = document.getElementById('letters-search-clear-btn');
            
            if (query.length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
            
            initLettersGrid(query);
        }

        function clearLettersSearch() {
            const input = document.getElementById('letters-search-input');
            input.value = '';
            document.getElementById('letters-search-clear-btn').classList.add('hidden');
            initLettersGrid();
        }

        function initRememberMeCheckbox() {
            const cb = document.getElementById('login-remember-me');
            if (!cb) return;
            const pref = localStorage.getItem('lisani_remember_me_pref');
            const activeSession = localStorage.getItem('lisani_remember_me') === 'true';
            cb.checked = pref !== 'false' || activeSession;
            if (!cb.dataset.bound) {
                cb.dataset.bound = '1';
                cb.addEventListener('change', () => {
                    localStorage.setItem('lisani_remember_me_pref', cb.checked ? 'true' : 'false');
                });
            }
        }


        function initLettersGrid(filterQuery = "") {
            const grid = document.getElementById('letters-grid');
            if (!grid) return;
            grid.innerHTML = '';
            
            const filteredAlphabet = alphabet.filter(letter => {
                return letter.name.toLowerCase().includes(filterQuery) || 
                       letter.sounds.toLowerCase().includes(filterQuery);
            });

            if (filteredAlphabet.length === 0) {
                grid.innerHTML = `
                    <div class="lisani-letters-empty lisani-glass-panel rounded-2xl text-center py-8">
                        <p class="text-xs theme-text-muted font-bold">Aradığınız harf bulunamadı.</p>
                    </div>
                `;
                return;
            }
            
            filteredAlphabet.forEach((letter) => {
                const card = document.createElement('div');
                card.className = "lisani-letter-card lisani-glass-panel lisani-glass-card rounded-xl p-2.5 sm:p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1";
                card.dataset.letterName = letter.name;
                card.onclick = () => {
                    playClickSound();
                    showLetterDetail(letter);
                    showToast(`${letter.name} harfi seçildi.`, "success");
                };
                card.innerHTML = `
                    <span class="lisani-letter-card__ar arabic-text font-bold">${letter.ar}</span>
                    <span class="lisani-letter-card__name text-[11px] sm:text-[10px] font-bold theme-text-main leading-snug">${letter.name}</span>
                    <span class="lisani-letter-card__sound text-[10px] sm:text-[9px] theme-text-muted font-semibold leading-snug">${letter.sounds}</span>
                `;
                grid.appendChild(card);
            });
        }

        function showLetterDetail(letter) {
            _letterDetailCurrent = letter;
            initLetterFormHandlers();
            document.getElementById('letter-detail-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            document.getElementById('detail-title').innerText = `${letter.name} (${letter.ar})`;
            document.getElementById('detail-desc').innerText = letter.desc;
            document.getElementById('detail-arabic').innerText = letter.ar;

            document.getElementById('detail-f1').innerText = letter.f1;
            document.getElementById('detail-f2').innerText = letter.f2 || letter.f1;
            document.getElementById('detail-f3').innerText = letter.f3 || letter.f1;
            document.getElementById('detail-f4').innerText = letter.f4 || letter.f1;

            document.querySelectorAll('.lisani-letters-form-cell').forEach((c) => c.classList.remove('is-selected'));
            document.querySelectorAll('#letters-grid .lisani-letter-card').forEach((card) => {
                card.classList.toggle('is-selected', card.dataset.letterName === letter.name);
            });
            const exampleBox = document.getElementById('letter-form-example');
            if (exampleBox) exampleBox.classList.add('hidden');
        }

        // ================= DOKUNMATİK SEKMELER ARASI KAYDIRMA MOTORU (SWIPE) =================
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        function isSwipeGestureBlocked() {
            return (
                !document.getElementById('quiz-active-view').classList.contains('hidden') ||
                !document.getElementById('kariyer-modal-container').classList.contains('hidden') ||
                !document.getElementById('edit-profile-container').classList.contains('hidden') ||
                !!document.getElementById('wa-mesajlar-overlay')
            );
        }

        function getSwipeTabOrder() {
            const order = [];
            const tabAi = document.getElementById('tab-ai');
            const tabHoca = document.getElementById('tab-hoca-dashboard');
            if (tabAi && !tabAi.classList.contains('hidden')) order.push('ai');
            if (tabHoca && !tabHoca.classList.contains('hidden')) order.push('hoca-dashboard');
            order.push('letters', 'home', 'osm-translate', 'settings');
            return order;
        }

        function canElementScroll(el, deltaY) {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            const overflowY = style.overflowY;
            if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
                return false;
            }
            if (deltaY > 0) {
                return el.scrollHeight - el.clientHeight - el.scrollTop > 1;
            }
            if (deltaY < 0) {
                return el.scrollTop > 1;
            }
            return false;
        }

        function findScrollableAncestor(el, deltaY, stopAt) {
            let node = el;
            while (node && node !== stopAt && node !== document.body) {
                if (canElementScroll(node, deltaY)) {
                    return node;
                }
                node = node.parentElement;
            }
            return null;
        }

        function initDesktopWheelScroll() {
            const appShell = document.getElementById('app-container');
            const mainFlow = document.getElementById('main-application-flow');
            const screens = document.getElementById('screens-container');
            if (!appShell || !mainFlow || !screens) return;

            appShell.addEventListener('wheel', (e) => {
                if (window.innerWidth < 1024) return;
                if (mainFlow.classList.contains('hidden')) return;
                if (isSwipeGestureBlocked()) return;

                const nestedScrollable = findScrollableAncestor(e.target, e.deltaY, appShell);
                if (nestedScrollable && nestedScrollable !== screens) return;
                if (screens.scrollHeight <= screens.clientHeight + 1) return;

                screens.scrollTop += e.deltaY;
                e.preventDefault();
            }, { passive: false });
        }

        function initSwipeGestures() {
            const container = document.getElementById('screens-container');
            if (!container) return;

            container.addEventListener('touchstart', (e) => {
                if (isSwipeGestureBlocked()) return;

                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                if (isSwipeGestureBlocked()) return;

                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipeGesture(getSwipeTabOrder());
            }, { passive: true });
        }

        function handleSwipeGesture(tabOrder) {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                const swipeThreshold = 55;
                const currentIdx = tabOrder.indexOf(currentActiveScreen);

                if (deltaX < -swipeThreshold) {
                    if (currentIdx < tabOrder.length - 1) {
                        switchTab(tabOrder[currentIdx + 1]);
                    }
                } else if (deltaX > swipeThreshold) {
                    if (currentIdx > 0) {
                        switchTab(tabOrder[currentIdx - 1]);
                    }
                }
            }
        }

        function getTennisSurfaceEl() {
            if (tennisCanvas && !tennisCanvas.classList.contains('hidden')) {
                return tennisCanvas;
            }
            return document.getElementById('tennis-scene-host')
                || document.getElementById('tennis-canvas');
        }

        function buildTennisCourtCache() {
            const off = document.createElement('canvas');
            off.width = TENNIS_W;
            off.height = TENNIS_H;
            const c = off.getContext('2d');
            if (!c) return null;

            const W = TENNIS_W;
            const H = TENNIS_H;
            const margin = 12;
            const courtW = W - margin * 2;
            const courtH = H - margin * 2;

            const bg = c.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#0f766e');
            bg.addColorStop(0.35, '#14b8a6');
            bg.addColorStop(0.65, '#0d9488');
            bg.addColorStop(1, '#115e59');
            c.fillStyle = bg;
            c.fillRect(0, 0, W, H);

            for (let i = 0; i < 14; i++) {
                c.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
                c.fillRect(margin, margin + (courtH / 14) * i, courtW, courtH / 14);
            }

            c.fillStyle = '#134e4a';
            c.fillRect(margin - 3, margin - 3, courtW + 6, courtH + 6);

            c.strokeStyle = 'rgba(255,255,255,0.92)';
            c.lineWidth = 2;
            c.strokeRect(margin, margin, courtW, courtH);

            const midY = H / 2;
            c.beginPath();
            c.moveTo(margin, midY);
            c.lineTo(W - margin, midY);
            c.stroke();

            const serviceW = courtW * 0.22;
            c.beginPath();
            c.moveTo(margin + serviceW, margin);
            c.lineTo(margin + serviceW, H - margin);
            c.moveTo(W - margin - serviceW, margin);
            c.lineTo(W - margin - serviceW, H - margin);
            c.stroke();

            c.beginPath();
            c.moveTo(margin, midY - courtH * 0.18);
            c.lineTo(W - margin, midY - courtH * 0.18);
            c.moveTo(margin, midY + courtH * 0.18);
            c.lineTo(W - margin, midY + courtH * 0.18);
            c.stroke();

            c.fillStyle = 'rgba(255,255,255,0.95)';
            c.fillRect(W / 2 - 1.5, margin, 3, courtH);

            const netH = 18;
            c.fillStyle = 'rgba(255,255,255,0.55)';
            c.fillRect(margin, midY - netH / 2, courtW, 2);
            c.strokeStyle = 'rgba(255,255,255,0.25)';
            c.lineWidth = 1;
            for (let x = margin + 4; x < W - margin; x += 7) {
                c.beginPath();
                c.moveTo(x, midY - netH / 2);
                c.lineTo(x, midY + netH / 2);
                c.stroke();
            }
            c.fillStyle = '#e2e8f0';
            c.fillRect(margin - 4, midY - netH / 2 - 2, 5, netH + 4);
            c.fillRect(W - margin - 1, midY - netH / 2 - 2, 5, netH + 4);

            return off;
        }

        function spawnTennisHitParticles(x, y, color) {
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
                const speed = 1.2 + Math.random() * 2.8;
                tennisHitParticles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    color,
                });
            }
        }

        function updateTennisHitParticles(dt) {
            tennisHitParticles = tennisHitParticles.filter((p) => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= 0.04 * dt;
                return p.life > 0;
            });
        }

        function drawTennisRacket(ctx, x, y, w, h, fill, accent, isPlayer) {
            ctx.save();
            const cx = x + w / 2;
            const headY = isPlayer ? y : y;
            const headW = w;
            const headH = h + 6;

            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.beginPath();
            ctx.ellipse(cx, headY + headH + 3, headW * 0.42, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            const grad = ctx.createLinearGradient(x, y, x + w, y + h);
            grad.addColorStop(0, fill);
            grad.addColorStop(0.5, accent);
            grad.addColorStop(1, fill);
            ctx.fillStyle = grad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = accent;

            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(x + w * 0.08, headY, headW * 0.84, headH, 10);
                ctx.fill();
            } else {
                ctx.fillRect(x + w * 0.08, headY, headW * 0.84, headH);
            }
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                const lx = x + (w / 4) * i;
                ctx.beginPath();
                ctx.moveTo(lx, headY + 3);
                ctx.lineTo(lx, headY + headH - 3);
                ctx.stroke();
            }
            for (let j = 1; j < 3; j++) {
                const ly = headY + (headH / 3) * j;
                ctx.beginPath();
                ctx.moveTo(x + w * 0.12, ly);
                ctx.lineTo(x + w * 0.88, ly);
                ctx.stroke();
            }

            const handleY = isPlayer ? y + headH : y + headH;
            ctx.fillStyle = '#78716c';
            ctx.fillRect(cx - 3, handleY, 6, paddleHandleH);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(cx - 1, handleY + 1, 2, paddleHandleH - 2);
            ctx.restore();
        }

        // --- TENİS OYUNU FİZİK VE ÇİZİM MOTORU ---
        function initTennisGameEngine() {
            const sceneHost = document.getElementById('tennis-scene-host');
            tennisCanvas = document.getElementById('tennis-canvas');
            if (!tennisCanvas) return;

            if (window.LisaniTennis3D?.dispose) {
                window.LisaniTennis3D.dispose();
            }

            tennisCtx = tennisCanvas.getContext('2d');
            if (!tennisCtx) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            tennisCanvas.width = TENNIS_W * dpr;
            tennisCanvas.height = TENNIS_H * dpr;
            tennisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            tennisCanvas.classList.remove('hidden');
            if (sceneHost) {
                sceneHost.classList.add('hidden');
                sceneHost.innerHTML = '';
            }

            tennisCourtCache = buildTennisCourtCache();
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            tennisMatchOver = false;
            tennisPaused = false;
            tennisRallyHits = 0;
            tennisBallSpin = 0;
            tennisBallRotation = 0;
            tennisHitParticles = [];
            tennisBotTargetX = null;
            tennisBotReaction = 0;
            ballTrail = [];
            hideTennisOverlay();

            playerPaddleX = (TENNIS_W - paddleWidth) / 2;
            computerPaddleX = (TENNIS_W - paddleWidth) / 2;
            updateTennisScoreboard();
            updateTennisPauseBtn();

            isTennisRunning = true;
            tennisLastTime = performance.now();
            setupTennisControls();
            startTennisServeCountdown();

            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            tennisLoop(tennisLastTime);
        }

        function setupTennisControls() {
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
            window.addEventListener('keydown', handleTennisKeyDown);
            window.addEventListener('keyup', handleTennisKeyUp);

            const btnLeft = document.getElementById('btn-paddle-left');
            const btnRight = document.getElementById('btn-paddle-right');

            if (btnLeft && btnRight) {
                btnLeft.onmousedown = () => { keyLeftPressed = true; };
                btnLeft.onmouseup = () => { keyLeftPressed = false; };
                btnLeft.onmouseleave = () => { keyLeftPressed = false; };
                btnLeft.ontouchstart = (e) => { e.preventDefault(); keyLeftPressed = true; };
                btnLeft.ontouchend = (e) => { e.preventDefault(); keyLeftPressed = false; };
                btnLeft.ontouchcancel = () => { keyLeftPressed = false; };

                btnRight.onmousedown = () => { keyRightPressed = true; };
                btnRight.onmouseup = () => { keyRightPressed = false; };
                btnRight.onmouseleave = () => { keyRightPressed = false; };
                btnRight.ontouchstart = (e) => { e.preventDefault(); keyRightPressed = true; };
                btnRight.ontouchend = (e) => { e.preventDefault(); keyRightPressed = false; };
                btnRight.ontouchcancel = () => { keyRightPressed = false; };
            }

            const movePaddleFromClientX = (clientX) => {
                if (!isTennisRunning || tennisMatchOver) return;
                const surface = getTennisSurfaceEl();
                if (!surface) return;
                const rect = surface.getBoundingClientRect();
                const x = ((clientX - rect.left) / rect.width) * TENNIS_W;
                playerPaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, x - paddleWidth / 2));
            };

            const surface = getTennisSurfaceEl();
            if (!surface) return;

            surface.onmousedown = (e) => {
                tennisPointerActive = true;
                movePaddleFromClientX(e.clientX);
            };
            surface.onmouseup = () => { tennisPointerActive = false; };
            surface.onmouseleave = () => { tennisPointerActive = false; };
            surface.onmousemove = (e) => {
                if (tennisPointerActive) movePaddleFromClientX(e.clientX);
            };

            surface.ontouchstart = (e) => {
                e.preventDefault();
                tennisPointerActive = true;
                if (e.touches[0]) movePaddleFromClientX(e.touches[0].clientX);
            };
            surface.ontouchmove = (e) => {
                e.preventDefault();
                if (e.touches[0]) movePaddleFromClientX(e.touches[0].clientX);
            };
            surface.ontouchend = () => { tennisPointerActive = false; };
        }

        function handleTennisKeyDown(e) {
            if (e.key === 'ArrowLeft') keyLeftPressed = true;
            else if (e.key === 'ArrowRight') keyRightPressed = true;
            else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                toggleTennisPause();
            }
        }

        function handleTennisKeyUp(e) {
            if (e.key === 'ArrowLeft') keyLeftPressed = false;
            else if (e.key === 'ArrowRight') keyRightPressed = false;
        }

        function toggleTennisPause() {
            if (!isTennisRunning || tennisMatchOver || tennisCountdown > 0) return;
            tennisPaused = !tennisPaused;
            updateTennisPauseBtn();
            if (!tennisPaused) {
                tennisLastTime = performance.now();
                tennisLoop(tennisLastTime);
            }
        }

        function updateTennisPauseBtn() {
            const btn = document.getElementById('btn-tennis-pause');
            if (btn) btn.textContent = tennisPaused ? 'Devam' : 'Duraklat';
        }

        function startTennisServeCountdown() {
            tennisServeReady = false;
            ballSpeedX = 0;
            ballSpeedY = 0;
            tennisBallSpin = 0;
            ballX = TENNIS_W / 2;
            ballY = TENNIS_H * 0.68;
            tennisCountdown = 3;
            tennisBotTargetX = null;
            tennisBotReaction = 0;
        }

        function launchServe() {
            tennisServeReady = true;
            tennisRallyHits = 0;
            ballTrail = [];
            const aim = ((playerPaddleX + paddleWidth / 2) / TENNIS_W - 0.5) * 2.2;
            const base = 2.6 + Math.min(tennisPlayerScore + tennisComputerScore, 6) * 0.1;
            ballSpeedX = aim + (Math.random() - 0.5) * 0.6;
            ballSpeedY = -base;
            tennisBallSpin = aim * 0.35;
        }

        function tennisLoop(now) {
            if (!isTennisRunning) return;
            const dt = Math.min((now - tennisLastTime) / 16.67, 2.5);
            tennisLastTime = now;

            if (!tennisPaused && !tennisMatchOver) {
                if (tennisCountdown > 0) {
                    tennisCountdown -= dt * 0.035;
                    if (tennisCountdown <= 0) {
                        tennisCountdown = 0;
                        launchServe();
                    }
                } else if (tennisServeReady) {
                    if (!tennisOnlineMode || tennisOnlineRole === 'host') {
                        updateTennisGamePhysics(dt);
                    }
                }
            }

            drawTennisGameScene();
            tennisLoopId = requestAnimationFrame(tennisLoop);
        }

        function getTennisBotSpeed() {
            return 2.4 + Math.min(tennisComputerScore, 5) * 0.18;
        }

        function predictBotTargetX() {
            if (ballSpeedY >= -0.05) return ballX;
            const dist = Math.abs(ballY - (paddleHeight + 6));
            const t = dist / Math.max(Math.abs(ballSpeedY), 0.5);
            let px = ballX + ballSpeedX * t + tennisBallSpin * t * 0.35;
            const err = (Math.random() - 0.5) * (28 - Math.min(tennisRallyHits, 8) * 2);
            return px + err;
        }

        function applyPaddleHit(isPlayer) {
            const paddleX = isPlayer ? playerPaddleX : computerPaddleX;
            const hit = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            const sweet = 1 - Math.min(Math.abs(hit), 1) * 0.35;
            const speedMul = 1.04 + sweet * 0.06;
            const spin = hit * (isPlayer ? 0.9 : 0.75);
            tennisBallSpin = spin;
            ballSpeedX = hit * (isPlayer ? 3.8 : 3.4) + tennisBallSpin * 0.25;
            ballSpeedY = isPlayer
                ? -Math.abs(ballSpeedY) * speedMul
                : Math.abs(ballSpeedY) * speedMul;
            tennisRallyHits++;
            increaseBallSpeed();
            spawnTennisHitParticles(ballX, ballY, isPlayer ? '#22d3ee' : '#f87171');
            playTennisBeep(isPlayer ? 220 + sweet * 80 : 260, 0.08);
        }

        function updateTennisGamePhysics(dt) {
            const paddleSpeed = 5.8 * dt;
            if (keyLeftPressed) {
                playerPaddleX = Math.max(0, playerPaddleX - paddleSpeed);
            }
            if (keyRightPressed) {
                playerPaddleX = Math.min(TENNIS_W - paddleWidth, playerPaddleX + paddleSpeed);
            }

            if (tennisOnlineMode) {
                computerPaddleX = tennisRemotePaddleX;
            } else if (ballSpeedY < 0) {
                tennisBotReaction -= dt;
                if (tennisBotReaction <= 0) {
                    tennisBotTargetX = predictBotTargetX();
                    tennisBotReaction = 4 + Math.random() * 6;
                }
                const botSpeed = getTennisBotSpeed() * dt;
                const target = (tennisBotTargetX ?? ballX) - paddleWidth / 2;
                const diff = target - computerPaddleX;
                if (Math.abs(diff) > 6) {
                    computerPaddleX += Math.sign(diff) * Math.min(Math.abs(diff), botSpeed);
                }
            }
            computerPaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, computerPaddleX));

            updateTennisHitParticles(dt);

            ballTrail.push({ x: ballX, y: ballY });
            if (ballTrail.length > 12) ballTrail.shift();

            ballSpeedX += tennisBallSpin * 0.018 * dt;
            ballX += ballSpeedX * dt;
            ballY += ballSpeedY * dt;
            tennisBallRotation += (ballSpeedX * 0.08 + Math.abs(ballSpeedY) * 0.04) * dt;

            if (ballX - ballRadius < 12) {
                ballX = 12 + ballRadius;
                ballSpeedX = Math.abs(ballSpeedX);
                tennisBallSpin *= -0.6;
                playTennisBeep(150, 0.05);
            }
            if (ballX + ballRadius > TENNIS_W - 12) {
                ballX = TENNIS_W - 12 - ballRadius;
                ballSpeedX = -Math.abs(ballSpeedX);
                tennisBallSpin *= -0.6;
                playTennisBeep(150, 0.05);
            }

            const botY = paddleHeight + 8;
            const botHitZone = botY + paddleHeight + 4;
            if (ballSpeedY < 0 && ballY - ballRadius <= botHitZone) {
                if (ballX >= computerPaddleX + 4 && ballX <= computerPaddleX + paddleWidth - 4) {
                    ballY = botHitZone + ballRadius;
                    applyPaddleHit(false);
                } else if (ballY < 8) {
                    awardTennisPoint('player');
                }
            }

            const playerY = TENNIS_H - paddleHeight - paddleHandleH - 8;
            const playerHitZone = playerY;
            if (ballSpeedY > 0 && ballY + ballRadius >= playerHitZone) {
                if (ballX >= playerPaddleX + 4 && ballX <= playerPaddleX + paddleWidth - 4) {
                    ballY = playerHitZone - ballRadius;
                    applyPaddleHit(true);
                } else if (ballY > TENNIS_H - 4) {
                    awardTennisPoint('bot');
                }
            }
        }

        function awardTennisPoint(who) {
            if (tennisMatchOver) return;
            tennisServeReady = false;
            if (who === 'player') {
                tennisPlayerScore++;
                playTennisBeep(440, 0.18);
                showToast(tennisOnlineMode ? 'Sayı kazandınız! 🎾' : 'Sayı kazandınız! 🎾', 'success');
            } else {
                tennisComputerScore++;
                playTennisBeep(110, 0.22);
                const msg = tennisOnlineMode
                    ? (tennisOpponentName ? `${tennisOpponentName} sayı kazandı.` : 'Rakip sayı kazandı.')
                    : 'Bot sayı kazandı.';
                showToast(msg, 'error');
            }
            updateTennisScoreboard();
            if (tennisPlayerScore >= TENNIS_WIN || tennisComputerScore >= TENNIS_WIN) {
                endTennisMatch();
                return;
            }
            startTennisServeCountdown();
        }

        function endTennisMatch() {
            tennisMatchOver = true;
            tennisServeReady = false;
            const won = tennisPlayerScore >= TENNIS_WIN;
            const opp = tennisOpponentName || 'Rakip';
            showTennisOverlay(
                won ? 'Kazandınız! 🏆' : 'Kaybettiniz',
                tennisOnlineMode
                    ? (won
                        ? `${tennisPlayerScore} - ${tennisComputerScore} · ${opp} yenildi!`
                        : `${tennisPlayerScore} - ${tennisComputerScore} · ${opp} kazandı.`)
                    : (won
                        ? `${tennisPlayerScore} - ${tennisComputerScore} · Harika oyun!`
                        : `${tennisPlayerScore} - ${tennisComputerScore} · Bir daha dene.`)
            );
            playTennisBeep(won ? 520 : 90, won ? 0.35 : 0.4);
            if (won) showToast('Tenis maçını kazandınız! 🏆', 'success');
        }

        function showTennisOverlay(title, sub) {
            const el = document.getElementById('tennis-overlay');
            const t = document.getElementById('tennis-overlay-title');
            const s = document.getElementById('tennis-overlay-sub');
            if (t) t.textContent = title;
            if (s) s.textContent = sub;
            if (el) el.classList.remove('hidden');
        }

        function hideTennisOverlay() {
            const el = document.getElementById('tennis-overlay');
            if (el) el.classList.add('hidden');
        }

        function increaseBallSpeed() {
            const cap = 7;
            const boost = 1 + tennisRallyHits * 0.018;
            if (Math.abs(ballSpeedY) < cap) {
                ballSpeedY = ballSpeedY > 0
                    ? Math.min(cap, Math.abs(ballSpeedY) * 1.055 * boost)
                    : -Math.min(cap, Math.abs(ballSpeedY) * 1.055 * boost);
            }
        }

        function updateTennisScoreboard() {
            const scoreboard = document.getElementById('tennis-score');
            if (scoreboard) {
                if (tennisOnlineMode && tennisOpponentName) {
                    scoreboard.textContent = `${tennisPlayerScore} - ${tennisComputerScore}`;
                } else {
                    scoreboard.textContent = `${tennisPlayerScore} - ${tennisComputerScore}`;
                }
            }
            const info = document.getElementById('tennis-match-info');
            if (info) {
                if (tennisOnlineMode) {
                    info.textContent = tennisOpponentName ? `Online · ${tennisOpponentName}` : 'Online maç';
                } else {
                    info.textContent = 'İlk 7 sayı';
                }
            }
        }

        function resetTennisGame() {
            playClickSound();
            hideTennisOverlay();
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            tennisMatchOver = false;
            tennisPaused = false;
            tennisRallyHits = 0;
            tennisBallSpin = 0;
            tennisBallRotation = 0;
            tennisHitParticles = [];
            tennisBotTargetX = null;
            tennisBotReaction = 0;
            ballTrail = [];
            updateTennisScoreboard();
            updateTennisPauseBtn();
            playerPaddleX = (TENNIS_W - paddleWidth) / 2;
            computerPaddleX = (TENNIS_W - paddleWidth) / 2;
            startTennisServeCountdown();
            showToast('Yeni maç başladı.', 'success');
        }

        function stopTennisGame() {
            isTennisRunning = false;
            tennisPointerActive = false;
            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
            if (window.LisaniTennis3D?.dispose) {
                window.LisaniTennis3D.dispose();
            }
            tennisCtx = null;
            if (tennisOnlineMode && typeof window.LisaniTennisOnline?.stop === 'function') {
                window.LisaniTennisOnline.stop(false);
            }
        }

        function drawTennisBall(ctx, x, y) {
            const speed = Math.hypot(ballSpeedX, ballSpeedY);
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(x, y + ballRadius + 5, ballRadius * 0.9, ballRadius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            if (speed > 4) {
                ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.35, (speed - 4) * 0.08)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - ballSpeedX * 2.5, y - ballSpeedY * 2.5);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.translate(x, y);
            ctx.rotate(tennisBallRotation);
            const ballGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, ballRadius);
            ballGrad.addColorStop(0, '#fef9c3');
            ballGrad.addColorStop(0.55, '#facc15');
            ballGrad.addColorStop(1, '#ca8a04');
            ctx.fillStyle = ballGrad;
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius - 1, -0.6, 0.9);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius - 1, 2.1, 3.6);
            ctx.stroke();
            ctx.restore();
        }

        function drawTennisGameScene() {
            const flipOnlineGuest = tennisOnlineMode && tennisOnlineRole === 'guest';

            const ctx = tennisCtx;
            const W = TENNIS_W;
            const H = TENNIS_H;
            if (!ctx) return;

            ctx.clearRect(0, 0, W, H);

            if (flipOnlineGuest) {
                ctx.save();
                ctx.translate(0, H);
                ctx.scale(1, -1);
            }

            if (tennisCourtCache) {
                ctx.drawImage(tennisCourtCache, 0, 0, W, H);
            } else {
                ctx.fillStyle = '#0d9488';
                ctx.fillRect(0, 0, W, H);
            }

            ballTrail.forEach((p, i) => {
                const a = (i + 1) / ballTrail.length * 0.4;
                ctx.fillStyle = `rgba(250, 204, 21, ${a})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, ballRadius * (0.35 + i * 0.03), 0, Math.PI * 2);
                ctx.fill();
            });

            tennisHitParticles.forEach((p) => {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2 + p.life * 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            const botRacketY = 6;
            const playerRacketY = H - paddleHeight - paddleHandleH - 6;
            drawTennisRacket(ctx, computerPaddleX, botRacketY, paddleWidth, paddleHeight, '#dc2626', '#f87171', false);
            drawTennisRacket(ctx, playerPaddleX, playerRacketY, paddleWidth, paddleHeight, '#0891b2', '#22d3ee', true);

            drawTennisBall(ctx, ballX, ballY);

            if (tennisRallyHits > 0 && tennisServeReady && !tennisMatchOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`Rally: ${tennisRallyHits}`, 16, 22);
            }

            if (tennisCountdown > 0) {
                const n = Math.ceil(tennisCountdown);
                const pulse = 1 + (tennisCountdown - Math.floor(tennisCountdown)) * 0.15;
                ctx.fillStyle = 'rgba(0,0,0,0.42)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${Math.round(46 * pulse)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(n), W / 2, H / 2);
                ctx.font = '11px sans-serif';
                ctx.fillStyle = 'rgba(224,242,254,0.85)';
                ctx.fillText('Raketi hareket ettirerek servis yönünü seç', W / 2, H / 2 + 38);
            }

            if (tennisPaused && !tennisMatchOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#e0f2fe';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('DURAKLATILDI', W / 2, H / 2);
            }

            if (flipOnlineGuest) {
                ctx.restore();
            }
        }

        window.LisaniTennis = {
            setOnlineMode(enabled, role, roomCode, opponentName) {
                tennisOnlineMode = !!enabled;
                tennisOnlineRole = role || null;
                tennisOnlineRoomCode = roomCode || '';
                tennisOpponentName = opponentName || '';
                tennisRemotePaddleX = (TENNIS_W - paddleWidth) / 2;
                updateTennisScoreboard();
            },
            isOnline() { return tennisOnlineMode; },
            getRole() { return tennisOnlineRole; },
            getRoomCode() { return tennisOnlineRoomCode; },
            setRemotePaddleX(x) {
                tennisRemotePaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, x));
            },
            getLocalPaddleX() {
                return playerPaddleX;
            },
            exportState() {
                return {
                    ballX, ballY, ballSpeedX, ballSpeedY,
                    ballSpin: tennisBallSpin,
                    ballTrail: ballTrail.slice(-12),
                    serveReady: tennisServeReady,
                    countdown: tennisCountdown,
                    rallyHits: tennisRallyHits,
                    hostScore: tennisPlayerScore,
                    guestScore: tennisComputerScore,
                    matchOver: tennisMatchOver,
                    hostPaddleX: playerPaddleX,
                    guestPaddleX: computerPaddleX,
                };
            },
            importState(state) {
                if (!state) return;
                ballX = state.ballX ?? ballX;
                ballY = state.ballY ?? ballY;
                ballSpeedX = state.ballSpeedX ?? ballSpeedX;
                ballSpeedY = state.ballSpeedY ?? ballSpeedY;
                tennisBallSpin = state.ballSpin ?? tennisBallSpin;
                ballTrail = Array.isArray(state.ballTrail) ? state.ballTrail : [];
                tennisServeReady = !!state.serveReady;
                tennisCountdown = state.countdown ?? 0;
                tennisRallyHits = state.rallyHits ?? 0;
                if (tennisOnlineRole === 'guest') {
                    tennisPlayerScore = state.guestScore ?? 0;
                    tennisComputerScore = state.hostScore ?? 0;
                } else {
                    tennisPlayerScore = state.hostScore ?? 0;
                    tennisComputerScore = state.guestScore ?? 0;
                }
                tennisMatchOver = !!state.matchOver;
                if (tennisOnlineRole === 'host') {
                    computerPaddleX = state.guestPaddleX ?? computerPaddleX;
                } else if (tennisOnlineRole === 'guest') {
                    playerPaddleX = state.guestPaddleX ?? playerPaddleX;
                    computerPaddleX = state.hostPaddleX ?? computerPaddleX;
                }
                updateTennisScoreboard();
                if (state.matchOver && !tennisMatchOver) {
                    endTennisMatch();
                }
            },
            startEngine: initTennisGameEngine,
            reset: resetTennisGame,
            stop: stopTennisGame,
        };

        // Service Worker inline olarak gömülü (ayrı sw.js dosyası gerekmez)
        async function registerInlineSW() {
            if (!("serviceWorker" in navigator)) return;
            const swCode = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
        for (const c of list) { if ('focus' in c) return c.focus(); }
        if (clients.openWindow) return clients.openWindow('./');
    }));
});
`;
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            try {
                await navigator.serviceWorker.register(swUrl, { scope: './' });
            } catch(e) {
                // Blob URL scope kısıtlaması olabilir, sessizce geç
            }
        }

        // =====================================================
        // BİLDİRİM SİSTEMİ
        // =====================================================

        const dailyNotifications = [
            { title: "Lisanı Ecdad", body: "Bugün Osmanlıca çalışmayı unutma! 📖" },
            { title: "Lisanı Ecdad", body: "Günlük sınavın seni bekliyor. 🎯" },
            { title: "Lisanı Ecdad", body: "Birkaç harf tekrarı yapmaya ne dersin? ✏️" },
            { title: "Lisanı Ecdad", body: "Dünün öğrendiklerini hatırlıyor musun? 🤔" },
            { title: "Lisanı Ecdad", body: "Bugün yeni bir harf öğren! 🌟" },
        ];

        function getRandomNotification() {
            return dailyNotifications[Math.floor(Math.random() * dailyNotifications.length)];
        }

        function getHadisForDate(date) {
            return hadisList[getHadisIndexForDate(date)];
        }

        function getTodaysHadis() {
            return getHadisForDate(new Date());
        }

        function formatNotifTimeLabel(h, m) {
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        }

        function usesNativeHadisNotifications() {
            return typeof window.isNativeHadisNotifications === 'function' && window.isNativeHadisNotifications();
        }

        window._scheduleHadithNotifications = async function () {
            if (usesNativeHadisNotifications()) {
                if (!(await window.checkNativeHadisPermission())) return false;
                return window.scheduleNativeHadithNotifications(getHadisForDate, getDefaultNotifTime);
            }
            scheduleDailyNotification();
            return true;
        };

        async function initNotifications() {
            if (usesNativeHadisNotifications()) {
                autoSetNotifTime();
                const granted = await window.requestNativeHadisPermission();
                if (granted) {
                    await window._scheduleHadithNotifications();
                    const { h, m } = getDefaultNotifTime();
                    showToast(
                        'Bildirimler açıldı! Her gün saat ' + formatNotifTimeLabel(h, m) + "'da günün hadisi gelecek.",
                        'success'
                    );
                } else {
                    showToast('Bildirim izni verilmedi.', 'error');
                }
                return;
            }
            if (!('Notification' in window)) {
                showToast('Bu tarayıcı bildirimleri desteklemiyor.', 'error');
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                if ('serviceWorker' in navigator) {
                    try {
                        await registerInlineSW();
                    } catch (e) {}
                }
                autoSetNotifTime();
                scheduleDailyNotification();
                const { h, m } = getDefaultNotifTime();
                showToast(
                    'Bildirimler açıldı! Her gün saat ' + formatNotifTimeLabel(h, m) + "'da günün hadisi gelecek.",
                    'success'
                );
            } else {
                showToast('Bildirim izni verilmedi.', 'error');
            }
        }

        function autoSetNotifTime() {
            // Cihazın yerel saati (new Date() her zaman cihaz saat dilimini kullanır)
            const now = new Date();
            const currentH = now.getHours();

            // Sabah mı akşam mı? Gündüz aktifliğine göre en uygun saati seç:
            // 05:00–11:59 → sabah rutininde → 09:00
            // 12:00–17:59 → öğleden sonra → 14:00
            // 18:00–23:59 veya 00:00–04:59 → akşam/gece → 20:00
            let bestH;
            if (currentH >= 5 && currentH < 12) bestH = 9;
            else if (currentH >= 12 && currentH < 18) bestH = 14;
            else bestH = 20;

            localStorage.setItem("lisani_notif_hour", String(bestH));
            localStorage.setItem("lisani_notif_min", "0");

            // Panel input'unu da güncelle
            const inp = document.getElementById("notif-time-input");
            if (inp) inp.value = String(bestH).padStart(2,"0") + ":00";
        }

        async function scheduleDailyNotification() {
            if (usesNativeHadisNotifications()) {
                if (await window.checkNativeHadisPermission()) {
                    await window.scheduleNativeHadithNotifications(getHadisForDate, getDefaultNotifTime);
                }
                return;
            }
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
            const { h: savedHour, m: savedMin } = getDefaultNotifTime();
            const now = new Date();
            const target = new Date();
            target.setHours(savedHour, savedMin, 0, 0);
            if (target <= now) target.setDate(target.getDate() + 1);
            const delay = target - now;
            const oldTimer = localStorage.getItem("lisani_notif_timer_id");
            if (oldTimer) clearTimeout(parseInt(oldTimer));
            const timerId = setTimeout(() => {
                const hadis = getTodaysHadis();
                const content =
                    typeof window.getHadisNotificationContent === 'function'
                        ? window.getHadisNotificationContent(hadis)
                        : { title: 'Günün Hadisi 📖', body: hadis.turkce + '\n— ' + hadis.kaynak };
                new Notification(content.title, {
                    body: content.body,
                    icon: "icon-192.png",
                    badge: "icon-192.png",
                    vibrate: [200, 100, 200],
                    tag: "lisani-daily",
                    renotify: true
                });
                scheduleDailyNotification();
            }, delay);
            try { localStorage.setItem("lisani_notif_timer_id", String(timerId)); } catch(e) {}
        }

        function getDefaultNotifTime() {
            const savedH = localStorage.getItem("lisani_notif_hour");
            const savedM = localStorage.getItem("lisani_notif_min");
            if (savedH !== null) return { h: parseInt(savedH), m: parseInt(savedM) };
            // Henüz ayarlanmamışsa cihaz saatine göre otomatik hesapla
            const now = new Date();
            const currentH = now.getHours();
            if (currentH >= 5 && currentH < 12) return { h: 9, m: 0 };
            if (currentH >= 12 && currentH < 18) return { h: 14, m: 0 };
            return { h: 20, m: 0 };
        }

        function openNotifSettings() {
            playClickSound();
            document.getElementById("notif-settings-panel").classList.remove("hidden");
            const { h, m } = getDefaultNotifTime();
            document.getElementById("notif-time-input").value =
                String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
            const native = typeof window.isNativeHadisNotifications === 'function' && window.isNativeHadisNotifications();
            document.getElementById('notif-sound-settings-row')?.classList.toggle('hidden', !native);
            if (typeof refreshMicPermissionUI === 'function') refreshMicPermissionUI();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function closeNotifSettings() {
            playClickSound();
            document.getElementById("notif-settings-panel").classList.add("hidden");
        }

        function saveNotifTime() {
            playClickSound();
            const val = document.getElementById('notif-time-input').value;
            if (!val) return;
            const [h, m] = val.split(':').map(Number);
            localStorage.setItem('lisani_notif_hour', String(h));
            localStorage.setItem('lisani_notif_min', String(m));
            scheduleDailyNotification();
            closeNotifSettings();
            showToast('Bildirim saati ' + formatNotifTimeLabel(h, m) + ' olarak ayarlandı.', 'success');
        }

        async function testNotification() {
            playClickSound();
            if (usesNativeHadisNotifications()) {
                if (!(await window.checkNativeHadisPermission())) {
                    showToast('Önce bildirim iznini ver.', 'error');
                    return;
                }
                const ok = await window.showNativeHadisTestNotification(getHadisForDate);
                showToast(
                    ok ? 'Test bildirimi 4 saniye içinde gelecek.' : 'Test bildirimi gönderilemedi.',
                    ok ? 'success' : 'error'
                );
                return;
            }
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
                showToast('Önce bildirim iznini ver.', 'error');
                return;
            }
            const hadis = getTodaysHadis();
            const content =
                typeof window.getHadisNotificationContent === 'function'
                    ? window.getHadisNotificationContent(hadis)
                    : { title: 'Günün Hadisi 📖', body: hadis.turkce + '\n— ' + hadis.kaynak };
            new Notification(content.title, {
                body: content.body,
                icon: 'icon-192.png',
                tag: 'lisani-test',
            });
            showToast('Test bildirimi gönderildi.', 'success');
        }

        function initLearnStartTap() {
            const btn = document.getElementById('learn-start-cta-btn');
            if (!btn || btn.dataset.tapBound === '1') return;
            btn.dataset.tapBound = '1';
            bindTapAction(btn, (e) => {
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                if (typeof window.openLearnStart === 'function') window.openLearnStart(e);
            });
        }

        function initGrammarPrepNotes() {
            const notes = window.LISANI_GRAMMAR_PREP_NOTES || [];
            const lists = document.querySelectorAll('.lisani-grammar-rules-list');
            if (!lists.length || !notes.length) return;
            const titles = {
                irab: 'İ\'rab',
                harficer: 'Harf-i cer',
                fiil: 'Fiil kipleri',
                izafet: 'İzafet',
                tenvin: 'Tenvin',
                nefy: 'Olumsuzluk',
                sifat: 'Sıfat',
                kalin: 'Kalın-ince',
                zamir: 'Zamirler',
                tekid: 'Tekid',
            };
            const html = notes
                .map(
                    (n) => `
                <button type="button" class="lisani-grammar-prep-note lisani-glass-panel lisani-learn-card--tap rounded-xl p-4 w-full text-left" data-grammar-topic="${n.id}">
                    <p class="text-base font-extrabold theme-text-main mb-1.5 lisani-grammar-prep-note__title">${titles[n.id] || n.title}</p>
                    <p class="text-sm theme-text-muted leading-relaxed lisani-grammar-prep-note__text">${n.text}</p>
                    <span class="lisani-learn-card__cta">Detay ve örnekler →</span>
                </button>`
                )
                .join('');
            lists.forEach((list) => {
                list.innerHTML = html;
                list.querySelectorAll('[data-grammar-topic]').forEach((btn) => {
                    if (btn.dataset.grammarBound === '1') return;
                    btn.dataset.grammarBound = '1';
                    btn.addEventListener('click', () => {
                        const topic = btn.getAttribute('data-grammar-topic');
                        if (topic) {
                            openLearnCardDetail(topic, { showDrillAction: true, drillTopic: topic });
                        }
                    });
                });
            });
            if (window.LisaniGrammarPrep?.refreshGrammarRulesUI) {
                window.LisaniGrammarPrep.refreshGrammarRulesUI();
            }
        }

        // --- UYGULAMA DEĞERLENDİRME (5 yıldız) ---
        const APP_RATING_KEY = 'lisani_app_rating';
        const APP_RATING_PROMPT_KEY = 'lisani_app_rating_prompted';

        function renderAppRatingStars(container, selected, interactive) {
            if (!container) return;
            container.innerHTML = '';
            for (let n = 1; n <= 5; n++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'lisani-star-btn' + (n <= selected ? ' is-active' : '');
                btn.setAttribute('aria-label', `${n} yıldız`);
                btn.textContent = n <= selected ? '★' : '☆';
                if (interactive) {
                    btn.onclick = () => setAppRating(n);
                    btn.onmouseenter = () => highlightStars(container, n);
                    btn.onmouseleave = () => highlightStars(container, selected);
                }
                container.appendChild(btn);
            }
        }

        function highlightStars(container, count) {
            container.querySelectorAll('.lisani-star-btn').forEach((btn, idx) => {
                const n = idx + 1;
                btn.classList.toggle('is-active', n <= count);
                btn.textContent = n <= count ? '★' : '☆';
            });
        }

        function getAppRating() {
            try {
                return parseInt(localStorage.getItem(APP_RATING_KEY) || '0', 10) || 0;
            } catch (e) {
                return 0;
            }
        }

        function setAppRating(stars) {
            const value = Math.max(1, Math.min(5, stars));
            try {
                localStorage.setItem(APP_RATING_KEY, String(value));
            } catch (e) {}
            const settingsStars = document.getElementById('app-rating-stars');
            renderAppRatingStars(settingsStars, value, true);
            const thanks = document.getElementById('app-rating-thanks');
            if (thanks) {
                thanks.classList.remove('hidden');
                thanks.textContent = `Teşekkürler! ${value}/5 ⭐`;
            }
            const modal = document.getElementById('app-rating-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof playClickSound === 'function') playClickSound();
            if (typeof showToast === 'function') {
                showToast(`Değerlendirmen kaydedildi: ${value}/5`, 'success');
            }
        }
        window.setAppRating = setAppRating;

        function initAppRatingUI() {
            const settingsStars = document.getElementById('app-rating-stars');
            const rating = getAppRating();
            renderAppRatingStars(settingsStars, rating, true);
            const thanks = document.getElementById('app-rating-thanks');
            if (thanks && rating > 0) {
                thanks.classList.remove('hidden');
                thanks.textContent = `Puanın: ${rating}/5 ⭐`;
            }
            const modalStars = document.getElementById('app-rating-modal-stars');
            renderAppRatingStars(modalStars, 0, true);
        }

        function maybePromptAppRating() {
            if (getAppRating() > 0) return;
            try {
                if (localStorage.getItem(APP_RATING_PROMPT_KEY) === '1') return;
                localStorage.setItem(APP_RATING_PROMPT_KEY, '1');
            } catch (e) {}
            const modal = document.getElementById('app-rating-modal');
            if (modal) modal.classList.remove('hidden');
        }
        window.maybePromptAppRating = maybePromptAppRating;

        window.closeAppRatingModal = function () {
            const modal = document.getElementById('app-rating-modal');
            if (modal) modal.classList.add('hidden');
        };

        // --- BAŞLANGIÇ KURULUMLARI ---
        window.onload = function() {
            try {
                const savedTests = localStorage.getItem('lisani_test_history');
                if (savedTests) testHistory = JSON.parse(savedTests);
            } catch (e) {}

            lucide.createIcons();
            initAvatarGrids();
            initLettersGrid();
            renderQuizHistoryList();
            renderProgressChart();
            initPrelineTheme();
            initGrammarPrepNotes();
            initApkDownloadLink();
            initKariyerCoverImages();
            preloadChestAssets(true);
            if (typeof syncAppShellVisibility === 'function') {
                syncAppShellVisibility();
            }
            updateLearningStats();
            initSwipeGestures();
            initDesktopWheelScroll();
            initToastSwipe();
            initRememberMeCheckbox();
            initAppRatingUI();

            initDailyHadis();

            // Kayıtlı kullanıcıları yükle (yerel)
            try {
                const savedUsers = localStorage.getItem('lisani_registered_users');
                if (savedUsers) Object.assign(registeredUsers, JSON.parse(savedUsers));
            } catch(e) {}

            // App hazır eventi gönder (Firebase onAuthStateChanged için)
            document.dispatchEvent(new Event('appReady'));
            window._appReady = true;

            // Bildirim
            try {
                if (usesNativeHadisNotifications()) {
                    window.checkNativeHadisPermission().then((granted) => {
                        if (granted) window._scheduleHadithNotifications();
                    });
                } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    if ('serviceWorker' in navigator) registerInlineSW().catch(() => {});
                    scheduleDailyNotification();
                }
            } catch (e) {}
        };
