const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const destDir = path.join(__dirname, '..', 'public', 'downloads');
const dest = path.join(destDir, 'lisani-ecdad.apk');

if (!fs.existsSync(src)) {
    console.error('APK bulunamadi:', src);
    console.error('Once: npm run android:build');
    process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
console.log(`APK yayinlandi: ${dest} (${sizeMb} MB)`);
