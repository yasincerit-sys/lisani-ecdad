        // --- GEÇMİŞ TEST SONUÇLARI VERİ TABANI ---
        let testHistory = [];

        // --- TOPLAM PUAN DEĞİŞKENİ (GÜVENLİ TAKİP) ---
        let totalScore = 0;
        window._lisaniServerStats = null;

        window.getLisaniProgress = function () {
            return {
                testHistory: testHistory.slice(),
                totalScore,
            };
        };

        window.setLisaniProgress = function (history, xp) {
            if (Array.isArray(history)) testHistory = history;
            if (typeof xp === 'number' && !Number.isNaN(xp)) totalScore = xp;
            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}
            updateLearningStats();
            updateUIPoints();
            if (typeof renderProgressChart === 'function') renderProgressChart();
            if (typeof renderQuizHistoryList === 'function') renderQuizHistoryList();
        };

        window.refreshAllLearningUI = function () {
            updateLearningStats();
            updateUIPoints();
            if (typeof renderProgressChart === 'function') renderProgressChart();
            if (typeof renderQuizHistoryList === 'function') renderQuizHistoryList();
        };

        // --- SORU BANKASI VERİLERİ (GÜNCELLENDİ: 4 SEVİYE x 20 SORU = TOPLAM 80 SORU) ---
        const quizBank = {
            1: {
                "Test 1": [
                    { word: "Osmanlı alfabesi kaç harften oluşmaktadır?", options: ["28", "29", "32", "34"], answer: "32" },
                    { word: "ا\n\nBu harfin adı hangisidir?", options: ["Elif", "Be", "Te", "Cim"], answer: "Elif" },
                    { word: "ب\n\nBu harfin adı hangisidir?", options: ["Elif", "Be", "Te", "Cim"], answer: "Be" },
                    { word: "پ\n\nBu harfin adı hangisidir?", options: ["Be", "Pe", "Te", "Cim"], answer: "Pe" },
                    { word: "ت\n\nBu harfin adı hangisidir?", options: ["Te", "Se", "Pe", "He"], answer: "Te" },
                    { word: "ث\n\nBu harfin adı hangisidir?", options: ["Te", "Se (Pelte)", "Be", "Sin"], answer: "Se (Pelte)" },
                    { word: "ج\n\nBu harfin adı hangisidir?", options: ["Cim", "Çim", "Ha", "Hı"], answer: "Cim" },
                    { word: "چ\n\nBu harfin adı hangisidir?", options: ["Cim", "Çim", "He", "Ha"], answer: "Çim" },
                    { word: "ح\n\nBu harfin adı hangisidir?", options: ["He", "Ha", "Hı", "Cim"], answer: "Ha" },
                    { word: "خ\n\nBu harfin adı hangisidir?", options: ["Ha", "Hı", "He", "Kef"], answer: "Hı" },
                    { word: "د\n\nBu harfin adı hangisidir?", options: ["Dal", "Zel", "Re", "Ze"], answer: "Dal" },
                    { word: "ذ\n\nBu harfin adı hangisidir?", options: ["Dal", "Zel", "Ze", "Re"], answer: "Zel" },
                    { word: "ر\n\nBu harfin adı hangisidir?", options: ["Ze", "Re", "Vav", "Nun"], answer: "Re" },
                    { word: "ز\n\nBu harfin adı hangisidir?", options: ["Re", "Ze", "Sin", "Şın"], answer: "Ze" },
                    { word: "ژ\n\nBu harfin adı hangisidir?", options: ["Ze", "Je", "Re", "Sin"], answer: "Je" },
                    { word: "س\n\nBu harfin adı hangisidir?", options: ["Sin", "Şın", "Se", "Sad"], answer: "Sin" },
                    { word: "ش\n\nBu harfin adı hangisidir?", options: ["Sin", "Şın", "Sad", "Dad"], answer: "Şın" },
                    { word: "Osmanlı alfabesi hangi alfabeyi temel alır?", options: ["Latin", "Kiril", "Arap", "Yunan"], answer: "Arap" },
                    { word: "Osmanlıca yazı hangi yönde yazılır?", options: ["Soldan sağa", "Sağdan sola", "Yukarıdan aşağıya", "Aşağıdan yukarıya"], answer: "Sağdan sola" },
                    { word: "Osmanlıcada sesli harfler nasıl gösterilir?", options: ["Her zaman yazılır", "Genellikle yazılmaz", "Sadece başta yazılır", "Sadece sonda yazılır"], answer: "Genellikle yazılmaz" }
                ],
                "Test 2": [
                    { word: "ص\n\nBu harfin adı hangisidir?", options: ["Sin", "Sad", "Dad", "Tı"], answer: "Sad" },
                    { word: "ض\n\nBu harfin adı hangisidir?", options: ["Sad", "Dad", "Tı", "Zı"], answer: "Dad" },
                    { word: "ط\n\nBu harfin adı hangisidir?", options: ["Tı", "Zı", "Te", "Dal"], answer: "Tı" },
                    { word: "ظ\n\nBu harfin adı hangisidir?", options: ["Tı", "Zı", "Ze", "Zel"], answer: "Zı" },
                    { word: "ع\n\nBu harfin adı hangisidir?", options: ["Ayn", "Gayn", "Elif", "He"], answer: "Ayn" },
                    { word: "غ\n\nBu harfin adı hangisidir?", options: ["Ayn", "Gayn", "Kaf", "Kef"], answer: "Gayn" },
                    { word: "ف\n\nBu harfin adı hangisidir?", options: ["Fe", "Pe", "Kaf", "Vav"], answer: "Fe" },
                    { word: "ق\n\nBu harfin adı hangisidir?", options: ["Kaf", "Kef", "Gef", "Gayn"], answer: "Kaf" },
                    { word: "ک\n\nBu harfin adı hangisidir?", options: ["Kaf", "Kef", "Gef", "Gayn"], answer: "Kef" },
                    { word: "گ\n\nBu harfin adı hangisidir?", options: ["Kef", "Gef", "Gayn", "Kaf"], answer: "Gef" },
                    { word: "ل\n\nBu harfin adı hangisidir?", options: ["Lam", "Mim", "Nun", "Vav"], answer: "Lam" },
                    { word: "م\n\nBu harfin adı hangisidir?", options: ["Lam", "Mim", "Nun", "He"], answer: "Mim" },
                    { word: "ن\n\nBu harfin adı hangisidir?", options: ["Mim", "Nun", "Vav", "He"], answer: "Nun" },
                    { word: "و\n\nBu harfin adı hangisidir?", options: ["Vav", "He", "Ye", "Nun"], answer: "Vav" },
                    { word: "ه\n\nBu harfin adı hangisidir?", options: ["Vav", "He", "Ye", "Elif"], answer: "He" },
                    { word: "ی\n\nBu harfin adı hangisidir?", options: ["Vav", "He", "Ye", "Elif"], answer: "Ye" },
                    { word: "Yalnızca Farsça kelimelerde kullanılan harf hangisidir?", options: ["Zel (ذ)", "Je (ژ)", "Sad (ص)", "Tı (ط)"], answer: "Je (ژ)" },
                    { word: "و (Vav) harfi Osmanlıcada kaç farklı ses değeri taşır?", options: ["2", "3", "4", "5"], answer: "4" },
                    { word: "Hangi harf Arapçaya özgüdür, Türkçe kelimelerde kullanılmaz?", options: ["Sad (ص)", "Be (ب)", "Te (ت)", "Dal (د)"], answer: "Sad (ص)" },
                    { word: "Osmanlıcada noktalı harflerin noktaları nasıldır?", options: ["Harfin üstünde veya altında", "Her zaman üstünde", "Her zaman altında", "Sağında veya solunda"], answer: "Harfin üstünde veya altında" }
                ],
                "Test 3": [
                    { word: "Osmanlıcada Türkçeye özgü harflerin sayısı kaçtır?", options: ["3", "4", "5", "6"], answer: "5" },
                    { word: "Aşağıdakilerden hangi harf munfasıldır (kendinden sonrakiyle birleşmeyen)?", options: ["Elif (ا)", "Be (ب)", "Te (ت)", "Cim (ج)"], answer: "Elif (ا)" },
                    { word: "Osmanlıca harf kurallarında kullanılan 'Muttasıl' terimi ne demektir?", options: ["Uzatılan", "Birleşen", "Okunmayan", "Harekeli"], answer: "Birleşen" },
                    { word: "Hangi harf munfasıl harfler arasında yer almaz?", options: ["Elif (ا)", "Be (ب)", "Vav (و)", "Dal (د)"], answer: "Be (ب)" },
                    { word: "Osmanlı Türkçesi yazısının yazım yönü nedir?", options: ["Soldan sağa", "Yukarıdan aşağıya", "Sağdan sola", "Aşağıdan yukarıya"], answer: "Sağdan sola" },
                    { word: "Aşağıdaki harflerden hangisi munfasıldır?", options: ["Dal (د)", "Be (ب)", "Sin (س)", "Mim (م)"], answer: "Dal (د)" },
                    { word: "Aşağıdaki harflerden hangisi de munfasıldır?", options: ["Vav (و)", "Nun (ن)", "Lam (ل)", "Fe (ف)"], answer: "Vav (و)" },
                    { word: "Aşağıdaki harflerden hangisi de munfasıldır?", options: ["Re (ر)", "Be (ب)", "Te (ت)", "Sin (س)"], answer: "Re (ر)" },
                    { word: "Osmanlıcada kaç munfasıl harf vardır?", options: ["4", "6", "8", "10"], answer: "6" },
                    { word: "Aşağıdaki Türkçeye özgü harflerden hangisi Osmanlıcada kullanılır?", options: ["Pe (پ)", "Kaf (ق)", "Sad (ص)", "Ayn (ع)"], answer: "Pe (پ)" },
                    { word: "Osmanlıcada hareke nedir?", options: ["Sesli harfi gösteren işaret", "Harf birleştirme kuralı", "Kelime sonu işareti", "Uzatma çizgisi"], answer: "Sesli harfi gösteren işaret" },
                    { word: "Aşağıdakilerden hangisi Türkçeye özgü bir Osmanlı harfidir?", options: ["Çim (چ)", "Ha (ح)", "Dad (ض)", "Ayn (ع)"], answer: "Çim (چ)" },
                    { word: "Osmanlıcada harf yazımında temel kural nedir?", options: ["Her harf ayrı yazılır", "Harfler bitişik yazılabilir ama munfasıllar hariç", "Tüm harfler bitişik yazılır", "Sadece büyük harfler ayrı yazılır"], answer: "Harfler bitişik yazılabilir ama munfasıllar hariç" },
                    { word: "Osmanlıcada 'medde' işareti ne anlama gelir?", options: ["Kısa ünlü", "Uzun 'a' sesi", "Sessiz harf", "Kelime sonu"], answer: "Uzun 'a' sesi" },
                    { word: "Aşağıdaki harflerden hangisi hem başta hem ortada hem de sonda farklı şekil alır?", options: ["Be (ب)", "Elif (ا)", "Vav (و)", "Re (ر)"], answer: "Be (ب)" },
                    { word: "Türkçeye özgü 'Gef (گ)' harfi hangi sesi karşılar?", options: ["G sesi", "K sesi", "J sesi", "Ğ sesi"], answer: "G sesi" },
                    { word: "Osmanlıcada 'şedde' ne anlama gelir?", options: ["Harfin iki kez okunduğunu gösterir", "Harfin okunmadığını gösterir", "Uzun ünlü işareti", "Kelime başı işareti"], answer: "Harfin iki kez okunduğunu gösterir" },
                    { word: "Aşağıdakilerden hangisi munfasıl harf değildir?", options: ["Sin (س)", "Elif (ا)", "Dal (د)", "Vav (و)"], answer: "Sin (س)" },
                    { word: "Osmanlıcada bir kelimenin başındaki Elif harfi ne işlev görür?", options: ["Her zaman 'a' sesi verir", "Sessiz harf taşır ya da uzun ünlüyü gösterir", "Her zaman okunmaz", "Yalnızca süs amaçlıdır"], answer: "Sessiz harf taşır ya da uzun ünlüyü gösterir" },
                    { word: "Osmanlıcada 'hemze' ne işe yarar?", options: ["Sessiz harfi gösterir", "Elif üzerinde belirli sesleri gösterir", "Kelime başı işaretidir", "Uzun ünlüyü gösterir"], answer: "Elif üzerinde belirli sesleri gösterir" }
                ],
                "Genel": [
                    { word: "Yalnızca Farsça kelimelerde kullanılan harf hangisidir?", options: ["Zel (ذ)", "Je (ژ)", "Sad (ص)", "Tı (ط)"], answer: "Je (ژ)" },
                    { word: "و (Vav) harfi Osmanlıcada kaç farklı ses değeri taşır?", options: ["2", "3", "4", "5"], answer: "4" },
                    { word: "Hangi harf Arapçaya özgüdür, Türkçe kelimelerde kullanılmaz?", options: ["Sad (ص)", "Be (ب)", "Te (ت)", "Dal (د)"], answer: "Sad (ص)" },
                    { word: "ق\n\nBu harfin adı hangisidir?", options: ["Kaf", "Kef", "Gef", "Gayn"], answer: "Kaf" },
                    { word: "ک\n\nBu harfin adı hangisidir?", options: ["Kaf", "Kef", "Gef", "Gayn"], answer: "Kef" },
                    { word: "Osmanlıcada kaç harf vardır?", options: ["28", "29", "32", "36"], answer: "32" },
                    { word: "Osmanlıcada hangi harf 'v' ve 'u/ü' seslerini verebilir?", options: ["Ye (ی)", "Vav (و)", "Elif (ا)", "He (ه)"], answer: "Vav (و)" },
                    { word: "Osmanlıcada 'Ye (ی)' harfi hangi sesleri karşılayabilir?", options: ["Sadece 'y'", "Sadece 'i'", "'y', 'i' ve 'ı'", "Sadece 'ı'"], answer: "'y', 'i' ve 'ı'" },
                    { word: "Osmanlıca alfabede Pe (پ) harfi Arapçada var mıdır?", options: ["Evet", "Hayır", "Sadece bazı lehçelerde", "Evet ama farklı şekilde"], answer: "Hayır" },
                    { word: "Osmanlıcada uzun 'i' sesi hangi harfle gösterilir?", options: ["Elif (ا)", "Vav (و)", "Ye (ی)", "He (ه)"], answer: "Ye (ی)" },
                    { word: "Osmanlıcada 'Ha (ح)' ve 'Hı (خ)' arasındaki fark nedir?", options: ["Ha boğazdan, Hı damaktan çıkar", "Ha Farsçaya, Hı Arapçaya özgüdür", "Ha Türkçede, Hı Arapçada kullanılır", "Aralarında ses farkı yoktur"], answer: "Ha boğazdan, Hı damaktan çıkar" },
                    { word: "Osmanlıcada 'Kaf (ق)' ile 'Kef (ک)' arasındaki temel fark nedir?", options: ["Kaf kalın 'k', Kef ince 'k' sesi verir", "Kaf Farsça, Kef Arapça", "Kaf munfasıl, Kef muttasıldır", "Aynı sesi verirler"], answer: "Kaf kalın 'k', Kef ince 'k' sesi verir" },
                    { word: "Osmanlıcada 'Sin (س)' ile 'Sad (ص)' hangi dile özgü ayrımdır?", options: ["Türkçe", "Farsça", "Arapça", "Osmanlıca"], answer: "Arapça" },
                    { word: "Osmanlıcada harf sayısının Arapçadan fazla olmasının sebebi nedir?", options: ["Türkçe ve Farsçaya özgü harfler eklenmiştir", "Arapçadan eksik harfler tamamlanmıştır", "Latin alfabesinden bazı harfler alınmıştır", "Osmanlıcaya özgü yeni harfler icat edilmiştir"], answer: "Türkçe ve Farsçaya özgü harfler eklenmiştir" },
                    { word: "Osmanlıcada 'tenvîn' işareti ne işe yarar?", options: ["Kelimenin sonuna 'n' sesi ekler (Arapça)", "Uzun ünlü gösterir", "Çift okutturur", "Kelime başlangıcını belirtir"], answer: "Kelimenin sonuna 'n' sesi ekler (Arapça)" },
                    { word: "Osmanlıcada 'Lam-Elif (لا)' birleşimi ne zaman kullanılır?", options: ["'la' hecesini yazmak için zorunlu birleşim", "Sadece süs amaçlı", "Yalnızca Arapça kelimelerde", "İsteğe bağlı bir yazım biçimi"], answer: "'la' hecesini yazmak için zorunlu birleşim" },
                    { word: "Osmanlıcada 'elif-i maksure' ne demektir?", options: ["Ye harfiyle yazılan uzun 'a'", "Uzun elif", "Sessiz elif", "Başta kullanılan elif"], answer: "Ye harfiyle yazılan uzun 'a'" },
                    { word: "Osmanlıcada bir harfin kelime sonundaki şekline ne denir?", options: ["Son şekil (son)", "Müstakil şekil", "Başlangıç şekli", "Orta şekil"], answer: "Son şekil (son)" },
                    { word: "Osmanlıcada 'Nun (ن)' harfi kelime sonunda nasıl yazılır?", options: ["Nokta alta iner, yay uzar", "Nokta yoktur", "Büyük daire şeklinde", "Vav gibi yazılır"], answer: "Nokta alta iner, yay uzar" },
                    { word: "Osmanlıcada 'medde' işareti ne anlama gelir?", options: ["Kısa ünlü", "Uzun 'a' sesi", "Sessiz harf", "Kelime sonu"], answer: "Uzun 'a' sesi" }
                ]
            },
            2: {
                "Test 1": [
                    { word: "شو كوزل طارلالره باق\n\nBu cümlenin doğru okunuşu hangisidir?", options: ["Şu güzel tarlalara bak", "Şu büyük ovalara bak", "Bu güzel dağlara bak", "O güzel tarlalara bak"], answer: "Şu güzel tarlalara bak" },
                    { word: "بوگون اویه گیتديم\n\nBu cümlenin Türkçe okunuşu hangisidir?", options: ["Bugün eve gittim", "Dün eve gittim", "Bugün işe gittim", "Yarın eve gideceğim"], answer: "Bugün eve gittim" },
                    { word: "Aşağıdaki harflerden hangisi kelime içinde kendinden sonrakiyle birleşir?", options: ["Be (ب)", "Elif (ا)", "Dal (د)", "Vav (و)"], answer: "Be (ب)" },
                    { word: "سلطان فرمان ويردی\n\nBu cümlenin Türkçe okunuşu hangisidir?", options: ["Sultan ferman verdi", "Sultan saraya geldi", "Asker fermanı yazdı", "Padişah tahta oturdu"], answer: "Sultan ferman verdi" },
                    { word: "كتاب\n\nBu kelimenin Türkçe karşılığı nedir?", options: ["Defter", "Kitap", "Kalem", "Mektep"], answer: "Kitap" },
                    { word: "قلم\n\nBu kelimenin Türkçe karşılığı nedir?", options: ["Kitap", "Defter", "Kalem", "Cetvel"], answer: "Kalem" },
                    { word: "بابا\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Anne", "Baba", "Dede", "Amca"], answer: "Baba" },
                    { word: "Osmanlıcada bir kelime yazarken sesli harfler nasıl gösterilir?", options: ["Her zaman yazılır", "Genellikle yazılmaz, zımni kalır", "Sadece kelime başında yazılır", "Sadece uzun sesliler yazılır"], answer: "Genellikle yazılmaz, zımni kalır" },
                    { word: "سو\n\nBu kelimenin Türkçe anlamı nedir?", options: ["Su", "Süt", "Ses", "Söz"], answer: "Su" },
                    { word: "يول\n\nBu kelimenin okunuşu hangisidir?", options: ["Yıl", "Yol", "Yel", "Gül"], answer: "Yol" },
                    { word: "ات\n\nBu kelimenin Türkçe anlamı nedir?", options: ["Et", "At", "Ot", "Ut"], answer: "At" },
                    { word: "Osmanlıcada 'Kaf (ق)' harfi Türkçede genellikle hangi sesi karşılar?", options: ["Kalın 'k' sesi", "İnce 'k' sesi", "'g' sesi", "'ğ' sesi"], answer: "Kalın 'k' sesi" },
                    { word: "دنيز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Deniz", "Nehir", "Göl", "Çay"], answer: "Deniz" },
                    { word: "داغ\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Dağ", "Taş", "Ova", "Çay"], answer: "Dağ" },
                    { word: "Osmanlıcada kelime okunurken ne yönde ilerlenir?", options: ["Soldan sağa", "Sağdan sola", "Yukarıdan aşağıya", "Aşağıdan yukarıya"], answer: "Sağdan sola" },
                    { word: "اوقول\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Okul", "Çocuk", "Büyük", "Küçük"], answer: "Okul" },
                    { word: "Osmanlıcada 'He (ه)' harfi kelime sonunda okunur mu?", options: ["Her zaman okunur", "Bazen okunmaz (sessiz h)", "Hiçbir zaman okunmaz", "Sadece Arapça kelimelerde okunur"], answer: "Bazen okunmaz (sessiz h)" },
                    { word: "گوك\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Göz", "Gök", "Söz", "Köy"], answer: "Gök" },
                    { word: "Osmanlıcada 'Kef (ک)' harfi Türkçede genellikle hangi sesi karşılar?", options: ["Kalın 'k'", "İnce 'k' veya 'g'", "'ğ' sesi", "'h' sesi"], answer: "İnce 'k' veya 'g'" },
                    { word: "آب\n\nBu kelimenin anlamı nedir? (Farsça)", options: ["Ateş", "Su", "Toprak", "Hava"], answer: "Su" }
                ],
                "Test 2": [
                    { word: "مكتبده اوقويورم\n\nBu cümlenin Türkçe anlamı hangisidir?", options: ["Mektepte okuyorum", "Okula gidiyorum", "Yazı yazıyorum", "Kitap okuyorum"], answer: "Mektepte okuyorum" },
                    { word: "Osmanlıca hakkında hangi önerme doğrudur?\n\n1. Arap alfabesi temel alınmıştır.\n2. Sadece sarayda konuşulmuştur.", options: ["Yalnız 1", "Yalnız 2", "Her ikisi de", "Hiçbiri"], answer: "Yalnız 1" },
                    { word: "شهر بيوك در\n\nBu cümlenin Türkçe karşılığı hangisidir?", options: ["Şehir büyüktür", "Köy küçüktür", "Ev çok büyüktür", "Şehir çok güzeldir"], answer: "Şehir büyüktür" },
                    { word: "سوز\n\nBu kelimenin Türkçe karşılığı nedir?", options: ["Söz", "Saz", "Göz", "Yaz"], answer: "Söz" },
                    { word: "قولاى\n\nBu kelimenin doğru okunuşu hangisidir?", options: ["Kolay", "Güzel", "Olay", "Kalay"], answer: "Kolay" },
                    { word: "ياز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kış", "Yaz", "Bahar", "Sonbahar"], answer: "Yaz" },
                    { word: "قيش\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kış", "Yaz", "İlkbahar", "Güz"], answer: "Kış" },
                    { word: "Osmanlıcada 'dal (د)' ve 'zel (ذ)' arasındaki fark nedir?", options: ["Dal 'd', Zel 'z' sesini verir", "Dal 'z', Zel 'd' sesini verir", "İkisi de 'd' sesini verir", "İkisi de 'z' sesini verir"], answer: "Dal 'd', Zel 'z' sesini verir" },
                    { word: "آرسلان\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Aslan", "Kaplan", "Kurt", "Ayı"], answer: "Aslan" },
                    { word: "قاپى\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Pencere", "Kapı", "Duvar", "Zemin"], answer: "Kapı" },
                    { word: "Osmanlıcada 'Ta (ط)' ve 'Te (ت)' arasındaki fark nedir?", options: ["Ta Arapçaya özgü kalın 't', Te ince 't'", "Ta ince, Te kalın 't' verir", "İkisi de aynı sesi verir", "Ta Türkçe, Te Farsça"], answer: "Ta Arapçaya özgü kalın 't', Te ince 't'" },
                    { word: "اوچ\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["İki", "Üç", "Dört", "Beş"], answer: "Üç" },
                    { word: "بش\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Dört", "Altı", "Beş", "Yedi"], answer: "Beş" },
                    { word: "يدى\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Altı", "Yedi", "Sekiz", "Dokuz"], answer: "Yedi" },
                    { word: "اون\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Bir", "Beş", "On", "Yüz"], answer: "On" },
                    { word: "يوز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["On", "Elli", "Yüz", "Bin"], answer: "Yüz" },
                    { word: "Osmanlıcada rakamlar hangi sistemle yazılırdı?", options: ["Romen rakamları", "Arap-Hint rakamları", "Latin rakamları", "Yunan rakamları"], answer: "Arap-Hint rakamları" },
                    { word: "گوزل\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Çirkin", "Güzel", "İyi", "Kötü"], answer: "Güzel" },
                    { word: "بيوك\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Küçük", "Büyük", "Uzun", "Kısa"], answer: "Büyük" },
                    { word: "قره\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kara", "Sarı", "Beyaz", "Yeşil"], answer: "Kara" }
                ],
                "Test 3": [
                    { word: "باهار گلدی\n\nBu ifadenin doğru okunuşu hangisidir?", options: ["Bahar geldi", "Bağlar güldü", "Bahar geçti", "Yaz geldi"], answer: "Bahar geldi" },
                    { word: "عسكر يوريور\n\nBu cümlenin Türkçe karşılığı hangisidir?", options: ["Asker yürüyor", "Asker geliyor", "Ordu savaşıyor", "Asker nöbet tutuyor"], answer: "Asker yürüyor" },
                    { word: "پادشاه تختنده اوتوردی\n\nBu cümlenin doğru okunuşu hangisidir?", options: ["Padişah tahtında oturdu", "Sultan tahta oturdu", "Hakan sarayda oturdu", "Padişah fermanı okudu"], answer: "Padişah tahtında oturdu" },
                    { word: "حق يولنده يورييلم\n\nBu ifadenin doğru anlamı hangisidir?", options: ["Hak yolunda yürüyelim", "Doğru yoldan gidelim", "Güzel işler yapalım", "Halka yardım edelim"], answer: "Hak yolunda yürüyelim" },
                    { word: "اوردو ايله ريه گيتدی\n\nBu cümlenin Türkçe okunuşu hangisidir?", options: ["Ordu ileriye gitti", "Asker geri çekildi", "Savaş kazanıldı", "Ordu şehre girdi"], answer: "Ordu ileriye gitti" },
                    { word: "آنا بانا باقدی\n\nBu cümlenin Türkçe okunuşu hangisidir?", options: ["Anne bana baktı", "Baba beni gördü", "Kardeş ağladı", "Anne gitti"], answer: "Anne bana baktı" },
                    { word: "قوش اوچدی\n\nBu ifadenin doğru okunuşu hangisidir?", options: ["Kuş uçtu", "Kaz geçti", "Balık yüzdü", "Kuş ötüyor"], answer: "Kuş uçtu" },
                    { word: "گون آيدين\n\nBu ifadenin Türkçe karşılığı hangisidir?", options: ["İyi geceler", "Günaydın", "İyi akşamlar", "Hoşça kal"], answer: "Günaydın" },
                    { word: "Osmanlıcada bir cümledeki yüklem nerede yer alır?", options: ["Başta", "Ortada", "Genellikle sonda", "Öznenin hemen ardında"], answer: "Genellikle sonda" },
                    { word: "سوغوق سو\n\nBu ifadenin Türkçe okunuşu hangisidir?", options: ["Soğuk su", "Sıcak çay", "Tatlı su", "Acı kahve"], answer: "Soğuk su" },
                    { word: "ايشيق\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Karanlık", "Işık", "Gölge", "Ateş"], answer: "Işık" },
                    { word: "Osmanlıcada tamlama nasıl kurulur?", options: ["Tamlanan önce, tamlayan sonra", "Tamlayan önce, tamlanan sonra", "İkisi de olabilir", "Tamlama yoktur"], answer: "Tamlanan önce, tamlayan sonra" },
                    { word: "يني يول\n\nBu ifadenin Türkçe okunuşu hangisidir?", options: ["Yeni yol", "Eski köy", "Uzun yol", "Dar sokak"], answer: "Yeni yol" },
                    { word: "قرا گيجه\n\nBu ifadenin Türkçe karşılığı hangisidir?", options: ["Kara gece", "Beyaz gündüz", "Uzun gece", "Kısa gün"], answer: "Kara gece" },
                    { word: "Osmanlıcada fiiller genellikle nerede biter?", options: ["'-di', '-miş', '-r' gibi eklerle", "'-ler' ekiyle", "'-ki' ekiyle", "Her zaman '-an' ekiyle"], answer: "'-di', '-miş', '-r' gibi eklerle" },
                    { word: "سويله\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Söyle", "Yürü", "Gel", "Git"], answer: "Söyle" },
                    { word: "دنيز قيیيسی\n\nBu ifadenin Türkçe okunuşu hangisidir?", options: ["Deniz kıyısı", "Nehir kenarı", "Göl ortası", "Dağ yamacı"], answer: "Deniz kıyısı" },
                    { word: "Osmanlıcada 'izafet' yapısı ne demektir?", options: ["İki ismin birbirine bağlandığı tamlama", "Fiil çekimi", "Olumsuzluk eki", "Soru yapısı"], answer: "İki ismin birbirine bağlandığı tamlama" },
                    { word: "طاغ\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Dağ", "Taş", "Tepe", "Ova"], answer: "Dağ" },
                    { word: "آق\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kara", "Ak (Beyaz)", "Kırmızı", "Mavi"], answer: "Ak (Beyaz)" }
                ],
                "Genel": [
                    { word: "كتاب\n\nBu kelimenin Türkçe karşılığı nedir?", options: ["Defter", "Kitap", "Kalem", "Mektep"], answer: "Kitap" },
                    { word: "قولاى\n\nBu kelimenin doğru okunuşu hangisidir?", options: ["Kolay", "Güzel", "Olay", "Kalay"], answer: "Kolay" },
                    { word: "سوز\n\nBu kelimenin Türkçe karşılığı nedir?", options: ["Söz", "Saz", "Göz", "Yaz"], answer: "Söz" },
                    { word: "يول\n\nBu kelimenin okunuşu hangisidir?", options: ["Yıl", "Yol", "Yel", "Gül"], answer: "Yol" },
                    { word: "سو\n\nBu kelimenin Türkçe anlamı nedir?", options: ["Su", "Süt", "Ses", "Söz"], answer: "Su" },
                    { word: "آت\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["At", "It", "Et", "Ot"], answer: "At" },
                    { word: "قيز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kız", "Oğul", "Erkek", "Çocuk"], answer: "Kız" },
                    { word: "اوغلان\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kız", "Oğlan", "Baba", "Anne"], answer: "Oğlan" },
                    { word: "ال\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kol", "El", "Baş", "Ayak"], answer: "El" },
                    { word: "باش\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Baş", "Boyun", "Yüz", "Göz"], answer: "Baş" },
                    { word: "گوز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kulak", "Göz", "Burun", "Ağız"], answer: "Göz" },
                    { word: "Osmanlıcada aynı yazılış birden fazla kelimeyi ifade edebilir mi?", options: ["Evet, bağlama göre değişir", "Hayır, her yazılış tektir", "Sadece yabancı kelimelerde", "Sadece fiillerde"], answer: "Evet, bağlama göre değişir" },
                    { word: "آق\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kara", "Ak (Beyaz)", "Kırmızı", "Mavi"], answer: "Ak (Beyaz)" },
                    { word: "قره\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Kara", "Sarı", "Beyaz", "Yeşil"], answer: "Kara" },
                    { word: "قوجه\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Genç", "Küçük", "Koca (büyük/yaşlı)", "Zayıf"], answer: "Koca (büyük/yaşlı)" },
                    { word: "Osmanlıcada 'tamlayan' eki '-in/-ın' nasıl yazılır?", options: ["Genellikle Ye (ی) ile gösterilir", "Hiç yazılmaz", "Elif (ا) ile gösterilir", "Nun (ن) ile gösterilir"], answer: "Genellikle Ye (ی) ile gösterilir" },
                    { word: "اوی\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Oy", "Ev", "Av", "Üv"], answer: "Ev" },
                    { word: "Osmanlıcada bir cümle nasıl biter?", options: ["Özneyle", "Yüklemle", "Nesneyle", "Zarfla"], answer: "Yüklemle" },
                    { word: "طاش\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Taş", "Dağ", "Kaya", "Toprak"], answer: "Taş" },
                    { word: "دنيز\n\nBu kelimenin Türkçe okunuşu hangisidir?", options: ["Deniz", "Nehir", "Göl", "Çay"], answer: "Deniz" }
                ]
            },
            3: {
                "Test 1": [
                    { word: "Aşağıdakilerden hangisi Türkçe kökenli bir kelimedir?", options: ["Taş", "Mektep", "Pencere", "Kalem"], answer: "Taş" },
                    { word: "Aşağıdakilerden hangisi Arapça kökenli bir kelimedir?", options: ["Taş", "Mektep", "Pencere", "Dost"], answer: "Mektep" },
                    { word: "Aşağıdakilerden hangisi Farsça kökenli bir kelimedir?", options: ["Taş", "Mektep", "Pencere", "Televizyon"], answer: "Pencere" },
                    { word: "Aşağıdakilerden hangisi Türkçe bir kelime olduğunu büyük ünlü uyumu kuralıyla kanıtlar?", options: ["Su", "Mektep", "Kitap", "Kalem"], answer: "Su" },
                    { word: "Aşağıdakilerden hangisi Batı kökenli bir kelimedir?", options: ["Pencere", "Televizyon", "Mektep", "Taş"], answer: "Televizyon" },
                    { word: "'Bahçe' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'Kitap' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Fransızca"], answer: "Arapça" },
                    { word: "'Çiçek' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Türkçe" },
                    { word: "'Camii' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Latince"], answer: "Arapça" },
                    { word: "'Şehir' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'Asker' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "İtalyanca"], answer: "Arapça" },
                    { word: "'Duman' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Türkçe" },
                    { word: "'Padişah' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Farsça" },
                    { word: "'Sultan' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Ordu' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Derya' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'İlim' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Latince"], answer: "Arapça" },
                    { word: "'Ata' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Haber' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Pazar' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Ermenice"], answer: "Farsça" }
                ],
                "Test 2": [
                    { word: "Büyük ünlü uyumu kuralıyla Türkçe kökenli olduğunu doğrudan kanıtlayan kelime hangisidir?", options: ["Sarı", "Kitap", "Defter", "Kalem"], answer: "Sarı" },
                    { word: "Aşağıdakilerden hangisi Farsça kökenli bir ektir?", options: ["-istan", "-ci/-cı", "-lık/-lik", "-da/-de"], answer: "-istan" },
                    { word: "Aşağıdakilerden hangisi Türkçe kökenli bir kelimedir?", options: ["Dağ", "Defter", "Pencere", "Bahçe"], answer: "Dağ" },
                    { word: "Aşağıdakilerden hangisi Arapça kökenli bir ektir?", options: ["-istan", "-ane", "-at (çoğul)", "-lık"], answer: "-at (çoğul)" },
                    { word: "Aşağıdakilerden hangisi Türkçe kökenli bir ektir?", options: ["-istan", "-ane", "-ci/-cı", "-at"], answer: "-ci/-cı" },
                    { word: "'Güneş' kelimesi büyük ünlü uyumuna uyar mı?", options: ["Evet, Türkçe kökenlidir", "Hayır, Arapçadan gelir", "Hayır, Farsçadan gelir", "Kısmen uyar"], answer: "Evet, Türkçe kökenlidir" },
                    { word: "Osmanlıcada Farsça tamlamada iki isim nasıl bağlanır?", options: ["'-in' ekiyle", "İzafet kesresiyle (e sesi)", "Ayrı yazılarak", "Vav harfiyle"], answer: "İzafet kesresiyle (e sesi)" },
                    { word: "Aşağıdakilerden hangisi Farsça kökenli bir kelimedir?", options: ["Rüzgar", "Asker", "Taş", "El"], answer: "Rüzgar" },
                    { word: "Aşağıdakilerden hangisi Arapça kökenli bir kelimedir?", options: ["Dağ", "Su", "İlim", "Taş"], answer: "İlim" },
                    { word: "Aşağıdakilerden hangisi Türkçe kökenli bir kelimedir?", options: ["Kalem", "Göz", "Kitap", "Dost"], answer: "Göz" },
                    { word: "'Hazine' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "İtalyanca"], answer: "Arapça" },
                    { word: "'Nişan' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "Osmanlıcada Türkçe kelimeler büyük ünlü uyumuna uyarken yabancı kökenli kelimeler ne olur?", options: ["Onlar da uyar", "Genellikle uymaz", "Kısmen uyar", "Her zaman uyar"], answer: "Genellikle uymaz" },
                    { word: "'-hane' eki hangi dilden gelir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'-dar' eki hangi dilden gelir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Farsça" },
                    { word: "'-iye' eki hangi dilden gelir?", options: ["Türkçe", "Arapça", "Farsça", "Latince"], answer: "Arapça" },
                    { word: "'-name' eki hangi dilden gelir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'Toprak' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Meydan' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Çarşı' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Ermenice"], answer: "Farsça" }
                ],
                "Test 3": [
                    { word: "Aşağıdaki kelimelerden hangisi Farsça kökenli DEĞİLDİR?", options: ["Derzi", "Pencere", "Taş", "Bahçe"], answer: "Taş" },
                    { word: "Arapçadan dilimize geçen 'kalem' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Fransızca"], answer: "Arapça" },
                    { word: "'Dost' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "İngilizce"], answer: "Farsça" },
                    { word: "Aşağıdaki kelimelerden hangisi Türkçe kökenlidir?", options: ["Göz", "Saray", "Kalem", "Defter"], answer: "Göz" },
                    { word: "Osmanlıcada karma kelimeler mümkün müdür?", options: ["Evet", "Hayır", "Sadece eklerde", "Sadece tamlamalarda"], answer: "Evet" },
                    { word: "'Kale' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Saray' kelimesinin kökeni hangi dildir?", options: ["Farsça", "Türkçe", "Arapça", "Latince"], answer: "Farsça" },
                    { word: "'Köy' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Şeker' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'Cevap' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Ermenice"], answer: "Arapça" },
                    { word: "'Soru' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Türkçe" },
                    { word: "'Meclis' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Latince"], answer: "Arapça" },
                    { word: "'Renk' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "'Baş' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Fikir' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Fransızca"], answer: "Arapça" },
                    { word: "'Mevsim' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Yıldız' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Nefes' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Gönül' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Çadır' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Farsça" }
                ],
                "Genel": [
                    { word: "Türkçe kökenli 'kul' kelimesi büyük ünlü uyumuna uyar mı?", options: ["Uyar", "Uymaz", "Kısmen uyar", "Kuralsızdır"], answer: "Uyar" },
                    { word: "Farsçadan dilimize geçen 'dergâh' kelimesinin kökeni nedir?", options: ["Farsça", "Arapça", "Türkçe", "Rumca"], answer: "Farsça" },
                    { word: "Aşağıdaki kelimelerden hangisi Batı (Fransızca) kökenlidir?", options: ["Bilet", "Pencere", "Mektep", "Kuzu"], answer: "Bilet" },
                    { word: "Arapça kökenli 'kitap' kelimesinin çoğulu (kütüb) hangi tür çoğuldur?", options: ["Arapça kuralsız (mükesser)", "Türkçe -ler ekli", "Farsça -an ekli", "Batı tarzı"], answer: "Arapça kuralsız (mükesser)" },
                    { word: "'Saray' kelimesinin kökeni hangi dildir?", options: ["Farsça", "Türkçe", "Arapça", "Latince"], answer: "Farsça" },
                    { word: "Aşağıdakilerden hangisi Farsça kökenli bir kelimedir?", options: ["Pehlivan", "Kalem", "Su", "Taş"], answer: "Pehlivan" },
                    { word: "Aşağıdakilerden hangisi Arapça kökenli bir kelimedir?", options: ["Dağ", "Su", "Harf", "Çiçek"], answer: "Harf" },
                    { word: "Aşağıdakilerden hangisi Türkçe kökenli bir kelimedir?", options: ["Kış", "Kalem", "Bahçe", "Dost"], answer: "Kış" },
                    { word: "Osmanlıca üç ana dil katmanından hangisi değildir?", options: ["Türkçe", "Arapça", "Latince", "Farsça"], answer: "Latince" },
                    { word: "Osmanlıcada yüksek edebiyat dili ağırlıklı olarak hangi dillerden oluşurdu?", options: ["Türkçe ve Rumca", "Arapça ve Farsça", "Farsça ve Latince", "Türkçe ve Moğolca"], answer: "Arapça ve Farsça" },
                    { word: "Halk Osmanlıcasında hangi dil daha baskındı?", options: ["Arapça", "Farsça", "Türkçe", "Rumca"], answer: "Türkçe" },
                    { word: "'Borç' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Tabip' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Kuş' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Mektup' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Arapça" },
                    { word: "'Köprü' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Moğolca"], answer: "Türkçe" },
                    { word: "'Divan' kelimesinin kökeni hangi dildir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" },
                    { word: "Osmanlıca 19. yüzyılda hangi Batı dilleriyle daha fazla temas kurdu?", options: ["İspanyolca ve Portekizce", "Fransızca ve İtalyanca", "Almanca ve İngilizce", "Rusça ve Lehçe"], answer: "Fransızca ve İtalyanca" },
                    { word: "Osmanlıcada kelime kökenini belirlemede en belirleyici yöntem nedir?", options: ["Büyük ünlü uyumu (Türkçe için)", "Kelime uzunluğu", "Harf sayısı", "Başlangıç harfi"], answer: "Büyük ünlü uyumu (Türkçe için)" },
                    { word: "'Dergâh' kelimesi '-gâh' ekiyle oluşmuştur. Bu ek hangi dilden gelir?", options: ["Türkçe", "Arapça", "Farsça", "Rumca"], answer: "Farsça" }
                ]
            }
        };

        // --- AKTİF SINAV PARAMETRELERİ ---
        let activeQuizQuestions = [];
        let activeLevel = 1;
        let activeTestName = "";
        let activeQuestionIndex = 0;
        let activeCorrects = 0;
        let activeWrongs = 0;

        // --- GİZLİ TENİS OYUNU (2D) ---
        const TENNIS_W = 480;
        const TENNIS_H = 300;
        const TENNIS_WIN = 7;
        let tennisCanvas = null;
        let tennisCtx = null;
        let tennisLoopId = null;
        let isTennisRunning = false;
        let tennisPaused = false;
        let tennisMatchOver = false;
        let tennisServeReady = false;
        let tennisCountdown = 0;
        let tennisRallyHits = 0;
        let tennisLastTime = 0;
        let tennisBallSpin = 0;
        let tennisBallRotation = 0;
        let tennisHitParticles = [];
        let tennisCourtCache = null;
        let tennisBotTargetX = null;
        let tennisBotReaction = 0;

        let ballX = TENNIS_W / 2;
        let ballY = TENNIS_H / 2;
        let ballSpeedX = 0;
        let ballSpeedY = 0;
        let ballRadius = 7;
        let ballTrail = [];

        let playerPaddleX = 110;
        let computerPaddleX = 110;
        const paddleWidth = 84;
        const paddleHeight = 16;
        const paddleHandleH = 10;

        let tennisPlayerScore = 0;
        let tennisComputerScore = 0;

        let keyLeftPressed = false;
        let keyRightPressed = false;
        let tennisPointerActive = false;

        let tennisOnlineMode = false;
        let tennisOnlineRole = null;
        let tennisOnlineRoomCode = '';
        let tennisOpponentName = '';
        let tennisRemotePaddleX = (TENNIS_W - paddleWidth) / 2;

        // RENK KOYULAŞTIRMA YARDIMCI FONKSİYONU
        function darkenColor(col, amt) {
            let usePound = false;
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
            let num = parseInt(col, 16);
            let r = (num >> 16) - amt;
            if (r > 255) r = 255;
            else if (r < 0) r = 0;
            let b = ((num >> 8) & 0x00FF) - amt;
            if (b > 255) b = 255;
            else if (b < 0) b = 0;
            let g = (num & 0x0000FF) - amt;
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
        }

        // HEX'ten RGB'ye Dönüştürücü (Dinamik Gölgeler İçin)
        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(s => s + s).join('');
            }
            const num = parseInt(hex, 16);
            return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
        }

        // 🔎 DİNAMİK YAZI BOYUTUNU GÜNCELLEME SİSTEMİ
        function updateFontSizeSetting(event) {
            playClickSound();
            const chosenSize = event.target.value;
            const bodyMain = document.getElementById('body-main');
            
            bodyMain.classList.remove('font-size-standard', 'font-size-large', 'font-size-xlarge');
            
            if (chosenSize === 'large') {
                bodyMain.classList.add('font-size-large');
                showToast("Bilişsel Odak Değişti! 🔎 Optik sinirlerin için taze bir görünüm alanı sağlandı.", "success");
            } else if (chosenSize === 'xlarge') {
                bodyMain.classList.add('font-size-xlarge');
                showToast("Büyüteç Etkisi! 🔎 Fotoreseptörlerin için en geniş okuma modu aktif edildi.", "success");
            } else {
                bodyMain.classList.add('font-size-standard');
                showToast("Doğal Görünüm Dengelendi! 🔎 Standart odaklama sistemine geri dönüldü.", "success");
            }
        }

        // --- 🌿 DOĞA YEŞİLİ TOAST BİLDİRİM MOTORU (Swipe-to-Dismiss destekli) ---
        let toastDismissTimer = null;
        let toastDragState = null;

        function showLoading(text = 'Lütfen bekleyin...') {
            const el = document.getElementById('loading-overlay');
            const txt = document.getElementById('loading-text');
            if (txt) txt.textContent = text;
            if (el) el.classList.remove('hidden');
        }

        function hideLoading() {
            const el = document.getElementById('loading-overlay');
            if (el) el.classList.add('hidden');
        }

        function showToast(message, type = 'info') {
            const toastBox = document.getElementById('toast-box');
            const toastMessage = document.getElementById('toast-message');
            const toastIcon = document.getElementById('toast-icon');

            toastMessage.innerText = message;

            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }
            toastDragState = null;
            toastBox.style.transition = '';
            toastBox.style.transform = '';
            toastBox.style.opacity = '';
            toastBox.style.cursor = '';

            const toastVariant = type === 'error' ? 'error' : 'success';
            toastBox.className = 'lisani-toast lisani-toast--' + toastVariant;

            if (type === 'error') {
                toastIcon.setAttribute('data-lucide', 'alert-triangle');
            } else if (type === 'info') {
                toastIcon.setAttribute('data-lucide', 'info');
            } else {
                toastIcon.setAttribute('data-lucide', 'leaf');
            }

            lucide.createIcons();

            requestAnimationFrame(() => {
                toastBox.classList.add('is-visible');
            });

            toastDismissTimer = setTimeout(() => { dismissToast(null); }, 3500);
        }

        // --- ✋ TOAST'I PROGRAMATİK OLARAK KAPAT ---
        function dismissToast(direction) {
            const toastBox = document.getElementById('toast-box');
            if (!toastBox) return;
            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }

            toastBox.classList.remove('is-visible');
            
            let offX = 0, offY = -80;
            if (direction === 'left') offX = -Math.max(window.innerWidth, 400);
            else if (direction === 'right') offX = Math.max(window.innerWidth, 400);
            
            toastBox.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
            toastBox.style.transform = `translate(${offX}px, ${offY}px)`;
            toastBox.style.opacity = '0';
            
            setTimeout(() => {
                toastBox.className = 'lisani-toast';
                toastBox.style.transform = '';
                toastBox.style.opacity = '';
                toastBox.style.transition = '';
            }, 300);
        }

        // --- 👆 TOAST'I KAYDIRARAK / DOKUNARAK KAPAT ---
        function initToastSwipe() {
            const toastBox = document.getElementById('toast-box');
            if (!toastBox) return;

            const getPoint = (e) => {
                const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
                return { x: t.clientX, y: t.clientY };
            };

            const onStart = (e) => {
                if (!toastBox.classList.contains('is-visible')) return;
                const p = getPoint(e);
                toastDragState = { startX: p.x, startY: p.y, dx: 0, dy: 0, startTime: Date.now() };
                toastBox.style.transition = 'none';
                toastBox.style.cursor = 'grabbing';
            };

            const onMove = (e) => {
                if (!toastDragState) return;
                const p = getPoint(e);
                toastDragState.dx = p.x - toastDragState.startX;
                toastDragState.dy = Math.min(0, p.y - toastDragState.startY); // sadece yukarı
                const maxAbs = Math.max(Math.abs(toastDragState.dx), Math.abs(toastDragState.dy));
                const op = Math.max(0.15, 1 - maxAbs / 220);
                toastBox.style.transform = `translate(${toastDragState.dx}px, ${toastDragState.dy}px)`;
                toastBox.style.opacity = String(op);
            };

            const onEnd = () => {
                if (!toastDragState) return;
                const { dx, dy, startTime } = toastDragState;
                const elapsed = Date.now() - startTime;
                const distance = Math.max(Math.abs(dx), Math.abs(dy));
                const velocity = distance / Math.max(1, elapsed);
                toastDragState = null;
                toastBox.style.cursor = '';

                if (distance < 6 && elapsed < 300) {
                    // Hızlı dokunuş -> kapat
                    dismissToast(null);
                } else if (distance > 55 || velocity > 0.35) {
                    // Kaydırma -> yöne göre kapat
                    if (Math.abs(dx) > Math.abs(dy)) {
                        dismissToast(dx > 0 ? 'right' : 'left');
                    } else {
                        dismissToast(null);
                    }
                } else {
                    // Geri yapış
                    toastBox.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
                    toastBox.style.transform = '';
                    toastBox.style.opacity = '';
                }
            };

            // Dokunmatik
            toastBox.addEventListener('touchstart', onStart, { passive: true });
            toastBox.addEventListener('touchmove', onMove, { passive: true });
            toastBox.addEventListener('touchend', onEnd);
            toastBox.addEventListener('touchcancel', onEnd);

            // Mouse (masaüstü test)
            toastBox.addEventListener('mousedown', (e) => { onStart(e); e.preventDefault(); });
            document.addEventListener('mousemove', (e) => { if (toastDragState) onMove(e); });
            document.addEventListener('mouseup', () => { if (toastDragState) onEnd(); });
        }

        // --- 🔉 YAPAY TOK TIKLAMA SESİ MOTORU ---
        function playClickSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const t = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.08);
            } catch(e) {}
        }

        // --- 🔉 TENİS OYUNU GONG SESİ MOTORU ---
        function playTennisBeep(pitch = 180, duration = 0.1) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {
                console.log("Tenis sesi çalınamadı:", e);
            }
        }

        // --- KULLANICI / AUTH YÖNETİMİ (Firebase) ---

        function avatarAssetsBase() {
            return (window.LISANI_ASSETS && window.LISANI_ASSETS.avatars) || '/images/avatars';
        }

        function teamAvatarImg(file) {
            const src = `${avatarAssetsBase()}/${file}`;
            return `<span class="avatar-glass-emblem"><img src="${src}" alt="" /></span>`;
        }

        const DEFAULT_AVATAR = teamAvatarImg('besiktas.svg');

        const AVATAR_OPTIONS = [
            { type: 'besiktas', emoji: teamAvatarImg('besiktas.svg'), label: 'Beşiktaş' },
            { type: 'bursaspor', emoji: teamAvatarImg('bursaspor.svg'), label: 'Bursaspor' },
            { type: 'goztepe', emoji: teamAvatarImg('goztepe.svg'), label: 'Göztepe' },
            { type: 'eskisehirspor', emoji: teamAvatarImg('eskisehirspor.svg'), label: 'Eskişehirspor' },
            { type: 'saray', emoji: teamAvatarImg('saray-kavvesi.svg'), label: 'Saray Kavvesi' },
            { type: 'ayasofya', emoji: teamAvatarImg('istanbul/ayasofya.svg'), label: 'Ayasofya' },
            { type: 'ulucami', emoji: teamAvatarImg('istanbul/ulucami.svg'), label: 'Ulu Camii' },
            { type: 'galata', emoji: teamAvatarImg('istanbul/galata.svg'), label: 'Galata' },
            { type: 'kizkulesi', emoji: teamAvatarImg('istanbul/kiz-kulesi.svg'), label: 'Kız Kulesi' },
            { type: 'bogaz', emoji: teamAvatarImg('istanbul/bogaz.svg'), label: 'Boğaz' },
            { type: 'kopru', emoji: teamAvatarImg('istanbul/kopru.svg'), label: 'Köprü' },
            { type: 'eminonu', emoji: teamAvatarImg('istanbul/eminonu.svg'), label: 'Eminönü' },
            { type: 'balat', emoji: teamAvatarImg('istanbul/balat.svg'), label: 'Balat' },
            { type: 'camii', emoji: teamAvatarImg('istanbul/camii.svg'), label: 'Camii' },
            { type: 'sokak', emoji: teamAvatarImg('istanbul/sokak.svg'), label: 'Sokak' },
            { type: 'panorama', emoji: teamAvatarImg('istanbul/panorama.svg'), label: 'Panorama' },
            { type: 'gunbatimi', emoji: teamAvatarImg('istanbul/gunbatimi.svg'), label: 'Gün Batımı' },
        ];

        function isLegacyEmojiAvatar(value) {
            return typeof value === 'string' && value.length <= 8 && !value.includes('<') && !value.includes('/');
        }

        function resolveLegacyAvatar(value) {
            if (!value || isLegacyEmojiAvatar(value)) return DEFAULT_AVATAR;
            if (typeof value === 'string' && value.includes('avatars/')) {
                const match = value.match(/avatars\/(.+\.svg)/i);
                if (match) return teamAvatarImg(match[1]);
            }
            return value;
        }

        function getAvatarLabel(type) {
            const found = AVATAR_OPTIONS.find((a) => a.type === type);
            return found ? found.label : type;
        }

        function isTeamAvatar(value) {
            return typeof value === 'string' && value.includes('avatar-glass-emblem');
        }

        function isCustomPhotoAvatar(value) {
            return typeof value === 'string' && value.includes('<img') && !isTeamAvatar(value);
        }

        function highlightAvatarSelection(selector, value) {
            document.querySelectorAll(selector).forEach((btn) => {
                const active = btn.getAttribute('data-avatar-value') === value;
                btn.classList.toggle('selected', active);
                btn.classList.toggle('ring-2', active);
                btn.classList.toggle('ring-[var(--theme-primary)]', active);
            });
        }

        function avatarIconHtml(value, size) {
            if (isTeamAvatar(value) || (typeof value === 'string' && value.includes('<img') && !isCustomPhotoAvatar(value))) {
                return `<span class="flex ${size} items-center justify-center overflow-hidden rounded-full">${value}</span>`;
            }
            if (isCustomPhotoAvatar(value)) {
                return `<span class="flex ${size} items-center justify-center overflow-hidden rounded-full">${value}</span>`;
            }
            const textSize = size === 'h-8 w-8' ? 'text-2xl' : (size === 'h-7 w-7' ? 'text-xl' : 'text-3xl');
            return `<span class="${textSize} leading-none flex items-center justify-center">${value}</span>`;
        }

        function normalizeAvatarValue(value, userId) {
            if (!value || typeof value !== 'string') return DEFAULT_AVATAR;
            if (value.includes('avatar-glass-emblem') || value.includes('lisani-avatar-img') || value.includes('object-cover')) {
                return value;
            }
            const svgMatch = value.match(/avatars\/(.+\.svg)/i);
            if (svgMatch) return teamAvatarImg(svgMatch[1]);
            return resolveLegacyAvatar(value);
        }

        function formatAvatarForDisplay(value, userId) {
            const normalized = normalizeAvatarValue(value, userId);
            if (!normalized) return DEFAULT_AVATAR;
            if (isCustomPhotoAvatar(normalized)) {
                const srcMatch = normalized.match(/src="([^"]+)"/);
                if (srcMatch) {
                    return `<img src="${srcMatch[1]}" class="lisani-avatar-img" alt="" />`;
                }
            }
            if (isTeamAvatar(normalized)) {
                return `<span class="avatar-display-glass">${normalized}</span>`;
            }
            return normalized;
        }

        function applyAvatarToContainer(container, value) {
            if (!container) return;
            container.innerHTML = formatAvatarForDisplay(value);
            const isVisual = isTeamAvatar(value) || isCustomPhotoAvatar(value);
            container.classList.remove('text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl');
            if (!isVisual) {
                const emojiSize = container.classList.contains('lisani-avatar-slot--sm')
                    ? 'text-xl'
                    : container.classList.contains('lisani-avatar-slot--lg')
                      ? 'text-3xl'
                      : 'text-2xl';
                container.classList.add(emojiSize);
            }
        }

        window.applyAvatarToContainer = applyAvatarToContainer;
        window.normalizeAvatarValue = normalizeAvatarValue;
        window.formatAvatarForDisplay = formatAvatarForDisplay;

        function avatarSlotHtml(value, sizeClass, userId) {
            const slotClass = sizeClass || 'lisani-avatar-slot--sm';
            const normalized = normalizeAvatarValue(value || DEFAULT_AVATAR, userId);
            const content = formatAvatarForDisplay(normalized, userId);
            const isVisual = isTeamAvatar(normalized) || isCustomPhotoAvatar(normalized);
            const emojiCls = !isVisual ? ' text-xl' : '';
            return `<span class="lisani-avatar-slot ${slotClass} rounded-full inline-flex items-center justify-center flex-shrink-0${emojiCls}">${content}</span>`;
        }

        window.avatarSlotHtml = avatarSlotHtml;
        window.DEFAULT_AVATAR = DEFAULT_AVATAR;
        window.resolveLegacyAvatar = resolveLegacyAvatar;

        function createAvatarButton(opt, mode) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-avatar-type', opt.type);
            btn.setAttribute('data-avatar-value', opt.emoji);
            const iconSize = mode === 'register' ? 'h-8 w-8' : 'h-7 w-7';
            const labelSize = mode === 'register' ? 'text-[8px]' : 'text-[7px]';
            btn.className = mode === 'register'
                ? 'avatar-option flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 transition-all duration-200 theme-border'
                : 'edit-avatar-option flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all duration-200 theme-border w-full';
            btn.innerHTML = `${avatarIconHtml(opt.emoji, iconSize)}<span class="${labelSize} font-semibold theme-text-muted truncate max-w-full px-0.5">${opt.label}</span>`;
            if (mode === 'register') {
                btn.addEventListener('click', () => selectAvatar(opt.type, opt.emoji));
            } else {
                btn.addEventListener('click', () => selectEditAvatar(opt.type, opt.emoji));
            }
            return btn;
        }

        function createPhotoUploadButton(mode) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = mode === 'register'
                ? 'avatar-option flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed theme-border py-2.5 transition-all duration-200'
                : 'edit-avatar-option flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed theme-border py-2 transition-all duration-200 col-span-2';
            btn.innerHTML = mode === 'register'
                ? '<i data-lucide="camera" class="w-7 h-7 theme-text-muted"></i><span class="text-[8px] theme-text-muted font-semibold">Fotoğraf</span>'
                : '<i data-lucide="camera" class="w-3.5 h-3.5 theme-text-muted"></i><span class="text-[7px] theme-text-muted font-semibold">Fotoğraf</span>';
            btn.addEventListener('click', () => {
                if (mode === 'register') triggerAvatarUpload();
                else triggerEditAvatarUpload();
            });
            return btn;
        }

        function initAvatarGrids() {
            const regGrid = document.getElementById('avatar-grid');
            const editGrid = document.getElementById('edit-avatar-grid');
            if (regGrid) {
                regGrid.innerHTML = '';
                AVATAR_OPTIONS.forEach((opt) => regGrid.appendChild(createAvatarButton(opt, 'register')));
                regGrid.appendChild(createPhotoUploadButton('register'));
                highlightAvatarSelection('.avatar-option', selectedAvatarValue);
                const preview = document.getElementById('avatar-preview-big');
                const label = document.getElementById('avatar-preview-label');
                if (preview) applyAvatarToContainer(preview, selectedAvatarValue);
                if (label) label.textContent = getAvatarLabel(selectedAvatarType);
            }
            if (editGrid) {
                editGrid.innerHTML = '';
                AVATAR_OPTIONS.forEach((opt) => editGrid.appendChild(createAvatarButton(opt, 'edit')));
                editGrid.appendChild(createPhotoUploadButton('edit'));
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        let selectedAvatarType = 'besiktas';
        let selectedAvatarValue = DEFAULT_AVATAR;
        let editAvatarValue = DEFAULT_AVATAR;

        let registeredUsers = {
            'ahmet': {
                name: 'Ahmet',
                email: 'ahmet@gmail.com',
                password: '123',
                avatar: '🐱'
            }
        };

        let currentUser = null;
        let currentUserRole = null; // 'hoca' veya 'ogrenci'

        // Rol seçimi
        function selectRole(role) {
            document.getElementById('reg-role').value = role;
            const hocaDiv = document.getElementById('reg-sinif-hoca-div');
            const ogrenciDiv = document.getElementById('reg-sinif-ogrenci-div');
            const hocaBtn = document.getElementById('role-btn-hoca');
            const ogrenciBtn = document.getElementById('role-btn-ogrenci');
            const activeClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn is-active';
            const inactiveClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn';
            if (role === 'hoca') {
                hocaBtn.className = activeClass;
                ogrenciBtn.className = inactiveClass;
                if (hocaDiv) hocaDiv.classList.remove('hidden');
                if (ogrenciDiv) ogrenciDiv.classList.add('hidden');
            } else {
                ogrenciBtn.className = activeClass;
                hocaBtn.className = inactiveClass;
                if (hocaDiv) hocaDiv.classList.add('hidden');
                if (ogrenciDiv) ogrenciDiv.classList.remove('hidden');
            }
        }

        function toggleAuthTab(tab) {
            playClickSound();
            const loginTab = document.getElementById('auth-tab-login');
            const registerTab = document.getElementById('auth-tab-register');
            const loginForm = document.getElementById('auth-form-login');
            const registerForm = document.getElementById('auth-form-register');
            const activeClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn is-active';
            const inactiveClass = 'flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all lisani-segment-btn';

            if (tab === 'login') {
                loginTab.className = activeClass;
                registerTab.className = inactiveClass;
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                registerTab.className = activeClass;
                loginTab.className = inactiveClass;
                registerForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
        }

        function selectAvatar(type, emoji) {
            playClickSound();
            selectedAvatarType = type;
            selectedAvatarValue = emoji;
            highlightAvatarSelection('.avatar-option', emoji);

            const preview = document.getElementById('avatar-preview-big');
            const label = document.getElementById('avatar-preview-label');
            if (preview) applyAvatarToContainer(preview, emoji);
            if (label) label.textContent = getAvatarLabel(type);
        }

        function selectEditAvatar(type, emoji) {
            playClickSound();
            editAvatarValue = emoji;
            highlightAvatarSelection('.edit-avatar-option', emoji);

            const preview = document.getElementById('edit-avatar-preview');
            applyAvatarToContainer(preview, emoji);
        }

        function triggerAvatarUpload() {
            playClickSound();
            document.getElementById('avatar-upload-input').click();
        }

        window.hydrateProgressFromServer = function (data) {
            if (!data || currentUserRole === 'hoca') return;

            window._lisaniServerStats = {
                tests_count: Number(data.tests_count) || 0,
                avg_success: Number(data.avg_success) || 0,
                total_xp: Number(data.total_xp) || 0,
            };

            const serverTests = Array.isArray(data.recent_tests) ? data.recent_tests : [];
            const hasDb =
                window._lisaniServerStats.tests_count > 0 ||
                window._lisaniServerStats.total_xp > 0 ||
                serverTests.length > 0;

            if (hasDb) {
                if (serverTests.length > 0) {
                    testHistory = serverTests.map((r, i) => ({
                        id: r.id || i + 1,
                        date: r.date || '',
                        level: r.level,
                        test: r.test || '',
                        correct: r.correct ?? 0,
                        wrong: r.wrong ?? 0,
                        percent: r.percent ?? 0,
                        score: r.percent ?? 0,
                    }));
                } else if (window._lisaniServerStats.tests_count === 0) {
                    testHistory = [];
                }
                totalScore = window._lisaniServerStats.total_xp;
            }

            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}

            window.refreshAllLearningUI();
        };

        // --- ÖĞRENİM İSTATİSTİKLERİNİ DİNAMİK HESAPLAMA VE GÜNCELLEME ---
        function updateLearningStats() {
            const solvedCountEl = document.getElementById('stats-solved-count');
            const avgSuccessEl = document.getElementById('stats-avg-success');
            const totalXpEl = document.getElementById('stats-total-xp');

            if (!solvedCountEl || !avgSuccessEl || !totalXpEl) return;

            const server = window._lisaniServerStats;
            const solvedCount =
                testHistory.length > 0 ? testHistory.length : server?.tests_count || 0;
            solvedCountEl.innerText = solvedCount;

            let avgSuccess = 0;
            if (testHistory.length > 0) {
                let totalSuccess = 0;
                testHistory.forEach((record) => {
                    totalSuccess += record.percent;
                });
                avgSuccess = Math.round(totalSuccess / testHistory.length);
            } else if (server) {
                avgSuccess = server.avg_success || 0;
            }

            avgSuccessEl.innerText = `%${avgSuccess}`;
            totalXpEl.innerText = totalScore || server?.total_xp || 0;
        }

        function triggerEditAvatarUpload() {
            playClickSound();
            document.getElementById('edit-avatar-upload-input').click();
        }

        function isYoneticiUser() {
            return currentUserRole === 'yonetici' || (window.currentUser && window.currentUser.role === 'yonetici');
        }
        window.isYoneticiUser = isYoneticiUser;

        function canTrackStudents() {
            return isHocaUser() || isYoneticiUser();
        }
        window.canTrackStudents = canTrackStudents;

        function isHocaUser() {
            return currentUserRole === 'hoca' || (window.currentUser && window.currentUser.role === 'hoca');
        }
        window.isHocaUser = isHocaUser;

        function getHomeRoleBadgeText(role) {
            if (role === 'yonetici') return 'Yönetici';
            if (role === 'hoca') return 'Hoca';
            return 'Matbu Yolcusu';
        }

        function getSettingsRoleBadgeHtml(role) {
            if (role === 'yonetici') return '👑 Yönetici';
            if (role === 'hoca') return '📚 Hoca';
            return '🎒 Öğrenci';
        }

        window.updateHomeRoleBadge = function (role) {
            const el = document.getElementById('home-role-badge');
            if (!el) return;
            const r = role || currentUserRole || (window.currentUser && window.currentUser.role) || 'ogrenci';
            el.textContent = getHomeRoleBadgeText(r);
        };
        window.getSettingsRoleBadgeHtml = getSettingsRoleBadgeHtml;

        window.togglePasswordVisibility = function (inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input || !btn) return;
            if (typeof playClickSound === 'function') playClickSound();
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
            btn.setAttribute('title', show ? 'Şifreyi gizle' : 'Şifreyi göster');
            btn.innerHTML = show
                ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
                : '<i data-lucide="eye" class="w-4 h-4"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        function mapTestsToHistory(tests) {
            return (tests || []).map((r, i) => ({
                id: r.id || i + 1,
                date: r.date || '',
                level: r.level,
                test: r.test || '',
                correct: r.correct ?? 0,
                wrong: r.wrong ?? 0,
                percent: r.percent ?? 0,
                score: r.percent ?? 0,
            }));
        }

        function getDisplayProgressHistory() {
            return testHistory;
        }

        function updateGelisimScreenForRole() {
            const title = document.getElementById('ai-screen-title');
            const subtitle = document.getElementById('ai-screen-subtitle');
            const chartBadge = document.getElementById('ai-chart-badge-label');
            if (title) title.textContent = 'Gelişim Analizi';
            if (subtitle) subtitle.textContent = 'Uygulamada çözdüğünüz testlerin skor geçmişi';
            if (chartBadge) chartBadge.textContent = 'Skorlarım';
        }
        window.updateGelisimScreenForRole = updateGelisimScreenForRole;

        window.refreshProgressView = function () {
            renderProgressChart();
            renderQuizHistoryList();
            const history = getDisplayProgressHistory();
            if (history.length > 0) {
                showTrialDetail(history[history.length - 1].id);
            } else {
                const detailCard = document.getElementById('selected-trial-detail-card');
                if (detailCard) detailCard.classList.add('hidden');
            }
        };

        window.refreshGelisimTab = function () {
            if (canTrackStudents()) {
                if (typeof window.openHocaDashboard === 'function') window.openHocaDashboard();
                return;
            }
            if (typeof window.loadProgressFromServer === 'function') {
                window.loadProgressFromServer();
            } else {
                window.refreshProgressView();
            }
        };

        const LEVEL_TITLES = {
            1: 'Seviye 1: Harfler & Sayılar',
            2: 'Seviye 2: Yazım Kuralları & Okuma',
            3: 'Seviye 3: Kelime Kökü & Kaynak Dil',
        };

        window.odevVerFromTest = function (level, testName) {
            const uid = currentUser?.uid || currentUser?.id;
            if (!uid) {
                showToast('Giriş gerekli.', 'error');
                return;
            }
            odevVer(uid, level, testName);
        };

        function updateTestsTabForRole() {
            const hint = document.getElementById('tests-hoca-hint');
            const studentHint = document.getElementById('tests-student-hint');
            const hoca = isHocaUser();
            const yonetici = isYoneticiUser();
            if (hint) hint.classList.toggle('hidden', !hoca);
            if (studentHint) studentHint.classList.toggle('hidden', hoca || yonetici);
        }
        window.updateTestsTabForRole = updateTestsTabForRole;

        function isTestAlreadyCompleted(level, testName) {
            const lv = Number(level);
            const name = String(testName || '').trim();
            return testHistory.some((r) => Number(r.level) === lv && String(r.test || '').trim() === name);
        }

        function getCompletedTestRecord(level, testName) {
            const lv = Number(level);
            const name = String(testName || '').trim();
            return testHistory.find((r) => Number(r.level) === lv && String(r.test || '').trim() === name);
        }

        // --- İNTERAKTİF SINAV ÇALIŞTIRMA MOTORU ---
        function startLevel(level) {
            playClickSound();
            activeLevel = level;

            document.getElementById('selected-level-title').innerText = LEVEL_TITLES[level] || `Seviye ${level}`;
            const testsContainer = document.getElementById('tests-buttons-container');
            testsContainer.innerHTML = '';

            const assignMode = isHocaUser();

            function renderStudentTestBtn(level, testName, isGenel) {
                const completed = isTestAlreadyCompleted(level, testName);
                const record = completed ? getCompletedTestRecord(level, testName) : null;
                const testBtn = document.createElement('button');
                testBtn.type = 'button';
                testBtn.className = `lisani-glass-panel lisani-test-btn lisani-test-list-card rounded-2xl p-4 text-left flex items-center justify-between w-full min-w-0${isGenel ? ' lisani-test-btn--genel' : ''}${completed ? ' opacity-70' : ''}`;
                if (completed) {
                    testBtn.onclick = () => showToast(`Bu testi zaten çözdünüz (%${record.percent}). Tekrar çözülemez.`, 'info');
                    testBtn.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="lisani-test-list-icon${isGenel ? ' lisani-test-list-icon--genel' : ''} w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                            <i data-lucide="${isGenel ? 'award' : 'check-circle'}" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs font-extrabold theme-text-main">${isGenel ? 'Genel Değerlendirme 🏆' : testName}</h4>
                            <p class="text-[10px] theme-text-muted mt-0.5">Tamamlandı · %${record.percent} başarı</p>
                        </div>
                    </div>
                    <span class="lisani-test-go-chip shrink-0 ml-2 opacity-80">Çözüldü</span>`;
                } else {
                    testBtn.onclick = () => launchQuizEngine(level, testName);
                    testBtn.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="lisani-test-list-icon${isGenel ? ' lisani-test-list-icon--genel' : ''} w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                            <i data-lucide="${isGenel ? 'award' : 'file-question'}" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs font-extrabold theme-text-main">${isGenel ? 'Genel Değerlendirme 🏆' : testName}</h4>
                            <p class="text-[10px] theme-text-muted mt-0.5">${isGenel ? 'Karma sorular · tüm konular' : '5 soruluk seviye sınavı'}</p>
                        </div>
                    </div>
                    <span class="lisani-test-go-chip${isGenel ? ' lisani-test-go-chip--genel' : ''} shrink-0 ml-2">${isGenel ? 'Sınav' : 'Başla'}</span>`;
                }
                testsContainer.appendChild(testBtn);
            }

            for (let i = 1; i <= 3; i++) {
                const testName = `Test ${i}`;
                const testBtn = document.createElement('button');
                testBtn.type = 'button';
                testBtn.className = 'lisani-glass-panel lisani-test-btn lisani-test-list-card rounded-2xl p-4 text-left flex items-center justify-between w-full min-w-0';
                if (assignMode) {
                    testBtn.onclick = () => window.odevVerFromTest(level, testName);
                    testBtn.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="lisani-test-list-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                            <i data-lucide="clipboard-list" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-xs font-extrabold theme-text-main">${testName}</h4>
                            <p class="text-[10px] theme-text-muted mt-0.5">5 soruluk seviye sınavı · ödev olarak gönder</p>
                        </div>
                    </div>
                    <span class="lisani-test-go-chip shrink-0 ml-2">Ödev Ver</span>`;
                    testsContainer.appendChild(testBtn);
                } else {
                    renderStudentTestBtn(level, testName, false);
                }
            }

            if (assignMode) {
                const generalTestBtn = document.createElement('button');
                generalTestBtn.type = 'button';
                generalTestBtn.className = 'lisani-glass-panel lisani-test-btn lisani-test-list-card lisani-test-btn--genel rounded-2xl p-4 text-left flex items-center justify-between w-full min-w-0';
                generalTestBtn.onclick = () => window.odevVerFromTest(level, 'Genel');
                generalTestBtn.innerHTML = `
                <div class="flex items-center gap-3 min-w-0">
                    <div class="lisani-test-list-icon lisani-test-list-icon--genel w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <i data-lucide="award" class="w-4 h-4"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-black theme-text-main">Genel Değerlendirme 🏆</h4>
                        <p class="text-[10px] theme-text-muted mt-0.5">Karma sorular · ödev olarak gönder</p>
                    </div>
                </div>
                <span class="lisani-test-go-chip lisani-test-go-chip--genel shrink-0 ml-2">Ödev Ver</span>`;
                testsContainer.appendChild(generalTestBtn);
            } else {
                renderStudentTestBtn(level, 'Genel', true);
            }

            document.getElementById('level-selection-view').classList.add('hidden');
            document.getElementById('test-selection-view').classList.remove('hidden');
            lucide.createIcons();
        }

        function goBackToLevels() {
            playClickSound();
            document.getElementById('test-selection-view').classList.add('hidden');
            document.getElementById('quiz-active-view').classList.add('hidden');
            document.getElementById('quiz-result-view').classList.add('hidden');
            document.getElementById('level-selection-view').classList.remove('hidden');
            lucide.createIcons();
        }

        function goBackFromQuiz() {
            playClickSound();
            if (activeQuestionIndex > 0 || activeCorrects > 0 || activeWrongs > 0) {
                if (!confirm('Sınavdan çıkılsın mı? Bu oturumdaki ilerleme kaydedilmez.')) {
                    return;
                }
            }
            document.getElementById('quiz-active-view').classList.add('hidden');
            document.getElementById('test-selection-view').classList.remove('hidden');
            lucide.createIcons();
        }

        function goBackToTestList() {
            playClickSound();
            document.getElementById('quiz-result-view').classList.add('hidden');
            document.getElementById('quiz-active-view').classList.add('hidden');
            document.getElementById('test-selection-view').classList.remove('hidden');
            lucide.createIcons();
        }

        window.goBackToLevels = goBackToLevels;
        window.goBackFromQuiz = goBackFromQuiz;
        window.goBackToTestList = goBackToTestList;

        // Sınavı Başlatır
        function launchQuizEngine(level, testName) {
            if (isTestAlreadyCompleted(level, testName)) {
                const record = getCompletedTestRecord(level, testName);
                showToast(`Bu testi zaten çözdünüz (%${record?.percent ?? 0}). Tekrar çözülemez.`, 'info');
                return false;
            }

            playClickSound();
            activeLevel = level;
            activeTestName = testName;
            activeQuestionIndex = 0;
            activeCorrects = 0;
            activeWrongs = 0;

            const categoryQuestions = quizBank[level]?.[testName];
            if (!categoryQuestions || categoryQuestions.length === 0) {
                showToast("Bu test henüz hazır değil, yakında eklenecek.", "info");
                return false;
            }

            activeQuizQuestions = JSON.parse(JSON.stringify(categoryQuestions)); // Klonla

            document.getElementById('active-quiz-title').innerText = `Seviye ${level} - ${testName}`;
            document.getElementById('level-selection-view').classList.add('hidden');
            document.getElementById('test-selection-view').classList.add('hidden');
            document.getElementById('quiz-result-view').classList.add('hidden');
            document.getElementById('quiz-active-view').classList.remove('hidden');

            renderQuizQuestion();
            return true;
        }

        window.startOdevTest = function (level, testName) {
            if (isTestAlreadyCompleted(level, testName)) {
                const record = getCompletedTestRecord(level, testName);
                showToast(`Bu testi zaten çözdünüz (%${record?.percent ?? 0}). Tekrar çözülemez.`, 'info');
                return;
            }
            if (typeof switchTab === 'function') {
                switchTab('tests');
            }
            setTimeout(() => launchQuizEngine(level, testName), 120);
        };

        // Soru Çizer (Cam Şık Butonları Entegre Edildi)
        function renderQuizQuestion() {
            const q = activeQuizQuestions[activeQuestionIndex];
            const total = activeQuizQuestions.length;
            const current = activeQuestionIndex + 1;
            document.getElementById('active-question-counter').innerText = `${current} / ${total}`;

            const progressBar = document.getElementById('quiz-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${(current / total) * 100}%`;
            }
            
            document.getElementById('quiz-display-word').innerHTML = q.word.replace(/\n/g, '<br>');

            const container = document.getElementById('quiz-options-container');
            container.innerHTML = '';

            const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
            q.options.forEach((option, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'lisani-glass-panel lisani-quiz-option w-full py-3 px-3.5 rounded-xl theme-text-main text-xs font-bold transition-all text-left flex items-center gap-3 cursor-pointer active:scale-[0.98]';
                btn.innerHTML = `
                    <span class="lisani-quiz-option__letter">${optionLabels[idx] || '•'}</span>
                    <span class="flex-1 min-w-0 leading-relaxed">${option}</span>
                    <i data-lucide="chevron-right" class="w-4 h-4 theme-text-muted shrink-0 opacity-60"></i>`;
                btn.onclick = () => selectQuizOption(option, q.answer, btn);
                container.appendChild(btn);
            });

            document.getElementById('quiz-feedback-box').classList.add('hidden');
            document.getElementById('quiz-next-btn').classList.add('hidden');
            lucide.createIcons();
        }

        // Seçenek Tıklama İşlemi (Zümrüt ve Yakut Parlayan Cam Şıklar)
        function selectQuizOption(selected, correct, btn) {
            playClickSound();
            const feedback = document.getElementById('quiz-feedback-box');
            feedback.classList.remove('hidden');

            const allButtons = document.querySelectorAll('#quiz-options-container button');
            allButtons.forEach(b => b.disabled = true);

            if (selected === correct) {
                btn.className = 'lisani-quiz-option lisani-quiz-option--correct w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                
                feedback.className = 'lisani-quiz-feedback lisani-quiz-feedback--ok rounded-xl p-3.5 text-center text-[11px] font-bold';
                feedback.innerHTML = 'Harika! 🌿 Doğru cevap · +10 XP';
                activeCorrects++;
                totalScore += 10;
                updateUIPoints();
                updateLearningStats();
            } else {
                btn.className = 'lisani-quiz-option lisani-quiz-option--wrong w-full py-3 px-3.5 rounded-xl text-xs font-black transition-all text-left flex items-center gap-3';
                
                feedback.className = 'lisani-quiz-feedback lisani-quiz-feedback--bad rounded-xl p-3.5 text-center text-[11px] font-bold';
                feedback.innerHTML = `Yanlış 📈 Doğru cevap: <strong>${correct}</strong>`;
                activeWrongs++;
            }

            document.getElementById('quiz-next-btn').classList.remove('hidden');
            lucide.createIcons();
        }

        // Sonraki Soru veya Sınav Tamamlama
        function nextQuestion() {
            playClickSound();
            activeQuestionIndex++;
            if (activeQuestionIndex < activeQuizQuestions.length) {
                renderQuizQuestion();
            } else {
                finishQuizEngine();
            }
        }

        // Sınav Tamamlama ve Gelişime Ekleme
        function finishQuizEngine() {
            const successPercent = Math.round((activeCorrects / activeQuizQuestions.length) * 100);
            
            // Yeni Geçmiş Kaydı Oluştur
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
            
            const newRecord = {
                id: testHistory.length > 0 ? Math.max(...testHistory.map(h => h.id)) + 1 : 1,
                date: dateStr,
                level: activeLevel,
                test: activeTestName,
                correct: activeCorrects,
                wrong: activeWrongs,
                percent: successPercent,
                score: successPercent 
            };

            testHistory.push(newRecord);
            try {
                localStorage.setItem('lisani_test_history', JSON.stringify(testHistory));
            } catch (e) {}

            // Sonuçları Sonuç Paneline Çiz
            document.getElementById('result-correct-count').innerText = String(activeCorrects);
            document.getElementById('result-wrong-count').innerText = String(activeWrongs);
            
            const pctEl = document.getElementById('result-percent');
            pctEl.innerText = `%${successPercent}`;
            
            const ringFill = document.getElementById('result-score-ring-fill');
            if (ringFill) {
                const circumference = 2 * Math.PI * 42;
                const offset = circumference - (successPercent / 100) * circumference;
                ringFill.style.strokeDasharray = `${circumference}`;
                ringFill.style.strokeDashoffset = `${offset}`;
            }

            const scoreRing = document.getElementById('result-score-ring');
            if (scoreRing) {
                scoreRing.classList.remove('is-good', 'is-mid', 'is-low');
                if (successPercent >= 80) {
                    scoreRing.classList.add('is-good');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-emerald-400';
                } else if (successPercent >= 60) {
                    scoreRing.classList.add('is-mid');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-blue-400';
                } else {
                    scoreRing.classList.add('is-low');
                    pctEl.className = 'lisani-quiz-score-ring__pct text-amber-400';
                }
            }

            document.getElementById('quiz-active-view').classList.add('hidden');
            document.getElementById('quiz-result-view').classList.remove('hidden');
            
            // Gelişim Grafiğini ve Sınav Geçmiş Listesini Yenile
            renderProgressChart();
            renderQuizHistoryList();
            updateLearningStats();

            if (typeof window.syncProgressToServer === 'function') {
                window.syncProgressToServer();
            }
            
            showToast("Sınav tamamlandı! Sonuçlar grafiğe eklendi.", "success");
        }

        function finishQuizAndGoHome() {
            playClickSound();
            document.getElementById('quiz-result-view').classList.add('hidden');
            switchTab('ai'); 
        }

        function openQuizAnalysis() {
            playClickSound();
            document.getElementById('quiz-analysis-container').classList.remove('hidden');
        }

        function closeQuizAnalysis() {
            playClickSound();
            document.getElementById('quiz-analysis-container').classList.add('hidden');
        }

        function openEditProfile() {
            playClickSound();
            if (!currentUser) return;

            document.getElementById('edit-profile-username').value = currentUser.name;
            document.getElementById('edit-profile-email').value = currentUser.email;

            const preview = document.getElementById('edit-avatar-preview');
            editAvatarValue = currentUser.avatar;
            applyAvatarToContainer(preview, normalizeAvatarValue(currentUser.avatar, currentUser.uid));

            document.querySelectorAll('.edit-avatar-option').forEach(btn => {
                btn.classList.remove('selected');
                const val = btn.getAttribute('data-avatar-value');
                if (val && val === normalizeAvatarValue(currentUser.avatar, currentUser.uid)) {
                    btn.classList.add('selected');
                }
            });

            document.getElementById('edit-profile-container').classList.remove('hidden');
        }

        function closeEditProfile() {
            playClickSound();
            document.getElementById('edit-profile-container').classList.add('hidden');
        }

        function openKariyerModu() {
            playClickSound();
            if (window.LisaniTennisOnline?.resetKariyerPanels) {
                window.LisaniTennisOnline.resetKariyerPanels();
            } else {
                document.getElementById('career-intro-wrapper')?.classList.remove('hidden');
                document.getElementById('kariyer-tennis-online-block')?.classList.add('hidden');
                document.getElementById('tennis-game-container')?.classList.add('hidden');
                document.getElementById('flappy-game-container')?.classList.add('hidden');
                document.getElementById('gokhan-abi-block')?.classList.add('hidden');
            }
            if (window.LisaniFlappy?.stop) window.LisaniFlappy.stop();
            if (window.LisaniGokhanEaster?.stopAudio) window.LisaniGokhanEaster.stopAudio();
            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            lucide.createIcons();
        }

        function closeKariyerModu() {
            playClickSound();
            stopTennisGame();
            if (window.LisaniFlappy?.stop) window.LisaniFlappy.stop();
            if (window.LisaniGokhanEaster?.stopAudio) window.LisaniGokhanEaster.stopAudio();
            if (window.LisaniTennisOnline) {
                window.LisaniTennisOnline.stop(false);
            }
            document.getElementById('kariyer-modal-container').classList.add('hidden');

            document.getElementById('career-intro-wrapper').classList.remove('hidden');
            document.getElementById('kariyer-tennis-online-block')?.classList.add('hidden');
            document.getElementById('tennis-game-container').classList.add('hidden');
            document.getElementById('flappy-game-container')?.classList.add('hidden');
            document.getElementById('gokhan-abi-block')?.classList.add('hidden');
        }

        // --- 🎾 GİZLİ TENİS OYUNU KİLİT DURUMU (sunucu + kullanıcı bazlı localStorage) ---
        let tennisUnlocked = false;

        window.getTennisUnlocked = function () {
            return tennisUnlocked;
        };

        function tennisUnlockStorageKey(uid) {
            return uid ? `lisani_tennis_unlocked_${uid}` : 'lisani_tennis_unlocked';
        }

        function applyTennisUnlockUI(unlocked) {
            const badge = document.getElementById('tennis-unlock-badge');
            if (badge) badge.classList.toggle('hidden', !unlocked);
            const form = document.getElementById('tennis-secret-form');
            const hint = document.getElementById('tennis-secret-hint');
            const msg = document.getElementById('tennis-unlocked-msg');
            if (form) form.classList.toggle('hidden', unlocked);
            if (hint) hint.classList.toggle('hidden', unlocked);
            if (msg) msg.classList.toggle('hidden', !unlocked);
        }

        function setTennisUnlockState(unlocked, uid) {
            tennisUnlocked = !!unlocked;
            const key = tennisUnlockStorageKey(uid);
            try {
                if (unlocked) localStorage.setItem(key, '1');
                else localStorage.removeItem(key);
            } catch (e) {}
            applyTennisUnlockUI(tennisUnlocked);
            if (currentUser && (!uid || String(currentUser.uid) === String(uid))) {
                currentUser.tennisUnlocked = tennisUnlocked;
                try {
                    if (localStorage.getItem('lisani_remember_me') === 'true') {
                        localStorage.setItem('lisani_session_user', JSON.stringify(currentUser));
                    }
                } catch (e) {}
            }
        }

        function syncTennisUnlockFromUser(user) {
            if (!user?.uid) return;
            if (user.tennisUnlocked) {
                setTennisUnlockState(true, user.uid);
                return;
            }
            try {
                const local = localStorage.getItem(tennisUnlockStorageKey(user.uid)) === '1';
                const legacy = localStorage.getItem('lisani_tennis_unlocked') === '1';
                if (local || legacy) {
                    setTennisUnlockState(true, user.uid);
                    if (legacy && window._loginDone && typeof window.apiFetch === 'function') {
                        window.apiFetch('/api/profile/tennis-unlock', { method: 'POST', body: '{}' }).catch(() => {});
                    }
                } else {
                    setTennisUnlockState(false, user.uid);
                }
            } catch (e) {
                setTennisUnlockState(false, user.uid);
            }
        }

        window.syncTennisUnlockFromUser = syncTennisUnlockFromUser;

        // --- KARİYER MODU TEK / ÇİFT / ÜÇ / DÖRT TIKLAMA YÖNETİMİ ---
        let kariyerClickCount = 0;
        let kariyerClickTimer = null;

        function handleKariyerModuClick() {
            kariyerClickCount++;
            clearTimeout(kariyerClickTimer);

            if (kariyerClickCount >= 4) {
                kariyerClickCount = 0;
                launchGokhanAbiEasterEgg();
                return;
            }

            kariyerClickTimer = setTimeout(() => {
                const count = kariyerClickCount;
                kariyerClickCount = 0;
                if (count === 1) {
                    openKariyerModu();
                } else if (count === 2) {
                    if (tennisUnlocked) {
                        if (typeof window.openTennisOnlineLobby === 'function') {
                            window.openTennisOnlineLobby();
                        } else {
                            launchTennisDirectly();
                        }
                    } else {
                        openKariyerModu();
                        showToast("Tenis oyununu açmak için önce profil bölümündeki şifreyi gir. 🗝️", "info");
                    }
                } else if (count === 3) {
                    launchFlappyDirectly();
                }
            }, 380);
        }

        function launchGokhanAbiEasterEgg() {
            playClickSound();
            stopTennisGame();
            if (window.LisaniFlappy?.stop) window.LisaniFlappy.stop();
            if (window.LisaniTennisOnline) window.LisaniTennisOnline.stop(false);

            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            document.getElementById('career-intro-wrapper')?.classList.add('hidden');
            document.getElementById('kariyer-tennis-online-block')?.classList.add('hidden');
            document.getElementById('tennis-game-container')?.classList.add('hidden');
            document.getElementById('flappy-game-container')?.classList.add('hidden');
            document.getElementById('gokhan-abi-block')?.classList.remove('hidden');
            lucide.createIcons();

            showToast('Gökhan Abi açıldı — kamera ikonuna dokun. 📹', 'success');
        }

        window.launchGokhanAbiEasterEgg = launchGokhanAbiEasterEgg;

        function launchFlappyDirectly() {
            playClickSound();
            stopTennisGame();
            if (window.LisaniTennisOnline) {
                window.LisaniTennisOnline.stop(false);
            }
            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            document.getElementById('career-intro-wrapper').classList.add('hidden');
            document.getElementById('kariyer-tennis-online-block')?.classList.add('hidden');
            document.getElementById('tennis-game-container')?.classList.add('hidden');
            document.getElementById('gokhan-abi-block')?.classList.add('hidden');
            document.getElementById('flappy-game-container')?.classList.remove('hidden');
            lucide.createIcons();
            try {
                const best = parseInt(localStorage.getItem('lisani_flappy_best') || '0', 10) || 0;
                const bestEl = document.getElementById('flappy-best-score');
                if (bestEl) bestEl.textContent = 'En iyi: ' + best;
            } catch (_) { /* ignore */ }
            showToast("Flappy Bird açıldı! 🐦", "success");
            setTimeout(() => {
                if (window.LisaniFlappy?.start) window.LisaniFlappy.start();
            }, 180);
        }

        window.launchFlappyDirectly = launchFlappyDirectly;

        // --- ANA SAYFADAN DOĞRUDAN TENİS OYUNUNU BAŞLAT ---
        function launchTennisDirectly() {
            playClickSound();
            if (window.LisaniFlappy?.stop) window.LisaniFlappy.stop();
            if (window.LisaniTennis) {
                window.LisaniTennis.setOnlineMode(false, null, '', '');
            }
            if (window.LisaniTennisOnline) {
                window.LisaniTennisOnline.stop(false);
            }
            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            document.getElementById('career-intro-wrapper').classList.add('hidden');
            document.getElementById('kariyer-tennis-online-block')?.classList.add('hidden');
            document.getElementById('flappy-game-container')?.classList.add('hidden');
            document.getElementById('gokhan-abi-block')?.classList.add('hidden');
            document.getElementById('tennis-game-container').classList.remove('hidden');
            lucide.createIcons();
            showToast("Tenis oyunu başlatıldı! 🎾", "success");
            setTimeout(() => { initTennisGameEngine(); }, 220);
        }

        // --- PROFİL EKRANINDA ŞİFRE DOĞRULAMA ---
        function submitProfileSecretCode() {
            playClickSound();
            const codeField = document.getElementById('profile-secret-code');
            const entered = (codeField?.value || '').trim();

            if (entered === "264506") {
                setTennisUnlockState(true, currentUser?.uid);
                if (window._loginDone && typeof window.apiFetch === 'function') {
                    window.apiFetch('/api/profile/tennis-unlock', { method: 'POST', body: '{}' })
                        .then((data) => {
                            if (data?.user && typeof window.syncTennisUnlockFromUser === 'function') {
                                window.syncTennisUnlockFromUser({
                                    uid: data.user.uid,
                                    tennisUnlocked: !!data.user.tennisUnlocked,
                                });
                            }
                        })
                        .catch(() => {});
                }
                if (codeField) codeField.value = '';
                showToast("Şifre doğru! Kariyer Modu'na çift tıklayarak tenis oyununu aç. 🎾", "success");
            } else {
                showToast("Hatalı şifre.", "error");
                if (codeField) codeField.value = '';
            }
        }

        function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedAvatarType = 'custom';
                    selectedAvatarValue = `<img src="${e.target.result}" class="lisani-avatar-img" alt="" />`;
                    const preview = document.getElementById('avatar-preview-big');
                    const label = document.getElementById('avatar-preview-label');
                    if (preview) applyAvatarToContainer(preview, selectedAvatarValue);
                    if (label) label.textContent = 'Fotoğrafım';
                    highlightAvatarSelection('.avatar-option', '');
                    showToast("Profil görseli yüklendi.", "success");
                };
                reader.readAsDataURL(file);
            }
        }

        function handleEditAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editAvatarValue = `<img src="${e.target.result}" class="lisani-avatar-img" alt="" />`;
                    applyAvatarToContainer(document.getElementById('edit-avatar-preview'), editAvatarValue);
                    highlightAvatarSelection('.edit-avatar-option', '');
                    showToast("Yeni görsel yüklendi. Kaydetmeyi unutmayın.", "success");
                };
                reader.readAsDataURL(file);
            }
        }

        // PROFİLİ DÜZENLEME DEĞİŞİKLİKLERİ
        function saveProfileChanges() {
            playClickSound();
            
            const nameInput = document.getElementById('edit-profile-username').value.trim();
            const emailInput = document.getElementById('edit-profile-email').value.trim();

            if (!nameInput) {
                showToast("Lütfen tüm alanları doldurun.", "error");
                return;
            }

            currentUser.name = nameInput;
            currentUser.email = emailInput;
            currentUser.avatar = editAvatarValue;

            document.getElementById('settings-profile-name').innerText = nameInput;
            document.getElementById('settings-profile-sub').innerHTML = getSettingsRoleBadgeHtml(currentUserRole);
            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${nameInput}! 👋`;
            if (typeof window.updateHomeRoleBadge === 'function') {
                window.updateHomeRoleBadge(currentUserRole);
            }

            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('settings-avatar-container')
            ];

            avatarContainers.forEach(container => {
                applyAvatarToContainer(container, editAvatarValue);
            });

            showToast("Profil güncellendi.", "success");
            closeEditProfile();
        }

        function quickLogin() {
            playClickSound();
            // Hızlı giriş: ilk localStorage kullanıcısını bul
            try {
                const saved = localStorage.getItem('lisani_registered_users');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const keys = Object.keys(parsed);
                    if (keys.length) {
                        const user = parsed[keys[0]];
                        document.getElementById('login-username').value = user.email || keys[0];
                        document.getElementById('login-password').value = user.password || '';
                        submitLogin();
                        return;
                    }
                }
            } catch(e) {}
            // Fallback: geliştirici girişi
            loginAsDeveloper();
        }

        async function submitLogin() {
            playClickSound();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('login-remember-me') ? document.getElementById('login-remember-me').checked : false;

            if (!usernameInput || !passwordInput) { showToast("İsim ve şifre boş bırakılamaz.", "error"); return; }

            // 1. ÖNCE YEREL — anında giriş
            try {
                const saved = localStorage.getItem('lisani_all_users');
                if (saved) {
                    const users = JSON.parse(saved);
                    const found = users.find(u => u.name.toLowerCase() === usernameInput.toLowerCase());
                    if (found) {
                        if (found.password !== passwordInput) { showToast("Şifre hatalı.", "error"); return; }
                        window._loginDone = true;
                        currentUserRole = found.role || 'ogrenci';
                        loginSuccess(found, rememberMe);
                        _firebaseLoginBg(found.email, passwordInput);
                        return;
                    }
                }
            } catch(e) {}

            // 2. Yerel bulunamazsa Firebase'e sor
            showLoading('Giriş yapılıyor...');
            try {
                await _waitFirebase();
                const snap = await window._db.collection('users').where('name', '==', usernameInput).limit(1).get();
                if (snap.empty) { hideLoading(); showToast("Bu isimde kayıtlı kullanıcı bulunamadı.", "error"); return; }
                const ud = snap.docs[0].data();
                const uid = snap.docs[0].id;
                await window._auth.signInWithEmailAndPassword(ud.email, passwordInput);
                window._loginDone = true;
                const user = { uid, name: ud.name, email: ud.email, avatar: ud.avatar || '🐱', role: ud.role || 'ogrenci', sinif: ud.sinif || null, password: passwordInput };
                currentUserRole = ud.role || 'ogrenci';
                _saveUserLocally(user);
                hideLoading();
                loginSuccess(user, rememberMe);
            } catch(e) {
                hideLoading();
                const msgs = { 'auth/wrong-password': 'Şifre hatalı.', 'auth/too-many-requests': 'Çok fazla deneme.', 'auth/invalid-credential': 'İsim veya şifre hatalı.' };
                showToast(msgs[e.code] || 'Giriş başarısız.', "error");
            }
        }

        function loginAsDeveloper() {
            playClickSound();
            const devUser = {
                name: "Geliştirici Alp 🛠️",
                email: "developer@temrin.ai",
                password: "dev",
                avatar: "🛠️",
                role: "hoca"
            };
            currentUserRole = "hoca";
            registeredUsers["geliştirici alp 🛠️"] = devUser;
            loginSuccess(devUser);
        }

        async function submitRegister() {
            playClickSound();
            const name = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'ogrenci';
            const sinif = role === 'hoca' ? (document.getElementById('reg-sinif') ? document.getElementById('reg-sinif').value.trim() : '') : '';

            if (!name || !password || !passwordConfirm) { showToast("Lütfen tüm alanları doldurun.", "error"); return; }
            if (password !== passwordConfirm) { showToast("Şifreler eşleşmiyor.", "error"); return; }
            if (password.length < 6) { showToast("Şifre en az 6 karakter olmalı.", "error"); return; }

            // İsim çakışması kontrolü
            try {
                const saved = localStorage.getItem('lisani_all_users');
                if (saved) {
                    const users = JSON.parse(saved);
                    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
                        showToast("Bu isim zaten alınmış.", "error"); return;
                    }
                }
            } catch(e) {}

            // ANINDA yerel kayıt — kullanıcı beklemez
            const nameSafe = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) || 'kullanici';
            const randStr = Math.random().toString(36).substring(2, 8);
            const email = nameSafe + '_' + randStr + '@lisaniecdad.app';
            const newUser = { uid: 'local_' + Date.now(), name, email, password, avatar: selectedAvatarValue, role, sinif, totalScore: 0 };
            _saveUserLocally(newUser);
            window._loginDone = true;
            currentUserRole = role;
            showToast("Hesap oluşturuldu!", "success");
            loginSuccess(newUser, true);

            // Arka planda Firebase'e kaydet
            _firebaseRegisterBg(newUser, role, sinif);
        }

        // --- ARKA PLAN FIREBASE YARDIMCILARI ---
        function _saveUserLocally(user) {
            try {
                const saved = localStorage.getItem('lisani_all_users');
                const users = saved ? JSON.parse(saved) : [];
                const idx = users.findIndex(u => u.name.toLowerCase() === user.name.toLowerCase());
                if (idx >= 0) users[idx] = { ...users[idx], ...user }; else users.push(user);
                localStorage.setItem('lisani_all_users', JSON.stringify(users));
            } catch(e) {}
        }

        async function _waitFirebase(timeout = 8000) {
            const start = Date.now();
            while (!window._firebaseReady && Date.now() - start < timeout)
                await new Promise(r => setTimeout(r, 300));
        }

        async function _firebaseLoginBg(email, password) {
            if (window._manualLogout) return; // Çıkış yapıldıysa arka plan girişi engelle
            try { await _waitFirebase(); if (window._auth && !window._manualLogout) await window._auth.signInWithEmailAndPassword(email, password); } catch(e) {}
        }

        async function _firebaseRegisterBg(user, role, sinif) {
            try {
                await _waitFirebase(15000);
                if (!window._auth) return;
                const cred = await window._auth.createUserWithEmailAndPassword(user.email, user.password);
                const uid = cred.user.uid;
                await window._db.collection('users').doc(uid).set({
                    name: user.name, email: user.email, avatar: user.avatar,
                    role, sinif, totalScore: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (role === 'hoca') {
                    await window._db.collection('siniflar').doc(uid).set({
                        hocaId: uid, hocaAdi: user.name,
                        sinifAdi: sinif || (user.name + "'in Grubu"),
                        ogrenciler: [], odevler: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                _saveUserLocally({ ...user, uid });
            } catch(e) { console.log('Firebase bg:', e.message); }
        }

        function loginSuccess(user, rememberMe = false, silent = false) {
            currentUser = user;
            window.currentUser = user;
            currentUserRole = user.role || 'ogrenci';
            window._loginDone = true;
            window._manualLogout = false;

            if (rememberMe) {
                try {
                    const sessionPayload = { ...user };
                    const storedPwd =
                        user.password ||
                        (typeof window._resolveStoredPassword === 'function'
                            ? window._resolveStoredPassword(user.name, sessionPayload)
                            : '');
                    if (storedPwd) sessionPayload.password = storedPwd;
                    localStorage.setItem('lisani_session_user', JSON.stringify(sessionPayload));
                    localStorage.setItem('lisani_remember_me', 'true');
                    if (localStorage.getItem('lisani_remember_me_pref') !== 'false') {
                        localStorage.setItem('lisani_remember_me_pref', 'true');
                    }
                } catch(e) {}
            } else {
                try {
                    localStorage.removeItem('lisani_session_user');
                    localStorage.removeItem('lisani_remember_me');
                } catch(e) {}
            }
            try { localStorage.setItem('lisani_registered_users', JSON.stringify(registeredUsers)); } catch(e) {}
            
            document.getElementById('settings-profile-name').innerText = user.name;
            document.getElementById('settings-profile-sub').innerHTML = getSettingsRoleBadgeHtml(currentUserRole);
            if (typeof window.updateHomeRoleBadge === 'function') {
                window.updateHomeRoleBadge(currentUserRole);
            }
            
            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('settings-avatar-container')
            ];
            avatarContainers.forEach(container => {
                applyAvatarToContainer(container, normalizeAvatarValue(user.avatar, user.uid));
            });

            syncTennisUnlockFromUser(user);

            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${user.name}! 👋`;
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('main-application-flow').classList.remove('hidden');

            const afterLogin = async () => {
                if (typeof window.onLoginSuccessHook === 'function') {
                    await window.onLoginSuccessHook(user);
                } else {
                    updateLearningStats();
                }
                updateTestsTabForRole();
                updateGelisimScreenForRole();
                if (!silent) {
                    showToast("Giriş yapıldı. İyi çalışmalar!", "success");
                    switchTab('home');
                }
            };
            afterLogin();
        }

        async function logoutApp() {
            playClickSound();
            window._manualLogout = true;
            window._loginDone = false;
            currentUser = null;
            window.currentUser = null;
            currentUserRole = null;

            // Tüm yerel verileri temizle
            try {
                localStorage.removeItem('lisani_session_user');
                localStorage.removeItem('lisani_remember_me');
                // lisani_all_users'ı silme — bir sonraki girişte lazım olur
            } catch(e) {}

            // Firebase çıkış
            if (window._auth) { try { await window._auth.signOut(); } catch(e) {} }

            // Formları temizle
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            const ru = document.getElementById('reg-username'); if(ru) ru.value = '';
            const re = document.getElementById('reg-email'); if(re) re.value = '';
            const rp = document.getElementById('reg-password'); if(rp) rp.value = '';
            const rpc = document.getElementById('reg-password-confirm'); if(rpc) rpc.value = '';

            // Giriş ekranına dön
            document.getElementById('main-application-flow').classList.add('hidden');
            document.getElementById('auth-container').classList.remove('hidden');
            toggleAuthTab('login');
            if (window.LisaniTennisOnline) window.LisaniTennisOnline.stop(false);
            showToast("Çıkış yapıldı.", "info");
        }

        // --- HOCA PANELİ ---
        // --- HOCA VERİ YÖNETİMİ (yerel + Firebase arka plan) ---
        function _getLocalSinif(hocaUid) {
            try {
                const s = localStorage.getItem('sinif_' + hocaUid);
                return s ? JSON.parse(s) : null;
            } catch(e) { return null; }
        }

        function _saveLocalSinif(hocaUid, data) {
            try { localStorage.setItem('sinif_' + hocaUid, JSON.stringify(data)); } catch(e) {}
        }

        function _initSinif(hocaUid) {
            let sinif = _getLocalSinif(hocaUid);
            if (!sinif) {
                const kisaKod = Math.random().toString(36).substring(2,5).toUpperCase() + Math.floor(100 + Math.random()*900);
                sinif = { hocaId: hocaUid, hocaAdi: currentUser.name, sinifAdi: currentUser.sinif || (currentUser.name + "'in Grubu"), kisaKod, ogrenciler: [], odevler: [] };
                _saveLocalSinif(hocaUid, sinif);
                // kisaKod = Firebase doc ID — direkt .doc(kisaKod).get() ile bulunur, where() gerekmez
                _waitFirebase().then(() => {
                    if (window._db) window._db.collection('siniflar').doc(kisaKod).set({ ...sinif, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
                });
            }
            if (!sinif.kisaKod) {
                sinif.kisaKod = Math.random().toString(36).substring(2,5).toUpperCase() + Math.floor(100+Math.random()*900);
                _saveLocalSinif(hocaUid, sinif);
                _waitFirebase().then(() => {
                    if (window._db) window._db.collection('siniflar').doc(sinif.kisaKod).set({ ...sinif, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
                });
            }
            return sinif;
        }

        async function loadHocaPanel(uid) {
            const sinif = _initSinif(uid);

            // Firebase'den güncel veriyi arka planda çek, sonra paneli güncelle
            _waitFirebase(5000).then(async () => {
                if (!window._db) return;
                try {
                    const snap = await window._db.collection('siniflar').doc(uid).get();
                    if (snap.exists) {
                        const fbData = snap.data();
                        // Firebase'deki öğrenci listesi daha güncel olabilir
                        const merged = { ...sinif, ...fbData };
                        _saveLocalSinif(uid, merged);
                        // Paneli güncelle (hâlâ açıksa)
                        if (document.getElementById('hoca-panel-modal')) _renderHocaPanel(uid, merged);
                    }
                } catch(e) {}
            });

            _renderHocaPanel(uid, sinif);
        }

        function _renderHocaPanel(uid, sinif) {
            const kod = uid; // Tam uid = sınıf kodu (hızlı direkt erişim)
            let allUsers = [];
            try { allUsers = JSON.parse(localStorage.getItem('lisani_all_users') || '[]'); } catch(e) {}

            let ogrencilerHTML = '';
            if (sinif.ogrenciler && sinif.ogrenciler.length > 0) {
                sinif.ogrenciler.forEach(oid => {
                    const o = allUsers.find(u => u.uid === oid) || { name: '(bilinmiyor)', avatar: '🎒', totalScore: 0 };
                    ogrencilerHTML += `<div class="flex items-center gap-2 py-2 border-b theme-border">
                        ${typeof window.avatarSlotHtml === 'function' ? window.avatarSlotHtml(o.avatar) : `<span class="text-xl">${o.avatar || '🎒'}</span>`}
                        <div class="flex-1"><div class="text-xs font-bold theme-text-main">${o.name}</div></div>
                        <span class="text-xs font-bold text-amber-400">${o.totalScore || 0} XP</span>
                    </div>`;
                });
            } else {
                ogrencilerHTML = '<p class="text-xs theme-text-muted text-center py-4">Henüz öğrenci yok.<br>Sınıf kodunu öğrencilerinize verin.</p>';
            }

            let odevlerHTML = '';
            if (sinif.odevler && sinif.odevler.length > 0) {
                sinif.odevler.slice(-3).reverse().forEach(o => {
                    const lbl = o.label || (o.level && o.test ? `Seviye ${o.level} — ${o.test}` : o.icerik);
                    odevlerHTML += `<div class="py-1.5 border-b theme-border"><p class="text-xs theme-text-main">${lbl}</p><p class="text-[10px] theme-text-muted">${o.tarih}</p></div>`;
                });
            }

            let panel = document.getElementById('hoca-panel-modal');
            if (!panel) { panel = document.createElement('div'); panel.id = 'hoca-panel-modal'; panel.className = 'fixed inset-0 z-50 flex items-end justify-center'; document.body.appendChild(panel); }
            panel.innerHTML = `<div class="w-full max-w-sm bg-stone-950 rounded-t-3xl border-t border-stone-700 p-5 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-extrabold theme-text-main">📚 Hoca Paneli</h2>
                    <button onclick="document.getElementById('hoca-panel-modal').remove()" class="text-stone-500 hover:text-stone-300 text-xl">✕</button>
                </div>
                <div class="bg-stone-800/60 rounded-xl p-3 mb-4">
                    <p class="text-[10px] theme-text-muted mb-1">📎 Grup: <strong class="theme-text-main">${sinif.sinifAdi}</strong></p>
                    <p class="text-[10px] theme-text-muted mb-0.5">Sınıf Kodu (öğrencilere verin):</p>
                    <p class="text-2xl font-bold text-amber-400 font-mono tracking-widest">${sinif.kisaKod || kod.substring(0,8)}</p>
                </div>
                <h3 class="text-xs font-bold theme-text-main mb-2">👥 Öğrenciler (${sinif.ogrenciler.length})</h3>
                <div class="mb-4">${ogrencilerHTML}</div>
                ${odevlerHTML ? `<h3 class="text-xs font-bold theme-text-main mb-2">📋 Son Ödevler</h3><div class="mb-4">${odevlerHTML}</div>` : ''}
                <h3 class="text-xs font-bold theme-text-main mb-2">📝 Yeni Test Ödevi</h3>
                <p class="text-[10px] theme-text-muted mb-3">Aşağıdan seviye ve test seçerek ödev gönderin.</p>
                <div id="odev-test-picker" data-hoca-uid="${uid}"></div>
            </div>`;
            if (typeof window.initOdevTestPicker === 'function') {
                window.initOdevTestPicker(uid);
            }
        }

        function odevVer(hocaUid, levelArg, testArg) {
            const levelEl = document.getElementById('odev-level');
            const testEl = document.getElementById('odev-test');
            const level = levelArg || (levelEl ? parseInt(levelEl.value, 10) : 0);
            const test = testArg || (testEl ? testEl.value : '');
            if (!level || !test) { showToast("Lütfen seviye ve test seçin.", "error"); return; }
            const sinif = _getLocalSinif(hocaUid) || _initSinif(hocaUid);
            sinif.odevler.push({
                type: 'test',
                level,
                test,
                label: `Seviye ${level} — ${test}`,
                tarih: new Date().toLocaleDateString('tr-TR'),
                hocaAdi: currentUser.name
            });
            _saveLocalSinif(hocaUid, sinif);
            // Firebase arka plan
            _waitFirebase().then(() => {
                if (window._db) window._db.collection('siniflar').doc(hocaUid).update({ odevler: sinif.odevler }).catch(()=>{});
            });
            showToast("Ödev gönderildi!", "success");
            loadHocaPanel(hocaUid);
        }

        async function sinifaKatil(sinifKodu) {
            if (!currentUser || !sinifKodu || sinifKodu.trim().length < 4) { showToast("Geçerli bir sınıf kodu girin.", "error"); return; }
            const kod = sinifKodu.trim().toUpperCase();

            showLoading("Sınıfa katılınıyor...");

            try {
                await Promise.race([
                    _waitFirebase(5000),
                    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
                ]);
                if (!window._db) throw new Error("Bağlantı yok");

                // kisaKod = doc ID — direkt get, index gerekmez, çok hızlı
                const snap = await Promise.race([
                    window._db.collection('siniflar').doc(kod).get(),
                    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
                ]);

                if (!snap.exists) { hideLoading(); showToast("Sınıf bulunamadı. Kodu kontrol edin.", "error"); return; }

                const sd = snap.data();
                const ogrenciler = sd.ogrenciler || [];
                if (ogrenciler.includes(currentUser.uid)) { hideLoading(); showToast("Zaten bu sınıftasınız.", "info"); return; }

                ogrenciler.push(currentUser.uid);
                await window._db.collection('siniflar').doc(kod).update({ ogrenciler });
                _saveLocalSinif(kod, { ...sd, ogrenciler });
                _saveUserLocally({ ...currentUser, sinifKodu: kod });

                hideLoading();
                showToast("✅ " + sd.sinifAdi + " sınıfına katıldınız!", "success");
                const modal = document.getElementById('sinif-katil-modal');
                if (modal) modal.remove();

            } catch(e) {
                hideLoading();
                showToast(e.message === 'timeout' ? "Bağlantı zaman aşımı. İnternet bağlantınızı kontrol edin." : "Hata: " + e.message, "error");
            }
        }

        function showHocaPanel() {
            if (!currentUser || currentUserRole !== 'hoca') {
                showToast("Bu özellik sadece hocalar için.", "error");
                return;
            }
            loadHocaPanel(currentUser.uid);
        }

        function showSinifKatilModal() {
            let modal = document.getElementById('sinif-katil-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'sinif-katil-modal';
                modal.className = 'fixed inset-0 z-50 flex items-end justify-center';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `<div class="w-full max-w-sm bg-stone-900 rounded-t-3xl border-t border-stone-700 p-5">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-extrabold theme-text-main">🏫 Sınıfa Katıl</h2>
                    <button onclick="document.getElementById('sinif-katil-modal').remove()" class="text-stone-500 hover:text-stone-300">✕</button>
                </div>
                <p class="text-xs theme-text-muted mb-3">Hocanızdan aldığınız 8 haneli sınıf kodunu girin:</p>
                <input id="sinif-kod-input" type="text" maxlength="8" placeholder="ÖRN: AB1C2D3E" class="w-full p-3 rounded-xl border theme-border theme-card-bg theme-text-main text-sm font-mono font-bold uppercase focus:outline-none mb-3">
                <button onclick="sinifaKatil(document.getElementById('sinif-kod-input').value)" class="lisani-glass-action lisani-glass-action--primary w-full py-3 rounded-xl text-xs font-bold">Katıl</button>
            </div>`;
        }

        function updateUIPoints() {
            const ptsHome = document.getElementById('total-xp-display-home');
            const scoreDisplay = document.getElementById('home-score-display');
            if (ptsHome) ptsHome.innerText = `${totalScore} XP`;
            if (scoreDisplay) scoreDisplay.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5 fill-current text-amber-500"></i><span>${totalScore} XP</span>`;
            lucide.createIcons();
        }

        // --- PRELINE UI GÖRÜNÜM / TEMA ---
        const COLOR_MODE_KEY = 'lisani_color_mode';
        const VALID_THEMES = ['kahve-kum', 'zumrut-nane', 'saray-kahvesi', 'derin-mavi', 'mavi-mor'];
        const THEME_CLASS_NAMES = VALID_THEMES.map((t) => 'theme-' + t);
        const THEME_META_COLORS = {
            'kahve-kum': '#14100e',
            'zumrut-nane': '#081210',
            'saray-kahvesi': '#120d0a',
            'derin-mavi': '#080c14',
            'mavi-mor': '#08061a',
        };

        function normalizeColorMode(mode) {
            if (VALID_THEMES.includes(mode)) return mode;
            if (mode === 'light') return 'kahve-kum';
            if (mode === 'dark') return 'derin-mavi';
            return 'mavi-mor';
        }

        function highlightColorModeButtons() {
            const current = normalizeColorMode(localStorage.getItem(COLOR_MODE_KEY) || 'mavi-mor');
            document.querySelectorAll('[data-color-mode]').forEach((btn) => {
                const active = btn.getAttribute('data-color-mode') === current;
                btn.classList.toggle('is-active', active);
            });
        }

        function applyDocumentColorMode(mode) {
            const theme = normalizeColorMode(mode);
            const root = document.documentElement;
            THEME_CLASS_NAMES.forEach((cls) => root.classList.remove(cls));
            root.classList.add('theme-' + theme);
            root.classList.add('dark');
            const meta = document.getElementById('meta-theme-color');
            if (meta) meta.setAttribute('content', THEME_META_COLORS[theme] || '#100c0a');
        }

        function setColorMode(mode) {
            playClickSound();
            const theme = normalizeColorMode(mode);
            localStorage.setItem(COLOR_MODE_KEY, theme);
            applyDocumentColorMode(theme);
            highlightColorModeButtons();
            showToast('Renk teması güncellendi.', 'success');
        }

        function initPrelineTheme() {
            document.documentElement.classList.add('preline-ui');
            applyDocumentColorMode(localStorage.getItem(COLOR_MODE_KEY) || 'mavi-mor');
            highlightColorModeButtons();
        }

        let currentActiveScreen = 'home';
        function switchTab(screenId) {
            if (!screenId || screenId === currentActiveScreen) return;

            if (screenId === 'ai' && canTrackStudents()) {
                if (typeof window.openHocaDashboard === 'function') {
                    window.openHocaDashboard();
                    return;
                }
            }

            if (screenId === 'tests' && canTrackStudents()) {
                screenId = 'hoca-dashboard';
            }

            playClickSound();
            currentActiveScreen = screenId;

            const screens = document.querySelectorAll('.screen');
            screens.forEach((screen) => {
                screen.classList.remove('active');
            });

            const targetScreen = document.getElementById(`screen-${screenId}`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            if (screenId === 'ai') {
                updateGelisimScreenForRole();
                renderProgressChart();
                renderQuizHistoryList();
                if (testHistory.length > 0) {
                    showTrialDetail(testHistory[testHistory.length - 1].id);
                }
                if (typeof window.loadProgressFromServer === 'function') {
                    window.loadProgressFromServer();
                }
            }

            if (screenId === 'hoca-dashboard') {
                if (canTrackStudents()) {
                    if (typeof window.loadHocaDashboard === 'function') {
                        window.loadHocaDashboard(true);
                    } else if (typeof window.loadHocaProgressView === 'function') {
                        window.loadHocaProgressView(true);
                    }
                } else if (typeof switchTab === 'function') {
                    switchTab('home');
                }
            }

            if (screenId === 'tests') {
                document.getElementById('test-selection-view').classList.add('hidden');
                document.getElementById('quiz-active-view').classList.add('hidden');
                document.getElementById('quiz-result-view').classList.add('hidden');
                document.getElementById('level-selection-view').classList.remove('hidden');
                updateTestsTabForRole();
            }

            if (screenId === 'settings') {
                updateLearningStats();
            }

            if (screenId === 'osm-translate' && window.lucide) {
                lucide.createIcons();
            }

            const screensContainer = document.getElementById('screens-container');
            if (screensContainer) {
                screensContainer.classList.toggle('lisani-screens--letters-only', screenId === 'letters');
                screensContainer.classList.toggle('lisani-screens--hoca-dash', screenId === 'hoca-dashboard');
            }

            const tabIds = ['ai', 'tests', 'hoca-dashboard', 'home', 'letters', 'osm-translate', 'settings'];
            tabIds.forEach((id) => {
                const tabBtn = document.getElementById(`tab-${id}`);
                if (!tabBtn) return;

                tabBtn.classList.remove('lisani-tab-active', 'font-black', 'theme-primary-color');
                tabBtn.classList.add('theme-text-muted');

                const icon = tabBtn.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                }

                if (id === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.classList.remove('lisani-tab-label-active', 'font-black', 'theme-primary-color');
                        homeText.classList.add('theme-text-muted');
                    }
                }
            });

            const activeTab = document.getElementById(`tab-${screenId}`);
            if (activeTab) {
                activeTab.classList.remove('theme-text-muted');
                activeTab.classList.add('lisani-tab-active');

                const activeIcon = activeTab.querySelector('i');
                if (activeIcon) activeIcon.style.transform = 'scale(1.06)';

                if (screenId === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.classList.remove('theme-text-muted');
                        homeText.classList.add('lisani-tab-label-active');
                    }
                }
            }
        }

        window.switchTab = switchTab;

        // GÜNÜN HADİSLERİ VERİ TABANI
        const hadisList = [
            {
                osmanli: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا",
                turkce: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
                kaynak: "Buhârî, İlim, 12"
            },
            {
                osmanli: "خِيَارُكُمْ أَحْسَنُكُمْ أَخْلَاقًا",
                turkce: "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
                kaynak: "Buhârî, Edeb, 39"
            },
            {
                osmanli: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
                turkce: "Güzel söz sadakadır.",
                kaynak: "Buhârî, Cihâd, 128"
            },
            {
                osmanli: "تَهَادَوْا تَحَابُّوا",
                turkce: "Hediyeleşiniz ki birbirinizi sevesiniz.",
                kaynak: "Muvatta, Hüsnü'l-Huluk, 4"
            }
        ];

        let currentHadisIdx = 0;

        function nextHadis() {
            playClickSound();
            currentHadisIdx = (currentHadisIdx + 1) % hadisList.length;
            const hadis = hadisList[currentHadisIdx];
            
            document.getElementById('home-hadis-osmanli').innerText = hadis.osmanli;
            document.getElementById('home-hadis-turkce').innerText = `"${hadis.turkce}"`;
            document.getElementById('home-hadis-kaynak').innerText = hadis.kaynak;
            
            showToast("Yeni hadis yüklendi.", "success");
        }

        // Detay analizi kartına geçmiş sınavı yükler
        function showTrialDetail(id) {
            const deneme = getDisplayProgressHistory().find((d) => d.id === id);
            if (!deneme) return;

            const detailCard = document.getElementById('selected-trial-detail-card');
            if (detailCard) detailCard.classList.remove('hidden');

            document.getElementById('detail-trial-title').innerText = `Seviye ${deneme.level} - ${deneme.test} Detayı`;
            document.getElementById('detail-trial-date').innerText = deneme.date;
            document.getElementById('detail-trial-corrects').innerText = `${deneme.correct} Doğru`;
            document.getElementById('detail-trial-wrongs').innerText = `${deneme.wrong} Yanlış`;
            document.getElementById('detail-trial-success').innerText = `%${deneme.percent} Başarı`;

            const successTextEl = document.getElementById('detail-trial-success');
            if (deneme.percent >= 80) {
                successTextEl.className = "text-sm font-black text-emerald-400 animate-pulse";
            } else if (deneme.percent >= 60) {
                successTextEl.className = "text-sm font-black text-blue-450";
            } else {
                successTextEl.className = "text-sm font-black text-amber-450";
            }
        }

        // Çözülen Sınavların Analiz Listesini Çizer
        function renderQuizHistoryList() {
            const listEl = document.getElementById('quiz-history-list');
            const countEl = document.getElementById('total-quizzes-solved');
            const detailCard = document.getElementById('selected-trial-detail-card');
            if (!listEl) return;

            const history = getDisplayProgressHistory();
            listEl.innerHTML = '';
            countEl.innerText = `Toplam: ${history.length} Sınav`;

            // Hiç test çözülmemişse boş durum mesajı göster ve detay kartını gizle
            if (history.length === 0) {
                if (detailCard) detailCard.classList.add('hidden');
                const emptyMsg = 'Henüz çözülen sınav yok';
                listEl.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <i data-lucide="clipboard-list" class="w-8 h-8 theme-text-muted opacity-50"></i>
                        <p class="text-[11px] theme-text-muted font-bold">${emptyMsg}</p>
                        <p class="text-[10px] theme-text-muted opacity-70">Test çözdükçe sonuçların burada listelenecek</p>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }

            history.slice().reverse().forEach(record => {
                const row = document.createElement('div');
                row.className = "lisani-glass-panel lisani-glass-history-row";
                row.onclick = () => {
                    playClickSound();
                    showTrialDetail(record.id);
                    showToast("Sınav detayı yüklendi.", "success");
                };
                
                row.innerHTML = `
                    <div class="flex items-center space-x-2.5">
                        <span class="text-xs font-bold theme-text-main">Sev. ${record.level} - ${record.test}</span>
                        <span class="text-[9px] theme-text-muted font-semibold">${record.date}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-[10px] text-emerald-400 font-bold">${record.correct}D</span>
                        <span class="text-[10px] text-red-400 font-bold mr-1.5">${record.wrong}Y</span>
                        <span class="text-[10px] font-black theme-primary-color bg-black/45 px-2.5 py-0.5 rounded-md">%${record.percent}</span>
                    </div>
                `;
                listEl.appendChild(row);
            });
        }

        // İNTERAKTİF TEST ANALİZ GRAPH SİSTEMİ (SVG)
        function renderProgressChart() {
            const svg = document.getElementById('progress-svg-chart');
            if (!svg) return;
            const history = getDisplayProgressHistory();
            svg.innerHTML = `
                <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.0" />
                    </linearGradient>
                </defs>
            `;

            if (history.length === 0) {
                const emptyText = 'Henüz tamamlanan test yok';
                svg.innerHTML += `<text x="250" y="130" fill="var(--theme-text-muted)" font-size="14" font-weight="bold" text-anchor="middle">${emptyText}</text>`;
                return;
            }

            const pointsCount = history.length;
            const maxScore = 100; 
            const width = 500; 
            const height = 260; 

            const marginL = 40;
            const marginR = 25;
            const marginT = 40; 
            const marginB = 35; 

            const usableW = width - marginL - marginR;
            const usableH = height - marginT - marginB;
            const bottomY = height - marginB; 

            const gridLevels = [0, 50, 100]; 
            const gridLabels = ["%0", "%50", "%100"];

            gridLevels.forEach((level, idx) => {
                const gy = bottomY - (level / maxScore) * usableH;
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", marginL);
                line.setAttribute("y1", gy);
                line.setAttribute("x2", width - marginR);
                line.setAttribute("y2", gy);
                line.setAttribute("stroke", "var(--theme-border)");
                line.setAttribute("stroke-opacity", "0.35");
                line.setAttribute("stroke-width", "1");
                svg.appendChild(line);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", marginL - 10);
                text.setAttribute("y", gy + 4);
                text.setAttribute("fill", "var(--theme-text-muted)");
                text.setAttribute("font-size", "10");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("text-anchor", "end");
                text.textContent = gridLabels[idx];
                svg.appendChild(text);
            });

            let pointsArray = [];
            history.forEach((record, idx) => {
                const x = pointsCount > 1 ? marginL + (idx / (pointsCount - 1)) * usableW : marginL + usableW / 2;
                const percent = record.score / maxScore;
                const y = bottomY - percent * usableH;
                const axisLabel = `S${record.level}-T${record.id}`;

                pointsArray.push({
                    id: record.id,
                    x: x,
                    y: y,
                    percentLabel: `%${record.percent}`,
                    axisLabel: axisLabel
                });
            });

            pointsArray.forEach(pt => {
                const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                vLine.setAttribute("x1", pt.x);
                vLine.setAttribute("y1", pt.y);
                vLine.setAttribute("x2", pt.x);
                vLine.setAttribute("y2", bottomY);
                vLine.setAttribute("stroke", "var(--theme-primary)");
                vLine.setAttribute("stroke-opacity", "0.2");
                vLine.setAttribute("stroke-dasharray", "3,3");
                vLine.setAttribute("stroke-width", "1");
                svg.appendChild(vLine);
            });

            let pathData = "";
            if (pointsCount > 0) {
                pathData = `M ${pointsArray[0].x} ${pointsArray[0].y}`;
                for (let i = 0; i < pointsCount - 1; i++) {
                    const p0 = pointsArray[i];
                    const p1 = pointsArray[i + 1];
                    const cpX1 = p0.x + (p1.x - p0.x) / 2;
                    const cpY1 = p0.y;
                    const cpX2 = p0.x + (p1.x - p0.x) / 2;
                    const cpY2 = p1.y;
                    
                    pathData += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                }
            }

            if (pointsCount > 1 && pathData !== "") {
                const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const firstPt = pointsArray[0];
                const lastPt = pointsArray[pointsCount - 1];
                const areaData = `${pathData} L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`;
                
                areaPath.setAttribute("d", areaData);
                areaPath.setAttribute("fill", "url(#chart-area-grad)");
                svg.appendChild(areaPath);
            }

            if (pathData !== "") {
                const mainLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                mainLine.setAttribute("d", pathData);
                mainLine.setAttribute("fill", "none");
                mainLine.setAttribute("stroke", "var(--theme-primary)");
                mainLine.setAttribute("stroke-width", "3.5");
                mainLine.setAttribute("stroke-linecap", "round");
                svg.appendChild(mainLine);
            }

            pointsArray.forEach(pt => {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", pt.x);
                circle.setAttribute("cy", pt.y);
                circle.setAttribute("r", "6");
                circle.setAttribute("fill", "#FFFFFF"); 
                circle.setAttribute("stroke", "var(--theme-primary)"); 
                circle.setAttribute("stroke-width", "3");
                circle.style.cursor = "pointer";

                circle.onclick = function() {
                    playClickSound();
                    showTrialDetail(pt.id);
                    showToast("Çalışma istatistiği seçildi.", "success");
                };
                svg.appendChild(circle);

                const pctText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                pctText.setAttribute("x", pt.x);
                pctText.setAttribute("y", pt.y - 12);
                pctText.setAttribute("fill", "var(--theme-text-main)");
                pctText.setAttribute("font-size", "10");
                pctText.setAttribute("font-weight", "black");
                pctText.setAttribute("text-anchor", "middle");
                pctText.textContent = pt.percentLabel;
                svg.appendChild(pctText);

                const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                labelText.setAttribute("x", pt.x);
                labelText.setAttribute("y", bottomY + 20);
                labelText.setAttribute("fill", "var(--theme-text-muted)");
                labelText.setAttribute("font-size", "10");
                labelText.setAttribute("font-weight", "bold");
                labelText.setAttribute("text-anchor", "middle");
                labelText.textContent = pt.axisLabel;
                svg.appendChild(labelText);
            });
        }

        // --- HARFLER KILAVUZU MODÜLÜ ---
        const alphabet = [
            { name: 'Elif', ar: 'ا', sounds: 'A, E, I, İ', desc: 'Kelime başında ince seslilerde E, kalın seslilerde A sesi verir. Kendisinden sonraki harfe birleşmez.', f1: 'ا', f2: 'اـ', f3: 'ـاـ', f4: 'ـا' },
            { name: 'Be', ar: 'ب', sounds: 'B', desc: 'Türkçe kelimelerde bazen P sesine dönüşebilir.', f1: 'ب', f2: 'بـ', f3: 'ـبـ', f4: 'ـب' },
            { name: 'Pe', ar: 'پ', sounds: 'P', desc: 'Osmanlıca ve Farsçaya özgü üç noktalı harftir.', f1: 'پ', f2: 'پـ', f3: 'ـپـ', f4: 'ـپ' },
            { name: 'Te', ar: 'ت', sounds: 'T', desc: 'Yumuşak t sesini verir.', f1: 'ت', f2: 'تـ', f3: 'ـتـ', f4: 'ـت' },
            { name: 'Se', ar: 'ث', sounds: 'S (Pelte)', desc: 'Arapça kökenli kelimelerde peltek "S" sesini temsil eder.', f1: 'ث', f2: 'ثـ', f3: 'ـثـ', f4: 'ـث' },
            { name: 'Cim', ar: 'ج', sounds: 'C', desc: 'Standart c sesini karşılar.', f1: 'ج', f2: 'جـ', f3: 'ـجـ', f4: 'ـج' },
            { name: 'Çim', ar: 'چ', sounds: 'Ç', desc: 'Türkçe ve Farsça kelimeler için üretilen üç noktalı Ç harfidir.', f1: 'چ', f2: 'چـ', f3: 'ـچـ', f4: 'ـچ' },
            { name: 'Ha', ar: 'ح', sounds: 'H', desc: 'Boğazdan çıkarılan kalın "H" sesidir.', f1: 'ح', f2: 'حـ', f3: 'ـحـ', f4: 'ـح' },
            { name: 'Hı', ar: 'خ', sounds: 'H (Hırıltılı)', desc: 'Gırtlaktan hırıldatılarak okunan kalın h sesidir.', f1: 'خ', f2: 'خـ', f3: 'ـخـ', f4: 'ـخ' },
            { name: 'Dal', ar: 'د', sounds: 'D', desc: 'Kendinden sonraki harfle birleşmez.', f1: 'د', f2: 'د', f3: 'ـد', f4: 'ـد' },
            { name: 'Zel', ar: 'ذ', sounds: 'Z (Pelte)', desc: 'Peltek Z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ذ', f2: 'ذ', f3: 'ـذ', f4: 'ـذ' },
            { name: 'Rı', ar: 'ر', sounds: 'R', desc: 'Standart r sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ر', f2: 'ر', f3: 'ـر', f4: 'ـر' },
            { name: 'Ze', ar: 'ز', sounds: 'Z', desc: 'Sert z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ز', f2: 'ز', f3: 'ـز', f4: 'ـز' },
            { name: 'Je', ar: 'ژ', sounds: 'J', desc: 'Üç noktalı rı harfidir. Kendisinden sonraki harfe birleşmez.', f1: 'ژ', f2: 'ژ', f3: 'ـژ', f4: 'ـژ' },
            { name: 'Sin', ar: 'س', sounds: 'S', desc: 'İnce sesli kelimelerde S sesini karşılar.', f1: 'س', f2: 'سـ', f3: 'ـسـ', f4: 'ـس' },
            { name: 'Şın', ar: 'ش', sounds: 'Ş', desc: 'Standart ş sesini karşılar.', f1: 'ش', f2: 'شـ', f3: 'ـشـ', f4: 'ـش' },
            { name: 'Sad', ar: 'ص', sounds: 'S (Kalın)', desc: 'Kalın sesli kelimelerde "S" sesini temsil eder.', f1: 'ص', f2: 'صـ', f3: 'ـصـ', f4: 'ـص' },
            { name: 'Dad', ar: 'ض', sounds: 'D, Z', desc: 'Arapça kökenli kelimelere özel kalın bir sestir.', f1: 'ض', f2: 'ضـ', f3: 'ـضـ', f4: 'ـض' },
            { name: 'Tı', ar: 'ط', sounds: 'T (Kalın)', desc: 'Kalın sesli kelimelerde "T" ve bazen "D" sesini verir.', f1: 'ط', f2: 'طـ', f3: 'ـطـ', f4: 'ـط' },
            { name: 'Zı', ar: 'ظ', sounds: 'Z (Kalın)', desc: 'Kalın sesli kelimelerde kalın ve tok "Z" sesini temsil eder.', f1: 'ظ', f2: 'ظـ', f3: 'ـظـ', f4: 'ـظ' },
            { name: 'Ayın', ar: 'ع', sounds: 'A, E, I, İ, O, Ö, U, Ü', desc: 'Boğazdan gelen bir gırtlak sesidir.', f1: 'ع', f2: 'عـ', f3: 'ـعـ', f4: 'ـع' },
            { name: 'Gayın', ar: 'غ', sounds: 'Ğ, G', desc: 'Kalın sesli kelimelerde yumuşak g veya kalın g sesini verir.', f1: 'غ', f2: 'غـ', f3: 'ـغـ', f4: 'ـغ' },
            { name: 'Fe', ar: 'ف', sounds: 'F', desc: 'Standart f sesini karşılar.', f1: 'ف', f2: 'فـ', f3: 'ـفـ', f4: 'ـف' },
            { name: 'Kaf', ar: 'ق', sounds: 'K (Kalın)', desc: 'Kalın sesli kelimelerde gırtlaktan çıkan tok K sesini verir.', f1: 'ق', f2: 'قـ', f3: 'ـقـ', f4: 'ـق' },
            { name: 'Kef', ar: 'ك', sounds: 'K (İnce)', desc: 'İnce sesli kelimelerde ince K sesini karşılar.', f1: 'ك', f2: 'كـ', f3: 'ـكـ', f4: 'ـك' },
            { name: 'Gef', ar: 'گ', sounds: 'G', desc: 'Türkçe ve Farsçadaki yumuşak G/G sesleri için kullanılır.', f1: 'گ', f2: 'گـ', f3: 'ـگـ', f4: 'ـگ' },
            { name: 'Nef (Sağır Nun)', ar: 'ڭ', sounds: 'N, Ñ', desc: 'Genizden çıkan n (nazal n) sesidir. Türkçeye özeldir.', f1: 'ڭ', f2: 'ڭـ', f3: 'ـڭـ', f4: 'ـڭ' },
            { name: 'Lam', ar: 'ل', sounds: 'L', desc: 'Standart l sesini temsil eder.', f1: 'ل', f2: 'لـ', f3: 'ـلـ', f4: 'ـل' },
            { name: 'Mim', ar: 'م', sounds: 'M', desc: 'Standart m sesini temsil eder.', f1: 'م', f2: 'مـ', f3: 'ـمـ', f4: 'ـم' },
            { name: 'Nun', ar: 'ن', sounds: 'N', desc: 'Standart n sesini temsil eder.', f1: 'ن', f2: 'نـ', f3: 'ـنـ', f4: 'ـن' },
            { name: 'Vav', ar: 'و', sounds: 'V, O, Ö, U, Ü', desc: 'Hem ünsüz hem ünlü harf görevindedir. Birleşmez.', f1: 'و', f2: 'و', f3: 'ـو', f4: 'ـو' },
            { name: 'He', ar: 'ه', sounds: 'H, E, A', desc: 'Kelime sonunda gelince e veya a sesi verir.', f1: 'ه', f2: 'هـ', f3: 'ـهـ', f4: 'ـه' },
            { name: 'Lamelif', ar: 'لا', sounds: 'La', desc: 'Lam ve Elif harflerinin birleşiminden oluşan özel harf.', f1: 'لا', f2: 'لا', f3: 'ـلاـ', f4: 'ـلا' },
            { name: 'Ye', ar: 'ي', sounds: 'Y, I, İ', desc: 'Hem ünsüz hem ünlü harf görevindedir.', f1: 'ي', f2: 'يـ', f3: 'ـيـ', f4: 'ـي' },
            { name: 'Hemze', ar: 'ء', sounds: 'A, E, I, İ', desc: 'Kelime içinde es, kesinti veya ek ünlü seslerini karşılar.', f1: 'ء', f2: 'ء', f3: 'ء', f4: 'ء' }
        ];

        const LETTER_FORM_LABELS = { f1: 'Yalın', f2: 'Başta', f3: 'Ortada', f4: 'Sonda' };

        const LETTER_FORM_EXAMPLES = {
            Elif: { f1: { ar: 'ا', tr: 'Elif — yalın hal' }, f2: { ar: 'اسم', tr: 'ism — ad' }, f3: { ar: 'دنيا', tr: 'dünyâ — dünya' }, f4: { ar: 'قمرا', tr: 'kamer — ay' } },
            Be: { f1: { ar: 'ب', tr: 'Be — yalın hal' }, f2: { ar: 'باب', tr: 'bâb — kapı' }, f3: { ar: 'كتاب', tr: 'kitâb — kitap' }, f4: { ar: 'حب', tr: 'hub — sevgi' } },
            Pe: { f1: { ar: 'پ', tr: 'Pe — yalın hal' }, f2: { ar: 'پدر', tr: 'pedar — baba (Farsça)' }, f3: { ar: 'چپ', tr: 'çep — sol' }, f4: { ar: 'آب', tr: 'âb — su' } },
            Te: { f1: { ar: 'ت', tr: 'Te — yalın hal' }, f2: { ar: 'تاج', tr: 'tâc — taç' }, f3: { ar: 'كتاب', tr: 'kitâb — kitap' }, f4: { ar: 'بيت', tr: 'beyt — ev, mısra' } },
            Se: { f1: { ar: 'ث', tr: 'Se — yalın hal' }, f2: { ar: 'ثواب', tr: 'sevâb — ecir' }, f3: { ar: 'مثال', tr: 'mesâl — örnek' }, f4: { ar: 'حارث', tr: 'hâris — çiftçi' } },
            Cim: { f1: { ar: 'ج', tr: 'Cim — yalın hal' }, f2: { ar: 'جمال', tr: 'cemâl — güzellik' }, f3: { ar: 'مجلس', tr: 'meclis — meclis' }, f4: { ar: 'فرج', tr: 'ferc — ara, fırsat' } },
            Çim: { f1: { ar: 'چ', tr: 'Çim — yalın hal' }, f2: { ar: 'چراغ', tr: 'çirâğ — lamba' }, f3: { ar: 'آچق', tr: 'açıq — açık' }, f4: { ar: 'گوج', tr: 'göç — göç' } },
            Ha: { f1: { ar: 'ح', tr: 'Ha — yalın hal' }, f2: { ar: 'حكم', tr: 'hüküm — hüküm' }, f3: { ar: 'صحت', tr: 'sıhhat — sağlık' }, f4: { ar: 'صبح', tr: 'sabah — sabah' } },
            Hı: { f1: { ar: 'خ', tr: 'Hı — yalın hal' }, f2: { ar: 'خبر', tr: 'haber — haber' }, f3: { ar: 'مخزن', tr: 'mahzen — depo' }, f4: { ar: 'فلخ', tr: 'felah — kurtuluş' } },
            Dal: { f1: { ar: 'د', tr: 'Dal — yalın hal' }, f2: { ar: 'دين', tr: 'din — din' }, f3: { ar: 'مدرسه', tr: 'medrese — okul' }, f4: { ar: 'سعاد', tr: 'saâdet — mutluluk' } },
            Zel: { f1: { ar: 'ذ', tr: 'Zel — yalın hal' }, f2: { ar: 'ذهب', tr: 'zeheb — altın' }, f3: { ar: 'تذكر', tr: 'tezekkür — anma' }, f4: { ar: 'عذر', tr: 'ozr — mazeret' } },
            Rı: { f1: { ar: 'ر', tr: 'Rı — yalın hal' }, f2: { ar: 'رحمت', tr: 'rahmet — merhamet' }, f3: { ar: 'قرآن', tr: 'Kur\'ân — Kur\'an' }, f4: { ar: 'نور', tr: 'nûr — nur' } },
            Ze: { f1: { ar: 'ز', tr: 'Ze — yalın hal' }, f2: { ar: 'زمان', tr: 'zamân — zaman' }, f3: { ar: 'مزاج', tr: 'mizâc — mizaç' }, f4: { ar: 'عز', tr: 'izz — izzet' } },
            Je: { f1: { ar: 'ژ', tr: 'Je — yalın hal' }, f2: { ar: 'ژاله', tr: 'jâle — çiğ' }, f3: { ar: 'پژمرده', tr: 'pürmüre — solmuş' }, f4: { ar: 'مرژ', tr: 'marj — sınır' } },
            Sin: { f1: { ar: 'س', tr: 'Sin — yalın hal' }, f2: { ar: 'سلام', tr: 'selâm — selam' }, f3: { ar: 'مسجد', tr: 'mescid — cami' }, f4: { ar: 'نفس', tr: 'nefs — nefis' } },
            Şın: { f1: { ar: 'ش', tr: 'Şın — yalın hal' }, f2: { ar: 'شكر', tr: 'şükr — şükür' }, f3: { ar: 'مشكل', tr: 'müşkül — güç' }, f4: { ar: 'عشق', tr: 'aşk — aşk' } },
            Sad: { f1: { ar: 'ص', tr: 'Sad — yalın hal' }, f2: { ar: 'صبر', tr: 'sabr — sabır' }, f3: { ar: 'مصطفى', tr: 'Mustafâ — Mustafa' }, f4: { ar: 'ناصر', tr: 'nâsır — yardımcı' } },
            Dad: { f1: { ar: 'ض', tr: 'Dad — yalın hal' }, f2: { ar: 'ضيف', tr: 'daif — misafir' }, f3: { ar: 'مضمون', tr: 'mezmûn — konu' }, f4: { ar: 'فرض', tr: 'farz — farz' } },
            Tı: { f1: { ar: 'ط', tr: 'Tı — yalın hal' }, f2: { ar: 'طلب', tr: 'talab — istek' }, f3: { ar: 'مطلوب', tr: 'matlûb — aranan' }, f4: { ar: 'خط', tr: 'hatt — çizgi' } },
            Zı: { f1: { ar: 'ظ', tr: 'Zı — yalın hal' }, f2: { ar: 'ظهر', tr: 'zuhur — zuhur' }, f3: { ar: 'منظور', tr: 'menzûr — görünür' }, f4: { ar: 'حفظ', tr: 'hıfz — ezber' } },
            Ayın: { f1: { ar: 'ع', tr: 'Ayın — yalın hal' }, f2: { ar: 'علم', tr: 'ilm — ilim' }, f3: { ar: 'معنی', tr: 'ma\'nâ — anlam' }, f4: { ar: 'سمع', tr: 'sem\' — işitme' } },
            Gayın: { f1: { ar: 'غ', tr: 'Gayın — yalın hal' }, f2: { ar: 'غلام', tr: 'gulâm — delikanlı' }, f3: { ar: 'مغفر', tr: 'mağfur — bağışlanmış' }, f4: { ar: 'فراغ', tr: 'ferâğ — boşluk' } },
            Fe: { f1: { ar: 'ف', tr: 'Fe — yalın hal' }, f2: { ar: 'فكر', tr: 'fikr — düşünce' }, f3: { ar: 'مفتاح', tr: 'miftâh — anahtar' }, f4: { ar: 'حرف', tr: 'harf — harf' } },
            Kaf: { f1: { ar: 'ق', tr: 'Kaf — yalın hal' }, f2: { ar: 'قلم', tr: 'kalem — kalem' }, f3: { ar: 'مقام', tr: 'makâm — makam' }, f4: { ar: 'حق', tr: 'hak — hak' } },
            Kef: { f1: { ar: 'ك', tr: 'Kef — yalın hal' }, f2: { ar: 'كتاب', tr: 'kitâb — kitap' }, f3: { ar: 'مكتب', tr: 'makteb — yazı odası' }, f4: { ar: 'ملك', tr: 'melik — hükümdar' } },
            Gef: { f1: { ar: 'گ', tr: 'Gef — yalın hal' }, f2: { ar: 'گل', tr: 'gül — gül' }, f3: { ar: 'آغاج', tr: 'ağaç — ağaç' }, f4: { ar: 'دوست', tr: 'dost — dost' } },
            'Nef (Sağır Nun)': { f1: { ar: 'ڭ', tr: 'Nef — yalın hal' }, f2: { ar: 'ڭوزل', tr: 'güzel — güzel' }, f3: { ar: 'آڭ', tr: 'an — an' }, f4: { ar: 'قونڭ', tr: 'könüng — hükümdar' } },
            Lam: { f1: { ar: 'ل', tr: 'Lam — yalın hal' }, f2: { ar: 'ليل', tr: 'leyl — gece' }, f3: { ar: 'علم', tr: 'ilm — ilim' }, f4: { ar: 'جمال', tr: 'cemâl — güzellik' } },
            Mim: { f1: { ar: 'م', tr: 'Mim — yalın hal' }, f2: { ar: 'مدرسه', tr: 'medrese — okul' }, f3: { ar: 'محمد', tr: 'Muhammed — Muhammed' }, f4: { ar: 'علم', tr: 'ilm — ilim' } },
            Nun: { f1: { ar: 'ن', tr: 'Nun — yalın hal' }, f2: { ar: 'نور', tr: 'nûr — nur' }, f3: { ar: 'منظر', tr: 'menzara — manzara' }, f4: { ar: 'حسن', tr: 'husn — güzellik' } },
            Vav: { f1: { ar: 'و', tr: 'Vav — yalın hal' }, f2: { ar: 'ورد', tr: 'verd — gül' }, f3: { ar: 'دنيا', tr: 'dünyâ — dünya' }, f4: { ar: 'هنو', tr: 'henüz — henüz' } },
            He: { f1: { ar: 'ه', tr: 'He — yalın hal' }, f2: { ar: 'هوا', tr: 'havâ — hava' }, f3: { ar: 'محبه', tr: 'muhabbet — sevgi' }, f4: { ar: 'پاره', tr: 'pâre — parça' } },
            Lamelif: { f1: { ar: 'لا', tr: 'Lâm-Elif — birleşik harf' }, f2: { ar: 'لاب', tr: 'lâb — kap' }, f3: { ar: 'صلاح', tr: 'salâh — iyilik' }, f4: { ar: 'مولا', tr: 'mevlâ — efendi' } },
            Ye: { f1: { ar: 'ي', tr: 'Ye — yalın hal' }, f2: { ar: 'يوم', tr: 'yevm — gün' }, f3: { ar: 'حيات', tr: 'hayât — hayat' }, f4: { ar: 'على', tr: 'alâ — üzerine' } },
            Hemze: { f1: { ar: 'ء', tr: 'Hemze — yalın hal' }, f2: { ar: 'أمة', tr: 'ümmet — ümmet' }, f3: { ar: 'مسئله', tr: 'mesele — mesele' }, f4: { ar: 'قراء', tr: 'kurâ — okuyucular' } },
        };

        let _letterDetailCurrent = null;
        let _letterFormHandlersReady = false;

        function getLetterFormExample(letterName, formKey) {
            const custom = LETTER_FORM_EXAMPLES[letterName]?.[formKey];
            if (custom) return custom;
            const letter = alphabet.find((l) => l.name === letterName);
            if (!letter) return { ar: '—', tr: 'Örnek bulunamadı' };
            const formChar = letter[formKey] || letter.f1 || letter.ar;
            return {
                ar: formChar,
                tr: `${letter.name} harfi (${LETTER_FORM_LABELS[formKey] || formKey})`,
            };
        }

        function showLetterFormExample(letter, formKey, cellEl) {
            const example = getLetterFormExample(letter.name, formKey);
            const box = document.getElementById('letter-form-example');
            const arEl = document.getElementById('letter-example-ar');
            const trEl = document.getElementById('letter-example-tr');
            const labelEl = document.getElementById('letter-example-label');
            if (!box || !arEl || !trEl) return;

            document.querySelectorAll('.lisani-letters-form-cell').forEach((c) => c.classList.remove('is-selected'));
            if (cellEl) cellEl.classList.add('is-selected');

            if (labelEl) labelEl.textContent = LETTER_FORM_LABELS[formKey] || formKey;
            arEl.textContent = example.ar;
            trEl.textContent = example.tr;
            box.classList.remove('hidden');
        }

        function initLetterFormHandlers() {
            if (_letterFormHandlersReady) return;
            _letterFormHandlersReady = true;

            document.querySelectorAll('.lisani-letters-form-cell[data-form]').forEach((cell) => {
                const activate = () => {
                    if (!_letterDetailCurrent) return;
                    playClickSound();
                    showLetterFormExample(_letterDetailCurrent, cell.dataset.form, cell);
                };
                cell.addEventListener('click', activate);
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activate();
                    }
                });
            });
        }

        // Harfleri filtreleme (YENİ EK ÖZELLİK)
        function handleLettersSearch(event) {
            const query = event.target.value.toLowerCase().trim();
            const clearBtn = document.getElementById('letters-search-clear-btn');
            
            if (query.length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
            
            initLettersGrid(query);
        }

        function clearLettersSearch() {
            const input = document.getElementById('letters-search-input');
            input.value = '';
            document.getElementById('letters-search-clear-btn').classList.add('hidden');
            initLettersGrid();
        }

        function initRememberMeCheckbox() {
            const cb = document.getElementById('login-remember-me');
            if (!cb) return;
            const pref = localStorage.getItem('lisani_remember_me_pref');
            const activeSession = localStorage.getItem('lisani_remember_me') === 'true';
            cb.checked = pref !== 'false' || activeSession;
            if (!cb.dataset.bound) {
                cb.dataset.bound = '1';
                cb.addEventListener('change', () => {
                    localStorage.setItem('lisani_remember_me_pref', cb.checked ? 'true' : 'false');
                });
            }
        }


        function initLettersGrid(filterQuery = "") {
            const grid = document.getElementById('letters-grid');
            if (!grid) return;
            grid.innerHTML = '';
            
            const filteredAlphabet = alphabet.filter(letter => {
                return letter.name.toLowerCase().includes(filterQuery) || 
                       letter.sounds.toLowerCase().includes(filterQuery);
            });

            if (filteredAlphabet.length === 0) {
                grid.innerHTML = `
                    <div class="lisani-letters-empty lisani-glass-panel rounded-2xl text-center py-8">
                        <p class="text-xs theme-text-muted font-bold">Aradığınız harf bulunamadı.</p>
                    </div>
                `;
                return;
            }
            
            filteredAlphabet.forEach((letter) => {
                const card = document.createElement('div');
                card.className = "lisani-letter-card lisani-glass-panel lisani-glass-card rounded-xl p-2.5 sm:p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1";
                card.dataset.letterName = letter.name;
                card.onclick = () => {
                    playClickSound();
                    showLetterDetail(letter);
                    showToast(`${letter.name} harfi seçildi.`, "success");
                };
                card.innerHTML = `
                    <span class="lisani-letter-card__ar arabic-text font-bold">${letter.ar}</span>
                    <span class="lisani-letter-card__name text-[11px] sm:text-[10px] font-bold theme-text-main leading-snug">${letter.name}</span>
                    <span class="lisani-letter-card__sound text-[10px] sm:text-[9px] theme-text-muted font-semibold leading-snug">${letter.sounds}</span>
                `;
                grid.appendChild(card);
            });
        }

        function showLetterDetail(letter) {
            _letterDetailCurrent = letter;
            initLetterFormHandlers();
            document.getElementById('letter-detail-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            document.getElementById('detail-title').innerText = `${letter.name} (${letter.ar})`;
            document.getElementById('detail-desc').innerText = letter.desc;
            document.getElementById('detail-arabic').innerText = letter.ar;

            document.getElementById('detail-f1').innerText = letter.f1;
            document.getElementById('detail-f2').innerText = letter.f2 || letter.f1;
            document.getElementById('detail-f3').innerText = letter.f3 || letter.f1;
            document.getElementById('detail-f4').innerText = letter.f4 || letter.f1;

            document.querySelectorAll('.lisani-letters-form-cell').forEach((c) => c.classList.remove('is-selected'));
            document.querySelectorAll('#letters-grid .lisani-letter-card').forEach((card) => {
                card.classList.toggle('is-selected', card.dataset.letterName === letter.name);
            });
            const exampleBox = document.getElementById('letter-form-example');
            if (exampleBox) exampleBox.classList.add('hidden');
        }

        // ================= DOKUNMATİK SEKMELER ARASI KAYDIRMA MOTORU (SWIPE) =================
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        function isSwipeGestureBlocked() {
            return (
                !document.getElementById('quiz-active-view').classList.contains('hidden') ||
                !document.getElementById('kariyer-modal-container').classList.contains('hidden') ||
                !document.getElementById('edit-profile-container').classList.contains('hidden') ||
                !!document.getElementById('wa-mesajlar-overlay')
            );
        }

        function getSwipeTabOrder() {
            return canTrackStudents()
                ? ['hoca-dashboard', 'home', 'letters', 'osm-translate', 'settings']
                : ['ai', 'tests', 'home', 'letters', 'osm-translate', 'settings'];
        }

        function initSwipeGestures() {
            const container = document.getElementById('screens-container');
            if (!container) return;

            container.addEventListener('touchstart', (e) => {
                if (isSwipeGestureBlocked()) return;

                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                if (isSwipeGestureBlocked()) return;

                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipeGesture(getSwipeTabOrder());
            }, { passive: true });
        }

        function handleSwipeGesture(tabOrder) {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                const swipeThreshold = 55;
                const currentIdx = tabOrder.indexOf(currentActiveScreen);

                if (deltaX < -swipeThreshold) {
                    if (currentIdx < tabOrder.length - 1) {
                        switchTab(tabOrder[currentIdx + 1]);
                    }
                } else if (deltaX > swipeThreshold) {
                    if (currentIdx > 0) {
                        switchTab(tabOrder[currentIdx - 1]);
                    }
                }
            }
        }

        function getTennisSurfaceEl() {
            if (tennisCanvas && !tennisCanvas.classList.contains('hidden')) {
                return tennisCanvas;
            }
            return document.getElementById('tennis-scene-host')
                || document.getElementById('tennis-canvas');
        }

        function buildTennisCourtCache() {
            const off = document.createElement('canvas');
            off.width = TENNIS_W;
            off.height = TENNIS_H;
            const c = off.getContext('2d');
            if (!c) return null;

            const W = TENNIS_W;
            const H = TENNIS_H;
            const margin = 12;
            const courtW = W - margin * 2;
            const courtH = H - margin * 2;

            const bg = c.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#0f766e');
            bg.addColorStop(0.35, '#14b8a6');
            bg.addColorStop(0.65, '#0d9488');
            bg.addColorStop(1, '#115e59');
            c.fillStyle = bg;
            c.fillRect(0, 0, W, H);

            for (let i = 0; i < 14; i++) {
                c.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
                c.fillRect(margin, margin + (courtH / 14) * i, courtW, courtH / 14);
            }

            c.fillStyle = '#134e4a';
            c.fillRect(margin - 3, margin - 3, courtW + 6, courtH + 6);

            c.strokeStyle = 'rgba(255,255,255,0.92)';
            c.lineWidth = 2;
            c.strokeRect(margin, margin, courtW, courtH);

            const midY = H / 2;
            c.beginPath();
            c.moveTo(margin, midY);
            c.lineTo(W - margin, midY);
            c.stroke();

            const serviceW = courtW * 0.22;
            c.beginPath();
            c.moveTo(margin + serviceW, margin);
            c.lineTo(margin + serviceW, H - margin);
            c.moveTo(W - margin - serviceW, margin);
            c.lineTo(W - margin - serviceW, H - margin);
            c.stroke();

            c.beginPath();
            c.moveTo(margin, midY - courtH * 0.18);
            c.lineTo(W - margin, midY - courtH * 0.18);
            c.moveTo(margin, midY + courtH * 0.18);
            c.lineTo(W - margin, midY + courtH * 0.18);
            c.stroke();

            c.fillStyle = 'rgba(255,255,255,0.95)';
            c.fillRect(W / 2 - 1.5, margin, 3, courtH);

            const netH = 18;
            c.fillStyle = 'rgba(255,255,255,0.55)';
            c.fillRect(margin, midY - netH / 2, courtW, 2);
            c.strokeStyle = 'rgba(255,255,255,0.25)';
            c.lineWidth = 1;
            for (let x = margin + 4; x < W - margin; x += 7) {
                c.beginPath();
                c.moveTo(x, midY - netH / 2);
                c.lineTo(x, midY + netH / 2);
                c.stroke();
            }
            c.fillStyle = '#e2e8f0';
            c.fillRect(margin - 4, midY - netH / 2 - 2, 5, netH + 4);
            c.fillRect(W - margin - 1, midY - netH / 2 - 2, 5, netH + 4);

            return off;
        }

        function spawnTennisHitParticles(x, y, color) {
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
                const speed = 1.2 + Math.random() * 2.8;
                tennisHitParticles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    color,
                });
            }
        }

        function updateTennisHitParticles(dt) {
            tennisHitParticles = tennisHitParticles.filter((p) => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= 0.04 * dt;
                return p.life > 0;
            });
        }

        function drawTennisRacket(ctx, x, y, w, h, fill, accent, isPlayer) {
            ctx.save();
            const cx = x + w / 2;
            const headY = isPlayer ? y : y;
            const headW = w;
            const headH = h + 6;

            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.beginPath();
            ctx.ellipse(cx, headY + headH + 3, headW * 0.42, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            const grad = ctx.createLinearGradient(x, y, x + w, y + h);
            grad.addColorStop(0, fill);
            grad.addColorStop(0.5, accent);
            grad.addColorStop(1, fill);
            ctx.fillStyle = grad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = accent;

            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(x + w * 0.08, headY, headW * 0.84, headH, 10);
                ctx.fill();
            } else {
                ctx.fillRect(x + w * 0.08, headY, headW * 0.84, headH);
            }
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                const lx = x + (w / 4) * i;
                ctx.beginPath();
                ctx.moveTo(lx, headY + 3);
                ctx.lineTo(lx, headY + headH - 3);
                ctx.stroke();
            }
            for (let j = 1; j < 3; j++) {
                const ly = headY + (headH / 3) * j;
                ctx.beginPath();
                ctx.moveTo(x + w * 0.12, ly);
                ctx.lineTo(x + w * 0.88, ly);
                ctx.stroke();
            }

            const handleY = isPlayer ? y + headH : y + headH;
            ctx.fillStyle = '#78716c';
            ctx.fillRect(cx - 3, handleY, 6, paddleHandleH);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(cx - 1, handleY + 1, 2, paddleHandleH - 2);
            ctx.restore();
        }

        // --- TENİS OYUNU FİZİK VE ÇİZİM MOTORU ---
        function initTennisGameEngine() {
            const sceneHost = document.getElementById('tennis-scene-host');
            tennisCanvas = document.getElementById('tennis-canvas');
            if (!tennisCanvas) return;

            if (window.LisaniTennis3D?.dispose) {
                window.LisaniTennis3D.dispose();
            }

            tennisCtx = tennisCanvas.getContext('2d');
            if (!tennisCtx) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            tennisCanvas.width = TENNIS_W * dpr;
            tennisCanvas.height = TENNIS_H * dpr;
            tennisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            tennisCanvas.classList.remove('hidden');
            if (sceneHost) {
                sceneHost.classList.add('hidden');
                sceneHost.innerHTML = '';
            }

            tennisCourtCache = buildTennisCourtCache();
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            tennisMatchOver = false;
            tennisPaused = false;
            tennisRallyHits = 0;
            tennisBallSpin = 0;
            tennisBallRotation = 0;
            tennisHitParticles = [];
            tennisBotTargetX = null;
            tennisBotReaction = 0;
            ballTrail = [];
            hideTennisOverlay();

            playerPaddleX = (TENNIS_W - paddleWidth) / 2;
            computerPaddleX = (TENNIS_W - paddleWidth) / 2;
            updateTennisScoreboard();
            updateTennisPauseBtn();

            isTennisRunning = true;
            tennisLastTime = performance.now();
            setupTennisControls();
            startTennisServeCountdown();

            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            tennisLoop(tennisLastTime);
        }

        function setupTennisControls() {
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
            window.addEventListener('keydown', handleTennisKeyDown);
            window.addEventListener('keyup', handleTennisKeyUp);

            const btnLeft = document.getElementById('btn-paddle-left');
            const btnRight = document.getElementById('btn-paddle-right');

            if (btnLeft && btnRight) {
                btnLeft.onmousedown = () => { keyLeftPressed = true; };
                btnLeft.onmouseup = () => { keyLeftPressed = false; };
                btnLeft.onmouseleave = () => { keyLeftPressed = false; };
                btnLeft.ontouchstart = (e) => { e.preventDefault(); keyLeftPressed = true; };
                btnLeft.ontouchend = (e) => { e.preventDefault(); keyLeftPressed = false; };
                btnLeft.ontouchcancel = () => { keyLeftPressed = false; };

                btnRight.onmousedown = () => { keyRightPressed = true; };
                btnRight.onmouseup = () => { keyRightPressed = false; };
                btnRight.onmouseleave = () => { keyRightPressed = false; };
                btnRight.ontouchstart = (e) => { e.preventDefault(); keyRightPressed = true; };
                btnRight.ontouchend = (e) => { e.preventDefault(); keyRightPressed = false; };
                btnRight.ontouchcancel = () => { keyRightPressed = false; };
            }

            const movePaddleFromClientX = (clientX) => {
                if (!isTennisRunning || tennisMatchOver) return;
                const surface = getTennisSurfaceEl();
                if (!surface) return;
                const rect = surface.getBoundingClientRect();
                const x = ((clientX - rect.left) / rect.width) * TENNIS_W;
                playerPaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, x - paddleWidth / 2));
            };

            const surface = getTennisSurfaceEl();
            if (!surface) return;

            surface.onmousedown = (e) => {
                tennisPointerActive = true;
                movePaddleFromClientX(e.clientX);
            };
            surface.onmouseup = () => { tennisPointerActive = false; };
            surface.onmouseleave = () => { tennisPointerActive = false; };
            surface.onmousemove = (e) => {
                if (tennisPointerActive) movePaddleFromClientX(e.clientX);
            };

            surface.ontouchstart = (e) => {
                e.preventDefault();
                tennisPointerActive = true;
                if (e.touches[0]) movePaddleFromClientX(e.touches[0].clientX);
            };
            surface.ontouchmove = (e) => {
                e.preventDefault();
                if (e.touches[0]) movePaddleFromClientX(e.touches[0].clientX);
            };
            surface.ontouchend = () => { tennisPointerActive = false; };
        }

        function handleTennisKeyDown(e) {
            if (e.key === 'ArrowLeft') keyLeftPressed = true;
            else if (e.key === 'ArrowRight') keyRightPressed = true;
            else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                toggleTennisPause();
            }
        }

        function handleTennisKeyUp(e) {
            if (e.key === 'ArrowLeft') keyLeftPressed = false;
            else if (e.key === 'ArrowRight') keyRightPressed = false;
        }

        function toggleTennisPause() {
            if (!isTennisRunning || tennisMatchOver || tennisCountdown > 0) return;
            tennisPaused = !tennisPaused;
            updateTennisPauseBtn();
            if (!tennisPaused) {
                tennisLastTime = performance.now();
                tennisLoop(tennisLastTime);
            }
        }

        function updateTennisPauseBtn() {
            const btn = document.getElementById('btn-tennis-pause');
            if (btn) btn.textContent = tennisPaused ? 'Devam' : 'Duraklat';
        }

        function startTennisServeCountdown() {
            tennisServeReady = false;
            ballSpeedX = 0;
            ballSpeedY = 0;
            tennisBallSpin = 0;
            ballX = TENNIS_W / 2;
            ballY = TENNIS_H * 0.68;
            tennisCountdown = 3;
            tennisBotTargetX = null;
            tennisBotReaction = 0;
        }

        function launchServe() {
            tennisServeReady = true;
            tennisRallyHits = 0;
            ballTrail = [];
            const aim = ((playerPaddleX + paddleWidth / 2) / TENNIS_W - 0.5) * 2.2;
            const base = 2.6 + Math.min(tennisPlayerScore + tennisComputerScore, 6) * 0.1;
            ballSpeedX = aim + (Math.random() - 0.5) * 0.6;
            ballSpeedY = -base;
            tennisBallSpin = aim * 0.35;
        }

        function tennisLoop(now) {
            if (!isTennisRunning) return;
            const dt = Math.min((now - tennisLastTime) / 16.67, 2.5);
            tennisLastTime = now;

            if (!tennisPaused && !tennisMatchOver) {
                if (tennisCountdown > 0) {
                    tennisCountdown -= dt * 0.035;
                    if (tennisCountdown <= 0) {
                        tennisCountdown = 0;
                        launchServe();
                    }
                } else if (tennisServeReady) {
                    if (!tennisOnlineMode || tennisOnlineRole === 'host') {
                        updateTennisGamePhysics(dt);
                    }
                }
            }

            drawTennisGameScene();
            tennisLoopId = requestAnimationFrame(tennisLoop);
        }

        function getTennisBotSpeed() {
            return 2.4 + Math.min(tennisComputerScore, 5) * 0.18;
        }

        function predictBotTargetX() {
            if (ballSpeedY >= -0.05) return ballX;
            const dist = Math.abs(ballY - (paddleHeight + 6));
            const t = dist / Math.max(Math.abs(ballSpeedY), 0.5);
            let px = ballX + ballSpeedX * t + tennisBallSpin * t * 0.35;
            const err = (Math.random() - 0.5) * (28 - Math.min(tennisRallyHits, 8) * 2);
            return px + err;
        }

        function applyPaddleHit(isPlayer) {
            const paddleX = isPlayer ? playerPaddleX : computerPaddleX;
            const hit = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            const sweet = 1 - Math.min(Math.abs(hit), 1) * 0.35;
            const speedMul = 1.04 + sweet * 0.06;
            const spin = hit * (isPlayer ? 0.9 : 0.75);
            tennisBallSpin = spin;
            ballSpeedX = hit * (isPlayer ? 3.8 : 3.4) + tennisBallSpin * 0.25;
            ballSpeedY = isPlayer
                ? -Math.abs(ballSpeedY) * speedMul
                : Math.abs(ballSpeedY) * speedMul;
            tennisRallyHits++;
            increaseBallSpeed();
            spawnTennisHitParticles(ballX, ballY, isPlayer ? '#22d3ee' : '#f87171');
            playTennisBeep(isPlayer ? 220 + sweet * 80 : 260, 0.08);
        }

        function updateTennisGamePhysics(dt) {
            const paddleSpeed = 5.8 * dt;
            if (keyLeftPressed) {
                playerPaddleX = Math.max(0, playerPaddleX - paddleSpeed);
            }
            if (keyRightPressed) {
                playerPaddleX = Math.min(TENNIS_W - paddleWidth, playerPaddleX + paddleSpeed);
            }

            if (tennisOnlineMode) {
                computerPaddleX = tennisRemotePaddleX;
            } else if (ballSpeedY < 0) {
                tennisBotReaction -= dt;
                if (tennisBotReaction <= 0) {
                    tennisBotTargetX = predictBotTargetX();
                    tennisBotReaction = 4 + Math.random() * 6;
                }
                const botSpeed = getTennisBotSpeed() * dt;
                const target = (tennisBotTargetX ?? ballX) - paddleWidth / 2;
                const diff = target - computerPaddleX;
                if (Math.abs(diff) > 6) {
                    computerPaddleX += Math.sign(diff) * Math.min(Math.abs(diff), botSpeed);
                }
            }
            computerPaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, computerPaddleX));

            updateTennisHitParticles(dt);

            ballTrail.push({ x: ballX, y: ballY });
            if (ballTrail.length > 12) ballTrail.shift();

            ballSpeedX += tennisBallSpin * 0.018 * dt;
            ballX += ballSpeedX * dt;
            ballY += ballSpeedY * dt;
            tennisBallRotation += (ballSpeedX * 0.08 + Math.abs(ballSpeedY) * 0.04) * dt;

            if (ballX - ballRadius < 12) {
                ballX = 12 + ballRadius;
                ballSpeedX = Math.abs(ballSpeedX);
                tennisBallSpin *= -0.6;
                playTennisBeep(150, 0.05);
            }
            if (ballX + ballRadius > TENNIS_W - 12) {
                ballX = TENNIS_W - 12 - ballRadius;
                ballSpeedX = -Math.abs(ballSpeedX);
                tennisBallSpin *= -0.6;
                playTennisBeep(150, 0.05);
            }

            const botY = paddleHeight + 8;
            const botHitZone = botY + paddleHeight + 4;
            if (ballSpeedY < 0 && ballY - ballRadius <= botHitZone) {
                if (ballX >= computerPaddleX + 4 && ballX <= computerPaddleX + paddleWidth - 4) {
                    ballY = botHitZone + ballRadius;
                    applyPaddleHit(false);
                } else if (ballY < 8) {
                    awardTennisPoint('player');
                }
            }

            const playerY = TENNIS_H - paddleHeight - paddleHandleH - 8;
            const playerHitZone = playerY;
            if (ballSpeedY > 0 && ballY + ballRadius >= playerHitZone) {
                if (ballX >= playerPaddleX + 4 && ballX <= playerPaddleX + paddleWidth - 4) {
                    ballY = playerHitZone - ballRadius;
                    applyPaddleHit(true);
                } else if (ballY > TENNIS_H - 4) {
                    awardTennisPoint('bot');
                }
            }
        }

        function awardTennisPoint(who) {
            if (tennisMatchOver) return;
            tennisServeReady = false;
            if (who === 'player') {
                tennisPlayerScore++;
                playTennisBeep(440, 0.18);
                showToast(tennisOnlineMode ? 'Sayı kazandınız! 🎾' : 'Sayı kazandınız! 🎾', 'success');
            } else {
                tennisComputerScore++;
                playTennisBeep(110, 0.22);
                const msg = tennisOnlineMode
                    ? (tennisOpponentName ? `${tennisOpponentName} sayı kazandı.` : 'Rakip sayı kazandı.')
                    : 'Bot sayı kazandı.';
                showToast(msg, 'error');
            }
            updateTennisScoreboard();
            if (tennisPlayerScore >= TENNIS_WIN || tennisComputerScore >= TENNIS_WIN) {
                endTennisMatch();
                return;
            }
            startTennisServeCountdown();
        }

        function endTennisMatch() {
            tennisMatchOver = true;
            tennisServeReady = false;
            const won = tennisPlayerScore >= TENNIS_WIN;
            const opp = tennisOpponentName || 'Rakip';
            showTennisOverlay(
                won ? 'Kazandınız! 🏆' : 'Kaybettiniz',
                tennisOnlineMode
                    ? (won
                        ? `${tennisPlayerScore} - ${tennisComputerScore} · ${opp} yenildi!`
                        : `${tennisPlayerScore} - ${tennisComputerScore} · ${opp} kazandı.`)
                    : (won
                        ? `${tennisPlayerScore} - ${tennisComputerScore} · Harika oyun!`
                        : `${tennisPlayerScore} - ${tennisComputerScore} · Bir daha dene.`)
            );
            playTennisBeep(won ? 520 : 90, won ? 0.35 : 0.4);
            if (won) showToast('Tenis maçını kazandınız! 🏆', 'success');
        }

        function showTennisOverlay(title, sub) {
            const el = document.getElementById('tennis-overlay');
            const t = document.getElementById('tennis-overlay-title');
            const s = document.getElementById('tennis-overlay-sub');
            if (t) t.textContent = title;
            if (s) s.textContent = sub;
            if (el) el.classList.remove('hidden');
        }

        function hideTennisOverlay() {
            const el = document.getElementById('tennis-overlay');
            if (el) el.classList.add('hidden');
        }

        function increaseBallSpeed() {
            const cap = 7;
            const boost = 1 + tennisRallyHits * 0.018;
            if (Math.abs(ballSpeedY) < cap) {
                ballSpeedY = ballSpeedY > 0
                    ? Math.min(cap, Math.abs(ballSpeedY) * 1.055 * boost)
                    : -Math.min(cap, Math.abs(ballSpeedY) * 1.055 * boost);
            }
        }

        function updateTennisScoreboard() {
            const scoreboard = document.getElementById('tennis-score');
            if (scoreboard) {
                if (tennisOnlineMode && tennisOpponentName) {
                    scoreboard.textContent = `${tennisPlayerScore} - ${tennisComputerScore}`;
                } else {
                    scoreboard.textContent = `${tennisPlayerScore} - ${tennisComputerScore}`;
                }
            }
            const info = document.getElementById('tennis-match-info');
            if (info) {
                if (tennisOnlineMode) {
                    info.textContent = tennisOpponentName ? `Online · ${tennisOpponentName}` : 'Online maç';
                } else {
                    info.textContent = 'İlk 7 sayı';
                }
            }
        }

        function resetTennisGame() {
            playClickSound();
            hideTennisOverlay();
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            tennisMatchOver = false;
            tennisPaused = false;
            tennisRallyHits = 0;
            tennisBallSpin = 0;
            tennisBallRotation = 0;
            tennisHitParticles = [];
            tennisBotTargetX = null;
            tennisBotReaction = 0;
            ballTrail = [];
            updateTennisScoreboard();
            updateTennisPauseBtn();
            playerPaddleX = (TENNIS_W - paddleWidth) / 2;
            computerPaddleX = (TENNIS_W - paddleWidth) / 2;
            startTennisServeCountdown();
            showToast('Yeni maç başladı.', 'success');
        }

        function stopTennisGame() {
            isTennisRunning = false;
            tennisPointerActive = false;
            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
            if (window.LisaniTennis3D?.dispose) {
                window.LisaniTennis3D.dispose();
            }
            tennisCtx = null;
            if (tennisOnlineMode && typeof window.LisaniTennisOnline?.stop === 'function') {
                window.LisaniTennisOnline.stop(false);
            }
        }

        function drawTennisBall(ctx, x, y) {
            const speed = Math.hypot(ballSpeedX, ballSpeedY);
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(x, y + ballRadius + 5, ballRadius * 0.9, ballRadius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            if (speed > 4) {
                ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.35, (speed - 4) * 0.08)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - ballSpeedX * 2.5, y - ballSpeedY * 2.5);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.translate(x, y);
            ctx.rotate(tennisBallRotation);
            const ballGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, ballRadius);
            ballGrad.addColorStop(0, '#fef9c3');
            ballGrad.addColorStop(0.55, '#facc15');
            ballGrad.addColorStop(1, '#ca8a04');
            ctx.fillStyle = ballGrad;
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(250, 204, 21, 0.55)';
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius - 1, -0.6, 0.9);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, ballRadius - 1, 2.1, 3.6);
            ctx.stroke();
            ctx.restore();
        }

        function drawTennisGameScene() {
            const flipOnlineGuest = tennisOnlineMode && tennisOnlineRole === 'guest';

            const ctx = tennisCtx;
            const W = TENNIS_W;
            const H = TENNIS_H;
            if (!ctx) return;

            ctx.clearRect(0, 0, W, H);

            if (flipOnlineGuest) {
                ctx.save();
                ctx.translate(0, H);
                ctx.scale(1, -1);
            }

            if (tennisCourtCache) {
                ctx.drawImage(tennisCourtCache, 0, 0, W, H);
            } else {
                ctx.fillStyle = '#0d9488';
                ctx.fillRect(0, 0, W, H);
            }

            ballTrail.forEach((p, i) => {
                const a = (i + 1) / ballTrail.length * 0.4;
                ctx.fillStyle = `rgba(250, 204, 21, ${a})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, ballRadius * (0.35 + i * 0.03), 0, Math.PI * 2);
                ctx.fill();
            });

            tennisHitParticles.forEach((p) => {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2 + p.life * 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            const botRacketY = 6;
            const playerRacketY = H - paddleHeight - paddleHandleH - 6;
            drawTennisRacket(ctx, computerPaddleX, botRacketY, paddleWidth, paddleHeight, '#dc2626', '#f87171', false);
            drawTennisRacket(ctx, playerPaddleX, playerRacketY, paddleWidth, paddleHeight, '#0891b2', '#22d3ee', true);

            drawTennisBall(ctx, ballX, ballY);

            if (tennisRallyHits > 0 && tennisServeReady && !tennisMatchOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(`Rally: ${tennisRallyHits}`, 16, 22);
            }

            if (tennisCountdown > 0) {
                const n = Math.ceil(tennisCountdown);
                const pulse = 1 + (tennisCountdown - Math.floor(tennisCountdown)) * 0.15;
                ctx.fillStyle = 'rgba(0,0,0,0.42)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${Math.round(46 * pulse)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(n), W / 2, H / 2);
                ctx.font = '11px sans-serif';
                ctx.fillStyle = 'rgba(224,242,254,0.85)';
                ctx.fillText('Raketi hareket ettirerek servis yönünü seç', W / 2, H / 2 + 38);
            }

            if (tennisPaused && !tennisMatchOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#e0f2fe';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('DURAKLATILDI', W / 2, H / 2);
            }

            if (flipOnlineGuest) {
                ctx.restore();
            }
        }

        window.LisaniTennis = {
            setOnlineMode(enabled, role, roomCode, opponentName) {
                tennisOnlineMode = !!enabled;
                tennisOnlineRole = role || null;
                tennisOnlineRoomCode = roomCode || '';
                tennisOpponentName = opponentName || '';
                tennisRemotePaddleX = (TENNIS_W - paddleWidth) / 2;
                updateTennisScoreboard();
            },
            isOnline() { return tennisOnlineMode; },
            getRole() { return tennisOnlineRole; },
            getRoomCode() { return tennisOnlineRoomCode; },
            setRemotePaddleX(x) {
                tennisRemotePaddleX = Math.max(0, Math.min(TENNIS_W - paddleWidth, x));
            },
            getLocalPaddleX() {
                return playerPaddleX;
            },
            exportState() {
                return {
                    ballX, ballY, ballSpeedX, ballSpeedY,
                    ballSpin: tennisBallSpin,
                    ballTrail: ballTrail.slice(-12),
                    serveReady: tennisServeReady,
                    countdown: tennisCountdown,
                    rallyHits: tennisRallyHits,
                    hostScore: tennisPlayerScore,
                    guestScore: tennisComputerScore,
                    matchOver: tennisMatchOver,
                    hostPaddleX: playerPaddleX,
                    guestPaddleX: computerPaddleX,
                };
            },
            importState(state) {
                if (!state) return;
                ballX = state.ballX ?? ballX;
                ballY = state.ballY ?? ballY;
                ballSpeedX = state.ballSpeedX ?? ballSpeedX;
                ballSpeedY = state.ballSpeedY ?? ballSpeedY;
                tennisBallSpin = state.ballSpin ?? tennisBallSpin;
                ballTrail = Array.isArray(state.ballTrail) ? state.ballTrail : [];
                tennisServeReady = !!state.serveReady;
                tennisCountdown = state.countdown ?? 0;
                tennisRallyHits = state.rallyHits ?? 0;
                tennisPlayerScore = state.hostScore ?? 0;
                tennisComputerScore = state.guestScore ?? 0;
                tennisMatchOver = !!state.matchOver;
                if (tennisOnlineRole === 'host') {
                    computerPaddleX = state.guestPaddleX ?? computerPaddleX;
                } else if (tennisOnlineRole === 'guest') {
                    playerPaddleX = state.guestPaddleX ?? playerPaddleX;
                    computerPaddleX = state.hostPaddleX ?? computerPaddleX;
                }
                updateTennisScoreboard();
                if (state.matchOver && !tennisMatchOver) {
                    endTennisMatch();
                }
            },
            startEngine: initTennisGameEngine,
            reset: resetTennisGame,
            stop: stopTennisGame,
        };

        // Service Worker inline olarak gömülü (ayrı sw.js dosyası gerekmez)
        async function registerInlineSW() {
            if (!("serviceWorker" in navigator)) return;
            const swCode = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
        for (const c of list) { if ('focus' in c) return c.focus(); }
        if (clients.openWindow) return clients.openWindow('./');
    }));
});
`;
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            try {
                await navigator.serviceWorker.register(swUrl, { scope: './' });
            } catch(e) {
                // Blob URL scope kısıtlaması olabilir, sessizce geç
            }
        }

        // =====================================================
        // BİLDİRİM SİSTEMİ
        // =====================================================

        const dailyNotifications = [
            { title: "Lisanı Ecdad", body: "Bugün Osmanlıca çalışmayı unutma! 📖" },
            { title: "Lisanı Ecdad", body: "Günlük sınavın seni bekliyor. 🎯" },
            { title: "Lisanı Ecdad", body: "Birkaç harf tekrarı yapmaya ne dersin? ✏️" },
            { title: "Lisanı Ecdad", body: "Dünün öğrendiklerini hatırlıyor musun? 🤔" },
            { title: "Lisanı Ecdad", body: "Bugün yeni bir harf öğren! 🌟" },
        ];

        function getRandomNotification() {
            return dailyNotifications[Math.floor(Math.random() * dailyNotifications.length)];
        }

        function getHadisForDate(date) {
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
            return hadisList[dayOfYear % hadisList.length];
        }

        function getTodaysHadis() {
            return getHadisForDate(new Date());
        }

        function formatNotifTimeLabel(h, m) {
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        }

        function usesNativeHadisNotifications() {
            return typeof window.isNativeHadisNotifications === 'function' && window.isNativeHadisNotifications();
        }

        window._scheduleHadithNotifications = async function () {
            if (usesNativeHadisNotifications()) {
                if (!(await window.checkNativeHadisPermission())) return false;
                return window.scheduleNativeHadithNotifications(getHadisForDate, getDefaultNotifTime);
            }
            scheduleDailyNotification();
            return true;
        };

        async function initNotifications() {
            if (usesNativeHadisNotifications()) {
                autoSetNotifTime();
                const granted = await window.requestNativeHadisPermission();
                if (granted) {
                    await window._scheduleHadithNotifications();
                    const { h, m } = getDefaultNotifTime();
                    showToast(
                        'Bildirimler açıldı! Her gün saat ' + formatNotifTimeLabel(h, m) + "'da günün hadisi gelecek.",
                        'success'
                    );
                } else {
                    showToast('Bildirim izni verilmedi.', 'error');
                }
                return;
            }
            if (!('Notification' in window)) {
                showToast('Bu tarayıcı bildirimleri desteklemiyor.', 'error');
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                if ('serviceWorker' in navigator) {
                    try {
                        await registerInlineSW();
                    } catch (e) {}
                }
                autoSetNotifTime();
                scheduleDailyNotification();
                const { h, m } = getDefaultNotifTime();
                showToast(
                    'Bildirimler açıldı! Her gün saat ' + formatNotifTimeLabel(h, m) + "'da günün hadisi gelecek.",
                    'success'
                );
            } else {
                showToast('Bildirim izni verilmedi.', 'error');
            }
        }

        function autoSetNotifTime() {
            // Cihazın yerel saati (new Date() her zaman cihaz saat dilimini kullanır)
            const now = new Date();
            const currentH = now.getHours();

            // Sabah mı akşam mı? Gündüz aktifliğine göre en uygun saati seç:
            // 05:00–11:59 → sabah rutininde → 09:00
            // 12:00–17:59 → öğleden sonra → 14:00
            // 18:00–23:59 veya 00:00–04:59 → akşam/gece → 20:00
            let bestH;
            if (currentH >= 5 && currentH < 12) bestH = 9;
            else if (currentH >= 12 && currentH < 18) bestH = 14;
            else bestH = 20;

            localStorage.setItem("lisani_notif_hour", String(bestH));
            localStorage.setItem("lisani_notif_min", "0");

            // Panel input'unu da güncelle
            const inp = document.getElementById("notif-time-input");
            if (inp) inp.value = String(bestH).padStart(2,"0") + ":00";
        }

        async function scheduleDailyNotification() {
            if (usesNativeHadisNotifications()) {
                if (await window.checkNativeHadisPermission()) {
                    await window.scheduleNativeHadithNotifications(getHadisForDate, getDefaultNotifTime);
                }
                return;
            }
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
            const { h: savedHour, m: savedMin } = getDefaultNotifTime();
            const now = new Date();
            const target = new Date();
            target.setHours(savedHour, savedMin, 0, 0);
            if (target <= now) target.setDate(target.getDate() + 1);
            const delay = target - now;
            const oldTimer = localStorage.getItem("lisani_notif_timer_id");
            if (oldTimer) clearTimeout(parseInt(oldTimer));
            const timerId = setTimeout(() => {
                const hadis = getTodaysHadis();
                const content =
                    typeof window.getHadisNotificationContent === 'function'
                        ? window.getHadisNotificationContent(hadis)
                        : { title: 'Günün Hadisi 📖', body: hadis.turkce + '\n— ' + hadis.kaynak };
                new Notification(content.title, {
                    body: content.body,
                    icon: "icon-192.png",
                    badge: "icon-192.png",
                    vibrate: [200, 100, 200],
                    tag: "lisani-daily",
                    renotify: true
                });
                scheduleDailyNotification();
            }, delay);
            try { localStorage.setItem("lisani_notif_timer_id", String(timerId)); } catch(e) {}
        }

        function getDefaultNotifTime() {
            const savedH = localStorage.getItem("lisani_notif_hour");
            const savedM = localStorage.getItem("lisani_notif_min");
            if (savedH !== null) return { h: parseInt(savedH), m: parseInt(savedM) };
            // Henüz ayarlanmamışsa cihaz saatine göre otomatik hesapla
            const now = new Date();
            const currentH = now.getHours();
            if (currentH >= 5 && currentH < 12) return { h: 9, m: 0 };
            if (currentH >= 12 && currentH < 18) return { h: 14, m: 0 };
            return { h: 20, m: 0 };
        }

        function openNotifSettings() {
            playClickSound();
            document.getElementById("notif-settings-panel").classList.remove("hidden");
            const { h, m } = getDefaultNotifTime();
            document.getElementById("notif-time-input").value =
                String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
        }

        function closeNotifSettings() {
            playClickSound();
            document.getElementById("notif-settings-panel").classList.add("hidden");
        }

        function saveNotifTime() {
            playClickSound();
            const val = document.getElementById('notif-time-input').value;
            if (!val) return;
            const [h, m] = val.split(':').map(Number);
            localStorage.setItem('lisani_notif_hour', String(h));
            localStorage.setItem('lisani_notif_min', String(m));
            scheduleDailyNotification();
            closeNotifSettings();
            showToast('Bildirim saati ' + formatNotifTimeLabel(h, m) + ' olarak ayarlandı.', 'success');
        }

        async function testNotification() {
            playClickSound();
            if (usesNativeHadisNotifications()) {
                if (!(await window.checkNativeHadisPermission())) {
                    showToast('Önce bildirim iznini ver.', 'error');
                    return;
                }
                const ok = await window.showNativeHadisTestNotification(getHadisForDate);
                showToast(
                    ok ? 'Test bildirimi 4 saniye içinde gelecek.' : 'Test bildirimi gönderilemedi.',
                    ok ? 'success' : 'error'
                );
                return;
            }
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
                showToast('Önce bildirim iznini ver.', 'error');
                return;
            }
            const hadis = getTodaysHadis();
            const content =
                typeof window.getHadisNotificationContent === 'function'
                    ? window.getHadisNotificationContent(hadis)
                    : { title: 'Günün Hadisi 📖', body: hadis.turkce + '\n— ' + hadis.kaynak };
            new Notification(content.title, {
                body: content.body,
                icon: 'icon-192.png',
                tag: 'lisani-test',
            });
            showToast('Test bildirimi gönderildi.', 'success');
        }

        // --- BAŞLANGIÇ KURULUMLARI ---
        window.onload = function() {
            try {
                const savedTests = localStorage.getItem('lisani_test_history');
                if (savedTests) testHistory = JSON.parse(savedTests);
            } catch (e) {}

            lucide.createIcons();
            initAvatarGrids();
            initLettersGrid();
            renderQuizHistoryList();
            renderProgressChart();
            initPrelineTheme();
            updateLearningStats();
            initSwipeGestures();
            initToastSwipe();
            initRememberMeCheckbox();

            try {
                const savedSession = localStorage.getItem('lisani_session_user');
                if (savedSession) {
                    const u = JSON.parse(savedSession);
                    syncTennisUnlockFromUser(u);
                } else {
                    applyTennisUnlockUI(false);
                }
            } catch (e) {
                applyTennisUnlockUI(false);
            }

            const firstHadis = hadisList[0];
            if (firstHadis) {
                const elOsm = document.getElementById('home-hadis-osmanli');
                const elTr = document.getElementById('home-hadis-turkce');
                const elKy = document.getElementById('home-hadis-kaynak');
                if (elOsm) elOsm.innerText = firstHadis.osmanli;
                if (elTr) elTr.innerText = `"${firstHadis.turkce}"`;
                if (elKy) elKy.innerText = firstHadis.kaynak;
            }

            // Kayıtlı kullanıcıları yükle (yerel)
            try {
                const savedUsers = localStorage.getItem('lisani_registered_users');
                if (savedUsers) Object.assign(registeredUsers, JSON.parse(savedUsers));
            } catch(e) {}

            // App hazır eventi gönder (Firebase onAuthStateChanged için)
            document.dispatchEvent(new Event('appReady'));
            window._appReady = true;

            // Bildirim
            try {
                if (usesNativeHadisNotifications()) {
                    window.checkNativeHadisPermission().then((granted) => {
                        if (granted) window._scheduleHadithNotifications();
                    });
                } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    if ('serviceWorker' in navigator) registerInlineSW().catch(() => {});
                    scheduleDailyNotification();
                }
            } catch (e) {}
        };
