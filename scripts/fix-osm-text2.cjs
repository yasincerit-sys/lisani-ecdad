const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../public/js/lisani-quiz-bank.js');
let s = fs.readFileSync(p, 'utf8');

const alabilir = '\u0622\u0644\u0628\u0649\u0644\u0649\u0631\u0645\u0649\u0645'; // آلbilirmيم
const lutfen = '\u0644\u0637\u0641\u0627\u064B'; // لطفاً

s = s.replace(/قهوه آلbilirmيم لطفاً/g, `قهوه ${alabilir} ${lutfen}`);
s = s.replace(/سو آلbilirmيم لطفاً/g, `سو ${alabilir} ${lutfen}`);

const fixes = [
    ['تركiye', 'تركيه'],
    ['گيدييورم', 'گيدييورم'], // fix latin i in gidiyorum -> گيدييورم
    ['چای ایستیورم', 'چای \u0627\u064A\u0633\u062A\u064A\u0648\u0631\u0645'],
    ['بوگون مكتبه گيديyورm', 'بوگون \u0645\u0643\u062A\u0628\u0647 \u06AF\u064A\u062F\u064A\u064A\u0648\u0631\u0645'],
    ['بوگون مكتبه گيدييورm', 'بوگون \u0645\u0643\u062A\u0628\u0647 \u06AF\u064A\u062F\u064A\u064A\u0648\u0631\u0645'],
    ['بوگون مكتبه گيدييورm', 'بوگون \u0645\u0643\u062A\u0628\u0647 \u06AF\u064A\u062F\u064A\u064A\u0648\u0631\u0645'],
];

// gidiyorum line
s = s.replace(
    "osm: 'بوگون مكتبه گيديyورm'",
    "osm: 'بوگون \u0645\u0643\u062A\u0628\u0647 \u06AF\u064A\u062F\u064A\u064A\u0648\u0631\u0645'"
);
s = s.replace(/بوگون مكتبه گيديyورm/g, 'بوگون \u0645\u0643\u062A\u0628\u0647 \u06AF\u064A\u062F\u064A\u064A\u0648\u0631\u0645');
s = s.replace(/چای ایستیورm/g, 'چای \u0627\u064A\u0633\u062A\u064A\u0648\u0631\u0645');
s = s.replace(/تركiye/g, 'تركيه');
s = s.replace(/گيتديم/g, '\u06AF\u064A\u062A\u062F\u064A\u0645');
s = s.replace(/گيتديم/g, '\u06AF\u064A\u062A\u062F\u064A\u0645');
s = s.replace(/اوقویورm/g, '\u0627\u0648\u0642\u0648\u064A\u0648\u0631\u0645');
s = s.replace(/آلbilirmيم/g, alabilir);

fs.writeFileSync(p, s);
console.log('osm cleaned');
