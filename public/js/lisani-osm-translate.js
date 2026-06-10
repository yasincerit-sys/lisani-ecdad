/**
 * Osmanlıca çeviri sekmesi (Türkçe ↔ Osmanlı harfleri)
 */
(function () {
    'use strict';

    /** @type {'tr-to-osm'|'osm-to-tr'} */
    let osmTranslateMode = 'tr-to-osm';

    const OSM_WORDS = {
        merhaba: { ar: 'مرحبا', tr: 'merhaba' },
        selam: { ar: 'سلام', tr: 'selam' },
        'selamün aleyküm': { ar: 'سلام عليكم', tr: 'selamün aleyküm' },
        'aleyküm selam': { ar: 'عليكم السلام', tr: 'aleyküm selam' },
        günaydın: { ar: 'صباح الخير', tr: 'günaydın' },
        'iyi günler': { ar: 'أيام سعيدة', tr: 'iyi günler' },
        'iyi akşamlar': { ar: 'مساء الخير', tr: 'iyi akşamlar' },
        'iyi geceler': { ar: 'تصبح على خير', tr: 'iyi geceler' },
        'teşekkür ederim': { ar: 'أشكرك', tr: 'teşekkür ederim' },
        teşekkürler: { ar: 'شكرا', tr: 'teşekkürler' },
        'sağ ol': { ar: 'بارك الله فيك', tr: 'sağ ol' },
        lütfen: { ar: 'لو سمحت', tr: 'lütfen' },
        evet: { ar: 'نعم', tr: 'evet' },
        hayır: { ar: 'لا', tr: 'hayır' },
        affedersiniz: { ar: 'عفوا', tr: 'affedersiniz' },
        'hoş geldiniz': { ar: 'أهلا وسهلا', tr: 'hoş geldiniz' },
        'güle güle': { ar: 'مع السلامة', tr: 'güle güle' },
        kitap: { ar: 'كتاب', tr: 'kitap' },
        kalem: { ar: 'قلم', tr: 'kalem' },
        defter: { ar: 'دفتر', tr: 'defter' },
        okul: { ar: 'مدرسه', tr: 'okul' },
        öğrenci: { ar: 'طالب', tr: 'öğrenci' },
        hoca: { ar: 'استاد', tr: 'hoca' },
        öğretmen: { ar: 'معلم', tr: 'öğretmen' },
        sınıf: { ar: 'صنف', tr: 'sınıf' },
        ders: { ar: 'درس', tr: 'ders' },
        soru: { ar: 'سؤال', tr: 'soru' },
        cevap: { ar: 'جواب', tr: 'cevap' },
        test: { ar: 'امتحان', tr: 'test' },
        harf: { ar: 'حرف', tr: 'harf' },
        kelime: { ar: 'كلمه', tr: 'kelime' },
        cümle: { ar: 'جمله', tr: 'cümle' },
        dil: { ar: 'لغة', tr: 'dil' },
        osmanlıca: { ar: 'عثمانى', tr: 'osmanlıca' },
        türkçe: { ar: 'تركچه', tr: 'türkçe' },
        güzel: { ar: 'گوزل', tr: 'güzel' },
        kötü: { ar: 'كوتى', tr: 'kötü' },
        büyük: { ar: 'بيوك', tr: 'büyük' },
        küçük: { ar: 'كوچك', tr: 'küçük' },
        iyi: { ar: 'ايى', tr: 'iyi' },
        'güzel gün': { ar: 'گوزل كون', tr: 'güzel gün' },
        gün: { ar: 'كون', tr: 'gün' },
        gece: { ar: 'گجه', tr: 'gece' },
        sabah: { ar: 'صباح', tr: 'sabah' },
        akşam: { ar: 'عشا', tr: 'akşam' },
        su: { ar: 'آب', tr: 'su' },
        ekmek: { ar: 'اكمك', tr: 'ekmek' },
        çay: { ar: 'چاي', tr: 'çay' },
        kahve: { ar: 'قهوه', tr: 'kahve' },
        yemek: { ar: 'طعام', tr: 'yemek' },
        ev: { ar: 'او', tr: 'ev' },
        kapı: { ar: 'قاپى', tr: 'kapı' },
        pencere: { ar: 'پنجره', tr: 'pencere' },
        göz: { ar: 'گوز', tr: 'göz' },
        el: { ar: 'ال', tr: 'el' },
        kalp: { ar: 'قلب', tr: 'kalp' },
        aile: { ar: 'آيله', tr: 'aile' },
        anne: { ar: 'آنه', tr: 'anne' },
        baba: { ar: 'بابا', tr: 'baba' },
        çocuk: { ar: 'چوجق', tr: 'çocuk' },
        dost: { ar: 'دوست', tr: 'dost' },
        arkadaş: { ar: 'آرقداش', tr: 'arkadaş' },
        insan: { ar: 'انسان', tr: 'insan' },
        vatan: { ar: 'وطن', tr: 'vatan' },
        millet: { ar: 'ملت', tr: 'millet' },
        devlet: { ar: 'دولت', tr: 'devlet' },
        padışah: { ar: 'پادشاه', tr: 'padışah' },
        sultan: { ar: 'سلطان', tr: 'sultan' },
        saray: { ar: 'سراى', tr: 'saray' },
        cami: { ar: 'جامع', tr: 'cami' },
        namaz: { ar: 'نماز', tr: 'namaz' },
        kuran: { ar: 'قرآن', tr: "kur'an" },
        iman: { ar: 'ايمان', tr: 'iman' },
        din: { ar: 'دين', tr: 'din' },
        ilim: { ar: 'علم', tr: 'ilim' },
        toprak: { ar: 'توراق', tr: 'toprak' },
        meydan: { ar: 'ميدان', tr: 'meydan' },
        çarşı: { ar: 'چارشى', tr: 'çarşı' },
        kale: { ar: 'قلعه', tr: 'kale' },
        köy: { ar: 'كوى', tr: 'köy' },
        şehir: { ar: 'شهر', tr: 'şehir' },
        deniz: { ar: 'دنيز', tr: 'deniz' },
        ay: { ar: 'آى', tr: 'ay' },
        güneş: { ar: 'كونش', tr: 'güneş' },
        bahçe: { ar: 'باغچه', tr: 'bahçe' },
        çiçek: { ar: 'گل', tr: 'çiçek' },
        kuş: { ar: 'قوش', tr: 'kuş' },
        at: { ar: 'آت', tr: 'at' },
        kedi: { ar: 'قطة', tr: 'kedi' },
        köpek: { ar: 'كلب', tr: 'köpek' },
        allah: { ar: 'الله', tr: 'Allah' },
        peygamber: { ar: 'پيغمبر', tr: 'peygamber' },
        dua: { ar: 'دعا', tr: 'dua' },
        sabır: { ar: 'صبر', tr: 'sabır' },
        şükür: { ar: 'شكر', tr: 'şükür' },
        hikmet: { ar: 'حكمت', tr: 'hikmet' },
        adalet: { ar: 'عدالت', tr: 'adalet' },
        merhamet: { ar: 'رحمت', tr: 'merhamet' },
        elifba: { ar: 'الفبا', tr: 'elifba' },
        okumak: { ar: 'اوقومق', tr: 'okumak' },
        yazmak: { ar: 'يازمق', tr: 'yazmak' },
        öğrenmek: { ar: 'اورنمك', tr: 'öğrenmek' },
    };

    const OSM_SUFFIXES = [
        ['ler', 'لر'],
        ['lar', 'لر'],
        ['den', 'دن'],
        ['dan', 'دن'],
        ['ten', 'دن'],
        ['tan', 'دن'],
        ['de', 'ده'],
        ['da', 'ده'],
        ['te', 'ده'],
        ['ta', 'ده'],
        ['in', 'ىن'],
        ['ın', 'ىن'],
        ['un', 'ون'],
        ['ün', 'ون'],
        ['im', 'ım'],
        ['ım', 'ım'],
        ['um', 'وم'],
        ['üm', 'وم'],
        ['mek', 'مك'],
        ['mak', 'ماق'],
    ];

    const OSM_CHAR = {
        a: 'ا',
        b: 'ب',
        c: 'ج',
        ç: 'چ',
        d: 'د',
        e: '',
        f: 'ف',
        g: 'گ',
        ğ: 'غ',
        h: 'ه',
        ı: 'ى',
        i: '',
        j: 'ژ',
        k: 'ك',
        l: 'ل',
        m: 'م',
        n: 'ن',
        o: 'و',
        ö: 'و',
        p: 'پ',
        r: 'ر',
        s: 'س',
        ş: 'ش',
        t: 'ت',
        u: 'و',
        ü: 'و',
        v: 'و',
        y: 'ى',
        z: 'ز',
        â: 'ا',
        î: 'ى',
        û: 'و',
    };

    const SORTED_KEYS = Object.keys(OSM_WORDS).sort((a, b) => b.length - a.length);

    const AR_TO_TR = {};
    Object.entries(OSM_WORDS).forEach(([, v]) => {
        AR_TO_TR[normalizeArabic(v.ar)] = v.tr;
    });

    function normalizeTr(text) {
        return (text || '').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
    }

    function normalizeArabic(text) {
        return (text || '')
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isArabicScript(text) {
        return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text || '');
    }

    function lookupTrWord(word) {
        const w = normalizeTr(word);
        if (!w) return null;
        if (OSM_WORDS[w]) return { ar: OSM_WORDS[w].ar, exact: true };

        for (const [suffix, arSuffix] of OSM_SUFFIXES) {
            if (w.length <= suffix.length + 1 || !w.endsWith(suffix)) continue;
            const stem = w.slice(0, -suffix.length);
            if (OSM_WORDS[stem]) {
                return { ar: OSM_WORDS[stem].ar + arSuffix, exact: true };
            }
        }

        return { ar: latinToOttomanLetters(w), exact: false };
    }

    function latinToOttomanLetters(word) {
        const w = normalizeTr(word);
        if (!w) return '';

        let out = '';
        for (let i = 0; i < w.length; i++) {
            if (w[i] === 'n' && w[i + 1] === 'g') {
                out += 'نگ';
                i += 1;
                continue;
            }
            out += OSM_CHAR[w[i]] ?? '';
        }

        return out || null;
    }

    function translateTrToOsm(text) {
        const normalized = normalizeTr(text);
        if (!normalized) return null;

        for (const key of SORTED_KEYS) {
            if (normalized === key) {
                return {
                    main: OSM_WORDS[key].ar,
                    sub: OSM_WORDS[key].tr,
                    note: 'Sözlük eşleşmesi',
                    rtl: true,
                };
            }
        }

        const tokens = normalized.split(' ');
        const parts = [];
        let exactCount = 0;
        let approxCount = 0;

        tokens.forEach((token) => {
            const clean = token.replace(/[.,!?;:'"()]/g, '');
            if (!clean) return;
            const hit = lookupTrWord(clean);
            if (!hit || !hit.ar) return;
            parts.push(hit.ar);
            if (hit.exact) exactCount += 1;
            else approxCount += 1;
        });

        if (!parts.length) return null;

        let note = 'Sözlük eşleşmesi';
        if (approxCount > 0 && exactCount === 0) {
            note = 'Yaklaşık harf karşılığı — kesin anlam için sözlükteki kelimeleri deneyin';
        } else if (approxCount > 0) {
            note = 'Bazı kelimeler sözlükte yok; harf karşılığı eklendi';
        }

        return {
            main: parts.join(' '),
            sub: normalized,
            note,
            rtl: true,
        };
    }

    function translateOsmToTr(text) {
        const normalized = normalizeArabic(text);
        if (!normalized) return null;

        if (AR_TO_TR[normalized]) {
            return {
                main: AR_TO_TR[normalized],
                sub: text.trim(),
                note: 'Sözlük eşleşmesi',
                rtl: false,
            };
        }

        const tokens = normalized.split(/\s+/);
        const parts = [];
        let hits = 0;

        tokens.forEach((token) => {
            if (AR_TO_TR[token]) {
                parts.push(AR_TO_TR[token]);
                hits += 1;
            } else {
                parts.push('?');
            }
        });

        if (!hits) {
            return {
                main: 'Bu Osmanlıca metin sözlükte bulunamadı.',
                sub: text.trim(),
                note: 'Örnek: مرحبا · كتاب · گوزل',
                rtl: false,
            };
        }

        return {
            main: parts.join(' '),
            sub: text.trim(),
            note: hits < tokens.length ? 'Bazı kelimeler sözlükte yok (?)' : 'Sözlük eşleşmesi',
            rtl: false,
        };
    }

    function detectMode(text) {
        if (osmTranslateMode === 'osm-to-tr') return 'osm-to-tr';
        if (osmTranslateMode === 'tr-to-osm') return 'tr-to-osm';
        return isArabicScript(text) ? 'osm-to-tr' : 'tr-to-osm';
    }

    function translate(text) {
        const mode = detectMode(text);
        return mode === 'osm-to-tr' ? translateOsmToTr(text) : translateTrToOsm(text);
    }

    function updateModeButtons() {
        const trBtn = document.getElementById('osm-mode-tr');
        const arBtn = document.getElementById('osm-mode-ar');
        if (!trBtn || !arBtn) return;
        trBtn.classList.toggle('is-active', osmTranslateMode === 'tr-to-osm');
        arBtn.classList.toggle('is-active', osmTranslateMode === 'osm-to-tr');
    }

    function updateInputHint() {
        const input = document.getElementById('osm-translate-input');
        if (!input) return;
        input.placeholder =
            osmTranslateMode === 'osm-to-tr'
                ? 'Osmanlıca yazın: مرحبا'
                : 'Türkçe yazın: merhaba, kitap';
        input.dir = osmTranslateMode === 'osm-to-tr' ? 'rtl' : 'ltr';
    }

    function renderResultToTargets(result, boxId, mainId, subId, noteId) {
        const box = document.getElementById(boxId);
        const mainEl = document.getElementById(mainId);
        const subEl = document.getElementById(subId);
        const noteEl = noteId ? document.getElementById(noteId) : null;
        if (!box || !mainEl || !subEl) return;

        mainEl.textContent = result.main;
        mainEl.dir = result.rtl ? 'rtl' : 'ltr';
        mainEl.classList.toggle('arabic-text', result.rtl);
        mainEl.classList.toggle('font-arabic', result.rtl);

        subEl.textContent = result.sub ? (result.rtl ? `"${result.sub}"` : result.sub) : '';
        subEl.dir = result.rtl ? 'ltr' : 'rtl';
        subEl.classList.toggle('arabic-text', !result.rtl);
        subEl.classList.toggle('hidden', !result.sub);

        if (noteEl) noteEl.textContent = result.note || '';
        box.classList.remove('hidden');
    }

    function renderResult(result) {
        renderResultToTargets(result, 'osm-translate-result', 'osm-translate-main', 'osm-translate-sub', 'osm-translate-note');
    }

    function renderHomeResult(result) {
        renderResultToTargets(result, 'home-osm-translate-result', 'home-osm-translate-main', 'home-osm-translate-sub', null);
    }

    window.runHomeOsmTranslate = function () {
        if (typeof playClickSound === 'function') playClickSound();

        const input = document.getElementById('home-osm-translate-input');
        const resultBox = document.getElementById('home-osm-translate-result');
        if (!input || !resultBox) return;

        const text = input.value.trim();
        if (!text) {
            if (typeof showToast === 'function') {
                showToast('Lütfen çevrilecek bir metin yazın.', 'error');
            }
            return;
        }

        const autoMode = isArabicScript(text) && osmTranslateMode === 'tr-to-osm';
        const result = autoMode ? translateOsmToTr(text) : translate(text);

        if (!result || !result.main) {
            resultBox.classList.add('hidden');
            if (typeof showToast === 'function') {
                showToast('Bu metin için çeviri üretilemedi.', 'error');
            }
            return;
        }

        renderHomeResult(result);
        if (window.LisaniDailyTasks && typeof window.LisaniDailyTasks.onTranslate === 'function') {
            window.LisaniDailyTasks.onTranslate();
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.homeOsmQuickTranslate = function (word) {
        const input = document.getElementById('home-osm-translate-input');
        if (!input) return;
        input.value = word;
        window.setOsmTranslateMode('tr-to-osm');
        window.runHomeOsmTranslate();
    };

    window.handleHomeOsmTranslateKey = function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            window.runHomeOsmTranslate();
        }
    };

    window.setOsmTranslateMode = function (mode) {
        if (mode !== 'tr-to-osm' && mode !== 'osm-to-tr') return;
        osmTranslateMode = mode;
        if (typeof playClickSound === 'function') playClickSound();
        updateModeButtons();
        updateInputHint();
        const input = document.getElementById('osm-translate-input');
        if (input && input.value.trim()) window.runOsmTranslate();
    };

    window.osmQuickTranslate = function (word) {
        const input = document.getElementById('osm-translate-input');
        if (!input) return;
        input.value = word;
        window.setOsmTranslateMode('tr-to-osm');
        window.runOsmTranslate();
    };

    window.handleOsmTranslateKey = function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            window.runOsmTranslate();
        }
    };

    window.copyOsmResult = function () {
        const mainEl = document.getElementById('osm-translate-main');
        if (!mainEl || !mainEl.textContent) return;
        if (typeof playClickSound === 'function') playClickSound();
        const text = mainEl.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                () => {
                    if (typeof showToast === 'function') showToast('Panoya kopyalandı.', 'success');
                },
                () => fallbackCopy(text)
            );
        } else {
            fallbackCopy(text);
        }
    };

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('Panoya kopyalandı.', 'success');
        } catch (e) {
            if (typeof showToast === 'function') showToast('Kopyalanamadı.', 'error');
        }
        document.body.removeChild(ta);
    }

    window.runOsmTranslate = function () {
        if (typeof playClickSound === 'function') playClickSound();

        const input = document.getElementById('osm-translate-input');
        const resultBox = document.getElementById('osm-translate-result');
        if (!input || !resultBox) return;

        const text = input.value.trim();
        if (!text) {
            if (typeof showToast === 'function') {
                showToast('Lütfen çevrilecek bir metin yazın.', 'error');
            }
            return;
        }

        const autoMode = isArabicScript(text) && osmTranslateMode === 'tr-to-osm';
        const result = autoMode ? translateOsmToTr(text) : translate(text);

        if (!result || !result.main) {
            resultBox.classList.add('hidden');
            if (typeof showToast === 'function') {
                showToast('Bu metin için çeviri üretilemedi.', 'error');
            }
            return;
        }

        renderResult(result);
        if (window.LisaniDailyTasks && typeof window.LisaniDailyTasks.onTranslate === 'function') {
            window.LisaniDailyTasks.onTranslate();
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    document.addEventListener('DOMContentLoaded', function () {
        updateModeButtons();
        updateInputHint();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
})();
