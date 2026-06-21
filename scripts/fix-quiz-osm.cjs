const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../public/js/lisani-quiz-bank.js');
let s = fs.readFileSync(p, 'utf8');
const M = '\u0645';

function rep(from, to, label) {
    if (!s.includes(from)) {
        console.warn('MISS:', label || from.slice(0, 50));
        return;
    }
    s = s.split(from).join(to);
    console.log('OK:', label || from.slice(0, 50));
}

// TILE — Arapça ifadeler → Osmanlıca
[
    ["{ osm: 'أشكرك'", "{ osm: 'تشكر ايدرم'", 'teşekkür'],
    ["{ osm: 'أيام سعيدة'", "{ osm: 'ايى گونلر'", 'iyi günler'],
    ["{ osm: 'أهلا وسهلا'", "{ osm: 'خوش كلدك'", 'hoş geldiniz'],
    ["{ osm: 'لو سمحت آب'", "{ osm: 'لطفاً آب'", 'lütfen su'],
    ["{ osm: 'مساء الخير'", "{ osm: 'ايى آخشام'", 'iyi akşam'],
    ["{ osm: 'مع السلامة'", "{ osm: 'گله گله'", 'güle güle'],
    ["{ osm: 'صباح الخير يا صديق'", "{ osm: 'گوناي دين يا دوست'", 'günaydın'],
    ["{ osm: 'كيف حالك اليوم'", "{ osm: 'بوگون ناصل سين'", 'nasılsın'],
    ["{ osm: 'بخير الحمد لله'", "{ osm: 'ايييم الحمد'", 'iyiyim'],
    ["{ osm: 'السلام عليكم'", "{ osm: 'سلام عليكم'", 'selam'],
    ["{ osm: 'وعليكم السلام'", "{ osm: 'عليكم سلام'", 'aleyküm selam'],
    ["{ osm: 'اتمنى لك يوما سعيدا'", "{ osm: 'ايى گونلر ديلييورم'", 'dilerim'],
    ["{ osm: 'انا طالب'", "{ osm: 'بن طالبم'", 'öğrenciyim'],
    ["{ osm: 'هذا كتاب جميل'", "{ osm: 'بو گوزل كتاب'", 'bu kitap'],
    ["{ osm: 'اذهب الى المدرسة'", "{ osm: 'مدرسه يه گيدييورم'", 'okula gidiyorum'],
    ["{ osm: 'احب وطني'", "{ osm: 'وطن سورييورم'", 'vatan seviyorum'],
    ["{ osm: 'العلم نور'", "{ osm: 'علم نور'", 'ilim nur'],
    ["{ osm: 'بالصبر تفتح الابواب'", "{ osm: 'صبر ایله كاپılar آچيلır'", 'sabır'],
    ["{ osm: 'عدالة و رحمة'", "{ osm: 'عدالت و رحمت'", 'adalet rahmet'],
    ["{ osm: 'او ايى'", "{ osm: 'آو ايى'", 'ev iyi'],
    ["{ osm: 'او ده اوكونييورم'", "{ osm: 'آو ده اوقونييورم'", 'evde okuyorum'],
].forEach(([a, b, c]) => rep(a, b, c));

// Yazım düzeltmeleri (regex)
[
    [/وقورم/g, `وقونييور${M}`, 'okuyorum'],
    [/يازرم/g, `يازييور${M}`, 'yazıyorum-yazrm'],
    [/يازارم/g, `يازييور${M}`, 'yazıyorum-yazarm'],
    [/سوریورم/g, `سورييور${M}`, 'seviyorum'],
    [/ایستیورم/g, `ايستييور${M}`, 'istiyorum-ye'],
    [/ایستیورم/g, `ايستييور${M}`, 'istiyorum-ye2'],
].forEach(([re, to, label]) => {
    if (re.test(s)) {
        s = s.replace(re, to);
        console.log('REGEX OK:', label);
    }
});

