#!/usr/bin/env node
/** Tile osm ↔ parts tutarlılık denetimi */
const fs = require('fs');
const vm = require('vm');
const ctx = { window: {}, document: { addEventListener: () => {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/js/lisani-osm-translate.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('public/js/lisani-quiz-bank.js', 'utf8'), ctx);

const tiles = ctx.window.LISANI_TILE_PHRASES_OSM;
const issues = [];

function normAr(s) {
    return String(s || '')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .trim();
}

tiles.forEach((p, i) => {
    const trPhrase = p.parts.join(' ');
    const registered = ctx.window.LISANI_TILE_PHRASES_OSM.find((x) => x.osm === p.osm);
    if (registered !== p) return;
    // duplicate osm check
});

const osmSeen = {};
tiles.forEach((p, i) => {
    if (osmSeen[p.osm]) {
        issues.push({ i, type: 'dup-osm', osm: p.osm, a: osmSeen[p.osm], b: p.parts.join(' ') });
    } else osmSeen[p.osm] = p.parts.join(' ');
});

// Known wrong part mappings
const manual = [
    { osm: 'گوناي دين يا دوست', expect: ['günaydın', 'ya', 'dost'] },
    { osm: 'مدرسه ده اوكونييورم', expect: ['okulda', 'okuyorum'], fixOsm: 'مدرسه ده اوقونييورم' },
];

manual.forEach(({ osm, expect, fixOsm }) => {
    const p = tiles.find((t) => t.osm === osm);
    if (!p) return;
    const got = p.parts.join('|');
    const exp = expect.join('|');
    if (got !== exp) issues.push({ type: 'parts-mismatch', osm, got: p.parts, expect });
    if (fixOsm && p.osm !== fixOsm) issues.push({ type: 'osm-typo', osm, fixOsm });
});

console.log(JSON.stringify({ total: tiles.length, issues }, null, 2));
