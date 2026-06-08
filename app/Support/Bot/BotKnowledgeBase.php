<?php

namespace App\Support\Bot;

class BotKnowledgeBase
{
    public static function lexicon(): array
    {
        return [
            'devlet' => 'دولة — yönetilen toprak, idare; günümüzde «devlet».',
            'kitap' => 'كتاب — yazılı eser; «kitap».',
            'ilim' => 'علم — bilgi, öğrenim; «ilim».',
            'kalp' => 'قلب — yürek; hem organ hem manevi «kalp».',
            'dua' => 'دعاء — niyaz, yakarış; «dua».',
            'masjid' => 'مسجد — namaz kılınan yer; «cami».',
            'camii' => 'مسجد — namaz kılınan yer; «cami».',
            'cami' => 'مسجد — namaz kılınan yer.',
            'hoca' => 'خوجه — öğretmen, usta; «hoca».',
            'talebe' => 'طالب — öğrenci, öğrenmek isteyen.',
            'ogrenci' => 'طالب — öğrenci (Osmanlıca: talebe).',
            'öğrenci' => 'طالب — öğrenci (Osmanlıca: talebe).',
            'sultan' => 'سلطان — hükümdar unvanı.',
            'padisah' => 'پادشاه — padişah, büyük hükümdar.',
            'padişah' => 'پادشاه — padişah.',
            'vatan' => 'وطن — yurt, memleket.',
            'dost' => 'دوست — arkadaş.',
            'güzel' => 'گزل — güzel.',
            'guzel' => 'گزل — güzel.',
            'kalem' => 'قلم — yazar aleti; «kalem».',
            'su' => 'ماء — su.',
            'gün' => 'يوم — gün.',
            'gece' => 'ليل — gece.',
            'yol' => 'طريق — yol.',
            'ev' => 'بيت — ev.',
            'anne' => 'أم — anne.',
            'baba' => 'أب — baba.',
        ];
    }

    public static function letters(): array
    {
        return [
            'elif' => "Elif (ا): Arap alfabesinin ilk harfidir.\n• Yalın: ا\n• Başta: ا...\n• Ortada: ...ا...\n• Sonda: ...ا\nKelime başında genelde «a/e» sesi verir.",
            'be' => "Be (ب): «B» sesi verir.\n• Yalın: ب\n• Başta: بـ\n• Ortada: ـبـ\n• Sonda: ـب\nÖrnek: باب (bab) = kapı.",
            'te' => "Te (ت): «T» sesi verir.\n• Yalın: ت\n• Başta: تـ\n• Ortada: ـتـ\n• Sonda: ـت\nÖrnek: كتاب (kitâb) = kitap.",
            'cim' => "Cim (ج): «C» sesi verir.\n• Başta: جـ\nÖrnek: جميل (cemîl) = güzel.",
            'ha' => "Ha (ح): Boğazdan gelen «h» sesi.\nÖrnek: حب (hubb) = sevgi.",
            'dal' => "Dal (د): «D» sesi verir.\nÖrnek: دين (dîn) = din.",
            're' => "Re (ر): «R» sesi verir.\nÖrnek: رحمة (rahmet) = merhamet.",
            'sin' => "Sin (س): «S» sesi verir.\nÖrnek: سلام (selâm) = selam.",
            'shin' => "Şın (ش): «Ş» sesi verir.\nÖrnek: شكر (şükr) = şükür.",
            'ain' => "Ayn (ع): Boğazdan gelen derin ses.\nÖrnek: علم (ilm) = ilim.",
            'fa' => "Fe (ف): «F» sesi verir.\nÖrnek: فضل (fadl) = fazilet.",
            'kaf' => "Kaf (ك): «K» sesi verir.\nÖrnek: كتاب (kitâb) = kitap.",
            'lam' => "Lam (ل): «L» sesi verir.\nÖrnek: لسان (lisân) = dil.",
            'mim' => "Mim (م): «M» sesi verir.\nÖrnek: محمد (Muhammed).",
            'nun' => "Nun (ن): «N» sesi verir.\nÖrnek: نور (nûr) = nur.",
            'vav' => "Vav (و): «V/u/ü/o» sesleri.\nÖrnek: وطن (vatan) = vatan.",
            'ye' => "Ye (ي): «Y/i/ı» sesleri.\nÖrnek: يوم (yevm) = gün.",
        ];
    }