// GRAMMAR soruları
[
    ["osm: '«كتابُ الطّالِبِ» tamlamasında «الطّالِبِ» hangi i\\'rabı alır?'", "osm: '«طالب كتابى» tamlamasında «كتابى» hangi i\\'rabı alır?'"],
    ["osm: '«مِنَ البَيْتِ» ifadesinde «مِنْ» hangi görevdedir?'", "osm: '«آودن» ifadesinde «دن» hangi görevdedir?'"],
    ["osm: '«يَكْتُبُ الطّالِبُ» cümlesinde «يَكْتُبُ» hangi kiptedir?'", "osm: '«طالب يازييور» cümlesinde «يازييور» hangi kiptedir?'"],
    ["osm: '«كَتَبَ» fiilinin babı (kök yapısı) hangisidir?'", "osm: '«يازدى» fiilinin babı (kök yapısı) hangisidir?'"],
    ["osm: '«الْعِلْمُ نُورٌ» cümlesinde «نُورٌ» hangi i\\'rabı alır?'", "osm: '«علم نور» cümlesinde «نور» hangi i\\'rabı alır?'"],
    ["osm: '«بِسْمِ اللّٰهِ» de «بِ» harfinden sonra gelen isim hangi haldedir?'", "osm: '«بسم الله» de «ب» harfinden sonra gelen isim hangi haldedir?'"],
    ["osm: '«مَدْرَسَةُ الْعُلَمَاءِ» izafetinde son kelime neyi gösterir?'", "osm: '«علما مدرسه‌سی» izafetinde son kelime neyi gösterir?'"],
    ["osm: '«لَا يَكْتُبُ» olumsuzluğu hangi araçla kurulmuştur?'", "osm: '«يازمييور» olumsuzluğu hangi araçla kurulmuştur?'"],
    ["answer: '«لَا» nafy edatı'", "answer: '-miyor olumsuzluk eki'"],
    ["wrong: ['«مَا» istifham', '«إِنْ» şart', '«قَدْ» tahkik']", "wrong: ['«يوخ» edatı', '«دگل» edatı', '«نه» soru zamiri']"],
    ["osm: '«اِقْرَأْ» fiili hangi emir kalıbındadır?'", "osm: '«اوقۇ» fiili hangi emir kalıbındadır?'"],
    ["osm: '«فِي الْمَدْرَسَةِ» de «فِي» hangi anlamı taşır?'", "osm: '«مدرسه ده» de «ده» hangi anlamı taşır?'"],
    ["osm: '«عَلَى الطّالِبِ» ifadesinde «عَلَى» sonrası isim hangi haldedir?'", "osm: '«طالب اوزرنده» ifadesinde «اوزرنده» sonrası isim hangi haldedir?'"],
    ["osm: '«كانَ» yardımcı fiili genelde ne oluşturur?'", "osm: '«يدى» yardımcı fiili genelde ne oluşturur?'"],
    ["osm: '«لِلطّالِبِ» deki «لِ» (lam-ı ıdık) ne anlatır?'", "osm: '«طالبه» deki aidiyet eki ne anlatır?'"],
    ["osm: '«مَا» harfi soru bağlamında ne işlev görür?'", "osm: '«نه» zamiri soru bağlamında ne işlev görür?'"],
    ["osm: '«يُكْتَبُ» fiilinde «يُ» öneki ve «ت» arasındaki ilişki neyi gösterir?'", "osm: '«يازيلير» fiilinde edilgen «يل» eki neyi gösterir?'"],
    ["osm: '«الطّالِبُ الْمُجْتَهِدُ» de ikinci sıfat neye bağlanır?'", "osm: '«مجتهد طالب» de ikinci sıfat neye bağlanır?'"],
    ["osm: '«إِنَّ» harfi cümlede genelde ne getirir?'", "osm: '«محقّقكه» sözü cümlede genelde ne getirir?'"],
    ["osm: '«لَمْ يَكْتُبْ» yapısı hangi zaman anlamına yakındır?'", "osm: '«يازمدى» yapısı hangi zaman anlamına yakındır?'"],
    ["osm: '«بِالْعِلْمِ» tamlamasında «الْعِلْمِ» hangi haldedir?'", "osm: '«علم ايله» tamlamasında «علم» hangi haldedir?'"],
    ["osm: '«مَنْ» zamiri genelde ne sorar?'", "osm: '«كيم» zamiri genelde ne sorar?'"],
    ["osm: '«هٰذَا» işaret zamiri neye işaret eder?'", "osm: '«بو» işaret zamiri neye işaret eder?'"],
].forEach(([a, b]) => rep(a, b));

