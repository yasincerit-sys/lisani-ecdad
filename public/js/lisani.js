        // --- GEÇMİŞ TEST SONUÇLARI VERİ TABANI ---
        let testHistory = [];

        // --- TOPLAM PUAN DEĞİŞKENİ (GÜVENLİ TAKİP) ---
        let totalScore = 0;

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

        // --- GİZLİ TENİS OYUNU DURUM DEĞİŞKENLERİ ---
        let tennisCanvas = null;
        let tennisCtx = null;
        let tennisLoopId = null;
        let isTennisRunning = false;
        
        let ballX = 150;
        let ballY = 100;
        let ballSpeedX = 2;
        let ballSpeedY = -2;
        let ballRadius = 5;

        let playerPaddleX = 110;
        let computerPaddleX = 110;
        const paddleWidth = 80;
        const paddleHeight = 8;
        
        let tennisPlayerScore = 0;
        let tennisComputerScore = 0;
        
        // Klavye dinleyicileri için tuş takibi
        let keyLeftPressed = false;
        let keyRightPressed = false;

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
            
            // Önceki sürükleme/kapatma stillerini sıfırla
            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }
            toastDragState = null;
            toastBox.style.transition = '';
            toastBox.style.transform = '';
            toastBox.style.opacity = '';
            
            const baseCommon = "lisani-toast z-[100] transform translate-x-[-50%] translate-y-0 opacity-100 transition-all duration-300 pointer-events-auto cursor-grab select-none touch-none text-xs font-bold px-5 py-3.5 rounded-2xl flex items-center space-x-2 backdrop-blur-md left-1/2";
            
            if (type === 'success') {
                toastBox.className = baseCommon + " bg-emerald-950/80 border-2 border-emerald-400 text-green-100 shadow-[0_10px_35px_rgba(16,185,129,0.35)]";
                toastIcon.setAttribute('data-lucide', 'leaf');
            } else if (type === 'error') {
                toastBox.className = baseCommon + " bg-rose-950/80 border-2 border-rose-500 text-rose-100 shadow-[0_10px_35px_rgba(244,63,94,0.35)]";
                toastIcon.setAttribute('data-lucide', 'alert-triangle');
            } else {
                toastBox.className = baseCommon + " bg-stone-900/80 border border-stone-750 text-stone-200 shadow-xl";
                toastIcon.setAttribute('data-lucide', 'info');
            }
            
            lucide.createIcons();

            toastDismissTimer = setTimeout(() => { dismissToast(null); }, 3500);
        }

        // --- ✋ TOAST'I PROGRAMATİK OLARAK KAPAT ---
        function dismissToast(direction) {
            const toastBox = document.getElementById('toast-box');
            if (!toastBox) return;
            if (toastDismissTimer) { clearTimeout(toastDismissTimer); toastDismissTimer = null; }
            
            let offX = 0, offY = -80;
            if (direction === 'left') offX = -Math.max(window.innerWidth, 400);
            else if (direction === 'right') offX = Math.max(window.innerWidth, 400);
            
            toastBox.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
            toastBox.style.transform = `translate(${offX}px, ${offY}px)`;
            toastBox.style.opacity = '0';
            
            setTimeout(() => {
                toastBox.className = "lisani-toast left-1/2 z-[100] transform -translate-x-1/2 -translate-y-20 opacity-0 transition-all duration-300 pointer-events-none text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center space-x-2 backdrop-blur-md";
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
                if (toastBox.classList.contains('pointer-events-none')) return;
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
        let selectedAvatarType = 'cat';
        let selectedAvatarValue = '🐱';
        let editAvatarValue = '🐱';

        let registeredUsers = {
            'ahmet': {
                name: 'Ahmet',
                birthdate: '2012-05-20',
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
            if (role === 'hoca') {
                document.getElementById('role-btn-hoca').className = 'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-primary-bg text-white border border-[var(--theme-primary)]';
                document.getElementById('role-btn-ogrenci').className = 'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-card-bg theme-text-muted border theme-border';
                if (hocaDiv) hocaDiv.classList.remove('hidden');
                if (ogrenciDiv) ogrenciDiv.classList.add('hidden');
            } else {
                document.getElementById('role-btn-ogrenci').className = 'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-primary-bg text-white border border-[var(--theme-primary)]';
                document.getElementById('role-btn-hoca').className = 'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-card-bg theme-text-muted border theme-border';
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

            if (tab === 'login') {
                loginTab.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-primary-bg text-white shadow-md";
                registerTab.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-text-muted hover:text-white";
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                registerTab.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-primary-bg text-white shadow-md";
                loginTab.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all theme-text-muted hover:text-white";
                registerForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
        }

        function selectAvatar(type, emoji) {
            playClickSound();
            selectedAvatarType = type;
            selectedAvatarValue = emoji;

            document.querySelectorAll('.avatar-option').forEach(btn => {
                btn.classList.remove('selected');
            });

            event.currentTarget.classList.add('selected');

            // Büyük önizlemeyi güncelle
            const preview = document.getElementById('avatar-preview-big');
            const label = document.getElementById('avatar-preview-label');
            if (preview) preview.innerHTML = emoji;
            if (label) {
                const names = {cat:'Kedi', alp:'Alp', flower:'Lale', scholar:'Talebe', falcon:'Kartal', scribe:'Hattat', sword:'Savaşçı'};
                label.textContent = names[type] || type;
            }
        }

        function selectEditAvatar(type, emoji) {
            playClickSound();
            editAvatarValue = emoji;
            
            document.querySelectorAll('.edit-avatar-option').forEach(btn => {
                btn.classList.remove('selected');
            });
            if (event) {
                event.currentTarget.classList.add('selected');
            }

            const preview = document.getElementById('edit-avatar-preview');
            preview.innerHTML = emoji;
        }

        function triggerAvatarUpload() {
            playClickSound();
            document.getElementById('avatar-upload-input').click();
        }

        // --- ÖĞRENİM İSTATİSTİKLERİNİ DİNAMİK HESAPLAMA VE GÜNCELLEME ---
        function updateLearningStats() {
            const solvedCountEl = document.getElementById('stats-solved-count');
            const avgSuccessEl = document.getElementById('stats-avg-success');
            const totalXpEl = document.getElementById('stats-total-xp');

            if (!solvedCountEl || !avgSuccessEl || !totalXpEl) return;

            const solvedCount = testHistory.length;
            solvedCountEl.innerText = solvedCount;

            let totalSuccess = 0;
            testHistory.forEach(record => {
                totalSuccess += record.percent;
            });
            
            const avgSuccess = solvedCount > 0 ? Math.round(totalSuccess / solvedCount) : 0;
            avgSuccessEl.innerText = `%${avgSuccess}`;
            totalXpEl.innerText = totalScore;
        }

        function triggerEditAvatarUpload() {
            playClickSound();
            document.getElementById('edit-avatar-upload-input').click();
        }

        // --- İNTERAKTİF SINAV ÇALIŞTIRMA MOTORU ---
        function startLevel(level) {
            playClickSound();
            activeLevel = level;
            
            const levelTitles = {
                1: "Seviye 1: Harfler & Sayılar",
                2: "Seviye 2: Yazım Kuralları & Okuma",
                3: "Seviye 3: Kelime Kökü & Kaynak Dil"
            };

            document.getElementById('selected-level-title').innerText = levelTitles[level] || `Seviye ${level}`;
            const testsContainer = document.getElementById('tests-buttons-container');
            testsContainer.innerHTML = '';

            // 3 Normal Test Sürümü (Ultra Glassmorphic)
            for (let i = 1; i <= 3; i++) {
                const testBtn = document.createElement('button');
                testBtn.className = "glass-card glass-card-interactive rounded-2xl p-4 text-left flex items-center justify-between shadow-md w-full";
                testBtn.onclick = () => launchQuizEngine(level, `Test ${i}`);
                testBtn.innerHTML = `
                    <div class="flex items-center space-x-3.5">
                        <div class="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/25">
                            <i data-lucide="file-question" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="text-xs font-extrabold theme-text-main">Test ${i}</h4>
                            <p class="text-[10px] theme-text-muted mt-0.5">Seviye kazanımını ölçecek 5 özel soru.</p>
                        </div>
                    </div>
                    <span class="text-[9px] theme-primary-color bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Hemen Başla</span>
                `;
                testsContainer.appendChild(testBtn);
            }

            // 1 Genel Sınav (Ultra Glassmorphic Parıltı)
            const generalTestBtn = document.createElement('button');
            generalTestBtn.className = "glass-card glass-card-interactive border-2 border-dashed border-[var(--theme-primary)] hover:border-neutral-500 rounded-2xl p-4.5 text-left flex items-center justify-between shadow-lg w-full mt-2";
            generalTestBtn.onclick = () => launchQuizEngine(level, 'Genel');
            generalTestBtn.innerHTML = `
                <div class="flex items-center space-x-3.5">
                    <div class="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-450 flex items-center justify-center border border-emerald-500/25">
                        <i data-lucide="award" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h4 class="text-xs font-black theme-text-main">Genel Değerlendirme Testi 🏆</h4>
                        <p class="text-[10px] theme-text-muted mt-0.5">Seviyenin tüm harf ve kurallarını içeren karma test.</p>
                    </div>
                </div>
                <span class="text-[9px] text-emerald-450 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full font-extrabold uppercase tracking-wider animate-pulse">Büyük Sınav</span>
            `;
            testsContainer.appendChild(generalTestBtn);

            document.getElementById('level-selection-view').classList.add('hidden');
            document.getElementById('test-selection-view').classList.remove('hidden');
            lucide.createIcons();
        }

        function goBackToLevels() {
            playClickSound();
            document.getElementById('test-selection-view').classList.add('hidden');
            document.getElementById('level-selection-view').classList.remove('hidden');
        }

        // Sınavı Başlatır
        function launchQuizEngine(level, testName) {
            playClickSound();
            activeLevel = level;
            activeTestName = testName;
            activeQuestionIndex = 0;
            activeCorrects = 0;
            activeWrongs = 0;

            const categoryQuestions = quizBank[level]?.[testName];
            if (!categoryQuestions || categoryQuestions.length === 0) {
                showToast("Bu test henüz hazır değil, yakında eklenecek.", "info");
                return;
            }

            activeQuizQuestions = JSON.parse(JSON.stringify(categoryQuestions)); // Klonla

            document.getElementById('active-quiz-title').innerText = `Seviye ${level} - ${testName}`;
            document.getElementById('test-selection-view').classList.add('hidden');
            document.getElementById('quiz-active-view').classList.remove('hidden');

            renderQuizQuestion();
        }

        // Soru Çizer (Cam Şık Butonları Entegre Edildi)
        function renderQuizQuestion() {
            const q = activeQuizQuestions[activeQuestionIndex];
            document.getElementById('active-question-counter').innerText = `Soru: ${activeQuestionIndex + 1}/${activeQuizQuestions.length}`;
            
            // Satır sonu (\n) ayrımını korumak için innerHTML veya düzgün text formatı kullanalım
            document.getElementById('quiz-display-word').innerHTML = q.word.replace(/\n/g, '<br>');

            const container = document.getElementById('quiz-options-container');
            container.innerHTML = '';

            q.options.forEach(option => {
                const btn = document.createElement('button');
                // Premium Buzlu Cam Seçenek Butonu
                btn.className = "w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl theme-text-main text-xs font-bold transition-all text-left flex justify-between items-center cursor-pointer active:scale-[0.98] shadow-sm hover:bg-white/10 hover:border-white/20";
                btn.innerHTML = `<span>${option}</span> <i data-lucide="chevron-right" class="w-4 h-4 theme-text-muted"></i>`;
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
                // glass-emerald sınıfı eklendi
                btn.className = "w-full py-3.5 px-4 glass-emerald rounded-xl text-emerald-400 text-xs font-black transition-all text-left flex justify-between items-center";
                
                feedback.className = "rounded-xl p-3.5 text-center text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-md";
                feedback.innerHTML = "Harika Başarı! 🌿 Bilgileriniz pekişiyor, yeni bir soruyu başarıyla çözdünüz! +10 XP";
                activeCorrects++;
                totalScore += 10;
                updateUIPoints();
                updateLearningStats();
            } else {
                // glass-rose sınıfı eklendi
                btn.className = "w-full py-3.5 px-4 glass-rose rounded-xl text-red-400 text-xs font-black transition-all text-left flex justify-between items-center";
                
                feedback.className = "rounded-xl p-3.5 text-center text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-md";
                feedback.innerHTML = `Yeni Bir Öğrenim! 📈 Hatalar en iyi öğrenme fırsatıdır. Doğru yanıt: <strong>${correct}</strong>`;
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
            document.getElementById('result-correct-count').innerText = `${activeCorrects} Doğru`;
            document.getElementById('result-wrong-count').innerText = `${activeWrongs} Yanlış`;
            document.getElementById('result-percent').innerText = `%${successPercent} Başarı`;
            
            const pctEl = document.getElementById('result-percent');
            if (successPercent >= 80) {
                pctEl.className = "font-black text-emerald-400 text-sm";
            } else if (successPercent >= 60) {
                pctEl.className = "font-black text-blue-400 text-sm";
            } else {
                pctEl.className = "font-black text-amber-450 text-sm";
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
            document.getElementById('edit-profile-birthdate').value = currentUser.birthdate || '';
            document.getElementById('edit-profile-email').value = currentUser.email;

            const preview = document.getElementById('edit-avatar-preview');
            preview.innerHTML = currentUser.avatar;
            editAvatarValue = currentUser.avatar;

            document.querySelectorAll('.edit-avatar-option').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.innerText === currentUser.avatar) {
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
            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            lucide.createIcons();
        }

        function closeKariyerModu() {
            playClickSound();
            stopTennisGame();
            document.getElementById('kariyer-modal-container').classList.add('hidden');
            
            // Kariyer görünümünü varsayılan duruma sıfırla
            document.getElementById('career-intro-wrapper').classList.remove('hidden');
            document.getElementById('tennis-game-container').classList.add('hidden');
        }

        // --- 🎾 GİZLİ TENİS OYUNU KİLİT DURUMU (localStorage ile kalıcı) ---
        let tennisUnlocked = false;
        try { tennisUnlocked = localStorage.getItem('lisani_tennis_unlocked') === '1'; } catch (e) {}

        // --- KARİYER MODU TEK / ÇİFT TIKLAMA YÖNETİMİ ---
        let kariyerClickCount = 0;
        let kariyerClickTimer = null;

        function handleKariyerModuClick() {
            kariyerClickCount++;
            if (kariyerClickCount === 1) {
                kariyerClickTimer = setTimeout(() => {
                    kariyerClickCount = 0;
                    // Tek tık -> Standart Kariyer Modu ekranı
                    openKariyerModu();
                }, 320);
            } else if (kariyerClickCount === 2) {
                clearTimeout(kariyerClickTimer);
                kariyerClickCount = 0;
                // Çift tık
                if (tennisUnlocked) {
                    launchTennisDirectly();
                } else {
                    openKariyerModu();
                    showToast("Tenis oyununu açmak için önce profil bölümündeki şifreyi gir. 🗝️", "info");
                }
            }
        }

        // --- ANA SAYFADAN DOĞRUDAN TENİS OYUNUNU BAŞLAT ---
        function launchTennisDirectly() {
            playClickSound();
            document.getElementById('kariyer-modal-container').classList.remove('hidden');
            document.getElementById('career-intro-wrapper').classList.add('hidden');
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
                tennisUnlocked = true;
                try { localStorage.setItem('lisani_tennis_unlocked', '1'); } catch (e) {}
                const badge = document.getElementById('tennis-unlock-badge');
                if (badge) badge.classList.remove('hidden');
                codeField.value = '';
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
                    selectedAvatarValue = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-full" />`;
                    // Büyük önizlemeyi güncelle
                    const preview = document.getElementById('avatar-preview-big');
                    const label = document.getElementById('avatar-preview-label');
                    if (preview) preview.innerHTML = selectedAvatarValue;
                    if (label) label.textContent = 'Fotoğrafım';
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
                    editAvatarValue = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-full" />`;
                    document.getElementById('edit-avatar-preview').innerHTML = editAvatarValue;
                    showToast("Yeni görsel yüklendi. Kaydetmeyi unutmayın.", "success");
                };
                reader.readAsDataURL(file);
            }
        }

        // PROFİLİ DÜZENLEME DEĞİŞİKLİKLERİ
        function saveProfileChanges() {
            playClickSound();
            
            const nameInput = document.getElementById('edit-profile-username').value.trim();
            const birthdateInput = document.getElementById('edit-profile-birthdate').value;
            const emailInput = document.getElementById('edit-profile-email').value.trim();

            if (!nameInput || !birthdateInput) {
                showToast("Lütfen tüm alanları doldurun.", "error");
                return;
            }


            const birthYear = new Date(birthdateInput).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            currentUser.name = nameInput;
            currentUser.birthdate = birthdateInput;
            currentUser.email = emailInput;
            currentUser.avatar = editAvatarValue;
            currentUser.age = age;

            document.getElementById('settings-profile-name').innerText = nameInput;
            document.getElementById('settings-profile-sub').innerHTML = `E-posta: <strong>${emailInput}</strong>`;
            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${nameInput}! 👋`;

            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('settings-avatar-container')
            ];

            avatarContainers.forEach(container => {
                container.innerHTML = editAvatarValue;
                if (!editAvatarValue.includes('<img')) {
                    container.classList.add('text-lg');
                } else {
                    container.classList.remove('text-lg');
                }
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
                const user = { uid, name: ud.name, email: ud.email, avatar: ud.avatar || '🐱', role: ud.role || 'ogrenci', sinif: ud.sinif || null, birthdate: ud.birthdate || '', password: passwordInput };
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
                birthdate: "2008-01-01",
                email: "developer@temrin.ai",
                password: "dev",
                avatar: "🛠️",
                age: 18,
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
            const newUser = { uid: 'local_' + Date.now(), name, email, password, avatar: selectedAvatarValue, role, sinif, birthdate: '', totalScore: 0 };
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
                    role, sinif, birthdate: '', totalScore: 0,
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

        function loginSuccess(user, rememberMe = false) {
            currentUser = user;
            currentUserRole = user.role || 'ogrenci';
            window._loginDone = true;
            window._manualLogout = false;

            // Beni hatırla seçildiyse localStorage'a kaydet
            if (rememberMe) {
                try {
                    localStorage.setItem('lisani_session_user', JSON.stringify(user));
                    localStorage.setItem('lisani_remember_me', 'true');
                } catch(e) {}
            } else {
                try {
                    localStorage.removeItem('lisani_session_user');
                    localStorage.removeItem('lisani_remember_me');
                } catch(e) {}
            }
            try { localStorage.setItem('lisani_registered_users', JSON.stringify(registeredUsers)); } catch(e) {}
            
            document.getElementById('settings-profile-name').innerText = user.name;
            const roleBadge = currentUserRole === 'hoca' ? '📚 Hoca' : '🎒 Öğrenci';
            document.getElementById('settings-profile-sub').innerHTML = roleBadge;
            
            const avatarContainers = [
                document.getElementById('home-avatar-display'),
                document.getElementById('settings-avatar-container')
            ];
            avatarContainers.forEach(container => {
                if (!container) return;
                container.innerHTML = user.avatar;
                if (user.avatar && user.avatar.includes('<img')) {
                    container.classList.remove('text-lg');
                } else {
                    container.classList.add('text-lg');
                }
            });

            document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${user.name}! 👋`;
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('main-application-flow').classList.remove('hidden');
            
            showToast("Giriş yapıldı. İyi çalışmalar!", "success");
            switchTab('home');
            updateLearningStats();

            if (typeof window.onLoginSuccessHook === 'function') {
                window.onLoginSuccessHook(user);
            }
        }

        async function logoutApp() {
            playClickSound();
            window._manualLogout = true;
            window._loginDone = false;
            currentUser = null;
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
                        <span class="text-xl">${o.avatar || '🎒'}</span>
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
                    odevlerHTML += `<div class="py-1.5 border-b theme-border"><p class="text-xs theme-text-main">${o.icerik}</p><p class="text-[10px] theme-text-muted">${o.tarih}</p></div>`;
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
                <h3 class="text-xs font-bold theme-text-main mb-2">📝 Yeni Ödev Ver</h3>
                <textarea id="odev-icerik" placeholder="Ödev içeriğini yazın..." class="w-full p-2.5 rounded-xl border theme-border bg-stone-900 theme-text-main text-xs focus:outline-none resize-none h-20 mb-2"></textarea>
                <button onclick="odevVer('${uid}')" class="w-full py-2.5 theme-primary-btn rounded-xl text-xs font-bold">Ödevi Gönder</button>
            </div>`;
        }

        function odevVer(hocaUid) {
            const icerik = document.getElementById('odev-icerik').value.trim();
            if (!icerik) { showToast("Ödev içeriği boş olamaz.", "error"); return; }
            const sinif = _getLocalSinif(hocaUid) || _initSinif(hocaUid);
            sinif.odevler.push({ icerik, tarih: new Date().toLocaleDateString('tr-TR'), hocaAdi: currentUser.name });
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
                <button onclick="sinifaKatil(document.getElementById('sinif-kod-input').value)" class="w-full py-3 theme-primary-btn rounded-xl text-xs font-bold">Katıl</button>
            </div>`;
        }

        function updateUIPoints() {
            const ptsHome = document.getElementById('total-xp-display-home');
            const scoreDisplay = document.getElementById('home-score-display');
            if (ptsHome) ptsHome.innerText = `${totalScore} XP`;
            if (scoreDisplay) scoreDisplay.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5 fill-current text-amber-500"></i><span>${totalScore} XP</span>`;
            lucide.createIcons();
        }

        // --- TEMA PALETİ VE AYARLARI ---
        const themes = {
            'brown-classic': {
                bgPhone: '#f4ece1',
                cardBg: 'rgba(255, 255, 255, 0.55)',
                border: 'rgba(140, 98, 57, 0.15)',
                textMain: '#3E3225',
                textMuted: '#8C7A6B',
                primary: '#8C6239',
                primaryHover: '#6F4E2E',
                secondary: 'rgba(234, 219, 200, 0.5)',
                gradientFrom: '#5C3E2E',
                gradientTo: '#8C6239',
                accentLight: 'rgba(250, 246, 240, 0.45)',
                buttonText: '#FFFFFF'
            },
            'brown-darkbrown': {
                bgPhone: '#18100c', 
                cardBg: 'rgba(46, 33, 26, 0.45)',
                border: 'rgba(130, 95, 78, 0.25)',
                textMain: '#FDF8F5',
                textMuted: '#C5AFA4',
                primary: '#D49B6A', 
                primaryHover: '#C58855',
                secondary: 'rgba(61, 43, 34, 0.5)',
                gradientFrom: '#9E6C4C',
                gradientTo: '#52392E',
                accentLight: 'rgba(54, 38, 30, 0.35)',
                buttonText: '#FFFFFF'
            },
            'emerald-mint': {
                bgPhone: '#051813',
                cardBg: 'rgba(6, 78, 59, 0.25)',
                border: 'rgba(194, 236, 217, 0.15)',
                textMain: '#E6FDF4',
                textMuted: '#89B8A9',
                primary: '#059669',
                primaryHover: '#047857',
                secondary: 'rgba(209, 250, 229, 0.25)',
                gradientFrom: '#064E3B',
                gradientTo: '#0F766E',
                accentLight: 'rgba(15, 118, 110, 0.15)',
                buttonText: '#FFFFFF'
            },
            'blue-darkblue': {
                bgPhone: '#040814',
                cardBg: 'rgba(28, 37, 65, 0.45)',
                border: 'rgba(58, 80, 107, 0.25)',
                textMain: '#F1F5F9',
                textMuted: '#85929E',
                primary: '#3B82F6',
                primaryHover: '#1D4ED8',
                secondary: 'rgba(28, 37, 65, 0.5)',
                gradientFrom: '#3B82F6',
                gradientTo: '#1E3A8A',
                accentLight: 'rgba(11, 19, 43, 0.35)',
                buttonText: '#FFFFFF'
            }
        };

        let currentActiveScreen = 'home';

        function applyTheme(themeKey) {
            playClickSound();
            const theme = themes[themeKey];
            if (!theme) return;

            const root = document.documentElement;
            root.style.setProperty('--theme-bg-phone', theme.bgPhone);
            root.style.setProperty('--theme-card-bg', theme.cardBg);
            root.style.setProperty('--theme-border', theme.border);
            root.style.setProperty('--theme-text-main', theme.textMain);
            root.style.setProperty('--theme-text-muted', theme.textMuted);
            root.style.setProperty('--theme-primary', theme.primary);
            root.style.setProperty('--theme-primary-hover', theme.primaryHover);
            root.style.setProperty('--theme-secondary', theme.secondary);
            root.style.setProperty('--theme-card-gradient-from', theme.gradientFrom);
            root.style.setProperty('--theme-card-gradient-to', theme.gradientTo);
            root.style.setProperty('--theme-accent-light', theme.accentLight);
            root.style.setProperty('--theme-button-text', theme.buttonText);

            // Dinamik cam parlaması küresinin (glow-blob) rengini tema birincil rengine eşle
            document.getElementById('glow-blob-1').style.backgroundColor = theme.primary;

            // Özel renk buton değerini güncelle
            document.getElementById('custom-theme-color-picker').value = theme.primary;
            document.getElementById('custom-color-indicator').innerText = theme.primary;
            document.getElementById('custom-color-indicator').style.color = theme.primary;

            // Butonun RGB halini gölgeler için hesapla
            const rgbVal = hexToRgb(theme.primary);
            root.style.setProperty('--theme-primary-rgb', rgbVal);

            document.querySelectorAll('.theme-select-card').forEach(btn => {
                btn.style.borderColor = 'var(--theme-border)';
                btn.classList.remove('ring-2', 'ring-offset-1');
                
                const targetBtnKey = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
                if (targetBtnKey === themeKey) {
                    btn.classList.add('ring-2', 'ring-offset-1');
                    btn.style.borderColor = 'var(--theme-primary)';
                }
            });

            const homeInner = document.getElementById('home-inner-circle');
            if (homeInner) {
                homeInner.style.backgroundColor = theme.primary;
                homeInner.style.borderColor = theme.bgPhone;
            }

            initLettersGrid();
            renderProgressChart();
            switchTab(currentActiveScreen);
        }

        function handleCustomColorSelect(event) {
            const hex = event.target.value;
            const root = document.documentElement;
            
            root.style.setProperty('--theme-primary', hex);
            root.style.setProperty('--theme-primary-hover', darkenColor(hex, 10));
            root.style.setProperty('--theme-secondary', darkenColor(hex, 30));
            root.style.setProperty('--theme-card-gradient-from', hex);

            // Dinamik parlayan küreyi özelleştirilen renge ayarla
            document.getElementById('glow-blob-1').style.backgroundColor = hex;

            const rgbVal = hexToRgb(hex);
            root.style.setProperty('--theme-primary-rgb', rgbVal);
            
            document.getElementById('custom-color-indicator').innerText = hex;
            document.getElementById('custom-color-indicator').style.color = hex;
            
            const homeInner = document.getElementById('home-inner-circle');
            if (homeInner) {
                homeInner.style.backgroundColor = hex;
            }
            
            renderProgressChart();
            updateLearningStats();
        }

        function switchTab(screenId) {
            playClickSound();
            currentActiveScreen = screenId;
            
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
            });

            const targetScreen = document.getElementById(`screen-${screenId}`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            if (screenId === 'ai') {
                renderProgressChart();
                renderQuizHistoryList();
                if (testHistory.length > 0) {
                    showTrialDetail(testHistory[testHistory.length - 1].id);
                }
            }

            if (screenId === 'tests') {
                document.getElementById('test-selection-view').classList.add('hidden');
                document.getElementById('quiz-active-view').classList.add('hidden');
                document.getElementById('quiz-result-view').classList.add('hidden');
                document.getElementById('level-selection-view').classList.remove('hidden');
            }

            if (screenId === 'settings') {
                updateLearningStats();
            }

            const tabIds = ['ai', 'tests', 'home', 'letters', 'settings'];
            tabIds.forEach(id => {
                const tabBtn = document.getElementById(`tab-${id}`);
                if (tabBtn) {
                    const icon = tabBtn.querySelector('i');
                    if (icon) {
                        icon.style.transform = "scale(1)";
                    }

                    if (id === 'home') {
                        const homeText = document.getElementById('tab-home-text');
                        if (homeText) {
                            homeText.style.color = 'var(--theme-text-muted)';
                            homeText.className = "text-[9px] font-extrabold mt-7";
                        }
                    } else {
                        tabBtn.style.color = 'var(--theme-text-muted)';
                        tabBtn.className = "flex flex-col items-center justify-center flex-1 py-1 text-xs transition duration-155";
                    }
                }
            });

            const activeTab = document.getElementById(`tab-${screenId}`);
            if (activeTab) {
                const activeIcon = activeTab.querySelector('i');
                if (activeIcon) {
                    activeIcon.style.transform = "scale(1.15)";
                }

                if (screenId === 'home') {
                    const homeText = document.getElementById('tab-home-text');
                    if (homeText) {
                        homeText.style.color = 'var(--theme-primary)';
                        homeText.className = "text-[9px] font-black mt-7";
                    }
                } else {
                    activeTab.style.color = 'var(--theme-primary)';
                    activeTab.className = "flex flex-col items-center justify-center flex-1 py-1 font-black transition duration-155";
                }
            }
        }

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
            const deneme = testHistory.find(d => d.id === id);
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

            listEl.innerHTML = '';
            countEl.innerText = `Toplam: ${testHistory.length} Sınav`;

            // Hiç test çözülmemişse boş durum mesajı göster ve detay kartını gizle
            if (testHistory.length === 0) {
                if (detailCard) detailCard.classList.add('hidden');
                listEl.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <i data-lucide="clipboard-list" class="w-8 h-8 theme-text-muted opacity-50"></i>
                        <p class="text-[11px] theme-text-muted font-bold">Henüz çözülen sınav yok</p>
                        <p class="text-[10px] theme-text-muted opacity-70">Test çözdükçe sonuçların burada listelenecek</p>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }

            testHistory.slice().reverse().forEach(record => {
                const row = document.createElement('div');
                row.className = "flex items-center justify-between p-3.5 theme-light-bg border theme-border rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all";
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
            svg.innerHTML = `
                <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.0" />
                    </linearGradient>
                </defs>
            `;

            if (testHistory.length === 0) {
                svg.innerHTML += `<text x="250" y="130" fill="var(--theme-text-muted)" font-size="14" font-weight="bold" text-anchor="middle">Henüz tamamlanan test yok</text>`;
                return;
            }

            const pointsCount = testHistory.length;
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
            testHistory.forEach((record, idx) => {
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
            { name: 'Be', ar: 'ب', sounds: 'B', desc: 'Türkçe kelimelerde bazen P sesine dönüşebilir.', f1: 'ب', f2: 'بـ', f3: 'ـbـ', f4: 'ـب' },
            { name: 'Pe', ar: 'پ', sounds: 'P', desc: 'Osmanlıca ve Farsçaya özgü üç noktalı harftir.', f1: 'پ', f2: 'پـ', f3: 'ـpـ', f4: 'ـp' },
            { name: 'Te', ar: 'ت', sounds: 'T', desc: 'Yumuşak t sesini verir.', f1: 'ت', f2: 'تـ', f3: 'ـtـ', f4: 'ـت' },
            { name: 'Se', ar: 'ث', sounds: 'S (Pelte)', desc: 'Arapça kökenli kelimelerde peltek "S" sesini temsil eder.', f1: 'ث', f2: 'ثـ', f3: 'ـثـ', f4: 'ـث' },
            { name: 'Cim', ar: 'ج', sounds: 'C', desc: 'Standart c sesini karşılar.', f1: 'ج', f2: 'جـ', f3: 'ـجـ', f4: 'ـج' },
            { name: 'Çim', ar: 'چ', sounds: 'Ç', desc: 'Türkçe ve Farsça kelimeler için üretilen üç noktalı Ç harfidir.', f1: 'چ', f2: 'چـ', f3: 'ـچـ', f4: 'ـچ' },
            { name: 'Ha', ar: 'ح', sounds: 'H', desc: 'Boğazdan çıkarılan kalın "H" sesidir.', f1: 'ح', h2: 'حـ', f3: 'ـحـ', f4: 'ـح' },
            { name: 'Hı', ar: 'خ', sounds: 'H (Hırıltılı)', desc: 'Gırtlaktan hırıldatılarak okunan kalın h sesidir.', f1: 'خ', f2: 'خـ', f3: 'ـخـ', f4: 'ـخ' },
            { name: 'Dal', ar: 'د', sounds: 'D', desc: 'Kendinden sonraki harfle birleşmez.', f1: 'د', f2: 'د', f3: 'ـd', f4: 'ـd' },
            { name: 'Zel', ar: 'ذ', sounds: 'Z (Pelte)', desc: 'Peltek Z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ذ', f2: 'ذ', f3: 'ـذ', f4: 'ـذ' },
            { name: 'Rı', ar: 'ر', sounds: 'R', desc: 'Standart r sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ر', f2: 'ر', f3: 'ـr', f4: 'ـr' },
            { name: 'Ze', ar: 'ز', sounds: 'Z', desc: 'Sert z sesidir. Kendisinden sonraki harfe birleşmez.', f1: 'ز', f2: 'ز', f3: 'ـz', f4: 'ـz' },
            { name: 'Je', ar: 'ژ', sounds: 'J', desc: 'Üç noktalı rı harfidir. Kendisinden sonraki harfe birleşmez.', f1: 'ژ', f2: 'ژ', f3: 'ـژ', f4: 'ـژ' },
            { name: 'Sin', ar: 'س', sounds: 'S', desc: 'İnce sesli kelimelerde S sesini karşılar.', f1: 'س', f2: 'سـ', f3: 'ـsـ', f4: 'ـs' },
            { name: 'Şın', ar: 'ش', sounds: 'Ş', desc: 'Standart ş sesini karşılar.', f1: 'ش', f2: 'شـ', f3: 'ـşـ', f4: 'ـş' },
            { name: 'Sad', ar: 'ص', sounds: 'S (Kalın)', desc: 'Kalın sesli kelimelerde "S" sesini temsil eder.', f1: 'ص', f2: 'صـ', f3: 'ـصـ', f4: 'ـص' },
            { name: 'Dad', ar: 'ض', sounds: 'D, Z', desc: 'Arapça kökenli kelimelere özel kalın bir sestir.', f1: 'ض', f2: 'ضـ', f3: 'ـضـ', f4: 'ـض' },
            { name: 'Tı', ar: 'ط', sounds: 'T (Kalın)', desc: 'Kalın sesli kelimelerde "T" ve bazen "D" sesini verir.', f1: 'ط', f2: 'طـ', f3: 'ـطـ', f4: 'ـط' },
            { name: 'Zı', ar: 'ظ', sounds: 'Z (Kalın)', desc: 'Kalın sesli kelimelerde kalın ve tok "Z" sesini temsil eder.', f1: 'ظ', f2: 'ظـ', f3: 'ـطـ', f4: 'ـط' },
            { name: 'Ayın', ar: 'ع', sounds: 'A, E, I, İ, O, Ö, U, Ü', desc: 'Boğazdan gelen bir gırtlak sesidir.', f1: 'ع', f2: 'عـ', f3: 'ـعـ', f4: 'ـع' },
            { name: 'Gayın', ar: 'غ', sounds: 'Ğ, G', desc: 'Kalın sesli kelimelerde yumuşak g veya kalın g sesini verir.', f1: 'غ', f2: 'غـ', f3: 'ـغـ', f4: 'ـغ' },
            { name: 'Fe', ar: 'ف', sounds: 'F', desc: 'Standart f sesini karşılar.', f1: 'ف', f2: 'فـ', f3: 'ـfـ', f4: 'ـf' },
            { name: 'Kaf', ar: 'ق', sounds: 'K (Kalın)', desc: 'Kalın sesli kelimelerde gırtlaktan çıkan tok K sesini verir.', f1: 'ق', f2: 'قـ', f3: 'ـقـ', f4: 'ـق' },
            { name: 'Kef', ar: 'ك', sounds: 'K (İnce)', desc: 'İnce sesli kelimelerde ince K sesini karşılar.', f1: 'ك', f2: 'كـ', f3: 'ـكـ', f4: 'ـك' },
            { name: 'Gef', ar: 'گ', sounds: 'G', desc: 'Türkçe ve Farsçadaki yumuşak G/G sesleri için kullanılır.', f1: 'گ', f2: 'گـ', f3: 'ـگـ', f4: 'ـگ' },
            { name: 'Nef (Sağır Nun)', ar: 'ڭ', sounds: 'N, Ñ', desc: 'Genizden çıkan n (nazal n) sesidir. Türkçeye özeldir.', f1: 'ڭ', f2: 'ڭـ', f3: 'ـڭـ', f4: 'ـڭ' },
            { name: 'Lam', ar: 'ل', sounds: 'L', desc: 'Standart l sesini temsil eder.', f1: 'ل', f2: 'لـ', f3: 'ـllـ', f4: 'ـل' },
            { name: 'Mim', ar: 'م', sounds: 'M', desc: 'Standart m sesini temsil eder.', f1: 'م', f2: 'مـ', f3: 'ـmـ', f4: 'ـm' },
            { name: 'Nun', ar: 'ن', sounds: 'N', desc: 'Standart n sesini temsil eder.', f1: 'ن', f2: 'نـ', f3: 'ـnـ', f4: 'ـn' },
            { name: 'Vav', ar: 'و', sounds: 'V, O, Ö, U, Ü', desc: 'Hem ünsüz hem ünlü harf görevindedir. Birleşmez.', f1: 'و', f2: 'و', f3: 'ـو', f4: 'ـو' },
            { name: 'He', ar: 'ه', sounds: 'H, E, A', desc: 'Kelime sonunda gelince e veya a sesi verir.', f1: 'ه', f2: 'هـ', f3: 'ـهـ', f4: 'ـه' },
            { name: 'Lamelif', ar: 'لا', sounds: 'La', desc: 'Lam ve Elif harflerinin birleşiminden oluşan özel harf.', f1: 'لا', f2: 'لا', f3: 'ـla', f4: 'ـla' },
            { name: 'Ye', ar: 'ي', sounds: 'Y, I, İ', desc: 'Hem ünsüz hem ünlü harf görevindedir.', f1: 'ي', f2: 'يـ', f3: 'ـيـ', f4: 'ـي' },
            { name: 'Hemze', ar: 'ء', sounds: 'A, E, I, İ', desc: 'Kelime içinde es, kesinti veya ek ünlü seslerini karşılar.', f1: 'ء', f2: 'ء', f3: 'ء', f4: 'ء' }
        ];

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
                    <div class="lisani-letters-empty text-center py-8">
                        <p class="text-xs theme-text-muted font-bold">Aradığınız harf bulunamadı.</p>
                    </div>
                `;
                return;
            }
            
            filteredAlphabet.forEach((letter) => {
                const card = document.createElement('div');
                card.className = "lisani-letter-card theme-card-bg hover:opacity-90 border theme-border rounded-xl p-2 sm:p-2.5 text-center cursor-pointer transition transform hover:-translate-y-0.5 active:scale-95 flex flex-col items-center justify-center gap-0.5 shadow-sm min-h-0";
                card.onclick = () => {
                    playClickSound();
                    showLetterDetail(letter);
                    showToast(`${letter.name} harfi seçildi.`, "success");
                };
                card.innerHTML = `
                    <span class="lisani-letter-card__ar arabic-text font-bold theme-primary-color drop-shadow-sm">${letter.ar}</span>
                    <span class="lisani-letter-card__name text-[10px] font-bold theme-text-main leading-tight">${letter.name}</span>
                    <span class="lisani-letter-card__sound text-[9px] theme-text-muted font-semibold leading-tight">${letter.sounds}</span>
                `;
                grid.appendChild(card);
            });
        }

        function showLetterDetail(letter) {
            document.getElementById('letter-detail-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            document.getElementById('detail-title').innerText = `${letter.name} (${letter.ar})`;
            document.getElementById('detail-desc').innerText = letter.desc;
            document.getElementById('detail-arabic').innerText = letter.ar;
            
            document.getElementById('detail-f1').innerText = letter.f1;
            document.getElementById('detail-f2').innerText = letter.f2 || letter.f1;
            document.getElementById('detail-f3').innerText = letter.f3 || letter.f1;
            document.getElementById('detail-f4').innerText = letter.f4 || letter.f1;
        }

        // ================= DOKUNMATİK SEKMELER ARASI KAYDIRMA MOTORU (SWIPE) =================
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        function initSwipeGestures() {
            const container = document.getElementById('screens-container');
            const tabOrder = ['ai', 'tests', 'home', 'letters', 'settings'];

            container.addEventListener('touchstart', (e) => {
                // Aktif bir test, kariyer modu, tenis oyunu veya profil düzenleme modalı açıksa kaydırmayı engelle
                if (!document.getElementById('quiz-active-view').classList.contains('hidden') ||
                    !document.getElementById('kariyer-modal-container').classList.contains('hidden') ||
                    !document.getElementById('edit-profile-container').classList.contains('hidden')) {
                    return;
                }
                
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                if (!document.getElementById('quiz-active-view').classList.contains('hidden') ||
                    !document.getElementById('kariyer-modal-container').classList.contains('hidden') ||
                    !document.getElementById('edit-profile-container').classList.contains('hidden')) {
                    return;
                }

                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipeGesture(tabOrder);
            }, { passive: true });
        }

        function handleSwipeGesture(tabOrder) {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Kullanıcının dikey olarak kaydırma niyetinde olmadığını doğrula (Yanlış tetiklemeyi önler)
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                const swipeThreshold = 55; // Piksel cinsinden kaydırma hassasiyeti
                const currentIdx = tabOrder.indexOf(currentActiveScreen);

                if (deltaX < -swipeThreshold) {
                    // Sola Kaydırma -> Sonraki Sekme (Örn: home -> letters)
                    if (currentIdx < tabOrder.length - 1) {
                        switchTab(tabOrder[currentIdx + 1]);
                    }
                } else if (deltaX > swipeThreshold) {
                    // Sağa Kaydırma -> Önceki Sekme (Örn: home -> tests)
                    if (currentIdx > 0) {
                        switchTab(tabOrder[currentIdx - 1]);
                    }
                }
            }
        }

        // --- TENİS OYUNU FİZİK VE ÇİZİM MOTORU ---
        function initTennisGameEngine() {
            tennisCanvas = document.getElementById('tennis-canvas');
            if (!tennisCanvas) return;
            
            tennisCtx = tennisCanvas.getContext('2d');
            
            // Canvas piksel boyutlarını sabitleyip css ile esnetelim
            tennisCanvas.width = 320;
            tennisCanvas.height = 240;

            // Oyun değişkenlerini sıfırla
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            updateTennisScoreboard();

            ballX = tennisCanvas.width / 2;
            ballY = tennisCanvas.height / 2;
            ballSpeedX = 2;
            ballSpeedY = -2;

            playerPaddleX = (tennisCanvas.width - paddleWidth) / 2;
            computerPaddleX = (tennisCanvas.width - paddleWidth) / 2;

            isTennisRunning = true;

            // Kontrol dinleyicilerini kur
            setupTennisControls();

            // Oyun döngüsünü başlat
            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            tennisLoop();
        }

        function setupTennisControls() {
            // Klavye Dinleyicileri (Bilgisayar)
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
            window.addEventListener('keydown', handleTennisKeyDown);
            window.addEventListener('keyup', handleTennisKeyUp);

            // Mobil Ekran Altındaki Sol / Sağ Buton Dokunuşları
            const btnLeft = document.getElementById('btn-paddle-left');
            const btnRight = document.getElementById('btn-paddle-right');

            if (btnLeft && btnRight) {
                // Dokunma (Touch) ve Tıklama (Mouse) Dinleyicileri
                btnLeft.onmousedown = () => { keyLeftPressed = true; };
                btnLeft.onmouseup = () => { keyLeftPressed = false; };
                btnLeft.ontouchstart = (e) => { e.preventDefault(); keyLeftPressed = true; };
                btnLeft.ontouchend = (e) => { e.preventDefault(); keyLeftPressed = false; };

                btnRight.onmousedown = () => { keyRightPressed = true; };
                btnRight.onmouseup = () => { keyRightPressed = false; };
                btnRight.ontouchstart = (e) => { e.preventDefault(); keyRightPressed = true; };
                btnRight.ontouchend = (e) => { e.preventDefault(); keyRightPressed = false; };
            }

            // Canvas Doğrudan Parmağı Sürükleyerek Oynatma (Touch Sürükleme)
            tennisCanvas.ontouchmove = (e) => {
                if (!isTennisRunning) return;
                e.preventDefault();
                const rect = tennisCanvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                // Dokunulan X koordinatını canvas ölçeğine dönüştür
                const canvasTouchX = (touchX / rect.width) * tennisCanvas.width;
                playerPaddleX = canvasTouchX - (paddleWidth / 2);
                
                // Sınırlamalar
                if (playerPaddleX < 0) playerPaddleX = 0;
                if (playerPaddleX > tennisCanvas.width - paddleWidth) playerPaddleX = tennisCanvas.width - paddleWidth;
            };

            // Fare ile Sürükleme (Masaüstü için alternatif)
            tennisCanvas.onmousemove = (e) => {
                if (!isTennisRunning) return;
                const rect = tennisCanvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const canvasMouseX = (mouseX / rect.width) * tennisCanvas.width;
                playerPaddleX = canvasMouseX - (paddleWidth / 2);

                if (playerPaddleX < 0) playerPaddleX = 0;
                if (playerPaddleX > tennisCanvas.width - paddleWidth) playerPaddleX = tennisCanvas.width - paddleWidth;
            };
        }

        function handleTennisKeyDown(e) {
            if (e.key === "ArrowLeft" || e.key === "Left") {
                keyLeftPressed = true;
            } else if (e.key === "ArrowRight" || e.key === "Right") {
                keyRightPressed = true;
            }
        }

        function handleTennisKeyUp(e) {
            if (e.key === "ArrowLeft" || e.key === "Left") {
                keyLeftPressed = false;
            } else if (e.key === "ArrowRight" || e.key === "Right") {
                keyRightPressed = false;
            }
        }

        function tennisLoop() {
            if (!isTennisRunning) return;

            updateTennisGamePhysics();
            drawTennisGameScene();

            tennisLoopId = requestAnimationFrame(tennisLoop);
        }

        function updateTennisGamePhysics() {
            // 1. Oyuncu Raketi Klavye/Buton Hareketi
            const paddleSpeed = 4.5;
            if (keyLeftPressed) {
                playerPaddleX -= paddleSpeed;
                if (playerPaddleX < 0) playerPaddleX = 0;
            }
            if (keyRightPressed) {
                playerPaddleX += paddleSpeed;
                if (playerPaddleX > tennisCanvas.width - paddleWidth) playerPaddleX = tennisCanvas.width - paddleWidth;
            }

            // 2. Akıllı Yapay Zeka (Bot Raket) Hareketi
            const computerSpeed = 2.4; // Dengeli bot hızı
            const computerPaddleCenter = computerPaddleX + (paddleWidth / 2);
            if (computerPaddleCenter < ballX - 10) {
                computerPaddleX += computerSpeed;
            } else if (computerPaddleCenter > ballX + 10) {
                computerPaddleX -= computerSpeed;
            }

            if (computerPaddleX < 0) computerPaddleX = 0;
            if (computerPaddleX > tennisCanvas.width - paddleWidth) computerPaddleX = tennisCanvas.width - paddleWidth;

            // 3. Topun Hareketi
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            // Sağ-Sol Duvar Çarpması
            if (ballX - ballRadius < 0) {
                ballX = ballRadius;
                ballSpeedX = -ballSpeedX;
                playTennisBeep(150, 0.05);
            }
            if (ballX + ballRadius > tennisCanvas.width) {
                ballX = tennisCanvas.width - ballRadius;
                ballSpeedX = -ballSpeedX;
                playTennisBeep(150, 0.05);
            }

            // Üst Raket (Bot) Çarpışma Kontrolü
            if (ballY - ballRadius <= paddleHeight) {
                if (ballX >= computerPaddleX && ballX <= computerPaddleX + paddleWidth) {
                    ballSpeedY = -ballSpeedY;
                    ballY = paddleHeight + ballRadius; // Sıkışmayı engelle
                    
                    // Topa vurulan noktaya göre hız değişimi
                    const hitPoint = ballX - (computerPaddleX + paddleWidth / 2);
                    ballSpeedX = hitPoint * 0.08;
                    
                    // Topu hafifçe hızlandır
                    increaseBallSpeed();
                    playTennisBeep(260, 0.08);
                } else if (ballY < 0) {
                    // Sayı Oyuncuya (Siz)
                    tennisPlayerScore++;
                    updateTennisScoreboard();
                    playTennisBeep(440, 0.2); // Zafer sesi
                    showToast("Sayı kazandınız! 🎾", "success");
                    resetBall();
                }
            }

            // Alt Raket (Oyuncu) Çarpışma Kontrolü
            const playerPaddleY = tennisCanvas.height - paddleHeight;
            if (ballY + ballRadius >= playerPaddleY) {
                if (ballX >= playerPaddleX && ballX <= playerPaddleX + paddleWidth) {
                    ballSpeedY = -ballSpeedY;
                    ballY = playerPaddleY - ballRadius; // Sıkışmayı engelle
                    
                    const hitPoint = ballX - (playerPaddleX + paddleWidth / 2);
                    ballSpeedX = hitPoint * 0.08;
                    
                    increaseBallSpeed();
                    playTennisBeep(220, 0.08);
                } else if (ballY > tennisCanvas.height) {
                    // Sayı Bota
                    tennisComputerScore++;
                    updateTennisScoreboard();
                    playTennisBeep(110, 0.25); // Kaybetme sesi
                    showToast("Bot sayı kazandı.", "error");
                    resetBall();
                }
            }
        }

        function increaseBallSpeed() {
            // Maksimum hız kontrolü
            const maxSpeed = 5.5;
            if (Math.abs(ballSpeedY) < maxSpeed) {
                ballSpeedY = (ballSpeedY > 0 ? ballSpeedY + 0.15 : ballSpeedY - 0.15);
            }
        }

        function resetBall() {
            ballX = tennisCanvas.width / 2;
            ballY = tennisCanvas.height / 2;
            // Yönü tersine çevir
            ballSpeedY = (ballSpeedY > 0 ? -2 : 2);
            ballSpeedX = (Math.random() > 0.5 ? 2 : -2);
        }

        function updateTennisScoreboard() {
            const scoreboard = document.getElementById('tennis-score');
            if (scoreboard) {
                scoreboard.innerText = `Siz: ${tennisPlayerScore} | Bot: ${tennisComputerScore}`;
            }
        }

        function resetTennisGame() {
            playClickSound();
            tennisPlayerScore = 0;
            tennisComputerScore = 0;
            updateTennisScoreboard();
            resetBall();
            showToast("Skor sıfırlandı.", "success");
        }

        function stopTennisGame() {
            isTennisRunning = false;
            if (tennisLoopId) cancelAnimationFrame(tennisLoopId);
            window.removeEventListener('keydown', handleTennisKeyDown);
            window.removeEventListener('keyup', handleTennisKeyUp);
        }

        function drawTennisGameScene() {
            // Arka planı temizle
            tennisCtx.fillStyle = '#05070a';
            tennisCtx.fillRect(0, 0, tennisCanvas.width, tennisCanvas.height);

            // Sahadaki orta çizgiyi çiz
            tennisCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            tennisCtx.setLineDash([4, 4]);
            tennisCtx.beginPath();
            tennisCtx.moveTo(0, tennisCanvas.height / 2);
            tennisCtx.lineTo(tennisCanvas.width, tennisCanvas.height / 2);
            tennisCtx.stroke();
            tennisCtx.setLineDash([]); // Sıfırla

            // Bot Raket (Üst) - Temaya uygun Cyan rengi
            tennisCtx.fillStyle = '#ef4444'; // Kırmızı Raket (Bot)
            tennisCtx.beginPath();
            tennisCtx.roundRect(computerPaddleX, 2, paddleWidth, paddleHeight, 4);
            tennisCtx.fill();

            // Oyuncu Raket (Alt) - Temaya uygun birincil altın rengi
            tennisCtx.fillStyle = '#06b6d4'; // Cyan Raket (Oyuncu)
            tennisCtx.beginPath();
            tennisCtx.roundRect(playerPaddleX, tennisCanvas.height - paddleHeight - 2, paddleWidth, paddleHeight, 4);
            tennisCtx.fill();

            // Parlayan Top
            tennisCtx.fillStyle = '#22c55e'; // Parlak Yeşil Top
            tennisCtx.shadowBlur = 10;
            tennisCtx.shadowColor = '#22c55e';
            tennisCtx.beginPath();
            tennisCtx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            tennisCtx.fill();
            
            // Gölge etkisini diğer çizimler için sıfırla
            tennisCtx.shadowBlur = 0;
        }

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

        async function initNotifications() {
            if (!("Notification" in window)) {
                showToast("Bu tarayıcı bildirimleri desteklemiyor.", "error");
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                if ("serviceWorker" in navigator) {
                    try { await registerInlineSW(); } catch(e) {}
                }
                // Cihazın şu anki yerel saatine göre en uygun bildirimi otomatik ayarla
                autoSetNotifTime();
                scheduleDailyNotification();
                const h = parseInt(localStorage.getItem("lisani_notif_hour"));
                showToast("Bildirimler açıldı! Her gün saat " + String(h).padStart(2,"0") + ":00'da günün hadisi gelecek.", "success");
            } else {
                showToast("Bildirim izni verilmedi.", "error");
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

        function getTodaysHadis() {
            // Her gün farklı hadis - tarihe göre sıralı döner
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
            return hadisList[dayOfYear % hadisList.length];
        }

        function scheduleDailyNotification() {
            if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
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
                new Notification("Günün Hadisi 📖", {
                    body: hadis.turkce + "\n— " + hadis.kaynak,
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
            const val = document.getElementById("notif-time-input").value;
            if (!val) return;
            const [h, m] = val.split(":").map(Number);
            localStorage.setItem("lisani_notif_hour", String(h));
            localStorage.setItem("lisani_notif_min",  String(m));
            scheduleDailyNotification();
            closeNotifSettings();
            showToast("Bildirim saati " + String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + " olarak ayarlandı.", "success");
        }

        function testNotification() {
            playClickSound();
            if (typeof Notification === "undefined" || Notification.permission !== "granted") {
                showToast("Önce bildirim iznini ver.", "error");
                return;
            }
            const hadis = getTodaysHadis();
            new Notification("Günün Hadisi 📖", {
                body: hadis.turkce + "\n— " + hadis.kaynak,
                icon: "icon-192.png",
                tag: "lisani-test"
            });
            showToast("Test bildirimi gönderildi.", "success");
        }

        // --- BAŞLANGIÇ KURULUMLARI ---
        window.onload = function() {
            try {
                const savedTests = localStorage.getItem('lisani_test_history');
                if (savedTests) testHistory = JSON.parse(savedTests);
            } catch (e) {}

            lucide.createIcons();
            initLettersGrid();
            renderQuizHistoryList();
            renderProgressChart();
            applyTheme('brown-darkbrown');
            updateLearningStats();
            initSwipeGestures();
            initToastSwipe();

            if (tennisUnlocked) {
                const badge = document.getElementById('tennis-unlock-badge');
                if (badge) badge.classList.remove('hidden');
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

            // Sunucu oturumu ile otomatik giriş (sadece localStorage yeterli değil)
            setTimeout(() => {
                if (!window._manualLogout && typeof window.restoreServerSession === 'function') {
                    window.restoreServerSession();
                }
            }, 800);

            // Bildirim
            try {
                if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                    if ("serviceWorker" in navigator) registerInlineSW().catch(() => {});
                    scheduleDailyNotification();
                }
            } catch(e) {}
        };
