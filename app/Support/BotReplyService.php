<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class BotReplyService
{
    public function reply(User $bot, string $userMessage): string
    {
        $key = $this->botKey($bot);
        $lower = mb_strtolower(trim($userMessage));

        if ($this->isGreeting($lower)) {
            return $this->greeting($key);
        }

        return match ($key) {
            'elif' => $this->elifReply($lower, $userMessage),
            'lugat' => $this->lugatReply($lower, $userMessage),
            'tercume' => $this->tercumeReply($lower, $userMessage),
            'hikmet' => $this->hikmetReply($lower, $userMessage),
            default => $this->studentBotReply($bot, $lower),
        };
    }

    private function botKey(User $bot): string
    {
        foreach (AiBotRegistry::BOTS as $entry) {
            if (($entry['email'] ?? '') === $bot->email) {
                return $entry['slug'] ?? 'generic';
            }
        }

        $email = Str::lower($bot->email ?? '');

        if (str_contains($email, 'elif')) {
            return 'elif';
        }
        if (str_contains($email, 'lugat')) {
            return 'lugat';
        }
        if (str_contains($email, 'tercume')) {
            return 'tercume';
        }
        if (str_contains($email, 'hikmet')) {
            return 'hikmet';
        }

        return 'generic';
    }

    private function studentBotReply(User $bot, string $lower): string
    {
        $name = $bot->name ?: 'Arkadaş';

        if ($this->isGreeting($lower)) {
            return "Selam! Ben {$name} 👋\nOsmanlıca çalışıyorum. Sen de test çözdün mü? Birlikte ilerleyelim!";
        }

        if (preg_match('/(test|sınav|sinav|xp|puan|ödev|odev)/u', $lower)) {
            return "Ben de test çözüyorum! Gelişim sekmesinden skorlarına bakabilir, liderlik tablosunda sıralamayı görebilirsin 📊";
        }

        if (preg_match('/(harf|elifba|kelime|tercüme|tercume)/u', $lower)) {
            return "Harfler ve testler sekmesinden pratik yapıyorum. Elif, Lügat ve Tercüme asistanlarına da sorabilirsin — onlar çok yardımcı oluyor!";
        }

        return "Merhaba! Ben {$name}.\nOsmanlıca öğreniyoruz — sorularını yaz, sohbet edelim. İyi çalışmalar! 📚";
    }

    private function isGreeting(string $lower): bool
    {
        return (bool) preg_match('/\b(merhaba|selam|sa|slm|hey|günaydın|iyi akşamlar|hello|hi)\b/u', $lower);
    }

    private function greeting(string $key): string
    {
        return match ($key) {
            'elif' => "Selam! Ben Elif 📜\nOsmanlı alfabesindeki harfleri, okunuşları ve yazılış biçimlerini sorabilirsin. Örn: «Be harfi nedir?»",
            'lugat' => "Merhaba! Ben Lügat 📖\nOsmanlıca kelimelerin anlamını ve kökenini açıklarım. Örn: «Devlet kelimesi ne demek?»",
            'tercume' => "Selam! Ben Tercüme 🔄\nTürkçe–Osmanlıca çeviri konusunda yardımcı olurum. Örn: «Merhaba dünya Osmanlıcada nasıl yazılır?»",
            'hikmet' => "Esselâmü aleyküm! Ben Hikmet ✨\nHadis, öğüt ve ilim yolunda kısa hatırlatmalar paylaşırım. Örn: «İlim hakkında bir söz»",
            default => 'Merhaba! Size nasıl yardımcı olabilirim?',
        };
    }

    private function elifReply(string $lower, string $original): string
    {
        if (preg_match('/\b(elif|ا)\b/u', $lower)) {
            return "Elif (ا): Arap alfabesinin ilk harfidir.\n• Yalın: ا\n• Başta: ا...\n• Ortada: ...ا...\n• Sonda: ...ا\nKelime başında genelde «a/e» sesi verir. Harfler sekmesinden tüm biçimlerini inceleyebilirsin.";
        }
        if (preg_match('/\b(be|ب)\b/u', $lower)) {
            return "Be (ب): «B» sesi verir.\n• Yalın: ب\n• Başta: بـ\n• Ortada: ـبـ\n• Sonda: ـب\nÖrnek: باب (bab) = kapı.";
        }
        if (preg_match('/\b(te|ت)\b/u', $lower)) {
            return "Te (ت): «T» sesi verir.\n• Yalın: ت\n• Başta: تـ\n• Ortada: ـتـ\n• Sonda: ـت\nÖrnek: كتاب (kitâb) = kitap.";
        }
        if (preg_match('/(harf|elifba|elifbas|yazılış|okunuş|hece)/u', $lower)) {
            return "Osmanlı elifbasında 28 temel harf vardır. Her harfin yalın, başta, ortada ve sonda yazılışı farklıdır.\nUygulamada Harfler sekmesine git; bir harfe dokunarak biçimlerini ve örnek kelimeleri görebilirsin.\nBelirli bir harf sorarsan ayrıntılı anlatırım.";
        }
        if (preg_match('/(nokta|hareke|ünlü|sesli)/u', $lower)) {
            return "Osmanlıca metinlerde hareke (ünlü işareti) çoğu zaman yazılmaz; okuyucu bağlamdan okur.\n• Fetha: a/e\n• Kesra: i\n• Damme: u/ü\nPratik için önce harfleri tanı, sonra kelime okumaya geç.";
        }

        return "Harfler, okunuş ve yazılış konularında yardımcı olurum.\nŞunları sorabilirsin:\n• «Elif harfi nedir?»\n• «Be harfinin kelime içi biçimleri»\n• «Hareke nedir?»\nHarfler sekmesini de kullanmayı unutma 📜";
    }

    private function lugatReply(string $lower, string $original): string
    {
        $lexicon = [
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
        ];

        foreach ($lexicon as $word => $meaning) {
            if (str_contains($lower, trim($word))) {
                return "«{$word}» kelimesi:\n{$meaning}\nBaşka bir kelime yaz, anlamını ve Osmanlıca karşılığını bulalım 📖";
            }
        }

        if (preg_match('/(anlam|ne demek|manası|lugat|sözlük|kelime)/u', $lower)) {
            return "Kelime anlamlarında yardımcı olurum.\nBir kelime yaz: Osmanlıca yazılışı ve Türkçe karşılığını paylaşayım.\nÖrnekler: devlet, kitap, ilim, talebe, sultan, dua.";
        }

        $word = trim(preg_replace('/[^\p{L}\p{N}\s]/u', '', $original));
        if (mb_strlen($word) >= 2 && mb_strlen($word) <= 40) {
            return "«{$word}» için sözlükte hazır bir karşılık bulamadım.\nKelimeyi cümle içinde yazarsan bağlamdan anlam çıkarmaya çalışırım.\nŞu kelimeleri deneyebilirsin: devlet, kitap, ilim, hoca, talebe, sultan.";
        }

        return "Merhaba! Lügat 📖\nOsmanlıca–Türkçe kelime anlamları sor.\nÖrnek: «kitap ne demek?» veya «sultan kelimesi»";
    }

    private function tercumeReply(string $lower, string $original): string
    {
        $phrases = [
            'merhaba' => 'مرحبا — Merhaba',
            'merhaba dünya' => 'مرحبا دنيا — Merhaba dünya',
            'günaydın' => 'صباح الخير — Günaydın',
            'iyi akşamlar' => 'مساء الخير — İyi akşamlar',
            'teşekkürler' => 'شكراً — Teşekkürler',
            'tesekkurler' => 'شكراً — Teşekkürler',
            'hoş geldin' => 'أهلاً وسهلاً — Hoş geldin',
            'hos geldin' => 'أهلاً وسهلاً — Hoş geldin',
            'allaha emanet ol' => 'مع السلامة — Allaha emanet ol',
            'osmanlıca öğreniyorum' => 'أتعلم العثمانية — Osmanlıca öğreniyorum',
            'kitap okuyorum' => 'أقرأ كتاباً — Kitap okuyorum',
        ];

        foreach ($phrases as $phrase => $translation) {
            if (str_contains($lower, $phrase)) {
                return "Çeviri:\n{$translation}\nOsmanlıca metin sağdan sola yazılır. Uygulamadaki Osmanlıca sekmesinden de deneme yapabilirsin 🔄";
            }
        }

        if (preg_match('/(çevir|tercüme|tercume|osmanlıca nasıl|osmanlica nasıl|yazılır|yazilir)/u', $lower)) {
            return "Tercüme 🔄\nTürkçe bir cümle veya kelime yaz; Osmanlıca karşılığını vermeye çalışayım.\nÖrnekler:\n• «Merhaba dünya»\n• «Günaydın»\n• «Kitap okuyorum»\nNot: Osmanlıca yazımda harf birleşimlerine dikkat edilir.";
        }

        $clean = trim($original);
        if (mb_strlen($clean) >= 2 && mb_strlen($clean) <= 120) {
            return "«{$clean}» ifadesi için şu an hazır çeviri kalıbım yok.\nDaha kısa ve net yaz: «Merhaba», «Teşekkürler», «Kitap okuyorum» gibi.\nOsmanlıca sekmesinde de metin deneyebilirsin.";
        }

        return "Tercüme 🔄\nTürkçe yaz, Osmanlıca karşılığını bulalım.\nÖrnek: «Merhaba dünya» veya «Günaydın»";
    }

    private function hikmetReply(string $lower, string $original): string
    {
        if (preg_match('/(hadis|hadisi|peygamber|sünnet)/u', $lower)) {
            return "«İlim öğrenmek her Müslüman erkek ve kadına farzdır.»\n— İbn Mâce, Sünnet, 224\n\nİlim yolunda küçük adımlar büyük sevap getirir. Bugün bir harf, bir kelime öğren ✨";
        }
        if (preg_match('/(sabır|sabir)/u', $lower)) {
            return "«Sabır nurdur.» (Buhârî)\n\nOsmanlıca öğrenmek zaman ister; her gün kısa tekrarlarla ilerle.";
        }
        if (preg_match('/(ilim|öğren|ogren|okul|ders)/u', $lower)) {
            return "«Beşikten mezara kadar ilim öğrenin.»\n— el-Hâkim\n\nLisanı Ecdad ile hem dil hem kültür birikimi kazanırsın. Harfler ve testlerle düzenli çalış ✨";
        }
        if (preg_match('/(dünya|dunya|ahiret)/u', $lower)) {
            return "«Dünyada bir yabancı ya da yolcu gibi ol.»\n— Buhârî\n\nGeçmişin dilini öğrenmek, köklerini anlamana yardım eder.";
        }
        if (preg_match('/(öğüt|ogut|nasihat|hikmet|söz|soz)/u', $lower)) {
            return $this->randomWisdom();
        }

        return $this->randomWisdom();
    }

    private function randomWisdom(): string
    {
        $items = [
            "«Mümin mümine ayna gibidir.»\n— Ebu Dâvud\n\nBirbirine yardım eden öğrenciler daha hızlı ilerler ✨",
            "«Kolaylaştırınız, zorlaştırmayınız.»\n— Buhârî\n\nOsmanlıca öğrenirken acele etme; günde bir harf bile yeter.",
            "«Güzel söz sadakadır.»\n— Buhârî\n\nÖğrendiğin kelimeleri güzel sözlerle paylaş.",
            "«İşi en iyi yapan, işi en güzel yapan değil; işi zamanında yapan kimsedir.»\n\nDüzenli tekrar, dil öğrenmenin anahtarıdır ✨",
        ];

        return $items[array_rand($items)];
    }
}