// Konu notları
rep(
    "harficer: 'Harf-i cer: Sonraki ismi cer yapar. Sık gördüklerin: مِنْ (den), فِي (içinde), عَلَى (üzerinde), بِـ (ile), لِـ (için/-e ait).'",
    "harficer: 'Harf-i cer / ekler: Sonraki ismi cer yapar. Sık gördüklerin: دن (den), ده (içinde), اوزرنده (üzerinde), ile (ile), e/ait (için).'"
);
rep(
    "nefy: 'Olumsuzluk: لَا (genel nefy), لَمْ + muzâri (geçmişte olmama), مَا (soru veya nefy bağlamına göre).'",
    "nefy: 'Olumsuzluk: -miyor/-mez (genel), -madı/-medi (geçmişte olmama), يوخ/دگل (olumsuz edat).'"
);
rep(
    "zamir: 'Zamirler: مَنْ (kim), مَا (ne), هٰذَا (bu), ذٰلِكَ (şu/ o) — cümlede ismin yerini tutar.'",
    "zamir: 'Zamirler: كيم (kim), نه (ne), بو (bu), آن (şu/o) — cümlede ismin yerini tutar.'"
);
rep(
    "tekid: 'Tekid harfleri: إِنَّ pekiştirir; isim cümlesinde mübtedâ-haber ilişkisini güçlendirir.'",
    "tekid: 'Tekid: محقّقكه / حقّاً pekiştirir; isim cümlesinde mübtedâ-haber ilişkisini güçlendirir.'"
);
rep(
    "detail: 'Olumsuzluk Arapçada farklı araçlarla kurulur. لَا genel nefy için; لَمْ geçmişte olmama için muzâri fiille; مَا bağlama göre nefy veya soru anlamı taşır.'",
    "detail: 'Olumsuzluk Osmanlıca/Türkçede farklı eklerle kurulur. -miyor genel olumsuzluk; -madı geçmişte olmama; يوخ/دگل edatları da kullanılır.'"
);
rep(
    "detail: 'Zamirler ismin yerini tutar. Soru zamirleri مَنْ (kim) ve مَا (ne); işaret zamirleri هٰذَا (bu), ذٰلِكَ (şu/o) sık görülür.'",
    "detail: 'Zamirler ismin yerini tutar. Soru zamirleri كيم (kim) ve نه (ne); işaret zamirleri بو (bu), آن (şu/o) sık görülür.'"
);
rep(
    "detail: 'إِنَّ ve benzeri tekid harfleri cümleye pekiştirme katar. İsim cümlesinde mübtedâ ile haber arasındaki ilişkiyi güçlendirir; çeviride «şüphesiz, gerçekten» hissi verir.'",
    "detail: 'محقّقكه ve benzeri tekid sözleri cümleye pekiştirme katar. İsim cümlesinde mübtedâ ile haber arasındaki ilişkiyi güçlendirir; çeviride «şüphesiz, gerçekten» hissi verir.'"
);
rep(
    "detail: 'Arapça fiiller kök + kalıp ile çekilir. Mâzî geçmiş, muzâri şimdiki/geniş zaman, emir ve nehy emir yasak kipleridir. Mastar (kök hâli) isim gibi kullanılabilir.'",
    "detail: 'Osmanlıca fiiller kök + ek ile çekilir. Mâzî (geçmiş: -dı/-di), muzâri (şimdiki: -yor), emir (-!, -iniz) kipleridir. Mastar (-mak/-mek) isim gibi kullanılabilir.'"
);

