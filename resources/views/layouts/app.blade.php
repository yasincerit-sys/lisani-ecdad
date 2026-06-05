<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="color-scheme" content="light dark">
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
            "background_color": "#f9fafb",
            "theme_color": "#f9fafb",
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
    <meta name="theme-color" content="#f9fafb" id="meta-theme-color">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Lisanı Ecdad">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                        arabic: ['Amiri', 'serif'],
                    },
                },
            },
        };
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/theme-ecdad.css') }}">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        (function () {
            if (localStorage.getItem('lisani_theme_mode') === 'ecdad') {
                document.documentElement.classList.add('theme-ecdad', 'dark');
            }
        })();
    </script>
</head>
<body class="select-none text-base font-sans antialiased bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-neutral-100 lg:min-h-screen" id="body-main">
    @yield('content')
    <script>window.LISANI_ASSETS = { avatars: @json(asset('images/avatars')) };</script>
    <script src="{{ asset('js/preline.js') }}"></script>
    <script src="{{ asset('js/lisani-native-notifications.js') }}" defer></script>
    <script src="{{ asset('js/lisani.js') }}" defer></script>
    <script src="{{ asset('js/lisani-laravel.js') }}" defer></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
                window.HSStaticMethods.autoInit();
            }
        });
    </script>
</body>
</html>
