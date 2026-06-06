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
                window._loginDone = false;
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

    function userFromApi(u) {
        return {
            uid: u.uid,
            name: u.name,
            email: u.email,
            avatar: u.avatar || '🐱',
            role: u.role || 'ogrenci',
            sinif: u.sinif,
            sinifKodu: u.sinifKodu,
            birthdate: u.birthdate || '',
            totalScore: u.totalScore || 0,
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
            if (idx >= 0) users[idx] = { ...users[idx], ...user };
            else users.push(user);
            localStorage.setItem('lisani_all_users', JSON.stringify(users));
        } catch (e) {}
    };

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
                    remember: rememberMe,
                }),
            });
            const user = userFromApi(data.user);
            user.password = passwordInput;
            window._loginDone = true;
            currentUserRole = user.role;
            _saveUserLocally(user);
            applyCsrfToken(data.csrf_token);
            hideLoading();
            loginSuccess(user, rememberMe);
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
                    avatar: typeof selectedAvatarValue !== 'undefined' ? selectedAvatarValue : '🐱',
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
        currentUser = null;
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
            loadOgrenciOdevler();
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
        const levelOpts = [1, 2, 3]
            .map((l) => `<option value="${l}">${ODEV_LEVEL_LABELS[l]}</option>`)
            .join('');
        const testOpts = ODEV_TEST_OPTIONS.map((t) => `<option value="${t}">${t}</option>`).join('');
        return `
            <p class="text-[10px] theme-text-muted mb-3">Öğrenciler Testler sekmesindeki seçtiğiniz teste yönlendirilir.</p>
            <label class="text-[9px] font-bold theme-text-muted uppercase tracking-wide block mb-1">Seviye</label>
            <select id="odev-level" class="w-full mb-2.5 p-2.5 rounded-xl border theme-border theme-card-bg theme-text-main text-xs focus:outline-none">${levelOpts}</select>
            <label class="text-[9px] font-bold theme-text-muted uppercase tracking-wide block mb-1">Test</label>
            <select id="odev-test" class="w-full mb-3 p-2.5 rounded-xl border theme-border theme-card-bg theme-text-main text-xs focus:outline-none">${testOpts}</select>
            <button type="button" onclick="odevVer('${hocaUid}')" class="w-full py-2.5 theme-primary-btn rounded-xl text-xs font-bold">Test Ödevi Gönder</button>`;
    }

    window.odevVer = function (hocaUid) {
        const levelEl = document.getElementById('odev-level');
        const testEl = document.getElementById('odev-test');
        const level = levelEl ? parseInt(levelEl.value, 10) : 0;
        const test = testEl ? testEl.value : '';
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
                <div class="glass-card-interactive rounded-2xl p-3.5 mb-2.5 border theme-border">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl flex-shrink-0">${o.avatar || '🎒'}</span>
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
                            <button type="button" onclick="toggleOgrenciRapor('${o.uid}')" class="mt-2 w-full py-1.5 rounded-lg text-[9px] font-bold border theme-border theme-light-bg theme-text-main hover:opacity-90 flex items-center justify-center gap-1">
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
    };

    window.forceAuthScreen = function () {
        window._loginDone = false;
        window._manualLogout = false;
        currentUser = null;
        currentUserRole = null;
        const auth = document.getElementById('auth-container');
        const main = document.getElementById('main-application-flow');
        if (main) main.classList.add('hidden');
        if (auth) auth.classList.remove('hidden');
        if (typeof toggleAuthTab === 'function') toggleAuthTab('login');
    };

    async function ensureServerSession() {
        try {
            const data = await apiFetch('/api/user');
            if (data.user) {
                const user = userFromApi(data.user);
                window._loginDone = true;
                currentUser = user;
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
        const roleBadge = (user.role || currentUserRole) === 'hoca' ? '📚 Hoca' : '🎒 Öğrenci';
        document.getElementById('settings-profile-sub').innerHTML = roleBadge;
        document.getElementById('home-welcome-text').innerText = `Hoş Geldin, ${user.name}! 👋`;

        const avatarContainers = [
            document.getElementById('home-avatar-display'),
            document.getElementById('settings-avatar-container'),
        ];
        avatarContainers.forEach((container) => {
            if (!container) return;
            container.innerHTML = avatar;
            if (avatar && avatar.includes('<img')) {
                container.classList.remove('text-lg');
            } else {
                container.classList.add('text-lg');
            }
        });
    }

    window.saveProfileChanges = async function () {
        playClickSound();

        const nameInput = document.getElementById('edit-profile-username').value.trim();
        const birthdateInput = document.getElementById('edit-profile-birthdate').value;
        const emailInput = document.getElementById('edit-profile-email').value.trim();
        const avatar =
            typeof editAvatarValue !== 'undefined' ? editAvatarValue : currentUser?.avatar || '🐱';

        if (!nameInput || !birthdateInput) {
            showToast('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        const birthYear = new Date(birthdateInput).getFullYear();
        const age = new Date().getFullYear() - birthYear;

        showLoading('Profil kaydediliyor...');
        try {
            const data = await apiFetch('/api/profile', {
                method: 'POST',
                body: JSON.stringify({
                    name: nameInput,
                    birthdate: birthdateInput,
                    email: emailInput || currentUser?.email,
                    avatar,
                }),
            });

            const user = userFromApi(data.user);
            user.age = age;
            if (currentUser?.password) user.password = currentUser.password;

            currentUser = user;
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

    async function trySessionRestore() {
        if (window._manualLogout) return;

        try {
            const data = await apiFetch('/api/user');
            if (data.user) {
                const user = userFromApi(data.user);
                window._loginDone = true;
                currentUserRole = user.role;
                const remember = localStorage.getItem('lisani_remember_me') === 'true';
                loginSuccess(user, remember);
                return;
            }
        } catch (e) {}

        if (window._loginDone) return;

        const rememberMe = localStorage.getItem('lisani_remember_me') === 'true';
        const savedSession = localStorage.getItem('lisani_session_user');
        if (!rememberMe || !savedSession) return;

        try {
            const savedUser = JSON.parse(savedSession);
            const all = JSON.parse(localStorage.getItem('lisani_all_users') || '[]');
            const found = all.find(
                (u) => u.name && u.name.toLowerCase() === (savedUser.name || '').toLowerCase()
            );
            if (!found?.password) return;

            const data = await apiFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    name: found.name,
                    password: found.password,
                    remember: true,
                }),
            });
            const user = userFromApi(data.user);
            user.password = found.password;
            window._loginDone = true;
            currentUserRole = user.role;
            applyCsrfToken(data.csrf_token);
            _saveUserLocally(user);
            loginSuccess(user, true);
        } catch (e) {}
    }

    window.restoreServerSession = trySessionRestore;

    window.syncProgressToServer = async function () {
        if (!currentUser || currentUserRole === 'hoca') return;
        if (typeof testHistory === 'undefined') return;

        const solvedCount = testHistory.length;
        let totalSuccess = 0;
        testHistory.forEach((r) => {
            totalSuccess += r.percent;
        });
        const avgSuccess = solvedCount > 0 ? Math.round(totalSuccess / solvedCount) : 0;
        const last = testHistory[testHistory.length - 1];

        try {
            await apiFetch('/api/progress/sync', {
                method: 'POST',
                body: JSON.stringify({
                    total_xp: typeof totalScore !== 'undefined' ? totalScore : 0,
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
                    recent_tests: testHistory.map((r) => ({
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
            <div class="glass-card-interactive rounded-xl p-3 border theme-border${interactive}"
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
                    <button type="button" class="flex-1 py-2.5 rounded-xl text-xs font-semibold border theme-border theme-text-muted hover:opacity-90 transition-all" data-odev-dismiss>Hayır</button>
                    <button type="button" class="flex-1 py-2.5 theme-primary-btn rounded-xl text-xs font-bold" id="odev-confirm-yes">Evet</button>
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
        if (currentUserRole === 'hoca' || !window._loginDone) return;
        try {
            const data = await apiFetch('/api/odevler');
            renderOdevlerList('home-odevler-list', data);
            renderOdevlerList('settings-odevler-list', data);
        } catch (e) {
            const msg = `<p class="text-[10px] text-red-400 text-center py-2">${e.message}</p>`;
            const h = document.getElementById('home-odevler-list');
            const s = document.getElementById('settings-odevler-list');
            if (h) h.innerHTML = msg;
            if (s) s.innerHTML = msg;
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
        const isHoca = (user?.role || currentUserRole) === 'hoca';
        const isOgrenci = !isHoca;
        const hocaCard = document.getElementById('home-hoca-takip-card');
        const hocaRow = document.getElementById('settings-hoca-takip-row');
        const odevCard = document.getElementById('home-odevler-card');
        const odevSettings = document.getElementById('settings-odevler-block');
        const mesajCard = document.getElementById('home-mesajlar-card');
        const mesajRow = document.getElementById('settings-mesajlar-row');
        if (hocaCard) hocaCard.classList.toggle('hidden', !isHoca);
        if (hocaRow) hocaRow.classList.toggle('hidden', !isHoca);
        if (odevCard) odevCard.classList.toggle('hidden', !isOgrenci);
        if (odevSettings) odevSettings.classList.toggle('hidden', !isOgrenci);
        if (mesajCard) mesajCard.classList.remove('hidden');
        if (mesajRow) mesajRow.classList.remove('hidden');
        const sub = document.getElementById('home-mesajlar-sub');
        if (sub) {
            sub.textContent = isHoca
                ? 'Öğrencilerinizle yazışın'
                : user?.sinifKodu
                  ? 'Hocanızla yazışın'
                  : 'Önce sınıfa katılın (Ayarlar)';
        }
        updateOgrenciSinifUI(user);
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
        if (avatar && avatar.includes('<img')) return avatar;
        return `<span class="text-2xl">${escapeHtml(avatar || '🐱')}</span>`;
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

    window.refreshMesajBadge = async function () {
        if (!window._loginDone) return;
        try {
            const data = await apiFetch('/api/messages/unread-count');
            updateMesajBadges(data.unreadTotal || 0);
            const contactsData = await apiFetch('/api/messages/contacts');
            _waContactsCache = contactsData.contacts || [];
            updateMesajHomePreview(_waContactsCache);
        } catch (e) {}
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

    function renderWaList(contacts) {
        if (!contacts.length) {
            return `<div class="flex flex-col items-center justify-center flex-1 px-6 text-center wa-empty-state">
                <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background:rgba(127,168,138,0.12);border:1px solid rgba(127,168,138,0.25)">
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
                return `<button type="button" data-wa-partner="${c.uid}" data-wa-name="${escapeHtml(c.name)}" class="wa-list-item wa-contact-btn w-full flex items-center gap-3 px-4 py-3.5 text-left${unreadCls}">
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
                html += `<div class="text-center my-3"><span class="wa-date-chip">${escapeHtml(dateLabel)}</span></div>`;
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
            ? 'wa-bubble-sent ml-auto' + (pending ? ' wa-bubble--pending' : '')
            : 'wa-bubble-received mr-auto';
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
        return `<div class="wa-search-wrap relative">
            <i data-lucide="search" class="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 wa-empty-state pointer-events-none"></i>
            <input type="search" id="wa-search-input" class="wa-search-input" placeholder="Kişi veya mesaj ara..." autocomplete="off" />
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
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        const host = document.getElementById('app-container') || document.body;
        host.appendChild(el);
        document.addEventListener('keydown', onWaEscapeKey);
        return el;
    }

    function renderWaShell(innerHtml, headerHtml, headerMode) {
        const el = ensureWaOverlay();
        el.innerHTML = `
            <div class="wa-overlay-inner">
                <div class="wa-header flex items-center gap-2 px-3 py-3">${headerHtml}</div>
                <div class="wa-body">${innerHtml}</div>
            </div>`;
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
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="flex-1 min-w-0 px-1">
                <h2 class="text-base font-bold theme-text-main">Mesajlar</h2>
                <p class="text-[10px] theme-text-muted">${currentUserRole === 'hoca' ? `${count} kişi · Öğrencileriniz` : 'Hocanız ile güvenli sohbet'}</p>
            </div>`;
    }

    function waChatHeaderHtml(p) {
        return `
            <button type="button" id="wa-btn-back" aria-label="Geri" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </button>
            <div class="w-10 h-10 rounded-full wa-contact-avatar flex items-center justify-center overflow-hidden flex-shrink-0">${formatAvatarHtml(p.avatar)}</div>
            <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold theme-text-main truncate">${escapeHtml(p.name)}</h2>
                <p class="text-[10px] theme-text-muted">${p.role === 'hoca' ? 'Hoca · Çevrimiçi' : 'Öğrenci · Sınıf sohbeti'}</p>
            </div>
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>`;
    }

    function waQuickRepliesHtml() {
        return getWaQuickReplies()
            .map((t) => `<button type="button" class="wa-quick-reply">${escapeHtml(t)}</button>`)
            .join('');
    }

    async function loadWaContacts() {
        const data = await apiFetch('/api/messages/contacts');
        _waContactsCache = data.contacts || [];
        updateMesajBadges(data.unreadTotal || 0);
        updateMesajHomePreview(_waContactsCache);
        const listHtml = renderWaList(_waContactsCache);
        renderWaShell(
            `${waSearchBarHtml()}<div id="wa-contacts-list" class="flex-1 overflow-y-auto min-h-0">${listHtml}</div>`,
            waListHeaderHtml(),
            'list'
        );
        bindWaSearch();
    }

    window.showMesajlar = async function () {
        playClickSound();
        const user = await ensureServerSession();
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
                    <div class="wa-quick-replies">${waQuickRepliesHtml()}</div>
                    <div class="wa-input-bar flex items-end gap-2 px-3 py-2">
                        <textarea id="wa-message-input" rows="1" maxlength="2000" placeholder="Mesaj yazın..." class="wa-message-input"></textarea>
                        <button type="button" id="wa-send-btn" class="wa-send-btn wa-header-btn w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0">
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

    window.onLoginSuccessHook = function (user) {
        updateRoleBasedUI(user);
        setTimeout(() => window.refreshMesajBadge(), 600);
        if (user.role !== 'hoca') {
            setTimeout(() => window.syncProgressToServer(), 800);
        }
    };

    document.addEventListener('appReady', () => {
        setTimeout(trySessionRestore, 300);
        if (currentUser) updateRoleBasedUI(currentUser);
    });
    document.addEventListener('DOMContentLoaded', () => setTimeout(trySessionRestore, 2000));
})();