// Örnek cümleler
rep(
    `'الطّالِبُ — öğrenci (merfû\\', mübtedâ)',\n                'الطّالِبَ — öğrenciyi (mansûb, mef\\'ûl)',\n                'الطّالِبِ — öğrencinin / öğrenciye (mecrûr, harf-i cer sonrası)'`,
    `'طالب — öğrenci (merfû\\', mübtedâ)',\n                'طالبی — öğrenciyi (mansûb, mef\\'ûl)',\n                'طالبده — öğrencide (mecrûr, -de eki sonrası)'`
);
rep(
    `'مِنَ البَيْتِ — evden',\n                'فِي المَدْرَسَةِ — okulda',\n                'عَلَى الطّاوِلَةِ — masanın üzerinde',\n                'بِالقَلَمِ — kalemle'`,
    `'آودن — evden',\n                'مدرسه ده — okulda',\n                'ميز اوزرنده — masanın üzerinde',\n                'قلم ايله — kalemle'`
);
rep(
    `'كَتَبَ — yazdı (mâzî)',\n                'يَكْتُبُ — yazar / yazıyor (muzâri)',\n                'اُكْتُبْ — yaz! (emir)',\n                'كِتَابَةٌ — yazma (mastar)'`,
    `'يازدى — yazdı (mâzî)',\n                'يازييور — yazar / yazıyor (muzâri)',\n                'ياز! — yaz! (emir)',\n                'يازمق — yazma (mastar)'`
);
rep(
    `'كتابُ الطّالِبِ — öğrencinin kitabı',\n                'بابُ البَيْتِ — evin kapısı',\n                'مدرسةُ العلماءِ — alimlerin okulu'`,
    `'طالب كتابى — öğrencinin kitabı',\n                'آو قاپيسى — evin kapısı',\n                'علما مدرسه‌سی — alimlerin okulu'`
);
rep(
    `'كِتابٌ — bir kitap (merfû\\')',\n                'طالِبًا — bir öğrenciyi (mansûb)',\n                'بَيْتٍ — bir evden / bir evin (mecrûr)'`,
    `'بر كتاب — bir kitap (merfû\\')',\n                'بر طالب — bir öğrenciyi (mansûb)',\n                'بر آودن — bir evden (mecrûr)'`
);
rep(
    `'لَا يَكْتُبُ — yazmıyor',\n                'لَمْ يَكْتُبْ — yazmadı',\n                'مَا ذَهَبَ — gitmedi'`,
    `'يازمييور — yazmıyor',\n                'يازمدى — yazmadı',\n                'گيتمدى — gitmedi'`
);
rep(
    `'كِتابٌ جَمِيلٌ — güzel bir kitap',\n                'الطّالِبُ المُجْتَهِدُ — çalışkan öğrenci',\n                'بَيْتٌ كَبِيرٌ — büyük bir ev'`,
    `'گوزل بر كتاب — güzel bir kitap',\n                'مجتهد طالب — çalışkan öğrenci',\n                'بويوك بر آو — büyük bir ev'`
);
rep(
    `'مَنْ أَنْتَ؟ — sen kimsin?',\n                'مَا هٰذَا؟ — bu nedir?',\n                'ذٰلِكَ كِتابٌ — şu bir kitaptır'`,
    `'كيم سن؟ — sen kimsin?',\n                'بو نه؟ — bu nedir?',\n                'آن بر كتاب — şu bir kitaptır'`
);
rep(
    `'إِنَّ اللّٰهَ غَفُورٌ — şüphesiz Allah bağışlayandır',\n                'إِنَّ العِلْمَ نُورٌ — ilim gerçekten nurdur'`,
    `'محقّقكه الله غفوردر — şüphesiz Allah bağışlayandır',\n                'محقّقكه علم نوردر — ilim gerçekten nurdur'`
);

