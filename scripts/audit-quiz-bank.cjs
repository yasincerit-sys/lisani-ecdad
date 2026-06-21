#!/usr/bin/env node
/**
 * Soru bankası denetimi — hatalı osm, eksik parçalar, şık sorunları
 */
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {}, document: { addEventListener: () => {} } };
const vmCtx = vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/js/lisani-osm-translate.js', 'utf8'), vmCtx);
vm.runInContext(fs.readFileSync('public/js/lisani-quiz-bank.js', 'utf8'), vmCtx);

const pools = ctx.window.LISANI_POOLS;
const issues = [];

function norm(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

const knownParts = new Set();
(ctx.window.LISANI_CORE_WORDS || []).forEach((w) => {
    knownParts.add(norm(w.tr));
    if (w.hint) knownParts.add(norm(w.hint));
    (w.speakAlt || []).forEach((a) => knownParts.add(norm(a)));
});

// Tile phrase parts from bank file directly
const bankSrc = fs.readFileSync('public/js/lisani-quiz-bank.js', 'utf8');
const tileBlock = bankSrc.match(/const TILE_PHRASES_OSM = \[([\s\S]*?)\n    \];/);
if (tileBlock) {
    const partRe = /parts:\s*\[([^\]]+)\]/g;
    let m;
    while ((m = partRe.exec(tileBlock[1]))) {
        m[1].match(/'([^']+)'/g)?.forEach((p) => knownParts.add(norm(p.replace(/'/g, ''))));
    }
}

// Common tile-only tokens
[
    'istiyorum', 'okuyorum', 'yaziyorum', 'yazıyorum', 'gidiyorum', 'seviyorum',
    'ederim', 'dilerim', 'geldiniz', 'günler', 'akşamlar', 'geceler', 'güle',
    'hamdolsun', 'selamün', 'aleyküm', 'öğrenciyim', 'nurdur', 'sabırla', 'kapılar',
    'açılır', 've', 'bu', 'okula', 'vatanımı', 'dostum', 'ya', 'hos', 'hoş',
].forEach((p) => knownParts.add(norm(p)));

// Typos in osm
const osmTypos = [
    [/اوكونييور/g, 'اوقونييور (okuyorum yazımı)'],
    [/آچيلır/g, 'آچيلير (açılır)'],
    [/كاپılar/g, 'كاپيلر (kapılar)'],
    [/يازرم/g, 'يازييورم'],
    [/سوریور/g, 'سورييور'],
];

pools.tiles.forEach((q, i) => {
    osmTypos.forEach(([re, msg]) => {
        if (re.test(q.word)) issues.push({ type: 'osm-typo', i, osm: q.word, msg });
    });
    (q.answerOrder || []).forEach((part) => {
        if (!knownParts.has(norm(part))) {
            issues.push({ type: 'unknown-part', i, osm: q.word, part });
        }
    });
    const built = {};
    (q.tiles || []).forEach((t) => {
        built[t] = (built[t] || 0) + 1;
    });
    (q.answerOrder || []).forEach((part) => {
        if ((built[part] || 0) < 1) {
            issues.push({ type: 'missing-tile', i, osm: q.word, part });
        }
    });
});

pools.card.forEach((q, i) => {
    if (!q.options.includes(q.answer)) issues.push({ type: 'card-no-answer', i, word: q.word });
    if (new Set(q.options).size !== q.options.length) issues.push({ type: 'card-dup-opt', i, word: q.word });
});

pools.grammar.forEach((q, i) => {
    if (!q.options.includes(q.answer)) issues.push({ type: 'grammar-no-answer', i, word: q.word });
    if (new Set(q.options).size !== q.options.length) issues.push({ type: 'grammar-dup-opt', i, word: q.word });
});

pools.match.forEach((q, i) => {
    if ((q.pairs || []).length < 2) issues.push({ type: 'match-too-few', i });
    (q.pairs || []).forEach((p) => {
        if (!p.osm || !p.tr) issues.push({ type: 'match-incomplete', i, pair: p });
    });
});

// Duplicate tile osm
const osmCount = {};
pools.tiles.forEach((q) => {
    osmCount[q.word] = (osmCount[q.word] || 0) + 1;
});
Object.entries(osmCount).filter(([, c]) => c > 1).forEach(([osm, c]) => {
    issues.push({ type: 'duplicate-tile-osm', osm, count: c });
});

console.log(JSON.stringify({ issueCount: issues.length, issues: issues.slice(0, 80) }, null, 2));
