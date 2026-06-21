const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../public/js/lisani-quiz-bank.js');
let s = fs.readFileSync(p, 'utf8');

s = s.replace("{ tr: 'Köprü', osm: 'كoprü', diff: 3 }", "{ tr: 'Köprü', osm: 'جسر', diff: 3 }");
s = s.replace(/قهوه آلabilirmiyim لutfen/g, 'قهوه آلbilirmيم لطفاً');
s = s.replace(/سو آلabilirmiyim لutfen/g, 'سو آلbilirmيم لطفاً');

const start = s.indexOf('    const TILE_PHRASES = [');
const end = s.indexOf('    /** Osmanlıca kutucuk');
if (start >= 0 && end > start) s = s.slice(0, start) + s.slice(end);

s = s.replace(/    \/\*\* Arap harfi dışındaki[\s\S]*?    const SKIP_PHRASES = /, '    const SKIP_PHRASES = ');
s = s.replace(/word: \(w\.osm\)/g, 'word: w.osm');
s = s.replace(/word: \(s\.word\)/g, 'word: s.word');
s = s.replace(/word: \(p\.osm\)/g, 'word: p.osm');

fs.writeFileSync(p, s);
console.log('fixed');