// Harf örnekleri
s = s.replace(
    `const LETTER_WORD_SAMPLES = {
        Elif: ['اِسْم — isim', 'اُسْتَاد — usta / hoca'],
        Be: ['بَيْt — ev', 'بَاب — kapı'],`,
    `const LETTER_WORD_SAMPLES = {
        Elif: ['اسم — isim', 'استاد — usta / hoca'],
        Be: ['آو — ev', 'قاپى — kapı'],`
);
// Fix Be line - file has بَيْt with typo, use regex
s = s.replace(/Be: \['[^']+', '[^']+'\]/, "Be: ['آو — ev', 'قاپى — kapı']");
s = s.replace(/Te: \['[^']+', '[^']+'\]/, "Te: ['طالب — öğrenci', 'تعليم — öğretim']");
s = s.replace(/Sin: \['[^']+', '[^']+'\]/, "Sin: ['سلام — selam', 'سؤال — soru']");
s = s.replace(/Nun: \['[^']+', '[^']+'\]/, "Nun: ['نور — nur', 'نجاح — başarı']");
s = s.replace(/Mim: \['[^']+', '[^']+'\]/, "Mim: ['مدرسه — okul', 'ملت — millet']");
s = s.replace(/Lam: \['[^']+', '[^']+'\]/, "Lam: ['لغه — dil', 'گجه — gece']");
s = s.replace(/He: \['[^']+', '[^']+'\]/, "He: ['بو — bu', 'او — o']");
s = s.replace(/Vav: \['[^']+', '[^']+'\]/, "Vav: ['وطن — vatan', 'وقت — vakit']");
s = s.replace(/Dal: \['[^']+', '[^']+'\]/, "Dal: ['درس — ders', 'دنيا — dünya']");
s = s.replace(/Re: \['[^']+', '[^']+'\]/, "Re: ['رحمت — rahmet', 'رأى — görüş']");
s = s.replace(/Kef: \['[^']+', '[^']+'\]/, "Kef: ['كتاب — kitap', 'كلمه — kelime']");
s = s.replace(/Cim: \['[^']+', '[^']+'\]/, "Cim: ['جميل — güzel', 'جامع — cami']");
s = s.replace(/Fe: \['[^']+', '[^']+'\]/, "Fe: ['فكر — fikir', 'فضل — fazilet']");
s = s.replace(/Ha: \['[^']+', '[^']+'\]/, "Ha: ['حق — hak', 'حكمت — hikmet']");
s = s.replace(/Şın: \['[^']+', '[^']+'\]/, "Şın: ['شكر — şükür', 'شرف — şeref']");
s = s.replace(/Sad: \['[^']+', '[^']+'\]/, "Sad: ['صبر — sabır', 'صدق — doğruluk']");
s = s.replace(/Kaf: \['[^']+', '[^']+'\]/, "Kaf: ['\u0642\u0644\u0645 \u2014 kalem', '\u0642\u0631\u0622\u0646 \u2014 Kur\\'an']");
s = s.replace(/Ayn: \['[^']+', '[^']+'\]/, "Ayn: ['\u0639\u0644\u0645 \u2014 ilim', '\u0639\u062F\u0644 \u2014 adalet']");
s = s.replace(/Gayn: \['[^']+', '[^']+'\]/, "Gayn: ['غربت — gurbet', 'غير — başka']");
s = s.replace(/Ze: \['[^']+', '[^']+'\]/, "Ze: ['ذكر — zikir', 'ذهب — altın / gitti']");

s = s.replace(
    '/** En az 2 kelimelik cümleler — decoy\'larda eş anlamlı yok */',
    '/** En az 2 kelimelik cümleler — Osmanlıca yazım (Arapça değil) */'
);

fs.writeFileSync(p, s);
console.log('\nAll done.');
