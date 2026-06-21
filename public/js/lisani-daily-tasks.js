/**
 * Günlük görevler, seri (ateş) ve seviye bulma
 */
(function () {
    'use strict';

    const RECENT_TASK_MEMORY = 6;

    const DAILY_TASK_POOL = [
        { id: 'letters_3', title: 'Elifba çalış', desc: '3 harf incele', type: 'letters', target: 3, xp: 25, action: 'letters' },
        { id: 'letters_5', title: '5 harf öğren', desc: 'Elifbadan 5 harf seç', type: 'letters', target: 5, xp: 30, action: 'letters' },
        { id: 'letters_7', title: '7 harf keşfet', desc: 'Elifbadan 7 harf incele', type: 'letters', target: 7, xp: 35, action: 'letters' },
        { id: 'translate_2', title: 'Kelime çevir', desc: '2 kelime çevir', type: 'translate', target: 2, xp: 25, action: 'translate' },
        { id: 'translate_4', title: 'Çeviri pratiği', desc: '4 kelime çevir', type: 'translate', target: 4, xp: 30, action: 'translate' },
        { id: 'quiz_3', title: '3 doğru cevap', desc: 'Testte 3 doğru yap', type: 'quiz_correct', target: 3, xp: 20, action: 'tests' },
        { id: 'quiz_5', title: '5 doğru cevap', desc: 'Testte 5 doğru yap', type: 'quiz_correct', target: 5, xp: 30, action: 'tests' },
        { id: 'quiz_8', title: '8 doğru cevap', desc: 'Testte 8 doğru yap', type: 'quiz_correct', target: 8, xp: 40, action: 'tests' },
        { id: 'bolum_kelimeler', title: 'Temel bölüm', desc: 'Temel bölümünde bir test bitir', type: 'bolum_step', bolum: 'kelimeler', target: 1, xp: 30, action: 'tests', bolumStart: 'kelimeler' },
        { id: 'bolum_harfler', title: 'Orta bölüm', desc: 'Orta bölümünde bir test bitir', type: 'bolum_step', bolum: 'harfler', target: 1, xp: 32, action: 'tests', bolumStart: 'harfler' },
        { id: 'bolum_eslestirme', title: 'İleri bölüm', desc: 'İleri bölümünde bir test bitir', type: 'bolum_step', bolum: 'eslestirme', target: 1, xp: 35, action: 'tests', bolumStart: 'eslestirme' },
        { id: 'bolum_ceviri', title: 'Uzman bölüm', desc: 'Uzman bölümünde bir test bitir', type: 'bolum_step', bolum: 'ceviri', target: 1, xp: 35, action: 'tests', bolumStart: 'ceviri' },
        { id: 'bolum_open_harfler', title: 'Orta bölümü aç', desc: 'Orta bölümüne gir ve bir teste başla', type: 'bolum_open', bolum: 'harfler', target: 1, xp: 20, action: 'tests', bolumStart: 'harfler' },
        { id: 'bolum_open_eslestirme', title: 'İleri bölümü aç', desc: 'İleri bölümüne gir ve bir teste başla', type: 'bolum_open', bolum: 'eslestirme', target: 1, xp: 22, action: 'tests', bolumStart: 'eslestirme' },
        { id: 'bolum_ses', title: 'Usta bölümü dene', desc: 'Usta bölümünü aç ve konuşma sorusu dene', type: 'bolum_open', bolum: 'ses', target: 1, xp: 25, action: 'tests', bolumStart: 'ses' },
    ];

    function uid() {
        return (window.currentUser && window.currentUser.id) || 'guest';
    }

    function todayKey() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function stateKey() {
        return `lisani_daily_task_${uid()}`;
    }

    function placementKey() {
        return `lisani_placement_done_${uid()}`;
    }

    function hashDay(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function pickDailyTaskId(state) {
        const today = todayKey();
        const recent = Array.isArray(state?.recentTaskIds) ? state.recentTaskIds.slice(-RECENT_TASK_MEMORY) : [];
        let pool = DAILY_TASK_POOL.filter((t) => !recent.includes(t.id));
        if (!pool.length) pool = DAILY_TASK_POOL;

        const seed = `${today}|${uid()}`;
        let h = hashDay(seed);
        for (let attempt = 0; attempt < pool.length; attempt++) {
            const idx = h % pool.length;
            const task = pool[idx];
            if (!recent.includes(task.id)) return task.id;
            h = (h * 17 + attempt + 1) | 0;
        }
        return pool[h % pool.length].id;
    }

    function trimRecentTaskIds(recent, taskId) {
        const next = Array.isArray(recent) ? [...recent] : [];
        if (!next.includes(taskId)) next.push(taskId);
        while (next.length > RECENT_TASK_MEMORY) next.shift();
        return next;
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
            const taskId = pickDailyTaskId(state);
            const nextState = {
                todayDate: today,
                taskId,
                progress: 0,
                rewardedToday: false,
                streak: state?.streak || 0,
                lastCompleteDate: state?.lastCompleteDate || null,
                recentTaskIds: trimRecentTaskIds(state?.recentTaskIds, taskId),
            };
            saveState(nextState);
            return nextState;
        }
        return state;
    }

    function getTodayTask() {
        const state = loadState();
        if (state.todayDate === todayKey() && state.taskId) {
            return DAILY_TASK_POOL.find((t) => t.id === state.taskId) || DAILY_TASK_POOL[0];
        }
        const taskId = pickDailyTaskId(state);
        return DAILY_TASK_POOL.find((t) => t.id === taskId) || DAILY_TASK_POOL[0];
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

    function renderLearnStartCard() {}

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
        return history.length === 0 && !isPlacementDone();
    }

    function applyPlacementResult(startBolumId) {
        if (typeof window.applyPlacementStartBolum === 'function') {
            window.applyPlacementStartBolum(startBolumId);
        }
        markPlacementDone();
    }

    function awardTask(state, task) {
        const today = todayKey();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

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

    function onBolumStepComplete(bolumId) {
        const state = syncTaskDay(loadState());
        const task = getTaskForState(state);
        if (task.type === 'bolum_step' && task.bolum === bolumId) {
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
            if (typeof window.openLearnTests === 'function') {
                window.openLearnTests();
            } else if (typeof window.openKariyerModu === 'function') {
                window.openKariyerModu();
            }
            return;
        }
        if (typeof window.openKariyerModu === 'function') {
            window.openKariyerModu();
        } else if (typeof window.openLearnTests === 'function') {
            window.openLearnTests();
        }
    };

    window.continueLearnFromLast = function (event) {
        if (event) event.stopPropagation();
        markPlacementDone();
        if (typeof window.openLearnTests === 'function') {
            window.openLearnTests();
        }
    };

    window.closeLearnStartModal = function () {};

    window.openDailyGoalLetters = startDailyTaskAction;
    window.goToDailyGoalLetters = startDailyTaskAction;
    window.startDailyTaskAction = startDailyTaskAction;

    function buildPlacementQuestions() {
        if (typeof window.getPlacementQuestionPool !== 'function') return [];
        const pool = window.getPlacementQuestionPool().filter((q) => q.options && q.options.length >= 2);
        const picked = [];
        const perTier = { 1: 2, 2: 3, 3: 3, 4: 2 };

        function pickHardestForTier(tierQs, count) {
            const sorted = tierQs.slice().sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
            const out = [];
            for (let i = 0; i < count && sorted.length; i++) {
                const idx = Math.min(i + Math.floor(Math.random() * 2), sorted.length - 1);
                out.push(sorted.splice(idx, 1)[0]);
            }
            return out;
        }

        [1, 2, 3, 4].forEach((tier) => {
            let tierQs = pool.filter((q) => q.tier === tier);
            if (tier === 4 && window.LisaniGrammarPrep?.filterGrammarPool) {
                tierQs = window.LisaniGrammarPrep.filterGrammarPool(tierQs);
            }
            picked.push(...pickHardestForTier(tierQs, perTier[tier] || 2));
        });
        return picked.sort(() => Math.random() - 0.5);
    }

    window.startPlacementTest = function (event) {
        if (event) event.stopPropagation();
        if (typeof window.closeKariyerModu === 'function') window.closeKariyerModu();
        const questions = buildPlacementQuestions();
        if (!questions.length) {
            if (typeof showToast === 'function') showToast('Başlangıç testi hazırlanamadı.', 'error');
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
        onBolumStepComplete,
        onBolumOpen,
        onLevelComplete: onBolumComplete,
        onLevelOpen: onBolumOpen,
        updateDailyGoalUI,
        applyPlacementResult,
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
