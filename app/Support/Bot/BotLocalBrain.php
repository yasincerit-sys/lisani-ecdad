<?php

namespace App\Support\Bot;

use App\Models\Message;
use App\Models\User;

class BotLocalBrain
{
    public function reply(User $bot, User $human, string $userMessage, array $history): string
    {
        $slug = BotPersonas::slugFor($bot);
        $lower = mb_strtolower(trim($userMessage));
        $persona = BotPersonas::forBot($bot);
        $name = $bot->name ?: 'Arkadaş';

        if ($this->isThanks($lower)) {
            return $this->withPersonality($slug, $name, $this->thanksReply($slug));
        }

        if ($this->isFarewell($lower)) {
            return $this->withPersonality($slug, $name, "Görüşürüz! Osmanlıca yolculuğunda başarılar dilerim 📚\nTekrar yazmak istersen buradayım.");
        }

        if ($this->isGreeting($lower)) {
            return $this->greeting($slug, $name, $human, $persona);
        }

        if ($this->isSmallTalk($lower)) {
            return $this->smallTalk($slug, $name, $lower, $persona);
        }

        $followUp = $this->followUpFromHistory($history, $lower);
        if ($followUp) {
            return $this->withPersonality($slug, $name, $followUp);
        }

        $intent = $this->detectIntent($lower, $persona['specialty'] ?? 'study');

        return match ($intent) {
            'elifba' => $this->withPersonality($slug, $name, $this->elifbaReply($lower, $userMessage)),
            'lugat' => $this->withPersonality($slug, $name, $this->lugatReply($lower, $userMessage)),
            'tercume' => $this->withPersonality($slug, $name, $this->tercumeReply($lower, $userMessage)),
            'hikmet' => $this->withPersonality($slug, $name, $this->hikmetReply($lower)),
            'app' => $this->withPersonality($slug, $name, $this->appReply($lower)),
            default => $this->withPersonality($slug, $name, $this->defaultReply($slug, $name, $lower, $userMessage, $persona)),
        };
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    public function formatHistoryForLlm(array $history, string $latestUserMessage, string $botName): array
    {
        $messages = [];

        foreach ($history as $row) {
            $role = ($row['is_bot'] ?? false) ? 'assistant' : 'user';
            $content = trim((string) ($row['body'] ?? ''));
            if ($content === '') {
                continue;
            }
            $messages[] = ['role' => $role, 'content' => $content];
        }

        $messages[] = ['role' => 'user', 'content' => $latestUserMessage];

        return $messages;
    }

    /**
     * @return array<int, array{body: string, is_bot: bool}>
     */
    public static function loadHistory(User $bot, User $human, int $limit = 12): array
    {
        return Message::query()
            ->where(function ($q) use ($human, $bot) {
                $q->where(function ($inner) use ($human, $bot) {
                    $inner->where('sender_id', $human->id)->where('receiver_id', $bot->id);
                })->orWhere(function ($inner) use ($human, $bot) {
                    $inner->where('sender_id', $bot->id)->where('receiver_id', $human->id);
                });
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->map(fn (Message $m) => [
                'body' => $m->body,
                'is_bot' => (int) $m->sender_id === (int) $bot->id,
            ])
            ->values()
            ->all();
    }

    private function isGreeting(string $lower): bool
    {
        return (bool) preg_match('/\b(merhaba|selam|sa|slm|hey|günaydın|gunaydin|iyi akşamlar|iyi aksamlar|hello|hi|selamün aleyküm|selamun aleykum|aleyküm selam)\b/u', $lower);
    }

    private function isThanks(string $lower): bool
    {
        return (bool) preg_match('/\b(teşekkür|tesekkur|sağol|sagol|eyvallah|thanks|thank you)\b/u', $lower);
    }

    private function isFarewell(string $lower): bool
    {
        return (bool) preg_match('/\b(görüşürüz|gorusuruz|hoşça kal|hosca kal|bye|güle güle|gule gule|allaha emanet)\b/u', $lower);
    }

    private function isSmallTalk(string $lower): bool
    {
        return (bool) preg_match('/(nasılsın|nasilsin|naber|ne haber|ne yapıyorsun|ne yapiyorsun|iyi misin|keyfin nasıl|bugün nasıl|bugun nasil)/u', $lower);
    }

    private function detectIntent(string $lower, string $specialty): string
    {
        if (preg_match('/(harf|elifba|elifbas|hece|hareke|nokta|yazılış|yazilis|okunuş|okunus)/u', $lower)) {
            return 'elifba';
        }
        if (preg_match('/(anlam|ne demek|manası|manasi|lugat|sözlük|sozluk|kelime|köken|koken)/u', $lower)) {
            return 'lugat';
        }
        if (preg_match('/(çevir|cevir|tercüme|tercume|osmanlıca nasıl|osmanlica nasil|yazılır|yazilir|arapça|arapca)/u', $lower)) {
            return 'tercume';
        }
        if (preg_match('/(hadis|hadisi|peygamber|sünnet|sunnet|hikmet|öğüt|ogut|nasihat|sabır|sabir|ilim söz|ilim soz)/u', $lower)) {
            return 'hikmet';
        }
        if (preg_match('/(test|sınav|sinav|xp|puan|ödev|odev|liderlik|seviye|gelişim|gelisim|profil|ayar|uygulama|nasıl kullan|nasil kullan)/u', $lower)) {
            return 'app';
        }

        return match ($specialty) {
            'elifba' => 'elifba',
            'lugat' => 'lugat',
            'tercume' => 'tercume',
            'hikmet' => 'hikmet',
            default => 'general',
        };
    }

    private function greeting(string $slug, string $name, User $human, array $persona): string
    {
        $student = $human->name ?: 'Arkadaş';

        $base = match ($slug) {
            'elif' => "Selam {$student}! 👋\nBen de harfler üzerinde çalışıyorum. Takıldığın bir harf varsa sor, birlikte bakalım.\nÖrn: «Be harfi nedir?»",
            'lugat' => "Merhaba {$student}! 👋\nKelime anlamlarına meraklıyım. Bir kelime yaz, beraber araştıralım.\nÖrn: «Devlet ne demek?»",
            'tercume' => "Selam {$student}! 👋\nÇeviri yapmayı seviyorum. Türkçe bir cümle yaz, Osmanlıcada nasıl olur bakalım.",
            'hikmet' => "Selamün aleyküm {$student}! 👋\nİlim ve güzel sözler hakkında konuşmayı severim. Sorunu yaz.",
            'zeynep' => "Merhaba {$student}! Ben Zeynep 🌟\nBugün hangi seviyede çalışıyorsun? Birlikte hedef koyalım!",
            'can' => "Selam {$student}! Ben Can 👋\nBen de yeni öğreniyorum — zorlandığın konuları konuşabiliriz.",
            default => "Merhaba {$student}! Ben {$name} 👋\n{$persona['focus']} konusunda sohbet edebiliriz. Sorularını yaz!",
        };

        return $base;
    }

    private function smallTalk(string $slug, string $name, string $lower, array $persona): string
    {
        $lines = match ($slug) {
            'mehmet' => "İyiyim, teşekkürler! Az önce test çözdüm — sen de Gelişim sekmesine bak 🎯\nSen nasılsın?",
            'ayse' => "İyiyim! Seviye 3'e hazırlanıyorum, düzenli tekrar çok işe yarıyor 📚\nSen bugün ne çalıştın?",
            'zeynep' => "Harika hissediyorum! Liderlik tablosunda yükselmek için her gün bir test çözüyorum 🏆\nSen nasılsın?",
            'can' => "Fena değilim! Bazen harfler karışıyor ama pes etmiyorum 😊\nSen hangi konuda takıldın?",
            'hikmet' => "Elhamdülillah iyiyim. İlim yolunda küçük adımlar büyük kazanç getirir ✨\nSen bugün ne öğrendin?",
            'elif' => "İyiyim, teşekkürler! Harfler sekmesinde elif–be–te tekrarı yaptım 📜\nSana hangi harfi anlatayım?",
            default => "İyiyim, teşekkürler! {$persona['focus']} üzerinde çalışıyorum 📚\nSen nasılsın, bugün ne öğrendin?",
        };

        return $lines;
    }

    private function thanksReply(string $slug): string
    {
        return match ($slug) {
            'hikmet' => "Rica ederim. İlim yolunda Allah yardımcın olsun ✨",
            'tercume' => "Rica ederim! Başka çeviri sorusu olursa yaz 🔄",
            'lugat' => "Ne demek! Yeni kelimeler öğrenmeye devam 📖",
            default => "Rica ederim! Başka sorun olursa yaz, buradayım 👋",
        };
    }

    private function elifbaReply(string $lower, string $original): string
    {
        foreach (BotKnowledgeBase::letters() as $key => $text) {
            if (preg_match('/\b('.preg_quote($key, '/').')\b/u', $lower)) {
                return $text."\nHarfler sekmesinden tüm biçimlerini de inceleyebilirsin 📜";
            }
        }

        if (preg_match('/(harf|elifba|elifbas|yazılış|okunuş|hece)/u', $lower)) {
            return "Osmanlı elifbasında 28 temel harf vardır. Her harfin yalın, başta, ortada ve sonda yazılışı farklıdır.\nUygulamada Harfler sekmesine git; bir harfe dokunarak biçimlerini görebilirsin.\nBelirli bir harf sor: «Elif», «Be», «Te» gibi 📜";
        }

        if (preg_match('/(nokta|hareke|ünlü|sesli)/u', $lower)) {
            return "Osmanlıca metinlerde hareke çoğu zaman yazılmaz; okuyucu bağlamdan okur.\n• Fetha: a/e\n• Kesra: i\n• Damme: u/ü\nPratik için önce harfleri tanı, sonra kelime okumaya geç.";
        }

        return "Harfler, okunuş ve yazılış konularında yardımcı olurum.\n«Elif harfi nedir?», «Be harfinin biçimleri», «Hareke nedir?» diye sorabilirsin 📜";
    }

    private function lugatReply(string $lower, string $original): string
    {
        foreach (BotKnowledgeBase::lexicon() as $word => $meaning) {
            if (str_contains($lower, trim($word))) {
                return "«{$word}» kelimesi:\n{$meaning}\nBaşka kelime yaz, birlikte inceleyelim 📖";
            }
        }

        $word = trim(preg_replace('/[^\p{L}\p{N}\s]/u', '', $original));
        if (mb_strlen($word) >= 2 && mb_strlen($word) <= 40 && ! preg_match('/\s/u', $word)) {
            return "«{$word}» için hazır karşılık bulamadım.\nKelimeyi cümle içinde yaz veya şunları dene: devlet, kitap, ilim, talebe, sultan, dua 📖";
        }

        return "Kelime anlamlarında yardımcı olurum.\nBir kelime yaz: Osmanlıca yazılışı ve Türkçe karşılığını paylaşayım.\nÖrnek: devlet, kitap, ilim, hoca, talebe 📖";
    }

    private function tercumeReply(string $lower, string $original): string
    {
        foreach (BotKnowledgeBase::phrases() as $phrase => $translation) {
            if (str_contains($lower, $phrase)) {
                return "Çeviri:\n{$translation}\nOsmanlıca metin sağdan sola yazılır. Osmanlıca sekmesinden de deneyebilirsin 🔄";
            }
        }

        $clean = trim($original);
        if (mb_strlen($clean) >= 2 && mb_strlen($clean) <= 120) {
            return "«{$clean}» için hazır çeviri kalıbım yok.\nDaha kısa yaz: «Merhaba», «Teşekkürler», «Kitap okuyorum» gibi.\nOsmanlıca sekmesinde de metin deneyebilirsin 🔄";
        }

        return "Türkçe yaz, Osmanlıca karşılığını bulalım 🔄\nÖrnek: «Merhaba dünya», «Günaydın», «Osmanlıca öğreniyorum»";
    }

    private function hikmetReply(string $lower): string
    {
        if (preg_match('/(hadis|hadisi|peygamber|sünnet|sunnet)/u', $lower)) {
            return BotKnowledgeBase::wisdom()[0];
        }

        $items = BotKnowledgeBase::wisdom();

        return $items[array_rand($items)];
    }

    private function appReply(string $lower): string
    {
        foreach (BotKnowledgeBase::appHelp() as $key => $text) {
            if (str_contains($lower, $key)) {
                return $text;
            }
        }

        return BotKnowledgeBase::appHelp()['test']."\n\nMesajlar, Profil, Ayarlar ve Harfler sekmelerini keşfet!";
    }

    private function defaultReply(string $slug, string $name, string $lower, string $original, array $persona): string
    {
        foreach (BotKnowledgeBase::lexicon() as $word => $meaning) {
            if (str_contains($lower, trim($word))) {
                return "«{$word}» hakkında:\n{$meaning}\nBu konuda daha fazla soru sorabilirsin 📖";
            }
        }

        $special = match ($slug) {
            'mehmet' => "Test çözmeyi seviyorum! Gelişim sekmesinden XP'ne bak — birlikte yarışalım mı? 🎯\nSorunu biraz daha açarsan yardımcı olurum.",
            'ayse' => "Düzenli tekrar çok önemli. Seviye 3'e geçmek için önce seviye 2'yi sağlamlaştır 📚\nNe öğrenmek istiyorsun?",
            'zeynep' => "Başarı için günde en az bir test öneririm. Liderlik tablosunu Profil'den kontrol et 🏆\nSorunu yaz, birlikte çözelim!",
            'can' => "Ben de bazen zorlanıyorum — özellikle hecelerde. Harfler sekmesinden tekrar yapmak işe yarıyor 😊\nSen ne sormak istedin?",
            'ece' => "Hece okumak için harfleri birleştirmeyi pratik et. «Be + e = be» gibi düşün 📜\nHangi konuda takıldın?",
            'burak' => "Karma testler seviye atlarken çok işe yarıyor! Testler sekmesinden dene 🎯\nSorunu detaylandırırsan yardımcı olurum.",
            'selin' => "Tekrar, tekrar, tekrar! Eski konuları unutmamak için haftada bir seviye 1 testi çözüyorum 📚\nNe hakkında konuşalım?",
            'emre' => "Seviye 3 metinleri okumaya başladım — tercüme pratiği şart 🔄\nOsmanlıca sorunu varsa yaz!",
            'deniz' => "Yeni kelimeler öğrenmek için Lügat'a da sorabilirsin — o da kelimelere meraklı 📖\nSen ne sormak istedin?",
            'fatma' => "Küçük hedefler koy: bugün 1 test, yarın 1 kelime. Ödev varsa hocana da yazabilirsin ✅\nNasıl yardımcı olayım?",
            'ali' => "Hızlı ilerlemek için hem test hem tercüme yapıyorum. Sorunu net yaz, birlikte bakalım 💪",
            'seda' => "Birlikte çalışmak daha eğlenceli! Moralini bozma, her gün bir adım yeter 👋\nNe konuşmak istersin?",
            default => "Osmanlıca öğrenme yolculuğunda yardımcı olmaya çalışırım.\nHarf, kelime, tercüme, test veya uygulama hakkında sorabilirsin 📚",
        };

        if (mb_strlen(trim($original)) >= 3) {
            return $special."\n\nMesajın: «".mb_strimwidth(trim($original), 0, 80, '…')."»";
        }

        return $special;
    }

    /**
     * @param  array<int, array{body: string, is_bot: bool}>  $history
     */
    private function followUpFromHistory(array $history, string $lower): ?string
    {
        if (count($history) < 2) {
            return null;
        }

        $lastBot = null;
        $lastUser = null;

        foreach (array_reverse($history) as $row) {
            if ($lastUser === null && ! ($row['is_bot'] ?? false)) {
                $lastUser = $row['body'] ?? '';
            }
            if ($lastBot === null && ($row['is_bot'] ?? false)) {
                $lastBot = $row['body'] ?? '';
            }
            if ($lastBot !== null && $lastUser !== null) {
                break;
            }
        }

        if (preg_match('/(evet|tamam|olur|peki|anladım|anladim|devam|daha fazla|bir örnek|ornek ver)/u', $lower)) {
            if ($lastBot && preg_match('/(harf|elif|be|te)/ui', $lastBot)) {
                return "Güzel! Bir sonraki adım: Harfler sekmesinde o harfin tüm biçimlerine dokun ve sesli oku.\nSonra aynı harfle başlayan kelimeleri dene: kitap (كتاب), kalp (قلب) 📜";
            }
            if ($lastBot && preg_match('/(kelime|lugat|anlam)/ui', $lastBot)) {
                return "Devam edelim 📖\nŞu kelimeleri de inceleyebilirsin: ilim (علم), dua (دعاء), vatan (وطن).\nHangisini açıklayayım?";
            }
            if ($lastBot && preg_match('/(çevir|tercüme|osmanlıca)/ui', $lastBot)) {
                return "Başka bir cümle dene 🔄\n«İyiyim», «Allaha emanet ol», «Osmanlıca öğreniyorum» gibi ifadeleri yazabilirsin.";
            }
        }

        if (preg_match('/(ne demek|anlamadım|anlamadim|açıkla|acikla|tekrar)/u', $lower) && $lastBot) {
            return "Tabii, daha sade anlatayım:\n".mb_strimwidth($lastBot, 0, 350, '…')."\n\nHâlâ net değilse örnekle sor!";
        }

        return null;
    }

    private function withPersonality(string $slug, string $name, string $body): string
    {
        $prefix = match ($slug) {
            'hikmet' => '',
            'elif', 'lugat', 'tercume' => '',
            default => '',
        };

        return $prefix.$body;
    }
}
