/**
 * Capacitor APK: status bar / güvenli alan + sistem ayarları kısayolları
 */
(function () {
    'use strict';

    function isNative() {
        return (
            typeof window.Capacitor !== 'undefined' &&
            typeof window.Capacitor.isNativePlatform === 'function' &&
            window.Capacitor.isNativePlatform()
        );
    }

    function nativePlugin() {
        return window.Capacitor?.Plugins?.LisaniMic ?? null;
    }

    async function initNativeShell() {
        if (!isNative()) return;

        const platform = window.Capacitor.getPlatform?.() || '';
        document.documentElement.classList.add('lisani-capacitor-native');
        if (platform === 'android') {
            document.documentElement.classList.add('lisani-capacitor-android');
        }

        const SB = window.Capacitor?.Plugins?.StatusBar;
        if (SB) {
            try {
                await SB.setOverlaysWebView({ overlay: false });
                await SB.setBackgroundColor({ color: '#18100c' });
                await SB.setStyle({ style: 'DARK' });
            } catch (e) {}
        }
    }

    window.openNativeNotificationSettings = async function () {
        const plugin = nativePlugin();
        if (plugin?.openNotificationSettings) {
            try {
                await plugin.openNotificationSettings();
                return true;
            } catch (e) {}
        }
        if (typeof showToast === 'function') {
            showToast('Ayarlar → Uygulamalar → Lisanı Ecdad → Bildirimler → Ses açık olsun', 'info');
        }
        return false;
    };

    window.openNativeAppSettings = async function () {
        const plugin = nativePlugin();
        if (plugin?.openAppSettings) {
            try {
                await plugin.openAppSettings();
                return true;
            } catch (e) {}
        }
        if (typeof showToast === 'function') {
            showToast('Ayarlar → Uygulamalar → Lisanı Ecdad → İzinler → Mikrofon', 'info');
        }
        return false;
    };

    window.requestMicPermissionFromSettings = async function () {
        if (typeof window.ensureMicPermissionPublic === 'function') {
            const ok = await window.ensureMicPermissionPublic(true);
            if (typeof window.refreshMicPermissionUI === 'function') {
                await window.refreshMicPermissionUI();
            }
            if (typeof showToast === 'function') {
                showToast(
                    ok ? 'Mikrofon hazır. Sesli soruları çözebilirsiniz.' : 'Mikrofon izni alınamadı.',
                    ok ? 'success' : 'error'
                );
            }
            return ok;
        }

        const plugin = nativePlugin();
        if (plugin?.requestPermission) {
            try {
                const result = await plugin.requestPermission();
                const granted = !!(result && result.granted);
                if (typeof window.refreshMicPermissionUI === 'function') {
                    await window.refreshMicPermissionUI();
                }
                if (typeof showToast === 'function') {
                    showToast(
                        granted ? 'Mikrofon izni verildi.' : 'Mikrofon izni reddedildi.',
                        granted ? 'success' : 'error'
                    );
                }
                return granted;
            } catch (err) {
                if (err?.data?.granted) return true;
            }
        }
        return window.openNativeAppSettings();
    };

    window.requestNativeMicPermissionFromSettings = window.requestMicPermissionFromSettings;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNativeShell);
    } else {
        initNativeShell();
    }
})();
