#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const ctx = { window: {}, document: { addEventListener: () => {} } };
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
load('public/js/lisani-osm-vocabulary.js');
load('public/js/lisani-semazen-vocabulary.js');
load('public/js/lisani-semazen-quiz-words.js');
load('public/js/lisani-quiz-bank.js');
load('public/js/lisani-osm-translate.js');
ctx.window.rebuildOsmDictionary();
console.log('Soru kelimesi:', ctx.window.LISANI_ALL_WORDS?.length || 0);
console.log('Kart havuzu:', ctx.window.LISANI_POOLS?.card?.length || 0);
console.log('Konuş havuzu:', ctx.window.LISANI_POOLS?.speak?.length || 0);
console.log('Eşleştir havuzu:', ctx.window.LISANI_POOLS?.match?.length || 0);
console.log('Çeviri sözlüğü:', ctx.window.LISANI_OSM_WORD_COUNT);
const card = ctx.window.LisaniQuizBank.materializeQuestion('card', ctx.window.LISANI_ALL_WORDS.find((w) => w.hint === 'adalet'));
console.log('adalet kart:', card?.answer, card?.options?.length);
