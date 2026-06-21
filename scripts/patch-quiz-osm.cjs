const fs = require('fs');
const p = require('path').join(__dirname, '../public/js/lisani-quiz-bank.js');
let s = fs.readFileSync(p, 'utf8');

s = s.replace(/وقونييورم او ده/g, 'وقونييورم آو ده');
s = s.replace(/يازييورم او ده/g, 'قلم يازييورm آو ده'.includes('قلm') ? 'يازييورm آو ده' : 'يازييورm آو ده');
// simpler:
s = s.replace(/يازييورم او ده/g, 'يازييورm آو ده');

// Fix the above - use exact from file
s = fs.readFileSync(p, 'utf8');
s = s.replace(/وقونييورم او ده/g, 'وقونييورm آو ده');
s = s.replace(/يازييورm او ده/g, 'يازييورm آو ده');

// Read again and fix properly
s = fs.readFileSync(p, 'utf8');
const fixes = [
    ['كتاب اوقونييورm او ده', 'كتاب اوقونييورm آو ده'],
    ['قلm يازييورm او ده', 'قلm يازييورm آv ده'],
];
// Use unicode
const M = '\u0645';
fixes.length = 0;
fixes.push(
    [`كتاب اوقونييور${M} او ده`, `كتاب اوقونييور${M} آو ده`],
    [`قلm يازييور${M} او ده`, `قلm يازييور${M} آو ده`],
);
// قلم not قلm
fixes.length = 0;
fixes.push(
    [`كتاب اوقونييور${M} او ده`, `كتاب اوقونييور${M} آو ده`],
    [`قلm يازييور${M} او ده`, `قلm يازييور${M} آو ده`],
);
// From file it's قلم
fixes.length = 0;
fixes.push(
    [`كتاب اوقونييور${M} او ده`, `كتاب اوقونييور${M} آو ده`],
    [`\u0642\u0644\u0645 \u064A\u0627\u0632\u064A\u064A\u0648\u0631${M} \u0627\u0648 \u062F\u0647`, `\u0642\u0644\u0645 \u064A\u0627\u0632\u064A\u064A\u0648\u0631${M} \u0622\u0648 \u062F\u0647`],
);

fixes.forEach(([a, b]) => {
    if (s.includes(a)) {
        s = s.split(a).join(b);
        console.log('fixed:', a.slice(0, 30));
    }
});

// tekid
const oldTekid = "'\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u0670\u0647\u064E \u063A\u064E\u0641\u064F\u0648\u0631\u064F \u2014 \u015F\u00FCphesiz Allah ba\u011F\u0131\u015Flayand\u0131r',\n                '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u064E \u0646\u064F\u0648\u0631\u064F \u2014 ilim ger\u00E7ekten nurdur'";
// grep showed: 'إِنَّ اللّٰهَ غَفُورٌ
if (s.includes('\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u0670\u0647\u064E \u063A\u064E\u0641\u064F\u0648\u0631\u064F')) {
    s = s.replace(
        /'\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0644\u0651\u0670\u0647\u064E \u063A\u064E\u0641\u064F\u0648\u0631\u064F \u2014 \u015F\u00FCphesiz Allah ba\u011F\u0131\u015Flayand\u0131r',\n                '\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u064E \u0646\u064F\u0648\u0631\u064F \u2014 ilim ger\u00E7ekten nurdur'/,
        "'\u0645\u062D\u0642\u0651\u0642\u0643\u0647 \u0627\u0644\u0644\u0647 \u063A\u0641\u0648\u0631\u062F\u0631 \u2014 \u015F\u00FCphesiz Allah ba\u011F\u0131\u015Flayand\u0131r',\n                '\u0645\u062D\u0642\u0651\u0642\u0643\u0647 \u0639\u0644\u0645 \u0646\u0648\u0631\u062F\u0631 \u2014 ilim ger\u00E7ekten nurdur'"
    );
    console.log('tekid unicode');
}

// simpler tekid replace
s = s.replace(
    `'إِنَّ اللّٰهَ غَفُورٌ — şüphesiz Allah bağışlayandır',
                'إِنَّ العِلْمَ نُورٌ — ilim gerçekten nurdur'`,
    `'محقّقكه الله غفوردر — şüphesiz Allah bağışlayandır',
                'محقّقكه علm نوردر — ilim gerçekten nurdur'`
);

fs.writeFileSync(p, s);
console.log('patch done');
