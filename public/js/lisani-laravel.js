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
            streakDays: u.streakDays ?? 0,
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

    window.odevVer = function (hocaUid) {
        const icerik = document.getElementById('odev-icerik').value.trim();
        if (!icerik) {
            showToast('Ödev içeriği boş olamaz.', 'error');
            return;
        }
        apiFetch('/api/sinif/odev', {
            method: 'POST',
            body: JSON.stringify({ icerik }),
        })
            .then((data) => {
                _saveLocalSinif(hocaUid, data.sinif);
                showToast('Ödev gönderildi!', 'success');
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
            return '<p class="text-[9px] text-gray-500 dark:text-neutral-400 py-2 text-center">Henüz çözülmüş test kaydı yok.</p>';
        }

        let rows = '';
        sinavlar.forEach((s) => {
            const pct = s.percent ?? 0;
            const pctCls =
                pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-blue-400' : 'text-amber-400';
            rows += `<tr class="border-b border-gray-200 dark:border-neutral-700/50">
                <td class="py-1.5 pr-1 text-[9px] text-gray-500 dark:text-neutral-400 whitespace-nowrap">${s.date || '—'}</td>
                <td class="py-1.5 pr-1 text-[9px] text-gray-900 dark:text-neutral-100">S${s.level}</td>
                <td class="py-1.5 pr-1 text-[9px] text-gray-900 dark:text-neutral-100 truncate max-w-[72px]">${s.test || '—'}</td>
                <td class="py-1.5 px-1 text-[9px] font-bold text-emerald-400 text-center">${s.correct ?? 0}</td>
                <td class="py-1.5 px-1 text-[9px] font-bold text-red-400 text-center">${s.wrong ?? 0}</td>
                <td class="py-1.5 pl-1 text-[9px] font-bold ${pctCls} text-right">%${pct}</td>
            </tr>`;
        });

        return `
        <div class="mt-2 p-2 rounded-xl bg-black/25 border border-gray-200 dark:border-neutral-700/50">
            <p class="text-[9px] font-bold text-gray-500 dark:text-neutral-400 mb-2">
                Özet: <span class="text-emerald-400">${a.toplamDogru} doğru</span> ·
                <span class="text-red-400">${a.toplamYanlis} yanlış</span> ·
                ${sinavlar.length} kayıtlı sınav
            </p>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[8px] text-gray-500 dark:text-neutral-400 uppercase">
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
                    ? `<p class="text-[9px] text-gray-500 dark:text-neutral-400 mt-1 truncate">Son: ${o.lastTestLabel}${o.lastTestPercent != null ? ' · %' + o.lastTestPercent : ''}</p>`
                    : '<p class="text-[9px] text-gray-500 dark:text-neutral-400 mt-1">Henüz sınav çözmedi</p>';
                ogrencilerHTML += `
                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl active:bg-gray-50 dark:active:bg-neutral-800 transition-colors rounded-2xl p-3.5 mb-2.5 border border-gray-200 dark:border-neutral-700">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl flex-shrink-0">${o.avatar || '🎒'}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-xs font-extrabold text-gray-900 dark:text-neutral-100 truncate">${o.name}</span>
                                ${statusBadge(o.activityStatus)}
                            </div>
                            <p class="text-[9px] text-gray-500 dark:text-neutral-400 mt-0.5">${formatLastActive(o.lastActiveAt)}</p>
                            ${lastTest}
                            <div class="mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden">
                                <div class="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" style="width:${barW}%"></div>
                            </div>
                            <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] font-bold">
                                <span class="text-amber-400">${o.totalXp || 0} XP</span>
                                <span class="text-gray-500 dark:text-neutral-400">${o.testsCount || 0} sınav</span>
                                <span class="text-emerald-400">%${o.avgSuccess || 0} ort.</span>
                                <span class="text-emerald-400">✓ ${analiz.toplamDogru ?? 0}</span>
                                <span class="text-red-400">✗ ${analiz.toplamYanlis ?? 0}</span>
                            </div>
                            <button type="button" onclick="toggleOgrenciRapor('${o.uid}')" class="mt-2 w-full py-1.5 rounded-lg text-[9px] font-bold border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 hover:opacity-90 flex items-center justify-center gap-1">
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
                '<div class="text-center py-8"><p class="text-3xl mb-2">👥</p><p class="text-xs text-gray-500 dark:text-neutral-400">Henüz öğrenci yok.<br>Aşağıdaki sınıf kodunu öğrencilerinize verin.</p></div>';
        }

        let odevlerHTML = '';
        const odevler = sinif.odevler || [];
        if (odevler.length > 0) {
            odevler
                .slice(-3)
                .reverse()
                .forEach((o) => {
                    odevlerHTML += `<div class="py-1.5 border-b border-gray-200 dark:border-neutral-700 last:border-0"><p class="text-xs text-gray-900 dark:text-neutral-100">${o.icerik}</p><p class="text-[10px] text-gray-500 dark:text-neutral-400">${o.tarih}</p></div>`;
                });
        }

        let panel = document.getElementById('hoca-panel-modal');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'hoca-panel-modal';
            panel.className = 'absolute inset-0 z-50 flex flex-col bg-gray-50 dark:bg-neutral-950 absolute inset-0 z-50 flex flex-col bg-gray-50 dark:bg-neutral-950';
            const host = document.getElementById('app-container') || document.body;
            host.appendChild(panel);
        }

        panel.innerHTML = `
        <div class="flex flex-col h-full w-full max-w-none lg:max-w-4xl lg:mx-auto">
            <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-neutral-700">
                <div>
                    <h2 class="text-sm font-extrabold text-gray-900 dark:text-neutral-100">📊 Öğrenci Takip Paneli</h2>
                    <p class="text-[10px] text-gray-500 dark:text-neutral-400">${sinif.sinifAdi || 'Sınıf'}</p>
                </div>
                <button onclick="document.getElementById('hoca-panel-modal').remove()" class="w-9 h-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:opacity-80">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div class="grid grid-cols-2 gap-2">
                    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3 text-center">
                        <p class="text-[9px] text-gray-500 dark:text-neutral-400 uppercase font-bold">Öğrenci</p>
                        <p class="text-lg font-black text-amber-400">${ozet.ogrenciSayisi ?? ogrenciler.length}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3 text-center">
                        <p class="text-[9px] text-gray-500 dark:text-neutral-400 uppercase font-bold">Aktif (7 gün)</p>
                        <p class="text-lg font-black text-emerald-400">${ozet.aktifOgrenci ?? 0}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3 text-center">
                        <p class="text-[9px] text-gray-500 dark:text-neutral-400 uppercase font-bold">Sınıf Ort.</p>
                        <p class="text-lg font-black text-blue-400">%${ozet.ortalamaBasari ?? 0}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3 text-center">
                        <p class="text-[9px] text-gray-500 dark:text-neutral-400 uppercase font-bold">Toplam XP</p>
                        <p class="text-lg font-black text-blue-600 dark:text-blue-400">${ozet.toplamXp ?? 0}</p>
                    </div>
                    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3 text-center col-span-2">
                        <p class="text-[9px] text-gray-500 dark:text-neutral-400 uppercase font-bold">Sınıf test özeti</p>
                        <p class="text-[10px] font-bold mt-1">
                            <span class="text-emerald-400">${ozet.toplamDogru ?? 0} doğru</span>
                            <span class="text-gray-500 dark:text-neutral-400 mx-1">·</span>
                            <span class="text-red-400">${ozet.toplamYanlis ?? 0} yanlış</span>
                            <span class="text-gray-500 dark:text-neutral-400 mx-1">·</span>
                            <span class="text-gray-900 dark:text-neutral-100">${ozet.toplamSinav ?? 0} sınav</span>
                        </p>
                    </div>
                </div>
                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-2xl p-4 border border-amber-500/20">
                    <p class="text-[10px] text-gray-500 dark:text-neutral-400 mb-1">Sınıf kodu (öğrencilere verin)</p>
                    <p class="text-2xl font-black text-amber-400 font-mono tracking-widest text-center">${sinif.kisaKod || '—'}</p>
                </div>
                <div>
                    <h3 class="text-xs font-extrabold text-gray-900 dark:text-neutral-100 mb-1 flex items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4 text-amber-400"></i>
                        Öğrenci Durumları & Analiz
                    </h3>
                    <p class="text-[9px] text-gray-500 dark:text-neutral-400 mb-2">Her öğrencide «Analiz Raporu» ile test detaylarını görün.</p>
                    ${ogrencilerHTML}
                </div>
                ${odevlerHTML ? `<div><h3 class="text-xs font-extrabold text-gray-900 dark:text-neutral-100 mb-2">📋 Son Ödevler</h3><div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-xl p-3">${odevlerHTML}</div></div>` : ''}
                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl rounded-2xl p-4">
                    <h3 class="text-xs font-extrabold text-gray-900 dark:text-neutral-100 mb-2">📝 Yeni Ödev Ver</h3>
                    <textarea id="odev-icerik" placeholder="Ödev içeriğini yazın..." class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 text-xs focus:outline-none resize-none h-20 mb-2"></textarea>
                    <button onclick="odevVer('${uid}')" class="w-full py-2.5 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition-colors rounded-xl text-xs font-bold">Ödevi Gönder</button>
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
            const studiedLetters =
                typeof window.getStudiedLettersList === 'function'
                    ? window.getStudiedLettersList()
                    : [];

            const data = await apiFetch('/api/progress/sync', {
                method: 'POST',
                body: JSON.stringify({
                    total_xp: typeof totalScore !== 'undefined' ? totalScore : 0,
                    tests_count: solvedCount,
                    avg_success: avgSuccess,
                    studied_letters: studiedLetters,
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
            if (typeof window.applyProgressFromServer === 'function') {
                window.applyProgressFromServer(data);
            }
        } catch (e) {}
    };

    window.loadProgressFromServer = async function () {
        if (!currentUser || currentUserRole === 'hoca') return;
        try {
            const data = await apiFetch('/api/progress');
            if (typeof window.applyProgressFromServer === 'function') {
                window.applyProgressFromServer(data);
            }
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
            list.innerHTML = `<p class="text-[10px] text-gray-500 dark:text-neutral-400 text-center py-3">${data.message}</p>`;
            return;
        }

        const odevler = data.odevler || [];
        if (odevler.length === 0) {
            list.innerHTML =
                '<p class="text-[10px] text-gray-500 dark:text-neutral-400 text-center py-3">Henüz ödev yok. Hocanız ödev verdiğinde burada görünecek.</p>';
            return;
        }

        list.innerHTML = odevler
            .map(
                (o) => `
            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl active:bg-gray-50 dark:active:bg-neutral-800 transition-colors rounded-xl p-3 border border-gray-200 dark:border-neutral-700">
                <p class="text-xs text-gray-900 dark:text-neutral-100 leading-relaxed">${o.icerik}</p>
                <p class="text-[9px] text-gray-500 dark:text-neutral-400 mt-1.5 flex justify-between">
                    <span>${o.hocaAdi || data.hocaAdi || 'Hoca'}</span>
                    <span>${o.tarih || ''}</span>
                </p>
            </div>`
            )
            .join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

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
            if (mevcut) mevcut.innerHTML = `Kayıtlı: <strong class="text-gray-900 dark:text-neutral-100">${ad}</strong>${kod ? ' · Kod: <span class="font-mono text-amber-400">' + kod + '</span>' : ''}`;
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

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function formatAvatarHtml(avatar) {
        if (avatar && avatar.includes('<img')) return avatar;
        return `<span class="text-2xl">${escapeHtml(avatar || '🐱')}</span>`;
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
            return `<div class="flex flex-col items-center justify-center flex-1 px-6 text-center">
                <i data-lucide="message-circle" class="w-12 h-12 text-emerald-500/40 mb-3"></i>
                <p class="text-sm text-[#8696a0]">Henüz sohbet yok</p>
                <p class="text-[11px] text-[#667781] mt-2">${currentUserRole === 'hoca' ? 'Sınıfınıza öğrenci katıldığında burada görünür.' : 'Ayarlar → Sınıf kodunu girerek hocanıza ulaşın.'}</p>
            </div>`;
        }
        return contacts
            .map((c) => {
                const unread =
                    c.unreadCount > 0
                        ? `<span class="bg-emerald-500 text-white min-w-5 h-5 text-[10px] font-bold rounded-full px-1.5 flex items-center justify-center text-[9px]">${c.unreadCount > 99 ? '99+' : c.unreadCount}</span>`
                        : `<span class="text-[10px] text-[#8696a0]">${c.lastAt || ''}</span>`;
                const preview = c.lastMessage
                    ? escapeHtml(c.lastMessage)
                    : '<span class="italic text-[#667781]">Mesaj yok</span>';
                return `<button type="button" data-wa-partner="${c.uid}" class="wa-contact-btn w-full flex items-center gap-3 px-4 py-3 text-left bg-[#111b21] border-b border-white/5 active:bg-[#202c33]">
                    <div class="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center flex-shrink-0 overflow-hidden">${formatAvatarHtml(c.avatar)}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-sm font-semibold text-[#e9edef] truncate">${escapeHtml(c.name)}</span>
                            ${unread}
                        </div>
                        <p class="text-[12px] text-[#8696a0] truncate mt-0.5">${preview}</p>
                    </div>
                </button>`;
            })
            .join('');
    }

    function renderWaMessages(messages) {
        if (!messages.length) {
            return `<div class="text-center text-[11px] text-[#8696a0] py-8">Henüz mesaj yok. İlk mesajı siz gönderin 👋</div>`;
        }
        let lastDate = '';
        let html = '';
        messages.forEach((m) => {
            if (m.date !== lastDate) {
                lastDate = m.date;
                html += `<div class="text-center my-3"><span class="text-[10px] bg-[#182229] text-[#8696a0] px-3 py-1 rounded-lg">${escapeHtml(m.date)}</span></div>`;
            }
            const cls = m.isMine
                ? 'ml-auto bg-[#005c4b] text-[#e9edef] rounded-lg rounded-br-none'
                : 'mr-auto bg-[#202c33] text-[#e9edef] rounded-lg rounded-bl-none';
            const tick = m.isMine
                ? m.read
                    ? '<span class="text-[#53bdeb] ml-1">✓✓</span>'
                    : '<span class="text-[#8696a0] ml-1">✓</span>'
                : '';
            html += `<div class="flex ${m.isMine ? 'justify-end' : 'justify-start'} mb-1.5 px-1">
                <div class="${cls} max-w-[82%] px-3 py-2 text-[13px] leading-relaxed break-words">
                    <p>${escapeHtml(m.body)}</p>
                    <p class="text-[9px] text-right mt-1 opacity-70 flex items-center justify-end gap-0.5">${m.time}${tick}</p>
                </div>
            </div>`;
        });
        return html;
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
        el.className = 'absolute inset-0 z-[80] flex flex-col w-full h-full max-h-full overflow-hidden bg-[#0b141a]';
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
            <div class="flex flex-col flex-1 min-h-0 w-full h-full">
                <div class="flex-shrink-0 flex items-center gap-2 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-[#1f2c34] border-b border-white/5">${headerHtml}</div>
                <div class="flex flex-1 min-h-0 flex-col overflow-hidden">${innerHtml}</div>
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
        return `
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-white/10">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="flex-1 min-w-0 px-1">
                <h2 class="text-base font-bold text-[#e9edef]">Mesajlar</h2>
                <p class="text-[10px] text-[#8696a0]">${currentUserRole === 'hoca' ? 'Öğrencileriniz' : 'Hocanız'}</p>
            </div>`;
    }

    function waChatHeaderHtml(p) {
        return `
            <button type="button" id="wa-btn-back" aria-label="Geri" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-white/10">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </button>
            <div class="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center overflow-hidden flex-shrink-0">${formatAvatarHtml(p.avatar)}</div>
            <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold text-[#e9edef] truncate">${escapeHtml(p.name)}</h2>
                <p class="text-[10px] text-[#8696a0]">${p.role === 'hoca' ? 'Hoca' : 'Öğrenci'}</p>
            </div>
            <button type="button" id="wa-btn-close" aria-label="Kapat" class="wa-header-btn w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-white/10">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>`;
    }

    async function loadWaContacts() {
        const data = await apiFetch('/api/messages/contacts');
        updateMesajBadges(data.unreadTotal || 0);
        const listHtml = renderWaList(data.contacts || []);
        renderWaShell(`<div class="flex-1 overflow-y-auto min-h-0">${listHtml}</div>`, waListHeaderHtml(), 'list');
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

    async function loadWaThread(partnerId, silent) {
        const data = await apiFetch('/api/messages/' + encodeURIComponent(partnerId));
        const partner = data.partner;
        const box = document.getElementById('wa-messages-box');
        if (!box) return;
        const wasBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
        box.innerHTML = renderWaMessages(data.messages || []);
        if (wasBottom || !silent) {
            box.scrollTop = box.scrollHeight;
        }
        if (!silent) refreshMesajBadge();
    }

    window.openWaChat = async function (partnerId) {
        _waActivePartnerId = partnerId;
        _waView = 'chat';
        showLoading('Sohbet açılıyor...');
        try {
            const data = await apiFetch('/api/messages/' + encodeURIComponent(partnerId));
            const p = data.partner;
            hideLoading();
            renderWaShell(
                `<div class="flex flex-col flex-1 min-h-0 h-full">
                    <div id="wa-messages-box" class="flex-1 min-h-0 overflow-y-auto px-3 py-4 bg-[#0b141a]">${renderWaMessages(data.messages || [])}</div>
                    <div class="flex-shrink-0 flex items-end gap-2 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#1f2c34] border-t border-white/5">
                        <textarea id="wa-message-input" rows="1" maxlength="2000" placeholder="Mesaj yazın..." class="flex-1 resize-none max-h-24 bg-[#2a3942] text-[#e9edef] text-sm rounded-2xl px-4 py-2.5 border-0 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"></textarea>
                        <button type="button" id="wa-send-btn" class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-[#25d366] text-white disabled:opacity-45">
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
            const box = document.getElementById('wa-messages-box');
            if (box) box.scrollTop = box.scrollHeight;
            const input = document.getElementById('wa-message-input');
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
        try {
            await apiFetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiver_id: parseInt(_waActivePartnerId, 10),
                    body,
                }),
            });
            if (input) {
                input.value = '';
                input.style.height = 'auto';
            }
            await loadWaThread(_waActivePartnerId, true);
        } catch (e) {
            showToast(e.message || 'Gönderilemedi.', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    };

    window.onLoginSuccessHook = function (user) {
        updateRoleBasedUI(user);
        setTimeout(() => window.refreshMesajBadge(), 600);
        if (user.role !== 'hoca') {
            setTimeout(() => window.loadProgressFromServer(), 400);
        }
    };

    document.addEventListener('appReady', () => {
        setTimeout(trySessionRestore, 300);
        if (currentUser) updateRoleBasedUI(currentUser);
    });
    document.addEventListener('DOMContentLoaded', () => setTimeout(trySessionRestore, 2000));
})();
