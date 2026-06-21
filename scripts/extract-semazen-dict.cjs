'use strict';

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const PDF = path.join(__dirname, '../storage/app/osmanli_turkcesi_sozlugu.pdf');
const OUT_TXT = path.join(__dirname, '../storage/app/semazen-dict-raw.txt');
const OUT_SAMPLE = path.join(__dirname, '../storage/app/semazen-dict-sample.txt');

async function main() {
    const buf = fs.readFileSync(PDF);
    const data = await pdf(buf);
    fs.writeFileSync(OUT_TXT, data.text, 'utf8');
    const lines = data.text.split(/\r?\n/);
    fs.writeFileSync(OUT_SAMPLE, lines.slice(0, 120).join('\n'), 'utf8');
    console.log('pages:', data.numpages);
    console.log('chars:', data.text.length);
    console.log('lines:', lines.length);
    console.log('sample written');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
