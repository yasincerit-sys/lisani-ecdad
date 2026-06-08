<!DOCTYPE html>
<html lang="tr" class="preline-ui">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1">
    <meta name="format-detection" content="telephone=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Lisanı Ecdad - Osmanlıca Kolay Öğrenim</title>
    <script>
    (function() {
        const manifest = {
            "name": "Lisanı Ecdad - Osmanlıca Öğrenim",
            "short_name": "Lisanı Ecdad",
            "description": "Osmanlıca kolay öğrenim uygulaması",
            "start_url": "{{ url('/') }}",
            "display": "standalone",
            "background_color": "#08061a",
            "theme_color": "#08061a",
            "orientation": "portrait",
            "icons": [
                { "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='36' fill='%232563eb'/%3E%3Ctext x='96' y='130' font-size='110' text-anchor='middle'%3E📖%3C/text%3E%3C/svg%3E", "sizes": "192x192", "type": "image/svg+xml" },
                { "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='96' fill='%232563eb'/%3E%3Ctext x='256' y='350' font-size='300' text-anchor='middle'%3E📖%3C/text%3E%3C/svg%3E", "sizes": "512x512", "type": "image/svg+xml" }
            ]
        };
        const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = url;
        document.head.appendChild(link);
    })();
    </script>
    <meta name="theme-color" content="#08061a" id="meta-theme-color">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Lisanı Ecdad">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        arabic: ['Amiri', 'serif'],
                    },
                },
            },
        };
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="{{ asset('css/lisani.css') }}?v={{ @filemtime(public_path('css/lisani.css')) ?: time() }}">
    <link rel="stylesheet" href="{{ asset('css/preline-lisani.css') }}?v={{ @filemtime(public_path('css/preline-lisani.css')) ?: time() }}">
    <link rel="stylesheet" href="{{ asset('css/lisani-fixes.css') }}?v={{ @filemtime(public_path('css/lisani-fixes.css')) ?: time() }}">
    <style>
        /* Cam — cache/atlatma; Preline solid kart ezilmesin */
        html.preline-ui[class*="theme-"] #app-container .glass-card,
        html.preline-ui[class*="theme-"] #app-container .glass-card-interactive,
        html.preline-ui[class*="theme-"] #auth-container .glass-card,
        html.preline-ui[class*="theme-"] .lisani-glass-panel,
        html.preline-ui[class*="theme-"] .lisani-glass-action,
        html.preline-ui[class*="theme-"] button.lisani-glass-panel,
        html.preline-ui[class*="theme-"] button.lisani-glass-action,
        html.preline-ui[class*="theme-"] div.lisani-glass-action {
            background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.06)) !important;
            backdrop-filter: blur(20px) saturate(165%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(165%) !important;
            border: 1px solid rgba(255,255,255,.22) !important;
            box-shadow: 0 10px 32px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.18) !important;
        }
        html.preline-ui[class*="theme-"] #app-container button.theme-primary-btn:not(.lisani-segment-btn),
        html.preline-ui[class*="theme-"] #auth-container button.theme-primary-btn:not(.lisani-segment-btn),
        html.preline-ui[class*="theme-"] .lisani-glass-action--primary {
            background: linear-gradient(145deg, rgba(var(--theme-primary-rgb),.38), rgba(var(--theme-primary-rgb),.16)) !important;
            border: 1px solid rgba(var(--theme-primary-rgb),.48) !important;
            backdrop-filter: blur(20px) saturate(165%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(165%) !important;
            box-shadow: 0 10px 32px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.2) !important;
            color: var(--ph-text) !important;
            filter: none !important;
        }
        html.preline-ui[class*="theme-"] #bottom-bar.lisani-tab-bar-ios {
            background: linear-gradient(165deg, rgba(255,255,255,.18), rgba(255,255,255,.06)) !important;
            backdrop-filter: blur(44px) saturate(185%) !important;
            -webkit-backdrop-filter: blur(44px) saturate(185%) !important;
            border: 1px solid rgba(255,255,255,.2) !important;
            box-shadow: 0 10px 40px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.22) !important;
        }
    </style>
    <script>
        (function () {
            const valid = ['kahve-kum', 'zumrut-nane', 'saray-kahvesi', 'derin-mavi', 'mavi-mor'];
            const metaMap = {
                'kahve-kum': '#14100e',
                'zumrut-nane': '#081210',
                'saray-kahvesi': '#0f0c0a',
                'derin-mavi': '#080c14',
                'mavi-mor': '#08061a',
            };
            let mode = localStorage.getItem('lisani_color_mode') || 'mavi-mor';
            if (!valid.includes(mode)) {
                if (mode === 'light') mode = 'kahve-kum';
                else if (mode === 'dark') mode = 'derin-mavi';
                else mode = 'mavi-mor';
            }
            const root = document.documentElement;
            root.classList.add('dark', 'theme-' + mode);
            const meta = document.getElementById('meta-theme-color');
            if (meta) meta.setAttribute('content', metaMap[mode] || '#100c0a');
        })();
    </script>
</head>
<body class="lisani-body select-none font-size-standard" id="body-main">
    @yield('content')
    <script>window.LISANI_ASSETS = {
        avatars: @json(asset('images/avatars')),
        gokhanAudio: @json(asset('audio/gokhan-abi-call.mp4'))
    };</script>
    <script src="{{ asset('js/preline.js') }}"></script>
    <script src="{{ asset('js/lisani-flappy.js') }}?v={{ @filemtime(public_path('js/lisani-flappy.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-gokhan-easter.js') }}?v={{ @filemtime(public_path('js/lisani-gokhan-easter.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-native-notifications.js') }}?v={{ @filemtime(public_path('js/lisani-native-notifications.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani.js') }}?v={{ @filemtime(public_path('js/lisani.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-osm-translate.js') }}?v={{ @filemtime(public_path('js/lisani-osm-translate.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-laravel.js') }}?v={{ @filemtime(public_path('js/lisani-laravel.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-tennis-online.js') }}?v={{ @filemtime(public_path('js/lisani-tennis-online.js')) ?: time() }}" defer></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
                window.HSStaticMethods.autoInit();
            }
        });
    </script>
</body>
</html>
