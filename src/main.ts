import "./style.css";
import playerSpriteSheetUrl from "./assets/player.png";
import bgTileUrl from "./assets/bg_1.png";
import enemySpriteSheetUrl from "./assets/enemy.png";
import rocksSpriteSheetUrl from "./assets/rocks.png";
import objectsSpriteSheetUrl from "./assets/objects.png";
import graveSpriteSheetUrl from "./assets/grave.png";
import terrainSpriteSheetUrl from "./assets/terrain.png";
import fireSpriteSheetUrl from "./assets/fire.png";

type SceneState = "menu" | "playing" | "paused" | "gameover";
type Group = "top" | "btm" | "npc" | "enemy";
type CollectibleType = "none" | "life" | "boost";
type SpawnType =
  | "npc"
  | "enemy"
  | "rock"
  | "snag"
  | "snagsml"
  | "snagtall"
  | "spin"
  | "spiral"
  | "block"
  | "blockbig"
  | "marker"
  | "guide"
  | "slow"
  | "slowbig"
  | "bump"
  | "bumpbig"
  | "ramp"
  | "boost"
  | "life"
  | "coin"
  | "friend"
  | "lure"
  | "ambient"
  | "finish"
  | "checkpoint"
  | "gate"
  | "swap";
type EntityType = SpawnType | "player";
type PhaseName = "easy" | "hard" | "recovery";
type SteerDirection = "left" | "right" | "downleft" | "downright" | "down" | "stop";
type PlayerPose =
  | "player_left"
  | "player_right"
  | "player_double_left"
  | "player_double_right"
  | "player_go"
  | "player_stop"
  | "player_invincible";

type ClusterEntry = [number, number, string?];
type ClusterDefinition = Partial<Record<SpawnType, ClusterEntry[]>>;
type ClusterLibrary = Record<string, Record<string, ClusterDefinition>>;
type EnemyFrameKey = "enemy1" | "enemy2" | "enemy3" | "enemy4" | "enemy5" | "enemy6" | "enemy7";
type RockFrameKey = "rock1" | "rock2" | "rock3" | "rock4" | "rock5" | "rock6";
type SnugFrameKey = "snug1" | "snug2" | "snug3" | "snug4";
type BoostFrameKey = "boost1" | "boost2" | "boost3" | "boost4";

interface Vec2 {
  x: number;
  y: number;
}

interface Hitbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SpawnTimer {
  next: number;
  inc: number;
}

interface RuntimeGameState {
  time: {
    loop: number;
    elapsed: number;
    scale: number;
  };
  dist: {
    unit: number;
    x: number;
    y: number;
  };
  lives: {
    current: number;
    max: number;
    numCollected: number;
  };
  boosts: {
    current: number;
    max: number;
    numCollected: number;
    numUsed: number;
  };
  finish: boolean;
  caught: boolean;
  highScore: boolean;
}

interface StatsData {
  highScore: number;
  plays: number;
}

interface Entity {
  id: number;
  type: EntityType;
  group: Group;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  label: string;
  variant: string;
  solid: boolean;
  hazard: boolean;
  collectible: CollectibleType;
  ttl: number;
  sleep: boolean;
}

interface PlayerState {
  pos: Vec2;
  vel: Vec2;
  acc: Vec2;
  maxSpeed: number;
  hitbox: Hitbox;
  movementLockTimer: number;
  invincibleTimer: number;
}

interface InputState {
  moveVec: Vec2;
  isBoost: boolean;
  isBrake: boolean;
}

interface PhaseConfig {
  name: PhaseName;
  speedMul: number;
  rowMul: number;
  enemyMul: number;
  npcMul: number;
}

interface EnemyChaseState {
  mode: "chase" | "orbit_entry" | "orbit";
  angle: number;
  dist: number;
  timerDir: number;
  speedRaw: number;
  speedCurrent: number;
  speedMax: number;
  accel: number;
  crashTimer: number;
  objectsHit: Set<number>;
  time: number;
  orbitTime: number;
  orbitDuration: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitOmega: number;
  orbitPhase: number;
  orbitEntryTime: number;
  orbitEntryDuration: number;
  orbitEntryVx: number;
  orbitEntryVy: number;
  burnTimer: number;
}

interface FireEntity {
  id: number;
  enemyId: number;
  x: number;
  y: number;
  w: number;
  h: number;
  age: number;
  sleep: boolean;
}

interface EntitySheetMeta {
  w: number;
  h: number;
  str: "crash" | "avoid" | "boost" | "";
  group: Group;
  hazard: boolean;
  collectible: CollectibleType;
  solid: boolean;
}

type FxKind = "boost" | "danger" | "pickupBoost" | "pickupLife" | "hit";

interface FxParticle {
  id: number;
  kind: FxKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  ttl: number;
}

interface FxBoostTrail {
  id: number;
  start: Vec2;
  end: Vec2;
  age: number;
  ttl: number;
}

interface EnemyFrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PLAYER_FRAME_WIDTH = 35;
const PLAYER_FRAME_HEIGHT = 47;
const PLAYER_WALK_FPS = 8;
const BOOST_ANIMATION_FPS = 10;
const PLAYER_FRAMES: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 17, y: 655, w: 35, h: 47 },
  { x: 81, y: 655, w: 35, h: 47 },
  { x: 145, y: 655, w: 34, h: 48 },
  { x: 209, y: 655, w: 36, h: 47 },
  { x: 273, y: 655, w: 36, h: 48 },
  { x: 337, y: 655, w: 36, h: 47 },
  { x: 401, y: 655, w: 34, h: 48 },
  { x: 465, y: 655, w: 33, h: 47 },
  { x: 529, y: 655, w: 34, h: 48 },
];
const ENEMY_FRAMES: Record<EnemyFrameKey, EnemyFrameRect> = {
  enemy1: { x: 181, y: 9, w: 45, h: 73 },
  enemy2: { x: 164, y: 244, w: 72, h: 78 },
  enemy3: { x: 6, y: 349, w: 60, h: 63 },
  enemy4: { x: 97, y: 349, w: 44, h: 65 },
  enemy5: { x: 97, y: 158, w: 44, h: 79 },
  enemy6: { x: 184, y: 348, w: 32, h: 65 },
  enemy7: { x: 94, y: 19, w: 44, h: 76 },
};
const ENEMY_FRAME_KEYS: EnemyFrameKey[] = [
  "enemy1",
  "enemy2",
  "enemy3",
  "enemy4",
  "enemy5",
  "enemy6",
  "enemy7",
];
const ROCK_FRAMES: Record<RockFrameKey, EnemyFrameRect> = {
  rock1: { x: 3, y: 585, w: 56, h: 53 },
  rock2: { x: 67, y: 582, w: 56, h: 56 },
  rock3: { x: 132, y: 585, w: 58, h: 57 },
  rock4: { x: 197, y: 591, w: 57, h: 47 },
  rock5: { x: 646, y: 520, w: 117, h: 142 },
  rock6: { x: 769, y: 525, w: 138, h: 104 },
};
const ROCK_FRAME_KEYS: RockFrameKey[] = ["rock1", "rock2", "rock3", "rock4", "rock5", "rock6"];
const SNUG_FRAMES: Record<SnugFrameKey, EnemyFrameRect> = {
  snug1: { x: 3, y: 73, w: 58, h: 53 },
  snug2: { x: 387, y: 1, w: 123, h: 94 },
  snug3: { x: 646, y: 8, w: 117, h: 142 },
  snug4: { x: 515, y: 2, w: 61, h: 79 },
};
const SNUG_FRAME_KEYS: SnugFrameKey[] = ["snug1", "snug2", "snug3", "snug4"];
const BOOST_FRAMES: Record<BoostFrameKey, EnemyFrameRect> = {
  boost1: { x: 1041, y: 8, w: 36, h: 44 },
  boost2: { x: 1041, y: 72, w: 36, h: 44 },
  boost3: { x: 1041, y: 136, w: 36, h: 44 },
  boost4: { x: 1041, y: 200, w: 36, h: 44 },
};
const BOOST_FRAME_KEYS: BoostFrameKey[] = ["boost1", "boost2", "boost3", "boost4"];
const LURE_FRAME: EnemyFrameRect = { x: 2, y: 1, w: 60, h: 94 };
const RAMP_FRAME: EnemyFrameRect = { x: 489, y: 70, w: 81, h: 79 };
const FIRE_FRAMES: ReadonlyArray<EnemyFrameRect> = [
  { x: 18, y: 13, w: 27, h: 48 },
  { x: 82, y: 13, w: 27, h: 48 },
  { x: 145, y: 12, w: 28, h: 48 },
  { x: 209, y: 11, w: 27, h: 49 },
  { x: 273, y: 11, w: 27, h: 49 },
  { x: 337, y: 11, w: 27, h: 49 },
  { x: 401, y: 9, w: 26, h: 50 },
  { x: 465, y: 9, w: 26, h: 50 },
  { x: 530, y: 9, w: 25, h: 50 },
];
const BG_TILE_SIZE = 512;
const BG_TILE_ALPHA = 0.15;
const BACKGROUND_COLORS = {
  s0: "#F1C27B",
  s1000: "#FFD89C",
  s2000: "#A2CDB0",
  s3000: "#85A389",
} as const;
const WHITE = "#ffffff";
const BLACK = "#000000";
const STORAGE_KEY = "geoquest_stats_v1";
const BASE_WORLD_SPEED = 150;
const ENEMY_OBSTACLE_BLOCK_TIME = 1.0;
const PLAYER_HIT_LOCK_TIME = 1.0;
const PLAYER_INVINCIBLE_MOVE_TIME = 3.0;
const DOWN_DOUBLE_TAP_WINDOW = 0.28;
const BOOST_DISTANCE_TRACKER = 2000;
const BOOST_SPEED_MULTIPLIER = 2;
const BOOST_TRAIL_INTERVAL = 0.08;
const DANGER_FX_SCREEN_INTERVAL = 0.4;
const DANGER_FX_NEAR_INTERVAL = 0.2;
const ENEMY_ORBIT_DURATION = 0.8;
const ENEMY_ORBIT_CENTER_Y_OFFSET = 80;
const ENEMY_BEHIND_RESPAWN_Y = 200;
const ENEMY_BURN_DURATION = 2.2;
const FIRE_ANIMATION_FPS = 14;
const FIRE_DRAW_W = 28;
const FIRE_DRAW_H = 50;
const GUARANTEED_BOOST_UNIT_INTERVAL = 50;
const OBSTACLE_SPAWN_MULTIPLIER = 2;
const ENEMY_ORBIT_RADIUS_X_MIN = 68;
const ENEMY_ORBIT_RADIUS_X_MAX = 104;
const ENEMY_ORBIT_RADIUS_Y_MIN = 44;
const ENEMY_ORBIT_RADIUS_Y_MAX = 76;
const ENEMY_ORBIT_ENTRY_MIN = 0.1;
const ENEMY_ORBIT_ENTRY_MAX = 0.2;
const FX_PICKUP_BURST = 6;
const FX_HIT_BURST = 8;
const FX_TRAIL_TTL = 0.5;
const FX_PARTICLE_MAX = 180;

