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
            "permissions": ["microphone"],
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
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #app-container .glass-card,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #app-container .glass-card-interactive,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #auth-container .glass-card,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] .lisani-glass-panel,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] .lisani-glass-action,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] button.lisani-glass-panel,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] button.lisani-glass-action,
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] div.lisani-glass-action {
            background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.06)) !important;
            backdrop-filter: blur(20px) saturate(165%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(165%) !important;
            border: 1px solid rgba(255,255,255,.22) !important;
            box-shadow: 0 10px 32px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.18) !important;
        }
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #app-container button.theme-primary-btn:not(.lisani-segment-btn),
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #auth-container button.theme-primary-btn:not(.lisani-segment-btn),
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] .lisani-glass-action--primary {
            background: linear-gradient(145deg, rgba(var(--theme-primary-rgb),.38), rgba(var(--theme-primary-rgb),.16)) !important;
            border: 1px solid rgba(var(--theme-primary-rgb),.48) !important;
            backdrop-filter: blur(20px) saturate(165%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(165%) !important;
            box-shadow: 0 10px 32px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.2) !important;
            color: var(--ph-text) !important;
            filter: none !important;
        }
        html.preline-ui:not(.theme-duolingo):not(.theme-renkli-yol):not(.theme-sade):not(.theme-beyaz-cam)[class*="theme-"] #bottom-bar.lisani-tab-bar-ios {
            background: linear-gradient(165deg, rgba(255,255,255,.18), rgba(255,255,255,.06)) !important;
            backdrop-filter: blur(44px) saturate(185%) !important;
            -webkit-backdrop-filter: blur(44px) saturate(185%) !important;
            border: 1px solid rgba(255,255,255,.2) !important;
            box-shadow: 0 10px 40px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.22) !important;
        }
    </style>
    <script>
        (function () {
            const valid = ['sade', 'saray-kahvesi', 'derin-mavi', 'mavi-mor', 'beyaz-cam'];
            const metaMap = {
                sade: '#111111',
                'saray-kahvesi': '#120d0a',
                'derin-mavi': '#080c14',
                'mavi-mor': '#08061a',
                'beyaz-cam': '#e8edf4',
            };
            window.lisaniPickTheme = function (mode) {
                if (mode === 'light') mode = 'beyaz-cam';
                if (!valid.includes(mode)) mode = 'saray-kahvesi';
                localStorage.setItem('lisani_color_mode', mode);
                const root = document.documentElement;
                valid.forEach(function (t) { root.classList.remove('theme-' + t); });
                root.classList.add('preline-ui', 'theme-' + mode);
                root.classList.toggle('dark', mode !== 'beyaz-cam');
                const meta = document.getElementById('meta-theme-color');
                if (meta) meta.setAttribute('content', metaMap[mode] || '#100c0a');
                document.querySelectorAll('[data-color-mode]').forEach(function (btn) {
                    btn.classList.toggle('is-active', btn.getAttribute('data-color-mode') === mode);
                });
            };
            window.lisaniPickTheme(localStorage.getItem('lisani_color_mode') || 'saray-kahvesi');
        })();
    </script>
    @php($lisaniShitpost = filter_var(config('lisani.shitpost_mode', false), FILTER_VALIDATE_BOOLEAN))
    @php($lisaniShitpostRev = (int) config('lisani.shitpost_rev', 3))
    @if($lisaniShitpost)
    <script>
        window.LISANI_SHITPOST_DEFAULT = true;
        window.LISANI_SHITPOST_REV = @json($lisaniShitpostRev);
        window.lisaniShitpostIsEnabled = function () {
            try {
                var mode = localStorage.getItem('lisani_shitpost');
                var rev = parseInt(localStorage.getItem('lisani_shitpost_rev') || '0', 10) || 0;
                if (mode === '1') return true;
                if (mode === '0' && rev >= window.LISANI_SHITPOST_REV) return false;
            } catch (e) { /* ignore */ }
            return true;
        };
        (function () {
            try {
                if (window.lisaniShitpostIsEnabled()) {
                    document.documentElement.classList.add('lisani-shitpost');
                }
            } catch (e) { /* ignore */ }
        })();
    </script>
    <link rel="stylesheet" href="{{ asset('css/lisani-shitpost.css') }}?v={{ @filemtime(public_path('css/lisani-shitpost.css')) ?: time() }}">
    @else
    <script>
        window.LISANI_SHITPOST_DEFAULT = false;
        (function () {
            try {
                localStorage.setItem('lisani_shitpost', '0');
                localStorage.setItem('lisani_shitpost_rev', @json($lisaniShitpostRev));
            } catch (e) { /* ignore */ }
            document.documentElement.classList.remove('lisani-shitpost');
        })();
    </script>
    @endif
</head>
<body class="lisani-body select-none font-size-standard" id="body-main">
    @yield('content')
    <script>window.LISANI_ASSETS = @json(\App\Support\LisaniAssets::clientConfig());
    window.LISANI_APK = @json(\App\Support\LisaniApk::clientConfig());
    window.LISANI_BASE = @json(rtrim(url('/'), '/'));</script>
    <script src="{{ asset('js/preline.js') }}"></script>
    <script src="{{ asset('js/lisani-flappy.js') }}?v={{ @filemtime(public_path('js/lisani-flappy.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-gokhan-easter.js') }}?v={{ @filemtime(public_path('js/lisani-gokhan-easter.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-native-notifications.js') }}?v={{ @filemtime(public_path('js/lisani-native-notifications.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-native-shell.js') }}?v={{ @filemtime(public_path('js/lisani-native-shell.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-quiz-bank.js') }}?v={{ @filemtime(public_path('js/lisani-quiz-bank.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-osm-translate.js') }}?v={{ @filemtime(public_path('js/lisani-osm-translate.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-grammar-prep.js') }}?v={{ @filemtime(public_path('js/lisani-grammar-prep.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-reward-wheel.js') }}?v={{ @filemtime(public_path('js/lisani-reward-wheel.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani.js') }}?v={{ @filemtime(public_path('js/lisani.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-daily-tasks.js') }}?v={{ @filemtime(public_path('js/lisani-daily-tasks.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-laravel.js') }}?v={{ @filemtime(public_path('js/lisani-laravel.js')) ?: time() }}" defer></script>
    <script src="{{ asset('js/lisani-tennis-online.js') }}?v={{ @filemtime(public_path('js/lisani-tennis-online.js')) ?: time() }}" defer></script>
    @if($lisaniShitpost)
    <script src="{{ asset('js/lisani-shitpost.js') }}?v={{ @filemtime(public_path('js/lisani-shitpost.js')) ?: time() }}"></script>
    @endif
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
                window.HSStaticMethods.autoInit();
            }
        });
    </script>
</body>
</html>
