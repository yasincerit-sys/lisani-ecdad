'use strict';

const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '../storage/app/semazen-dict-raw.txt');
const OUT_JSON = path.join(__dirname, '../public/data/semazen-vocabulary.json');
const OUT_JS = path.join(__dirname, '../public/js/lisani-semazen-vocabulary.js');
const OUT_QUIZ_JSON = path.join(__dirname, '../public/data/semazen-quiz-words.json');
const OUT_QUIZ_JS = path.join(__dirname, '../public/js/lisani-semazen-quiz-words.js');

const ENTRY_RE =
    /^(.+?)\s*\((A\.|F\.|A\.-F\.|F\.-A\.)\)\s*(?:\[|\u200c?\s)([^\]\n]+?)\]\s*(.*)$/u;

function normTr(text) {
    return (text || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, ' ')
        .replace(/[’'`]/g, '')
        .replace(/[âîû]/g, (c) => ({ â: 'a', î: 'i', û: 'u' }[c] || c))
        .replace(/[ô]/g, 'o')
        .replace(/[ê]/g, 'e');
}

function normOsm(ar) {
    return (ar || '').replace(/\s+/g, ' ').trim();
}

function asciiKey(text) {
    return normTr(text)
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i');
}

function cleanRaw(text) {
    return text
        .replace(/www\.webturkiyeforum\.com/gi, '\n')
        .replace(/OSMANLI TÜRKÇES[\s\S]*?www\./gi, '\n')
        .replace(/Prof\. Dr\. Mehmet KANAR/gi, '\n')
        .split(/\r?\n/)
        .map((line) => line.replace(/^\s+\d+\s*$/, '').trim())
        .filter((line) => line && !/^\d{1,4}$/.test(line))
        .join('\n');
}

function meaningKeys(meaningRaw, headword) {
    const keys = new Set();
    const hw = normTr(headword);
    if (hw && hw.length >= 2 && hw.length <= 80) keys.add(hw);

    const ascii = asciiKey(headword);
    if (ascii && ascii !== hw && ascii.length >= 2) keys.add(ascii);

    let m = (meaningRaw || '')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\(\s*meyhane[^)]*\)/gi, ' ')
        .replace(/\d+\./g, ';')
        .trim();

    m.split(/[;.]/)[0]
        .split(/[,/]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((part) => {
            const p = normTr(part);
            if (p.length >= 3 && p.length <= 60 && !/^[a-z]\.$/i.test(p)) {
                keys.add(p);
                const a = asciiKey(part);
                if (a !== p && a.length >= 3) keys.add(a);
            }
        });

    return [...keys];
}

function guessQuizDiff(tr, osm) {
    const t = tr.replace(/\s/g, '').length;
    const o = osm.replace(/\s/g, '').length;
    if (t <= 4 && o <= 5) return 1;
    if (t <= 7 && o <= 9) return 2;
    if (t <= 11 && o <= 14) return 3;
    if (t <= 16 && o <= 20) return 4;
    if (t <= 22 && o <= 28) return 5;
    return 6;
}

function titleCaseTr(text) {
    const s = (text || '').trim();
    if (!s) return s;
    return s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
}

function isQuizSuitableKey(key, osm) {
    if (!key || !osm) return false;
    if (key.length < 3 || key.length > 40) return false;
    if ((key.match(/\s/g) || []).length > 3) return false;
    if (/[0-9\[\](){}]/.test(key)) return false;
    if (!/[\u0600-\u06FF]/.test(osm)) return false;
    if (osm.length > 55) return false;
    return true;
}

function scoreQuizKey(key) {
    let score = 0;
    if (!/\s/.test(key)) score += 4;
    if (key.length >= 4 && key.length <= 18) score += 3;
    if (/^[a-zçğıöşüâîû]+$/i.test(key)) score += 2;
    return score - Math.max(0, key.length - 20) * 0.2;
}

function buildQuizWordsFromMap(map) {
    const byOsm = new Map();
    for (const [key, osm] of Object.entries(map)) {
        if (!isQuizSuitableKey(key, osm)) continue;
        const score = scoreQuizKey(key);
        const prev = byOsm.get(osm);
        if (!prev || score > prev.score) {
            byOsm.set(osm, { key, osm, score });
        }
    }
    return [...byOsm.values()].map(({ key, osm }) => {
        const hint = normTr(key);
        const ascii = asciiKey(key);
        const entry = {
            tr: titleCaseTr(key),
            osm,
            diff: guessQuizDiff(key, osm),
            difficulty: guessQuizDiff(key, osm),
            hint,
        };
        if (ascii && ascii !== hint && ascii.length >= 3) entry.speakAlt = [ascii];
        return entry;
    });
}

function parseDictionary(text) {
    const cleaned = cleanRaw(text);
    const lines = cleaned.split(/\n+/);
    const map = new Map();
    let matched = 0;
    let skipped = 0;

    for (const line of lines) {
        const m = line.match(ENTRY_RE);
        if (!m) {
            skipped++;
            continue;
        }
        matched++;
        const headword = m[1].trim().replace(/\s+/g, ' ');
        const osm = normOsm(m[3]);
        if (!osm || osm.length < 1 || osm.length > 120) continue;

        for (const key of meaningKeys(m[4], headword)) {
            if (!key || key.length < 2) continue;
            if (!map.has(key)) map.set(key, osm);
        }
    }

    return { map, matched, skipped, lines: lines.length };
}

function main() {
    const raw = fs.readFileSync(RAW, 'utf8');
    const { map, matched, skipped, lines } = parseDictionary(raw);
    const obj = Object.fromEntries(map);
    fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
    fs.writeFileSync(OUT_JSON, JSON.stringify(obj), 'utf8');

    const js = `/**
 * Semazen Osmanlı Türkçesi Sözlüğü (Prof. Dr. Mehmet Kanar)
 * Kaynak: https://dosyalar.semazen.net/e_kitap/osmanli_turkcesi_sozlugu.pdf
 * Otomatik çıkarım — ${Object.keys(obj).length} Türkçe/Osmanlıca anahtar.
 */
(function () {
    'use strict';
    window.LISANI_SEMAZEN_VOCABULARY = ${JSON.stringify(obj)};
})();
`;
    fs.writeFileSync(OUT_JS, js, 'utf8');

    const quizWords = buildQuizWordsFromMap(obj);
    fs.writeFileSync(OUT_QUIZ_JSON, JSON.stringify(quizWords), 'utf8');
    const quizJs = `/**
 * Semazen sözlüğünden soru bankası kelimeleri (Osmanlıca yazılış başına bir kayıt)
 * Kaynak: https://dosyalar.semazen.net/e_kitap/osmanli_turkcesi_sozlugu.pdf
 */
(function () {
    'use strict';
    window.LISANI_SEMAZEN_QUIZ_WORDS = ${JSON.stringify(quizWords)};
})();
`;
    fs.writeFileSync(OUT_QUIZ_JS, quizJs, 'utf8');

    console.log(
        JSON.stringify(
            {
                lines,
                matchedEntries: matched,
                skippedLines: skipped,
                uniqueKeys: Object.keys(obj).length,
                quizWords: quizWords.length,
                jsonBytes: fs.statSync(OUT_JSON).size,
                jsBytes: fs.statSync(OUT_JS).size,
                quizJsBytes: fs.statSync(OUT_QUIZ_JS).size,
            },
            null,
            2
        )
    );
}

main();
