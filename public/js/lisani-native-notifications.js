/**
 * Capacitor APK: günlük hadis bildirimleri (uygulama kapalıyken de çalışır).
 * Web sürümünde lisani.js içindeki setTimeout yöntemi kullanılır.
 */
(function () {
    const CHANNEL_ID = 'lisani-hadis';
    const ID_BASE = 1001;
    const DAYS_AHEAD = 14;
    const TEST_NOTIF_ID = 1999;

    function getPlugin() {
        return window.Capacitor?.Plugins?.LocalNotifications ?? null;
    }

    function isNative() {
        return (
            typeof window.Capacitor !== 'undefined' &&
            typeof window.Capacitor.isNativePlatform === 'function' &&
            window.Capacitor.isNativePlatform()
        );
    }

    async function ensureChannel(LocalNotifications) {
        try {
            await LocalNotifications.createChannel({
                id: CHANNEL_ID,
                name: 'Günün Hadisi',
                description: 'Günlük hadis hatırlatıcıları',
                importance: 4,
                visibility: 1,
                vibration: true,
            });
        } catch (e) {}
    }

    window.isNativeHadisNotifications = function () {
        return isNative() && !!getPlugin();
    };

    window.requestNativeHadisPermission = async function () {
        const LN = getPlugin();
        if (!LN || !isNative()) return false;
        await ensureChannel(LN);
        const result = await LN.requestPermissions();
        return result.display === 'granted';
    };

    window.checkNativeHadisPermission = async function () {
        const LN = getPlugin();
        if (!LN || !isNative()) return false;
        const result = await LN.checkPermissions();
        return result.display === 'granted';
    };

    window.scheduleNativeHadithNotifications = async function (getHadisForDate, getNotifTime) {
        const LN = getPlugin();
        if (!LN || !isNative()) return false;
        if (typeof getHadisForDate !== 'function' || typeof getNotifTime !== 'function') return false;

        const allowed = await window.checkNativeHadisPermission();
        if (!allowed) return false;

        await ensureChannel(LN);

        try {
            const pending = await LN.getPending();
            const toCancel = (pending.notifications || [])
                .filter((n) => (n.id >= ID_BASE && n.id < ID_BASE + DAYS_AHEAD) || n.id === TEST_NOTIF_ID)
                .map((n) => ({ id: n.id }));
            if (toCancel.length) await LN.cancel({ notifications: toCancel });
        } catch (e) {}

        const { h, m } = getNotifTime();
        const now = new Date();
        const notifications = [];
        let dayOffset = 0;
        let scheduled = 0;

        while (scheduled < DAYS_AHEAD) {
            const target = new Date();
            target.setHours(h, m, 0, 0);
            target.setDate(target.getDate() + dayOffset);
            dayOffset += 1;
            if (target <= now) continue;

            const hadis = getHadisForDate(target);
            notifications.push({
                id: ID_BASE + scheduled,
                title: 'Günün Hadisi 📖',
                body: hadis.turkce + '\n— ' + hadis.kaynak,
                schedule: { at: target },
                channelId: CHANNEL_ID,
                smallIcon: 'ic_launcher',
            });
            scheduled += 1;
        }

        if (!notifications.length) return false;
        await LN.schedule({ notifications });
        return true;
    };

    window.showNativeHadisTestNotification = async function (getHadisForDate) {
        const LN = getPlugin();
        if (!LN || !isNative()) return false;
        if (!(await window.checkNativeHadisPermission())) return false;
        await ensureChannel(LN);

        const hadis = typeof getHadisForDate === 'function' ? getHadisForDate(new Date()) : { turkce: 'Test', kaynak: '' };
        const at = new Date(Date.now() + 4000);

        try {
            await LN.cancel({ notifications: [{ id: TEST_NOTIF_ID }] });
        } catch (e) {}

        await LN.schedule({
            notifications: [
                {
                    id: TEST_NOTIF_ID,
                    title: 'Günün Hadisi 📖',
                    body: hadis.turkce + '\n— ' + hadis.kaynak,
                    schedule: { at },
                    channelId: CHANNEL_ID,
                    smallIcon: 'ic_launcher',
                },
            ],
        });
        return true;
    };

    window.rescheduleHadithNotifications = async function () {
        if (!isNative()) return;
        if (!(await window.checkNativeHadisPermission())) return;
        if (typeof window._scheduleHadithNotifications === 'function') {
            await window._scheduleHadithNotifications();
        }
    };

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            window.rescheduleHadithNotifications();
        }
    });
})();
