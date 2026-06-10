/**
 * Günlük görevler, seri (ateş) ve seviye bulma
 */
(function () {
    'use strict';

    const DAILY_TASK_POOL = [
        { id: 'letters_3', title: 'Elifba çalış', desc: '3 harf incele', type: 'letters', target: 3, xp: 25, action: 'letters' },
        { id: 'bolum_kelimeler', title: 'Kelime bölümü', desc: 'Gündelik Kelimeler bölümünü tamamla', type: 'bolum_complete', bolum: 'kelimeler', target: 1, xp: 30, action: 'tests', bolumStart: 'kelimeler' },
        { id: 'translate_2', title: 'Kelime çevir', desc: '2 kelime çevir', type: 'translate', target: 2, xp: 25, action: 'translate' },
        { id: 'quiz_5', title: '5 doğru cevap', desc: 'Testte 5 doğru yap', type: 'quiz_correct', target: 5, xp: 30, action: 'tests' },
        { id: 'letters_5', title: '5 harf öğren', desc: 'Elifbadan 5 harf seç', type: 'letters', target: 5, xp: 30, action: 'letters' },
        { id: 'bolum_eslestirme', title: 'Eşleştir bölümü', desc: 'Eşleştir bölümünü tamamla', type: 'bolum_complete', bolum: 'eslestirme', target: 1, xp: 35, action: 'tests', bolumStart: 'eslestirme' },
        { id: 'bolum_ceviri', title: 'Çeviri bölümü', desc: 'Metin Çevir bölümünü tamamla', type: 'bolum_complete', bolum: 'ceviri', target: 1, xp: 35, action: 'tests', bolumStart: 'ceviri' },
        { id: 'bolum_ses', title: 'Sesli bölüm', desc: 'Konuş ve Cevapla bölümünü dene', type: 'bolum_open', bolum: 'ses', target: 1, xp: 20, action: 'tests', bolumStart: 'ses' },
    ];

    function uid() {
        return (window.currentUser && window.currentUser.id) || 'guest';
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function stateKey() {
        return `lisani_daily_task_${uid()}`;
    }

    function levelKey() {
        return `lisani_user_level_${uid()}`;
    }

    function placementKey() {
        return `lisani_placement_done_${uid()}`;
    }

    function hashDay(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(stateKey());
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(stateKey(), JSON.stringify(state));
        } catch (e) {}
    }

    function syncTaskDay(state) {
        const today = todayKey();
        if (!state || state.todayDate !== today) {
            const idx = hashDay(today) % DAILY_TASK_POOL.length;
            return {
                todayDate: today,
                taskId: DAILY_TASK_POOL[idx].id,
                progress: 0,
                rewardedToday: false,
                streak: state?.streak || 0,
                lastCompleteDate: state?.lastCompleteDate || null,
            };
        }
        return state;
    }

    function getTodayTask() {
        const idx = hashDay(todayKey()) % DAILY_TASK_POOL.length;
        return DAILY_TASK_POOL[idx];
    }

    function getTaskForState(state) {
        const todayTask = getTodayTask();
        if (!state || state.todayDate !== todayKey()) {
            return todayTask;
        }
        return DAILY_TASK_POOL.find((t) => t.id === state.taskId) || todayTask;
    }

    function formatStreak(n) {
        return !n ? '0 Gün' : `${n} Gün`;
    }

    function getUserLevel() {
        try {
            const v = parseInt(localStorage.getItem(levelKey()), 10);
            return v >= 1 && v <= 3 ? v : null;
        } catch (e) {
            return null;
        }
    }

    function setUserLevel(lv) {
        try {
            localStorage.setItem(levelKey(), String(lv));
        } catch (e) {}
        renderLearnStartCard();
    }

    function renderLearnStartCard() {
        /* yeşil buton modunda ek kart yok */
    }

    function isPlacementDone() {
        try {
            return localStorage.getItem(placementKey()) === '1';
        } catch (e) {
            return false;
        }
    }

    function markPlacementDone() {
        try {
            localStorage.setItem(placementKey(), '1');
        } catch (e) {}
        renderLearnStartCard();
    }

    function isNewLearner() {
        const history =
            typeof window.getLisaniProgress === 'function'
                ? window.getLisaniProgress().testHistory || []
                : [];
        return history.length === 0 && !isPlacementDone() && !getUserLevel();
    }

    function applyPlacementResult(startBolumId) {
        if (typeof window.applyPlacementStartBolum === 'function') {
            window.applyPlacementStartBolum(startBolumId);
        }
        const lvlMap = { kelimeler: 1, harfler: 1, eslestirme: 2, ceviri: 3, ses: 3 };
        setUserLevel(lvlMap[startBolumId] || 1);
        markPlacementDone();
    }

    function awardTask(state, task) {
        const today = todayKey();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);

        if (state.lastCompleteDate === yKey) {
            state.streak = (state.streak || 0) + 1;
        } else if (state.lastCompleteDate !== today) {
            state.streak = 1;
        }
        state.lastCompleteDate = today;
        state.rewardedToday = true;
        saveState(state);

        const bonus = task.xp || 25;
        if (typeof window.addLisaniXp === 'function') {
            window.addLisaniXp(bonus);
        }
        if (typeof showToast === 'function') {
            showToast(`Günlük görev tamam! +${bonus} XP`, 'success');
        }
        updateDailyGoalUI();
    }

    function bumpProgress(amount) {
        if (typeof hasStudentFeatures === 'function' && !hasStudentFeatures()) return;

        let state = syncTaskDay(loadState());
        if (state.rewardedToday) return;

        const task = getTaskForState(state);
        state.progress = (state.progress || 0) + (amount || 1);

        if (state.progress >= task.target) {
            awardTask(state, task);
        } else {
            saveState(state);
            updateDailyGoalUI();
        }
    }

    function onLetterStudy() {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'letters') bumpProgress(1);
    }

    function onTranslate() {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'translate') bumpProgress(1);
    }

    function onQuizCorrect() {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'quiz_correct') bumpProgress(1);
    }

    function onBolumComplete(bolumId) {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'bolum_complete' && task.bolum === bolumId) {
            bumpProgress(1);
        }
    }

    function onBolumOpen(bolumId) {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'bolum_open' && task.bolum === bolumId) {
            bumpProgress(1);
        }
    }

    function updateDailyGoalUI() {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        const streakText = formatStreak(state.streak);

        ['home-letter-streak', 'home-letter-streak-banner'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = streakText;
        });

        const titleEl = document.getElementById('home-daily-task-title');
        const statusEl = document.getElementById('home-daily-goal-status');
        const rewardEl = document.getElementById('home-daily-goal-reward');
        const progressEl = document.getElementById('home-daily-task-progress');
        const actionBtn = document.getElementById('home-daily-task-action');

        if (titleEl) titleEl.textContent = task.title;

        if (progressEl) {
            progressEl.textContent = `${Math.min(state.progress, task.target)}/${task.target}`;
        }

        if (statusEl) {
            if (state.rewardedToday) {
                statusEl.textContent = 'Bugünkü görev tamamlandı.';
            } else {
                statusEl.textContent = task.desc;
            }
        }

        if (rewardEl) {
            rewardEl.textContent = state.rewardedToday
                ? `+${task.xp} XP kazandın`
                : `Tamamlayınca +${task.xp} XP`;
        }

        if (actionBtn) {
            actionBtn.textContent = state.rewardedToday ? 'Tamamlandı' : 'Göreve Git';
            actionBtn.disabled = !!state.rewardedToday;
        }
    }

    function startDailyTaskAction(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        closeDailyGoalPanel();
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (state.rewardedToday) return;

        if (task.action === 'letters') {
            if (typeof switchTab === 'function') switchTab('letters');
        } else if (task.action === 'translate') {
            if (typeof switchTab === 'function') switchTab('osm-translate');
        } else if (task.action === 'tests') {
            if (typeof window.openLearnTests === 'function') {
                window.openLearnTests(task.bolumStart || undefined);
            }
        }
    }

    function closeDailyGoalPanel() {
        const pop = document.getElementById('home-daily-goal-popover');
        const trigger = document.getElementById('home-daily-goal-trigger');
        if (pop) {
            pop.classList.add('hidden');
            pop.style.top = '';
            pop.style.right = '';
            pop.style.left = '';
        }
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function positionDailyGoalPanel() {
        const pop = document.getElementById('home-daily-goal-popover');
        const trigger = document.getElementById('home-daily-goal-trigger');
        if (!pop || !trigger) return;

        const rect = trigger.getBoundingClientRect();
        const panelW = Math.min(260, window.innerWidth - 24);
        pop.style.width = `${panelW}px`;

        let top = rect.bottom + 8;
        let left = rect.right - panelW;

        if (left < 12) left = 12;
        if (left + panelW > window.innerWidth - 12) {
            left = window.innerWidth - panelW - 12;
        }
        if (top + 220 > window.innerHeight - 12) {
            top = Math.max(12, rect.top - 8 - 200);
        }

        pop.style.top = `${top}px`;
        pop.style.left = `${left}px`;
        pop.style.right = 'auto';
    }

    window.toggleDailyGoalPanel = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const pop = document.getElementById('home-daily-goal-popover');
        const trigger = document.getElementById('home-daily-goal-trigger');
        if (!pop) return;
        const willOpen = pop.classList.contains('hidden');
        if (willOpen) {
            updateDailyGoalUI();
            positionDailyGoalPanel();
            pop.classList.remove('hidden');
        } else {
            closeDailyGoalPanel();
            return;
        }
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
    };

    window.openLearnStart = function (event) {
        if (event) event.stopPropagation();
        if (!isNewLearner()) {
            if (!isPlacementDone()) markPlacementDone();
            closeLearnStartModal();
            if (typeof window.openLearnTests === 'function') {
                window.openLearnTests();
            }
            return;
        }
        const modal = document.getElementById('learn-start-modal');
        if (modal) {
            modal.classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        if (typeof window.openLearnTests === 'function') {
            window.openLearnTests();
        }
    };

    window.continueLearnFromLast = function (event) {
        if (event) event.stopPropagation();
        markPlacementDone();
        closeLearnStartModal();
        if (typeof window.openLearnTests === 'function') {
            window.openLearnTests();
        }
    };

    window.closeLearnStartModal = function () {
        const modal = document.getElementById('learn-start-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.openDailyGoalLetters = startDailyTaskAction;
    window.goToDailyGoalLetters = startDailyTaskAction;
    window.startDailyTaskAction = startDailyTaskAction;

    window.continueFromKnownLevel = function (event) {
        if (event) event.stopPropagation();
        const lv = getUserLevel();
        if (!lv) return;
        const startMap = { 1: 'kelimeler', 2: 'eslestirme', 3: 'ceviri' };
        if (typeof window.openLearnTests === 'function') {
            window.openLearnTests(startMap[lv] || 'kelimeler');
        }
    };

    window.openLevelPicker = function (event) {
        if (event) event.stopPropagation();
        let modal = document.getElementById('level-picker-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.closeLevelPicker = function () {
        const modal = document.getElementById('level-picker-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.pickUserLevel = function (lv) {
        const startMap = { 1: 'kelimeler', 2: 'eslestirme', 3: 'ceviri' };
        const startBolum = startMap[lv] || 'kelimeler';
        if (typeof window.applyPlacementStartBolum === 'function') {
            window.applyPlacementStartBolum(startBolum);
        }
        setUserLevel(lv);
        markPlacementDone();
        closeLevelPicker();
        closeLearnStartModal();
        if (typeof showToast === 'function') showToast(`Seviye ${lv} kaydedildi.`, 'success');
        if (typeof window.openLearnTests === 'function') {
            window.openLearnTests(startBolum);
        }
    };

    function buildPlacementQuestions() {
        if (typeof window.getPlacementQuestionPool !== 'function') return [];
        const pool = window.getPlacementQuestionPool().filter((q) => q.options && q.options.length >= 2);
        const picked = [];
        const perTier = { 1: 3, 2: 3, 3: 3 };
        [1, 2, 3].forEach((tier) => {
            const tierQs = pool.filter((q) => q.tier === tier);
            const count = perTier[tier] || 3;
            for (let i = 0; i < count && tierQs.length; i++) {
                const idx = Math.floor(Math.random() * tierQs.length);
                picked.push(tierQs.splice(idx, 1)[0]);
            }
        });
        return picked.sort(() => Math.random() - 0.5);
    }

    window.startPlacementTest = function (event) {
        if (event) event.stopPropagation();
        closeLearnStartModal();
        const questions = buildPlacementQuestions();
        if (!questions.length) {
            if (typeof showToast === 'function') showToast('Seviye testi hazırlanamadı.', 'error');
            return;
        }
        if (typeof window.launchPlacementQuiz === 'function') {
            window.launchPlacementQuiz(questions);
        } else if (typeof showToast === 'function') {
            showToast('Test ekranı yüklenemedi. Sayfayı yenileyin.', 'error');
        }
    };

    function init() {
        updateDailyGoalUI();
        document.addEventListener('click', (e) => {
            const pop = document.getElementById('home-daily-goal-popover');
            const trigger = document.getElementById('home-daily-goal-trigger');
            if (!pop || pop.classList.contains('hidden')) return;
            if (pop.contains(e.target) || (trigger && trigger.contains(e.target))) return;
            closeDailyGoalPanel();
        });
        window.addEventListener('resize', () => {
            const pop = document.getElementById('home-daily-goal-popover');
            if (pop && !pop.classList.contains('hidden')) positionDailyGoalPanel();
        });
        window.addEventListener(
            'scroll',
            () => {
                const pop = document.getElementById('home-daily-goal-popover');
                if (pop && !pop.classList.contains('hidden')) closeDailyGoalPanel();
            },
            true
        );
    }

    window.LisaniDailyTasks = {
        onLetterStudy,
        onTranslate,
        onQuizCorrect,
        onBolumComplete,
        onBolumOpen,
        onLevelComplete: onBolumComplete,
        onLevelOpen: onBolumOpen,
        updateDailyGoalUI,
        applyPlacementResult,
        getUserLevel,
        setUserLevel,
        getTodayTask,
        isNewLearner,
    };

    window.updateDailyGoalUI = updateDailyGoalUI;
    window.recordDailyLetterStudy = onLetterStudy;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
