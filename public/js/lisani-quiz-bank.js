/**
 * Lisani — Soru bankası (lisani-osm-translate.js OSM_WORDS ile birebir uyumlu)
 */
(function () {
    'use strict';

    const CARD = 'Osmanlıca kelimenin Türkçe karşılığını seçin';
    const LETTER = 'Harf adını seçin';
    const SPEAK = 'Kelimeyi Türkçe okuyun';
    const TILES = 'Kelimeleri sırayla seçerek Türkçe cümle kurun';

    function normQuizWord(s) {
        return String(s)
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
    }

    /** Eş anlamlılar yanlış şık / decoy olmasın */
    const QUIZ_SYNONYM_GROUPS = [
        ['merhaba', 'selam', 'günaydın', 'günaydin', 'sabah', 'hoş geldiniz', 'hos geldiniz'],
        ['teşekkürler', 'tesekkurler', 'teşekkür ederim', 'tesekkur ederim', 'sağ ol', 'sag ol', 'şükür', 'sukur', 'teşekkür', 'tesekkur'],
        ['su', 'çay', 'cay', 'kahve'],
        ['güzel', 'guzel', 'iyi'],
        ['evet', 'hayır', 'hayir'],
        ['rahmet', 'merhamet', 'rahim', 'rahman'],
        ['ilim', 'ilm', 'bilim', 'fen'],
        ['hikmet', 'fikir'],
        ['adalet', 'hak'],
        ['sabır', 'sabir', 'tahammul'],
        ['vatan', 'millet', 'devlet'],
        ['dost', 'arkadaş', 'arkadas'],
        ['kitap', 'kalem', 'defter'],
        ['okul', 'sınıf', 'sinif', 'ders'],
        ['cami', 'camii', 'mescit'],
        ['kuran', "kur'an", 'kurân'],
        ['din', 'iman'],
    ];

    function synonymBlockSet(words) {
        const blocked = new Set();
        const list = Array.isArray(words) ? words : [words];
        list.forEach((w) => {
            if (!w) return;
            const n = normQuizWord(w);
            blocked.add(n);
            QUIZ_SYNONYM_GROUPS.forEach((group) => {
                const ng = group.map(normQuizWord);
                if (ng.includes(n)) ng.forEach((x) => blocked.add(x));
            });
        });
        return blocked;
    }

    function filterTileDecoys(parts, decoys) {
        const blocked = synonymBlockSet(parts);
        return decoys.filter((d) => !blocked.has(normQuizWord(d)));
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** osm = OSM_WORDS.ar · tr = ekranda görünen Türkçe · hint = konuşma tanıma */
    const CORE_WORDS = [
        { tr: 'Merhaba', osm: 'مرحبا', diff: 2, hint: 'merhaba' },
        { tr: 'Selam', osm: 'سلام', diff: 2, hint: 'selam' },
        { tr: 'Teşekkürler', osm: 'شكرا', diff: 2, hint: 'teşekkürler', speakAlt: ['tesekkurler'] },
        { tr: 'Lütfen', osm: 'لو سمحت', diff: 2, hint: 'lütfen', speakAlt: ['lutfen'] },
        { tr: 'Evet', osm: 'نعم', diff: 2, hint: 'evet' },
        { tr: 'Hayır', osm: 'لا', diff: 2, hint: 'hayır', speakAlt: ['hayir'] },
        { tr: 'Su', osm: 'آب', diff: 2, hint: 'su' },
        { tr: 'Çay', osm: 'چاي', diff: 2, hint: 'çay', speakAlt: ['cay'] },
        { tr: 'Kahve', osm: 'قهوه', diff: 2, hint: 'kahve' },
        { tr: 'Kitap', osm: 'كتاب', diff: 2, hint: 'kitap' },
        { tr: 'Kalem', osm: 'قلم', diff: 2, hint: 'kalem' },
        { tr: 'Defter', osm: 'دفتر', diff: 2, hint: 'defter' },
        { tr: 'Ev', osm: 'او', diff: 2, hint: 'ev' },
        { tr: 'Kapı', osm: 'قاپى', diff: 2, hint: 'kapı', speakAlt: ['kapi'] },
        { tr: 'Kalp', osm: 'قلب', diff: 2, hint: 'kalp' },
        { tr: 'Göz', osm: 'گوز', diff: 2, hint: 'göz', speakAlt: ['goz'] },
        { tr: 'El', osm: 'ال', diff: 2, hint: 'el' },
        { tr: 'Anne', osm: 'آنه', diff: 2, hint: 'anne' },
        { tr: 'Baba', osm: 'بابا', diff: 2, hint: 'baba' },
        { tr: 'Günaydın', osm: 'صباح الخير', diff: 2, hint: 'günaydın', speakAlt: ['gunaydin', 'sabah'] },
        { tr: 'Güzel', osm: 'گوزل', diff: 2, hint: 'güzel', speakAlt: ['guzel'] },
        { tr: 'İyi', osm: 'ايى', diff: 2, hint: 'iyi' },
        { tr: 'Kuş', osm: 'قوش', diff: 2, hint: 'kuş', speakAlt: ['kus'] },
        { tr: 'At', osm: 'آت', diff: 2, hint: 'at' },
        { tr: 'Okul', osm: 'مدرسه', diff: 3, hint: 'okul' },
        { tr: 'Öğrenci', osm: 'طالب', diff: 3, hint: 'öğrenci', speakAlt: ['ogrenci'] },
        { tr: 'Hoca', osm: 'استاد', diff: 3, hint: 'hoca' },
        { tr: 'Vatan', osm: 'وطن', diff: 3, hint: 'vatan' },
        { tr: 'Millet', osm: 'ملت', diff: 3, hint: 'millet' },
        { tr: 'Devlet', osm: 'دولت', diff: 3, hint: 'devlet' },
        { tr: 'Sultan', osm: 'سلطان', diff: 3, hint: 'sultan' },
        { tr: 'Cami', osm: 'جامع', diff: 3, hint: 'cami', speakAlt: ['camii'] },
        { tr: 'Deniz', osm: 'دنيز', diff: 3, hint: 'deniz' },
        { tr: 'Köy', osm: 'كوى', diff: 3, hint: 'köy', speakAlt: ['koy'] },
        { tr: 'Şehir', osm: 'شهر', diff: 3, hint: 'şehir', speakAlt: ['sehir'] },
        { tr: 'Güneş', osm: 'كونش', diff: 3, hint: 'güneş', speakAlt: ['gunes'] },
        { tr: 'Ay', osm: 'آى', diff: 3, hint: 'ay' },
        { tr: 'Dost', osm: 'دوست', diff: 3, hint: 'dost' },
        { tr: 'İlim', osm: 'علم', diff: 4, hint: 'ilim', speakAlt: ['ilm'] },
        { tr: 'Adalet', osm: 'عدالت', diff: 4, hint: 'adalet' },
        { tr: 'Sabır', osm: 'صبر', diff: 4, hint: 'sabır', speakAlt: ['sabir'] },
        { tr: 'Rahmet', osm: 'رحمت', diff: 4, hint: 'rahmet', speakAlt: ['merhamet'] },
        { tr: 'Hikmet', osm: 'حكمت', diff: 4, hint: 'hikmet' },
    ];

    const WORDS = CORE_WORDS;

    function collectBlockTerms(wordOrTr) {
        const terms = [];
        if (typeof wordOrTr === 'string') {
            terms.push(wordOrTr);
        } else if (wordOrTr && typeof wordOrTr === 'object') {
            terms.push(wordOrTr.tr);
            if (wordOrTr.hint) terms.push(wordOrTr.hint);
            (wordOrTr.speakAlt || []).forEach((alt) => terms.push(alt));
        }
        const blocked = synonymBlockSet(terms);
        WORDS.forEach((w) => {
            const wTerms = [w.tr, w.hint, ...(w.speakAlt || [])].filter(Boolean);
            if (wTerms.some((t) => blocked.has(normQuizWord(t)))) {
                wTerms.forEach((t) => synonymBlockSet(t).forEach((x) => blocked.add(x)));
            }
        });
        return blocked;
    }

    function isBlockedWrongOption(optionTr, answerWord) {
        const blocked = collectBlockTerms(answerWord);
        return blocked.has(normQuizWord(optionTr));
    }

    const LETTERS = [
        { name: 'Elif', char: 'ا', diff: 2 },
        { name: 'Be', char: 'ب', diff: 2 },
        { name: 'Te', char: 'ت', diff: 2 },
        { name: 'Sin', char: 'س', diff: 2 },
        { name: 'Şın', char: 'ش', diff: 3 },
        { name: 'Sad', char: 'ص', diff: 3 },
        { name: 'Kaf', char: 'ق', diff: 3 },
        { name: 'Gim', char: 'گ', diff: 3 },
        { name: 'Pe', char: 'پ', diff: 3 },
        { name: 'Nun', char: 'ن', diff: 2 },
        { name: 'Mim', char: 'م', diff: 2 },
        { name: 'Lam', char: 'ل', diff: 2 },
        { name: 'He', char: 'ه', diff: 2 },
        { name: 'Vav', char: 'و', diff: 2 },
        { name: 'Ayn', char: 'ع', diff: 4 },
        { name: 'Gayn', char: 'غ', diff: 4 },
        { name: 'Fe', char: 'ف', diff: 3 },
        { name: 'Kef', char: 'ك', diff: 2 },
        { name: 'Cim', char: 'ج', diff: 2 },
        { name: 'Ha', char: 'ح', diff: 3 },
        { name: 'Dal', char: 'د', diff: 2 },
        { name: 'Re', char: 'ر', diff: 2 },
        { name: 'Zel', char: 'ز', diff: 3 },
        { name: 'Ze', char: 'ذ', diff: 4 },
    ];

    const SPEAK_ITEMS = CORE_WORDS.filter((w) => w.hint).map((w) => ({
        word: w.osm,
        hint: w.hint,
        speakMatch: [w.hint, ...(w.speakAlt || [])],
        diff: w.diff,
    }));

    /** En az 2 kelimelik cümleler — decoy'larda eş anlamlı yok */
    const TILE_PHRASES_OSM = [
        { osm: 'چای ایستیورم', parts: ['çay', 'istiyorum'], decoys: ['kitap', 'kalem', 'okulda', 'yazıyorum', 'evde', 'gidiyorum'], diff: 2 },
        { osm: 'آب ایستیورم', parts: ['su', 'istiyorum'], decoys: ['kitap', 'kalem', 'okulda', 'yazıyorum', 'evde', 'gidiyorum'], diff: 2 },
        { osm: 'گوزل كون', parts: ['güzel', 'gün'], decoys: ['kötü', 'gece', 'okulda', 'deniz', 'vatan', 'yazıyorum'], diff: 2 },
        { osm: 'او ايى', parts: ['ev', 'iyi'], decoys: ['kötü', 'kapı', 'deniz', 'vatan', 'okulda', 'yazıyorum'], diff: 2 },
        { osm: 'مدرسه ده اوكونييورم', parts: ['okulda', 'okuyorum'], decoys: ['evde', 'yazıyorum', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
        { osm: 'أشكرك', parts: ['teşekkür', 'ederim'], decoys: ['lütfen', 'evet', 'deniz', 'vatan', 'kapı', 'gidiyorum'], diff: 2 },
        { osm: 'أيام سعيدة', parts: ['iyi', 'günler'], decoys: ['kötü', 'gece', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'أهلا وسهلا', parts: ['hoş', 'geldiniz'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'كتاب اوقورم', parts: ['kitap', 'okuyorum'], decoys: ['yazıyorum', 'okulda', 'evde', 'gidiyorum', 'deniz', 'vatan'], diff: 2 },
        { osm: 'قلم يازرم', parts: ['kalem', 'yazıyorum'], decoys: ['okuyorum', 'okulda', 'evde', 'gidiyorum', 'deniz', 'vatan'], diff: 2 },
        { osm: 'لو سمحت آب', parts: ['lütfen', 'su'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'gidiyorum'], diff: 2 },
        { osm: 'آنه و بابا', parts: ['anne', 've', 'baba'], decoys: ['çocuk', 'deniz', 'vatan', 'kapı', 'gidiyorum', 'yazıyorum'], diff: 2 },
        { osm: 'وطن سوریورم', parts: ['vatan', 'seviyorum'], decoys: ['gidiyorum', 'okuyorum', 'yazıyorum', 'deniz', 'kapı', 'evde'], diff: 3 },
        { osm: 'ملت و وطن', parts: ['millet', 've', 'vatan'], decoys: ['sultan', 'gidiyorum', 'okuyorum', 'deniz', 'kapı', 'evde'], diff: 4 },
        { osm: 'دين و ايمان', parts: ['din', 've', 'iman'], decoys: ['cami', 'namaz', 'gidiyorum', 'deniz', 'kapı', 'evde'], diff: 4 },
        { osm: 'مساء الخير', parts: ['iyi', 'akşamlar'], decoys: ['kötü', 'gece', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 3 },
        { osm: 'مع السلامة', parts: ['güle', 'güle'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'او ده اوكونييورم', parts: ['evde', 'okuyorum'], decoys: ['okulda', 'yazıyorum', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
    ];

    const SKIP_PHRASES = [
        'su an konusamam',
        'suan konusamam',
        'simdi konusamam',
        'konusamiyorum',
        'ses veremiyorum',
        'su an konusamiyorum',
    ];

    window.LISANI_QUIZ_META = {
        card: { label: 'Eşleştir', icon: 'link' },
        letter: { label: 'Harf', icon: 'type' },
        speak: { label: 'Konuş', icon: 'mic' },
        tiles: { label: 'Cümle Kur', icon: 'layout-grid' },
    };

    function pickWrong(answerWord, pool, diff, n) {
        const answerTr = typeof answerWord === 'string' ? answerWord : answerWord.tr;
        const blocked = collectBlockTerms(answerWord);
        const isEligible = (w, spread) =>
            w.tr !== answerTr && !blocked.has(normQuizWord(w.tr)) && Math.abs(w.diff - diff) <= spread + 1;

        for (const spread of [0, 1, 2, 4, 8]) {
            const candidates = pool.filter((w) => isEligible(w, spread));
            if (candidates.length >= n) {
                return shuffle(candidates)
                    .slice(0, n)
                    .map((w) => w.tr);
            }
        }

        const fallback = pool.filter((w) => w.tr !== answerTr && !blocked.has(normQuizWord(w.tr)));
        return shuffle(fallback)
            .slice(0, n)
            .map((w) => w.tr);
    }

    function mkCard(w) {
        const wrong = pickWrong(w, WORDS, w.diff, 3);
        const options = shuffle([w.tr, ...wrong]);
        return {
            type: 'card',
            word: w.osm,
            prompt: CARD,
            options,
            answer: w.tr,
            difficulty: w.diff,
        };
    }

    function mkLetter(l) {
        const wrong = shuffle(LETTERS.filter((x) => x.name !== l.name))
            .slice(0, 3)
            .map((x) => x.name);
        return {
            type: 'letter',
            word: l.char,
            prompt: LETTER,
            options: shuffle([l.name, ...wrong]),
            answer: l.name,
            difficulty: l.diff,
        };
    }

    function mkSpeak(s) {
        return {
            type: 'speak',
            word: s.word,
            speakHint: s.hint,
            prompt: SPEAK,
            speakMatch: s.speakMatch,
            skipPhrases: SKIP_PHRASES,
            difficulty: s.diff,
        };
    }

    function mkTiles(p) {
        const parts = p.parts.slice();
        const tiles = parts.slice();
        const safeDecoys = filterTileDecoys(parts, p.decoys);
        const decoys = shuffle(safeDecoys);
        for (const d of decoys) {
            if (tiles.length >= 10) break;
            tiles.push(d);
        }
        return {
            type: 'tiles',
            word: p.osm,
            prompt: TILES,
            tiles: shuffle(tiles),
            answerOrder: parts,
            difficulty: p.diff,
        };
    }

    function validateQuestionBank() {
        const osmMap = new Map();
        const trMap = new Map();
        WORDS.forEach((w) => {
            if (osmMap.has(w.osm)) throw new Error(`Kart osm tekrarı: ${w.osm}`);
            if (trMap.has(w.tr)) throw new Error(`Türkçe tekrarı: ${w.tr}`);
            osmMap.set(w.osm, w.tr);
            trMap.set(w.tr, w.osm);
        });

        WORDS.forEach((w) => {
            const card = mkCard(w);
            if (!card.options.includes(card.answer)) throw new Error(`Cevap yok: ${w.osm}`);
            if (card.options.length !== 4) throw new Error(`4 şık yok: ${w.osm}`);
            if (new Set(card.options).size !== 4) throw new Error(`Tekrarlı şık: ${w.osm}`);
            card.options.forEach((opt) => {
                if (opt !== card.answer && isBlockedWrongOption(opt, w)) {
                    throw new Error(`Eş anlamlı yanlış şık: ${opt} (${w.osm} → ${w.tr})`);
                }
            });
        });

        LETTERS.forEach((l) => {
            const q = mkLetter(l);
            if (!q.options.includes(q.answer) || q.options.length !== 4) {
                throw new Error(`Harf hatası: ${l.char}`);
            }
        });

        TILE_PHRASES_OSM.forEach((p) => {
            if (p.parts.length < 2) throw new Error(`Cümle en az 2 kelime olmalı: ${p.osm}`);
            const built = mkTiles(p);
            p.parts.forEach((part) => {
                if (!built.tiles.includes(part)) throw new Error(`Kutucuk eksik: ${part}`);
            });
            const blocked = synonymBlockSet(p.parts);
            built.tiles.forEach((t) => {
                if (!p.parts.includes(t) && blocked.has(normQuizWord(t))) {
                    throw new Error(`Eş anlamlı decoy: ${t} (${p.osm})`);
                }
            });
        });
    }

    validateQuestionBank();

    window.LISANI_POOLS = {
        card: WORDS.map(mkCard),
        letter: LETTERS.map(mkLetter),
        speak: SPEAK_ITEMS.map(mkSpeak),
        tiles: TILE_PHRASES_OSM.map(mkTiles),
    };

    window.LISANI_MIX_PATTERN = [
        'card', 'card', 'card', 'letter', 'speak', 'card',
        'tiles', 'card', 'letter', 'card', 'speak', 'card',
        'tiles', 'card', 'letter', 'card', 'speak', 'tiles',
        'card', 'card',
    ];

    window.LISANI_STEP_PATTERNS = [
        ['card', 'letter', 'card', 'speak'],
        ['letter', 'card', 'tiles', 'card'],
        ['speak', 'card', 'letter', 'tiles'],
        ['tiles', 'letter', 'card', 'speak'],
        ['card', 'tiles', 'speak', 'letter'],
    ];
    window.LISANI_QUESTIONS_PER_STEP = 4;
    window.LISANI_BOLUM_STEPS = 5;

    window.LISANI_BOLUMLER = [
        { id: 'kelimeler', title: 'Temel', desc: '5 test · tur başına 5 soru', icon: 'T', color: 1, sessionSize: 5, baseDiff: 2 },
        { id: 'harfler', title: 'Orta', desc: '5 test · tur başına 7 soru', icon: 'O', color: 2, sessionSize: 7, baseDiff: 3 },
        { id: 'eslestirme', title: 'İleri', desc: '5 test · tur başına 9 soru', icon: 'İ', color: 3, sessionSize: 9, baseDiff: 3 },
        { id: 'ceviri', title: 'Uzman', desc: '5 test · tur başına 10 soru', icon: 'U', color: 1, sessionSize: 10, baseDiff: 4 },
        { id: 'ses', title: 'Usta', desc: '5 test · tur başına 12 soru', icon: '★', color: 2, sessionSize: 12, baseDiff: 4 },
    ];

    window.LISANI_BOLUM_INDEX = { kelimeler: 1, harfler: 2, eslestirme: 3, ceviri: 4, ses: 5 };
    window.LISANI_QUIZ_BANK = {};
    window.LISANI_BOLUMLER.forEach((b) => { window.LISANI_QUIZ_BANK[b.id] = []; });

    window.LISANI_CARD_PROMPT = CARD;
    window.LISANI_SPEAK_PROMPT = SPEAK;
    window.LISANI_TILES_PROMPT = TILES;
    window.LISANI_SKIP_SPEAK_LABEL = 'Şuan konuşamam';
    window.LISANI_SPEAK_LISTEN_SEC = 14;
})();
