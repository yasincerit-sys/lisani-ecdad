const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../public/js/lisani.js');
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const start = lines.findIndex((l, i) => i > 1100 && l.trim() === 'resetQuizPanels();' && lines[i - 1]?.trim() === '}');
const end = lines.findIndex((l) => l.includes('// Sonraki Soru veya Sınav Tamamlama'));
if (start < 0 || end < 0 || end <= start) {
    console.error('range not found', start, end);
    process.exit(1);
}
const out = [...lines.slice(0, start), ...lines.slice(end)];
fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log('Removed lines', start + 1, 'to', end);
