/**
 * Laravel + MySQL API köprüsü (Firebase yerine)
 */
(function () {
    function getXsrfCookie() {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function getMetaCsrf() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    /** Laravel önce X-CSRF-TOKEN'a bakar; eski meta değeri cookie'yi ezer. Cookie varsa sadece X-XSRF-TOKEN gönder. */
    function csrfHeaders() {
        const xsrf = getXsrfCookie();
        if (xsrf) {
            return { 'X-XSRF-TOKEN': xsrf };
        }
        const meta = getMetaCsrf();
        if (meta) {
            return { 'X-CSRF-TOKEN': meta };
        }
        return {};
    }

    function applyCsrfToken(token) {
        if (!token) return;
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) meta.setAttribute('content', token);
    }

    async function refreshMetaCsrf() {
        try {
            const res = await fetch('/api/csrf-token', { credentials: 'same-origin' });
            const data = await res.json();
            applyCsrfToken(data.token);
        } catch (e) {}
    }

    async function ensureCsrfCookie() {
        if (getXsrfCookie()) return;
        await refreshMetaCsrf();
    }

    async function apiFetch(url, options = {}) {
        await ensureCsrfCookie();

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...csrfHeaders(),
            ...(options.headers || {}),
        };

        const res = await fetch(url, {
            credentials: 'same-origin',
            ...options,
            headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status === 419) {
                await refreshMetaCsrf();
                throw new Error('Oturum süresi doldu. Sayfayı yenileyip (Ctrl+F5) tekrar giriş yapın.');
            }
            if (res.status === 401) {
                if (!options.authProbe) {
                    window._loginDone = false;
                }
                throw new Error('Oturumunuz yok veya süresi doldu. Lütfen tekrar giriş yapın.');
            }
            const errValues = data.errors ? Object.values(data.errors).flat() : [];
            const msg =
                errValues[0] ||
                data.errors?.sinif_kodu?.[0] ||
                data.message ||
                'İstek başarısız.';
            throw new Error(msg);
        }
        return data;
    }

    window.apiFetch = apiFetch;

    function userFromApi(u) {
        const avatar =
            typeof window.normalizeAvatarValue === 'function'
                ? window.normalizeAvatarValue(u.avatar, u.uid)
                : u.avatar || '';
        return {
            uid: u.uid,
            name: u.name,
            email: u.email,
            avatar: avatar,
            role: u.role || 'ogrenci',
            sinif: u.sinif,
            sinifKodu: u.sinifKodu,
            totalScore: u.totalScore || 0,
            tennisUnlocked: !!u.tennisUnlocked,
            password: '',
        };
    }

    window._firebaseReady = false;
    window._db = null;
    window._auth = null;

    window._waitFirebase = async () => {};

    window._saveUserLocally = function (user) {
        try {
            const saved = localStorage.getItem('lisani_all_users');
            const users = saved ? JSON.parse(saved) : [];
            const idx = users.findIndex((u) => u.name.toLowerCase() === user.name.toLowerCase());
            const merged = idx >= 0 ? { ...users[idx], ...user } : { ...user };
            if (!merged.password && idx >= 0 && users[idx].password) {
                merged.password = users[idx].password;
            }
            if (idx >= 0) users[idx] = merged;
            else users.push(merged);
            localStorage.setItem('lisani_all_users', JSON.stringify(users));
        } catch (e) {}
    };

    function readSavedSessionUser() {
        try {
            const raw = localStorage.getItem('lisani_session_user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function resolveStoredPassword(userName, savedUser) {
        if (savedUser?.password) return savedUser.password;
        try {
            const all = JSON.parse(localStorage.getItem('lisani_all_users') || '[]');
            const found = all.find(
                (u) => u.name && u.name.toLowerCase() === (userName || '').toLowerCase()
            );
            return found?.password || '';
        } catch (e) {
            return '';
        }
    }

    async function reauthWithStoredCredentials(savedUser) {
        const password = resolveStoredPassword(savedUser?.name, savedUser);
        if (!savedUser?.name || !password) return false;

        const data = await apiFetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                name: savedUser.name,
                password,
                remember: true,
            }),
        });
        const user = userFromApi(data.user);
        user.password = password;
        window._loginDone = true;
        currentUserRole = user.role;
        applyCsrfToken(data.csrf_token);
        _saveUserLocally(user);
        loginSuccess(user, true, true);
        return true;
    }

    const origSubmitLogin = window.submitLogin;
    window.submitLogin = async function () {
        playClickSound();
        const usernameInput = document.getElementById('login-username').value.trim();
        const passwordInput = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('login-remember-me')
            ? document.getElementById('login-remember-me').checked
            : false;

        if (!usernameInput || !passwordInput) {
            showToast('İsim ve şifre boş bırakılamaz.', 'error');
            return;
        }

        showLoading('Giriş yapılıyor...');
        try {
            const data = await apiFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    name: usernameInput,
                    password: passwordInput,
                    remember: rememberMe || localStorage.getItem('lisani_remember_me_pref') !== 'false',
                }),
            });
            const user = userFromApi(data.user);
            user.password = passwordInput;
            window._loginDone = true;
            currentUserRole = user.role;
            _saveUserLocally(user);
            applyCsrfToken(data.csrf_token);
            hideLoading();
            const keepOpen = rememberMe || localStorage.getItem('lisani_remember_me_pref') !== 'false';
            loginSuccess(user, keepOpen);
            if (keepOpen && passwordInput) {
                try {
                    const sessionRaw = localStorage.getItem('lisani_session_user');
                    const session = sessionRaw ? JSON.parse(sessionRaw) : { ...user };
                    session.password = passwordInput;
                    localStorage.setItem('lisani_session_user', JSON.stringify(session));
                } catch (e) {}
            }
        } catch (e) {
            hideLoading();
            if (!window._loginDone) showToast(e.message, 'error');
        }
    };

    const origSubmitRegister = window.submitRegister;
    window.submitRegister = async function () {
        playClickSound();
        const name = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'ogrenci';
        const sinif =
            role === 'hoca'
                ? document.getElementById('reg-sinif')
                    ? document.getElementById('reg-sinif').value.trim()
                    : ''
                : '';
        const sinifKodu =
            role === 'ogrenci'
                ? document.getElementById('reg-sinif-kodu')
                    ? document.getElementById('reg-sinif-kodu').value.trim().toUpperCase()
                    : ''
                : '';

        if (!name || !password || !passwordConfirm) {
            showToast('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        if (password !== passwordConfirm) {
            showToast('Şifreler eşleşmiyor.', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Şifre en az 6 karakter olmalı.', 'error');
            return;
        }

        showLoading('Hesap oluşturuluyor...');
        try {
            const data = await apiFetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    password,
                    role,
                    sinif,
                    sinif_kodu: sinifKodu || null,
                    avatar: typeof selectedAvatarValue !== 'undefined' ? selectedAvatarValue : (typeof window.DEFAULT_AVATAR !== 'undefined' ? window.DEFAULT_AVATAR : ''),
                    remember: true,
                }),
            });
            const user = userFromApi(data.user);
            user.password = password;
            window._loginDone = true;
            currentUserRole = role;
            _saveUserLocally(user);
            applyCsrfToken(data.csrf_token);
            hideLoading();
            const sinifMsg = sinifKodu ? ' Sınıfa kaydedildiniz.' : '';
            showToast('Hesap oluşturuldu!' + sinifMsg, 'success');
            loginSuccess(user, true);
            if (role === 'ogrenci') setTimeout(() => loadOgrenciOdevler(), 600);
        } catch (e) {
            hideLoading();
            showToast(e.message, 'error');
        }
    };

    window._firebaseLoginBg = async () => {};
    window._firebaseRegisterBg = async () => {};

    const origLogout = window.logoutApp;
    window.logoutApp = async function () {
        playClickSound();
        window._manualLogout = true;
        window._loginDone = false;
        _sessionRestorePromise = null;
        currentUser = null;
        window.currentUser = null;
        currentUserRole = null;

        try {
            localStorage.removeItem('lisani_session_user');
            localStorage.removeItem('lisani_remember_me');
            const data = await apiFetch('/api/logout', { method: 'POST', body: '{}' });
            applyCsrfToken(data.csrf_token);
        } catch (e) {}

        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        const ru = document.getElementById('reg-username');
        if (ru) ru.value = '';
        const rp = document.getElementById('reg-password');
        if (rp) rp.value = '';
        const rpc = document.getElementById('reg-password-confirm');
        if (rpc) rpc.value = '';

        document.getElementById('main-application-flow').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        toggleAuthTab('login');
        showToast('Çıkış yapıldı.', 'info');
    };

    window.sinifaKatil = async function (sinifKodu) {
        if (!currentUser || !sinifKodu || sinifKodu.trim().length < 4) {
            showToast('Geçerli bir sınıf kodu girin.', 'error');
            return;
        }
        const kod = sinifKodu.trim().toUpperCase();
        showLoading('Sınıfa katılınıyor...');
        try {
            const data = await apiFetch('/api/sinif/' + encodeURIComponent(kod) + '/join', {
                method: 'POST',
                body: '{}',
            });
            const sd = data.sinif;
            _saveLocalSinif(kod, sd);
            _saveUserLocally(data.user);
            currentUser = userFromApi(data.user);
            window.currentUser = currentUser;
            hideLoading();
            refreshMesajBadge();
            showToast('✅ ' + sd.sinifAdi + ' sınıfına katıldınız!', 'success');
            const modal = document.getElementById('sinif-katil-modal');
            if (modal) modal.remove();
        } catch (e) {
            hideLoading();
            showToast(e.message, 'error');
        }
    };

    const ODEV_TEST_OPTIONS = ['Test 1', 'Test 2', 'Test 3', 'Genel'];

    const ODEV_LEVEL_LABELS = {
        1: 'Seviye 1: Harfler & Sayılar',
        2: 'Seviye 2: Yazım Kuralları & Okuma',
        3: 'Seviye 3: Kelime Kökü & Kaynak Dil',
    };

    function formatOdevLabel(o) {
        if (o.label) return o.label;
        if (o.level && o.test) return `Seviye ${o.level} — ${o.test}`;
        return o.icerik || 'Ödev';
    }

    function isTestOdev(o) {
        return o && (o.type === 'test' || (o.level && o.test));
    }

    function odevPickerHtml(hocaUid) {
        return `
            <p class="text-[10px] theme-text-muted mb-3">Aşağıdan seviye ve test seçerek ödev gönderin.</p>
            <div id="odev-test-picker" data-hoca-uid="${hocaUid}"></div>`;
    }

    function renderOdevPickerLevelCards() {
        return [1, 2, 3]
            .map(
                (l) => `
            <button type="button" onclick="selectOdevPickerLevel(${l})" class="lisani-glass-panel lisani-test-btn lisani-test-level-card rounded-2xl p-3.5 text-left flex items-center justify-between w-full min-w-0">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-2xl lisani-level-badge--${l} flex items-center justify-center font-black text-sm border shrink-0">${l}</div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-extrabold theme-text-main leading-snug">${ODEV_LEVEL_LABELS[l]}</h4>
                    </div>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 theme-text-muted shrink-0"></i>
            </button>`
            )
            .join('');
    }

    function renderOdevPickerTestCards(level) {
        const cards = ODEV_TEST_OPTIONS.map(
            (testName) => `
            <button type="button" onclick="odevVerFromTest(${level}, '${testName.replace(/'/g, "\\'")}')" class="lisani-glass-panel lisani-test-btn lisani-test-list-card rounded-2xl p-3.5 text-left flex items-center justify-between w-full min-w-0">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="lisani-test-list-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <i data-lucide="${testName === 'Genel' ? 'award' : 'file-question'}" class="w-4 h-4"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-extrabold theme-text-main">${testName === 'Genel' ? 'Genel Değerlendirme 🏆' : testName}</h4>
                        <p class="text-[10px] theme-text-muted mt-0.5">${ODEV_LEVEL_LABELS[level]}</p>
                    </div>
                </div>
                <span class="lisani-test-go-chip shrink-0 ml-2">Ödev Ver</span>
            </button>`
        );
        return cards.join('');
    }

    window.backOdevPickerLevels = function () {
        const levels = document.getElementById('odev-picker-levels');
        const tests = document.getElementById('odev-picker-tests');
        if (levels) levels.classList.remove('hidden');
        if (tests) tests.classList.add('hidden');
    };

    window.selectOdevPickerLevel = function (level) {
        const levels = document.getElementById('odev-picker-levels');
        const tests = document.getElementById('odev-picker-tests');
        const list = document.getElementById('odev-picker-tests-list');
        if (!levels || !tests || !list) return;
        list.innerHTML = renderOdevPickerTestCards(level);
        levels.classList.add('hidden');
        tests.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.initOdevTestPicker = function () {
        const root = document.getElementById('odev-test-picker');
        if (!root) return;
        root.innerHTML = `
            <div id="odev-picker-levels" class="grid grid-cols-1 gap-2">${renderOdevPickerLevelCards()}</div>
            <div id="odev-picker-tests" class="hidden space-y-2">
                <button type="button" onclick="backOdevPickerLevels()" class="lisani-glass-action lisani-glass-action--compact flex items-center gap-2 text-xs font-bold w-fit">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span>Seviyelere dön</span>
                </button>
                <div id="odev-picker-tests-list" class="grid grid-cols-1 gap-2"></div>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.odevVerFromTest = function (level, test) {
        const user = currentUser || window.currentUser;
        const uid = user?.id || user?.uid;
        if (!uid) {
            showToast('Giriş gerekli.', 'error');
            return;
        }
        window.odevVer(uid, level, test);
    };

    window.odevVer = function (hocaUid, levelArg, testArg) {
        const levelEl = document.getElementById('odev-level');
        const testEl = document.getElementById('odev-test');
        const level = levelArg || (levelEl ? parseInt(levelEl.value, 10) : 0);
        const test = testArg || (testEl ? testEl.value : '');
        if (!level || !test) {
            showToast('Lütfen seviye ve test seçin.', 'error');
            return;
        }
        apiFetch('/api/sinif/odev', {
            method: 'POST',
            body: JSON.stringify({ level, test }),
        })
            .then((data) => {
                _saveLocalSinif(hocaUid, data.sinif);
                showToast('Test ödevi gönderildi!', 'success');
                loadHocaPanel(hocaUid);
            })
            .catch((e) => showToast(e.message, 'error'));
    };

    function statusBadge(status) {
        const map = {
            aktif: { label: 'Aktif', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
            orta: { label: 'Orta', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
            pasif: { label: 'Pasif', cls: 'bg-stone-500/15 text-stone-400 border-stone-500/30' },
        };
        const s = map[status] || map.pasif;
        return `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.cls}">${s.label}</span>`;
    }

    function formatLastActive(iso) {
        if (!iso) return 'Henüz veri yok';
        try {
            const d = new Date(iso);
            const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
            if (diff === 0) return 'Bugün';
            if (diff === 1) return 'Dün';
            if (diff < 7) return diff + ' gün önce';
            return d.toLocaleDateString('tr-TR');
        } catch (e) {
            return '—';
        }
    }

    function renderOgrenciAnalizTable(analiz) {
        const a = analiz || { toplamDogru: 0, toplamYanlis: 0, sinavlar: [] };
        const sinavlar = a.sinavlar || [];

        if (sinavlar.length === 0) {
            return '<p class="text-[9px] theme-text-muted py-2 text-center">Henüz çözülmüş test kaydı yok.</p>';
        }

        let rows = '';
        sinavlar.forEach((s) => {
            const pct = s.percent ?? 0;
            const pctCls =
                pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-blue-400' : 'text-amber-400';
            rows += `<tr class="border-b theme-border/50">
                <td class="py-1.5 pr-1 text-[9px] theme-text-muted whitespace-nowrap">${s.date || '—'}</td>
                <td class="py-1.5 pr-1 text-[9px] theme-text-main">S${s.level}</td>
                <td class="py-1.5 pr-1 text-[9px] theme-text-main truncate max-w-[72px]">${s.test || '—'}</td>
                <td class="py-1.5 px-1 text-[9px] font-bold text-emerald-400 text-center">${s.correct ?? 0}</td>
                <td class="py-1.5 px-1 text-[9px] font-bold text-red-400 text-center">${s.wrong ?? 0}</td>
                <td class="py-1.5 pl-1 text-[9px] font-bold ${pctCls} text-right">%${pct}</td>
            </tr>`;
        });

        return `
        <div class="mt-2 p-2 rounded-xl bg-black/25 border theme-border/50">
            <p class="text-[9px] font-bold theme-text-muted mb-2">
                Özet: <span class="text-emerald-400">${a.toplamDogru} doğru</span> ·
                <span class="text-red-400">${a.toplamYanlis} yanlış</span> ·
                ${sinavlar.length} kayıtlı sınav
            </p>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[8px] theme-text-muted uppercase">
                            <th class="pb-1">Tarih</th>
                            <th class="pb-1">Sv</th>
                            <th class="pb-1">Test</th>
                            <th class="pb-1 text-center">✓</th>
                            <th class="pb-1 text-center">✗</th>
                            <th class="pb-1 text-right">%</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    }

    window.toggleOgrenciRapor = function (uid) {
        const el = document.getElementById('ogrenci-rapor-' + uid);
        if (el) el.classList.toggle('hidden');
    };

    window._renderHocaPanel = function (uid, payload) {
        const sinif = payload.sinif || payload;
        const ozet = payload.ozet || {};
        const ogrenciler = payload.ogrenciler || [];

        let ogrencilerHTML = '';
        if (ogrenciler.length > 0) {
            ogrenciler.forEach((o) => {
                const barW = Math.min(100, o.avgSuccess || 0);
                const analiz = o.analiz || {};
                const lastTest = o.lastTestLabel
                    ? `<p class="text-[9px] theme-text-muted mt-1 truncate">Son: ${o.lastTestLabel}${o.lastTestPercent != null ? ' · %' + o.lastTestPercent : ''}</p>`
                    : '<p class="text-[9px] theme-text-muted mt-1">Henüz sınav çözmedi</p>';
                ogrencilerHTML += `
                <div class="lisani-glass-panel rounded-2xl p-3.5 mb-2.5 border theme-border">
                    <div class="flex items-start gap-3">
                        ${typeof window.avatarSlotHtml === 'function' ? window.avatarSlotHtml(o.avatar) : `<span class="text-2xl flex-shrink-0">${o.avatar || '🎒'}</span>`}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-xs font-extrabold theme-text-main truncate">${o.name}</span>
                                ${statusBadge(o.activityStatus)}
                            </div>
                            <p class="text-[9px] theme-text-muted mt-0.5">${formatLastActive(o.lastActiveAt)}</p>
                            ${lastTest}
                            <div class="mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden">
                                <div class="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" style="width:${barW}%"></div>
                            </div>
                            <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] font-bold">
                                <span class="text-amber-400">${o.totalXp || 0} XP</span>
                                <span class="theme-text-muted">${o.testsCount || 0} sınav</span>
                                <span class="text-emerald-400">%${o.avgSuccess || 0} ort.</span>
                                <span class="text-emerald-400">✓ ${analiz.toplamDogru ?? 0}</span>
                                <span class="text-red-400">✗ ${analiz.toplamYanlis ?? 0}</span>
                            </div>
                            <button type="button" onclick="toggleOgrenciRapor('${o.uid}')" class="mt-2 w-full py-1.5 lisani-glass-action rounded-lg text-[9px] font-bold theme-text-main flex items-center justify-center gap-1">
                                <i data-lucide="file-bar-chart" class="w-3 h-3"></i>
                                Analiz Raporu
                            </button>
                            <div id="ogrenci-rapor-${o.uid}" class="hidden">
                                ${renderOgrenciAnalizTable(analiz)}
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            ogrencilerHTML =
                '<div class="text-center py-8"><p class="text-3xl mb-2">👥</p><p class="text-xs theme-text-muted">Henüz öğrenci yok.<br>Aşağıdaki sınıf kodunu öğrencilerinize verin.</p></div>';
        }

        let odevlerHTML = '';
        const odevler = sinif.odevler || [];
        if (odevler.length > 0) {
            odevler
                .slice(-3)
                .reverse()
                .forEach((o) => {
                    const lbl = formatOdevLabel(o);
                    odevlerHTML += `<div class="py-1.5 border-b theme-border last:border-0">
                        <p class="text-xs theme-text-main flex items-center gap-1.5"><i data-lucide="clipboard-list" class="w-3.5 h-3.5 theme-primary-color"></i>${escapeHtml(lbl)}</p>
                        <p class="text-[10px] theme-text-muted">${o.tarih || ''}</p>
                    </div>`;
                });
        }

        let panel = document.getElementById('hoca-panel-modal');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'hoca-panel-modal';
            panel.className = 'lisani-panel-overlay absolute inset-0 z-50 flex flex-col theme-bg-phone';
            const host = document.getElementById('app-container') || document.body;
            host.appendChild(panel);
        }

        panel.innerHTML = `
        <div class="flex flex-col h-full w-full max-w-none lg:max-w-4xl lg:mx-auto">
            <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b theme-border">
                <div>
                    <h2 class="text-sm font-extrabold theme-text-main">📊 Öğrenci Takip Paneli</h2>
                    <p class="text-[10px] theme-text-muted">${sinif.sinifAdi || 'Sınıf'}</p>
                </div>
                <button onclick="document.getElementById('hoca-panel-modal').remove()" class="w-9 h-9 rounded-full theme-light-bg flex items-center justify-center theme-text-muted hover:opacity-80">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div class="grid grid-cols-2 gap-2">
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Öğrenci</p>
                        <p class="text-lg font-black text-amber-400">${ozet.ogrenciSayisi ?? ogrenciler.length}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Aktif (7 gün)</p>
                        <p class="text-lg font-black text-emerald-400">${ozet.aktifOgrenci ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Sınıf Ort.</p>
                        <p class="text-lg font-black text-blue-400">%${ozet.ortalamaBasari ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Toplam XP</p>
                        <p class="text-lg font-black theme-primary-color">${ozet.toplamXp ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center col-span-2">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Sınıf test özeti</p>
                        <p class="text-[10px] font-bold mt-1">
                            <span class="text-emerald-400">${ozet.toplamDogru ?? 0} doğru</span>
                            <span class="theme-text-muted mx-1">·</span>
                            <span class="text-red-400">${ozet.toplamYanlis ?? 0} yanlış</span>
                            <span class="theme-text-muted mx-1">·</span>
                            <span class="theme-text-main">${ozet.toplamSinav ?? 0} sınav</span>
                        </p>
                    </div>
                </div>
                <div class="glass-card rounded-2xl p-4 border border-amber-500/20">
                    <p class="text-[10px] theme-text-muted mb-1">Sınıf kodu (öğrencilere verin)</p>
                    <p class="text-2xl font-black text-amber-400 font-mono tracking-widest text-center">${sinif.kisaKod || '—'}</p>
                </div>
                <div>
                    <h3 class="text-xs font-extrabold theme-text-main mb-1 flex items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4 text-amber-400"></i>
                        Öğrenci Durumları & Analiz
                    </h3>
                    <p class="text-[9px] theme-text-muted mb-2">Her öğrencide «Analiz Raporu» ile test detaylarını görün.</p>
                    ${ogrencilerHTML}
                </div>
                ${odevlerHTML ? `<div><h3 class="text-xs font-extrabold theme-text-main mb-2">📋 Son Ödevler</h3><div class="glass-card rounded-xl p-3">${odevlerHTML}</div></div>` : ''}
                <div class="glass-card rounded-2xl p-4">
                    <h3 class="text-xs font-extrabold theme-text-main mb-2">📝 Yeni Test Ödevi</h3>
                    ${odevPickerHtml(uid)}
                </div>
            </div>
        </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        initOdevTestPicker();
    };

    window.forceAuthScreen = function () {
        window._loginDone = false;
        window._manualLogout = false;
        currentUser = null;
        window.currentUser = null;
        currentUserRole = null;
        const auth = document.getElementById('auth-container');
        const main = document.getElementById('main-application-flow');
        if (main) main.classList.add('hidden');
        if (auth) auth.classList.remove('hidden');
        if (typeof toggleAuthTab === 'function') toggleAuthTab('login');
    };

    async function ensureServerSession() {
        if (window._loginDone && (currentUser || window.currentUser)) {
            const local = currentUser || window.currentUser;
            try {
                const data = await apiFetch('/api/user');
                if (data.user) {
                    const user = userFromApi(data.user);
                    window._loginDone = true;
                    currentUser = user;
                    window.currentUser = user;
                    currentUserRole = user.role;
                    return user;
                }
            } catch (e) {}
            return local;
        }
        try {
            const data = await apiFetch('/api/user');
            if (data.user) {
                const user = userFromApi(data.user);
                window._loginDone = true;
                currentUser = user;
                window.currentUser = user;
                currentUserRole = user.role;
                return user;
            }
        } catch (e) {}
        return null;
    }

    window.loadHocaPanel = async function (uid) {
        showLoading('Öğrenciler yükleniyor...');
        try {
            const sessionUser = await ensureServerSession();
            if (!sessionUser) {
                hideLoading();
                showToast('Sunucu oturumu yok. Tekrar giriş yapın (Demo Hoca / hoca123).', 'error');
                forceAuthScreen();
                return;
            }
            if (sessionUser.role !== 'hoca') {
                hideLoading();
                showToast('Bu panel sadece hoca hesapları içindir.', 'error');
                return;
            }
            const data = await apiFetch('/api/hoca/ogrenci-takip');
            _saveLocalSinif(uid, data.sinif);
            hideLoading();
            window._renderHocaPanel(uid, data);
        } catch (e) {
            hideLoading();
            if ((e.message || '').includes('Oturum')) {
                forceAuthScreen();
            }
            showToast(e.message || 'Panel yüklenemedi.', 'error');
        }
    };

    window.showHocaPanel = async function () {
        const user = await ensureServerSession();
        if (!user || user.role !== 'hoca') {
            if (currentUserRole === 'hoca' && !user) {
                showToast('Lütfen çıkış yapıp Demo Hoca ile tekrar giriş yapın.', 'error');
                forceAuthScreen();
                return;
            }
            showToast('Bu ekran sadece hocalar içindir.', 'error');
            return;
        }
        loadHocaPanel(user.uid);
    };

    function renderYoneticiPanel(data) {
        const ozet = data.ozet || {};
        const hocalar = data.hocalar || [];
        const siniflar = data.siniflar || [];

        let hocalarHTML = '';
        if (hocalar.length > 0) {
            hocalarHTML = hocalar
                .map(
                    (h) => `
                <div class="lisani-glass-panel rounded-xl p-3 border theme-border mb-2">
                    <div class="flex items-center gap-3">
                        ${typeof window.avatarSlotHtml === 'function' ? window.avatarSlotHtml(h.avatar) : `<span class="text-xl">${h.avatar || '📚'}</span>`}
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-extrabold theme-text-main truncate">${escapeHtml(h.name)}</p>
                            <p class="text-[9px] theme-text-muted truncate">${escapeHtml(h.sinifAdi || 'Sınıf yok')}${h.kisaKod ? ' · ' + escapeHtml(h.kisaKod) : ''}</p>
                            <p class="text-[9px] theme-text-muted mt-0.5">${h.ogrenciSayisi ?? 0} öğrenci · ${h.odevSayisi ?? 0} ödev</p>
                        </div>
                    </div>
                </div>`
                )
                .join('');
        } else {
            hocalarHTML =
                '<p class="text-[10px] theme-text-muted text-center py-4">Henüz kayıtlı hoca yok.</p>';
        }

        let siniflarHTML = '';
        if (siniflar.length > 0) {
            siniflarHTML = siniflar
                .map(
                    (s) => `
                <div class="lisani-glass-panel rounded-xl p-3 border theme-border mb-2">
                    <p class="text-xs font-extrabold theme-text-main">${escapeHtml(s.sinifAdi || '—')}</p>
                    <p class="text-[9px] theme-text-muted font-mono">${escapeHtml(s.kisaKod || '—')}</p>
                    <p class="text-[9px] theme-text-muted mt-1">${escapeHtml(s.hocaAdi || 'Hoca atanmamış')} · ${s.ogrenciSayisi ?? 0} öğrenci · ${s.odevSayisi ?? 0} ödev</p>
                </div>`
                )
                .join('');
        } else {
            siniflarHTML =
                '<p class="text-[10px] theme-text-muted text-center py-4">Henüz sınıf oluşturulmamış.</p>';
        }

        let panel = document.getElementById('yonetici-panel-modal');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'yonetici-panel-modal';
            panel.className = 'lisani-panel-overlay absolute inset-0 z-50 flex flex-col theme-bg-phone';
            const host = document.getElementById('app-container') || document.body;
            host.appendChild(panel);
        }

        panel.innerHTML = `
        <div class="flex flex-col h-full w-full max-w-none lg:max-w-4xl lg:mx-auto">
            <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b theme-border">
                <div>
                    <h2 class="text-sm font-extrabold theme-text-main">👑 Uygulama Yönetimi</h2>
                    <p class="text-[10px] theme-text-muted">Tüm hocalar, sınıflar ve kullanıcı özeti</p>
                </div>
                <button onclick="document.getElementById('yonetici-panel-modal').remove()" class="w-9 h-9 rounded-full theme-light-bg flex items-center justify-center theme-text-muted hover:opacity-80">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div class="grid grid-cols-2 gap-2">
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Öğrenci</p>
                        <p class="text-lg font-black text-amber-400">${ozet.ogrenciSayisi ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Hoca</p>
                        <p class="text-lg font-black text-violet-400">${ozet.hocaSayisi ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Sınıf</p>
                        <p class="text-lg font-black text-blue-400">${ozet.sinifSayisi ?? 0}</p>
                    </div>
                    <div class="glass-card rounded-xl p-3 text-center">
                        <p class="text-[9px] theme-text-muted uppercase font-bold">Toplam Kullanıcı</p>
                        <p class="text-lg font-black theme-primary-color">${ozet.kullaniciSayisi ?? 0}</p>
                    </div>
                </div>
                <button type="button" onclick="document.getElementById('yonetici-panel-modal')?.remove(); if(typeof openHocaDashboard==='function') openHocaDashboard();" class="lisani-glass-action w-full py-2.5 rounded-xl text-xs font-bold">Performans Dashboard'a Git</button>
                <div>
                    <h3 class="text-xs font-extrabold theme-text-main mb-2 flex items-center gap-2">
                        <i data-lucide="graduation-cap" class="w-4 h-4 text-violet-400"></i>
                        Hocalar
                    </h3>
                    ${hocalarHTML}
                </div>
                <div>
                    <h3 class="text-xs font-extrabold theme-text-main mb-2 flex items-center gap-2">
                        <i data-lucide="school" class="w-4 h-4 text-blue-400"></i>
                        Sınıflar
                    </h3>
                    ${siniflarHTML}
                </div>
            </div>
        </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    window.showYoneticiPanel = async function () {
        const user = await ensureServerSession();
        if (!user || user.role !== 'yonetici') {
            if (currentUserRole === 'yonetici' && !user) {
                showToast('Lütfen çıkış yapıp yönetici hesabıyla tekrar giriş yapın.', 'error');
                forceAuthScreen();
                return;
            }
            showToast('Bu ekran sadece uygulama yöneticileri içindir.', 'error');
            return;
        }
        showLoading('Yönetim paneli yükleniyor...');
        try {
            const data = await apiFetch('/api/yonetici/overview');
            hideLoading();
            renderYoneticiPanel(data);
        } catch (e) {
            hideLoading();
            showToast(e.message || 'Panel yüklenemedi.', 'error');
        }
    };

    const origInitSinif = window._initSinif;
    window._initSinif = function (hocaUid) {
        let sinif = _getLocalSinif(hocaUid);
        if (!sinif) {
            apiFetch('/api/sinif')
                .then((data) => {
                    _saveLocalSinif(hocaUid, data.sinif);
                })
                .catch(() => {});
            sinif = {
                hocaId: hocaUid,
                hocaAdi: currentUser?.name || '',
                sinifAdi: currentUser?.sinif || "Sınıf",
                kisaKod: '...',
                ogrenciler: [],
                odevler: [],
            };
        }
        return sinif;
    };

    function applyProfileToUI(user, avatarHtml) {
        const avatar = avatarHtml ?? user.avatar;
        document.getElementById('settings-profile-name').innerText = user.name;
        const roleBadge =
            typeof window.getSettingsRoleBadgeHtml === 'function'
                ? window.getSettingsRoleBadgeHtml(user.role || currentUserRole)
                : (user.role || currentUserRole) === 'yonetici'
                  ? '👑 Yönetici'
                  : (user.role || currentUserRole) === 'hoca'
                    ? '📚 Hoca'
                    : '🎒 Öğrenci';
        document.getElementById('settings-profile-sub').innerHTML = roleBadge;
        document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${user.name}! 👋`;
        if (typeof window.updateHomeRoleBadge === 'function') {
            window.updateHomeRoleBadge(user.role || currentUserRole);
        }

        const avatarContainers = [
            document.getElementById('home-avatar-display'),
            document.getElementById('settings-avatar-container'),
        ];
        avatarContainers.forEach((container) => {
            if (typeof window.applyAvatarToContainer === 'function') {
                const normalized =
                    typeof window.normalizeAvatarValue === 'function'
                        ? window.normalizeAvatarValue(avatar)
                        : avatar;
                window.applyAvatarToContainer(container, normalized);
            } else if (container) {
                container.innerHTML = avatar;
            }
        });
    }

    window.saveProfileChanges = async function () {
        playClickSound();

        const nameInput = document.getElementById('edit-profile-username').value.trim();
        const emailInput = document.getElementById('edit-profile-email').value.trim();
        const avatar =
            typeof editAvatarValue !== 'undefined' ? editAvatarValue : currentUser?.avatar || '🐱';

        if (!nameInput) {
            showToast('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        showLoading('Profil kaydediliyor...');
        try {
            const data = await apiFetch('/api/profile', {
                method: 'POST',
                body: JSON.stringify({
                    name: nameInput,
                    email: emailInput || currentUser?.email,
                    avatar,
                }),
            });

            const user = userFromApi(data.user);
            if (currentUser?.password) user.password = currentUser.password;

            currentUser = user;
            window.currentUser = user;
            _saveUserLocally(user);

            try {
                if (localStorage.getItem('lisani_remember_me') === 'true') {
                    localStorage.setItem('lisani_session_user', JSON.stringify(user));
                }
            } catch (e) {}

            applyProfileToUI(user, avatar);
            hideLoading();
            showToast('Profil güncellendi.', 'success');
            closeEditProfile();
        } catch (e) {
            hideLoading();
            showToast(e.message || 'Profil kaydedilemedi.', 'error');
        }
    };

    let _sessionRestorePromise = null;
    let _mesajBadgeTimer = null;
    let _mesajBadgeInFlight = null;

    function shouldKeepSessionOpen() {
        if (localStorage.getItem('lisani_remember_me_pref') === 'false') return false;
        if (localStorage.getItem('lisani_remember_me') === 'true') return true;
        return localStorage.getItem('lisani_remember_me_pref') !== 'false';
    }

    async function trySessionRestore() {
        if (window._manualLogout) return;
        if (_sessionRestorePromise) return _sessionRestorePromise;

        _sessionRestorePromise = (async () => {
            const keepOpen = shouldKeepSessionOpen();
            const savedUser = keepOpen ? readSavedSessionUser() : null;

            if (keepOpen && savedUser?.name && !window._loginDone) {
                try {
                    loginSuccess(savedUser, true, true);
                } catch (e) {}
            }

            let serverUser = null;
            try {
                const data = await apiFetch('/api/user', { authProbe: true });
                serverUser = data.user || null;
            } catch (e) {}

            if (serverUser) {
                const user = userFromApi(serverUser);
                user.password = resolveStoredPassword(user.name, savedUser);
                window._loginDone = true;
                currentUserRole = user.role;
                if (user.password) _saveUserLocally(user);
                loginSuccess(user, keepOpen || !!savedUser, true);
                return;
            }

            if (!keepOpen || !savedUser?.name) {
                if (!window._loginDone) return;
                return;
            }

            try {
                const ok = await reauthWithStoredCredentials(savedUser);
                if (!ok && !window._loginDone) {
                    document.getElementById('auth-container')?.classList.remove('hidden');
                    document.getElementById('main-application-flow')?.classList.add('hidden');
                }
            } catch (e) {
                if (!window._loginDone) {
                    document.getElementById('auth-container')?.classList.remove('hidden');
                    document.getElementById('main-application-flow')?.classList.add('hidden');
                }
            }
        })();

        return _sessionRestorePromise;
    }

    window.restoreServerSession = trySessionRestore;
    window._resolveStoredPassword = resolveStoredPassword;

    window.loadProgressFromServer = async function () {
        if (currentUserRole === 'yonetici' || currentUserRole === 'hoca' || !window._loginDone) {
            return null;
        }
        document.querySelectorAll('.lisani-stats-refresh-btn, .lisani-odev-refresh-btn').forEach((btn) => {
            btn.classList.add('is-spinning');
        });
        try {
            const data = await apiFetch('/api/progress');
            if (typeof window.hydrateProgressFromServer === 'function') {
                window.hydrateProgressFromServer(data);
            }
            return data;
        } catch (e) {
            return null;
        } finally {
            document.querySelectorAll('.lisani-stats-refresh-btn, .lisani-odev-refresh-btn').forEach((btn) => {
                btn.classList.remove('is-spinning');
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    window.syncProgressToServer = async function () {
        if (!currentUser || currentUserRole === 'hoca' || currentUserRole === 'yonetici') return;
        const snap =
            typeof window.getLisaniProgress === 'function'
                ? window.getLisaniProgress()
                : null;
        if (!snap) return;

        const history = snap.testHistory || [];
        const xp = snap.totalScore || 0;
        const solvedCount = history.length;
        let totalSuccess = 0;
        history.forEach((r) => {
            totalSuccess += r.percent;
        });
        const avgSuccess = solvedCount > 0 ? Math.round(totalSuccess / solvedCount) : 0;
        const last = history[history.length - 1];

        try {
            await apiFetch('/api/progress/sync', {
                method: 'POST',
                body: JSON.stringify({
                    total_xp: xp,
                    tests_count: solvedCount,
                    avg_success: avgSuccess,
                    last_test: last
                        ? {
                              date: last.date,
                              level: last.level,
                              test: last.test,
                              correct: last.correct,
                              wrong: last.wrong,
                              percent: last.percent,
                          }
                        : null,
                    recent_tests: history.map((r) => ({
                        date: r.date,
                        level: r.level,
                        test: r.test,
                        correct: r.correct,
                        wrong: r.wrong,
                        percent: r.percent,
                    })),
                }),
            });
        } catch (e) {}
    };

    function hocaDashStatCard(label, value, colorClass, trend, trendUp, sub) {
        const trendCls = trendUp ? 'is-up' : 'is-down';
        const arrow = trendUp ? '↑' : '↓';
        return `
        <div class="hoca-dash__stat hoca-dash__stat--${colorClass}">
            <p class="hoca-dash__stat-label">${escapeHtml(label)}</p>
            <p class="hoca-dash__stat-value">${value}</p>
            ${trend ? `<span class="hoca-dash__stat-trend ${trendCls}">${arrow} ${trend}</span>` : ''}
            ${sub ? `<p class="hoca-dash__stat-sub">${escapeHtml(sub)}</p>` : ''}
        </div>`;
    }

    function buildHocaDashTrendPoints(ogrenciler) {
        const buckets = {};
        (ogrenciler || []).forEach((o) => {
            (o.recentTests || o.analiz?.sinavlar || []).forEach((t) => {
                const key = t.date || '—';
                if (!buckets[key]) buckets[key] = { sum: 0, count: 0 };
                buckets[key].sum += t.percent ?? 0;
                buckets[key].count += 1;
            });
        });
        return Object.entries(buckets)
            .map(([date, v]) => ({ date, avg: Math.round(v.sum / v.count) }))
            .slice(-12);
    }

    function renderHocaDashLineChart(ogrenciler) {
        const svg = document.getElementById('hoca-dash-line-svg');
        if (!svg) return;
        const points = buildHocaDashTrendPoints(ogrenciler);
        const w = 520;
        const h = 220;
        const mL = 36;
        const mR = 16;
        const mT = 24;
        const mB = 32;
        const uW = w - mL - mR;
        const uH = h - mT - mB;
        const bottom = h - mB;

        if (!points.length) {
            svg.innerHTML = `<text x="${w / 2}" y="${h / 2}" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">Henüz test verisi yok</text>`;
            return;
        }

        let html = `<defs>
            <linearGradient id="hd-line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7c5cfc" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#7c5cfc" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="hd-line-grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#e056a0" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#e056a0" stop-opacity="0"/>
            </linearGradient>
        </defs>`;

        [0, 50, 100].forEach((lvl) => {
            const gy = bottom - (lvl / 100) * uH;
            html += `<line x1="${mL}" y1="${gy}" x2="${w - mR}" y2="${gy}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
            html += `<text x="${mL - 6}" y="${gy + 4}" fill="#64748b" font-size="9" text-anchor="end">%${lvl}</text>`;
        });

        const coords = points.map((p, i) => {
            const x = points.length > 1 ? mL + (i / (points.length - 1)) * uW : mL + uW / 2;
            const y = bottom - (p.avg / 100) * uH;
            return { x, y, ...p };
        });

        let path1 = '';
        coords.forEach((c, i) => {
            if (i === 0) path1 = `M ${c.x} ${c.y}`;
            else {
                const p0 = coords[i - 1];
                const cpX = p0.x + (c.x - p0.x) / 2;
                path1 += ` C ${cpX} ${p0.y}, ${cpX} ${c.y}, ${c.x} ${c.y}`;
            }
        });

        const area1 = `${path1} L ${coords[coords.length - 1].x} ${bottom} L ${coords[0].x} ${bottom} Z`;
        html += `<path d="${area1}" fill="url(#hd-line-grad)"/>`;
        html += `<path d="${path1}" fill="none" stroke="#7c5cfc" stroke-width="2.5" stroke-linecap="round"/>`;

        const path2Coords = coords.map((c, i) => ({
            x: c.x,
            y: bottom - (Math.max(0, c.avg - 8 + (i % 3) * 3) / 100) * uH,
        }));
        let path2 = '';
        path2Coords.forEach((c, i) => {
            if (i === 0) path2 = `M ${c.x} ${c.y}`;
            else {
                const p0 = path2Coords[i - 1];
                const cpX = p0.x + (c.x - p0.x) / 2;
                path2 += ` C ${cpX} ${p0.y}, ${cpX} ${c.y}, ${c.x} ${c.y}`;
            }
        });
        html += `<path d="${path2}" fill="none" stroke="#e056a0" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`;

        coords.forEach((c) => {
            html += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="#7c5cfc" stroke="#0c0f1f" stroke-width="2"/>`;
            html += `<text x="${c.x}" y="${bottom + 14}" fill="#64748b" font-size="8" text-anchor="middle">${escapeHtml(String(c.date).slice(0, 5))}</text>`;
        });

        svg.innerHTML = html;
    }

    function renderHocaDashPie(svgId, legendId, slices) {
        const svg = document.getElementById(svgId);
        const legend = document.getElementById(legendId);
        if (!svg) return;
        const total = slices.reduce((s, x) => s + x.value, 0);
        if (!total) {
            svg.innerHTML = `<circle cx="50" cy="50" r="38" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>`;
            if (legend) legend.innerHTML = '<span class="hoca-dash__legend-item">Veri yok</span>';
            return;
        }
        let angle = -Math.PI / 2;
        let paths = '';
        slices.forEach((sl) => {
            if (!sl.value) return;
            const sweep = (sl.value / total) * Math.PI * 2;
            const x1 = 50 + 38 * Math.cos(angle);
            const y1 = 50 + 38 * Math.sin(angle);
            angle += sweep;
            const x2 = 50 + 38 * Math.cos(angle);
            const y2 = 50 + 38 * Math.sin(angle);
            const large = sweep > Math.PI ? 1 : 0;
            paths += `<path d="M 50 50 L ${x1} ${y1} A 38 38 0 ${large} 1 ${x2} ${y2} Z" fill="${sl.color}"/>`;
        });
        paths += `<circle cx="50" cy="50" r="20" fill="#171c35"/>`;
        svg.innerHTML = paths;
        if (legend) {
            legend.innerHTML = slices
                .filter((s) => s.value)
                .map(
                    (s) => `
                <div class="hoca-dash__legend-item">
                    <span class="hoca-dash__legend-dot" style="background:${s.color}"></span>
                    <span>${escapeHtml(s.label)}</span>
                    <strong style="margin-left:auto;color:#eef2ff">${s.value}</strong>
                </div>`
                )
                .join('');
        }
    }

    function renderHocaDashDoughnut(pct) {
        const svg = document.getElementById('hoca-dash-doughnut');
        const pctEl = document.getElementById('hoca-dash-donut-pct');
        if (pctEl) pctEl.textContent = `%${pct}`;
        if (!svg) return;
        const r = 46;
        const c = 2 * Math.PI * r;
        const filled = (Math.min(100, Math.max(0, pct)) / 100) * c;
        svg.innerHTML = `
            <defs>
                <linearGradient id="hd-donut-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#7c5cfc"/>
                    <stop offset="100%" stop-color="#e056a0"/>
                </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
            <circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#hd-donut-grad)" stroke-width="12"
                stroke-dasharray="${filled} ${c - filled}" stroke-linecap="round"
                transform="rotate(-90 60 60)"/>`;
    }

    function renderHocaDashSparklines(ozet) {
        const el = document.getElementById('hoca-dash-sparklines');
        if (!el) return;
        const items = [
            { label: 'Doğru', val: ozet.toplamDogru ?? 0, color: '#34d399' },
            { label: 'Yanlış', val: ozet.toplamYanlis ?? 0, color: '#f87171' },
            { label: 'Sınav', val: ozet.toplamSinav ?? 0, color: '#7c5cfc' },
            { label: 'XP', val: ozet.toplamXp ?? 0, color: '#fbbf24' },
        ];
        el.innerHTML = items
            .map((it) => {
                const pts = [40, 55, 35, 60, 45, 70, 50];
                const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${4 + i * 8} ${24 - (p / 100) * 18}`).join(' ');
                return `
            <div class="hoca-dash__spark">
                <p class="hoca-dash__spark-label">${escapeHtml(it.label)}</p>
                <p class="hoca-dash__spark-val" style="color:${it.color}">${it.val}</p>
                <svg viewBox="0 0 56 24"><path d="${path}" fill="none" stroke="${it.color}" stroke-width="1.5" opacity="0.8"/></svg>
            </div>`;
            })
            .join('');
    }

    function renderHocaDashRecent(ogrenciler) {
        const el = document.getElementById('hoca-dash-recent');
        if (!el) return;
        const events = [];
        (ogrenciler || []).forEach((o) => {
            const tests = o.recentTests || o.analiz?.sinavlar || [];
            tests.slice(-3).forEach((t) => {
                events.push({
                    name: o.name,
                    avatar: o.avatar,
                    date: t.date,
                    label: `S${t.level} · ${t.test || 'Test'}`,
                    percent: t.percent ?? 0,
                });
            });
        });
        events.sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const top = events.slice(0, 8);
        if (!top.length) {
            el.innerHTML = '<p class="hoca-dash__card-sub text-center py-4">Henüz aktivite yok</p>';
            return;
        }
        el.innerHTML = top
            .map((e) => {
                const cls = e.percent >= 80 ? 'is-good' : e.percent >= 60 ? 'is-mid' : 'is-low';
                const av =
                    typeof window.avatarSlotHtml === 'function'
                        ? window.avatarSlotHtml(e.avatar, 'sm')
                        : `<span>${e.avatar || '🎒'}</span>`;
                return `
            <div class="hoca-dash__recent-item">
                <div class="hoca-dash__recent-avatar">${av}</div>
                <div class="hoca-dash__recent-body">
                    <p class="hoca-dash__recent-name">${escapeHtml(e.name)}</p>
                    <p class="hoca-dash__recent-meta">${escapeHtml(e.label)} · ${escapeHtml(e.date || '')}</p>
                </div>
                <span class="hoca-dash__recent-score ${cls}">%${e.percent}</span>
            </div>`;
            })
            .join('');
    }

    function renderHocaDashboardOzet(ozet, ogrenciler) {
        const el = document.getElementById('hoca-dash-ozet');
        if (!el) return;
        const isYonetici = currentUserRole === 'yonetici';
        const total = ozet.ogrenciSayisi || 0;
        const aktifPct = total ? Math.round(((ozet.aktifOgrenci || 0) / total) * 100) : 0;
        const pasif = Math.max(0, total - (ozet.aktifOgrenci || 0));

        el.innerHTML = isYonetici
            ? [
                  hocaDashStatCard('Öğrenci', ozet.ogrenciSayisi ?? 0, 'purple', `${aktifPct}%`, aktifPct >= 50, 'Toplam kayıtlı'),
                  hocaDashStatCard('Aktif', ozet.aktifOgrenci ?? 0, 'teal', `${aktifPct}%`, true, 'Son 7 gün'),
                  hocaDashStatCard('Ort. Başarı', `%${ozet.ortalamaBasari ?? 0}`, 'pink', `${ozet.hocaSayisi ?? 0} hoca`, true, 'Tüm uygulama'),
                  hocaDashStatCard('Sınav', ozet.toplamSinav ?? 0, 'yellow', `${ozet.sinifSayisi ?? 0} sınıf`, true, 'Toplam çözülen'),
              ].join('')
            : [
                  hocaDashStatCard('Öğrenci', ozet.ogrenciSayisi ?? 0, 'purple', `${aktifPct}%`, aktifPct >= 40, 'Sınıfınızda'),
                  hocaDashStatCard('Aktif', ozet.aktifOgrenci ?? 0, 'teal', pasif ? `${pasif} pasif` : 'Hepsi aktif', (ozet.aktifOgrenci || 0) >= pasif, 'Son 7 gün'),
                  hocaDashStatCard('Ort. Başarı', `%${ozet.ortalamaBasari ?? 0}`, 'pink', `${ozet.toplamDogru ?? 0} doğru`, (ozet.ortalamaBasari || 0) >= 60, 'Sınıf ortalaması'),
                  hocaDashStatCard('Toplam XP', ozet.toplamXp ?? 0, 'yellow', `${ozet.toplamSinav ?? 0} sınav`, true, 'Birikimli puan'),
              ].join('');

        renderHocaDashLineChart(ogrenciler || []);
        renderHocaDashDoughnut(ozet.ortalamaBasari ?? 0);
        renderHocaDashSparklines(ozet);

        const gradeBuckets = { yuksek: 0, orta: 0, dusuk: 0, yok: 0 };
        const activityCounts = { aktif: 0, orta: 0, pasif: 0 };
        (ogrenciler || []).forEach((o) => {
            const a = o.avgSuccess || 0;
            if (!o.testsCount) gradeBuckets.yok += 1;
            else if (a >= 80) gradeBuckets.yuksek += 1;
            else if (a >= 60) gradeBuckets.orta += 1;
            else gradeBuckets.dusuk += 1;
            const st = o.activityStatus || 'pasif';
            activityCounts[st] = (activityCounts[st] || 0) + 1;
        });
        renderHocaDashPie('hoca-dash-pie-activity', 'hoca-dash-pie-activity-legend', [
            { label: 'Aktif', value: activityCounts.aktif, color: '#34d399' },
            { label: 'Orta', value: activityCounts.orta, color: '#fbbf24' },
            { label: 'Pasif', value: activityCounts.pasif, color: '#64748b' },
        ]);
        renderHocaDashPie('hoca-dash-pie-grades', 'hoca-dash-pie-grades-legend', [
            { label: '≥ %80', value: gradeBuckets.yuksek, color: '#7c5cfc' },
            { label: '%60–79', value: gradeBuckets.orta, color: '#e056a0' },
            { label: '< %60', value: gradeBuckets.dusuk, color: '#f87171' },
            { label: 'Veri yok', value: gradeBuckets.yok, color: '#475569' },
        ]);
        renderHocaDashRecent(ogrenciler || []);
        const countEl = document.getElementById('hoca-dash-student-count');
        if (countEl) countEl.textContent = `${(ogrenciler || []).length} öğrenci`;
    }

    function renderHocaDashboardStudents(ogrenciler, filter) {
        const list = document.getElementById('hoca-dash-students');
        if (!list) return;

        const q = (filter || '').trim().toLowerCase();
        const filtered = q
            ? (ogrenciler || []).filter((o) => (o.name || '').toLowerCase().includes(q))
            : ogrenciler || [];

        if (!filtered.length) {
            list.innerHTML = q
                ? '<p class="hoca-dash__card-sub text-center py-8">Arama sonucu bulunamadı</p>'
                : '<div class="text-center py-8"><p class="text-3xl mb-2">👥</p><p class="hoca-dash__card-sub">Henüz öğrenci yok.<br>Sınıf kodunu öğrencilerinize verin.</p></div>';
            return;
        }

        list.innerHTML = filtered
            .map((o) => {
                const barW = Math.min(100, o.avgSuccess || 0);
                const analiz = o.analiz || {};
                const lastTest = o.lastTestLabel
                    ? `<p class="hoca-dash__recent-meta mt-1 truncate">Son: ${escapeHtml(o.lastTestLabel)}${o.lastTestPercent != null ? ' · %' + o.lastTestPercent : ''}</p>`
                    : '<p class="hoca-dash__recent-meta mt-1">Henüz sınav çözmedi</p>';
                const sinifLine =
                    currentUserRole === 'yonetici' && (o.sinifAdi || o.hocaAdi)
                        ? `<p class="hoca-dash__recent-meta truncate">${escapeHtml(o.sinifAdi || '—')}${o.hocaAdi ? ' · ' + escapeHtml(o.hocaAdi) : ''}</p>`
                        : '';
                const scoreCls = (o.avgSuccess || 0) >= 80 ? 'is-good' : (o.avgSuccess || 0) >= 60 ? 'is-mid' : 'is-low';
                return `
            <div class="hoca-dash-student-card" data-student-uid="${o.uid}">
                <div class="flex items-start gap-3">
                    ${typeof window.avatarSlotHtml === 'function' ? window.avatarSlotHtml(o.avatar) : `<span class="text-2xl flex-shrink-0">${o.avatar || ''}</span>`}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <span class="hoca-dash__recent-name">${escapeHtml(o.name)}</span>
                            <span class="hoca-dash__recent-score ${scoreCls}">%${o.avgSuccess || 0}</span>
                        </div>
                        ${sinifLine}
                        <div class="flex items-center gap-2 mt-0.5">
                            ${statusBadge(o.activityStatus)}
                            <span class="hoca-dash__recent-meta">${formatLastActive(o.lastActiveAt)}</span>
                        </div>
                        ${lastTest}
                        <div class="mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden">
                            <div class="h-full rounded-full" style="width:${barW}%;background:linear-gradient(90deg,#7c5cfc,#e056a0)"></div>
                        </div>
                        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] font-bold">
                            <span style="color:#fbbf24">${o.totalXp || 0} XP</span>
                            <span class="hoca-dash__recent-meta">${o.testsCount || 0} sınav</span>
                            <span style="color:#34d399">✓ ${analiz.toplamDogru ?? 0}</span>
                            <span style="color:#f87171">✗ ${analiz.toplamYanlis ?? 0}</span>
                        </div>
                        <button type="button" onclick="toggleOgrenciRapor('${o.uid}')" class="hoca-dash__link-btn w-full mt-2 py-1.5" style="background:rgba(224,86,160,0.15);color:#e056a0">
                            Analiz Raporu
                        </button>
                        <div id="ogrenci-rapor-${o.uid}" class="hidden mt-2">
                            ${renderOgrenciAnalizTable(analiz)}
                        </div>
                    </div>
                </div>
            </div>`;
            })
            .join('');
    }

    function renderHocaDashboardSinif(data) {
        const isHoca = currentUserRole === 'hoca';
        const isYonetici = currentUserRole === 'yonetici';

        ['hoca-dash-nav-odev', 'hoca-dash-nav-kod', 'hoca-dash-mob-odev', 'hoca-dash-mob-kod'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', isYonetici);
        });

        const title = document.getElementById('hoca-dash-title');
        const subtitle = document.getElementById('hoca-dash-subtitle');
        const meta = document.getElementById('hoca-dash-list-meta');
        const userName = document.getElementById('hoca-dash-user-name');
        const userRole = document.getElementById('hoca-dash-user-role');
        const userAvatar = document.getElementById('hoca-dash-user-avatar');
        const cu = window.currentUser || currentUser;

        if (userName && cu?.name) userName.textContent = cu.name;
        if (userRole) userRole.textContent = isYonetici ? 'Uygulama Yöneticisi' : 'Sınıf Hocası';
        if (userAvatar) {
            if (typeof window.avatarSlotHtml === 'function' && cu?.avatar) {
                userAvatar.innerHTML = window.avatarSlotHtml(cu.avatar);
            } else {
                userAvatar.textContent = cu?.avatar || (isYonetici ? '👑' : '📚');
            }
        }

        if (isYonetici) {
            if (title) title.textContent = 'Dashboard';
            if (subtitle) {
                subtitle.textContent = `Tüm uygulama · ${data.ozet?.hocaSayisi ?? 0} hoca · ${data.ozet?.sinifSayisi ?? 0} sınıf`;
            }
            if (meta) meta.textContent = 'Tüm sınıflardan öğrenciler · XP sırasına göre';
        } else {
            if (title) title.textContent = 'Dashboard';
            const sinif = data.sinif || {};
            if (subtitle) {
                subtitle.textContent = sinif.sinifAdi
                    ? `${sinif.sinifAdi} · Kod: ${sinif.kisaKod || '—'}`
                    : 'Sınıf bilgisi yükleniyor...';
            }
            if (meta) meta.textContent = sinif.sinifAdi ? `${sinif.sinifAdi} öğrencileri` : 'Öğrenci listesi';

            const adEl = document.getElementById('hoca-dash-sinif-adi');
            const kodEl = document.getElementById('hoca-dash-sinif-kod');
            if (adEl) adEl.textContent = sinif.sinifAdi || '—';
            if (kodEl) kodEl.textContent = sinif.kisaKod || '———';
            window._hocaDashSinifKod = sinif.kisaKod || '';

            const odevlerEl = document.getElementById('hoca-dash-odevler');
            if (odevlerEl) {
                const odevler = sinif.odevler || [];
                if (!odevler.length) {
                    odevlerEl.innerHTML = '<p class="hoca-dash__card-sub text-center py-3">Henüz ödev atanmadı.</p>';
                } else {
                    odevlerEl.innerHTML = odevler
                        .slice(-8)
                        .reverse()
                        .map(
                            (o) => `
                        <div class="hoca-dash__recent-item">
                            <div class="hoca-dash__recent-avatar"><i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i></div>
                            <div class="hoca-dash__recent-body">
                                <p class="hoca-dash__recent-name">${escapeHtml(formatOdevLabel(o))}</p>
                                <p class="hoca-dash__recent-meta">${escapeHtml(o.tarih || '')}</p>
                            </div>
                        </div>`
                        )
                        .join('');
                }
            }
        }
    }

    function renderHocaDashboard(data) {
        if (!data) return;
        window._hocaDashCache = data;
        renderHocaDashboardOzet(data.ozet || {}, data.ogrenciler || []);
        renderHocaDashboardSinif(data);
        const search = document.getElementById('hoca-dash-search');
        renderHocaDashboardStudents(data.ogrenciler || [], search ? search.value : '');
    }

    window.hocaDashSwitchPanel = function (panelId) {
        document.querySelectorAll('.hoca-dash__panel').forEach((p) => p.classList.remove('is-active'));
        document.querySelectorAll('[data-hoca-dash-panel]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.getAttribute('data-hoca-dash-panel') === panelId);
        });
        const panel = document.getElementById(`hoca-dash-panel-${panelId}`);
        if (panel) panel.classList.add('is-active');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.hocaDashFilterStudents = function (query) {
        const data = window._hocaDashCache || window._hocaProgressCache;
        if (!data) return;
        if (query && query.trim()) hocaDashSwitchPanel('students');
        renderHocaDashboardStudents(data.ogrenciler || [], query);
    };

    window.openHocaDashboard = function () {
        if (currentUserRole !== 'hoca' && currentUserRole !== 'yonetici') {
            showToast('Bu ekran sadece hoca ve yönetici hesapları içindir.', 'error');
            return;
        }
        if (typeof hocaDashSwitchPanel === 'function') hocaDashSwitchPanel('overview');
        if (typeof switchTab === 'function') switchTab('hoca-dashboard');
    };

    window.loadHocaDashboard = function (forceRefresh) {
        return window.loadHocaProgressView(forceRefresh);
    };

    window.copyHocaDashSinifKodu = function () {
        const kod = window._hocaDashSinifKod || '';
        if (!kod) {
            showToast('Sınıf kodu henüz yüklenmedi.', 'error');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(kod).then(
                () => showToast('Sınıf kodu kopyalandı: ' + kod, 'success'),
                () => showToast('Kopyalanamadı. Kod: ' + kod, 'error')
            );
        } else {
            showToast('Sınıf kodu: ' + kod, 'success');
        }
    };

    window.loadHocaProgressView = async function (forceRefresh) {
        if ((currentUserRole !== 'hoca' && currentUserRole !== 'yonetici') || !window._loginDone) return null;

        const endpoint =
            currentUserRole === 'yonetici' ? '/api/yonetici/takip' : '/api/hoca/ogrenci-takip';

        document.querySelectorAll('.lisani-stats-refresh-btn').forEach((btn) => btn.classList.add('is-spinning'));
        try {
            const data = await apiFetch(endpoint);
            window._hocaProgressCache = data;
            renderHocaDashboard(data);
            return data;
        } catch (e) {
            const dashList = document.getElementById('hoca-dash-students');
            if (dashList) {
                dashList.innerHTML = `<p class="text-[10px] text-red-400 text-center py-4">${escapeHtml(e.message || 'Veri yüklenemedi')}</p>`;
            }
            return null;
        } finally {
            document.querySelectorAll('.lisani-stats-refresh-btn').forEach((btn) => btn.classList.remove('is-spinning'));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    function renderOdevlerList(containerId, data) {
        const list = document.getElementById(containerId);
        if (!list) return;

        const sinifEl = document.getElementById('home-odevler-sinif');
        if (sinifEl && data.sinifAdi) {
            sinifEl.textContent = data.sinifAdi + (data.hocaAdi ? ' · ' + data.hocaAdi : '');
        }

        if (!data.sinifAdi && data.message) {
            list.innerHTML = `<p class="text-[10px] theme-text-muted text-center py-3">${data.message}</p>`;
            return;
        }

        const odevler = data.odevler || [];
        if (odevler.length === 0) {
            list.innerHTML =
                '<p class="text-[10px] theme-text-muted text-center py-3">Henüz ödev yok. Hocanız test seçtiğinde burada görünecek.</p>';
            return;
        }

        list.innerHTML = odevler
            .map((o, idx) => {
                const label = formatOdevLabel(o);
                const testOdev = isTestOdev(o);
                const interactive = testOdev
                    ? ' odev-test-item cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all'
                    : '';
                const badge = testOdev
                    ? '<span class="text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[rgba(127,168,138,0.15)] text-[#7fa88a] border border-[rgba(127,168,138,0.25)]">Test</span>'
                    : '';
                return `
            <div class="lisani-glass-panel lisani-glass-card rounded-xl p-3 border theme-border${interactive}"
                ${testOdev ? `data-odev-index="${idx}" role="button" tabindex="0"` : ''}>
                <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold theme-text-main leading-relaxed flex items-center gap-1.5">
                            <i data-lucide="file-question" class="w-3.5 h-3.5 theme-primary-color shrink-0"></i>
                            <span class="truncate">${escapeHtml(label)}</span>
                        </p>
                        <p class="text-[9px] theme-text-muted mt-1.5 flex justify-between">
                            <span>${escapeHtml(o.hocaAdi || data.hocaAdi || 'Hoca')}</span>
                            <span>${escapeHtml(o.tarih || '')}</span>
                        </p>
                    </div>
                    ${badge}
                </div>
                ${testOdev ? '<p class="text-[9px] theme-text-muted mt-2 opacity-80">Başlamak için dokunun →</p>' : ''}
            </div>`;
            })
            .join('');

        list._odevItems = odevler;

        list.querySelectorAll('.odev-test-item').forEach((el) => {
            const open = () => {
                const idx = parseInt(el.getAttribute('data-odev-index'), 10);
                const o = list._odevItems && list._odevItems[idx];
                if (!o || !isTestOdev(o)) return;
                window.showOdevTestConfirm(o.level, o.test, formatOdevLabel(o));
            };
            el.addEventListener('click', open);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    window.showOdevTestConfirm = function (level, test, label) {
        playClickSound();
        let modal = document.getElementById('odev-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'odev-confirm-modal';
            modal.className = 'lisani-odev-confirm absolute inset-0 z-[90] flex items-center justify-center p-4';
            const host = document.getElementById('app-container') || document.body;
            host.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="lisani-odev-confirm__backdrop absolute inset-0 bg-black/55 backdrop-blur-sm" data-odev-dismiss></div>
            <div class="lisani-odev-confirm__card relative z-10 w-full max-w-sm rounded-2xl p-5 border theme-border glass-card shadow-xl">
                <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 home-accent-icon-wrap">
                    <i data-lucide="help-circle" class="w-6 h-6 home-accent-text"></i>
                </div>
                <h3 class="text-sm font-bold theme-text-main text-center">Teste gitmek istiyor musunuz?</h3>
                <p class="text-xs theme-text-muted text-center mt-2 leading-relaxed">${escapeHtml(label || `Seviye ${level} — ${test}`)}</p>
                <p class="text-[10px] theme-text-muted text-center mt-1 opacity-80">Evet derseniz test hemen başlar.</p>
                <div class="flex gap-2.5 mt-5">
                    <button type="button" class="flex-1 py-2.5 lisani-glass-action rounded-xl text-xs font-bold theme-text-muted" data-odev-dismiss>Hayır</button>
                    <button type="button" class="flex-1 py-2.5 lisani-glass-action lisani-glass-action--primary rounded-xl text-xs font-bold" id="odev-confirm-yes">Evet</button>
                </div>
            </div>`;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        const close = () => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        };

        modal.querySelectorAll('[data-odev-dismiss]').forEach((btn) => {
            btn.onclick = close;
        });

        const yesBtn = document.getElementById('odev-confirm-yes');
        if (yesBtn) {
            yesBtn.onclick = () => {
                close();
                if (typeof window.startOdevTest === 'function') {
                    window.startOdevTest(level, test);
                } else {
                    showToast('Test ekranı yüklenemedi. Testler sekmesinden deneyin.', 'error');
                }
            };
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.loadOgrenciOdevler = async function () {
        if (currentUserRole === 'hoca' || currentUserRole === 'yonetici' || !window._loginDone) return;
        try {
            const data = await apiFetch('/api/odevler');
            renderOdevlerList('home-odevler-list', data);
            renderOdevlerList('settings-odevler-list', data);
            return data;
        } catch (e) {
            const msg = `<p class="text-[10px] text-red-400 text-center py-2">${escapeHtml(e.message)}</p>`;
            const h = document.getElementById('home-odevler-list');
            const s = document.getElementById('settings-odevler-list');
            if (h) h.innerHTML = msg;
            if (s) s.innerHTML = msg;
            throw e;
        }
    };

    window.refreshOdevler = async function () {
        if (currentUserRole === 'hoca' || !window._loginDone) {
            showToast('Ödevleri görmek için öğrenci olarak giriş yapın.', 'error');
            return;
        }
        playClickSound();
        document.querySelectorAll('.lisani-odev-refresh-btn').forEach((btn) => btn.classList.add('is-spinning'));
        try {
            await window.loadOgrenciOdevler();
            showToast('Ödevler güncellendi.', 'success');
        } catch (e) {
            showToast(e.message || 'Ödevler yenilenemedi.', 'error');
        } finally {
            document.querySelectorAll('.lisani-odev-refresh-btn').forEach((btn) => btn.classList.remove('is-spinning'));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    function updateOgrenciSinifUI(user) {
        const block = document.getElementById('settings-sinif-kayit-block');
        const mevcut = document.getElementById('settings-sinif-mevcut');
        const input = document.getElementById('settings-sinif-kodu');
        if (!block) return;
        const isOgrenci = (user?.role || currentUserRole) === 'ogrenci';
        block.classList.toggle('hidden', !isOgrenci);
        if (!isOgrenci) return;
        if (user?.sinifKodu || user?.sinif) {
            const ad = user.sinif || 'Sınıf';
            const kod = user.sinifKodu || '';
            if (mevcut) mevcut.innerHTML = `Kayıtlı: <strong class="theme-text-main">${ad}</strong>${kod ? ' · Kod: <span class="font-mono text-amber-400">' + kod + '</span>' : ''}`;
            if (input && kod) input.value = kod;
        } else if (mevcut) {
            mevcut.textContent = 'Henüz sınıfa kayıtlı değilsiniz. Hocanızdan kod alıp aşağıya yazın.';
        }
    }

    window.saveOgrenciSinifKodu = async function () {
        playClickSound();
        const input = document.getElementById('settings-sinif-kodu');
        const kod = input ? input.value.trim().toUpperCase() : '';
        if (!kod || kod.length < 4) {
            showToast('Geçerli bir sınıf kodu girin.', 'error');
            return;
        }
        showLoading('Sınıf kaydediliyor...');
        try {
            const data = await apiFetch('/api/profile', {
                method: 'POST',
                body: JSON.stringify({ sinif_kodu: kod }),
            });
            const user = userFromApi(data.user);
            currentUser = user;
            window.currentUser = user;
            _saveUserLocally(user);
            updateOgrenciSinifUI(user);
            loadOgrenciOdevler();
            refreshMesajBadge();
            hideLoading();
            showToast('Sınıfınız kaydedildi!', 'success');
        } catch (e) {
            hideLoading();
            showToast(e.message, 'error');
        }
    };

    function updateRoleBasedUI(user) {
        const role = user?.role || currentUserRole;
        const isYonetici = role === 'yonetici';
        const isHoca = role === 'hoca';
        const isOgrenci = role === 'ogrenci';
        const yoneticiCard = document.getElementById('home-yonetici-card');
        const yoneticiRow = document.getElementById('settings-yonetici-row');
        const hocaCard = document.getElementById('home-hoca-takip-card');
        const hocaRow = document.getElementById('settings-hoca-takip-row');
        const hocaCardTitle = document.getElementById('home-hoca-takip-title');
        const hocaCardSub = document.getElementById('home-hoca-takip-sub');
        const odevCard = document.getElementById('home-odevler-card');
        const odevSettings = document.getElementById('settings-odevler-block');
        const mesajCard = document.getElementById('home-mesajlar-card');
        const mesajRow = document.getElementById('settings-mesajlar-row');
        if (yoneticiCard) yoneticiCard.classList.toggle('hidden', !isYonetici);
        if (yoneticiRow) yoneticiRow.classList.toggle('hidden', !isYonetici);
        if (hocaCard) hocaCard.classList.toggle('hidden', !(isHoca || isYonetici));
        if (hocaRow) hocaRow.classList.toggle('hidden', !(isHoca || isYonetici));
        if (hocaCardTitle) {
            hocaCardTitle.textContent = isYonetici ? 'Öğrenci Performans Dashboard' : 'Öğrenci Dashboard';
        }
        if (hocaCardSub) {
            hocaCardSub.textContent = isYonetici
                ? 'Tüm sınıfların performans özeti'
                : 'Sınıf performanslarını tablo halinde izleyin';
        }
        if (odevCard) odevCard.classList.toggle('hidden', !isOgrenci);
        if (odevSettings) odevSettings.classList.toggle('hidden', !isOgrenci);
        if (mesajCard) mesajCard.classList.toggle('hidden', isYonetici);
        if (mesajRow) mesajRow.classList.toggle('hidden', isYonetici);
        const sub = document.getElementById('home-mesajlar-sub');
        if (sub) {
            sub.textContent = isHoca
                ? 'Öğrencilerinizle yazışın'
                : isYonetici
                  ? 'Yönetici hesabında mesajlaşma kapalı'
                  : user?.sinifKodu
                    ? 'Hocanızla yazışın'
                    : 'Önce sınıfa katılın (Ayarlar)';
        }
        updateOgrenciSinifUI(user);
        const testsHocaHint = document.getElementById('tests-hoca-hint');
        const testsStudentHint = document.getElementById('tests-student-hint');
        if (testsHocaHint) testsHocaHint.classList.toggle('hidden', !isHoca);
        if (testsStudentHint) testsStudentHint.classList.toggle('hidden', isHoca || isYonetici);
        const tabAi = document.getElementById('tab-ai');
        const tabTests = document.getElementById('tab-tests');
        const tabHocaDash = document.getElementById('tab-hoca-dashboard');
        if (tabAi) tabAi.classList.toggle('hidden', isHoca || isYonetici);
        if (tabTests) tabTests.classList.toggle('hidden', isHoca || isYonetici);
        if (tabHocaDash) tabHocaDash.classList.toggle('hidden', !(isHoca || isYonetici));
        if (typeof updateTestsTabForRole === 'function') updateTestsTabForRole();
        if (typeof updateGelisimScreenForRole === 'function') updateGelisimScreenForRole();
        if ((isHoca || isYonetici) && typeof window.loadHocaProgressView === 'function') {
            setTimeout(() => window.loadHocaProgressView(), 500);
        }
        if (isOgrenci) {
            setTimeout(() => window.loadOgrenciOdevler(), 400);
        }
        refreshMesajBadge();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    let _waPollTimer = null;
    let _waActivePartnerId = null;
    let _waView = 'list';
    let _waContactsCache = [];
    let _waThreadMessages = {};

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function formatAvatarHtml(avatar) {
        if (typeof window.formatAvatarForDisplay === 'function') {
            return window.formatAvatarForDisplay(avatar);
        }
        if (avatar && avatar.includes('<img')) {
            const srcMatch = avatar.match(/src="([^"]+)"/);
            if (srcMatch) {
                return `<img src="${srcMatch[1]}" class="lisani-avatar-img" alt="" />`;
            }
            return avatar;
        }
        if (typeof window.resolveLegacyAvatar === 'function') {
            const resolved = window.resolveLegacyAvatar(avatar, null);
            if (resolved && resolved.includes('<img')) {
                const srcMatch = resolved.match(/src="([^"]+)"/);
                if (srcMatch) {
                    return `<img src="${srcMatch[1]}" class="lisani-avatar-img object-cover" alt="" />`;
                }
                return resolved;
            }
        }
        return `<span class="text-lg leading-none">${escapeHtml(avatar || '')}</span>`;
    }

    function formatWaDateLabel(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('.');
        if (parts.length !== 3) return dateStr;
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Bugün';
        if (d.toDateString() === yesterday.toDateString()) return 'Dün';
        return dateStr;
    }

    function getWaQuickReplies() {
        if (currentUserRole === 'hoca') {
            return ['Merhaba 👋', 'Ödevini kontrol ettim ✅', 'Yarın sınıfta görüşürüz', 'Sorularını bekliyorum'];
        }
        return ['Hocam merhaba 👋', 'Ödev hakkında sorum var', 'Anlamadığım bir konu var', 'Teşekkür ederim'];
    }

    function updateMesajHomePreview(contacts) {
        const preview = document.getElementById('home-mesajlar-preview');
        if (!preview || !contacts?.length) {
            if (preview) preview.classList.add('hidden');
            return;
        }
        const top = contacts[0];
        if (!top.lastMessage) {
            preview.classList.add('hidden');
            return;
        }
        const prefix = top.lastIsMine ? 'Sen: ' : '';
        preview.textContent = prefix + top.lastMessage;
        preview.classList.remove('hidden');
    }

    function updateMesajBadges(count) {
        const n = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
        ['home-mesaj-badge', 'settings-mesaj-badge'].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (count > 0) {
                el.textContent = n;
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    window.refreshMesajBadge = function () {
        if (!window._loginDone) return Promise.resolve();
        if (_mesajBadgeTimer) clearTimeout(_mesajBadgeTimer);
        return new Promise((resolve) => {
            _mesajBadgeTimer = setTimeout(async () => {
                if (_mesajBadgeInFlight) {
                    resolve(await _mesajBadgeInFlight);
                    return;
                }
                _mesajBadgeInFlight = (async () => {
                    try {
                        const data = await apiFetch('/api/messages/unread-count');
                        updateMesajBadges(data.unreadTotal || 0);
                        const contactsData = await apiFetch('/api/messages/contacts');
                        _waContactsCache = contactsData.contacts || [];
                        updateMesajHomePreview(_waContactsCache);
                    } catch (e) {}
                })();
                try {
                    await _mesajBadgeInFlight;
                } finally {
                    _mesajBadgeInFlight = null;
                }
                resolve();
            }, 500);
        });
    };

    function stopWaPolling() {
        if (_waPollTimer) {
            clearInterval(_waPollTimer);
            _waPollTimer = null;
        }
    }

    function startWaPolling(partnerId) {
        stopWaPolling();
        if (!partnerId) return;
        _waPollTimer = setInterval(() => {
            if (_waActivePartnerId === partnerId && _waView === 'chat') {
                loadWaThread(partnerId, true);
            }
        }, 4000);
    }

    window.closeMesajlar = function () {
        playClickSound();
        stopWaPolling();
        _waActivePartnerId = null;
        _waView = 'list';
        const el = document.getElementById('wa-mesajlar-overlay');
        if (el) el.remove();
        document.removeEventListener('keydown', onWaEscapeKey);
        refreshMesajBadge();
    };

    function bindWaHeaderButtons(mode) {
        const closeBtn = document.getElementById('wa-btn-close');
        const backBtn = document.getElementById('wa-btn-back');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.closeMesajlar();
            };
        }
        if (backBtn && mode === 'chat') {
            backBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.backToWaList();
            };
        }
    }

    function waGlassBlobsHtml() {
        return `<div class="lisani-glass-blobs" aria-hidden="true">
            <span class="lisani-glass-blob lisani-glass-blob--1"></span>
            <span class="lisani-glass-blob lisani-glass-blob--2"></span>
            <span class="lisani-glass-blob lisani-glass-blob--3"></span>
        </div>`;
    }

    function renderWaList(contacts) {
        if (!contacts.length) {
            return `<div class="flex flex-col items-center justify-center flex-1 px-6 text-center wa-empty-state">
                <div class="w-16 h-16 rounded-full lisani-glass-panel flex items-center justify-center mb-4">
                    <i data-lucide="message-circle" class="w-8 h-8 home-accent-text"></i>
                </div>
                <p class="text-sm font-semibold theme-text-main">Henüz sohbet yok</p>
                <p class="text-[11px] mt-2 leading-relaxed max-w-[240px]">${currentUserRole === 'hoca' ? 'Sınıfınıza öğrenci katıldığında burada görünür.' : 'Ayarlar → Sınıf kodunu girerek hocanıza ulaşın.'}</p>
            </div>`;
        }
        return contacts
            .map((c) => {
                const unread =
                    c.unreadCount > 0
                        ? `<span class="wa-unread-badge rounded-full px-1.5 flex items-center justify-center text-[9px]">${c.unreadCount > 99 ? '99+' : c.unreadCount}</span>`
                        : `<span class="text-[10px] wa-empty-state">${escapeHtml(c.lastAtLabel || c.lastAt || '')}</span>`;
                const prefix = c.lastIsMine ? '<span class="opacity-70">Sen: </span>' : '';
                const preview = c.lastMessage
                    ? prefix + escapeHtml(c.lastMessage)
                    : '<span class="italic opacity-60">Mesaj yok — sohbeti başlatın</span>';
                const roleLabel = c.role === 'hoca' ? 'Hoca' : 'Öğrenci';
                const unreadCls = c.unreadCount > 0 ? ' wa-list-item--unread' : '';
                return `<button type="button" data-wa-partner="${c.uid}" data-wa-name="${escapeHtml(c.name)}" class="wa-contact-btn wa-contact-card w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-2xl${unreadCls}">
                    <div class="w-12 h-12 rounded-full wa-contact-avatar flex items-center justify-center flex-shrink-0 overflow-hidden">${formatAvatarHtml(c.avatar)}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center gap-2 mb-0.5">
                            <span class="text-sm font-semibold theme-text-main truncate">${escapeHtml(c.name)}</span>
                            ${unread}
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="wa-role-pill">${roleLabel}</span>
                            <p class="text-[12px] theme-text-muted truncate flex-1">${preview}</p>
                        </div>
                    </div>
                </button>`;
            })
            .join('');
    }

    function renderWaMessages(messages, pendingBody) {
        let html = '';
        if (!messages.length && !pendingBody) {
            return `<div class="text-center text-[11px] wa-empty-state py-10">
                <p class="text-sm font-medium theme-text-main mb-1">Sohbeti başlatın 👋</p>
                <p class="text-[10px] opacity-80">Aşağıdan mesaj yazın veya hızlı yanıt seçin</p>
            </div>`;
        }
        let lastDate = '';
        messages.forEach((m) => {
            const dateLabel = formatWaDateLabel(m.date);
            if (dateLabel !== lastDate) {
                lastDate = dateLabel;
                html += `<div class="text-center my-3"><span class="wa-date-chip lisani-glass-panel">${escapeHtml(dateLabel)}</span></div>`;
            }
            html += renderWaBubble(m.body, m.isMine, m.time, m.read, false);
        });
        if (pendingBody) {
            html += renderWaBubble(pendingBody, true, '…', false, true);
        }
        return html;
    }

    function renderWaBubble(body, isMine, time, read, pending) {
        const cls = isMine
            ? 'wa-bubble-sent wa-bubble-glass wa-bubble-glass--sent lisani-glass-panel ml-auto' + (pending ? ' wa-bubble--pending' : '')
            : 'wa-bubble-received wa-bubble-glass lisani-glass-panel mr-auto';
        const tick = isMine && !pending
            ? read
                ? '<span class="wa-tick-read ml-1">✓✓</span>'
                : '<span class="wa-tick-sent ml-1">✓</span>'
            : '';
        return `<div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 px-1 wa-bubble-row">
            <div class="${cls} max-w-[85%] px-3.5 py-2 text-[13px] leading-relaxed break-words">
                <p>${escapeHtml(body)}</p>
                <p class="text-[9px] text-right mt-1 opacity-70 flex items-center justify-end gap-0.5">${time}${tick}</p>
            </div>
        </div>`;
    }

    function waSearchBarHtml() {
        return `<div class="wa-search-wrap px-3 pt-2 pb-2 flex-shrink-0">
            <div class="relative lisani-glass-panel rounded-xl px-3 py-2 flex items-center gap-2">
                <i data-lucide="search" class="w-4 h-4 theme-text-muted shrink-0 pointer-events-none"></i>
                <input type="search" id="wa-search-input" class="wa-search-input flex-1 min-w-0 bg-transparent border-0 outline-none text-xs theme-text-main" placeholder="Kişi veya mesaj ara..." autocomplete="off" />
            </div>
        </div>`;
    }

    function bindWaSearch() {
        const input = document.getElementById('wa-search-input');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            const filtered = !_waContactsCache.length
                ? []
                : !q
                  ? _waContactsCache
                  : _waContactsCache.filter(
                        (c) =>
                            (c.name || '').toLowerCase().includes(q) ||
                            (c.lastMessage || '').toLowerCase().includes(q)
                    );
            const list = document.getElementById('wa-contacts-list');
            if (list) list.innerHTML = renderWaList(filtered);
            document.querySelectorAll('.wa-contact-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-wa-partner');
                    if (id) window.openWaChat(id);
                });
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    function bindWaTextarea(input) {
        if (!input) return;
        const grow = () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 96) + 'px';
        };
        input.addEventListener('input', grow);
        grow();
    }

    function bindWaQuickReplies() {
        document.querySelectorAll('.wa-quick-reply').forEach((btn) => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('wa-message-input');
                if (input) {
                    input.value = btn.textContent.trim();
                    bindWaTextarea(input);
                    input.focus();
                }
            });
        });
    }

    function scrollWaToBottom(smooth) {
        const box = document.getElementById('wa-messages-box');
        if (!box) return;
        if (smooth) {
            box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
        } else {
            box.scrollTop = box.scrollHeight;
        }
    }

    function onWaEscapeKey(e) {
        if (e.key !== 'Escape') return;
        if (!document.getElementById('wa-mesajlar-overlay')) return;
        e.preventDefault();
        if (_waView === 'chat') {
            window.backToWaList();
        } else {
            window.closeMesajlar();
        }
    }

    function ensureWaOverlay() {
        let el = document.getElementById('wa-mesajlar-overlay');
        if (el) return el;
        el = document.createElement('div');
        el.id = 'wa-mesajlar-overlay';
        el.className = 'lisani-wa-overlay';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Mesajlar');
        const host =
            document.getElementById('main-application-flow') ||
            document.getElementById('app-container') ||
            document.body;
        host.appendChild(el);
        document.addEventListener('keydown', onWaEscapeKey);
        return el;
    }

    function renderWaShell(innerHtml, headerHtml, headerMode) {
        const el = ensureWaOverlay();
        el.innerHTML = `
            <div class="wa-overlay-inner lisani-wa-glass">
                <div class="wa-header wa-glass-header lisani-glass-panel flex items-center gap-2 px-3 py-3">${headerHtml}</div>
                <div class="wa-body wa-glass-body lisani-glass-scene">
                    ${waGlassBlobsHtml()}
                    <div class="lisani-glass-scene__content lisani-wa-scene-content flex flex-col flex-1 min-h-0">${innerHtml}</div>
                </div>
            </div>`;
        el.style.display = 'flex';
        el.setAttribute('aria-hidden', 'false');
        bindWaHeaderButtons(headerMode || 'list');
        el.querySelectorAll('.wa-contact-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-wa-partner');
                if (id) window.openWaChat(id);
            });
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function waListHeaderHtml() {
        const count = _waContactsCache.length;
        return `
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn lisani-glass-action lisani-glass-action--icon !w-10 !h-10 !p-0 !min-w-0 flex items-center justify-center">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="flex-1 min-w-0 px-1">
                <h2 class="text-base font-bold theme-text-main">Mesajlar</h2>
                <p class="text-[10px] theme-text-muted">${currentUserRole === 'hoca' ? `${count} kişi · Öğrencileriniz` : 'Hocanız ile güvenli sohbet'}</p>
            </div>`;
    }

    function waChatHeaderHtml(p) {
        return `
            <button type="button" id="wa-btn-back" aria-label="Geri" class="wa-header-btn lisani-glass-action lisani-glass-action--icon !w-10 !h-10 !p-0 !min-w-0 flex items-center justify-center">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </button>
            <div class="w-10 h-10 rounded-full wa-contact-avatar lisani-glass-panel !p-0 flex items-center justify-center overflow-hidden flex-shrink-0">${formatAvatarHtml(p.avatar)}</div>
            <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold theme-text-main truncate">${escapeHtml(p.name)}</h2>
                <p class="text-[10px] theme-text-muted">${p.role === 'hoca' ? 'Hoca · Çevrimiçi' : 'Öğrenci · Sınıf sohbeti'}</p>
            </div>
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn lisani-glass-action lisani-glass-action--icon !w-10 !h-10 !p-0 !min-w-0 flex items-center justify-center">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>`;
    }

    function waQuickRepliesHtml() {
        return getWaQuickReplies()
            .map((t) => `<button type="button" class="wa-quick-reply lisani-glass-action lisani-glass-action--compact !w-auto !inline-flex shrink-0">${escapeHtml(t)}</button>`)
            .join('');
    }

    async function loadWaContacts() {
        const data = await apiFetch('/api/messages/contacts');
        _waContactsCache = data.contacts || [];
        updateMesajBadges(data.unreadTotal || 0);
        updateMesajHomePreview(_waContactsCache);
        const listHtml = renderWaList(_waContactsCache);
        renderWaShell(
            `${waSearchBarHtml()}<div id="wa-contacts-list" class="wa-contacts-scene flex-1 overflow-y-auto min-h-0 px-3 pb-3 space-y-2">${listHtml}</div>`,
            waListHeaderHtml(),
            'list'
        );
        bindWaSearch();
    }

    window.showMesajlar = async function () {
        playClickSound();
        if (!window._loginDone) {
            showToast('Mesajlar için giriş yapın.', 'error');
            forceAuthScreen();
            return;
        }
        let user = currentUser || window.currentUser;
        if (!user) {
            user = await ensureServerSession();
        }
        if (!user) {
            showToast('Mesajlar için giriş yapın.', 'error');
            forceAuthScreen();
            return;
        }
        _waView = 'list';
        _waActivePartnerId = null;
        stopWaPolling();
        showLoading('Mesajlar yükleniyor...');
        try {
            await loadWaContacts();
            hideLoading();
        } catch (e) {
            hideLoading();
            renderWaShell(
                `<div class="flex flex-1 items-center justify-center px-6 py-10 text-center wa-empty-state">
                    <div>
                        <p class="text-sm font-semibold theme-text-main mb-1">Mesajlar açılamadı</p>
                        <p class="text-[11px] leading-relaxed">${escapeHtml(e.message || 'Bağlantı hatası. Tekrar deneyin.')}</p>
                    </div>
                </div>`,
                waListHeaderHtml(),
                'list'
            );
            showToast(e.message || 'Mesajlar yüklenemedi.', 'error');
        }
    };

    async function loadWaThread(partnerId, silent, pendingBody) {
        const data = await apiFetch('/api/messages/' + encodeURIComponent(partnerId));
        _waThreadMessages[partnerId] = data.messages || [];
        const box = document.getElementById('wa-messages-box');
        if (!box) return data;
        const wasBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 100;
        box.innerHTML = renderWaMessages(_waThreadMessages[partnerId], pendingBody || null);
        if (wasBottom || !silent || pendingBody) {
            scrollWaToBottom(!silent && !pendingBody);
        }
        if (!silent) refreshMesajBadge();
        return data;
    }

    window.openWaChat = async function (partnerId) {
        _waActivePartnerId = partnerId;
        _waView = 'chat';
        showLoading('Sohbet açılıyor...');
        try {
            const data = await apiFetch('/api/messages/' + encodeURIComponent(partnerId));
            const p = data.partner;
            _waThreadMessages[partnerId] = data.messages || [];
            hideLoading();
            renderWaShell(
                `<div class="flex flex-col flex-1 min-h-0 h-full">
                    <div id="wa-messages-box" class="wa-chat-bg flex-1 min-h-0 overflow-y-auto px-3 py-4">${renderWaMessages(data.messages || [])}</div>
                    <div class="wa-quick-replies px-3">${waQuickRepliesHtml()}</div>
                    <div class="wa-input-bar wa-glass-input-bar lisani-glass-panel flex items-end gap-2 px-3 py-2 mx-3 mb-3 rounded-2xl">
                        <textarea id="wa-message-input" rows="1" maxlength="2000" placeholder="Mesaj yazın..." class="wa-message-input flex-1 min-w-0 bg-transparent border-0 outline-none resize-none max-h-24 text-xs theme-text-main"></textarea>
                        <button type="button" id="wa-send-btn" class="wa-send-btn lisani-glass-action lisani-glass-action--primary !w-11 !h-11 !p-0 !min-w-0 !justify-center rounded-full flex items-center justify-center flex-shrink-0">
                            <i data-lucide="send" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>`,
                waChatHeaderHtml(p),
                'chat'
            );
            const sendBtn = document.getElementById('wa-send-btn');
            if (sendBtn) {
                sendBtn.onclick = (e) => {
                    e.preventDefault();
                    window.sendWaMessage();
                };
            }
            scrollWaToBottom(false);
            const input = document.getElementById('wa-message-input');
            bindWaTextarea(input);
            bindWaQuickReplies();
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendWaMessage();
                    }
                });
            }
            startWaPolling(partnerId);
            refreshMesajBadge();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {
            hideLoading();
            showToast(e.message || 'Sohbet açılamadı.', 'error');
        }
    };

    window.backToWaList = async function () {
        stopWaPolling();
        _waActivePartnerId = null;
        _waView = 'list';
        try {
            await loadWaContacts();
        } catch (e) {
            window.closeMesajlar();
        }
    };

    window.sendWaMessage = async function () {
        const input = document.getElementById('wa-message-input');
        const body = input ? input.value.trim() : '';
        if (!body || !_waActivePartnerId) return;
        const btn = document.getElementById('wa-send-btn');
        if (btn) btn.disabled = true;
        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }
        const box = document.getElementById('wa-messages-box');
        const existing = _waThreadMessages[_waActivePartnerId] || [];
        if (box) {
            box.innerHTML = renderWaMessages(existing, body);
            scrollWaToBottom(true);
        }
        try {
            await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiver_id: parseInt(_waActivePartnerId, 10),
                    body,
                }),
            });
            await loadWaThread(_waActivePartnerId, true);
            scrollWaToBottom(true);
        } catch (e) {
            showToast(e.message || 'Gönderilemedi.', 'error');
            await loadWaThread(_waActivePartnerId, true);
        } finally {
            if (btn) btn.disabled = false;
            if (input) input.focus();
        }
    };

    window.onLoginSuccessHook = async function (user) {
        updateRoleBasedUI(user);
        if (user.role === 'hoca' || user.role === 'yonetici') {
            await window.loadHocaProgressView();
        } else {
            await window.loadProgressFromServer();
            await window.syncProgressToServer();
        }
    };

    document.addEventListener('appReady', () => {
        trySessionRestore();
    });
    if (window._appReady) {
        trySessionRestore();
    }
})();
