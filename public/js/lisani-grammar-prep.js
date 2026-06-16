/**
 * Dil bilgisi öğrenme altyapısı — konu kilidi, mini drill, test kapısı
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'lisani_grammar_unlocked_v1';

    const TOPIC_ORDER = [
        'irab',
        'harficer',
        'izafet',
        'fiil',
        'tenvin',
        'nefy',
        'sifat',
        'zamir',
        'kalin',
        'tekid',
    ];

    const BOLUM_TOPIC_REQUIREMENTS = {
        ceviri: ['irab', 'harficer', 'izafet', 'fiil'],
        ses: TOPIC_ORDER.slice(),
    };

    function readUnlocked() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((t) => TOPIC_ORDER.includes(t)) : [];
        } catch (e) {
            return [];
        }
    }

    function writeUnlocked(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(list)]));
        } catch (e) {}
    }

    function isYonetici() {
        return typeof window.isYoneticiUser === 'function' && window.isYoneticiUser();
    }

    function topicTitle(topicId) {
        const map = window.LISANI_GRAMMAR_TOPIC_TITLES || {};
        return map[topicId] || topicId;
    }

    function isTopicUnlocked(topicId) {
        if (!topicId) return false;
        if (isYonetici()) return true;
        return readUnlocked().includes(topicId);
    }

    function unlockTopic(topicId) {
        if (!topicId || !TOPIC_ORDER.includes(topicId)) return;
        const next = readUnlocked();
        if (!next.includes(topicId)) {
            next.push(topicId);
            writeUnlocked(next);
        }
        refreshGrammarRulesUI();
    }

    function requiredTopicCount(bolumId, stepIndex) {
        if (bolumId === 'ceviri') return Math.min(4, 2 + Math.max(0, stepIndex));
        if (bolumId === 'ses') return Math.min(TOPIC_ORDER.length, 4 + Math.max(0, stepIndex));
        return 0;
    }

    function getRequiredTopics(bolumId, stepIndex) {
        const pool = BOLUM_TOPIC_REQUIREMENTS[bolumId] || [];
        const need = requiredTopicCount(bolumId, stepIndex);
        return pool.slice(0, need);
    }

    function getMissingTopics(bolumId, stepIndex) {
        if (isYonetici()) return [];
        const required = getRequiredTopics(bolumId, stepIndex);
        return required.filter((t) => !isTopicUnlocked(t));
    }

    function getGrammarPoolByTopic(topic) {
        const pool = (window.LISANI_POOLS && window.LISANI_POOLS.grammar) || [];
        return pool.filter((q) => q.grammarTopic === topic);
    }

    function buildDrillQuestions(topic, count) {
        const pool = getGrammarPoolByTopic(topic).slice();
        if (!pool.length) return [];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const n = Math.min(count || 2, pool.length);
        return pool.slice(0, n).map((q) => JSON.parse(JSON.stringify(q)));
    }

        function refreshGrammarRulesUI() {
        document.querySelectorAll('.lisani-grammar-rules-list [data-grammar-topic]').forEach((btn) => {
            const topic = btn.getAttribute('data-grammar-topic');
            const unlocked = isTopicUnlocked(topic);
            let badge = btn.querySelector('.lisani-grammar-topic-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'lisani-grammar-topic-badge';
                const title = btn.querySelector('.lisani-grammar-prep-note__title');
                if (title) title.appendChild(badge);
            }
            badge.textContent = unlocked ? ' ✓' : ' · çalış';
            badge.classList.toggle('is-unlocked', unlocked);
            btn.classList.toggle('is-grammar-unlocked', unlocked);
        });
    }

    function closeGrammarGateModal() {
        document.getElementById('grammar-gate-modal')?.classList.add('hidden');
    }

    function renderGrammarGateModal(missing, bolumId, stepIndex, onReady) {
        const modal = document.getElementById('grammar-gate-modal');
        const list = document.getElementById('grammar-gate-topic-list');
        const startBtn = document.getElementById('grammar-gate-start-btn');
        const sub = document.getElementById('grammar-gate-subtitle');
        if (!modal || !list) {
            onReady(true);
            return;
        }

        window._lisaniGrammarGateCtx = { bolumId, stepIndex, onReady };

        const bolumTitle =
            bolumId === 'ses' ? 'Usta' : bolumId === 'ceviri' ? 'Uzman' : 'Test';

        if (sub) {
            sub.textContent = `${bolumTitle} testinde dil bilgisi soruları var. Aşağıdaki konuları çalışmadan bu soruları çözemezsin.`;
        }

        const required = getRequiredTopics(bolumId, stepIndex);
        const stillMissing = getMissingTopics(bolumId, stepIndex);

        list.innerHTML = required
            .map((topic) => {
                const unlocked = isTopicUnlocked(topic);
                return `
                <div class="lisani-grammar-gate-item lisani-glass-panel rounded-xl p-3 flex items-center gap-3 ${unlocked ? 'is-done' : ''}" data-gate-topic="${topic}">
                    <span class="lisani-grammar-gate-item__icon" aria-hidden="true">${unlocked ? '✓' : '🔒'}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-[11px] font-extrabold theme-text-main">${topicTitle(topic)}</p>
                        <p class="text-[9px] theme-text-muted mt-0.5">${unlocked ? 'Hazırsın' : 'Detayı oku + mini test (2 soru)'}</p>
                    </div>
                    <button type="button" class="lisani-glass-action lisani-glass-action--compact text-[10px] font-bold shrink-0 grammar-gate-study-btn" data-study-topic="${topic}">
                        ${unlocked ? 'Tekrar' : 'Çalış'}
                    </button>
                </div>`;
            })
            .join('');

        list.querySelectorAll('.grammar-gate-study-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const topic = btn.getAttribute('data-study-topic');
                if (!topic) return;
                if (typeof window.openLearnCardDetail === 'function') {
                    window.openLearnCardDetail(topic, { showDrillAction: true, drillTopic: topic });
                }
            });
        });

        if (startBtn) {
            const ready = stillMissing.length === 0;
            startBtn.disabled = !ready;
            startBtn.classList.toggle('opacity-50', !ready);
            startBtn.textContent = ready ? 'Teste Başla' : `Kalan konu: ${stillMissing.length}`;
            startBtn.onclick = () => {
                if (getMissingTopics(bolumId, stepIndex).length) return;
                closeGrammarGateModal();
                onReady(true);
            };
        }

        modal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function syncGrammarGateModal() {
        const ctx = window._lisaniGrammarGateCtx;
        if (!ctx) return;
        const modal = document.getElementById('grammar-gate-modal');
        if (!modal || modal.classList.contains('hidden')) return;
        renderGrammarGateModal(getMissingTopics(ctx.bolumId, ctx.stepIndex), ctx.bolumId, ctx.stepIndex, ctx.onReady);
    }

    function ensureGrammarReady(bolumId, stepIndex, onReady) {
        if (bolumId !== 'ceviri' && bolumId !== 'ses') {
            onReady(true);
            return;
        }
        const missing = getMissingTopics(bolumId, stepIndex);
        if (!missing.length) {
            onReady(true);
            return;
        }
        renderGrammarGateModal(missing, bolumId, stepIndex, onReady);
    }

    let activeDrillTopic = null;
    let activeDrillCallback = null;

    function startTopicDrill(topicId, onComplete) {
        if (!topicId) return false;
        const questions = buildDrillQuestions(topicId, 2);
        if (!questions.length) {
            if (typeof showToast === 'function') showToast('Bu konu için soru hazırlanamadı.', 'error');
            return false;
        }

        activeDrillTopic = topicId;
        activeDrillCallback = typeof onComplete === 'function' ? onComplete : null;
        window._lisaniGrammarDrillActive = true;
        window._lisaniGrammarDrillTopic = topicId;

        if (typeof window.launchGrammarDrillSession === 'function') {
            window.launchGrammarDrillSession(questions, topicId);
            return true;
        }
        return false;
    }

    function onDrillFinished(correct, total) {
        const topic = activeDrillTopic || window._lisaniGrammarDrillTopic;
        const passed = total > 0 && correct / total >= 0.5;
        if (passed && topic) {
            unlockTopic(topic);
            if (typeof showToast === 'function') {
                showToast(`${topicTitle(topic)} konusu açıldı!`, 'success');
            }
        } else if (typeof showToast === 'function') {
            showToast('Mini testi geçemedin — önce kuralı çalış.', 'info');
        }
        window._lisaniGrammarDrillActive = false;
        window._lisaniGrammarDrillTopic = null;
        activeDrillTopic = null;
        if (typeof activeDrillCallback === 'function') {
            activeDrillCallback(passed);
            activeDrillCallback = null;
        }
        syncGrammarGateModal();
        refreshGrammarRulesUI();
    }

    function filterGrammarPool(candidates) {
        if (isYonetici()) return candidates;
        return candidates.filter((q) => isTopicUnlocked(q.grammarTopic));
    }

    window.LisaniGrammarPrep = {
        TOPIC_ORDER,
        isTopicUnlocked,
        unlockTopic,
        getMissingTopics,
        getRequiredTopics,
        ensureGrammarReady,
        startTopicDrill,
        onDrillFinished,
        buildDrillQuestions,
        filterGrammarPool,
        refreshGrammarRulesUI,
        closeGrammarGateModal,
        syncGrammarGateModal,
    };

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(refreshGrammarRulesUI, 400);
        });
    }
})();