    public static function phrases(): array
    {
        return [
            'merhaba' => 'مرحبا — Merhaba',
            'merhaba dünya' => 'مرحبا دنيا — Merhaba dünya',
            'günaydın' => 'صباح الخير — Günaydın',
            'iyi akşamlar' => 'مساء الخير — İyi akşamlar',
            'teşekkürler' => 'شكراً — Teşekkürler',
            'tesekkurler' => 'شكراً — Teşekkürler',
            'hoş geldin' => 'أهلاً وسهلاً — Hoş geldin',
            'hos geldin' => 'أهlaً وسهlaً — Hoş geldin',
            'allaha emanet ol' => 'مع السلامة — Allaha emanet ol',
            'osmanlıca öğreniyorum' => 'أتعلم العثمانية — Osmanlıca öğreniyorum',
            'kitap okuyorum' => 'أقرأ كتاباً — Kitap okuyorum',
            'nasılsın' => 'كيف حالك — Nasılsın?',
            'iyiyim' => 'أنا بخير — İyiyim',
        ];
    }

    public static function wisdom(): array
    {
        return [
            "«İlim öğrenmek her Müslüman erkek ve kadına farzdır.»\n— İbn Mâce\n\nİlim yolunda küçük adımlar büyük sevap getirir ✨",
            "«Sabır nurdur.» (Buhârî)\n\nOsmanlıca öğrenmek zaman ister; her gün kısa tekrarlarla ilerle.",
            "«Beşikten mezara kadar ilim öğrenin.»\n— el-Hâkim\n\nLisanı Ecdad ile hem dil hem kültür birikimi kazanırsın.",
            "«Dünyada bir yabancı ya da yolcu gibi ol.»\n— Buhârî\n\nGeçmişin dilini öğrenmek, köklerini anlamana yardım eder.",
            "«Mümin mümine ayna gibidir.»\n— Ebu Dâvud\n\nBirbirine yardım eden öğrenciler daha hızlı ilerler ✨",
            "«Kolaylaştırınız, zorlaştırmayınız.»\n— Buhârî\n\nOsmanlıca öğrenirken acele etme; günde bir harf bile yeter.",
            "«Güzel söz sadakadır.»\n— Buhârî\n\nÖğrendiğin kelimeleri güzel sözlerle paylaş.",
            "«İşi en iyi yapan, işi en güzel yapan değil; işi zamanında yapan kimsedir.»\n\nDüzenli tekrar, dil öğrenmenin anahtarıdır ✨",
        ];
    }

    public static function appHelp(): array
    {
        return [
            'test' => "Testler sekmesinden seviye seçip soru çözebilirsin.\nDoğru cevaplar XP kazandırır; Gelişim sekmesinden ilerlemeni takip et 📊",
            'harf' => "Harfler sekmesinde Osmanlı alfabesini incele.\nHer harfin yalın, başta, ortada ve sondaki biçimlerini görebilirsin 📜",
            'liderlik' => "Profil sekmesinde liderlik tablosu var.\nSınıf arkadaşlarınla XP sıralamasını karşılaştırabilirsin 🏆",
            'sinif' => "Ayarlar → Sınıfa Katıl bölümünden hoca kodunu girerek sınıfa dahil olursun.",
            'odev' => "Hocanın verdiği ödevler sınıf panelinde görünür.\nÖdevler sekmesinden takip edebilirsin.",
            'mesaj' => "Mesajlar bölümünden hocana ve sınıf arkadaşlarına yazabilirsin 💬",
        ];
    }
}
