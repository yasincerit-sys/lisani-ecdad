/**
 * Gizli Flappy Bird — Kariyer Modu kartına üç kez tıklayınca açılır.
 */
(function () {
    'use strict';

    const REF_H = 520;
    let canvas = null;
    let ctx = null;
    let loopId = null;
    let running = false;
    let started = false;
    let gameOver = false;
    let score = 0;
    let best = 0;
    let bird = null;
    let pipes = [];
    let hills = [];
    let frame = 0;
    let lastTs = 0;
    let groundOffset = 0;
    let pipeDist = 0;
    let canvasW = 320;
    let canvasH = 480;
    let scorePop = 0;
    let deathFlash = 0;
    let boundFlap = null;
    let lastFlapAt = 0;
    let lastPipeTop = null;
    let bgScroll = 0;

    function s(v) {
        return v * (canvasH / REF_H);
    }

    function cfg() {
        return {
            birdR: s(15),
            hitR: s(10.5),
            gravity: s(920),
            flap: -s(310),
            maxFall: s(480),
            pipeW: s(54),
            pipeGap: s(158),
            pipeSpace: s(268),
            scroll: s(108),
            groundH: s(44),
            birdX: canvasW * 0.28,
        };
    }

    function groundY() {
        return canvasH - cfg().groundH;
    }

    function loadBest() {
        try {
            best = parseInt(localStorage.getItem('lisani_flappy_best') || '0', 10) || 0;
        } catch (_) {
            best = 0;
        }
        syncBestBadge();
    }

    function saveBest() {
        try {
            localStorage.setItem('lisani_flappy_best', String(best));
        } catch (_) { /* ignore */ }
        syncBestBadge();
    }

    function syncBestBadge() {
        const el = document.getElementById('flappy-best-score');
        if (el) el.textContent = 'En iyi: ' + best;
    }

    function beep(high) {
        if (typeof window.playTennisBeep === 'function') {
            window.playTennisBeep(high ? 520 : 360, 0.045);
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        const box = canvas.parentElement;
        if (!box) return;
        const w = Math.max(box.clientWidth, 280);
        const h = Math.max(box.clientHeight, 380);
        canvas.width = Math.floor(w);
        canvas.height = Math.floor(h);
        canvasW = canvas.width;
        canvasH = canvas.height;
        if (bird) {
            bird.baseY = canvasH * 0.42;
            bird.x = cfg().birdX;
        }
    }

    function resetGame() {
        const c = cfg();
        bird = { x: c.birdX, y: canvasH * 0.42, vy: 0, baseY: canvasH * 0.42, rot: 0 };
        pipes = [];
        pipeDist = 0;
        score = 0;
        frame = 0;
        groundOffset = 0;
        scorePop = 0;
        deathFlash = 0;
        lastPipeTop = null;
        bgScroll = 0;
        started = false;
        gameOver = false;
        lastTs = 0;

        pipes.push(makePipe(canvasW + s(40)));
        pipes.push(makePipe(canvasW + s(40) + c.pipeSpace));
    }

    function makePipe(x) {
        const c = cfg();
        const margin = s(72);
        const minTop = margin;
        const maxTop = groundY() - c.pipeGap - margin;
        const mid = (minTop + maxTop) * 0.5;

        let topH;
        if (lastPipeTop === null) {
            topH = mid + (Math.random() - 0.5) * s(50);
        } else {
            const step = (Math.random() - 0.5) * s(95);
            topH = lastPipeTop + step;
        }
        topH = Math.max(minTop, Math.min(maxTop, topH));
        lastPipeTop = topH;

        return { x, top: topH, passed: false };
    }

    function spawnPipe() {
        pipes.push(makePipe(canvasW + cfg().pipeW));
    }

    function flap() {
        if (!running) return;
        const now = performance.now();
        if (now - lastFlapAt < 70) return;
        lastFlapAt = now;

        if (gameOver) {
            resetGame();
            return;
        }
        if (!started) started = true;
        bird.vy = cfg().flap;
        beep(false);
    }

    function hitTest() {
        const c = cfg();
        const gy = groundY();
        if (bird.y + c.hitR >= gy - 2 || bird.y - c.hitR <= s(8)) return true;

        for (const p of pipes) {
            const pad = s(3);
            const inX = bird.x + c.hitR > p.x + pad && bird.x - c.hitR < p.x + c.pipeW - pad;
            if (!inX) continue;
            if (bird.y - c.hitR < p.top + s(4) || bird.y + c.hitR > p.top + c.pipeGap - s(4)) return true;
        }
        return false;
    }

    function initHills() {
        hills = [
            { color: '#86efac', parallax: 0.08, amp: 0.07, freq: 0.0055, y: 0.72 },
            { color: '#4ade80', parallax: 0.14, amp: 0.085, freq: 0.0075, y: 0.78 },
            { color: '#22c55e', parallax: 0.22, amp: 0.1, freq: 0.0095, y: 0.84 },
        ];
    }

    function drawSky() {
        const g = ctx.createLinearGradient(0, 0, 0, canvasH);
        g.addColorStop(0, '#38bdf8');
        g.addColorStop(0.45, '#7dd3fc');
        g.addColorStop(1, '#bae6fd');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvasW, canvasH);

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        const clouds = [
            [0.12, 0.14, 0.09],
            [0.55, 0.08, 0.07],
            [0.78, 0.18, 0.08],
        ];
        clouds.forEach(([nx, ny, nr], i) => {
            const cx = ((bgScroll * (0.06 + i * 0.015) + nx * canvasW) % (canvasW + s(120))) - s(60);
            const cy = ny * canvasH;
            const r = nr * canvasW;
            ctx.beginPath();
            ctx.ellipse(cx, cy, r, r * 0.38, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + r * 0.55, cy + s(4), r * 0.72, r * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawHills() {
        hills.forEach((hill) => {
            const baseY = canvasH * hill.y;
            ctx.fillStyle = hill.color;
            ctx.beginPath();
            ctx.moveTo(0, canvasH);
            for (let x = 0; x <= canvasW; x += 6) {
                const wave = Math.sin((x + bgScroll * hill.parallax) * hill.freq) * canvasH * hill.amp;
                ctx.lineTo(x, baseY + wave);
            }
            ctx.lineTo(canvasW, canvasH);
            ctx.closePath();
            ctx.fill();
        });
    }

    function roundRect(x, y, w, h, r) {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
            return;
        }
        ctx.fillRect(x, y, w, h);
    }

    function drawPipePair(p) {
        const c = cfg();
        const capH = s(16);
        const r = s(6);

        const bodyGrad = ctx.createLinearGradient(p.x, 0, p.x + c.pipeW, 0);
        bodyGrad.addColorStop(0, '#166534');
        bodyGrad.addColorStop(0.35, '#22c55e');
        bodyGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = bodyGrad;

        roundRect(p.x, 0, c.pipeW, p.top, [r, r, 0, 0]);
        roundRect(p.x, p.top + c.pipeGap, c.pipeW, groundY() - p.top - c.pipeGap, [0, 0, r, r]);

        ctx.fillStyle = '#15803d';
        roundRect(p.x - s(4), p.top - capH, c.pipeW + s(8), capH, s(4));
        roundRect(p.x - s(4), p.top + c.pipeGap, c.pipeW + s(8), capH, s(4));

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(p.x + s(8), s(6), s(6), p.top - s(12));
        ctx.fillRect(p.x + s(8), p.top + c.pipeGap + s(10), s(6), groundY() - p.top - c.pipeGap - s(16));
    }

    function drawGround() {
        const gy = groundY();
        const gh = cfg().groundH;

        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, gy, canvasW, gh);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, gy, canvasW, s(10));

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = s(2);
        for (let x = -groundOffset; x < canvasW + s(30); x += s(26)) {
            ctx.beginPath();
            ctx.moveTo(x, gy + s(12));
            ctx.lineTo(x + s(14), gy + gh);
            ctx.stroke();
        }

        ctx.fillStyle = '#fde68a';
        ctx.fillRect(0, gy - s(3), canvasW, s(3));
    }

    function drawBird() {
        const c = cfg();
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rot);

        ctx.shadowColor = 'rgba(15,23,42,0.35)';
        ctx.shadowBlur = s(8);
        ctx.shadowOffsetY = s(3);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, 0, c.birdR, c.birdR * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(-s(3), s(2), s(9), s(6), 0.2, 0, Math.PI * 2);
        ctx.fill();

        const wing = Math.sin(frame * 0.45) * s(5);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(-s(5), wing, s(10), s(5), -0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s(5), -s(4), s(5), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(s(6), -s(4), s(2.2), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.moveTo(c.birdR - s(2), s(1));
        ctx.lineTo(c.birdR + s(8), s(4));
        ctx.lineTo(c.birdR - s(2), s(7));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawHud() {
        ctx.textAlign = 'center';

        if (scorePop > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, scorePop) + ')';
            ctx.font = 'bold ' + Math.floor(s(34)) + 'px system-ui,sans-serif';
            ctx.fillText('+' + score, canvasW / 2, canvasH * 0.32);
            scorePop -= 0.06;
        }

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(15,23,42,0.45)';
        ctx.lineWidth = s(3);
        ctx.font = '900 ' + Math.floor(s(38)) + 'px system-ui,sans-serif';
        ctx.strokeText(String(score), canvasW / 2, s(52));
        ctx.fillText(String(score), canvasW / 2, s(52));

        if (!started && !gameOver) {
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = '800 ' + Math.floor(s(16)) + 'px system-ui,sans-serif';
            ctx.fillText('Zıplamak için dokun', canvasW / 2, canvasH * 0.52);
            ctx.font = '600 ' + Math.floor(s(11)) + 'px system-ui,sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fillText('Space veya yukarı ok', canvasW / 2, canvasH * 0.57);
        }

        if (gameOver) {
            ctx.fillStyle = 'rgba(15,23,42,0.62)';
            ctx.fillRect(0, 0, canvasW, canvasH);

            const panelW = Math.min(canvasW * 0.78, s(260));
            const panelH = s(150);
            const px = (canvasW - panelW) / 2;
            const py = canvasH * 0.36;

            ctx.fillStyle = '#0f172a';
            roundRect(px, py, panelW, panelH, s(14));
            ctx.fillStyle = 'rgba(34,211,238,0.15)';
            ctx.strokeStyle = 'rgba(34,211,238,0.45)';
            ctx.lineWidth = s(2);
            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(px, py, panelW, panelH, s(14));
                ctx.stroke();
            }

            ctx.fillStyle = '#fff';
            ctx.font = '800 ' + Math.floor(s(20)) + 'px system-ui,sans-serif';
            ctx.fillText('Oyun Bitti', canvasW / 2, py + s(42));
            ctx.font = '600 ' + Math.floor(s(14)) + 'px system-ui,sans-serif';
            ctx.fillStyle = '#bae6fd';
            ctx.fillText('Skor: ' + score + '  ·  En iyi: ' + best, canvasW / 2, py + s(76));
            ctx.fillStyle = '#67e8f9';
            ctx.font = '700 ' + Math.floor(s(13)) + 'px system-ui,sans-serif';
            ctx.fillText('Tekrar oynamak için dokun', canvasW / 2, py + s(112));
        }

        if (deathFlash > 0) {
            ctx.fillStyle = 'rgba(248,113,113,' + deathFlash + ')';
            ctx.fillRect(0, 0, canvasW, canvasH);
            deathFlash -= 0.08;
        }
    }

    function update(dt) {
        const c = cfg();
        bird.x = c.birdX;

        if (!started && !gameOver) {
            bird.baseY = canvasH * 0.42;
            bird.y = bird.baseY + Math.sin(frame * 0.08) * s(10);
            bird.vy = 0;
            bird.rot = Math.sin(frame * 0.08) * 0.08;
            return;
        }

        if (gameOver) return;

        bird.vy += c.gravity * dt;
        if (bird.vy > c.maxFall) bird.vy = c.maxFall;
        bird.y += bird.vy * dt;
        bird.rot = Math.max(-0.45, Math.min(1.1, bird.vy * 0.0028));

        pipeDist += c.scroll * dt;
        while (pipeDist >= c.pipeSpace) {
            pipeDist -= c.pipeSpace;
            spawnPipe();
        }

        pipes.forEach((p) => {
            p.x -= c.scroll * dt;
            if (!p.passed && p.x + c.pipeW < bird.x - c.hitR) {
                p.passed = true;
                score++;
                scorePop = 1;
                beep(true);
            }
        });
        pipes = pipes.filter((p) => p.x + c.pipeW > -s(20));

        if (hitTest()) {
            gameOver = true;
            deathFlash = 0.35;
            if (score > best) {
                best = score;
                saveBest();
            }
            if (typeof window.playTennisBeep === 'function') {
                window.playTennisBeep(120, 0.15);
            }
        }
    }

    function tick(ts) {
        if (!running || !ctx) return;
        if (!lastTs) lastTs = ts;
        let dt = (ts - lastTs) / 1000;
        lastTs = ts;
        if (dt > 0.05) dt = 0.05;

        frame++;
        const c = cfg();
        const scrollNow = started && !gameOver ? c.scroll : c.scroll * 0.12;
        bgScroll += scrollNow * dt;
        groundOffset = (groundOffset + scrollNow * dt * 0.28) % s(26);

        update(dt);

        drawSky();
        drawHills();
        pipes.forEach(drawPipePair);
        drawGround();
        drawBird();
        drawHud();

        loopId = requestAnimationFrame(tick);
    }

    function bindInput() {
        if (!canvas || boundFlap) return;
        boundFlap = (e) => {
            e.preventDefault();
            flap();
        };
        canvas.addEventListener('pointerdown', boundFlap);
    }

    function unbindInput() {
        if (!canvas || !boundFlap) return;
        canvas.removeEventListener('pointerdown', boundFlap);
        boundFlap = null;
    }

    function onKeyDown(e) {
        if (!running) return;
        const container = document.getElementById('flappy-game-container');
        if (!container || container.classList.contains('hidden')) return;
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            flap();
        }
    }

    function init() {
        canvas = document.getElementById('flappy-canvas');
        if (!canvas) return false;
        ctx = canvas.getContext('2d');
        initHills();
        loadBest();
        bindInput();
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        resetGame();
        return true;
    }

    function start() {
        if (!canvas && !init()) return false;
        resizeCanvas();
        resetGame();
        running = true;
        lastTs = 0;
        if (loopId) cancelAnimationFrame(loopId);
        loopId = requestAnimationFrame(tick);
        return true;
    }

    function stop() {
        running = false;
        lastTs = 0;
        if (loopId) {
            cancelAnimationFrame(loopId);
            loopId = null;
        }
    }

    function dispose() {
        stop();
        unbindInput();
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', resizeCanvas);
        canvas = null;
        ctx = null;
    }

    window.LisaniFlappy = { init, start, stop, dispose };
})();
