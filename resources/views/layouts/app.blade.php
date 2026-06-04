<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
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
            "background_color": "#18100c",
            "theme_color": "#18100c",
            "orientation": "portrait",
            "icons": [
                { "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='36' fill='%2318100c'/%3E%3Ctext x='96' y='130' font-size='110' text-anchor='middle'%3E📖%3C/text%3E%3C/svg%3E", "sizes": "192x192", "type": "image/svg+xml" },
                { "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='96' fill='%2318100c'/%3E%3Ctext x='256' y='350' font-size='300' text-anchor='middle'%3E📖%3C/text%3E%3C/svg%3E", "sizes": "512x512", "type": "image/svg+xml" }
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
    <meta name="theme-color" content="#18100c">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Lisanı Ecdad">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="{{ asset('css/lisani.css') }}">
</head>
<body class="lisani-body select-none font-size-standard" id="body-main">
    @yield('content')
    <script src="{{ asset('js/lisani.js') }}" defer></script>
    <script src="{{ asset('js/lisani-laravel.js') }}" defer></script>
</body>
</html>
