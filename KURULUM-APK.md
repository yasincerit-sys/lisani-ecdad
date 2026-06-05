# Lisanı Ecdad — Android APK

APK, canlı siteyi (`https://lisani-ecdad.onrender.com`) WebView içinde açar.

## Günlük hadis bildirimi (APK)

- Profil → **Bildirim Ayarları** → izin ver + saat seç
- `@capacitor/local-notifications` ile **uygulama kapalıyken** 14 güne kadar hadis planlanır
- **Test Bildirimi** → 4 saniye sonra örnek hadis gelir

## Kurulum

```bash
npm install
npx cap sync android
```

## APK derleme

```bash
npm run android:build
```

Çıktı: `android/app/build/outputs/apk/debug/app-debug.apk`

## Render deploy sonrası

Site güncellendikten sonra APK’yı yeniden derlemeniz gerekmez (uzaktan URL yükler).
Bildirim kodu değiştiyse yine `npx cap sync android` + `npm run android:build` yapın.
