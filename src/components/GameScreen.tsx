import React, { useEffect, useRef } from "react";

// =====================================================================
// 1. 오리지널 SURF 스프라이트 (assets 폴더에 반드시 있어야 함!)
// =====================================================================
import playerSpriteSheetUrl from "../assets/player.png";
import enemySpriteSheetUrl from "../assets/enemy.png";
import rocksSpriteSheetUrl from "../assets/rocks.png";
import objectsSpriteSheetUrl from "../assets/objects.png";
import graveSpriteSheetUrl from "../assets/grave.png";
import terrainSpriteSheetUrl from "../assets/terrain.png";
import fireSpriteSheetUrl from "../assets/fire.png";

// =====================================================================
// 2. 4단계 배경 레이어 (석영님이 올려주신 파일명과 정확히 일치)
// =====================================================================
import rockLayer1Url from "../assets/rock_layer1.png";
import rockLayer2Url from "../assets/rock_layer2.png";
import rockLayerSandUrl from "../assets/rock_layer_sand.png";
import rockLayerTargetUrl from "../assets/rock_layer_target.png"; // 목표 셰일층

interface GameScreenProps {
  mapData?: any;
  onExit?: () => void;
}

export function GameScreen({ mapData, onExit }: GameScreenProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;
    const container = gameContainerRef.current;
    container.innerHTML = "";

    // =====================================================================
    // [핵심 설정] 1.5배 확대 & 게임 룰
    // =====================================================================
    // CSS로 화면을 꽉 채우되, 캔버스 논리적 해상도를 줄여서 모든 오브젝트가 1.5배 커보이게 만듭니다.
    const CANVAS_WIDTH = Math.floor(1280 / 1.5); // 약 854
    const CANVAS_HEIGHT = Math.floor(720 / 1.5); // 약 480
    const GAME_MAX_TIME = 60; // 60초 타임어택
    const TARGET_SCORE = 10;

    // --- SURF 오리지널 타입 및 변수 ---
    type SceneState = "menu" | "playing" | "gameover";
    type SpawnType = "npc" | "enemy" | "rock" | "snag" | "snagsml" | "snagtall" | "ramp" | "boost" | "life" | "lure" | "spin" | "spiral" | "block";
    
    // 이미지 객체 로드
    const imgs = {
      player: new Image(), enemy: new Image(), rocks: new Image(), 
      objects: new Image(), grave: new Image(), terrain: new Image(), fire: new Image(),
      bg1: new Image(), bg2: new Image(), bgSand: new Image(), bgTarget: new Image()
    };
    imgs.player.src = playerSpriteSheetUrl; imgs.enemy.src = enemySpriteSheetUrl;
    imgs.rocks.src = rocksSpriteSheetUrl; imgs.objects.src = objectsSpriteSheetUrl;
    imgs.grave.src = graveSpriteSheetUrl; imgs.terrain.src = terrainSpriteSheetUrl;
    imgs.fire.src = fireSpriteSheetUrl;
    imgs.bg1.src = rockLayer1Url; imgs.bg2.src = rockLayer2Url; 
    imgs.bgSand.src = rockLayerSandUrl; imgs.bgTarget.src = rockLayerTargetUrl;

    // =====================================================================
    // [DOM 생성] UI 및 캔버스
    // =====================================================================
    const root = document.createElement("div");
    root.style.cssText = "position:relative; width:100%; height:100%; overflow:hidden;";

    const hud = document.createElement("div");
    hud.style.cssText = "position:absolute; top:15px; left:15px; z-index:10; color:white; font-family:'VT323', monospace; font-size:24px; text-shadow:2px 2px 0 #000;";
    const hpText = document.createElement("div");
    const scoreText = document.createElement("div");
    const timeText = document.createElement("div");
    const bgGuide = document.createElement("div");
    bgGuide.style.marginTop = "8px";
    hud.append(hpText, scoreText, timeText, bgGuide);

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
    // 캔버스를 CSS로 화면에 꽉 채워서 자동 1.5배 스케일링 효과
    canvas.style.cssText = "display:block; width:100%; height:100%; object-fit:cover; image-rendering:pixelated;";
    
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color:white; background:rgba(0,0,0,0.85); padding:40px; border-radius:10px; border:4px solid #f59e0b; display:none; font-family:'VT323', monospace;";
    const overlayTitle = document.createElement("h1"); overlayTitle.style.fontSize = "3rem";
    const overlayMsg = document.createElement("h2"); overlayMsg.style.whiteSpace = "pre-line";
    const overlayBtn = document.createElement("button");
    overlayBtn.style.cssText = "padding:10px 20px; font-size:1.5rem; margin-top:20px; cursor:pointer; background:#059669; color:white; border:none;";
    overlay.append(overlayTitle, overlayMsg, overlayBtn);

    root.append(hud, canvas, overlay);
    container.appendChild(root);

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // =====================================================================
    // [SURF 원본 로직 이식] 플레이어, 상태, 파티클(FX)
    // =====================================================================
    let lastFrameTime = performance.now();
    let scene: SceneState = "menu";
    let currentScore = 0;
    
    const sys = { time: { elapsed: 0 }, lives: { current: 3, max: 3 }, finish: false, dist: { x: CANVAS_WIDTH/2, y: 0 } };
    let worldSpeed = 180; 

    const player = {
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      vel: { x: 0, y: 0 },
      angle: (-90 * Math.PI) / 180,
      hitbox: { w: 35, h: 47 },
      invincibleTimer: 0,
      pose: "player_go",
    };

    const input = { moveVec: { x: 0, y: 0 }, isBoost: false };
    const pressedKeys = new Set<string>();

    // 원본 FX 시스템
    let fxId = 0;
    const fx = { particles: [] as any[], boostTrail: [] as any[] };

    function pushFxParticle(kind: string, x: number, y: number, vx: number, vy: number, size: number, ttl: number) {
      fx.particles.push({ id: fxId++, kind, x, y, vx, vy, size, age: 0, ttl });
    }

    // 엔티티 관리
    let entityIdCounter = 0;
    let entities: any[] = [];
    
    const ENTITY_META: Record<string, any> = {
      rock: { w: 56, h: 53, solid: true, hazard: true, collectible: "none" },
      snag: { w: 58, h: 53, solid: true, hazard: true, collectible: "none" },
      boost: { w: 36, h: 44, solid: false, hazard: false, collectible: "boost" },
      life: { w: 64, h: 64, solid: false, hazard: false, collectible: "life" },
    };

    function spawnRandomObstacles() {
      // 오리지널보다 스폰율 상향 (매운맛)
      if (Math.random() < 0.05) {
        const type = Math.random() < 0.5 ? "rock" : "snag";
        entities.push({
          id: entityIdCounter++, type, x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + 100,
          w: ENTITY_META[type].w, h: ENTITY_META[type].h, solid: true, hazard: true, collectible: "none"
        });
      }
      if (Math.random() < 0.015) { // 보석(HP)
        entities.push({
          id: entityIdCounter++, type: "life", x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + 100,
          w: 36, h: 44, solid: false, hazard: false, collectible: "life"
        });
      }
    }

    function resetGame() {
      sys.time.elapsed = 0; sys.lives.current = 3; sys.finish = false; currentScore = 0;
      player.pos.x = CANVAS_WIDTH / 2; player.invincibleTimer = 0;
      entities = []; fx.particles = []; fx.boostTrail = [];
      scene = "playing"; updateHUD();
    }

    // =====================================================================
    // [업데이트 루프]
    // =====================================================================
    function update(dt: number) {
      if (scene !== "playing") return;
      sys.time.elapsed += dt;
      currentScore = Math.min(TARGET_SCORE, Math.floor((sys.time.elapsed / GAME_MAX_TIME) * TARGET_SCORE));

      if (sys.time.elapsed >= GAME_MAX_TIME) {
        scene = "gameover"; sys.finish = true;
        overlayTitle.textContent = "목표 지층 도달! 🏆";
        overlayMsg.textContent = `최종 점수: ${currentScore} / 10\n석유가 있는 셰일층에 성공적으로 도달했습니다!`;
        overlayBtn.textContent = "결과 확인";
        updateHUD(); return;
      }
      if (sys.lives.current <= 0) {
        scene = "gameover"; sys.finish = true;
        overlayTitle.textContent = "드릴 파괴됨 💥";
        overlayMsg.textContent = `점수: ${currentScore} / 10\n암반에 부딪혀 수명을 다했습니다.`;
        overlayBtn.textContent = "다시 시도";
        updateHUD(); return;
      }

      // 조작 및 물리 (오리지널 가속/감속 느낌 유지)
      let targetVx = 0;
      if (pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA")) { targetVx = -250; player.pose = "player_double_left"; player.angle = -120 * Math.PI/180; }
      else if (pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD")) { targetVx = 250; player.pose = "player_double_right"; player.angle = -60 * Math.PI/180; }
      else { player.pose = "player_go"; player.angle = -90 * Math.PI/180; }

      player.vel.x += (targetVx - player.vel.x) * dt * 5;
      player.pos.x += player.vel.x * dt;
      player.pos.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, player.pos.x));
      
      if (player.invincibleTimer > 0) player.invincibleTimer -= dt;

      const worldShiftY = worldSpeed * dt;
      sys.dist.y += worldShiftY;

      // 파티클 (부스트 트레일 효과 복구)
      if (Math.random() < 0.3) {
        fx.boostTrail.push({ id: fxId++, start: {x: player.pos.x, y: player.pos.y}, end: {x: player.pos.x, y: player.pos.y + 40}, age: 0, ttl: 0.3 });
      }
      for (const trail of fx.boostTrail) { trail.start.y -= worldShiftY; trail.end.y -= worldShiftY; trail.age += dt; }
      fx.boostTrail = fx.boostTrail.filter(t => t.age < t.ttl);

      for (const p of fx.particles) { p.x += p.vx * dt; p.y += p.vy * dt - worldShiftY; p.age += dt; }
      fx.particles = fx.particles.filter(p => p.age < p.ttl);

      spawnRandomObstacles();

      // 충돌 처리
      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        e.y -= worldShiftY * (e.hazard ? 0.8 : 1.2); // 바위는 약간 느리게, 보석은 빠르게

        const hit = Math.abs(e.x - player.pos.x) < (e.w + player.hitbox.w)/2 * 0.7 && 
                    Math.abs(e.y - player.pos.y) < (e.h + player.hitbox.h)/2 * 0.7;

        if (hit && player.invincibleTimer <= 0) {
          if (e.hazard) {
            sys.lives.current--; player.invincibleTimer = 1.0;
            // 피격 파티클
            for(let j=0; j<8; j++) pushFxParticle("hit", player.pos.x, player.pos.y, (Math.random()-0.5)*200, (Math.random()-0.5)*200, 8, 0.5);
          } else if (e.collectible === "life" && sys.lives.current < 3) {
            sys.lives.current++;
            // 회복 파티클
            for(let j=0; j<6; j++) pushFxParticle("pickup", player.pos.x, player.pos.y, (Math.random()-0.5)*100, -100, 6, 0.4);
          }
          entities.splice(i, 1);
        } else if (e.y < -100) {
          entities.splice(i, 1);
        }
      }
      updateHUD();
    }

    // =====================================================================
    // [렌더링] 배경 지층 전환 및 오리지널 스프라이트
    // =====================================================================
    function drawTiledBackground() {
      const elapsed = sys.time.elapsed;
      let currentBg = imgs.bg1; // 기본 Overburden
      let bgName = "일반 암반층";

      // 시간에 따른 4단계 지층 텍스처 교체 로직
      if (elapsed > 45) { currentBg = imgs.bgTarget; bgName = "목표 셰일층 (Target)"; }
      else if (elapsed > 30) { currentBg = imgs.bgSand; bgName = "사암층 (Sandstone)"; }
      else if (elapsed > 15) { currentBg = imgs.bg2; bgName = "석회암층 (Limestone)"; }

      bgGuide.innerHTML = `현재 지층: <span style="color:#10b981;">${bgName}</span>`;

      if (currentBg.complete && currentBg.naturalWidth > 0) {
        const tileW = 256; const tileH = 256; // 텍스처 타일 크기
        const oy = ((-sys.dist.y % tileH) + tileH) % tileH;
        for (let x = 0; x < CANVAS_WIDTH + tileW; x += tileW) {
          for (let y = oy - tileH; y < CANVAS_HEIGHT + tileH; y += tileH) {
            ctx.drawImage(currentBg, Math.floor(x), Math.floor(y), tileW, tileH);
          }
        }
      } else {
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }

    function render() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawTiledBackground();

      // 파티클 트레일 렌더링
      for (const trail of fx.boostTrail) {
        ctx.globalAlpha = 1 - (trail.age / trail.ttl);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(trail.start.x - 10, trail.start.y, 20, 10);
      }
      for (const p of fx.particles) {
        ctx.globalAlpha = 1 - (p.age / p.ttl);
        ctx.fillStyle = p.kind === "hit" ? "#ef4444" : "#10b981";
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;

      // 엔티티 렌더링 (오리지널 좌표 사용)
      for (const e of entities) {
        if (e.type === "rock" && imgs.rocks.complete) {
          ctx.drawImage(imgs.rocks, 3, 585, 56, 53, e.x - e.w/2, e.y - e.h/2, e.w, e.h);
        } else if (e.type === "snag" && imgs.rocks.complete) {
          ctx.drawImage(imgs.rocks, 67, 582, 56, 56, e.x - e.w/2, e.y - e.h/2, e.w, e.h);
        } else if (e.collectible === "life" && imgs.objects.complete) {
          ctx.drawImage(imgs.objects, 1041, 8, 36, 44, e.x - 18, e.y - 22, 36, 44);
        }
      }

      // 플레이어 렌더링
      if (scene === "playing" || scene === "gameover") {
        ctx.globalAlpha = player.invincibleTimer > 0 && Math.floor(sys.time.elapsed * 15) % 2 === 0 ? 0.5 : 1.0;
        if (imgs.player.complete) {
          const walkFrame = Math.floor(sys.time.elapsed * 10) % 9;
          const frameX = 17 + (walkFrame * 64);
          ctx.drawImage(imgs.player, frameX, 655, 35, 47, player.pos.x - 17, player.pos.y - 23, 35, 47);
        }
        ctx.globalAlpha = 1.0;
      }
    }

    function updateHUD() {
      if (scene === "menu") {
        overlayTitle.textContent = "지구 뚫기 준비 완료!";
        overlayMsg.textContent = "보석을 먹어 체력을 회복하고 바위를 피하세요.\n4단계 지층을 뚫고 60초간 생존해야 합니다!";
        overlayBtn.textContent = "작전 시작 (Space)";
        overlay.style.display = "block";
      } else if (scene === "playing") {
        overlay.style.display = "none";
        hpText.textContent = `HP: ${"❤️".repeat(sys.lives.current)}`;
        scoreText.textContent = `평가 점수: ${currentScore} / 10`;
        timeText.textContent = `남은 시간: ${Math.max(0, Math.ceil(GAME_MAX_TIME - sys.time.elapsed))}초`;
      } else {
        overlay.style.display = "block";
      }
    }

    // =====================================================================
    // [이벤트 등록 및 루프 실행]
    // =====================================================================
    overlayBtn.addEventListener("click", () => {
      if (scene === "menu") resetGame();
      else if (scene === "gameover") sys.finish && sys.lives.current > 0 && onExit ? onExit() : resetGame();
    });

    const onKeyDown = (e: KeyboardEvent) => { pressedKeys.add(e.code); if(e.code==="Space" && scene==="menu") resetGame(); };
    const onKeyUp = (e: KeyboardEvent) => pressedKeys.delete(e.code);
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);

    let animationId: number;
    function loop(now: number) {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      update(dt); render();
      animationId = requestAnimationFrame(loop);
    }
    updateHUD();
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return <div ref={gameContainerRef} style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }} />;
}