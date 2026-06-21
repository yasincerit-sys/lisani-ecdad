/**
 * Osmanlıca çeviri sekmesi (Türkçe ↔ Osmanlı harfleri)
 * Sözlük tabanlı — harf harf Latin eşlemesi yok (Ingilizce tarzı sahte çeviri kaldırıldı).
 */
(function () {
    'use strict';

    /** @type {'tr-to-osm'|'osm-to-tr'} */
    let osmTranslateMode = 'tr-to-osm';

    /** @type {Record<string, { ar: string, tr: string }>} */
    const OSM_WORDS = {};

    /** @type {Record<string, string>} */
    const OSM_PHRASES = {};

    /** Cümle parçaları ve fiil çekimleri — quiz bankası TILE_PHRASES ile uyumlu */
    const EXTRA_WORDS = {
        ve: 'و',
        bu: 'بو',
        ben: 'بن',
        istiyorum: 'ايستييورم',
        istiyor: 'ايستييور',
        istiyoruz: 'ايستييورز',
        okuyorum: 'اوكونييورم',
        okuyor: 'اوكونييور',
        yazıyorum: 'يازييورم',
        yaziyorum: 'يازييور\u0645',
        yazıyor: 'يازييور',
        gidiyorum: 'گيدييور\u0645',
        gidiyor: 'گيدييور',
        seviyorum: 'سورييور\u0645',
        seviyor: 'سورييور',
        ederim: 'ايدرم',
        ederiz: 'ايدرز',
        dilerim: 'ديلييور\u0645',
        okulda: 'مدرسه ده',
        evde: 'آو ده',
        okula: 'مدرسه يه',
        günler: 'گونلر',
        gunler: 'گونلر',
        akşamlar: 'آخشام',
        aksamlar: 'آخشام',
        geceler: 'گجه لر',
        geldiniz: 'كلدك',
        'hoş geldiniz': 'خوش كلدك',
        'hos geldiniz': 'خوش كلدك',
        güle: 'گله',
        gule: 'گله',
        teşekkür: 'تشكر',
        tesekkur: 'تشكر',
        'teşekkür ederim': 'تشكر ايدرم',
        'tesekkur ederim': 'تشكر ايدرم',
        'iyi günler': 'ايى گونلر',
        'iyi gunler': 'ايى گونلر',
        'iyi akşamlar': 'ايى آخشام',
        'iyi aksamlar': 'ايى آخشام',
        'iyi geceler': 'ايى گجه لر',
        'güle güle': 'گله گله',
        'gule gule': 'گله گله',
        'selamün aleyküm': 'سلام عليكم',
        'selamun aleykum': 'سلام عليكم',
        'aleyküm selam': 'عليكم سلام',
        'aleykum selam': 'عليكم سلام',
        bugün: 'بوگون',
        bugun: 'بوگون',
        nasılsın: 'ناصل سين',
        nasilsin: 'ناصل سين',
        iyiyim: 'ايييم',
        hamdolsun: 'الحمد',
        selamün: 'سلام',
        selamun: 'سلام',
        aleyküm: 'عليكم',
        aleykum: 'عليكم',
        öğrenciyim: 'طالبم',
        ogrenciyim: 'طالبم',
        vatanımı: 'وطن',
        vatanimi: 'وطن',
        nurdur: 'نور',
        sabırla: 'صبر',
        sabirla: 'صبر',
        kapılar: 'كاپيلر',
        kapilar: 'كاپيلر',
        açılır: 'آچيلير',
        acilir: 'آچيلير',
        dostum: 'دوست',
        'güzel gün': 'گوزل كون',
        'guzel gun': 'گوزل كون',
        kötü: 'كوتى',
        kotu: 'كوتى',
        gece: 'گجه',
        sabah: 'صباح',
        akşam: 'عشا',
        aksam: 'عشا',
        gün: 'كون',
        gun: 'كون',
        'sağ ol': 'ساڭ اول',
        'sag ol': 'ساڭ اول',
        affedersiniz: 'عفوا',
        öğretmen: 'معلم',
        ogretmen: 'معلم',
        sınıf: 'صنف',
        sinif: 'صنف',
        ders: 'درس',
        soru: 'سؤال',
        cevap: 'جواب',
        test: 'امتحان',
        harf: 'حرف',
        kelime: 'كلمه',
        cümle: 'جمله',
        cumle: 'جمله',
        dil: 'لغة',
        osmanlıca: 'عثمانى',
        osmanlica: 'عثمانى',
        türkçe: 'تركچه',
        turkce: 'تركچه',
        büyük: 'بيوك',
        buyuk: 'بيوك',
        küçük: 'كوچك',
        kucuk: 'كوچك',
        ekmek: 'اكمك',
        yemek: 'طعام',
        pencere: 'پنجره',
        aile: 'آيله',
        çocuk: 'چوجق',
        cocuk: 'چوجق',
        arkadaş: 'آرقداش',
        arkadas: 'آرقداش',
        insan: 'انسان',
        padışah: 'پادشاه',
        padisah: 'پادشاه',
        saray: 'سراى',
        namaz: 'نماز',
        kuran: 'قرآن',
        "kur'an": 'قرآن',
        iman: 'ايمان',
        toprak: 'توراق',
        meydan: 'ميدان',
        çarşı: 'چارشى',
        carsi: 'چارشى',
        kale: 'قلعه',
        bahçe: 'باغچه',
        bahce: 'باغچه',
        çiçek: 'گل',
        cicek: 'گل',
        kedi: 'قطة',
        köpek: 'كلب',
        kopek: 'كلب',
        allah: 'الله',
        peygamber: 'پيغمبر',
        dua: 'دعا',
        şükür: 'شكر',
        sukur: 'شكر',
        merhamet: 'رحمت',
        elifba: 'الفبا',
        okumak: 'اوقومق',
        yazmak: 'يازمق',
        öğrenmek: 'اورنمك',
        ogrenmek: 'اورنمك',
        öğrenci: 'طالب',
        ogrenci: 'طالب',
        rahmet: 'رحمت',
        takva: 'تقوى',
        tevekkül: 'توكل',
        tevekkul: 'توكل',
        ihsan: 'احسان',
        fütüvvet: 'فتوة',
        futuvvet: 'فتوة',
        hakikat: 'حقيقة',
        batıl: 'باطل',
        batil: 'باطل',
        zahir: 'ظاهر',
        bâtın: 'باطن',
        batin: 'باطن',
        mülk: 'ملك',
        mulk: 'ملك',
        melekût: 'ملكوت',
        melekut: 'ملكوت',
        kader: 'قدر',
        kaza: 'قضاء',
        şefaat: 'شفاعة',
        sefaat: 'شفاعة',
        istiğfar: 'استغفار',
        istigfar: 'استغفار',
        tefekkür: 'تفكر',
        tefekkur: 'تفكر',
        marifet: 'معرفة',
        muhabbet: 'محبة',
    };

    /** Ekler — uzun olan önce denenir; yer-yön ekleri Osmanlıca’da genelde ayrı yazılır */
    const OSM_SUFFIXES = [
        ['iyorum', 'ييور\u0645'],
        ['iyoruz', 'ييورز'],
        ['iyorsun', 'ييورسون'],
        ['iyor', 'ييور'],
        ['uyorum', 'ويور\u0645'],
        ['uyor', 'ويور'],
        ['üyorum', 'ويور\u0645'],
        ['üyor', 'ويور'],
        ['ler', 'لر'],
        ['lar', 'لر'],
        ['den', ' دن'],
        ['dan', ' دن'],
        ['ten', ' دن'],
        ['tan', ' دن'],
        ['de', ' ده'],
        ['da', ' ده'],
        ['te', ' ده'],
        ['ta', ' ده'],
        ['ye', ' يه'],
        ['ya', ' يه'],
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

    let SORTED_WORD_KEYS = [];
    let SORTED_PHRASE_KEYS = [];
    const AR_TO_TR = {};

    function normalizeTr(text) {
        return (text || '').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
    }

    function normalizeArabic(text) {
        return (text || '')
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function registerWord(tr, ar) {
        const key = normalizeTr(tr);
        if (!key || !ar) return;
        if (!OSM_WORDS[key]) {
            OSM_WORDS[key] = { ar, tr: key };
        }
    }

    function registerPhrase(tr, ar) {
        const key = normalizeTr(tr);
        if (!key || !ar) return;
        OSM_PHRASES[key] = ar;
        registerWord(key, ar);
    }

    function buildOsmDictionary() {
        Object.entries(EXTRA_WORDS).forEach(([tr, ar]) => registerWord(tr, ar));

        const core = window.LISANI_CORE_WORDS;
        if (Array.isArray(core)) {
            core.forEach((w) => {
                if (!w || !w.osm) return;
                registerWord(w.tr, w.osm);
                if (w.hint) registerWord(w.hint, w.osm);
                (w.speakAlt || []).forEach((alt) => registerWord(alt, w.osm));
            });
        }

        const tiles = window.LISANI_TILE_PHRASES_OSM;
        if (Array.isArray(tiles)) {
            tiles.forEach((p) => {
                if (!p || !p.osm || !Array.isArray(p.parts)) return;
                registerPhrase(p.parts.join(' '), p.osm);
            });
        }

        rebuildIndexes();
    }

    function rebuildIndexes() {
        SORTED_WORD_KEYS = Object.keys(OSM_WORDS).sort((a, b) => b.length - a.length);
        SORTED_PHRASE_KEYS = Object.keys(OSM_PHRASES).sort((a, b) => b.length - a.length);
        Object.keys(AR_TO_TR).forEach((k) => delete AR_TO_TR[k]);
        Object.entries(OSM_WORDS).forEach(([, v]) => {
            AR_TO_TR[normalizeArabic(v.ar)] = v.tr;
        });
        Object.entries(OSM_PHRASES).forEach(([tr, ar]) => {
            AR_TO_TR[normalizeArabic(ar)] = tr;
        });
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

        return null;
    }

    function translateTrToOsm(text) {
        const normalized = normalizeTr(text);
        if (!normalized) return null;

        for (const key of SORTED_PHRASE_KEYS) {
            if (normalized === key) {
                return {
                    main: OSM_PHRASES[key],
                    sub: key,
                    note: 'Sözlük eşleşmesi (cümle)',
                    rtl: true,
                };
            }
        }

        for (const key of SORTED_WORD_KEYS) {
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
        let missingCount = 0;

        tokens.forEach((token) => {
            const clean = token.replace(/[.,!?;:'"()]/g, '');
            if (!clean) return;
            const hit = lookupTrWord(clean);
            if (hit && hit.ar) {
                parts.push(hit.ar);
                exactCount += 1;
            } else {
                parts.push('؟');
                missingCount += 1;
            }
        });

        if (!parts.length) return null;

        if (missingCount === parts.length) {
            return {
                main: 'Bu kelime veya cümle sözlükte yok.',
                sub: normalized,
                note: 'Örnek: merhaba · kitap · çay istiyorum · iyi günler',
                rtl: false,
            };
        }

        let note = 'Sözlük eşleşmesi';
        if (missingCount > 0) {
            note = 'Bazı kelimeler sözlükte yok (؟) — bilinen kelimeler Osmanlıca yazıldı';
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
                note: 'Örnek: مرحبا · كتاب · گوزل · چای ايستييورم',
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
                : 'Türkçe yazın: merhaba, kitap, çay istiyorum';
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

    buildOsmDictionary();

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
        buildOsmDictionary();
        updateModeButtons();
        updateInputHint();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
})();
