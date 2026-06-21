/**
 * Lisani — Soru bankası (lisani-osm-translate.js OSM_WORDS ile birebir uyumlu)
 */
(function () {
    'use strict';

    const CARD = 'Resme bak · doğru Türkçe karşılığı seç';
    const LETTER = 'Harf adını seçin';
    const MATCH = 'Resimleri Osmanlıca yazılışlarıyla eşleştir';
    const TILES = 'Kelimeleri sırayla seçerek Türkçe cümle kurun';
    const SPEAK = 'Osmanlıca kelimeyi gör · Türkçe oku';

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
        ['günaydın', 'gunaydin', 'iyi günler', 'iyi gunler', 'iyi akşamlar', 'iyi aksamlar', 'iyi geceler'],
        ['teşekkürler', 'tesekkurler', 'teşekkür ederim', 'tesekkur ederim'],
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

    /** osm = Osmanlıca (Arap harfleriyle Türkçe) · tr = ekranda Türkçe · hint = konuşma tanıma */
    const CORE_WORDS = [
        { tr: 'Merhaba', osm: 'مرحبا', diff: 1, hint: 'merhaba' },
        { tr: 'Selam', osm: 'سلام', diff: 1, hint: 'selam' },
        { tr: 'Teşekkürler', osm: 'تشكر', diff: 1, hint: 'teşekkürler', speakAlt: ['tesekkurler'] },
        { tr: 'Lütfen', osm: 'لطفاً', diff: 1, hint: 'lütfen', speakAlt: ['lutfen'] },
        { tr: 'Evet', osm: 'أيوه', diff: 1, hint: 'evet' },
        { tr: 'Hayır', osm: 'يوخ', diff: 1, hint: 'hayır', speakAlt: ['hayir'] },
        { tr: 'Su', osm: 'آب', diff: 1, hint: 'su' },
        { tr: 'Çay', osm: 'چای', diff: 1, hint: 'çay', speakAlt: ['cay'] },
        { tr: 'Kahve', osm: 'قهوه', diff: 1, hint: 'kahve' },
        { tr: 'Kitap', osm: 'كتاب', diff: 1, hint: 'kitap' },
        { tr: 'Kalem', osm: 'قلم', diff: 1, hint: 'kalem' },
        { tr: 'Defter', osm: 'دفتر', diff: 1, hint: 'defter' },
        { tr: 'Ev', osm: 'آو', diff: 1, hint: 'ev' },
        { tr: 'Kapı', osm: 'قاپی', diff: 1, hint: 'kapı', speakAlt: ['kapi'] },
        { tr: 'Kalp', osm: 'قلب', diff: 1, hint: 'kalp' },
        { tr: 'Göz', osm: 'گوز', diff: 1, hint: 'göz', speakAlt: ['goz'] },
        { tr: 'El', osm: 'ال', diff: 1, hint: 'el' },
        { tr: 'Anne', osm: 'آنه', diff: 1, hint: 'anne' },
        { tr: 'Baba', osm: 'بابا', diff: 1, hint: 'baba' },
        { tr: 'Günaydın', osm: 'گوناي دين', diff: 1, hint: 'günaydın', speakAlt: ['gunaydin', 'sabah'] },
        { tr: 'Güzel', osm: 'گوزل', diff: 1, hint: 'güzel', speakAlt: ['guzel'] },
        { tr: 'İyi', osm: 'ايى', diff: 1, hint: 'iyi' },
        { tr: 'Kuş', osm: 'قوش', diff: 1, hint: 'kuş', speakAlt: ['kus'] },
        { tr: 'Kedi', osm: 'قطة', diff: 1, hint: 'kedi' },
        { tr: 'At', osm: 'آت', diff: 1, hint: 'at' },
        { tr: 'Okul', osm: 'مدرسه', diff: 3, hint: 'okul' },
        { tr: 'Öğrenci', osm: 'طالب', diff: 3, hint: 'öğrenci', speakAlt: ['ogrenci'] },
        { tr: 'Hoca', osm: 'خوجه', diff: 3, hint: 'hoca' },
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
        { tr: 'Din', osm: 'دين', diff: 4, hint: 'din' },
        { tr: 'İman', osm: 'ايمان', diff: 4, hint: 'iman' },
        { tr: 'İlim', osm: 'علم', diff: 4, hint: 'ilim', speakAlt: ['ilm'] },
        { tr: 'Adalet', osm: 'عدالت', diff: 4, hint: 'adalet' },
        { tr: 'Sabır', osm: 'صبر', diff: 4, hint: 'sabır', speakAlt: ['sabir'] },
        { tr: 'Rahmet', osm: 'رحمت', diff: 4, hint: 'rahmet', speakAlt: ['merhamet'] },
        { tr: 'Hikmet', osm: 'حكمت', diff: 4, hint: 'hikmet' },
        { tr: 'Takva', osm: 'تقوى', diff: 5, hint: 'takva' },
        { tr: 'Tevekkül', osm: 'توكل', diff: 5, hint: 'tevekkül', speakAlt: ['tevekkul'] },
        { tr: 'İhsan', osm: 'احسان', diff: 5, hint: 'ihsan' },
        { tr: 'Fütüvvet', osm: 'فتوة', diff: 5, hint: 'fütüvvet', speakAlt: ['futuvvet'] },
        { tr: 'Hakikat', osm: 'حقيقة', diff: 5, hint: 'hakikat' },
        { tr: 'Batıl', osm: 'باطل', diff: 5, hint: 'batıl', speakAlt: ['batil'] },
        { tr: 'Zahir', osm: 'ظاهر', diff: 5, hint: 'zahir' },
        { tr: 'Bâtın', osm: 'باطن', diff: 5, hint: 'bâtın', speakAlt: ['batin', 'batın'] },
        { tr: 'Mülk', osm: 'ملك', diff: 5, hint: 'mülk', speakAlt: ['mulk'] },
        { tr: 'Melekût', osm: 'ملكوت', diff: 6, hint: 'melekût', speakAlt: ['melekut'] },
        { tr: 'Kader', osm: 'قدر', diff: 5, hint: 'kader' },
        { tr: 'Kaza', osm: 'قضاء', diff: 5, hint: 'kaza' },
        { tr: 'Şefaat', osm: 'شفاعة', diff: 6, hint: 'şefaat', speakAlt: ['sefaat'] },
        { tr: 'İstiğfar', osm: 'استغفار', diff: 6, hint: 'istiğfar', speakAlt: ['istigfar'] },
        { tr: 'Tefekkür', osm: 'تفكر', diff: 6, hint: 'tefekkür', speakAlt: ['tefekkur'] },
        { tr: 'Marifet', osm: 'معرفة', diff: 6, hint: 'marifet' },
        { tr: 'Muhabbet', osm: 'محبة', diff: 6, hint: 'muhabbet' },
    ];

    function wordDifficulty(w) {
        return w?.difficulty ?? w?.diff ?? 2;
    }

    function isQuizVocabKey(key, osm) {
        if (!key || !osm) return false;
        if (key.length < 3 || key.length > 40) return false;
        if ((key.match(/\s/g) || []).length > 3) return false;
        if (/[0-9\[\](){}]/.test(key)) return false;
        if (!/[\u0600-\u06FF]/.test(osm)) return false;
        if (osm.length > 55) return false;
        return true;
    }

    function guessWordDiff(tr, osm) {
        const t = String(tr || '').replace(/\s/g, '').length;
        const o = String(osm || '').replace(/\s/g, '').length;
        if (t <= 4 && o <= 5) return 1;
        if (t <= 7 && o <= 9) return 2;
        if (t <= 11 && o <= 14) return 3;
        if (t <= 16 && o <= 20) return 4;
        if (t <= 22 && o <= 28) return 5;
        return 6;
    }

    function vocabToWord(tr, osm) {
        const key = normQuizWord(tr);
        if (!isQuizVocabKey(key, osm)) return null;
        const hint = key;
        const entry = {
            tr: tr.charAt(0).toLocaleUpperCase('tr-TR') + tr.slice(1),
            osm,
            diff: guessWordDiff(tr, osm),
            difficulty: guessWordDiff(tr, osm),
            hint,
        };
        return entry;
    }

    function mergeExtendedWords(core) {
        const byOsm = new Map();
        core.forEach((w) => {
            const d = wordDifficulty(w);
            byOsm.set(w.osm, { ...w, diff: w.diff ?? d, difficulty: d });
        });

        function ingestMap(map) {
            if (!map || typeof map !== 'object') return;
            Object.entries(map).forEach(([tr, osm]) => {
                if (!osm || byOsm.has(osm)) return;
                const w = vocabToWord(tr, osm);
                if (w) byOsm.set(osm, w);
            });
        }

        ingestMap(window.LISANI_OSM_VOCABULARY);

        const semazenQuiz = window.LISANI_SEMAZEN_QUIZ_WORDS;
        if (Array.isArray(semazenQuiz)) {
            semazenQuiz.forEach((w) => {
                if (!w?.osm || byOsm.has(w.osm)) return;
                const d = wordDifficulty(w);
                byOsm.set(w.osm, { ...w, diff: w.diff ?? d, difficulty: d });
            });
        } else {
            ingestMap(window.LISANI_SEMAZEN_VOCABULARY);
        }

        return [...byOsm.values()];
    }

    const WORDS = mergeExtendedWords(CORE_WORDS);

    const WORDS_BY_DIFF = {};
    WORDS.forEach((w) => {
        const d = wordDifficulty(w);
        if (!WORDS_BY_DIFF[d]) WORDS_BY_DIFF[d] = [];
        WORDS_BY_DIFF[d].push(w);
    });

    /** Kelime → emoji (eşleştirme ve görsel kartlar) */
    const WORD_EMOJI = {
        merhaba: '👋',
        selam: '👋',
        teşekkürler: '🙏',
        tesekkurler: '🙏',
        su: '💧',
        çay: '🍵',
        cay: '🍵',
        kahve: '☕',
        kitap: '📖',
        kalem: '✏️',
        defter: '📓',
        ev: '🏠',
        kapı: '🚪',
        kapi: '🚪',
        kedi: '🐱',
        kuş: '🐦',
        kus: '🐦',
        at: '🐴',
        el: '✋',
        göz: '👁️',
        goz: '👁️',
        kalp: '❤️',
        anne: '👩',
        baba: '👨',
        okul: '🏫',
        cami: '🕌',
        camii: '🕌',
        güneş: '☀️',
        gunes: '☀️',
        ay: '🌙',
        deniz: '🌊',
        güzel: '🌸',
        guzel: '🌸',
        çocuk: '👶',
        cocuk: '👶',
        ekmek: '🍞',
    };

    const CURATED_MATCH_SETS = [
        ['kahve', 'kedi', 'kitap'],
        ['kahve', 'çay', 'su'],
        ['kedi', 'kuş', 'at'],
        ['kitap', 'kalem', 'defter'],
        ['ev', 'kalp', 'el'],
        ['anne', 'baba', 'göz'],
        ['okul', 'cami', 'güneş'],
        ['deniz', 'ay', 'güzel'],
        ['merhaba', 'teşekkürler', 'evet'],
        ['ilim', 'adalet', 'rahmet'],
        ['takva', 'tevekkül', 'sabır'],
        ['hakikat', 'batıl', 'zahir'],
        ['kader', 'kaza', 'takva'],
        ['muhabbet', 'marifet', 'tefekkür'],
        ['ilim', 'hikmet', 'adalet'],
        ['rahmet', 'sabır', 'ihsan'],
        ['melekût', 'mülk', 'devlet'],
    ];

    function wordEmoji(w) {
        const keys = [w.tr, w.hint, ...(w.speakAlt || [])].filter(Boolean);
        for (let i = 0; i < keys.length; i++) {
            const e = WORD_EMOJI[normQuizWord(keys[i])];
            if (e) return e;
        }
        return '📖';
    }

    function findWordByTr(tr) {
        const n = normQuizWord(tr);
        return WORDS.find((w) => normQuizWord(w.tr) === n) || null;
    }

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
        { name: 'Elif', char: 'ا', diff: 1 },
        { name: 'Be', char: 'ب', diff: 1 },
        { name: 'Te', char: 'ت', diff: 1 },
        { name: 'Sin', char: 'س', diff: 1 },
        { name: 'Nun', char: 'ن', diff: 1 },
        { name: 'Mim', char: 'م', diff: 1 },
        { name: 'Lam', char: 'ل', diff: 1 },
        { name: 'He', char: 'ه', diff: 1 },
        { name: 'Vav', char: 'و', diff: 1 },
        { name: 'Dal', char: 'د', diff: 1 },
        { name: 'Re', char: 'ر', diff: 1 },
        { name: 'Kef', char: 'ك', diff: 1 },
        { name: 'Cim', char: 'ج', diff: 1 },
        { name: 'Fe', char: 'ف', diff: 2 },
        { name: 'Ha', char: 'ح', diff: 2 },
        { name: 'Şın', char: 'ش', diff: 2 },
        { name: 'Sad', char: 'ص', diff: 3 },
        { name: 'Kaf', char: 'ق', diff: 3 },
        { name: 'Gim', char: 'گ', diff: 3 },
        { name: 'Pe', char: 'پ', diff: 3 },
        { name: 'Zel', char: 'ز', diff: 3 },
        { name: 'Ayn', char: 'ع', diff: 4 },
        { name: 'Gayn', char: 'غ', diff: 4 },
        { name: 'Ze', char: 'ذ', diff: 4 },
    ];

    const SPEAK_ITEMS = CORE_WORDS.filter((w) => w.hint).map((w) => ({
        word: w.osm,
        hint: w.hint,
        speakMatch: [w.hint, ...(w.speakAlt || [])],
        diff: w.diff,
    }));

    /** En az 2 kelimelik cümleler — Osmanlıca yazım (Arapça değil) */
    const TILE_PHRASES_OSM = [
        { osm: 'چای ايستييورم', parts: ['çay', 'istiyorum'], decoys: ['kitap', 'kalem', 'okulda', 'yazıyorum', 'evde', 'gidiyorum'], diff: 2 },
        { osm: 'آب ايستييورم', parts: ['su', 'istiyorum'], decoys: ['kitap', 'kalem', 'okulda', 'yazıyorum', 'evde', 'gidiyorum'], diff: 2 },
        { osm: 'گوزل كون', parts: ['güzel', 'gün'], decoys: ['kötü', 'gece', 'okulda', 'deniz', 'vatan', 'yazıyorum'], diff: 2 },
        { osm: 'آو ايى', parts: ['ev', 'iyi'], decoys: ['kötü', 'kapı', 'deniz', 'vatan', 'okulda', 'yazıyorum'], diff: 2 },
        { osm: 'مدرسه ده اوقونييورم', parts: ['okulda', 'okuyorum'], decoys: ['evde', 'yazıyorum', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
        { osm: 'تشكر ايدرم', parts: ['teşekkür', 'ederim'], decoys: ['lütfen', 'evet', 'deniz', 'vatan', 'kapı', 'gidiyorum'], diff: 2 },
        { osm: 'ايى گونلر', parts: ['iyi', 'günler'], decoys: ['kötü', 'gece', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'خوش گلدينيز', parts: ['hoş', 'geldiniz'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'كتاب اوقونييورم', parts: ['kitap', 'okuyorum'], decoys: ['yazıyorum', 'okulda', 'evde', 'gidiyorum', 'deniz', 'vatan'], diff: 2 },
        { osm: 'قلم يازييورم', parts: ['kalem', 'yazıyorum'], decoys: ['okuyorum', 'okulda', 'evde', 'gidiyorum', 'deniz', 'vatan'], diff: 2 },
        { osm: 'لطفاً آب', parts: ['lütfen', 'su'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'gidiyorum'], diff: 2 },
        { osm: 'آنه و بابا', parts: ['anne', 've', 'baba'], decoys: ['çocuk', 'deniz', 'vatan', 'kapı', 'gidiyorum', 'yazıyorum'], diff: 2 },
        { osm: 'وطن سورييورم', parts: ['vatan', 'seviyorum'], decoys: ['gidiyorum', 'okuyorum', 'yazıyorum', 'deniz', 'kapı', 'evde'], diff: 3 },
        { osm: 'ملت و وطن', parts: ['millet', 've', 'vatan'], decoys: ['sultan', 'gidiyorum', 'okuyorum', 'deniz', 'kapı', 'evde'], diff: 4 },
        { osm: 'دين و ايمان', parts: ['din', 've', 'iman'], decoys: ['cami', 'namaz', 'gidiyorum', 'deniz', 'kapı', 'evde'], diff: 4 },
        { osm: 'ايى آخشام', parts: ['iyi', 'akşamlar'], decoys: ['kötü', 'gece', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 3 },
        { osm: 'گله گله', parts: ['güle', 'güle'], decoys: ['evet', 'hayır', 'deniz', 'vatan', 'kapı', 'yazıyorum'], diff: 2 },
        { osm: 'آو ده اوقونييورم', parts: ['evde', 'okuyorum'], decoys: ['okulda', 'yazıyorum', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
        { osm: 'چای و قهوه', parts: ['çay', 've', 'kahve'], decoys: ['su', 'kitap', 'kalem', 'evde', 'gidiyorum', 'okuyorum'], diff: 2 },
        { osm: 'كتاب اوقونييورم آو ده', parts: ['kitap', 'okuyorum', 'evde'], decoys: ['okulda', 'yazıyorum', 'gidiyorum', 'kalem', 'çay', 'kahve'], diff: 2 },
        { osm: 'قلم يازييورم مدرسه ده', parts: ['kalem', 'yazıyorum', 'okulda'], decoys: ['okuyorum', 'evde', 'gidiyorum', 'kitap', 'çay', 'su'], diff: 2 },
        { osm: 'گوناي دين يا دوست', parts: ['günaydın', 'ya', 'dost'], decoys: ['iyi', 'günler', 'akşamlar', 'geceler', 'merhaba', 'selam'], diff: 2 },
        { osm: 'بوگون ناصل سين', parts: ['bugün', 'nasılsın'], decoys: ['merhaba', 'selam', 'iyi', 'günler', 'teşekkür', 'ederim'], diff: 2 },
        { osm: 'ايييم الحمد', parts: ['iyiyim', 'hamdolsun'], decoys: ['merhaba', 'selam', 'teşekkür', 'ederim', 'günaydın', 'hoş'], diff: 3 },
        { osm: 'سلام عليكم', parts: ['selamün', 'aleyküm'], decoys: ['merhaba', 'selam', 'hoş', 'geldiniz', 'günaydın', 'iyi'], diff: 3 },
        { osm: 'عليكم سلام', parts: ['aleyküm', 'selam'], decoys: ['merhaba', 'hoş', 'geldiniz', 'günaydın', 'iyi', 'günler'], diff: 3 },
        { osm: 'ايى گونلر ديلييورم', parts: ['iyi', 'günler', 'dilerim'], decoys: ['akşamlar', 'geceler', 'günaydın', 'merhaba', 'selam', 'hoş'], diff: 3 },
        { osm: 'بن طالبم', parts: ['ben', 'öğrenciyim'], decoys: ['okuyorum', 'yazıyorum', 'okulda', 'evde', 'gidiyorum', 'kitap'], diff: 3 },
        { osm: 'بو گوزل كتاب', parts: ['bu', 'güzel', 'kitap'], decoys: ['kalem', 'defter', 'okuyorum', 'yazıyorum', 'evde', 'okulda'], diff: 3 },
        { osm: 'مدرسه يه گيدييورم', parts: ['okula', 'gidiyorum'], decoys: ['evde', 'okuyorum', 'yazıyorum', 'kitap', 'kalem', 'çay'], diff: 3 },
        { osm: 'وطنمى سورييورم', parts: ['vatanımı', 'seviyorum'], decoys: ['millet', 'devlet', 'sultan', 'gidiyorum', 'okuyorum', 'yazıyorum'], diff: 3 },
        { osm: 'علم نور', parts: ['ilim', 'nur'], decoys: ['hikmet', 'sabır', 'adalet', 'rahmet', 'gidiyorum', 'okuyorum'], diff: 4 },
        { osm: 'صبر ایله كاپيلر آچيلير', parts: ['sabırla', 'kapılar', 'açılır'], decoys: ['ilim', 'hikmet', 'adalet', 'rahmet', 'gidiyorum', 'okuyorum'], diff: 4 },
        { osm: 'عدالت و رحمت', parts: ['adalet', 've', 'rahmet'], decoys: ['ilim', 'hikmet', 'sabır', 'din', 'iman', 'vatan'], diff: 4 },
        { osm: 'كتاب و قلم', parts: ['kitap', 've', 'kalem'], decoys: ['defter', 'okulda', 'yazıyorum', 'evde', 'gidiyorum', 'deniz'], diff: 2 },
        { osm: 'آنه و بابا ايى', parts: ['anne', 've', 'baba', 'iyi'], decoys: ['kötü', 'ev', 'kapı', 'gidiyorum', 'deniz', 'vatan'], diff: 3 },
        { osm: 'مدرسه ده كتاب اوقونييورم', parts: ['okulda', 'kitap', 'okuyorum'], decoys: ['evde', 'yazıyorum', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
        { osm: 'قلم يازييورم آو ده', parts: ['kalem', 'yazıyorum', 'evde'], decoys: ['okuyorum', 'okulda', 'gidiyorum', 'deniz', 'vatan', 'kapı'], diff: 3 },
        { osm: 'وطن و ملت سورييورم', parts: ['vatan', 've', 'millet', 'seviyorum'], decoys: ['gidiyorum', 'okuyorum', 'deniz', 'kapı', 'evde', 'sultan'], diff: 4 },
        { osm: 'دولت و سلطان', parts: ['devlet', 've', 'sultan'], decoys: ['vatan', 'millet', 'gidiyorum', 'okuyorum', 'deniz', 'kapı'], diff: 4 },
        { osm: 'علم و حكمت و صبر', parts: ['ilim', 've', 'hikmet', 've', 'sabır'], decoys: ['adalet', 'rahmet', 'gidiyorum', 'okuyorum', 'deniz', 'vatan'], diff: 5 },
        { osm: 'حكمت و علم', parts: ['hikmet', 've', 'ilim'], decoys: ['sabır', 'adalet', 'rahmet', 'gidiyorum', 'okuyorum', 'deniz'], diff: 5 },
        { osm: 'دين و ايمان و صبر', parts: ['din', 've', 'iman', 've', 'sabır'], decoys: ['cami', 'ilim', 'hikmet', 'gidiyorum', 'okuyorum', 'deniz'], diff: 5 },
        { osm: 'توكل و صبر و علم', parts: ['tevekkül', 've', 'sabır', 've', 'ilim'], decoys: ['takva', 'ihsan', 'adalet', 'rahmet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'حقيقة و باطل', parts: ['hakikat', 've', 'batıl'], decoys: ['zahir', 'bâtın', 'ilim', 'hikmet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'ظاهر و باطن', parts: ['zahir', 've', 'bâtın'], decoys: ['hakikat', 'batıl', 'ilim', 'hikmet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'ملك و ملكوت', parts: ['mülk', 've', 'melekût'], decoys: ['devlet', 'sultan', 'vatan', 'millet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'قدر و قضاء', parts: ['kader', 've', 'kaza'], decoys: ['takva', 'tevekkül', 'ilim', 'hikmet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'استغفار و شفاعة', parts: ['istiğfar', 've', 'şefaat'], decoys: ['takva', 'ihsan', 'rahmet', 'adalet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'تفكر و معرفة و محبة', parts: ['tefekkür', 've', 'marifet', 've', 'muhabbet'], decoys: ['ilim', 'hikmet', 'sabır', 'adalet', 'gidiyorum', 'okuyorum'], diff: 6 },
        { osm: 'تقوى و احسان و صبر', parts: ['takva', 've', 'ihsan', 've', 'sabır'], decoys: ['tevekkül', 'fütüvvet', 'adalet', 'rahmet', 'gidiyorum', 'okuyorum'], diff: 6 },
    ];

    const GRAMMAR_PROMPT = 'Dil bilgisi — doğru seçeneği işaretleyin';

    /** Uzman/Usta öncesi kısa hazırlık notları */
    const GRAMMAR_TOPICS = {
        irab: 'İ\'rab: İsim/fiil sonundaki hareke — merfû\' (üstün), mansûb (fetha), mecrûr (kesre), meczûm (sükûn).',
        harficer: 'Harf-i cer / ekler: Sonraki ismi cer yapar. Sık gördüklerin: دن (den), ده (içinde), اوزرنده (üzerinde), ile (ile), e/ait (için).',
        fiil: 'Fiil kipleri: Mâzî (geçmiş), muzâri (şimdiki/geniş), emir, nehy. Mastar fiil isim gibi kullanılır.',
        izafet: 'İzafet tamlaması: Birinci kelime (mudâf) + ikinci kelime (mudâf ileyh). İkinci kelime genelde cer alır.',
        tenvin: 'Tenvin (ـٌ ـٍ ـً): «bir» anlamı verir; cümledeki göreve göre hareke değişir.',
        nefy: 'Olumsuzluk: -miyor/-mez (genel), -madı/-medi (geçmişte olmama), يوخ/دگل (olumsuz edat).',
        sifat: 'Sıfat: Nitelediği isimle aynı hâl, tâyin ve cemiyette uyumlu olmalıdır.',
        kalin: 'Kalın-ince: ص ض ط ظ ق غ خ gibi harfler kalın okunur; önceki sesli harfe göre kalınlık değişir.',
        zamir: 'Zamirler: كيم (kim), نه (ne), بو (bu), آن (şu/o) — cümlede ismin yerini tutar.',
        tekid: 'Tekid: محقّقكه / حقّاً pekiştirir; isim cümlesinde mübtedâ-haber ilişkisini güçlendirir.',
    };

    const GRAMMAR_TOPIC_DETAILS = {
        irab: {
            detail: 'İ\'rab, kelimenin cümledeki görevine göre sonunda aldığı hareke veya sükûndur. İsimler merfû\' (raf), mansûb (nasb), mecrûr (cer) olabilir; fiiller meczûm (cezm) de alır.',
            examples: [
                'طالب — öğrenci (merfû\', mübtedâ)',
                'طالبی — öğrenciyi (mansûb, mef\'ûl)',
                'طالبده — öğrencide (mecrûr, -de eki sonrası)',
            ],
        },
        harficer: {
            detail: 'Harf-i cer (edat) sonraki ismi cer yapar ve genelde «-de, -den, -e, ile» gibi anlamlar taşır. Cümlede yer-yön veya aidiyet ilişkisi kurar.',
            examples: [
                'آودن — evden',
                'مدرسه ده — okulda',
                'ميز اوزرنده — masanın üzerinde',
                'قلم ايله — kalemle',
            ],
        },
        fiil: {
            detail: 'Osmanlıca fiiller kök + ek ile çekilir. Mâzî (geçmiş: -dı/-di), muzâri (şimdiki: -yor), emir (-!, -iniz) kipleridir. Mastar (-mak/-mek) isim gibi kullanılabilir.',
            examples: [
                'يازدى — yazdı (mâzî)',
                'يازييور — yazar / yazıyor (muzâri)',
                'ياز! — yaz! (emir)',
                'يازمق — yazma (mastar)',
            ],
        },
        izafet: {
            detail: 'İzafet tamlamasında birinci kelime (mudâf) sahipsiz kalır; ikinci kelime (mudâf ileyh) tamamlar ve genelde cer alır. Türkçede «-in» eki karşılığı düşünülebilir.',
            examples: [
                'طالب كتابى — öğrencinin kitabı',
                'آو قاپيسى — evin kapısı',
                'علما مدرسه‌سی — alimlerin okulu',
            ],
        },
        tenvin: {
            detail: 'Tenvin (ـٌ ـٍ ـً) «bir» anlamı katar. İsmin cümledeki i\'rabına göre üstün, kesre veya fetha biçiminde görülür; belirsiz tekil isimlerde sık kullanılır.',
            examples: [
                'بر كتاب — bir kitap (merfû\')',
                'بر طالب — bir öğrenciyi (mansûb)',
                'بر آودن — bir evden (mecrûr)',
            ],
        },
        nefy: {
            detail: 'Olumsuzluk Osmanlıca/Türkçede farklı eklerle kurulur. -miyor genel olumsuzluk; -madı geçmişte olmama; يوخ/دگل edatları da kullanılır.',
            examples: [
                'يازمييور — yazmıyor',
                'يازمدى — yazmadı',
                'گيتمدى — gitmedi',
            ],
        },
        sifat: {
            detail: 'Sıfat, nitelediği isimle tür, sayı ve i\'rab bakımından uyumlu olmalıdır. Osmanlıca metinlerde sıfat genelde nitelenen isimden önce veya sonra gelebilir.',
            examples: [
                'گوزل بر كتاب — güzel bir kitap',
                'مجتهد طالب — çalışkan öğrenci',
                'بويوك بر آو — büyük bir ev',
            ],
        },
        kalin: {
            detail: 'Kalın harfler (ص ض ط ظ ق غ خ ve benzeri) okunuşta boğazın arka kısmından çıkar. Önceki sesli harfe göre kalın veya ince okunabilir.',
            examples: [
                'قَلَم — kalem (kalın ق)',
                'صَبْر — sabır (kalın ص)',
                'خَيْر — hayır / iyilik (kalın خ)',
            ],
        },
        zamir: {
            detail: 'Zamirler ismin yerini tutar. Soru zamirleri كيم (kim) ve نه (ne); işaret zamirleri بو (bu), آن (şu/o) sık görülür.',
            examples: [
                'كيم سن؟ — sen kimsin?',
                'بو نه؟ — bu nedir?',
                'آن بر كتاب — şu bir kitaptır',
            ],
        },
        tekid: {
            detail: 'محقّقكه ve benzeri tekid sözleri cümleye pekiştirme katar. İsim cümlesinde mübtedâ ile haber arasındaki ilişkiyi güçlendirir; çeviride «şüphesiz, gerçekten» hissi verir.',
            examples: [
                'محقّقكه الله غفوردر — şüphesiz Allah bağışlayandır',
                'محقّقكه علم نوردر — ilim gerçekten nurdur',
            ],
        },
    };

    const GRAMMAR_TOPIC_TITLES = {
        irab: 'İ\'rab',
        harficer: 'Harf-i cer',
        fiil: 'Fiil kipleri',
        izafet: 'İzafet',
        tenvin: 'Tenvin',
        nefy: 'Olumsuzluk',
        sifat: 'Sıfat',
        kalin: 'Kalın-ince harfler',
        zamir: 'Zamirler',
        tekid: 'Tekid',
    };

    const LETTER_WORD_SAMPLES = {
        Elif: ['اِسْم — isim', 'اُسْتَاد — usta / hoca'],
        Be: ['آو — ev', 'قاپى — kapı'],
        Te: ['طالب — öğrenci', 'تعليم — öğretim'],
        Sin: ['سلام — selam', 'سؤال — soru'],
        Nun: ['نور — nur', 'نجاح — başarı'],
        Mim: ['مدرسه — okul', 'ملت — millet'],
        Lam: ['لغه — dil', 'گجه — gece'],
        He: ['بو — bu', 'او — o'],
        Vav: ['وطن — vatan', 'وقت — vakit'],
        Dal: ['درس — ders', 'دنيا — dünya'],
        Re: ['رحمت — rahmet', 'رأى — görüş'],
        Kef: ['كتاب — kitap', 'كلمه — kelime'],
        Cim: ['جميل — güzel', 'جامع — cami'],
        Fe: ['فكر — fikir', 'فضل — fazilet'],
        Ha: ['حق — hak', 'حكمت — hikmet'],
        Şın: ['شكر — şükür', 'شرف — şeref'],
        Sad: ['صبر — sabır', 'صدق — doğruluk'],
        Kaf: ['قَلَم — kalem', 'قُرْآن — Kur\'an'],
        Gim: ['گُل — gül', 'گُزَل — güzel (Farsça kökenli)'],
        Pe: ['پَرْدَه — perde', 'پَیْغَام — mesaj'],
        Zel: ['زَمَان — zaman', 'زَهْر — çiçek'],
        Ayn: ['علم — ilim', 'عدل — adalet'],
        Gayn: ['غربت — gurbet', 'غير — başka'],
        Ze: ['ذكر — zikir', 'ذهب — altın / gitti'],
    };

    function findWordByOsm(osm) {
        return WORDS.find((w) => w.osm === osm) || null;
    }

    function findTilePhraseByOsm(osm) {
        return TILE_PHRASES_OSM.find((p) => p.osm === osm) || null;
    }

    function wordUsageExamples(w) {
        const tr = normQuizWord(w.tr);
        const phrases = TILE_PHRASES_OSM.filter((p) =>
            p.parts.some((part) => normQuizWord(part) === tr || normQuizWord(part).includes(tr))
        );
        const out = [`«${w.osm}» = ${w.tr}`];
        if (w.hint) out.push(`Türkçe okunuş: ${w.hint}`);
        phrases.slice(0, 3).forEach((p) => {
            out.push(`«${p.osm}» → ${p.parts.join(' ')}`);
        });
        if (out.length < 3) {
            out.push(`Tek başına: ${w.tr} — günlük kelime hazinesinde sık kullanılır.`);
        }
        return out.slice(0, 4);
    }

    function buildLisaniLearnDetail(q) {
        if (!q) return null;

        if (q.type === 'grammar') {
            const topic = q.grammarTopic || '';
            const topicPack = GRAMMAR_TOPIC_DETAILS[topic] || {};
            return {
                title: GRAMMAR_TOPIC_TITLES[topic] || 'Dil bilgisi',
                summary: buildLisaniLearnTip(q),
                detail:
                    topicPack.detail ||
                    GRAMMAR_TOPICS[topic] ||
                    'Bu soruda Osmanlıca dil bilgisi kuralı sorgulanıyor. Doğru seçeneği işaretlerken kelimenin cümledeki görevini düşün.',
                examples: [
                    ...(topicPack.examples || []),
                    q.answer ? `Bu sorunun cevabı: ${q.answer}` : '',
                    q.word ? `Soru metni: ${q.word}` : '',
                ].filter(Boolean),
            };
        }

        if (q.type === 'card') {
            const w = findWordByOsm(q.word);
            return {
                title: w ? `Kelime: ${w.tr}` : 'Kelime kartı',
                summary: buildLisaniLearnTip(q),
                detail: w
                    ? `Osmanlıca yazılış ile Türkçe karşılığı eşleştirilir. «${w.osm}» metinde bu kelimeyi gördüğünde okunuşu «${w.hint || w.tr}» şeklinde düşün. Zorluk seviyesi: ${w.diff}/6.`
                    : `Doğru Türkçe karşılık: «${q.answer}». Osmanlıca metni parça parça okuyarak anlam çıkar.`,
                examples: w ? wordUsageExamples(w) : [`Doğru cevap: ${q.answer}`],
            };
        }

        if (q.type === 'letter') {
            const letter = LETTERS.find((l) => l.char === q.word || l.name === q.answer);
            const name = letter?.name || q.answer;
            const samples = LETTER_WORD_SAMPLES[name] || [`${q.word} harfi kelime içinde kullanılır`];
            return {
                title: `Harf: ${name} (${q.word})`,
                summary: buildLisaniLearnTip(q),
                detail: `Osmanlıca alfabede «${q.word}» harfinin adı «${name}»dır. Harfleri tanımak okumayı hızlandırır; kelime içindeki konumuna dikkat et.`,
                examples: samples,
            };
        }

        if (q.type === 'match') {
            const pairs = q.pairs || [];
            return {
                title: 'Görsel eşleştirme',
                summary: buildLisaniLearnTip(q),
                detail:
                    'Soldaki resim ve Türkçe kelimeyi, sağdaki doğru Osmanlıca yazılışla eşleştir. Hepsini doğru yapınca soru tamamlanır.',
                examples: pairs.map((p) => `${p.emoji} ${p.tr} → ${p.osm}`),
            };
        }

        if (q.type === 'speak') {
            const w = findWordByOsm(q.word);
            return {
                title: 'Konuşma pratiği',
                summary: buildLisaniLearnTip(q),
                detail: w
                    ? `«${q.word}» kelimesini Türkçe «${q.speakHint || w.hint}» diye oku. Net ve yavaş söylemek ses tanımayı kolaylaştırır.`
                    : `Hedef okunuş: «${q.speakHint || q.word}». Mikrofona yakın ve sessiz ortamda dene.`,
                examples: w
                    ? wordUsageExamples(w)
                    : [`Okunuş: ${q.speakHint || '—'}`, `Osmanlıca: ${q.word}`],
            };
        }

        if (q.type === 'tiles') {
            const phrase = findTilePhraseByOsm(q.word);
            const parts = q.answerOrder || phrase?.parts || [];
            return {
                title: 'Cümle kurma',
                summary: buildLisaniLearnTip(q),
                detail: phrase
                    ? `Osmanlıca cümle «${phrase.osm}» şeklinde yazılır. Türkçe kelime sırası: ${parts.join(' → ')}. Kutucukları bu sırayla seç.`
                    : `Kelimeleri Türkçe cümle düzenine göre sırala. Doğru sıra: ${parts.join(' ')}.`,
                examples: [
                    `Osmanlıca: ${q.word}`,
                    `Türkçe: ${parts.join(' ')}`,
                    ...(phrase ? [`Parça sayısı: ${parts.length} kelime`] : []),
                ],
            };
        }

        return {
            title: 'Öğrenme notu',
            summary: buildLisaniLearnTip(q),
            detail: q.answer ? `Doğru cevap «${q.answer}»dır. Bir sonraki soruda tekrar dene.` : 'Bu soruyu tekrar gözden geçir.',
            examples: q.answer ? [`Cevap: ${q.answer}`] : [],
        };
    }

    function buildLisaniLearnDetailFromTopic(topicId) {
        const pack = GRAMMAR_TOPIC_DETAILS[topicId] || {};
        return {
            title: GRAMMAR_TOPIC_TITLES[topicId] || topicId,
            summary: GRAMMAR_TOPICS[topicId] || '',
            detail: pack.detail || GRAMMAR_TOPICS[topicId] || '',
            examples: pack.examples || [],
        };
    }

    function buildLisaniLearnTip(q) {
        if (!q) return '';
        if (q.type === 'grammar') {
            const topic = q.grammarTopic || '';
            const label = GRAMMAR_TOPIC_TITLES[topic] || topic || 'Dil bilgisi';
            return `Konu: ${label} — detay ve örnekler için dokun`;
        }
        if (q.learnTip) return q.learnTip;
        if (q.grammarNote) return q.grammarNote;
        if (q.type === 'match' && q.pairs?.length) {
            return `Eşleştir: ${q.pairs.map((p) => `${p.emoji} ${p.tr}`).join(' · ')}`;
        }
        if (q.type === 'speak' && q.speakHint) return `Türkçe oku: «${q.speakHint}»`;
        if (q.type === 'tiles' && q.answerOrder?.length) return `Doğru cümle: «${q.answerOrder.join(' ')}»`;
        if (q.answer) return `Doğru cevap: «${q.answer}»`;
        return '';
    }

    const GRAMMAR_ITEMS = [
        {
            osm: '«طالب كتابى» tamlamasında «كتابى» hangi i\'rabı alır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'izafet',
            answer: 'Mecrûr (cer / izafet tamamlayıcısı)',
            wrong: ['Merfû\' (raf)', 'Mansûb (nasb)', 'Meczûm (cezm)'],
            diff: 4,
        },
        {
            osm: '«آودن» ifadesinde «دن» hangi görevdedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'Harf-i cer (edat)',
            wrong: ['Fiil öneki', 'Tanımlık (lam)', 'Şedde işareti'],
            diff: 4,
        },
        {
            osm: '«طالب يازييور» cümlesinde «يازييور» hangi kiptedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'fiil',
            answer: 'Muzâri (şimdiki/geniş zaman)',
            wrong: ['Mâzî (geçmiş zaman)', 'Emir', 'Mastar'],
            diff: 5,
        },
        {
            osm: '«يازدى» fiilinin babı (kök yapısı) hangisidir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'fiil',
            answer: 'Bab-ı sâlim (sağlam üçlü kök)',
            wrong: ['Bab-ı müteaddî', 'Bab-ı müfâ\'ale', 'Bab-ı iftiâl'],
            diff: 5,
        },
        {
            osm: '«علم نور» cümlesinde «نور» ne anlama gelir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'irab',
            answer: 'Haber (yüklemin anlattığı)',
            wrong: ['Mübtedâ (özne)', 'Meful (nesne)', 'Sıfat'],
            diff: 4,
        },
        {
            osm: 'Tenvin (ـٌ ـٍ ـً) genelde hangi halde görülür?',
            prompt: GRAMMAR_PROMPT,
            topic: 'tenvin',
            answer: 'Merfû\' veya mansûb (bağlama göre)',
            wrong: ['Yalnızca mecrûr', 'Yalnızca meczûm', 'Hiçbir halde kullanılmaz'],
            diff: 5,
        },
        {
            osm: '«بسم الله» de «ب» harfinden sonra gelen isim hangi haldedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'Mecrûr (cer)',
            wrong: ['Merfû\'', 'Mansûb', 'Meczûm'],
            diff: 4,
        },
        {
            osm: '«علما مدرسه‌سی» izafetinde son kelime neyi gösterir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'izafet',
            answer: 'İzafet edilen (mudâf ileyh)',
            wrong: ['Mübtedâ', 'Haber', 'Meful-i bih'],
            diff: 5,
        },
        {
            osm: 'Osmanlıca\'da «كِتاب» ile «كُتُب» arasındaki fark nedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'irab',
            answer: 'Tekil / çoğul',
            wrong: ['Mastar / fiil', 'Erkek / dişi', 'Soru / cevap'],
            diff: 4,
        },
        {
            osm: '«يازمييور» olumsuzluğu hangi araçla kurulmuştur?',
            prompt: GRAMMAR_PROMPT,
            topic: 'nefy',
            answer: '-miyor olumsuzluk eki',
            wrong: ['«يوخ» edatı', '«دگل» edatı', '«نه» soru zamiri'],
            diff: 5,
        },
        {
            osm: '«اوقۇ» fiili hangi emir kalıbındadır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'fiil',
            answer: 'Emir (tekil eril)',
            wrong: ['Muzâri', 'Mâzî', 'Mastar'],
            diff: 5,
        },
        {
            osm: '«مدرسه ده» de «ده» hangi anlamı taşır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'İçinde / -de (zarf yer)',
            wrong: ['İçin / -e', 'Den / -den', 'İle / -le'],
            diff: 4,
        },
        {
            osm: '«طالب اوزرنده» ifadesinde «اوزرنده» sonrası isim hangi haldedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'Mecrûr',
            wrong: ['Merfû\'', 'Mansûb', 'Mef\'ûl-i mutlak'],
            diff: 5,
        },
        {
            osm: '«يدى» yardımcı fiili genelde ne oluşturur?',
            prompt: GRAMMAR_PROMPT,
            topic: 'fiil',
            answer: 'Nominal cümle (isim cümlesi) yapısı',
            wrong: ['Soru cümlesi', 'Olumsuz emir', 'Şart cümlesi'],
            diff: 6,
        },
        {
            osm: '«طالبه» deki aidiyet eki ne anlatır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'Aidiyet / -e ait',
            wrong: ['Soru', 'Olumsuzluk', 'Şart'],
            diff: 5,
        },
        {
            osm: '«نه» zamiri soru bağlamında ne işlev görür?',
            prompt: GRAMMAR_PROMPT,
            topic: 'zamir',
            answer: 'İstifham (soru)',
            wrong: ['Nefy (olumsuzluk)', 'Ta\'kîd (pekiştirme)', 'Cer (çekme)'],
            diff: 5,
        },
        {
            osm: '«يازيلير» fiilinde edilgen «يل» eki neyi gösterir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'fiil',
            answer: 'Edilgen (mef\'ûl) yapı',
            wrong: ['Emir', 'Mastar', 'İstifham'],
            diff: 6,
        },
        {
            osm: '«مجتهد طالب» de ikinci sıfat neye bağlanır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'sifat',
            answer: 'Önceki isme (sıfat)',
            wrong: ['Fiile', 'Zarfa', 'Habere'],
            diff: 5,
        },
        {
            osm: '«محقّقكه» sözü cümlede genelde ne getirir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'tekid',
            answer: 'Tekid (pekiştirme) + isim cümlesi',
            wrong: ['Sadece soru', 'Sadece olumsuzluk', 'Mastar'],
            diff: 6,
        },
        {
            osm: 'Kalın okunuşta «ص» harfi hangi sesi verir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'kalin',
            answer: 'Kalın S',
            wrong: ['İnce S', 'Z sesi', 'Ş sesi'],
            diff: 4,
        },
        {
            osm: '«يازمدى» yapısı hangi zaman anlamına yakındır?',
            prompt: GRAMMAR_PROMPT,
            topic: 'nefy',
            answer: 'Geçmişte olmama / olumsuz geçmiş',
            wrong: ['Gelecek', 'Emir', 'Şimdiki olumlu'],
            diff: 6,
        },
        {
            osm: '«علم ايله» tamlamasında «علم» hangi haldedir?',
            prompt: GRAMMAR_PROMPT,
            topic: 'harficer',
            answer: 'Mecrûr',
            wrong: ['Merfû\'', 'Mansûb', 'Meczûm'],
            diff: 5,
        },
        {
            osm: '«كيم» zamiri genelde ne sorar?',
            prompt: GRAMMAR_PROMPT,
            topic: 'zamir',
            answer: 'Akıllı varlık (kim)',
            wrong: ['Yer (nerede)', 'Zaman (ne zaman)', 'Sebep (niçin)'],
            diff: 5,
        },
        {
            osm: '«بو» işaret zamiri neye işaret eder?',
            prompt: GRAMMAR_PROMPT,
            topic: 'zamir',
            answer: 'Yakındaki eril/tekil',
            wrong: ['Uzak çoğul', 'Soru', 'Mastar'],
            diff: 4,
        },
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
        card: { label: 'Kelime', icon: 'image' },
        letter: { label: 'Harf', icon: 'type' },
        match: { label: 'Eşleştir', icon: 'link-2' },
        tiles: { label: 'Cümle Kur', icon: 'layout-grid' },
        grammar: { label: 'Dil Bilgisi', icon: 'book-open' },
        speak: { label: 'Konuş', icon: 'mic' },
    };

    function pickWrong(answerWord, pool, diff, n) {
        const answerTr = typeof answerWord === 'string' ? answerWord : answerWord.tr;
        const blocked = collectBlockTerms(answerWord);
        const isEligible = (w, spread) =>
            w.tr !== answerTr &&
            !blocked.has(normQuizWord(w.tr)) &&
            Math.abs(wordDifficulty(w) - diff) <= spread + 1;

        function bucketWords(spread) {
            const out = [];
            for (let d = Math.max(1, diff - spread - 1); d <= Math.min(6, diff + spread + 2); d++) {
                if (WORDS_BY_DIFF[d]) out.push(...WORDS_BY_DIFF[d]);
            }
            return out.length ? out : pool;
        }

        const spreads = diff >= 6 ? [0, 1] : diff >= 5 ? [0, 1, 2] : [0, 1, 2, 4, 8];
        for (const spread of spreads) {
            const candidates = bucketWords(spread).filter((w) => isEligible(w, spread));
            if (candidates.length >= n) {
                return shuffle(candidates)
                    .slice(0, n)
                    .map((w) => w.tr);
            }
        }

        const fallback = pool.filter(
            (w) => w.tr !== answerTr && !blocked.has(normQuizWord(w.tr)) && !isBlockedWrongOption(w.tr, answerWord)
        );
        return shuffle(fallback)
            .slice(0, n)
            .map((w) => w.tr);
    }

    function wordLearnTip(w) {
        let tip = `Osmanlıca «${w.osm}» → Türkçe «${w.tr}»`;
        if (w.hint) tip += ` · okunuş: ${w.hint}`;
        if (w.diff >= 5) tip += ' · İleri seviye — birkaç kez tekrar et.';
        return tip;
    }

    function mkCard(w) {
        const diff = wordDifficulty(w);
        const wrong = pickWrong(w, WORDS, diff, 3);
        const options = shuffle([w.tr, ...wrong]);
        const emoji = wordEmoji(w);
        return {
            type: 'card',
            word: w.osm,
            image: emoji !== '📖' ? emoji : undefined,
            prompt: CARD,
            options,
            answer: w.tr,
            difficulty: diff,
            learnTip: wordLearnTip(w),
        };
    }

    function mkMatch(wordSet) {
        const pairs = wordSet.map((w) => ({
            id: normQuizWord(w.tr),
            emoji: wordEmoji(w),
            tr: w.tr,
            osm: w.osm,
        }));
        return {
            type: 'match',
            word: pairs.map((p) => p.osm).join(' · '),
            prompt: MATCH,
            pairs,
            pairIds: pairs
                .map((p) => p.id)
                .sort()
                .join('+'),
            difficulty: Math.max(...wordSet.map((w) => w.diff || 1)),
            learnTip: `Eşleştirme: ${pairs.map((p) => `${p.emoji} ${p.tr} = ${p.osm}`).join(' · ')}`,
        };
    }

    function buildMatchPool() {
        const pool = [];
        const seen = new Set();

        function addGroup(words) {
            if (!words || words.length < 2) return false;
            const key = words
                .map((w) => normQuizWord(w.tr))
                .sort()
                .join('+');
            if (seen.has(key)) return false;
            seen.add(key);
            pool.push(mkMatch(words));
            return pool.length >= 900;
        }

        for (const keys of CURATED_MATCH_SETS) {
            const words = keys.map((k) => findWordByTr(k)).filter(Boolean);
            if (words.length >= 2 && addGroup(words)) return pool;
        }

        const matchCap = Math.min(450, WORDS.length);
        const anchors = [];
        for (let d = 1; d <= 6; d++) {
            const bucket = WORDS_BY_DIFF[d] || [];
            shuffle(bucket)
                .slice(0, Math.ceil(matchCap / 6))
                .forEach((w) => anchors.push(w));
        }

        for (const anchor of shuffle(anchors).slice(0, matchCap)) {
            if (pool.length >= 900) break;
            for (const groupSize of [3, 4]) {
                const mates = shuffle(
                    WORDS.filter(
                        (w) =>
                            w.tr !== anchor.tr &&
                            Math.abs(wordDifficulty(w) - wordDifficulty(anchor)) <= 1
                    )
                );
                const group = [anchor, ...mates.slice(0, groupSize - 1)];
                if (group.length >= 2 && addGroup(group)) return pool;
            }
        }

        if (!pool.length && WORDS.length >= 2) {
            addGroup(WORDS.slice(0, 3));
        }

        const hardWords = WORDS.filter((w) => wordDifficulty(w) >= 4);
        for (const anchor of shuffle(hardWords).slice(0, 500)) {
            if (pool.length >= 900) break;
            const mates = shuffle(hardWords.filter((w) => w.tr !== anchor.tr)).slice(0, 2);
            if (mates.length >= 2) addGroup([anchor, ...mates]);
        }

        return pool;
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
            learnTip: `Harf «${l.char}» adı: ${l.name}`,
        };
    }

    function mkTiles(p) {
        const parts = p.parts.slice();
        const tiles = parts.slice();
        const safeDecoys = filterTileDecoys(parts, p.decoys);
        const decoys = shuffle(safeDecoys);
        for (const d of decoys) {
            if (tiles.length >= Math.max(10, parts.length + 4)) break;
            tiles.push(d);
        }
        return {
            type: 'tiles',
            word: p.osm,
            prompt: TILES,
            tiles: shuffle(tiles),
            answerOrder: parts,
            tileParts: parts.length,
            difficulty: p.diff,
            learnTip: `Doğru cümle sırası: «${parts.join(' ')}»`,
        };
    }

    function mkGrammar(g) {
        const wrong = (g.wrong || []).slice(0, 3);
        const options = shuffle([g.answer, ...wrong]);
        const grammarNote = g.note || GRAMMAR_TOPICS[g.topic] || '';
        const topicLabel = GRAMMAR_TOPIC_TITLES[g.topic] || g.topic || 'Dil bilgisi';
        return {
            type: 'grammar',
            word: g.osm,
            prompt: g.prompt || GRAMMAR_PROMPT,
            options,
            answer: g.answer,
            difficulty: g.diff,
            grammarNote,
            grammarTopic: g.topic || '',
            learnTip: `Konu: ${topicLabel} — önce kuralı öğren`,
        };
    }

    function mkSpeak(item) {
        const w = findWordByOsm(item.word);
        return {
            type: 'speak',
            word: item.word,
            speakHint: item.hint,
            speakMatch: item.speakMatch || [item.hint],
            prompt: SPEAK,
            difficulty: item.diff || w?.diff || 2,
            learnTip: w ? wordLearnTip(w) : `Okunuş: ${item.hint}`,
        };
    }

    function hashSessionSeed(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function shuffleSeeded(arr, seed) {
        const a = arr.slice();
        let s = seed || 1;
        for (let i = a.length - 1; i > 0; i--) {
            s = (s * 1103515245 + 12345) | 0;
            const j = Math.abs(s) % (i + 1);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /** Bölüm bazlı soru tipi ve zorluk profili */
    const BOLUM_QUIZ = {
        kelimeler: {
            baseDiff: 1,
            maxDiff: 3,
            stepDiffBoost: 0.35,
            tilesPartMin: 2,
            tilesPartMax: 2,
            typeCycle: ['match', 'card', 'speak', 'letter', 'match', 'card'],
            allowLetter: true,
        },
        harfler: {
            baseDiff: 2,
            maxDiff: 4,
            stepDiffBoost: 0.55,
            tilesPartMin: 2,
            tilesPartMax: 3,
            typeCycle: ['match', 'card', 'tiles', 'speak', 'match', 'letter', 'card'],
            allowLetter: true,
        },
        eslestirme: {
            baseDiff: 2,
            maxDiff: 5,
            stepDiffBoost: 0.65,
            tilesPartMin: 2,
            tilesPartMax: 4,
            typeCycle: ['match', 'tiles', 'speak', 'match', 'card', 'tiles', 'match', 'tiles', 'card'],
            allowLetter: false,
        },
        ceviri: {
            baseDiff: 4,
            maxDiff: 6,
            stepDiffBoost: 1.15,
            tilesPartMin: 4,
            tilesPartMax: 6,
            typeCycle: ['grammar', 'tiles', 'speak', 'grammar', 'card', 'tiles', 'grammar', 'match', 'grammar', 'tiles'],
            allowLetter: false,
        },
        ses: {
            baseDiff: 5,
            maxDiff: 6,
            stepDiffBoost: 1.5,
            tilesPartMin: 5,
            tilesPartMax: 6,
            typeCycle: ['grammar', 'speak', 'tiles', 'grammar', 'speak', 'tiles', 'match', 'grammar', 'speak', 'tiles', 'match', 'grammar', 'tiles'],
            allowLetter: false,
        },
    };

    function normalizeSessionType(next, cfg, bolumId) {
        if (next === 'letter' && cfg.allowLetter === false) return bolumId === 'ceviri' || bolumId === 'ses' ? 'grammar' : 'card';
        if (next === 'letter') return 'card';
        return next;
    }

    function fallbackType(bolumId, cfg) {
        if (bolumId === 'ceviri' || bolumId === 'ses') return 'grammar';
        if (bolumId === 'eslestirme' || bolumId === 'kelimeler' || bolumId === 'harfler') return 'match';
        return 'card';
    }

    function buildLisaniSessionTypes(bolumId, sessionSize, stepIndex) {
        const cfg = BOLUM_QUIZ[bolumId] || BOLUM_QUIZ.kelimeler;
        const cycle = cfg.typeCycle || ['card'];
        const types = [];
        let ci = 0;

        while (types.length < sessionSize) {
            let next = normalizeSessionType(cycle[ci % cycle.length], cfg, bolumId);
            ci += 1;
            types.push(next);
        }

        if (bolumId === 'kelimeler' || bolumId === 'harfler' || bolumId === 'eslestirme') {
            return shuffleSeeded(types, hashSessionSeed(`${bolumId}|${stepIndex}|${sessionSize}`));
        }

        return types;
    }

    function getBolumDiffRange(bolumId, stepIndex, slotIndex, sessionSize) {
        const cfg = BOLUM_QUIZ[bolumId] || BOLUM_QUIZ.kelimeler;
        const stepBoost = Math.floor(stepIndex * (cfg.stepDiffBoost || 0.4));
        const progress = slotIndex / Math.max(1, sessionSize - 1);
        const slotBoost = Math.floor(progress * 2.8);
        let minD = Math.min(cfg.maxDiff, cfg.baseDiff + stepBoost + Math.floor(slotBoost * 0.75));
        let maxD = Math.min(cfg.maxDiff, minD + 1 + Math.floor(stepIndex * 0.7));
        if (progress >= 0.6) maxD = Math.min(cfg.maxDiff, maxD + 1);
        if (progress >= 0.85) minD = Math.min(cfg.maxDiff, minD + 1);
        if (bolumId === 'ceviri') {
            minD = Math.max(minD, 3 + Math.floor(stepIndex * 0.5));
            maxD = Math.max(maxD, 5 + Math.floor(stepIndex / 2));
        }
        if (bolumId === 'ses') {
            minD = Math.max(minD, 5 + Math.floor(stepIndex / 2));
            maxD = 6;
            if (stepIndex >= 3) minD = 6;
        }
        if (maxD < minD) maxD = minD;
        return { minD, maxD, cfg };
    }

    function validateQuestionBank() {
        const osmMap = new Map();
        const trMap = new Map();
        CORE_WORDS.forEach((w) => {
            if (osmMap.has(w.osm)) throw new Error(`Kart osm tekrarı: ${w.osm}`);
            if (trMap.has(w.tr)) throw new Error(`Türkçe tekrarı: ${w.tr}`);
            osmMap.set(w.osm, w.tr);
            trMap.set(w.tr, w.osm);
        });

        CORE_WORDS.forEach((w) => {
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
            const need = {};
            p.parts.forEach((part) => {
                need[part] = (need[part] || 0) + 1;
            });
            const have = {};
            built.tiles.forEach((t) => {
                have[t] = (have[t] || 0) + 1;
            });
            Object.keys(need).forEach((part) => {
                if ((have[part] || 0) < need[part]) throw new Error(`Kutucuk eksik: ${part}`);
            });
            const blocked = synonymBlockSet(p.parts);
            built.tiles.forEach((t) => {
                if (!p.parts.includes(t) && blocked.has(normQuizWord(t))) {
                    throw new Error(`Eş anlamlı decoy: ${t} (${p.osm})`);
                }
            });
        });

        GRAMMAR_ITEMS.forEach((g) => {
            const q = mkGrammar(g);
            if (!q.options.includes(q.answer) || q.options.length !== 4) {
                throw new Error(`Dil bilgisi hatası: ${g.osm}`);
            }
            if (new Set(q.options).size !== 4) {
                throw new Error(`Dil bilgisi tekrarlı şık: ${g.osm}`);
            }
        });
    }

    validateQuestionBank();

    let matchPoolCache = null;
    function getMatchPool() {
        if (!matchPoolCache) matchPoolCache = buildMatchPool();
        return matchPoolCache;
    }

    const pools = {
        card: WORDS,
        letter: LETTERS.map(mkLetter),
        tiles: TILE_PHRASES_OSM.map(mkTiles),
        grammar: GRAMMAR_ITEMS.map(mkGrammar),
        speak: WORDS.filter((w) => w.hint),
    };
    Object.defineProperty(pools, 'match', {
        enumerable: true,
        get() {
            return getMatchPool();
        },
    });
    window.LISANI_POOLS = pools;

    window.LisaniQuizBank = {
        materializeQuestion(kind, raw) {
            if (!raw) return null;
            if (raw.type) return raw;
            if (kind === 'card') return mkCard(raw);
            if (kind === 'speak') {
                return mkSpeak({
                    word: raw.osm,
                    hint: raw.hint,
                    speakMatch: [raw.hint, ...(raw.speakAlt || [])].filter(Boolean),
                    diff: wordDifficulty(raw),
                });
            }
            return raw;
        },
        getWordCount() {
            return WORDS.length;
        },
    };

    window.LISANI_MIX_PATTERN = [
        'card', 'match', 'card', 'letter', 'match', 'card',
        'tiles', 'card', 'letter', 'match', 'card',
        'tiles', 'card', 'letter', 'match', 'tiles',
        'card', 'card',
    ];

    window.LISANI_STEP_PATTERNS = [
        ['match', 'letter', 'card', 'match'],
        ['letter', 'card', 'tiles', 'match'],
        ['match', 'card', 'letter', 'tiles'],
        ['tiles', 'letter', 'match', 'card'],
        ['card', 'tiles', 'match', 'letter'],
    ];
    window.LISANI_QUESTIONS_PER_STEP = 4;
    window.LISANI_BOLUM_STEPS = 5;
    window.LISANI_BOLUM_QUIZ = BOLUM_QUIZ;
    window.buildLisaniSessionTypes = buildLisaniSessionTypes;
    window.getLisaniBolumDiffRange = getBolumDiffRange;
    window.buildLisaniLearnTip = buildLisaniLearnTip;
    window.buildLisaniLearnDetail = buildLisaniLearnDetail;
    window.buildLisaniLearnDetailFromTopic = buildLisaniLearnDetailFromTopic;
    window.LISANI_GRAMMAR_TOPIC_DETAILS = GRAMMAR_TOPIC_DETAILS;
    window.LISANI_GRAMMAR_TOPIC_TITLES = GRAMMAR_TOPIC_TITLES;

    window.LISANI_BOLUMLER = [
        { id: 'kelimeler', title: 'Temel', desc: '5 test · eşleştirme ve kelime', icon: 'T', color: 1, sessionSize: 5, baseDiff: 1 },
        { id: 'harfler', title: 'Orta', desc: '5 test · cümle kurma', icon: 'O', color: 2, sessionSize: 8, baseDiff: 2 },
        { id: 'eslestirme', title: 'İleri', desc: '5 test · eşleştirme ve cümle', icon: 'İ', color: 3, sessionSize: 12, baseDiff: 2 },
        { id: 'ceviri', title: 'Uzman', desc: '5 test · dil bilgisi + çeviri', icon: 'U', color: 1, sessionSize: 14, baseDiff: 4 },
        { id: 'ses', title: 'Usta', desc: '5 test · konuşma + dil bilgisi', icon: '★', color: 2, sessionSize: 16, baseDiff: 5 },
    ];

    window.LISANI_GRAMMAR_TOPICS = GRAMMAR_TOPICS;
    window.LISANI_GRAMMAR_PREP_NOTES = Object.entries(GRAMMAR_TOPICS).map(([id, text]) => ({
        id,
        title: id.charAt(0).toUpperCase() + id.slice(1),
        text,
    }));
    window.LISANI_BOLUM_INDEX = { kelimeler: 1, harfler: 2, eslestirme: 3, ceviri: 4, ses: 5 };
    window.LISANI_QUIZ_BANK = {};
    window.LISANI_BOLUMLER.forEach((b) => { window.LISANI_QUIZ_BANK[b.id] = []; });

    window.LISANI_CARD_PROMPT = CARD;
    window.LISANI_MATCH_PROMPT = MATCH;
    window.LISANI_TILES_PROMPT = TILES;
    window.LISANI_SPEAK_PROMPT = SPEAK;
    window.LISANI_SKIP_SPEAK_LABEL = 'Şuan konuşamam';
    window.LISANI_SPEAK_LISTEN_SEC = 15;
    window.LISANI_CORE_WORDS = CORE_WORDS;
    window.LISANI_ALL_WORDS = WORDS;
    window.LISANI_TILE_PHRASES_OSM = TILE_PHRASES_OSM;
})();