const ENTITY_SHEET_META: Record<SpawnType, EntitySheetMeta> = {
  npc: { w: 64, h: 64, str: "crash", group: "npc", hazard: false, collectible: "none", solid: false },
  enemy: {
    w: 72,
    h: 79,
    str: "crash",
    group: "enemy",
    hazard: true,
    collectible: "none",
    solid: true,
  },
  rock: { w: 138, h: 142, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  snag: { w: 123, h: 142, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  snagsml: { w: 64, h: 64, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  snagtall: { w: 64, h: 128, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  spin: { w: 32, h: 32, str: "avoid", group: "top", hazard: true, collectible: "none", solid: true },
  spiral: { w: 128, h: 128, str: "avoid", group: "btm", hazard: true, collectible: "none", solid: true },
  block: { w: 128, h: 128, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  blockbig: { w: 192, h: 128, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  marker: { w: 64, h: 64, str: "crash", group: "top", hazard: true, collectible: "none", solid: true },
  guide: { w: 32, h: 32, str: "avoid", group: "top", hazard: true, collectible: "none", solid: true },
  slow: { w: 64, h: 64, str: "avoid", group: "btm", hazard: true, collectible: "none", solid: true },
  slowbig: { w: 192, h: 64, str: "avoid", group: "btm", hazard: true, collectible: "none", solid: true },
  bump: { w: 64, h: 64, str: "avoid", group: "btm", hazard: true, collectible: "none", solid: true },
  bumpbig: { w: 192, h: 64, str: "avoid", group: "btm", hazard: true, collectible: "none", solid: true },
  ramp: { w: 81, h: 79, str: "boost", group: "top", hazard: true, collectible: "none", solid: true },
  boost: { w: 36, h: 44, str: "boost", group: "top", hazard: false, collectible: "boost", solid: false },
  life: { w: 64, h: 64, str: "boost", group: "top", hazard: false, collectible: "life", solid: false },
  coin: { w: 64, h: 64, str: "boost", group: "top", hazard: false, collectible: "none", solid: false },
  friend: { w: 64, h: 64, str: "boost", group: "top", hazard: false, collectible: "none", solid: false },
  lure: { w: 60, h: 94, str: "avoid", group: "top", hazard: true, collectible: "none", solid: true },
  ambient: { w: 64, h: 64, str: "", group: "btm", hazard: false, collectible: "none", solid: false },
  finish: { w: 384, h: 192, str: "boost", group: "top", hazard: false, collectible: "none", solid: false },
  checkpoint: { w: 384, h: 192, str: "boost", group: "top", hazard: false, collectible: "none", solid: false },
  gate: { w: 192, h: 64, str: "boost", group: "btm", hazard: false, collectible: "none", solid: false },
  swap: { w: 256, h: 256, str: "boost", group: "btm", hazard: false, collectible: "none", solid: false },
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app not found");
}

const root = document.createElement("div");
root.className = "game-root";

const hud = document.createElement("div");
hud.className = "hud";

const hpText = document.createElement("span");
const highScoreText = document.createElement("span");
const boostText = document.createElement("span");

hud.append(hpText, highScoreText, boostText);

const stage = document.createElement("div");
stage.className = "stage";

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.className = "game-canvas";

const overlay = document.createElement("div");
overlay.className = "overlay";

const overlayTitle = document.createElement("div");
overlayTitle.className = "overlay-title";

const overlayPrompt = document.createElement("button");
overlayPrompt.className = "overlay-button";
overlayPrompt.type = "button";

const overlayMessage = document.createElement("div");
overlayMessage.className = "overlay-message";

overlay.append(overlayTitle, overlayPrompt, overlayMessage);
stage.append(canvas, overlay);
root.append(hud, stage);
app.replaceChildren(root);

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const playerSpriteSheet = new Image();
playerSpriteSheet.src = playerSpriteSheetUrl;
const enemySpriteSheet = new Image();
enemySpriteSheet.src = enemySpriteSheetUrl;
const rocksSpriteSheet = new Image();
rocksSpriteSheet.src = rocksSpriteSheetUrl;
const objectsSpriteSheet = new Image();
objectsSpriteSheet.src = objectsSpriteSheetUrl;
const graveSpriteSheet = new Image();
graveSpriteSheet.src = graveSpriteSheetUrl;
const terrainSpriteSheet = new Image();
terrainSpriteSheet.src = terrainSpriteSheetUrl;
const fireSpriteSheet = new Image();
fireSpriteSheet.src = fireSpriteSheetUrl;
const bgTileImage = new Image();
bgTileImage.src = bgTileUrl;

const session = {
  w: CANVAS_WIDTH,
  h: CANVAS_HEIGHT,
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  settings: {
    gameSpeed: 1,
  },
};

const grid = {
  size: 16,
  gap: 360,
  slots: 5,
};

const clusterLibrary: ClusterLibrary = {
  allNormal: {
    corridorA: {
      rock: [[-4, 0], [4, 0]],
      snag: [[0, 2]],
    },
    corridorB: {
      snag: [[-2, 0], [2, 1]],
      rock: [[0, 3]],
    },
    corridorC: {
      rock: [[-3, 1], [3, 1]],
      ramp: [[0, 0]],
    },
  },
  allHard: {
    crunchA: {
      snag: [[-3, 0], [-1, 1], [1, 1], [3, 0]],
      lure: [[0, 3]],
    },
    crunchB: {
      rock: [[-4, 0], [4, 0], [0, 2]],
      snag: [[-2, 3], [2, 3]],
    },
    crunchC: {
      rock: [[-3, 0], [0, 1], [3, 0]],
      lure: [[-1, 3], [1, 3]],
    },
  },
  allPassive: {
    restA: {
      npc: [[0, 0, "guide"]],
    },
    restB: {
      npc: [[-1, 0, "left"], [1, 0, "right"]],
    },
    restC: {},
  },
  endlessLives: {
    lifeDrop: {
      life: [[0, 0, "life"]],
      rock: [[-4, 1], [4, 1]],
    },
  },
  endlessBoosts: {
    boostDrop: {
      boost: [[0, 0, "boost"]],
      snag: [[-2, 2], [2, 2]],
    },
  },
  endlessRamps: {
    rampRun: {
      ramp: [[0, 0, "jump"]],
      rock: [[-4, 1], [4, 1]],
    },
  },
  endlessLures: {
    lureTrap: {
      lure: [[0, 0, "trap"]],
      snag: [[-3, 2], [3, 2]],
    },
  },
  checkpoints: {
    checkpointA: {
      rock: [[-5, 0], [5, 0]],
      npc: [[0, 1, "checkpoint"]],
    },
  },
};

const input: InputState = {
  moveVec: { x: 0, y: 0 },
  isBoost: false,
  isBrake: false,
};

const pressedKeys = new Set<string>();
let pendingStart = false;
let pendingRestart = false;
let pendingPauseToggle = false;

const world = {
  top: [] as Entity[],
  btm: [] as Entity[],
  npc: [] as Entity[],
  enemy: [] as Entity[],
  sleeping: [] as Entity[],
  all: [] as Entity[],
};

const fx = {
  particles: [] as FxParticle[],
  boostTrail: [] as FxBoostTrail[],
};

let entityId = 0;
let scene: SceneState = "menu";
let worldSpeed = BASE_WORLD_SPEED;
let currentScore = 0;
let toastTimer = 0;
let toastText = "";
let dangerPulseCooldown = 0;
let gameOverReason = "";
let uiDirty = true;
let playerPose: PlayerPose = "player_go";
let playerDir: SteerDirection = "down";
let playerAngle = (-90 * Math.PI) / 180;
let boostDistanceLeft = 0;
let boostTrailTick = 0;
let lastDownTapTime = -10;
let fxId = 0;

const player: PlayerState = {
  pos: { x: session.x, y: session.y },
  vel: { x: 0, y: 0 },
  acc: { x: 0, y: 0 },
  maxSpeed: 260,
  hitbox: { x: 0, y: 0, w: PLAYER_FRAME_WIDTH, h: PLAYER_FRAME_HEIGHT },
  movementLockTimer: 0,
  invincibleTimer: 0,
};
const enemyRuntime = new Map<number, EnemyChaseState>();
const fireByEnemyId = new Map<number, FireEntity>();
const fireEntities: FireEntity[] = [];
let fireEntityId = 0;

const spawner = {
  row: { next: 0, inc: 320 } as SpawnTimer,
  enemy: { next: 1000, inc: 480 } as SpawnTimer,
  npc: { next: 30, inc: 90 } as SpawnTimer,
  boostGuaranteed: { next: GUARANTEED_BOOST_UNIT_INTERVAL, inc: GUARANTEED_BOOST_UNIT_INTERVAL } as SpawnTimer,
  checkpoint: { next: 260, inc: 400 } as SpawnTimer,
  life: { next: 180, inc: 320 } as SpawnTimer,
  boost: { next: 130, inc: 270 } as SpawnTimer,
  lure: { next: 150, inc: 280 } as SpawnTimer,
  ramp: { next: 170, inc: 260 } as SpawnTimer,
};
const spawnBase = {
  row: 320,
  enemy: 480,
  npc: 90,
};

const recentClusters: string[] = [];
const stats = loadStats();
const sys = {
  session,
  game: createGameState(),
};

resizeViewport();
window.addEventListener("resize", resizeViewport);
createSleepingObjects();
resetRunState();
wireInput();
wireButtons();
setScene("menu");
requestAnimationFrame(loop);

function loop(now: number): void {
  const delta = Math.min(0.05, (now - lastFrameTime) / 1000 || 0);
  lastFrameTime = now;

  updateScene(delta);
  render();
  requestAnimationFrame(loop);
}

let lastFrameTime = performance.now();

function updateScene(dt: number): void {
  if (scene === "menu") {
    if (pendingStart) {
      pendingStart = false;
      startNewRun();
    }
    updateHUD();
    return;
  }

  if (scene === "gameover") {
    toastTimer = Math.max(0, toastTimer - dt);
    if (pendingRestart) {
      pendingRestart = false;
      resetRunState();
      setScene("menu");
    }
    updateHUD();
    return;
  }

  if (pendingPauseToggle) {
    pendingPauseToggle = false;
    if (scene === "playing") {
      setScene("paused");
    } else if (scene === "paused") {
      setScene("playing");
    }
  }

  if (scene === "paused") {
    toastTimer = Math.max(0, toastTimer - dt);
    updateHUD();
    return;
  }

  tickTime(dt);
  normalizeInput();

  const phase = getPhase(sys.game.dist.unit);
  applySpawnerPhase(phase);
  updatePlayer(dt);
  updateWorldSpeed(dt, phase);

  const steer = getSteerVector();
  const forward = worldSpeed * dt;
  const worldShift = player.movementLockTimer > 0
    ? { x: 0, y: 0 }
    : {
      x: steer.x * forward,
      y: Math.max(forward * 0.58, steer.y * forward),
    };
  updateDistances(worldShift.x * 0.1, worldShift.y);
  updateBoostState(dt, worldShift);

  updateSpawnLoop(phase);
  moveEntities(dt, worldShift);
  updateFireEntities(dt);
  updateCollisions();
  updateFxSystem(dt, worldShift);
  putToSleep();
  mergeAll();

  currentScore = Math.floor(sys.game.dist.unit);
  toastTimer = Math.max(0, toastTimer - dt);
  updateHUD();

  if (!sys.game.finish && sys.game.lives.current <= 0) {
    finishRun("obstacle");
  }
}

function createGameState(): RuntimeGameState {
  return {
    time: {
      loop: 0,
      elapsed: 0,
      scale: 0,
    },
    dist: {
      unit: 0,
      x: 0,
      y: 0,
    },
    lives: {
      current: 3,
      max: 3,
      numCollected: 0,
    },
    boosts: {
      current: 0,
      max: 3,
      numCollected: 0,
      numUsed: 0,
    },
    finish: false,
    caught: false,
    highScore: false,
  };
}

function resizeViewport(): void {
  const prevW = session.w;
  const prevH = session.h;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const nextW = Math.max(320, window.innerWidth);
  const nextH = Math.max(320, window.innerHeight);

  canvas.width = Math.floor(nextW * dpr);
  canvas.height = Math.floor(nextH * dpr);
  canvas.style.width = `${nextW}px`;
  canvas.style.height = `${nextH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  session.w = nextW;
  session.h = nextH;
  session.x = nextW / 2;
  session.y = nextH / 2;

  updateGridAndSpawnBase();

  if (scene === "menu" || scene === "gameover") {
    player.pos.x = session.x;
    player.pos.y = session.y;
  } else if (prevW > 0 && prevH > 0) {
    const sx = player.pos.x / prevW;
    const sy = player.pos.y / prevH;
    player.pos.x = clamp(sx * session.w, 54, session.w - 54);
    player.pos.y = clamp(sy * session.h, 80, session.h - 80);
  }

  player.hitbox.x = player.pos.x - player.hitbox.w / 2;
  player.hitbox.y = player.pos.y - player.hitbox.h / 2;
}

function updateGridAndSpawnBase(): void {
  grid.gap = clamp(Math.round(session.w * 0.35), 300, 620);
  grid.slots = 2 * Math.ceil((session.h - session.y) / grid.gap) + 3;

  spawnBase.row = Math.max(260, Math.round(grid.gap * 0.78125));
  spawnBase.npc = Math.max(70, Math.round(spawnBase.row * 0.125));
}

function resetSpawnTimers(): void {
  spawner.row.next = 0;
  spawner.row.inc = spawnBase.row / OBSTACLE_SPAWN_MULTIPLIER;
  spawner.enemy.next = 1000;
  spawner.enemy.inc = spawnBase.enemy;
  spawner.npc.next = 30;
  spawner.npc.inc = spawnBase.npc;
  spawner.boostGuaranteed.next = GUARANTEED_BOOST_UNIT_INTERVAL;
  spawner.boostGuaranteed.inc = GUARANTEED_BOOST_UNIT_INTERVAL;
  spawner.ramp.next = Math.round(spawnBase.row * 0.625);
  spawner.ramp.inc = Math.round(spawnBase.row * 0.625);
  spawner.boost.next = Math.round(spawnBase.row * 0.8125);
  spawner.boost.inc = Math.round(spawnBase.row * 0.625);
  spawner.lure.next = Math.round(spawnBase.row * 0.875);
  spawner.lure.inc = Math.round(spawnBase.row * 0.625);
  spawner.life.next = Math.round(spawnBase.row * 2.5);
  spawner.life.inc = Math.round(spawnBase.row * 1.25);
  spawner.checkpoint.next = Math.round(spawnBase.row * 6.25);
  spawner.checkpoint.inc = Math.round(spawnBase.row * 6.25);
}

function resetRunState(): void {
  sys.game = createGameState();
  player.pos.x = session.x;
  player.pos.y = session.y;
  player.vel.x = 0;
  player.vel.y = 0;
  player.movementLockTimer = 0;
  player.invincibleTimer = 0;
  playerDir = "down";
  playerAngle = (-90 * Math.PI) / 180;
  playerPose = "player_go";
  enemyRuntime.clear();
  fireByEnemyId.clear();
  fireEntities.length = 0;
  worldSpeed = BASE_WORLD_SPEED;
  boostDistanceLeft = 0;
  boostTrailTick = 0;
  lastDownTapTime = -10;
  currentScore = 0;
  dangerPulseCooldown = 0;
  gameOverReason = "";
  toastText = "";
  toastTimer = 0;
  resetSpawnTimers();

  recentClusters.length = 0;
  world.top = sleepAll(world.top);
  world.btm = sleepAll(world.btm);
  world.npc = sleepAll(world.npc);
  world.enemy = sleepAll(world.enemy);
  world.all.length = 0;
  fx.particles.length = 0;
  fx.boostTrail.length = 0;
}

function startNewRun(): void {
  resetRunState();
  stats.plays += 1;
  saveStats(stats);
  setScene("playing");
}

function finishRun(reason: "obstacle" | "enemy"): void {
  if (sys.game.finish) {
    return;
  }

  sys.game.finish = true;
  sys.game.caught = reason === "enemy";
  gameOverReason = reason === "enemy" ? "enemy caught you" : "obstacle limit reached";

  if (currentScore > stats.highScore) {
    stats.highScore = currentScore;
    sys.game.highScore = true;
    toastText = "new high score!";
    toastTimer = 2.8;
    saveStats(stats);
  }

  setScene("gameover");
}

function setScene(next: SceneState): void {
  scene = next;
  uiDirty = true;
  syncOverlay();
  updateHUD();
}

function syncOverlay(): void {
  if (scene === "menu") {
    root.classList.remove("gameover-ui");
    stage.classList.remove("gameover-blur");
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "geosteering quest";
    overlayPrompt.textContent = "press space to game start";
    overlayMessage.textContent = "";
    return;
  }

  if (scene === "paused") {
    root.classList.remove("gameover-ui");
    stage.classList.remove("gameover-blur");
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "paused";
    overlayPrompt.textContent = "press space to resume";
    overlayMessage.textContent = `score ${currentScore}`;
    return;
  }

  if (scene === "gameover") {
    root.classList.add("gameover-ui");
    stage.classList.add("gameover-blur");
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "game over";
    overlayPrompt.textContent = "press space to return menu";
    const recordText = sys.game.highScore ? " | new high score!" : "";
    overlayMessage.textContent = `${gameOverReason} | score ${currentScore}${recordText}`;
    return;
  }

  root.classList.remove("gameover-ui");
  stage.classList.remove("gameover-blur");
  overlay.classList.add("hidden");
}

function updateHUD(): void {
  hpText.textContent = `HP ${sys.game.lives.current}/${sys.game.lives.max}`;
  if (scene === "playing" || scene === "paused") {
    highScoreText.textContent = `점수 ${currentScore}`;
  } else {
    highScoreText.textContent = `최고기록 ${stats.highScore}`;
  }
  boostText.textContent = `부스트 ${sys.game.boosts.current}/${sys.game.boosts.max}`;
  if (uiDirty) {
    syncOverlay();
    uiDirty = false;
  }
}

function wireButtons(): void {
  overlayPrompt.addEventListener("click", () => {
    if (scene === "menu") {
      pendingStart = true;
    } else if (scene === "gameover") {
      pendingRestart = true;
    }
  });
}

function wireInput(): void {
  window.addEventListener("keydown", (event: KeyboardEvent) => {
    const code = event.code;
    const firstPress = !pressedKeys.has(code);

    if (code.startsWith("Arrow") || code === "Space") {
      event.preventDefault();
    }

    if (code === "Space") {
      if (event.repeat) {
        return;
      }
      if (scene === "menu") {
        pendingStart = true;
      } else if (scene === "playing" || scene === "paused") {
        pendingPauseToggle = true;
      } else if (scene === "gameover") {
        pendingRestart = true;
      }
      return;
    }

    if ((code === "KeyP" || code === "Escape") && scene !== "menu" && scene !== "gameover") {
      pendingPauseToggle = true;
    }

    if (firstPress && (scene === "playing" || scene === "paused")) {
      if (player.movementLockTimer > 0) {
        pressedKeys.add(code);
        return;
      }

      if (scene === "playing" && (code === "ArrowDown" || code === "KeyS")) {
        const now = performance.now() / 1000;
        if (now - lastDownTapTime <= DOWN_DOUBLE_TAP_WINDOW) {
          tryUseBoost();
          lastDownTapTime = -10;
        } else {
          lastDownTapTime = now;
        }
      }

      switch (code) {
        case "ArrowLeft":
        case "KeyA":
          changeDirectionLikeOriginal("left");
          break;
        case "ArrowRight":
        case "KeyD":
          changeDirectionLikeOriginal("right");
          break;
        case "ArrowDown":
        case "KeyS":
          changeDirectionLikeOriginal("down", true);
          break;
        case "ArrowUp":
        case "KeyW":
          changeDirectionLikeOriginal("stop");
          break;
      }
    }

    pressedKeys.add(code);
  });

  window.addEventListener("keyup", (event: KeyboardEvent) => {
    pressedKeys.delete(event.code);
  });

  window.addEventListener("blur", () => {
    pressedKeys.clear();
  });
}

function normalizeInput(): void {
  if (player.movementLockTimer > 0) {
    input.moveVec.x = 0;
    input.moveVec.y = 0;
    input.isBoost = false;
    input.isBrake = false;
    updatePlayerPoseFromDirection();
    return;
  }

  input.moveVec.x = 0;
  input.moveVec.y = 0;
  input.isBoost = false;
  input.isBrake = pressedKeys.has("ControlLeft") || pressedKeys.has("ControlRight") || pressedKeys.has("KeyZ");
  updatePlayerPoseFromDirection();
}

function updatePlayerPoseFromDirection(): void {
  if (isPlayerInvincible()) {
    playerPose = "player_invincible";
    return;
  }

  switch (playerDir) {
    case "downleft":
      playerPose = "player_left";
      break;
    case "left":
      playerPose = "player_double_left";
      break;
    case "downright":
      playerPose = "player_right";
      break;
    case "right":
      playerPose = "player_double_right";
      break;
    case "stop":
      playerPose = "player_stop";
      break;
    case "down":
      playerPose = "player_go";
      break;
    default:
      playerPose = "player_go";
  }
}

function changeDirectionLikeOriginal(next: SteerDirection, forced = false): void {
  const steerChain: SteerDirection[] = ["left", "downleft", "down", "downright", "right"];

  const currentIndex = (() => {
    const idx = steerChain.indexOf(playerDir);
    if (idx >= 0) {
      return idx;
    }
    return 2;
  })();

  let dir = playerDir;
  if (next === "left") {
    dir = steerChain[clamp(currentIndex - 1, 0, steerChain.length - 1)];
  } else if (next === "right") {
    dir = steerChain[clamp(currentIndex + 1, 0, steerChain.length - 1)];
  } else if (next === "down") {
    dir = "down";
  } else if (next === "stop") {
    dir = "stop";
  } else if (forced) {
    dir = next;
  }

  let angleDeg = -90;
  switch (dir) {
    case "left":
      angleDeg = -42;
      break;
    case "right":
      angleDeg = -138;
      break;
    case "downleft":
      angleDeg = -60;
      break;
    case "downright":
      angleDeg = -120;
      break;
    case "down":
      angleDeg = -90;
      break;
    case "stop":
      angleDeg = 90;
      break;
  }

  playerDir = dir;
  playerAngle = (angleDeg * Math.PI) / 180;
  updatePlayerPoseFromDirection();
}

function getSteerVector(): Vec2 {
  if (player.movementLockTimer > 0) {
    return { x: 0, y: 0 };
  }
  const x = -Math.cos(playerAngle);
  const y = -Math.sin(playerAngle);
  return { x, y };
}

function tickTime(dt: number): void {
  sys.game.time.loop = dt;
  sys.game.time.elapsed += dt;
  sys.game.time.scale = 60 * dt * session.settings.gameSpeed;
  dangerPulseCooldown = Math.max(0, dangerPulseCooldown - dt);
  if (player.movementLockTimer > 0) {
    player.movementLockTimer = Math.max(0, player.movementLockTimer - dt);
  } else if (player.invincibleTimer > 0) {
    player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
  }
}

function isBoostActive(): boolean {
  return boostDistanceLeft > 0;
}

function tryUseBoost(): void {
  if (scene !== "playing" || isBoostActive()) {
    return;
  }
  if (sys.game.boosts.current <= 0) {
    toastText = "no boost";
    toastTimer = 0.9;
    return;
  }

  sys.game.boosts.current -= 1;
  sys.game.boosts.numUsed += 1;
  boostDistanceLeft = BOOST_DISTANCE_TRACKER;
  boostTrailTick = 0;
  spawnBoostStartFx(player.pos.x, player.pos.y + 24);
}

function updateBoostState(dt: number, worldShift: { x: number; y: number }): void {
  if (!isBoostActive()) {
    return;
  }

  const consumed = Math.max(0, worldShift.y);
  boostDistanceLeft = Math.max(0, boostDistanceLeft - consumed);

  boostTrailTick += dt;
  while (boostTrailTick >= BOOST_TRAIL_INTERVAL) {
    boostTrailTick -= BOOST_TRAIL_INTERVAL;
    spawnBoostTrailFx();
  }
}

function updateDistances(dx: number, dy: number): void {
  sys.game.dist.x += dx;
  sys.game.dist.y += dy;
  sys.game.dist.unit += dy / 10;
}

function getPhase(unit: number): PhaseConfig {
  const wave = unit % 320;
  if (wave < 120) {
    return { name: "easy", speedMul: 0.92, rowMul: 1.08, enemyMul: 1.08, npcMul: 1.05 };
  }
  if (wave < 240) {
    return { name: "hard", speedMul: 1.03, rowMul: 0.84, enemyMul: 0.84, npcMul: 0.9 };
  }
  return { name: "recovery", speedMul: 0.96, rowMul: 1.16, enemyMul: 1.18, npcMul: 1.1 };
}

function applySpawnerPhase(phase: PhaseConfig): void {
  spawner.row.inc = Math.max(220, Math.round(spawnBase.row * phase.rowMul)) / OBSTACLE_SPAWN_MULTIPLIER;
  spawner.enemy.inc = Math.max(280, Math.round(spawnBase.enemy * phase.enemyMul));
  spawner.npc.inc = Math.max(60, Math.round(spawnBase.npc * phase.npcMul));
}

function updateWorldSpeed(dt: number, phase: PhaseConfig): void {
  const base = BASE_WORLD_SPEED + sys.game.time.elapsed * 1.15;
  const brakeMul = input.isBrake ? 0.74 : 1;
  const stopMul = playerDir === "stop" ? 0 : 1;
  const boostMul = isBoostActive() ? BOOST_SPEED_MULTIPLIER : 1;

  const target = base * phase.speedMul * brakeMul * boostMul * stopMul;
  worldSpeed += (target - worldSpeed) * Math.min(1, dt * (playerDir === "stop" ? 3.4 : 2.6));
  if (playerDir === "stop" && worldSpeed < 0.05) {
    worldSpeed = 0;
  }
}

function updatePlayer(dt: number): void {
  if (player.movementLockTimer > 0) {
    player.acc.x = 0;
    player.acc.y = 0;
    player.vel.x = 0;
    player.vel.y = 0;
    player.pos.x = session.x;
    player.pos.y = session.y;
    player.hitbox.x = player.pos.x - player.hitbox.w / 2;
    player.hitbox.y = player.pos.y - player.hitbox.h / 2;
    return;
  }

  const accelStrength = 980;
  player.acc.x = input.moveVec.x * accelStrength;
  player.acc.y = input.moveVec.y * accelStrength * 0.68;

  player.vel.x += player.acc.x * dt;
  player.vel.y += player.acc.y * dt;

  const drag = 6.8;
  player.vel.x -= player.vel.x * Math.min(1, drag * dt);
  player.vel.y -= player.vel.y * Math.min(1, drag * dt);

  player.maxSpeed = isBoostActive() ? 260 : 200;
  player.vel.x = clamp(player.vel.x, -player.maxSpeed, player.maxSpeed);
  player.vel.y = clamp(player.vel.y, -player.maxSpeed * 0.7, player.maxSpeed * 0.7);

  // Keep player visually locked at screen center; movement is world-relative.
  player.pos.x = session.x;
  player.pos.y = session.y;

  player.hitbox.x = player.pos.x - player.hitbox.w / 2;
  player.hitbox.y = player.pos.y - player.hitbox.h / 2;
}

function updateSpawnLoop(phase: PhaseConfig): void {
  if (nextReady(spawner.row, false)) {
    createRow(phase);
  }
  while (nextReady(spawner.boostGuaranteed, true)) {
    spawnGuaranteedBoost();
  }
  if (nextReady(spawner.enemy)) {
    createEnemy();
  }
  if (nextReady(spawner.npc)) {
    createNpc();
  }
}

function nextReady(timer: SpawnTimer, useUnit = true): boolean {
  const reference = useUnit ? sys.game.dist.unit : sys.game.dist.y + (session.h - session.y);
  if (reference > timer.next) {
    timer.next += timer.inc;
    return true;
  }
  return false;
}

function calcSpawnHeight(nextPoint: number): number {
  // Original formula baseline: next - dist.y + session.y; add margin to keep spawn off-screen.
  return nextPoint - sys.game.dist.y + session.y + 128;
}

function createRow(phase: PhaseConfig): void {
  const rowY = calcSpawnHeight(spawner.row.next);
  const laneCount = Math.floor(grid.slots / 2);
  let dirShift = 0;
  if (playerDir === "left" || playerDir === "downleft") {
    dirShift = -grid.gap / 4;
  } else if (playerDir === "right" || playerDir === "downright") {
    dirShift = grid.gap / 4;
  }

  for (let lane = -laneCount; lane <= laneCount; lane += 1) {
    let clusterName = "allNormal";
    let xJitter = 0;
    let yJitter = 0;
    const laneAbs = Math.abs(lane);
    const laneRatio = laneCount > 0 ? laneAbs / laneCount : 0;

    if (lane === 0) {
      if (player.invincibleTimer > 0.3) {
        clusterName = "allPassive";
      } else if (nextReady(spawner.checkpoint)) {
        clusterName = "checkpoints";
      } else if (nextReady(spawner.life)) {
        clusterName = "endlessLives";
      } else if (nextReady(spawner.boost)) {
        clusterName = "endlessBoosts";
      } else if (nextReady(spawner.ramp)) {
        clusterName = "endlessRamps";
      } else if (nextReady(spawner.lure)) {
        clusterName = "endlessLures";
      } else if (phase.name === "hard") {
        clusterName = Math.random() < 0.52 ? "allHard" : "allNormal";
      }
    } else {
      xJitter = rand(-20, 20) * grid.size;
      yJitter = rand(0, 32) * grid.size;
      if (phase.name === "recovery" && Math.random() < 0.62) {
        clusterName = "allPassive";
      } else if (phase.name === "hard" && Math.random() < 0.3) {
        clusterName = "allHard";
      }
    }

    const laneShift = lane * grid.gap;
    const laneX = session.x + laneShift + xJitter + dirShift;
    const laneY = rowY + yJitter;
    const skipLaneChance =
      lane === 0
        ? 0
        : laneRatio >= 1
        ? phase.name === "hard"
          ? 0.16
          : 0.24
        : phase.name === "hard"
        ? 0.08
        : 0.14;
    if (Math.random() < skipLaneChance) {
      buildEndlessRandomSnags(laneX, laneY, lane, laneCount, phase.name, true);
      continue;
    }

    buildCluster(clusterName, laneX, laneY);
    buildEndlessRandomSnags(laneX, laneY, lane, laneCount, phase.name, false);
  }
}

function buildEndlessRandomSnags(
  baseX: number,
  baseY: number,
  lane = 0,
  laneCount = 1,
  phaseName: PhaseName = "easy",
  sparseOnly = false
): void {
  const s = grid.gap;
  const i = (spawner.row.inc * OBSTACLE_SPAWN_MULTIPLIER) / 2;
  const points: Array<[number, number]> = [
    [-s / 2, 0],
    [-s / 4, i],
    [s / 4, i],
  ];
  const singles: SpawnType[] = ["snag", "rock", "lure", "ramp"];
  const laneRatio = Math.abs(lane) / Math.max(1, laneCount);
  let spawnChance =
    lane === 0 ? 0.14 : laneRatio >= 1 ? 0.3 : laneRatio >= 0.5 ? 0.36 : 0.42;
  if (phaseName === "hard") {
    spawnChance += 0.08;
  } else if (phaseName === "recovery") {
    spawnChance -= 0.04;
  }
  if (sparseOnly) {
    spawnChance *= 0.72;
  }
  spawnChance = clamp(spawnChance, 0.08, 0.62);

  for (const [px, py] of points) {
    if (Math.random() > spawnChance) {
      continue;
    }
    const x = baseX + px + rand(-8, 8) * grid.size;
    const y = baseY + py + rand(-8, 8) * grid.size;
    const type = Math.random() < 0.5 ? "snag" : randIndex(singles);
    buildObjectWithSpacing(type, x, y, "single");
  }
}

function createEnemy(): boolean {
  const x = (Math.random() / 2 + 0.25) * session.w;
  const enemy = buildObjectWithSpacing("enemy", x, -32, "chase");
  if (!enemy) {
    return false;
  }
  initEnemyRuntime(enemy);
  return true;
}

function initEnemyRuntime(enemy: Entity): void {
  const playerSpeedRaw = clamp(worldSpeed / 24, 1, 7.5);
  enemyRuntime.set(enemy.id, {
    mode: "chase",
    angle: 0,
    dist: 0,
    timerDir: 0,
    speedRaw: playerSpeedRaw + 0.8,
    speedCurrent: playerSpeedRaw + 0.8,
    speedMax: 5.0,
    accel: 0.01,
    crashTimer: 0,
    objectsHit: new Set<number>(),
    time: Math.random(),
    orbitTime: 0,
    orbitDuration: ENEMY_ORBIT_DURATION,
    orbitRadiusX: rand(ENEMY_ORBIT_RADIUS_X_MIN, ENEMY_ORBIT_RADIUS_X_MAX),
    orbitRadiusY: rand(ENEMY_ORBIT_RADIUS_Y_MIN, ENEMY_ORBIT_RADIUS_Y_MAX),
    orbitOmega: (2 * Math.PI) / ENEMY_ORBIT_DURATION,
    orbitPhase: Math.random() * Math.PI * 2,
    orbitEntryTime: 0,
    orbitEntryDuration: ENEMY_ORBIT_ENTRY_MIN,
    orbitEntryVx: 0,
    orbitEntryVy: 0,
    burnTimer: 0,
  });
}

function createNpc(): void {
  const x = rand(Math.floor(session.w * 0.22), Math.floor(session.w * 0.78));
  const y = session.h + rand(80, 220);
  const npc = buildObjectWithSpacing("npc", x, y, "walker");
  if (!npc) {
    return;
  }
  npc.vx = Math.random() < 0.5 ? rand(-22, -8) : rand(8, 22);
  npc.vy = rand(-14, -4);
}

function spawnGuaranteedBoost(): void {
  const y = session.h + rand(96, 176);
  const candidates = [
    session.x,
    session.x - grid.gap * 0.25,
    session.x + grid.gap * 0.25,
    session.x - grid.gap * 0.4,
    session.x + grid.gap * 0.4,
  ];

  for (const cx of candidates) {
    const x = clamp(cx, 40, session.w - 40);
    if (buildObjectWithSpacing("boost", x, y, "boost")) {
      return;
    }
  }

  // Fallback so boost spawn is guaranteed every interval.
  const fallbackX = clamp(session.x, 40, session.w - 40);
  buildObject("boost", fallbackX, y, "boost");
}

function buildCluster(libraryName: string, baseX: number, baseY: number, forced?: string): void {
  const library = clusterLibrary[libraryName];
  if (!library) {
    return;
  }

  let clusterKey = forced;
  if (!clusterKey) {
    const candidates = Object.keys(library).filter((key) => !recentClusters.includes(`${libraryName}:${key}`));
    const source = candidates.length > 0 ? candidates : Object.keys(library);
    clusterKey = randIndex(source);
  }

  const cluster = library[clusterKey];
  if (!cluster) {
    return;
  }

  recentClusters.unshift(`${libraryName}:${clusterKey}`);
  if (recentClusters.length > 12) {
    recentClusters.pop();
  }

  const entries = Object.entries(cluster) as [SpawnType, ClusterEntry[]][];
  for (const [objectType, placements] of entries) {
    for (const placement of placements) {
      const [dx, dy, variantTag] = placement;
      const x = baseX + dx * grid.size;
      const y = baseY + dy * grid.size;
      buildObjectWithSpacing(objectType, x, y, variantTag ?? "");
    }
  }
}

function buildObjectWithSpacing(type: SpawnType, x: number, y: number, variant = ""): Entity | null {
  const offsets: Array<[number, number]> = [
    [0, 0],
    [-2 * grid.size, 0],
    [2 * grid.size, 0],
    [0, -2 * grid.size],
    [0, 2 * grid.size],
  ];

  for (const [ox, oy] of offsets) {
    const tx = x + ox;
    const ty = y + oy;
    if (!hasObjectCollision(type, tx, ty)) {
      return buildObject(type, tx, ty, variant);
    }
  }
  return null;
}

function hasObjectCollision(type: SpawnType, x: number, y: number): boolean {
  const meta = getEntityMeta(type);
  const pad = grid.size * 0.8;
  const target: Hitbox = {
    x,
    y,
    w: meta.w,
    h: meta.h,
  };

  const existing = world.top.concat(world.btm).concat(world.npc).concat(world.enemy);
  for (const entity of existing) {
    if (entity.sleep) {
      continue;
    }
    const other = toHitbox(entity);
    if (intersectsExpanded(target, other, pad)) {
      return true;
    }
  }
  return false;
}

function buildObject(type: SpawnType, x: number, y: number, variant = ""): Entity {
  const alignedX = Math.floor(x) + (sys.game.dist.x - Math.floor(sys.game.dist.x));
  const alignedY = Math.floor(y) + (sys.game.dist.y - Math.floor(sys.game.dist.y));

  let object = wake(type, alignedX, alignedY, variant);
  if (!object) {
    object = createEntity(type, groupByType(type), alignedX, alignedY, variant);
  }

  object.sleep = false;
  object.ttl = 999;
  if (object.type === "enemy") {
    applyEnemyFrameToEntity(object);
  } else if (object.type === "rock") {
    applyRockFrameToEntity(object);
  } else if (object.type === "snag") {
    applySnugFrameToEntity(object);
  } else if (object.type === "boost") {
    applyBoostFrameToEntity(object);
  } else {
    object.variant = variant;
  }
  object.label = getEntityLabel(object.type);
  object.hazard = getEntityMeta(object.type).hazard;

  switch (object.group) {
    case "top":
      world.top.push(object);
      break;
    case "btm":
      world.btm.push(object);
      break;
    case "npc":
      world.npc.push(object);
      break;
    case "enemy":
      world.enemy.push(object);
      break;
  }

  return object;
}

function createEntity(type: EntityType, group: Group, x: number, y: number, variant: string): Entity {
  const meta = getEntityMeta(type);
  return {
    id: entityId += 1,
    type,
    group,
    x,
    y,
    w: meta.w,
    h: meta.h,
    vx: 0,
    vy: 0,
    label: getEntityLabel(type),
    variant,
    solid: meta.solid,
    hazard: meta.hazard,
    collectible: meta.collectible,
    ttl: 999,
    sleep: false,
  };
}

function getEntityMeta(type: EntityType): {
  w: number;
  h: number;
  solid: boolean;
  hazard: boolean;
  collectible: CollectibleType;
} {
  if (type === "player") {
    return {
      w: PLAYER_FRAME_WIDTH,
      h: PLAYER_FRAME_HEIGHT,
      solid: true,
      hazard: false,
      collectible: "none",
    };
  }
  const meta = ENTITY_SHEET_META[type];
  return {
    w: meta.w,
    h: meta.h,
    solid: meta.solid,
    hazard: meta.hazard,
    collectible: meta.collectible,
  };
}

function groupByType(type: SpawnType): Group {
  return ENTITY_SHEET_META[type].group;
}

function getEntityLabel(type: EntityType): string {
  if (type === "enemy") {
    return "enemy";
  }
  return type;
}

function getEnemyFrameRect(frameKey: string): EnemyFrameRect {
  const key = ENEMY_FRAME_KEYS.find((candidate) => candidate === frameKey);
  if (key) {
    return ENEMY_FRAMES[key];
  }
  return ENEMY_FRAMES.enemy1;
}

function applyEnemyFrameToEntity(entity: Entity): void {
  const frameKey = randIndex(ENEMY_FRAME_KEYS);
  const frame = ENEMY_FRAMES[frameKey];
  entity.variant = frameKey;
  entity.w = frame.w;
  entity.h = frame.h;
}

function getRockFrameRect(frameKey: string): EnemyFrameRect {
  const key = ROCK_FRAME_KEYS.find((candidate) => candidate === frameKey);
  if (key) {
    return ROCK_FRAMES[key];
  }
  return ROCK_FRAMES.rock1;
}

function applyRockFrameToEntity(entity: Entity): void {
  const frameKey = randIndex(ROCK_FRAME_KEYS);
  const frame = ROCK_FRAMES[frameKey];
  entity.variant = frameKey;
  entity.w = frame.w;
  entity.h = frame.h;
}

function getSnugFrameRect(frameKey: string): EnemyFrameRect {
  const key = SNUG_FRAME_KEYS.find((candidate) => candidate === frameKey);
  if (key) {
    return SNUG_FRAMES[key];
  }
  return SNUG_FRAMES.snug1;
}

function applySnugFrameToEntity(entity: Entity): void {
  const frameKey = randIndex(SNUG_FRAME_KEYS);
  const frame = SNUG_FRAMES[frameKey];
  entity.variant = frameKey;
  entity.w = frame.w;
  entity.h = frame.h;
}

function getBoostFrameRect(frameKey: string): EnemyFrameRect {
  const key = BOOST_FRAME_KEYS.find((candidate) => candidate === frameKey);
  if (key) {
    return BOOST_FRAMES[key];
  }
  return BOOST_FRAMES.boost1;
}

function applyBoostFrameToEntity(entity: Entity): void {
  const frame = BOOST_FRAMES.boost1;
  entity.variant = "boost1";
  entity.w = frame.w;
  entity.h = frame.h;
}

function wake(type: SpawnType, x: number, y: number, variant: string): Entity | null {
  for (let i = 0; i < world.sleeping.length; i += 1) {
    const candidate = world.sleeping[i];
    if (candidate.type === type) {
      world.sleeping.splice(i, 1);
      candidate.x = x;
      candidate.y = y;
      candidate.vx = 0;
      candidate.vy = 0;
      candidate.variant = variant;
      candidate.label = getEntityLabel(type);
      candidate.sleep = false;
      return candidate;
    }
  }
  return null;
}

function createSleepingObjects(): void {
  const seed: Record<SpawnType, number> = {
    rock: 40,
    snag: 40,
    snagsml: 20,
    snagtall: 5,
    spin: 10,
    ramp: 6,
    lure: 3,
    slow: 20,
    slowbig: 10,
    bump: 20,
    bumpbig: 10,
    coin: 2,
    boost: 2,
    life: 1,
    spiral: 5,
    ambient: 10,
    blockbig: 6,
    block: 4,
    friend: 1,
    enemy: 2,
    npc: 10,
    marker: 0,
    guide: 0,
    finish: 0,
    checkpoint: 0,
    gate: 0,
    swap: 0,
  };

  const entries = Object.entries(seed) as [SpawnType, number][];
  for (const [type, count] of entries) {
    for (let i = 0; i < count; i += 1) {
      const entity = createEntity(type, groupByType(type), 0, -9999, "pool");
      entity.sleep = true;
      world.sleeping.push(entity);
    }
  }
}

function moveEntities(dt: number, worldShift: { x: number; y: number }): void {
  for (const group of [world.top, world.btm, world.npc]) {
    for (const entity of group) {
      entity.x += entity.vx * dt - worldShift.x;
      entity.y += entity.vy * dt - worldShift.y;
    }
  }

  for (const enemy of world.enemy) {
    updateEnemyChase(enemy, worldShift);
  }
}

function updateEnemyChase(enemy: Entity, worldShift: { x: number; y: number }): void {
  let state = enemyRuntime.get(enemy.id);
  if (!state) {
    initEnemyRuntime(enemy);
    state = enemyRuntime.get(enemy.id);
  }
  if (!state) {
    return;
  }

  enemy.x += -worldShift.x;
  enemy.y += -worldShift.y;

  if (enemy.sleep) {
    return;
  }

  const frameDelta = sys.game.time.loop * sys.game.time.scale;
  state.time += sys.game.time.loop;
  if (state.burnTimer > 0) {
    state.burnTimer = Math.max(0, state.burnTimer - sys.game.time.loop);
    upsertFireEntity(enemy);
    if (state.burnTimer <= 0) {
      despawnBurnedEnemy(enemy);
    }
    return;
  }

  state.crashTimer = Math.max(0, state.crashTimer - frameDelta);
  if (state.crashTimer > 0) {
    return;
  }

  if (state.mode === "orbit_entry") {
    updateEnemyOrbitEntry(enemy, state);
    applyEnemyDangerFx(enemy, state);
    return;
  }

  if (state.mode === "orbit") {
    updateEnemyOrbit(enemy, state);
    applyEnemyDangerFx(enemy, state);
    return;
  }

  const dx = player.pos.x - enemy.x;
  const dy = player.pos.y - enemy.y;
  state.dist = Math.hypot(dx, dy);
  state.timerDir -= frameDelta;

  if (state.timerDir <= 0) {
    state.timerDir += (rand(25, 100) / 100) * (state.dist / Math.max(1, session.y));
    state.angle = Math.atan2(dy, dx);
  }

  const accel = state.accel * sys.game.time.scale;
  const belowPlayer = enemy.y >= session.y;
  if (state.speedRaw < state.speedMax && !belowPlayer) {
    state.speedRaw += accel;
  } else if (belowPlayer) {
    state.speedRaw -= accel;
  } else {
    state.speedRaw = state.speedMax;
  }
  state.speedRaw = clamp(state.speedRaw, 1, state.speedMax);
  state.speedCurrent = state.speedRaw * sys.game.time.scale;

  const wave = (state.dist / Math.max(1, session.y)) * 15;
  const wobble = (Math.cos(16 * state.time) * wave * Math.PI) / 180;
  const vx = state.speedCurrent * Math.cos(state.angle + wobble);
  const vy = state.speedCurrent * Math.sin(state.angle + wobble);
  enemy.x += vx;
  enemy.y += vy;

  if (enemy.y > player.pos.y + 6) {
    startEnemyOrbit(enemy, state, vx, vy);
    applyEnemyDangerFx(enemy, state);
    return;
  }

  const collidedObstacle = resolveEnemyObstacleCollision(enemy, state);
  if (collidedObstacle) {
    enemy.x -= vx;
    enemy.y -= vy;
    state.crashTimer = ENEMY_OBSTACLE_BLOCK_TIME;
    state.speedRaw = 0;
    state.speedCurrent = 0;
    if (collidedObstacle.type === "ramp") {
      igniteEnemy(enemy, state);
    }
  }

  applyEnemyDangerFx(enemy, state);
}

function startEnemyOrbit(enemy: Entity, state: EnemyChaseState, vx: number, vy: number): void {
  state.mode = "orbit_entry";
  state.orbitTime = 0;
  state.orbitDuration = ENEMY_ORBIT_DURATION;
  state.orbitRadiusX = rand(ENEMY_ORBIT_RADIUS_X_MIN, ENEMY_ORBIT_RADIUS_X_MAX);
  state.orbitRadiusY = rand(ENEMY_ORBIT_RADIUS_Y_MIN, ENEMY_ORBIT_RADIUS_Y_MAX);
  state.orbitOmega = (2 * Math.PI) / state.orbitDuration;
  state.orbitEntryTime = 0;
  state.orbitEntryDuration =
    ENEMY_ORBIT_ENTRY_MIN + (ENEMY_ORBIT_ENTRY_MAX - ENEMY_ORBIT_ENTRY_MIN) * Math.random();
  state.orbitEntryVx = vx;
  state.orbitEntryVy = vy;
  const ex = enemy.x - player.pos.x;
  const ey = enemy.y - (player.pos.y - ENEMY_ORBIT_CENTER_Y_OFFSET);
  state.orbitPhase = Math.atan2(
    ey / Math.max(1, state.orbitRadiusY),
    ex / Math.max(1, state.orbitRadiusX)
  );
}

function updateEnemyOrbitEntry(enemy: Entity, state: EnemyChaseState): void {
  const dt = sys.game.time.loop;
  state.orbitTime += dt * 0.6;
  state.orbitEntryTime += dt;
  const t = clamp(state.orbitEntryTime / Math.max(ENEMY_ORBIT_ENTRY_MIN, state.orbitEntryDuration), 0, 1);
  const damp = 1 - t;
  enemy.x += state.orbitEntryVx * damp;
  enemy.y += state.orbitEntryVy * damp;

  const angle = state.orbitPhase + state.orbitOmega * state.orbitTime;
  const targetX = player.pos.x + state.orbitRadiusX * Math.cos(angle);
  const targetY = player.pos.y + state.orbitRadiusY * Math.sin(angle) - ENEMY_ORBIT_CENTER_Y_OFFSET;
  const blend = 0.24 + 0.56 * t;
  enemy.x += (targetX - enemy.x) * blend;
  enemy.y += (targetY - enemy.y) * blend;
  state.dist = Math.hypot(player.pos.x - enemy.x, player.pos.y - enemy.y);

  if (t >= 1) {
    state.mode = "orbit";
    state.orbitEntryVx = 0;
    state.orbitEntryVy = 0;
  }
}

function updateEnemyOrbit(enemy: Entity, state: EnemyChaseState): void {
  state.orbitTime += sys.game.time.loop;
  const angle = state.orbitPhase + state.orbitOmega * state.orbitTime;
  enemy.x = player.pos.x + state.orbitRadiusX * Math.cos(angle);
  enemy.y = player.pos.y + state.orbitRadiusY * Math.sin(angle) - ENEMY_ORBIT_CENTER_Y_OFFSET;
  state.dist = Math.hypot(player.pos.x - enemy.x, player.pos.y - enemy.y);

  if (state.orbitTime >= state.orbitDuration) {
    enemy.x = player.pos.x + rand(-96, 96);
    enemy.y = player.pos.y - ENEMY_BEHIND_RESPAWN_Y - rand(0, 72);
    state.mode = "chase";
    state.orbitTime = 0;
    state.timerDir = 0;
  }
}

function applyEnemyDangerFx(enemy: Entity, state: EnemyChaseState): void {
  const inScreen =
    enemy.x + enemy.w > 0 &&
    enemy.x < session.w &&
    enemy.y + enemy.h > 0 &&
    enemy.y < session.h;
  if (inScreen && dangerPulseCooldown <= 0) {
    spawnDangerFx(player.pos.x, player.pos.y - 70);
    dangerPulseCooldown = DANGER_FX_SCREEN_INTERVAL;
  } else if (state.dist < 70 && dangerPulseCooldown <= 0) {
    spawnDangerFx(player.pos.x, player.pos.y - 70);
    dangerPulseCooldown = DANGER_FX_NEAR_INTERVAL;
  }
}

function resolveEnemyObstacleCollision(enemy: Entity, state: EnemyChaseState): Entity | null {
  const obstacles = world.top.concat(world.btm);
  const enemyHitbox = toHitbox(enemy);
  for (const obstacle of obstacles) {
    if (obstacle.sleep || !obstacle.solid || !obstacle.hazard) {
      continue;
    }
    if (obstacle.y < 16) {
      continue;
    }
    if (state.objectsHit.has(obstacle.id)) {
      continue;
    }
    if (intersects(enemyHitbox, toHitbox(obstacle))) {
      state.objectsHit.add(obstacle.id);
      return obstacle;
    }
  }
  return null;
}

function igniteEnemy(enemy: Entity, state: EnemyChaseState): void {
  if (state.burnTimer > 0) {
    return;
  }
  state.burnTimer = ENEMY_BURN_DURATION;
  upsertFireEntity(enemy);
}

function upsertFireEntity(enemy: Entity): FireEntity {
  const existing = fireByEnemyId.get(enemy.id);
  if (existing) {
    existing.sleep = false;
    syncFireEntityToEnemy(existing, enemy);
    return existing;
  }

  const fire: FireEntity = {
    id: fireEntityId += 1,
    enemyId: enemy.id,
    x: enemy.x,
    y: enemy.y,
    w: FIRE_DRAW_W,
    h: FIRE_DRAW_H,
    age: 0,
    sleep: false,
  };
  syncFireEntityToEnemy(fire, enemy);
  fireEntities.push(fire);
  fireByEnemyId.set(enemy.id, fire);
  return fire;
}

function syncFireEntityToEnemy(fire: FireEntity, enemy: Entity): void {
  fire.x = enemy.x + enemy.w * 0.5 - fire.w * 0.5;
  fire.y = enemy.y + enemy.h * 0.5 - fire.h * 0.62;
}

function updateFireEntities(dt: number): void {
  for (const fire of fireEntities) {
    if (fire.sleep) {
      continue;
    }

    const enemy = world.enemy.find((entry) => entry.id === fire.enemyId && !entry.sleep);
    const state = enemy ? enemyRuntime.get(enemy.id) : undefined;
    if (!enemy || !state || state.burnTimer <= 0) {
      fire.sleep = true;
      fireByEnemyId.delete(fire.enemyId);
      continue;
    }

    fire.age += dt;
    syncFireEntityToEnemy(fire, enemy);
  }
  const live = fireEntities.filter((entry) => !entry.sleep);
  fireEntities.length = 0;
  fireEntities.push(...live);
}

function despawnBurnedEnemy(enemy: Entity): void {
  enemy.sleep = true;
  enemyRuntime.delete(enemy.id);
  const fire = fireByEnemyId.get(enemy.id);
  if (fire) {
    fire.sleep = true;
    fireByEnemyId.delete(enemy.id);
  }
}

function isPlayerInvincible(): boolean {
  return player.movementLockTimer > 0 || player.invincibleTimer > 0;
}

function onPlayerObstacleHit(): void {
  player.movementLockTimer = PLAYER_HIT_LOCK_TIME;
  player.invincibleTimer = PLAYER_INVINCIBLE_MOVE_TIME;
  player.vel.x = 0;
  player.vel.y = 0;
  playerPose = "player_invincible";
  sys.game.lives.current = Math.max(0, sys.game.lives.current - 1);
}

function updateCollisions(): void {
  if (scene !== "playing") {
    return;
  }

  const groups = [world.top, world.btm, world.enemy, world.npc];

  for (const group of groups) {
    for (const entity of group) {
      if (entity.sleep) {
        continue;
      }

      if (!intersects(player.hitbox, toHitbox(entity))) {
        continue;
      }

      if (entity.collectible === "life") {
        if (sys.game.lives.current < sys.game.lives.max) {
          sys.game.lives.current += 1;
          sys.game.lives.numCollected += 1;
          spawnPickupFx(entity.x, entity.y, "life");
        }
        entity.sleep = true;
        continue;
      }

      if (entity.collectible === "boost") {
        if (sys.game.boosts.current < sys.game.boosts.max) {
          sys.game.boosts.current += 1;
          sys.game.boosts.numCollected += 1;
          spawnPickupFx(entity.x, entity.y, "boost");
        }
        entity.sleep = true;
        continue;
      }

      if (entity.hazard && !isPlayerInvincible()) {
        if (entity.type === "enemy") {
          const state = enemyRuntime.get(entity.id);
          if (state && state.burnTimer > 0) {
            continue;
          }
        }
        if (entity.type === "enemy") {
          finishRun("enemy");
          return;
        }
        onPlayerObstacleHit();
        spawnHitFx(player.pos.x, player.pos.y - 60);
      }
    }
  }
}

function putToSleep(): void {
  const farBottom = session.h + Math.max(900, grid.gap * 3);
  world.top = sleepTopWithLureSpawn(world.top, -280, farBottom);
  world.btm = sleep(world.btm, -280, farBottom);
  world.npc = sleep(world.npc, -300, farBottom);
  world.enemy = sleepEnemies(world.enemy, -320, farBottom);
}

function sleepTopWithLureSpawn(entities: Entity[], minY: number, maxY: number): Entity[] {
  const active: Entity[] = [];
  const sleeping: Entity[] = [];

  for (const entity of entities) {
    const lureLeftScreen = !entity.sleep && entity.type === "lure" && entity.y + entity.h < 0;
    if (lureLeftScreen) {
      spawnEnemyFromLure(entity.x, entity.y + 32);
      entity.sleep = true;
      sleeping.push(entity);
      continue;
    }

    const alive = entity.y > minY && entity.y < maxY && !entity.sleep;
    if (alive) {
      active.push(entity);
    } else {
      entity.sleep = true;
      sleeping.push(entity);
    }
  }

  world.sleeping.push(...sleeping);
  return active;
}

function spawnEnemyFromLure(x: number, y: number): void {
  const enemy = buildObject("enemy", x, y, "chase");
  initEnemyRuntime(enemy);
}

function sleep(entities: Entity[], minY: number, maxY: number): Entity[] {
  const active: Entity[] = [];
  const sleeping: Entity[] = [];

  for (const entity of entities) {
    const alive = entity.y > minY && entity.y < maxY && !entity.sleep;
    if (alive) {
      active.push(entity);
    } else {
      entity.sleep = true;
      sleeping.push(entity);
    }
  }

  world.sleeping.push(...sleeping);
  return active;
}

function sleepEnemies(entities: Entity[], minY: number, maxY: number): Entity[] {
  const active: Entity[] = [];
  const sleeping: Entity[] = [];

  for (const entity of entities) {
    const alive = entity.y > minY && entity.y < maxY && !entity.sleep;
    if (alive) {
      active.push(entity);
    } else {
      entity.sleep = true;
      sleeping.push(entity);
      enemyRuntime.delete(entity.id);
      const fire = fireByEnemyId.get(entity.id);
      if (fire) {
        fire.sleep = true;
        fireByEnemyId.delete(entity.id);
      }
    }
  }

  world.sleeping.push(...sleeping);
  return active;
}

function sleepAll(entities: Entity[]): Entity[] {
  for (const entity of entities) {
    entity.sleep = true;
    world.sleeping.push(entity);
  }
  return [];
}

function mergeAll(): void {
  const sortable = [...world.btm, ...world.top, ...world.npc, ...world.enemy];
  sortable.sort((a, b) => a.y + a.h - (b.y + b.h));
  world.all = sortable;
}

function pushFxParticle(kind: FxKind, x: number, y: number, vx: number, vy: number, size: number, ttl: number): void {
  fx.particles.push({
    id: fxId += 1,
    kind,
    x,
    y,
    vx,
    vy,
    size,
    age: 0,
    ttl,
  });
  if (fx.particles.length > FX_PARTICLE_MAX) {
    fx.particles.splice(0, fx.particles.length - FX_PARTICLE_MAX);
  }
}

function spawnBoostStartFx(x: number, y: number): void {
  for (let i = 0; i < FX_PICKUP_BURST + 2; i += 1) {
    const angle = (2 * Math.PI * i) / (FX_PICKUP_BURST + 2) + Math.random() * 0.2;
    const speed = rand(55, 95);
    pushFxParticle("boost", x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, rand(5, 9), 0.42);
  }
}

function spawnBoostTrailFx(): void {
  const offsetX = rand(-16, 16);
  const baseY = player.pos.y + 8;
  const tailLen = Math.max(28, Math.min(72, worldSpeed * 0.65));
  fx.boostTrail.push({
    id: fxId += 1,
    start: { x: player.pos.x + offsetX, y: baseY },
    end: { x: player.pos.x + offsetX, y: baseY + tailLen },
    age: 0,
    ttl: FX_TRAIL_TTL,
  });
  if (fx.boostTrail.length > FX_PARTICLE_MAX) {
    fx.boostTrail.splice(0, fx.boostTrail.length - FX_PARTICLE_MAX);
  }
}

function spawnDangerFx(x: number, y: number): void {
  pushFxParticle("danger", x, y, 0, -14, 16, 0.45);
}

function spawnPickupFx(x: number, y: number, pickup: "life" | "boost"): void {
  const kind: FxKind = pickup === "life" ? "pickupLife" : "pickupBoost";
  for (let i = 0; i < FX_PICKUP_BURST; i += 1) {
    const angle = (2 * Math.PI * i) / FX_PICKUP_BURST + Math.random() * 0.35;
    const speed = rand(42, 88);
    pushFxParticle(kind, x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 18, rand(4, 8), 0.55);
  }
}

function spawnHitFx(x: number, y: number): void {
  for (let i = 0; i < FX_HIT_BURST; i += 1) {
    const angle = (2 * Math.PI * i) / FX_HIT_BURST + Math.random() * 0.3;
    const speed = rand(75, 130);
    pushFxParticle("hit", x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 24, rand(6, 10), 0.5);
  }
}

function updateFxSystem(dt: number, worldShift: { x: number; y: number }): void {
  const liveTrail: FxBoostTrail[] = [];
  for (const trail of fx.boostTrail) {
    trail.start.x -= 0.8 * worldShift.x;
    trail.end.x -= worldShift.x;
    trail.start.y -= 0.8 * worldShift.y;
    trail.end.y -= worldShift.y;
    trail.age += dt;
    if (trail.age < trail.ttl) {
      liveTrail.push(trail);
    }
  }
  fx.boostTrail = liveTrail;

  const liveParticles: FxParticle[] = [];
  for (const particle of fx.particles) {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy = particle.vy * 0.96 - 8 * dt;
    if (particle.age < particle.ttl) {
      liveParticles.push(particle);
    }
  }
  fx.particles = liveParticles;
}

function render(): void {
  drawTiledBackground();

  for (const entity of world.all) {
    drawEntity(entity);
  }
  drawFireEntities();

  drawBoostTrailFx();

  if (scene !== "menu") {
    drawPlayerSprite();
  }

  drawFxOverlay();

  if (toastTimer > 0 && toastText.length > 0) {
    ctx.fillStyle = BLACK;
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(toastText, session.w / 2, 16);
  }
}

function drawTiledBackground(): void {
  const backgroundColor = getBackgroundColorByScore(Math.floor(sys.game.dist.unit));
  if (!(bgTileImage.complete && bgTileImage.naturalWidth > 0 && bgTileImage.naturalHeight > 0)) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, session.w, session.h);
    return;
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, session.w, session.h);

  const tileW = BG_TILE_SIZE;
  const tileH = BG_TILE_SIZE;
  const ox = ((-sys.game.dist.x % tileW) + tileW) % tileW;
  const oy = ((-sys.game.dist.y % tileH) + tileH) % tileH;

  const prevSmooth = ctx.imageSmoothingEnabled;
  const prevAlpha = ctx.globalAlpha;
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = BG_TILE_ALPHA;
  for (let x = ox - tileW; x < session.w + tileW; x += tileW) {
    for (let y = oy - tileH; y < session.h + tileH; y += tileH) {
      ctx.drawImage(bgTileImage, Math.floor(x), Math.floor(y), tileW, tileH);
    }
  }
  ctx.globalAlpha = prevAlpha;
  ctx.imageSmoothingEnabled = prevSmooth;
}

function getBackgroundColorByScore(score: number): string {
  if (score >= 3000) {
    return BACKGROUND_COLORS.s3000;
  }
  if (score >= 2000) {
    return BACKGROUND_COLORS.s2000;
  }
  if (score >= 1000) {
    return BACKGROUND_COLORS.s1000;
  }
  return BACKGROUND_COLORS.s0;
}

function drawEntity(entity: Entity): void {
  if (entity.type === "enemy" && enemySpriteSheet.complete && enemySpriteSheet.naturalWidth > 0) {
    const frame = getEnemyFrameRect(entity.variant);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      enemySpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  if (entity.type === "rock" && rocksSpriteSheet.complete && rocksSpriteSheet.naturalWidth > 0) {
    const frame = getRockFrameRect(entity.variant);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      rocksSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  if (entity.type === "snag" && rocksSpriteSheet.complete && rocksSpriteSheet.naturalWidth > 0) {
    const frame = getSnugFrameRect(entity.variant);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      rocksSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  if (entity.type === "boost" && objectsSpriteSheet.complete && objectsSpriteSheet.naturalWidth > 0) {
    const frameKey = BOOST_FRAME_KEYS[getBoostSpriteFrameIndex()] ?? "boost1";
    const frame = getBoostFrameRect(frameKey);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      objectsSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  if (entity.type === "lure" && graveSpriteSheet.complete && graveSpriteSheet.naturalWidth > 0) {
    const frame = LURE_FRAME;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      graveSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  if (entity.type === "ramp" && terrainSpriteSheet.complete && terrainSpriteSheet.naturalWidth > 0) {
    const frame = RAMP_FRAME;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      terrainSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(entity.x),
      Math.floor(entity.y),
      entity.w,
      entity.h
    );
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }
  drawRectWithLabel(entity.x, entity.y, entity.w, entity.h, entity.label);
}

function drawFireEntities(): void {
  if (!(fireSpriteSheet.complete && fireSpriteSheet.naturalWidth > 0)) {
    return;
  }
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (const fire of fireEntities) {
    if (fire.sleep) {
      continue;
    }
    const frame = FIRE_FRAMES[Math.floor(fire.age * FIRE_ANIMATION_FPS) % FIRE_FRAMES.length] ?? FIRE_FRAMES[0];
    const dx = fire.x + (fire.w - frame.w) * 0.5;
    const dy = fire.y + (fire.h - frame.h) * 0.5;
    ctx.drawImage(
      fireSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(dx),
      Math.floor(dy),
      frame.w,
      frame.h
    );
  }
  ctx.imageSmoothingEnabled = prevSmooth;
}

function drawPlayerSprite(): void {
  const frameIndex = getPlayerSpriteFrameIndex();
  const frame = PLAYER_FRAMES[frameIndex] ?? PLAYER_FRAMES[0];
  const sx = frame.x;
  const sy = frame.y;
  const dx = player.pos.x - PLAYER_FRAME_WIDTH / 2;
  const dy = player.pos.y - PLAYER_FRAME_HEIGHT / 2;

  if (playerSpriteSheet.complete && playerSpriteSheet.naturalWidth >= PLAYER_FRAME_WIDTH) {
    const prevAlpha = ctx.globalAlpha;
    if (playerPose === "player_invincible") {
      ctx.globalAlpha = Math.floor(sys.game.time.elapsed * 10) % 2 === 0 ? 0.45 : 0.9;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      playerSpriteSheet,
      sx,
      sy,
      frame.w,
      frame.h,
      Math.floor(dx),
      Math.floor(dy),
      PLAYER_FRAME_WIDTH,
      PLAYER_FRAME_HEIGHT
    );
    ctx.globalAlpha = prevAlpha;
    return;
  }

  drawRectWithLabel(dx, dy, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT, playerPose);
}

function getPlayerSpriteFrameIndex(): number {
  if (playerPose === "player_stop") {
    return 0;
  }
  return Math.floor(sys.game.time.elapsed * PLAYER_WALK_FPS) % PLAYER_FRAMES.length;
}

function getBoostSpriteFrameIndex(): number {
  return Math.floor(sys.game.time.elapsed * BOOST_ANIMATION_FPS) % BOOST_FRAME_KEYS.length;
}

function drawBoostTrailFx(): void {
  if (fx.boostTrail.length === 0) {
    return;
  }
  for (const trail of fx.boostTrail) {
    const alpha = 1 - trail.age / trail.ttl;
    if (alpha <= 0) {
      continue;
    }
    ctx.globalAlpha = alpha;
    const mx = (trail.start.x + trail.end.x) * 0.5;
    const my = (trail.start.y + trail.end.y) * 0.5;
    drawRectWithLabel(mx - 46, my - 10, 92, 20, "");
  }
  ctx.globalAlpha = 1;
}

function drawFxOverlay(): void {
  
  for (const particle of fx.particles) {
    const alpha = 1 - particle.age / particle.ttl;
    if (alpha <= 0) {
      continue;
    }
    ctx.globalAlpha = alpha;
    drawRectWithLabel(
      particle.x - 34,
      particle.y - 10,
      68,
      20,
      ""
    );
  }
  ctx.globalAlpha = 1;
}

function drawRectWithLabel(x: number, y: number, w: number, h: number, label: string): void {
  ctx.fillStyle = WHITE;
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const gx = 3;
  const gy = 3;
  const xStep = w / gx;
  const yStep = h / gy;

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1;

  for (let i = 1; i < gx; i += 1) {
    const lx = x + xStep * i;
    ctx.beginPath();
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, y + h);
    ctx.stroke();
  }

  for (let i = 1; i < gy; i += 1) {
    const ly = y + yStep * i;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }

  ctx.fillStyle = BLACK;
  ctx.font = `${Math.max(10, Math.min(16, Math.floor(h * 0.25)))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2);
}

function toHitbox(entity: Entity): Hitbox {
  return {
    x: entity.x,
    y: entity.y,
    w: entity.w,
    h: entity.h,
  };
}

function intersects(a: Hitbox, b: Hitbox): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function intersectsExpanded(a: Hitbox, b: Hitbox, pad: number): boolean {
  return (
    a.x - pad < b.x + b.w + pad &&
    a.x + a.w + pad > b.x - pad &&
    a.y - pad < b.y + b.h + pad &&
    a.y + a.h + pad > b.y - pad
  );
}

function loadStats(): StatsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { highScore: 0, plays: 0 };
    }
    const parsed = JSON.parse(raw) as Partial<StatsData>;
    return {
      highScore: Number.isFinite(parsed.highScore) ? Number(parsed.highScore) : 0,
      plays: Number.isFinite(parsed.plays) ? Number(parsed.plays) : 0,
    };
  } catch {
    return { highScore: 0, plays: 0 };
  }
}

function saveStats(nextStats: StatsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats));
}

function rand(min: number, max: number): number {
  return Math.floor(min + (max + 1 - min) * Math.random());
}

function randIndex<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}




