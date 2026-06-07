/**
 * Tenis — Three.js 3D sahne (lisani.js fizik motoruna bağlı)
 */
(function () {
    'use strict';

    const COURT_W = 11;
    const COURT_D = 15;
    const BALL_R_3D = 0.26;
    const PADDLE_BASE_W = 1.15;

    let hostEl = null;
    let hudEl = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    let courtGroup = null;
    let ballMesh = null;
    let ballShadow = null;
    let playerPaddle = null;
    let botPaddle = null;
    let trailMeshes = [];
    let resizeObs = null;
    let guestView = false;
    let animT = 0;

    function getThree() {
        return typeof THREE !== 'undefined' ? THREE : null;
    }

    function mapX(x, w) {
        return (x / w - 0.5) * COURT_W;
    }

    function mapZ(y, h) {
        return (y / h - 0.5) * COURT_D;
    }

    function mapPaddleW(paddleWidth, tennisW) {
        return (paddleWidth / tennisW) * COURT_W;
    }

    function createPaddle(THREE, color, emissive, vertical) {
        const mat = new THREE.MeshStandardMaterial({
            color,
            emissive,
            emissiveIntensity: vertical ? 0.28 : 0.18,
            metalness: 0.25,
            roughness: 0.42,
        });
        const geo = vertical
            ? new THREE.BoxGeometry(PADDLE_BASE_W, 0.92, 0.4)
            : new THREE.BoxGeometry(PADDLE_BASE_W, 0.14, 0.42);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = !vertical;
        return mesh;
    }

    function setPaddleScale(paddle, width3d, mul) {
        if (!paddle) return;
        const s = (width3d / PADDLE_BASE_W) * (mul || 1);
        paddle.scale.set(s, s, s);
    }

    function createCourt(THREE) {
        const group = new THREE.Group();

        const outerMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.88, metalness: 0.04 });
        const innerMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78, metalness: 0.06 });
        const outer = new THREE.Mesh(new THREE.PlaneGeometry(COURT_W + 2.4, COURT_D + 2.4), outerMat);
        outer.rotation.x = -Math.PI / 2;
        outer.receiveShadow = true;
        group.add(outer);

        const inner = new THREE.Mesh(new THREE.PlaneGeometry(COURT_W, COURT_D), innerMat);
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 0.008;
        inner.receiveShadow = true;
        group.add(inner);

        const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        const line = (w, d, x, z) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.015, d), lineMat);
            m.position.set(x, 0.02, z);
            group.add(m);
        };

        line(COURT_W, 0.07, 0, -COURT_D / 2 + 0.15);
        line(COURT_W, 0.07, 0, COURT_D / 2 - 0.15);
        line(0.07, COURT_D, -COURT_W / 2 + 0.15, 0);
        line(0.07, COURT_D, COURT_W / 2 - 0.15, 0);
        line(COURT_W * 0.88, 0.05, 0, 0);
        line(COURT_W * 0.44, 0.05, -COURT_W / 4, -COURT_D / 4);
        line(COURT_W * 0.44, 0.05, COURT_W / 4, -COURT_D / 4);
        line(COURT_W * 0.44, 0.05, -COURT_W / 4, COURT_D / 4);
        line(COURT_W * 0.44, 0.05, COURT_W / 4, COURT_D / 4);

        const netGroup = new THREE.Group();
        const netMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        for (let i = -18; i <= 18; i++) {
            const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.82, 4), netMat);
            s.position.set(i * 0.28, 0.41, 0);
            netGroup.add(s);
        }
        for (let j = 0; j < 8; j++) {
            const r = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, COURT_W * 0.92, 4), netMat);
            r.rotation.z = Math.PI / 2;
            r.position.set(0, 0.12 + j * 0.1, 0);
            netGroup.add(r);
        }
        const tape = new THREE.Mesh(new THREE.BoxGeometry(COURT_W * 0.94, 0.06, 0.08), lineMat);
        tape.position.y = 0.82;
        netGroup.add(tape);
        group.add(netGroup);

        const postMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.75, roughness: 0.25 });
        [-COURT_W / 2 + 0.12, COURT_W / 2 - 0.12].forEach((x) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 12), postMat);
            post.position.set(x, 0.47, 0);
            post.castShadow = true;
            group.add(post);
        });

        return group;
    }

    function updateCamera() {
        if (!camera) return;
        if (guestView) {
            camera.position.set(0, 5.6, -9.8);
            camera.lookAt(0, 0.75, 0.5);
        } else {
            camera.position.set(0, 5.6, 9.8);
            camera.lookAt(0, 0.75, -0.5);
        }
    }

    function resize() {
        if (!renderer || !camera || !hostEl) return;
        const w = Math.max(hostEl.clientWidth, 1);
        const h = Math.max(hostEl.clientHeight, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    function ensureHud() {
        if (!hostEl) return null;
        let hud = hostEl.querySelector('#tennis-3d-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'tennis-3d-hud';
            hud.className = 'absolute inset-0 pointer-events-none flex items-center justify-center z-[5]';
            hostEl.appendChild(hud);
        }
        return hud;
    }

    function updateHud(state) {
        hudEl = ensureHud();
        if (!hudEl) return;
        if (state.tennisCountdown > 0) {
            const n = Math.ceil(state.tennisCountdown);
            hudEl.innerHTML = `<span class="text-5xl font-black text-white drop-shadow-lg">${n}</span>`;
            hudEl.classList.remove('hidden');
        } else if (state.tennisPaused && !state.tennisMatchOver) {
            hudEl.innerHTML = `<span class="text-sm font-black text-cyan-100 tracking-widest bg-black/50 px-4 py-2 rounded-xl">DURAKLATILDI</span>`;
            hudEl.classList.remove('hidden');
        } else {
            hudEl.innerHTML = '';
            hudEl.classList.add('hidden');
        }
    }

    function syncTrail(THREE, state) {
        const trail = state.ballTrail || [];
        while (trailMeshes.length > trail.length) {
            const m = trailMeshes.pop();
            scene.remove(m);
            m.geometry?.dispose();
            m.material?.dispose();
        }
        while (trailMeshes.length < trail.length) {
            const mat = new THREE.MeshStandardMaterial({
                color: 0xfde047,
                emissive: 0xca8a04,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.35,
            });
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(BALL_R_3D * 0.45, 8, 8), mat);
            scene.add(mesh);
            trailMeshes.push(mesh);
        }
        trail.forEach((p, i) => {
            const mesh = trailMeshes[i];
            if (!mesh) return;
            const a = (i + 1) / trail.length;
            mesh.position.set(mapX(p.x, state.TENNIS_W), 0.18 + a * 0.25, mapZ(p.y, state.TENNIS_H));
            mesh.material.opacity = 0.12 + a * 0.35;
        });
    }

    function updatePaddles(state, pw) {
        const norm = (state.playerPaddleX + state.paddleWidth / 2) / state.TENNIS_W;
        const slide = (norm - 0.5) * 2.35;
        const botX = mapX(state.computerPaddleX + state.paddleWidth / 2, state.TENNIS_W);
        const botZ = guestView ? COURT_D / 2 - 0.55 : -COURT_D / 2 + 0.55;

        if (playerPaddle) {
            setPaddleScale(playerPaddle, pw, 1.62);
            playerPaddle.visible = state.tennisCountdown <= 0;
            if (playerPaddle.userData.onCamera) {
                playerPaddle.position.set(slide, -0.68, -1.65);
                playerPaddle.rotation.set(-0.38, guestView ? Math.PI : 0, 0);
            } else {
                const playerZ = guestView ? -COURT_D / 2 + 0.55 : COURT_D / 2 - 0.55;
                playerPaddle.position.set(mapX(state.playerPaddleX + state.paddleWidth / 2, state.TENNIS_W), 0.46, playerZ);
            }
        }
        if (botPaddle) {
            setPaddleScale(botPaddle, pw, 1);
            botPaddle.position.set(botX, 0.46, botZ);
        }
    }

    function init(hostElement) {
        const THREE = getThree();
        if (!THREE || !hostElement) return false;

        dispose();

        hostEl = hostElement;
        hostEl.classList.add('relative', 'w-full', 'h-full', 'overflow-hidden');
        hostEl.innerHTML = '';

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0c1929);
        scene.fog = new THREE.Fog(0x0c1929, 22, 48);

        camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
        updateCamera();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if ('toneMapping' in renderer) {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.08;
        }
        renderer.domElement.className = 'w-full h-full block touch-none';
        hostEl.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xbfe9ff, 0x14532d, 0.55));

        const sun = new THREE.DirectionalLight(0xfff7ed, 1.15);
        sun.position.set(8, 16, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 45;
        sun.shadow.camera.left = -14;
        sun.shadow.camera.right = 14;
        sun.shadow.camera.top = 14;
        sun.shadow.camera.bottom = -14;
        scene.add(sun);

        const rim = new THREE.DirectionalLight(0x67e8f9, 0.35);
        rim.position.set(-6, 8, -8);
        scene.add(rim);

        courtGroup = createCourt(THREE);
        scene.add(courtGroup);

        playerPaddle = createPaddle(THREE, 0x22d3ee, 0x22d3ee, true);
        playerPaddle.userData.onCamera = true;
        playerPaddle.userData.vertical = true;
        playerPaddle.castShadow = false;
        if (playerPaddle.material) {
            playerPaddle.material.emissiveIntensity = 0.42;
        }
        botPaddle = createPaddle(THREE, 0xf87171, 0xdc2626, true);
        botPaddle.userData.vertical = true;

        camera.add(playerPaddle);
        scene.add(camera);
        scene.add(botPaddle);

        const ballMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xeab308,
            emissiveIntensity: 0.35,
            metalness: 0.15,
            roughness: 0.28,
        });
        ballMesh = new THREE.Mesh(new THREE.SphereGeometry(BALL_R_3D, 32, 32), ballMat);
        ballMesh.castShadow = true;
        scene.add(ballMesh);

        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.28,
        });
        ballShadow = new THREE.Mesh(new THREE.CircleGeometry(BALL_R_3D * 1.1, 20), shadowMat);
        ballShadow.rotation.x = -Math.PI / 2;
        ballShadow.position.y = 0.025;
        scene.add(ballShadow);

        ensureHud();
        resize();

        if (typeof ResizeObserver !== 'undefined') {
            resizeObs = new ResizeObserver(resize);
            resizeObs.observe(hostEl);
        }
        window.addEventListener('resize', resize);

        return true;
    }

    function renderFrame(state) {
        if (!renderer || !scene || !camera || !state) return;

        animT += 1;
        guestView = !!state.flipOnlineGuest;
        updateCamera();

        const pw = mapPaddleW(state.paddleWidth, state.TENNIS_W);
        updatePaddles(state, pw);

        const bx = mapX(state.ballX, state.TENNIS_W);
        const bz = mapZ(state.ballY, state.TENNIS_H);
        const by = BALL_R_3D + 0.14 + Math.abs(Math.sin(animT * 0.14)) * 0.06;

        ballMesh.position.set(bx, by, bz);
        ballMesh.rotation.x += 0.12;
        ballMesh.rotation.z += 0.08;

        if (ballShadow) {
            ballShadow.position.set(bx, 0.026, bz);
            ballShadow.scale.setScalar(0.85 + by * 0.35);
            ballShadow.material.opacity = Math.max(0.12, 0.42 - by * 0.08);
        }

        const THREE = getThree();
        if (THREE) syncTrail(THREE, state);

        updateHud(state);
        renderer.render(scene, camera);
    }

    function disposeObject(root) {
        if (!root) return;
        root.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
                else obj.material.dispose();
            }
        });
    }

    function dispose() {
        window.removeEventListener('resize', resize);
        if (resizeObs && hostEl) {
            resizeObs.unobserve(hostEl);
            resizeObs.disconnect();
        }
        resizeObs = null;

        trailMeshes.forEach((m) => {
            m.geometry?.dispose();
            m.material?.dispose();
        });
        trailMeshes = [];

        if (playerPaddle && camera) {
            camera.remove(playerPaddle);
        }
        if (camera && scene) {
            scene.remove(camera);
        }

        disposeObject(playerPaddle);
        disposeObject(botPaddle);
        disposeObject(ballMesh);
        disposeObject(ballShadow);

        if (renderer) {
            renderer.dispose();
            renderer.domElement?.remove();
        }

        scene = null;
        camera = null;
        renderer = null;
        ballMesh = null;
        ballShadow = null;
        playerPaddle = null;
        botPaddle = null;
        courtGroup = null;
        hudEl = null;

        if (hostEl) hostEl.innerHTML = '';
        hostEl = null;
        guestView = false;
        animT = 0;
    }

    window.LisaniTennis3D = {
        init,
        renderFrame,
        dispose,
        isReady() {
            return !!renderer;
        },
        getSurfaceElement() {
            return hostEl || null;
        },
    };
})();
