import "./style.css";
import playerSpriteSheetUrl from "./assets/drill.png";
import gameplayBgMineUrl from "./assets/gameplay-bg-mine.png";
import gameplayBgRubbleUrl from "./assets/gameplay-bg-rubble.png";
import enemySpriteSheetUrl from "./assets/enemy.png";
import wolfSpriteSheetUrl from "./assets/wolf.png";
import rocksSpriteSheetUrl from "./assets/rocks.png";
import objectsSpriteSheetUrl from "./assets/objects.png";
import graveSpriteSheetUrl from "./assets/grave.png";
import terrainSpriteSheetUrl from "./assets/terrain.png";
import fireSpriteSheetUrl from "./assets/fire.png";
import oreSpriteSheetUrl from "./assets/ore.png";
import introBackground1Url from "./assets/intro-bg/background1.png";
import introBackground2Url from "./assets/intro-bg/background2.png";
import introBackground3Url from "./assets/intro-bg/background3.png";
import introCloud1Url from "./assets/intro-bg/cloud1.png";
import introCloud2Url from "./assets/intro-bg/cloud2.png";
import introCloud3Url from "./assets/intro-bg/cloud3.png";
import introCloud4Url from "./assets/intro-bg/cloud4.png";
import introCloud5Url from "./assets/intro-bg/cloud5.png";
import introCloud6Url from "./assets/intro-bg/cloud6.png";
import introCloud7Url from "./assets/intro-bg/cloud7.png";
import introCloud8Url from "./assets/intro-bg/cloud8.png";
import introThemeUrl from "./assets/audio/IntroTheme.mp3";
import failThemeUrl from "./assets/audio/FailTheme.mp3";
import winThemeUrl from "./assets/audio/WinTheme.mp3";

type SceneState = "menu" | "playing" | "paused" | "gameover" | "win";
type Group = "top" | "btm" | "npc" | "enemy";
type CollectibleType = "none" | "life" | "boost";
type SpawnType =
  | "npc"
  | "enemy"
  | "rock"
  | "snag"
  | "ramp"
  | "boost"
  | "life"
  | "lure";
type EntityType = SpawnType | "player";
type PhaseName = "easy" | "hard" | "recovery";
type GameDifficulty = "easy" | "normal" | "hard";
type MenuOverlayMode = "main" | "difficulty";
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
type WolfEncounterPhase = "inactive" | "rise" | "return";

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
  stratumLevel: number;
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

interface DifficultyConfig {
  label: string;
  speedMul: number;
  spawnMul: number;
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

interface FxExplosion {
  x: number;
  y: number;
  scale: number;
  age: number;
  ttl: number;
}

interface EnemyFrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface IntroCloud {
  image: HTMLImageElement;
  xRatio: number;
  yRatio: number;
  scale: number;
  drift: number;
  speed: number;
  phase: number;
}

interface IntroOreSprite {
  frame: EnemyFrameRect;
  xRatio: number;
  yRatio: number;
  scale: number;
}

interface PathPoint {
  x: number;
  score: number;
}

interface MinimapHazardSample {
  x: number;
  score: number;
  radius: number;
}

type StratumTexture = "mine" | "rubble";

interface StratumConfig {
  level: number;
  label: string;
  maxScore: number;
  colorTop: string;
  colorBottom: string;
  texture: StratumTexture;
  textureAlpha: number;
  vignetteAlpha: number;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PLAYER_FRAME_WIDTH = 68;
const PLAYER_FRAME_HEIGHT = 67;
const PLAYER_WALK_FPS = 8;
const BOOST_ANIMATION_FPS = 10;
const PLAYER_FRAMES: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 421, y: 197, w: 48, h: 47 },
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
const WOLF_FRAME: EnemyFrameRect = { x: 9, y: 51, w: 238, h: 155 };
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
const EXPLOSION_FRAMES: ReadonlyArray<EnemyFrameRect> = [
  { x: 245, y: 262, w: 40, h: 36 },
  { x: 288, y: 259, w: 47, h: 42 },
  { x: 336, y: 258, w: 47, h: 42 },
  { x: 383, y: 258, w: 47, h: 42 },
  { x: 430, y: 258, w: 47, h: 42 },
  { x: 477, y: 258, w: 47, h: 42 },
];
const INTRO_ORE_FRAMES: ReadonlyArray<EnemyFrameRect> = [
  { x: 66, y: 3, w: 29, h: 28 },
  { x: 98, y: 3, w: 29, h: 28 },
  { x: 130, y: 3, w: 29, h: 28 },
  { x: 162, y: 3, w: 29, h: 28 },
];
const BG_TILE_SIZE = 512;
const STRATUM_TRANSITION_DURATION = 1.2;
const STRATUM_BANNER_DURATION = 2.1;
const INTRO_BG_REVEAL_DURATION = 1.3;
const CAMERA_HIT_SHAKE_DURATION = 0.2;
const CAMERA_HIT_SHAKE_STRENGTH = 20;
const CAMERA_SHAKE_DRAW_PAD = 48;
const WOLF_EVENT_TRIGGER_SCORE = 4000;
const WOLF_EVENT_RISE_DURATION = 3.0;
const WOLF_EVENT_RETURN_DURATION = 1.2;
const WOLF_EVENT_SPAWN_MARGIN = 28;
const WOLF_EVENT_CAMERA_TOP_PADDING = 8;
const WOLF_EVENT_SHAKE_MIN_AMPLITUDE = 6;
const WOLF_EVENT_SHAKE_MAX_AMPLITUDE = 28;
const WOLF_EVENT_SHAKE_FREQUENCY = 7.5;
const WOLF_EVENT_BLINK_FREQUENCY = 11;
const WOLF_EVENT_BLINK_VISIBLE_RATIO = 0.56;
const STRATUM_CONFIGS: ReadonlyArray<StratumConfig> = [
  {
    level: 1,
    label: "Stratum 1",
    maxScore: 1000,
    colorTop: "#bbb09b",
    colorBottom: "#8f8572",
    texture: "mine",
    textureAlpha: 0.14,
    vignetteAlpha: 0.2,
  },
  {
    level: 2,
    label: "Stratum 2",
    maxScore: 2000,
    colorTop: "#85979a",
    colorBottom: "#5f6b6d",
    texture: "mine",
    textureAlpha: 0.17,
    vignetteAlpha: 0.5,
  },
  {
    level: 3,
    label: "Stratum 3",
    maxScore: 3000,
    colorTop: "#7a6e66",
    colorBottom: "#473f3b",
    texture: "rubble",
    textureAlpha: 0.2,
    vignetteAlpha: 0.7,
  },
  {
    level: 4,
    label: "Stratum 4",
    maxScore: 5000,
    colorTop: "#4a4547",
    colorBottom: "#241f24",
    texture: "rubble",
    textureAlpha: 0.24,
    vignetteAlpha: 0.8,
  },
];
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
const FX_EXPLOSION_MAX = 64;
const EXPLOSION_FRAME_FPS = 18;
const EXPLOSION_BASE_FRAME_W = 47;
const EXPLOSION_BASE_FRAME_H = 42;
const BOOST_BREAK_SIZE_MIN = 60;
const BOOST_BREAK_SIZE_MAX = 220;
const BOOST_BREAK_SHAKE_MIN_STRENGTH = 8;
const BOOST_BREAK_SHAKE_MAX_STRENGTH = 26;
const BOOST_BREAK_SHAKE_MIN_DURATION = 0.09;
const BOOST_BREAK_SHAKE_MAX_DURATION = 0.22;
const VIGNETTE_INTENSITY_MULTIPLIER = 3;
const STRATUM_SPEED_MULTIPLIER_STEP = 1.2;
const MINIMAP_CANVAS_W = 640;
const MINIMAP_CANVAS_H = 440;
const MINIMAP_PADDING = 0;
const MINIMAP_STRATUM_SPAN_SCORE = 1000;
const MINIMAP_SCORE_MAX = MINIMAP_STRATUM_SPAN_SCORE * 4;
const MINIMAP_PATH_MAX_POINTS = 2200;
const MINIMAP_PATH_SAMPLE_SCORE_STEP = 7;
const MINIMAP_PATH_SAMPLE_X_STEP = 6;
const MINIMAP_HAZARD_SAMPLE_SCORE_STEP = 16;
const MINIMAP_HAZARD_MAX_SAMPLES = 4200;
const MINIMAP_AI_VIRTUAL_HAZARD_SCORE_STEP = 56;
const MINIMAP_AI_VIRTUAL_HAZARD_AHEAD = 1600;
const MINIMAP_AI_VIRTUAL_HAZARD_LANES = 5;
const MINIMAP_AI_VIRTUAL_HAZARD_MIN_PER_STEP = 1;
const MINIMAP_AI_VIRTUAL_HAZARD_MAX_PER_STEP = 4;
const MINIMAP_AI_SCORE_STEP = 36;
const MINIMAP_AI_CENTER_PULL_MIN = 0.38;
const MINIMAP_AI_CENTER_PULL_MAX = 0.66;
const MINIMAP_AI_CRASH_AVOID_SCORE_WINDOW = 520;
const MINIMAP_AI_CRASH_AVOID_OFFSET = 320;
const MINIMAP_AI_CRASH_AVOID_X_RATIO = 0.18;
const MINIMAP_AI_X_STEP_RATIO = 0.14;
const MINIMAP_AI_HAZARD_WINDOW = 180;
const MINIMAP_AI_HAZARD_RADIUS_PAD = 120;
const MINIMAP_AI_HAZARD_REPULSION = 0.56;
const MINIMAP_AI_ROUTE_COLOR = "rgba(109, 255, 211, 0.95)";
const MINIMAP_PLAYER_ROUTE_COLOR = "rgba(235,245,255,0.95)";
const MENU_BUTTON_FONT_PX = 48;
const AUDIO_LABEL_ON = "Audio: ON";
const AUDIO_LABEL_OFF = "Audio: OFF";
const WIN_TARGET_SCORE = 5000;
const SCORE_SCALE = 3.75;
const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultyConfig> = {
  easy: { label: "Easy", speedMul: 0.9, spawnMul: 1.12 },
  normal: { label: "Normal", speedMul: 1, spawnMul: 1 },
  hard: { label: "Hard", speedMul: 1.14, spawnMul: 0.88 },
};

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
  ramp: { w: 81, h: 79, str: "boost", group: "top", hazard: true, collectible: "none", solid: true },
  boost: { w: 36, h: 44, str: "boost", group: "top", hazard: false, collectible: "boost", solid: false },
  life: { w: 64, h: 64, str: "boost", group: "top", hazard: false, collectible: "life", solid: false },
  lure: { w: 60, h: 94, str: "avoid", group: "top", hazard: true, collectible: "none", solid: true },
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app not found");
}

const root = document.createElement("div");
root.className = "game-root";

const hud = document.createElement("div");
hud.className = "hud";

const hpMeter = document.createElement("div");
hpMeter.className = "hud-meter hp-meter";
const hpSlots = Array.from({ length: 3 }, () => {
  const slot = document.createElement("span");
  slot.className = "meter-slot hp-full";
  return slot;
});
hpMeter.append(...hpSlots);

const highScoreText = document.createElement("span");
highScoreText.className = "hud-score";

const boostMeter = document.createElement("div");
boostMeter.className = "hud-meter boost-meter";
const boostSlots = Array.from({ length: 3 }, () => {
  const slot = document.createElement("span");
  slot.className = "meter-slot boost-empty";
  return slot;
});
boostMeter.append(...boostSlots);

hud.append(hpMeter, highScoreText, boostMeter);

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

const overlayActions = document.createElement("div");
overlayActions.className = "overlay-actions";

const overlayDifficultyActions = document.createElement("div");
overlayDifficultyActions.className = "overlay-actions overlay-difficulty hidden";

const overlayDifficultyEasy = document.createElement("button");
overlayDifficultyEasy.className = "overlay-button difficulty-button difficulty-easy";
overlayDifficultyEasy.type = "button";
overlayDifficultyEasy.textContent = "Easy";

const overlayDifficultyNormal = document.createElement("button");
overlayDifficultyNormal.className = "overlay-button difficulty-button difficulty-normal";
overlayDifficultyNormal.type = "button";
overlayDifficultyNormal.textContent = "Normal";

const overlayDifficultyHard = document.createElement("button");
overlayDifficultyHard.className = "overlay-button difficulty-button difficulty-hard";
overlayDifficultyHard.type = "button";
overlayDifficultyHard.textContent = "Hard";

overlayDifficultyActions.append(overlayDifficultyEasy, overlayDifficultyNormal, overlayDifficultyHard);

const overlayHowToPlay = document.createElement("button");
overlayHowToPlay.className = "overlay-button";
overlayHowToPlay.type = "button";
overlayHowToPlay.textContent = "How to Play";

const overlayScoreBoard = document.createElement("button");
overlayScoreBoard.className = "overlay-button";
overlayScoreBoard.type = "button";
overlayScoreBoard.textContent = "Score Board";

overlayActions.append(overlayHowToPlay, overlayScoreBoard);

const overlayMessage = document.createElement("div");
overlayMessage.className = "overlay-message";

const overlayMinimap = document.createElement("canvas");
overlayMinimap.className = "overlay-minimap hidden";
overlayMinimap.width = MINIMAP_CANVAS_W;
overlayMinimap.height = MINIMAP_CANVAS_H;
const overlayMinimapCtx = overlayMinimap.getContext("2d") as CanvasRenderingContext2D;

const audioToggle = document.createElement("button");
audioToggle.className = "audio-toggle";
audioToggle.type = "button";
audioToggle.textContent = AUDIO_LABEL_ON;
audioToggle.setAttribute("aria-label", "Toggle Audio");
audioToggle.setAttribute("aria-pressed", "true");

overlay.append(overlayTitle, overlayPrompt, overlayDifficultyActions, overlayActions, overlayMessage, overlayMinimap);
stage.append(canvas, overlay);
root.append(hud, stage, audioToggle);
app.replaceChildren(root);

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const playerSpriteSheet = new Image();
playerSpriteSheet.src = playerSpriteSheetUrl;
const enemySpriteSheet = new Image();
enemySpriteSheet.src = enemySpriteSheetUrl;
const wolfSpriteSheet = new Image();
wolfSpriteSheet.src = wolfSpriteSheetUrl;
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
const oreSpriteSheet = new Image();
oreSpriteSheet.src = oreSpriteSheetUrl;
const introThemeAudio = new Audio(introThemeUrl);
introThemeAudio.loop = true;
introThemeAudio.preload = "auto";
const failThemeAudio = new Audio(failThemeUrl);
failThemeAudio.loop = true;
failThemeAudio.preload = "auto";
const winThemeAudio = new Audio(winThemeUrl);
winThemeAudio.loop = true;
winThemeAudio.preload = "auto";
const gameplayTextureImages: Record<StratumTexture, HTMLImageElement> = {
  mine: new Image(),
  rubble: new Image(),
};
gameplayTextureImages.mine.src = gameplayBgMineUrl;
gameplayTextureImages.rubble.src = gameplayBgRubbleUrl;
const introBackgroundImages = [introBackground1Url, introBackground2Url, introBackground3Url].map((src) => {
  const image = new Image();
  image.src = src;
  return image;
});
const introCloudImages = [
  introCloud1Url,
  introCloud2Url,
  introCloud3Url,
  introCloud4Url,
  introCloud5Url,
  introCloud6Url,
  introCloud7Url,
  introCloud8Url,
].map((src) => {
  const image = new Image();
  image.src = src;
  return image;
});

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
let pendingDifficultyStart: GameDifficulty | null = null;
let menuOverlayMode: MenuOverlayMode = "main";
let selectedDifficulty: GameDifficulty = "normal";
let runDifficulty: GameDifficulty = "normal";
let audioEnabled = true;
let audioInteracted = false;

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
  explosions: [] as FxExplosion[],
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
let introMenuElapsed = 0;
let cameraShakeTimeLeft = 0;
let cameraShakeDuration = 0;
let cameraShakeStrength = 0;
const cameraShakeOffset: Vec2 = { x: 0, y: 0 };
const cameraEventOffset: Vec2 = { x: 0, y: 0 };
const runPath: PathPoint[] = [];
const minimapHazardSamples: MinimapHazardSample[] = [];
let minimapHazardSampleScoreBin = -1;
const wolfEncounter = {
  triggered: false,
  active: false,
  phase: "inactive" as WolfEncounterPhase,
  timer: 0,
  targetOffsetY: 0,
  enemyId: 0,
};
const introClouds: IntroCloud[] = [];
const introOreSprites: IntroOreSprite[] = [];
let activeStratumLevel = 1;
const stratumTransition = {
  active: false,
  from: 1,
  to: 1,
  progress: 1,
  duration: STRATUM_TRANSITION_DURATION,
};
const stratumBanner = {
  text: "Stratum 1",
  timer: STRATUM_BANNER_DURATION,
  duration: STRATUM_BANNER_DURATION,
};

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
resetIntroPresentation();
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
  updateCameraShake(dt);

  if (scene === "menu") {
    introMenuElapsed += dt;
    if (pendingStart) {
      pendingStart = false;
      if (menuOverlayMode === "main") {
        menuOverlayMode = "difficulty";
        uiDirty = true;
      }
    }
    if (pendingDifficultyStart) {
      selectedDifficulty = pendingDifficultyStart;
      runDifficulty = pendingDifficultyStart;
      pendingDifficultyStart = null;
      startNewRun();
    }
    updateHUD();
    return;
  }

  if (scene === "gameover" || scene === "win") {
    toastTimer = Math.max(0, toastTimer - dt);
    if (pendingRestart) {
      pendingRestart = false;
      resetRunState();
      setScene("menu");
    }
    updateHUD();
    return;
  }

  if (scene === "playing" && wolfEncounter.active) {
    pendingPauseToggle = false;
    updateWolfEncounter(dt);
    toastTimer = Math.max(0, toastTimer - dt);
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

  currentScore = Math.floor(sys.game.dist.unit * SCORE_SCALE);
  recordMinimapHazardSamples();
  recordRunPathPoint();
  if (!wolfEncounter.triggered && currentScore >= WOLF_EVENT_TRIGGER_SCORE) {
    // Temporary OFF: camera move/wolf encounter sequence at 4000 score.
    void startWolfEncounter;
    // startWolfEncounter();
    // updateHUD();
    // return;
  }
  updateStratumState(dt);
  toastTimer = Math.max(0, toastTimer - dt);
  updateHUD();

  if (!sys.game.finish && currentScore >= WIN_TARGET_SCORE) {
    finishRun("win");
    return;
  }

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

  if (scene === "menu" || scene === "gameover" || scene === "win") {
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
  applyMenuButtonFontSize(scene === "menu");
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
  clearWolfEncounterEntity();
  resetWolfEncounterState();
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
  activeStratumLevel = 1;
  stratumTransition.active = false;
  stratumTransition.from = 1;
  stratumTransition.to = 1;
  stratumTransition.progress = 1;
  stratumBanner.text = "Stratum 1";
  stratumBanner.timer = stratumBanner.duration;
  resetSpawnTimers();
  resetCameraShake();
  resetRunPath();
  resetMinimapHazardSamples();

  recentClusters.length = 0;
  world.top = sleepAll(world.top);
  world.btm = sleepAll(world.btm);
  world.npc = sleepAll(world.npc);
  world.enemy = sleepAll(world.enemy);
  world.all.length = 0;
  fx.particles.length = 0;
  fx.boostTrail.length = 0;
  fx.explosions.length = 0;
}

function startNewRun(): void {
  runDifficulty = selectedDifficulty;
  resetRunState();
  stats.plays += 1;
  saveStats(stats);
  setScene("playing");
}

function finishRun(reason: "obstacle" | "enemy" | "win"): void {
  if (sys.game.finish) {
    return;
  }

  recordMinimapHazardSamples(true);
  recordRunPathPoint(true);
  sys.game.finish = true;
  sys.game.caught = reason === "enemy";
  gameOverReason =
    reason === "win"
      ? "you have reached the target zone"
      : reason === "enemy"
      ? "enemy caught you"
      : "obstacle limit reached";

  if (currentScore > stats.highScore) {
    stats.highScore = currentScore;
    sys.game.highScore = true;
    toastText = "new high score!";
    toastTimer = 2.8;
    saveStats(stats);
  }

  setScene(reason === "win" ? "win" : "gameover");
}

function setScene(next: SceneState): void {
  const prev = scene;
  scene = next;
  if (next !== "playing" && next !== "paused") {
    resetCameraShake();
    clearWolfEncounterEntity();
    resetWolfEncounterState();
  }
  if (next === "menu" && prev !== "menu") {
    resetIntroPresentation();
    menuOverlayMode = "main";
    pendingDifficultyStart = null;
    pendingStart = false;
    introThemeAudio.currentTime = 0;
  }
  if (next === "gameover" && prev !== "gameover") {
    failThemeAudio.currentTime = 0;
  }
  if (next === "win" && prev !== "win") {
    winThemeAudio.currentTime = 0;
  }
  uiDirty = true;
  syncOverlay();
  updateHUD();
  syncSceneAudio();
}

function syncOverlay(): void {
  if (scene === "menu") {
    root.classList.add("menu-ui");
    root.classList.remove("gameover-ui");
    root.classList.remove("result-fail-ui");
    root.classList.remove("result-win-ui");
    stage.classList.remove("gameover-blur");
    overlay.classList.remove("hidden");
    if (menuOverlayMode === "main") {
      setAnimatedOverlayTitle("Geosteering Quest");
    }
    if (menuOverlayMode === "difficulty") {
      overlayPrompt.classList.add("hidden");
      overlayActions.classList.add("hidden");
      overlayDifficultyActions.classList.remove("hidden");
      overlayMessage.classList.add("hidden");
      overlayMessage.textContent = "";
    } else {
      overlayPrompt.classList.remove("hidden");
      overlayActions.classList.remove("hidden");
      overlayDifficultyActions.classList.add("hidden");
      overlayPrompt.textContent = "Game Start";
      overlayMessage.classList.remove("hidden");
      overlayMessage.textContent = "";
    }
    applyMenuButtonFontSize(true);
    overlayMinimap.classList.add("hidden");
    return;
  }

  if (scene === "paused") {
    root.classList.remove("menu-ui");
    root.classList.remove("gameover-ui");
    root.classList.remove("result-fail-ui");
    root.classList.remove("result-win-ui");
    stage.classList.remove("gameover-blur");
    overlay.classList.remove("hidden");
    overlayPrompt.classList.remove("hidden");
    overlayActions.classList.add("hidden");
    overlayDifficultyActions.classList.add("hidden");
    overlayMessage.classList.remove("hidden");
    setPlainOverlayTitle("paused");
    overlayPrompt.textContent = "press space to resume";
    overlayMessage.textContent = `score ${currentScore}`;
    applyMenuButtonFontSize(false);
    overlayMinimap.classList.add("hidden");
    return;
  }

  if (scene === "gameover") {
    root.classList.remove("menu-ui");
    root.classList.add("gameover-ui");
    root.classList.add("result-fail-ui");
    root.classList.remove("result-win-ui");
    stage.classList.add("gameover-blur");
    overlay.classList.remove("hidden");
    overlayPrompt.classList.remove("hidden");
    overlayActions.classList.add("hidden");
    overlayDifficultyActions.classList.add("hidden");
    overlayMessage.classList.remove("hidden");
    setPlainOverlayTitle("game over");
    overlayPrompt.textContent = "press space to return menu";
    const recordText = sys.game.highScore ? " | new high score!" : "";
    overlayMessage.textContent = `${gameOverReason} | score ${currentScore}${recordText}`;
    applyMenuButtonFontSize(false);
    overlayMinimap.classList.remove("hidden");
    drawRunPathMinimap();
    return;
  }

  if (scene === "win") {
    root.classList.remove("menu-ui");
    root.classList.add("gameover-ui");
    root.classList.remove("result-fail-ui");
    root.classList.add("result-win-ui");
    stage.classList.add("gameover-blur");
    overlay.classList.remove("hidden");
    overlayPrompt.classList.remove("hidden");
    overlayActions.classList.add("hidden");
    overlayDifficultyActions.classList.add("hidden");
    overlayMessage.classList.remove("hidden");
    setPlainOverlayTitle("win");
    overlayPrompt.textContent = "press space to return menu";
    const recordText = sys.game.highScore ? " | new high score!" : "";
    overlayMessage.textContent = `${gameOverReason} | score ${currentScore}${recordText}`;
    applyMenuButtonFontSize(false);
    overlayMinimap.classList.remove("hidden");
    drawRunPathMinimap();
    return;
  }

  root.classList.remove("menu-ui");
  root.classList.remove("gameover-ui");
  root.classList.remove("result-fail-ui");
  root.classList.remove("result-win-ui");
  stage.classList.remove("gameover-blur");
  overlay.classList.add("hidden");
  overlayPrompt.classList.remove("hidden");
  overlayDifficultyActions.classList.add("hidden");
  overlayMessage.classList.remove("hidden");
  overlayMinimap.classList.add("hidden");
  applyMenuButtonFontSize(false);
}

function applyMenuButtonFontSize(enabled: boolean): void {
  const buttons = [
    overlayPrompt,
    overlayHowToPlay,
    overlayScoreBoard,
    overlayDifficultyEasy,
    overlayDifficultyNormal,
    overlayDifficultyHard,
  ];
  if (!enabled) {
    for (const button of buttons) {
      button.style.fontSize = "";
      button.style.lineHeight = "";
    }
    return;
  }

  const size = `${MENU_BUTTON_FONT_PX}px`;
  for (const button of buttons) {
    button.style.fontSize = size;
    button.style.lineHeight = "1.05";
  }
}

function setAudioToggleLabel(): void {
  audioToggle.textContent = audioEnabled ? AUDIO_LABEL_ON : AUDIO_LABEL_OFF;
  audioToggle.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
}

function pauseAudio(track: HTMLAudioElement): void {
  track.pause();
}

function safePlayAudio(track: HTMLAudioElement): void {
  const promise = track.play();
  if (typeof promise?.catch === "function") {
    promise.catch(() => undefined);
  }
}

function pauseAllSceneAudio(): void {
  pauseAudio(introThemeAudio);
  pauseAudio(failThemeAudio);
  pauseAudio(winThemeAudio);
}

function syncSceneAudio(): void {
  if (!audioEnabled || !audioInteracted) {
    pauseAllSceneAudio();
    return;
  }

  if (scene === "menu") {
    pauseAudio(failThemeAudio);
    pauseAudio(winThemeAudio);
    safePlayAudio(introThemeAudio);
    return;
  }

  if (scene === "gameover") {
    pauseAudio(introThemeAudio);
    pauseAudio(winThemeAudio);
    safePlayAudio(failThemeAudio);
    return;
  }

  if (scene === "win") {
    pauseAudio(introThemeAudio);
    pauseAudio(failThemeAudio);
    safePlayAudio(winThemeAudio);
    return;
  }

  pauseAllSceneAudio();
}

function registerAudioInteraction(): void {
  if (!audioInteracted) {
    audioInteracted = true;
  }
  syncSceneAudio();
}

function setAudioEnabled(next: boolean): void {
  audioEnabled = next;
  if (!audioEnabled) {
    pauseAllSceneAudio();
  } else {
    registerAudioInteraction();
  }
  setAudioToggleLabel();
}

function resetRunPath(): void {
  runPath.length = 0;
  runPath.push({ x: sys.game.dist.x, score: 0 });
}

function resetMinimapHazardSamples(): void {
  minimapHazardSamples.length = 0;
  minimapHazardSampleScoreBin = -1;
}

function recordMinimapHazardSamples(force = false): void {
  if (scene !== "playing" && !force) {
    return;
  }

  const scoreBin = Math.floor(Math.max(0, currentScore) / MINIMAP_HAZARD_SAMPLE_SCORE_STEP);
  if (!force && scoreBin <= minimapHazardSampleScoreBin) {
    return;
  }
  minimapHazardSampleScoreBin = scoreBin;

  const sampleScore = Math.max(0, currentScore);
  for (const entity of world.all) {
    if (entity.sleep || !entity.hazard || !entity.solid) {
      continue;
    }
    minimapHazardSamples.push({
      x: entity.x + entity.w * 0.5,
      score: sampleScore,
      radius: clamp(Math.max(entity.w, entity.h) * 0.5, 24, 220),
    });
  }

  if (minimapHazardSamples.length > MINIMAP_HAZARD_MAX_SAMPLES) {
    minimapHazardSamples.splice(0, minimapHazardSamples.length - MINIMAP_HAZARD_MAX_SAMPLES);
  }
}

function recordRunPathPoint(force = false): void {
  const point: PathPoint = {
    x: sys.game.dist.x,
    score: Math.max(0, currentScore),
  };
  const prev = runPath[runPath.length - 1];
  if (!prev) {
    runPath.push(point);
    return;
  }

  const scoreDelta = Math.abs(point.score - prev.score);
  const xDelta = Math.abs(point.x - prev.x);
  if (force || scoreDelta >= MINIMAP_PATH_SAMPLE_SCORE_STEP || xDelta >= MINIMAP_PATH_SAMPLE_X_STEP) {
    runPath.push(point);
    if (runPath.length > MINIMAP_PATH_MAX_POINTS) {
      runPath.splice(0, runPath.length - MINIMAP_PATH_MAX_POINTS);
    }
  }
}

function drawRunPathMinimap(): void {
  const ctx2d = overlayMinimapCtx;
  const w = overlayMinimap.width;
  const h = overlayMinimap.height;
  const pad = MINIMAP_PADDING;
  const plotX = pad;
  const plotY = pad;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;

  ctx2d.clearRect(0, 0, w, h);
  ctx2d.fillStyle = "rgba(8,8,10,0.88)";
  ctx2d.fillRect(0, 0, w, h);
  const bandH = plotH / 4;
  for (let i = 0; i < 4; i += 1) {
    const cfg = getStratumConfig(i + 1);
    const y0 = Math.floor(plotY + bandH * i);
    const y1 = i === 3 ? Math.ceil(plotY + plotH) : Math.ceil(y0 + bandH);

    const bandGradient = ctx2d.createLinearGradient(0, y0, 0, y1);
    bandGradient.addColorStop(0, cfg.colorTop);
    bandGradient.addColorStop(1, cfg.colorBottom);
    ctx2d.fillStyle = bandGradient;
    ctx2d.fillRect(plotX, y0, plotW, y1 - y0);

    const texture = gameplayTextureImages[cfg.texture];
    if (texture.complete && texture.naturalWidth > 0 && texture.naturalHeight > 0) {
      const prevAlpha = ctx2d.globalAlpha;
      const tile = 112;
      ctx2d.save();
      ctx2d.beginPath();
      ctx2d.rect(plotX, y0, plotW, y1 - y0);
      ctx2d.clip();
      ctx2d.globalAlpha = clamp(cfg.textureAlpha * 1.15, 0.12, 0.3);
      for (let tx = plotX - tile; tx < plotX + plotW + tile; tx += tile) {
        for (let ty = y0 - tile; ty < y1 + tile; ty += tile) {
          ctx2d.drawImage(texture, tx, ty, tile, tile);
        }
      }
      // Tint texture to stratum colors so minimap bands match gameplay palette.
      ctx2d.globalCompositeOperation = "multiply";
      ctx2d.globalAlpha = 0.42;
      ctx2d.fillStyle = bandGradient;
      ctx2d.fillRect(plotX, y0, plotW, y1 - y0);
      ctx2d.restore();
      ctx2d.globalAlpha = prevAlpha;
    }

    if (i > 0) {
      ctx2d.strokeStyle = "rgba(255,255,255,0.42)";
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      ctx2d.moveTo(plotX, y0);
      ctx2d.lineTo(plotX + plotW, y0);
      ctx2d.stroke();
    }

    ctx2d.fillStyle = "rgba(255,255,255,0.9)";
    const labelFontPx = Math.round(clamp((y1 - y0) * 0.24, 20, 34));
    ctx2d.font = `${labelFontPx}px "BitPotion", sans-serif`;
    ctx2d.textAlign = "left";
    ctx2d.textBaseline = "top";
    ctx2d.lineWidth = 3;
    ctx2d.strokeStyle = "rgba(0,0,0,0.45)";
    ctx2d.strokeText(`S${i + 1}`, plotX + 10, y0 + 8);
    ctx2d.fillText(`S${i + 1}`, plotX + 10, y0 + 8);
  }

  if (runPath.length === 0) {
    return;
  }

  let minX = runPath[0]?.x ?? 0;
  let maxX = runPath[0]?.x ?? 0;
  for (const point of runPath) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }
  const xSpan = Math.max(160, maxX - minX);
  const xPad = Math.max(24, xSpan * 0.12);
  const xMin = minX - xPad;
  const xMax = maxX + xPad;
  const xRange = Math.max(1, xMax - xMin);

  const toMapX = (value: number): number => plotX + ((value - xMin) / xRange) * plotW;
  const toMapY = (value: number): number => plotY + (clamp(value, 0, MINIMAP_SCORE_MAX) / MINIMAP_SCORE_MAX) * plotH;

  const aiPath = buildAIMinimapPath(runPath);
  if (aiPath.length > 1) {
    ctx2d.strokeStyle = MINIMAP_AI_ROUTE_COLOR;
    ctx2d.lineWidth = 3;
    ctx2d.lineJoin = "round";
    ctx2d.lineCap = "round";
    ctx2d.setLineDash([12, 8]);
    ctx2d.beginPath();
    for (let i = 0; i < aiPath.length; i += 1) {
      const point = aiPath[i];
      const px = toMapX(point.x);
      const py = toMapY(point.score);
      if (i === 0) {
        ctx2d.moveTo(px, py);
      } else {
        ctx2d.lineTo(px, py);
      }
    }
    ctx2d.stroke();
    ctx2d.setLineDash([]);

    const aiEnd = aiPath[aiPath.length - 1];
    if (aiEnd) {
      ctx2d.fillStyle = MINIMAP_AI_ROUTE_COLOR;
      ctx2d.beginPath();
      ctx2d.arc(toMapX(aiEnd.x), toMapY(aiEnd.score), 6, 0, Math.PI * 2);
      ctx2d.fill();
    }
  }

  ctx2d.strokeStyle = MINIMAP_PLAYER_ROUTE_COLOR;
  ctx2d.lineWidth = 4;
  ctx2d.lineJoin = "round";
  ctx2d.lineCap = "round";
  ctx2d.beginPath();
  for (let i = 0; i < runPath.length; i += 1) {
    const point = runPath[i];
    const px = toMapX(point.x);
    const py = toMapY(point.score);
    if (i === 0) {
      ctx2d.moveTo(px, py);
    } else {
      ctx2d.lineTo(px, py);
    }
  }
  ctx2d.stroke();

  const start = runPath[0] ?? { x: 0, score: 0 };
  const end = runPath[runPath.length - 1] ?? start;
  ctx2d.fillStyle = "#58ffa1";
  ctx2d.beginPath();
  ctx2d.arc(toMapX(start.x), toMapY(start.score), 7, 0, Math.PI * 2);
  ctx2d.fill();
  ctx2d.strokeStyle = "rgba(0,0,0,0.5)";
  ctx2d.lineWidth = 2;
  ctx2d.stroke();
  ctx2d.fillStyle = "#ff7b7b";
  ctx2d.beginPath();
  ctx2d.arc(toMapX(end.x), toMapY(end.score), 7, 0, Math.PI * 2);
  ctx2d.fill();
  ctx2d.stroke();

  ctx2d.font = "26px \"BitPotion\", sans-serif";
  ctx2d.textAlign = "left";
  ctx2d.textBaseline = "bottom";
  const legendY = plotY + plotH - 10;
  const playerLabel = "PLAYER ROUTE";
  const aiLabel = "AI ROUTE";
  const legendGap = 24;
  const aiLabelW = ctx2d.measureText(aiLabel).width;
  const playerLabelW = ctx2d.measureText(playerLabel).width;
  const aiLabelX = plotX + plotW - 12 - aiLabelW;
  const playerLabelX = aiLabelX - legendGap - playerLabelW;
  ctx2d.fillStyle = MINIMAP_PLAYER_ROUTE_COLOR;
  ctx2d.fillText(playerLabel, playerLabelX, legendY);
  ctx2d.fillStyle = MINIMAP_AI_ROUTE_COLOR;
  ctx2d.fillText(aiLabel, aiLabelX, legendY);
}

function buildAIMinimapPath(source: PathPoint[]): PathPoint[] {
  if (source.length === 0) {
    return [];
  }

  const ordered = [...source].sort((a, b) => a.score - b.score);
  const first = ordered[0];
  if (!first) {
    return [];
  }

  let minX = first.x;
  let maxX = first.x;
  for (const point of ordered) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }
  const xSpan = Math.max(120, maxX - minX);
  const xPad = Math.max(24, xSpan * 0.12);
  const xMin = minX - xPad;
  const xMax = maxX + xPad;
  const xRange = Math.max(1, xMax - xMin);
  const centerX = (minX + maxX) * 0.5;
  const targetScore = MINIMAP_SCORE_MAX;
  const last = ordered[ordered.length - 1] ?? first;
  const crashScore = clamp(last.score, 0, MINIMAP_SCORE_MAX);
  const crashX = last.x;
  const avoidDir = crashX >= centerX ? -1 : 1;
  const virtualHazards = buildMinimapVirtualHazards(ordered, xMin, xMax);
  const hazardBuckets = buildMinimapHazardBucketMap([...minimapHazardSamples, ...virtualHazards]);
  const path: PathPoint[] = [{ x: clamp(first.x, xMin, xMax), score: 0 }];
  let aiX = clamp(first.x, xMin, xMax);

  for (let score = MINIMAP_AI_SCORE_STEP; score <= targetScore; score += MINIMAP_AI_SCORE_STEP) {
    const s = Math.min(score, targetScore);
    const progress = clamp(s / targetScore, 0, 1);
    const centerPull = MINIMAP_AI_CENTER_PULL_MIN + (MINIMAP_AI_CENTER_PULL_MAX - MINIMAP_AI_CENTER_PULL_MIN) * progress;
    const crashAvoid = clamp(
      (s - (crashScore - MINIMAP_AI_CRASH_AVOID_OFFSET)) / MINIMAP_AI_CRASH_AVOID_SCORE_WINDOW,
      0,
      1
    );
    const sampledPlayerX = samplePathXByScore(ordered, s);
    const hazardPush = getMinimapHazardAvoidOffset(hazardBuckets, s, aiX);
    const desiredX =
      sampledPlayerX * (1 - centerPull) +
      centerX * centerPull +
      avoidDir * crashAvoid * xRange * MINIMAP_AI_CRASH_AVOID_X_RATIO +
      hazardPush;
    const maxStep = xRange * MINIMAP_AI_X_STEP_RATIO;
    aiX = clamp(aiX + clamp(desiredX - aiX, -maxStep, maxStep), xMin, xMax);
    path.push({ x: aiX, score: s });
  }

  const tail = path[path.length - 1];
  if (!tail || tail.score < targetScore) {
    path.push({ x: aiX, score: targetScore });
  }

  return path;
}

function buildMinimapVirtualHazards(path: PathPoint[], xMin: number, xMax: number): MinimapHazardSample[] {
  const last = path[path.length - 1];
  if (!last) {
    return [];
  }

  const startScore = Math.max(0, last.score + MINIMAP_AI_VIRTUAL_HAZARD_SCORE_STEP);
  const endScore = Math.min(MINIMAP_SCORE_MAX, last.score + MINIMAP_AI_VIRTUAL_HAZARD_AHEAD);
  if (startScore > endScore) {
    return [];
  }

  const recentWindowStart = Math.max(0, last.score - 420);
  let recentCount = 0;
  for (const sample of minimapHazardSamples) {
    if (sample.score >= recentWindowStart && sample.score <= last.score + MINIMAP_HAZARD_SAMPLE_SCORE_STEP) {
      recentCount += 1;
    }
  }
  const densityBias = clamp(recentCount / 18, 0, 1.2);
  const laneCount = MINIMAP_AI_VIRTUAL_HAZARD_LANES;
  const laneSpan = Math.max(1, laneCount - 1);
  const laneWidth = (xMax - xMin) / laneSpan;
  const virtuals: MinimapHazardSample[] = [];

  for (let score = startScore; score <= endScore; score += MINIMAP_AI_VIRTUAL_HAZARD_SCORE_STEP) {
    const baseCount =
      MINIMAP_AI_VIRTUAL_HAZARD_MIN_PER_STEP +
      Math.floor(
        seededNoise(score * 0.017 + 41.7) *
          (MINIMAP_AI_VIRTUAL_HAZARD_MAX_PER_STEP - MINIMAP_AI_VIRTUAL_HAZARD_MIN_PER_STEP + 1)
      );
    const count = clamp(Math.round(baseCount + densityBias * 0.7), 1, MINIMAP_AI_VIRTUAL_HAZARD_MAX_PER_STEP);
    const usedLanes = new Set<number>();

    for (let i = 0; i < count; i += 1) {
      let lane = 0;
      let attempts = 0;
      while (attempts < 10) {
        lane = Math.floor(seededNoise(score * 0.073 + i * 17.31 + attempts * 3.1) * laneCount);
        if (!usedLanes.has(lane)) {
          break;
        }
        attempts += 1;
      }
      usedLanes.add(lane);

      const laneX = xMin + laneWidth * lane;
      const jitter = (seededNoise(score * 0.121 + lane * 11.3 + i * 5.7) - 0.5) * laneWidth * 0.42;
      const hazardX = clamp(laneX + jitter, xMin, xMax);
      const radius = clamp(laneWidth * (0.42 + seededNoise(score * 0.097 + lane * 4.9) * 0.36), 20, 92);
      virtuals.push({ x: hazardX, score, radius });
    }
  }

  return virtuals;
}

function buildMinimapHazardBucketMap(samples: MinimapHazardSample[]): Map<number, MinimapHazardSample[]> {
  const buckets = new Map<number, MinimapHazardSample[]>();
  for (const sample of samples) {
    const bucketKey = Math.floor(sample.score / MINIMAP_AI_HAZARD_WINDOW);
    const list = buckets.get(bucketKey);
    if (list) {
      list.push(sample);
    } else {
      buckets.set(bucketKey, [sample]);
    }
  }
  return buckets;
}

function getMinimapHazardAvoidOffset(
  buckets: Map<number, MinimapHazardSample[]>,
  score: number,
  x: number
): number {
  const bucketKey = Math.floor(score / MINIMAP_AI_HAZARD_WINDOW);
  let offset = 0;

  for (let key = bucketKey - 1; key <= bucketKey + 1; key += 1) {
    const list = buckets.get(key);
    if (!list) {
      continue;
    }
    for (const hazard of list) {
      const scoreDelta = Math.abs(hazard.score - score);
      if (scoreDelta > MINIMAP_AI_HAZARD_WINDOW) {
        continue;
      }

      const influenceRadius = hazard.radius + MINIMAP_AI_HAZARD_RADIUS_PAD;
      const dx = x - hazard.x;
      const absDx = Math.abs(dx);
      if (absDx >= influenceRadius) {
        continue;
      }

      const scoreWeight = 1 - scoreDelta / MINIMAP_AI_HAZARD_WINDOW;
      const proximity = 1 - absDx / influenceRadius;
      const dir =
        dx === 0 ? (seededNoise(score * 0.137 + hazard.x * 0.01) > 0.5 ? 1 : -1) : Math.sign(dx);
      offset += dir * proximity * scoreWeight * hazard.radius * MINIMAP_AI_HAZARD_REPULSION;
    }
  }

  return offset;
}

function seededNoise(seed: number): number {
  const n = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function samplePathXByScore(path: PathPoint[], score: number): number {
  const first = path[0];
  const last = path[path.length - 1];
  if (!first || !last) {
    return 0;
  }

  if (score <= first.score) {
    return first.x;
  }
  if (score >= last.score) {
    return last.x;
  }

  for (let i = 1; i < path.length; i += 1) {
    const prev = path[i - 1];
    const next = path[i];
    if (!prev || !next) {
      continue;
    }
    if (score <= next.score) {
      const span = Math.max(1, next.score - prev.score);
      const t = clamp((score - prev.score) / span, 0, 1);
      return prev.x + (next.x - prev.x) * t;
    }
  }

  return last.x;
}

function updateHUD(): void {
  applyMeterState(hpSlots, sys.game.lives.current, "hp-full", "hp-empty");
  if (scene === "playing" || scene === "paused") {
    highScoreText.textContent = `★ ${currentScore}`;
  } else {
    highScoreText.textContent = `HIGH ${stats.highScore}`;
  }
  applyMeterState(boostSlots, sys.game.boosts.current, "boost-full", "boost-empty");
  if (uiDirty) {
    syncOverlay();
    uiDirty = false;
  }
}

function updateStratumState(dt: number): void {
  stratumBanner.timer = Math.max(0, stratumBanner.timer - dt);

  if (stratumTransition.active) {
    stratumTransition.progress = Math.min(1, stratumTransition.progress + dt / stratumTransition.duration);
    if (stratumTransition.progress >= 1) {
      stratumTransition.active = false;
      activeStratumLevel = stratumTransition.to;
      triggerStratumBanner(activeStratumLevel);
    }
    return;
  }

  const target = getStratumLevelByScore(currentScore);
  if (target > activeStratumLevel) {
    const nextLevel = Math.min(4, activeStratumLevel + 1);
    startStratumTransition(nextLevel);
  }
}

function startStratumTransition(nextLevel: number): void {
  if (nextLevel <= activeStratumLevel) {
    return;
  }
  stratumTransition.active = true;
  stratumTransition.from = activeStratumLevel;
  stratumTransition.to = nextLevel;
  stratumTransition.progress = 0;
  stratumTransition.duration = STRATUM_TRANSITION_DURATION;
}

function triggerStratumBanner(level: number): void {
  const cfg = getStratumConfig(level);
  stratumBanner.text = cfg.label;
  stratumBanner.timer = stratumBanner.duration;
}

function getStratumLevelByScore(score: number): number {
  if (score < 1000) {
    return 1;
  }
  if (score < 2000) {
    return 2;
  }
  if (score < 3000) {
    return 3;
  }
  return 4;
}

function getStratumConfig(level: number): StratumConfig {
  const clamped = clamp(level, 1, STRATUM_CONFIGS.length);
  return STRATUM_CONFIGS[clamped - 1] ?? STRATUM_CONFIGS[0];
}

function wireButtons(): void {
  audioToggle.addEventListener("click", () => {
    registerAudioInteraction();
    setAudioEnabled(!audioEnabled);
  });

  overlayPrompt.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene === "menu") {
      if (menuOverlayMode === "main") {
        pendingStart = true;
      }
    } else if (scene === "paused") {
      pendingPauseToggle = true;
    } else if (scene === "gameover" || scene === "win") {
      pendingRestart = true;
    }
  });

  overlayDifficultyEasy.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene !== "menu" || menuOverlayMode !== "difficulty") {
      return;
    }
    pendingDifficultyStart = "easy";
  });

  overlayDifficultyNormal.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene !== "menu" || menuOverlayMode !== "difficulty") {
      return;
    }
    pendingDifficultyStart = "normal";
  });

  overlayDifficultyHard.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene !== "menu" || menuOverlayMode !== "difficulty") {
      return;
    }
    pendingDifficultyStart = "hard";
  });

  overlayHowToPlay.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene !== "menu") {
      return;
    }
    overlayMessage.textContent = "Move: Arrow keys or WASD\nBoost: double tap Down / S\nPause: Space, Esc, or P";
  });

  overlayScoreBoard.addEventListener("click", () => {
    registerAudioInteraction();
    if (scene !== "menu") {
      return;
    }
    overlayMessage.textContent = `High Score: ${stats.highScore}\nPlays: ${stats.plays}`;
  });
}

function setPlainOverlayTitle(text: string): void {
  overlayTitle.classList.remove("is-animated");
  overlayTitle.replaceChildren();
  overlayTitle.textContent = text;
}

function setAnimatedOverlayTitle(text: string): void {
  overlayTitle.classList.remove("is-animated");
  overlayTitle.replaceChildren();

  let letterIndex = 0;
  for (const char of text) {
    const letter = document.createElement("span");
    letter.className = "title-letter";
    if (char === " ") {
      letter.classList.add("title-space");
      letter.innerHTML = "&nbsp;";
    } else {
      letter.textContent = char;
      letter.style.animationDelay = `${letterIndex * 0.045}s`;
      letterIndex += 1;
    }
    overlayTitle.append(letter);
  }

  void overlayTitle.offsetWidth;
  overlayTitle.classList.add("is-animated");
}

function applyMeterState(slots: HTMLSpanElement[], filled: number, filledClass: string, emptyClass: string): void {
  for (let i = 0; i < slots.length; i += 1) {
    const slot = slots[i];
    if (i < filled) {
      slot.className = `meter-slot ${filledClass}`;
    } else {
      slot.className = `meter-slot ${emptyClass}`;
    }
  }
}

function resetIntroPresentation(): void {
  introMenuElapsed = 0;
  introClouds.length = 0;
  introOreSprites.length = 0;
  const randomClouds = [...introCloudImages];
  randomClouds.sort(() => Math.random() - 0.5);

  for (const cloudImage of randomClouds) {
    introClouds.push({
      image: cloudImage,
      xRatio: 0.08 + Math.random() * 0.84,
      yRatio: 0.06 + Math.random() * 0.36,
      scale: 0.75 + Math.random() * 0.55,
      drift: 8 + Math.random() * 20,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const orePool: EnemyFrameRect[] = [];
  for (const frame of INTRO_ORE_FRAMES) {
    for (let i = 0; i < 10; i += 1) {
      orePool.push(frame);
    }
  }
  orePool.sort(() => Math.random() - 0.5);

  const bg3BoxTopRatio = 0.49;
  const bg3BoxBottomRatio = 1.0;
  const bg3BoxHeight = bg3BoxBottomRatio - bg3BoxTopRatio;
  const oreYMinRatio = bg3BoxTopRatio + bg3BoxHeight * 0.1;
  const oreYMaxRatio = bg3BoxTopRatio + bg3BoxHeight * 0.99;

  for (const frame of orePool) {
    let xRatio = 0.1 + Math.random() * 0.8;
    let yRatio = oreYMinRatio + Math.random() * (oreYMaxRatio - oreYMinRatio);
    const scale = 1 + Math.random() * 0.55;

    for (let attempts = 0; attempts < 28; attempts += 1) {
      const candidateX = 0.1 + Math.random() * 0.8;
      const candidateY = oreYMinRatio + Math.random() * (oreYMaxRatio - oreYMinRatio);
      const overlaps = introOreSprites.some((sprite) => {
        const dx = (sprite.xRatio - candidateX) * 640;
        const dy = (sprite.yRatio - candidateY) * 640;
        return dx * dx + dy * dy < 34 * 34;
      });
      if (!overlaps) {
        xRatio = candidateX;
        yRatio = candidateY;
        break;
      }
    }

    introOreSprites.push({
      frame,
      xRatio,
      yRatio,
      scale,
    });
  }
}

function wireInput(): void {
  window.addEventListener("pointerdown", () => {
    registerAudioInteraction();
  });

  window.addEventListener("keydown", (event: KeyboardEvent) => {
    registerAudioInteraction();
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
        if (menuOverlayMode === "main") {
          pendingStart = true;
        }
      } else if (scene === "playing" || scene === "paused") {
        pendingPauseToggle = true;
      } else if (scene === "gameover" || scene === "win") {
        pendingRestart = true;
      }
      return;
    }

    if ((code === "KeyP" || code === "Escape") && scene !== "menu" && scene !== "gameover" && scene !== "win") {
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
  if (scene !== "playing" || wolfEncounter.active || isBoostActive() || sys.game.boosts.current <= 0) {
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
  const difficulty = DIFFICULTY_CONFIGS[runDifficulty];
  spawner.row.inc =
    Math.max(220, Math.round(spawnBase.row * phase.rowMul * difficulty.spawnMul)) / OBSTACLE_SPAWN_MULTIPLIER;
  spawner.enemy.inc = Math.max(280, Math.round(spawnBase.enemy * phase.enemyMul * difficulty.spawnMul));
  spawner.npc.inc = Math.max(60, Math.round(spawnBase.npc * phase.npcMul * difficulty.spawnMul));
}

function getStratumSpeedMultiplier(level: number): number {
  const clamped = clamp(level, 1, 4);
  return Math.pow(STRATUM_SPEED_MULTIPLIER_STEP, clamped - 1);
}

function getActiveSpeedMultiplier(): number {
  const difficulty = DIFFICULTY_CONFIGS[runDifficulty];
  const baseMul = getStratumSpeedMultiplier(activeStratumLevel);
  if (!stratumTransition.active) {
    return baseMul * difficulty.speedMul;
  }
  const fromMul = getStratumSpeedMultiplier(stratumTransition.from);
  const toMul = getStratumSpeedMultiplier(stratumTransition.to);
  const t = easeOutCubic(stratumTransition.progress);
  return (fromMul * (1 - t) + toMul * t) * difficulty.speedMul;
}

function updateWorldSpeed(dt: number, phase: PhaseConfig): void {
  const base = (BASE_WORLD_SPEED + sys.game.time.elapsed * 1.15) * getActiveSpeedMultiplier();
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
  object.stratumLevel = getStratumLevelByScore(currentScore);
  object.ttl = 999;
  if (object.type === "enemy") {
    applyEnemyFrameToEntity(object, variant);
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
    stratumLevel: 1,
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
  if (frameKey === "wolf") {
    return WOLF_FRAME;
  }
  const key = ENEMY_FRAME_KEYS.find((candidate) => candidate === frameKey);
  if (key) {
    return ENEMY_FRAMES[key];
  }
  return ENEMY_FRAMES.enemy1;
}

function applyEnemyFrameToEntity(entity: Entity, preferredVariant = ""): void {
  if (preferredVariant === "wolf") {
    entity.variant = "wolf";
    entity.w = WOLF_FRAME.w;
    entity.h = WOLF_FRAME.h;
    return;
  }

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
    ramp: 6,
    lure: 3,
    boost: 2,
    life: 1,
    enemy: 2,
    npc: 10,
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
  triggerCameraShake(CAMERA_HIT_SHAKE_STRENGTH, CAMERA_HIT_SHAKE_DURATION);
}

function removeEntityForBoostCrash(entity: Entity): void {
  entity.sleep = true;
  if (entity.type !== "enemy") {
    return;
  }
  enemyRuntime.delete(entity.id);
  const fire = fireByEnemyId.get(entity.id);
  if (fire) {
    fire.sleep = true;
    fireByEnemyId.delete(entity.id);
  }
}

function getBoostBreakImpactRatio(entity: Entity): number {
  const size = Math.max(entity.w, entity.h);
  return clamp((size - BOOST_BREAK_SIZE_MIN) / (BOOST_BREAK_SIZE_MAX - BOOST_BREAK_SIZE_MIN), 0, 1);
}

function getExplosionScaleForEntity(entity: Entity): number {
  const sx = entity.w / EXPLOSION_BASE_FRAME_W;
  const sy = entity.h / EXPLOSION_BASE_FRAME_H;
  return clamp(Math.max(sx, sy) * 1.05, 0.9, 4.2);
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

      if (isBoostActive() && (entity.group === "top" || entity.group === "btm") && entity.collectible === "none") {
        const impact = getBoostBreakImpactRatio(entity);
        const shakeStrength =
          BOOST_BREAK_SHAKE_MIN_STRENGTH +
          (BOOST_BREAK_SHAKE_MAX_STRENGTH - BOOST_BREAK_SHAKE_MIN_STRENGTH) * impact;
        const shakeDuration =
          BOOST_BREAK_SHAKE_MIN_DURATION +
          (BOOST_BREAK_SHAKE_MAX_DURATION - BOOST_BREAK_SHAKE_MIN_DURATION) * impact;
        const explosionScale = getExplosionScaleForEntity(entity);
        removeEntityForBoostCrash(entity);
        triggerCameraShake(shakeStrength, shakeDuration);
        spawnExplosionFx(entity.x + entity.w * 0.5, entity.y + entity.h * 0.5, explosionScale);
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
          triggerCameraShake(CAMERA_HIT_SHAKE_STRENGTH, CAMERA_HIT_SHAKE_DURATION);
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

function spawnExplosionFx(x: number, y: number, scale = 1): void {
  const ttl = EXPLOSION_FRAMES.length / EXPLOSION_FRAME_FPS;
  fx.explosions.push({
    x,
    y,
    scale: clamp(scale, 0.75, 5),
    age: 0,
    ttl,
  });
  if (fx.explosions.length > FX_EXPLOSION_MAX) {
    fx.explosions.splice(0, fx.explosions.length - FX_EXPLOSION_MAX);
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

  const liveExplosions: FxExplosion[] = [];
  for (const explosion of fx.explosions) {
    explosion.x -= worldShift.x;
    explosion.y -= worldShift.y;
    explosion.age += dt;
    if (explosion.age < explosion.ttl) {
      liveExplosions.push(explosion);
    }
  }
  fx.explosions = liveExplosions;
}

function triggerCameraShake(strength: number, duration: number): void {
  cameraShakeStrength = Math.max(cameraShakeStrength, strength);
  cameraShakeDuration = Math.max(cameraShakeDuration, duration);
  cameraShakeTimeLeft = Math.max(cameraShakeTimeLeft, duration);
}

function updateCameraShake(dt: number): void {
  if (cameraShakeTimeLeft <= 0 || cameraShakeStrength <= 0) {
    cameraShakeOffset.x = 0;
    cameraShakeOffset.y = 0;
    return;
  }

  cameraShakeTimeLeft = Math.max(0, cameraShakeTimeLeft - dt);
  const ratio = cameraShakeDuration > 0 ? cameraShakeTimeLeft / cameraShakeDuration : 0;
  const intensity = cameraShakeStrength * ratio * ratio;
  const angle = Math.random() * Math.PI * 2;
  cameraShakeOffset.x = Math.round(Math.cos(angle) * intensity);
  cameraShakeOffset.y = Math.round(Math.sin(angle) * intensity * 0.75);

  if (cameraShakeTimeLeft <= 0) {
    resetCameraShake();
  }
}

function resetCameraShake(): void {
  cameraShakeTimeLeft = 0;
  cameraShakeDuration = 0;
  cameraShakeStrength = 0;
  cameraShakeOffset.x = 0;
  cameraShakeOffset.y = 0;
}

function startWolfEncounter(): void {
  if (scene !== "playing" || wolfEncounter.triggered) {
    return;
  }

  wolfEncounter.triggered = true;
  wolfEncounter.active = true;
  wolfEncounter.phase = "rise";
  wolfEncounter.timer = 0;
  wolfEncounter.targetOffsetY = 0;
  wolfEncounter.enemyId = 0;
  cameraEventOffset.x = 0;
  cameraEventOffset.y = 0;
  pendingPauseToggle = false;
  resetCameraShake();

  player.vel.x = 0;
  player.vel.y = 0;
  player.acc.x = 0;
  player.acc.y = 0;
  player.pos.x = session.x;
  player.pos.y = session.y;
  player.hitbox.x = player.pos.x - player.hitbox.w / 2;
  player.hitbox.y = player.pos.y - player.hitbox.h / 2;

  const wolfX = session.x - WOLF_FRAME.w * 0.5;
  const wolfY = -WOLF_FRAME.h - WOLF_EVENT_SPAWN_MARGIN;
  const wolf = buildObject("enemy", wolfX, wolfY, "wolf");
  wolf.hazard = false;
  wolf.solid = false;
  wolf.collectible = "none";
  wolfEncounter.enemyId = wolf.id;
  syncWolfEncounterEntity(wolf);
  wolfEncounter.targetOffsetY = Math.max(0, WOLF_EVENT_CAMERA_TOP_PADDING - wolf.y);
  mergeAll();
}

function updateWolfEncounter(dt: number): void {
  if (!wolfEncounter.active) {
    cameraEventOffset.x = 0;
    cameraEventOffset.y = 0;
    return;
  }

  player.vel.x = 0;
  player.vel.y = 0;
  player.acc.x = 0;
  player.acc.y = 0;
  player.pos.x = session.x;
  player.pos.y = session.y;
  player.hitbox.x = player.pos.x - player.hitbox.w / 2;
  player.hitbox.y = player.pos.y - player.hitbox.h / 2;

  const wolf = getWolfEncounterEntity();
  if (wolf) {
    syncWolfEncounterEntity(wolf);
    wolfEncounter.targetOffsetY = Math.max(0, WOLF_EVENT_CAMERA_TOP_PADDING - wolf.y);
  }

  if (wolfEncounter.phase === "rise") {
    wolfEncounter.timer += dt;
    const t = clamp(wolfEncounter.timer / WOLF_EVENT_RISE_DURATION, 0, 1);
    cameraEventOffset.y = Math.round(wolfEncounter.targetOffsetY * easeOutCubic(t));
    if (t >= 1) {
      wolfEncounter.phase = "return";
      wolfEncounter.timer = 0;
    }
    return;
  }

  if (wolfEncounter.phase === "return") {
    wolfEncounter.timer += dt;
    const t = clamp(wolfEncounter.timer / WOLF_EVENT_RETURN_DURATION, 0, 1);
    cameraEventOffset.y = Math.round(wolfEncounter.targetOffsetY * (1 - easeOutCubic(t)));
    if (t >= 1) {
      cameraEventOffset.y = 0;
      wolfEncounter.active = false;
      wolfEncounter.phase = "inactive";
      wolfEncounter.timer = 0;
      if (wolf) {
        wolf.hazard = true;
        wolf.solid = true;
        wolf.collectible = "none";
      }
      mergeAll();
    }
  }
}

function syncWolfEncounterEntity(wolf: Entity): void {
  const centerX = player.pos.x - wolf.w * 0.5;
  if (wolfEncounter.active && wolfEncounter.phase === "rise") {
    const riseProgress = clamp(wolfEncounter.timer / WOLF_EVENT_RISE_DURATION, 0, 1);
    const amplitude =
      WOLF_EVENT_SHAKE_MIN_AMPLITUDE +
      (WOLF_EVENT_SHAKE_MAX_AMPLITUDE - WOLF_EVENT_SHAKE_MIN_AMPLITUDE) * riseProgress;
    const wobble = Math.sin(wolfEncounter.timer * Math.PI * 2 * WOLF_EVENT_SHAKE_FREQUENCY) * amplitude;
    wolf.x = centerX + wobble;
  } else {
    wolf.x = centerX;
  }
  wolf.y = -wolf.h - WOLF_EVENT_SPAWN_MARGIN;
}

function isWolfEncounterVisible(entity: Entity): boolean {
  if (!(entity.type === "enemy" && entity.variant === "wolf")) {
    return true;
  }
  if (!(wolfEncounter.active && wolfEncounter.phase === "rise")) {
    return true;
  }
  const t = wolfEncounter.timer * WOLF_EVENT_BLINK_FREQUENCY;
  const phase = t - Math.floor(t);
  return phase < WOLF_EVENT_BLINK_VISIBLE_RATIO;
}

function getWolfEncounterEntity(): Entity | null {
  if (wolfEncounter.enemyId <= 0) {
    return null;
  }
  const wolf = world.enemy.find((entity) => entity.id === wolfEncounter.enemyId && !entity.sleep);
  return wolf ?? null;
}

function clearWolfEncounterEntity(): void {
  const wolf = getWolfEncounterEntity();
  if (!wolf) {
    wolfEncounter.enemyId = 0;
    return;
  }

  wolf.sleep = true;
  world.enemy = world.enemy.filter((entity) => entity.id !== wolf.id);
  if (!world.sleeping.some((entity) => entity.id === wolf.id)) {
    world.sleeping.push(wolf);
  }
  enemyRuntime.delete(wolf.id);
  const fire = fireByEnemyId.get(wolf.id);
  if (fire) {
    fire.sleep = true;
    fireByEnemyId.delete(wolf.id);
  }

  wolfEncounter.enemyId = 0;
}

function resetWolfEncounterState(): void {
  wolfEncounter.triggered = false;
  wolfEncounter.active = false;
  wolfEncounter.phase = "inactive";
  wolfEncounter.timer = 0;
  wolfEncounter.targetOffsetY = 0;
  wolfEncounter.enemyId = 0;
  cameraEventOffset.x = 0;
  cameraEventOffset.y = 0;
}

function getCameraDrawPad(): number {
  const dx = cameraShakeOffset.x + cameraEventOffset.x;
  const dy = cameraShakeOffset.y + cameraEventOffset.y;
  return CAMERA_SHAKE_DRAW_PAD + Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
}

function render(): void {
  ctx.clearRect(0, 0, session.w, session.h);
  const gameplayScene = scene === "playing" || scene === "paused";
  const cameraOffsetX = gameplayScene ? cameraShakeOffset.x + cameraEventOffset.x : 0;
  const cameraOffsetY = gameplayScene ? cameraShakeOffset.y + cameraEventOffset.y : 0;
  const cameraOffsetActive = gameplayScene && (cameraOffsetX !== 0 || cameraOffsetY !== 0);
  if (cameraOffsetActive) {
    ctx.save();
    ctx.translate(cameraOffsetX, cameraOffsetY);
  }

  drawTiledBackground();

  for (const entity of world.all) {
    drawEntity(entity);
  }
  drawFireEntities();

  drawBoostTrailFx();

  if (scene !== "menu") {
    drawPlayerSprite();
  }
  drawExplosionFx();

  drawFxOverlay();
  if (scene !== "menu") {
    drawStratumBrightnessOverlay();
  }
  if (scene !== "menu") {
    drawStratumVignette();
  }
  if (scene === "playing" || scene === "paused") {
    drawStratumBannerText();
  }
  if (cameraOffsetActive) {
    ctx.restore();
  }

  if (toastTimer > 0 && toastText.length > 0) {
    ctx.fillStyle = BLACK;
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(toastText, session.w / 2, 16);
  }
}

function drawTiledBackground(): void {
  if (scene === "menu") {
    drawIntroBackground();
    return;
  }

  const baseCfg = getStratumConfig(activeStratumLevel);
  drawGameplayStratumLayer(baseCfg, 1);

  if (stratumTransition.active) {
    const nextCfg = getStratumConfig(stratumTransition.to);
    const fadeAlpha = clamp(easeOutCubic(stratumTransition.progress), 0, 1);
    drawGameplayStratumLayer(nextCfg, fadeAlpha);
  }
}

function drawGameplayStratumLayer(stratum: StratumConfig, alpha: number): void {
  const prevAlpha = ctx.globalAlpha;
  const prevSmooth = ctx.imageSmoothingEnabled;
  const drawPad = getCameraDrawPad();
  const gradient = ctx.createLinearGradient(0, 0, 0, session.h);
  gradient.addColorStop(0, stratum.colorTop);
  gradient.addColorStop(1, stratum.colorBottom);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(
    -drawPad,
    -drawPad,
    session.w + drawPad * 2,
    session.h + drawPad * 2
  );

  const texture = gameplayTextureImages[stratum.texture];
  if (texture.complete && texture.naturalWidth > 0 && texture.naturalHeight > 0) {
    const tileW = BG_TILE_SIZE;
    const tileH = BG_TILE_SIZE;
    const ox = ((-sys.game.dist.x % tileW) + tileW) % tileW;
    const oy = ((-sys.game.dist.y % tileH) + tileH) % tileH;
    ctx.globalAlpha = alpha * stratum.textureAlpha;
    for (let x = ox - tileW - drawPad; x < session.w + tileW + drawPad; x += tileW) {
      for (let y = oy - tileH - drawPad; y < session.h + tileH + drawPad; y += tileH) {
        ctx.drawImage(texture, Math.floor(x), Math.floor(y), tileW, tileH);
      }
    }
  }

  ctx.globalAlpha = prevAlpha;
  ctx.imageSmoothingEnabled = prevSmooth;
}

function drawIntroBackground(): void {
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, session.w, session.h);

  const total = INTRO_BG_REVEAL_DURATION;
  const firstProgress = clamp(introMenuElapsed / (total * 0.38), 0, 1);
  const secondProgress = clamp((introMenuElapsed - total * 0.28) / (total * 0.34), 0, 1);
  const thirdProgress = clamp((introMenuElapsed - total * 0.58) / (total * 0.42), 0, 1);
  const progress = [firstProgress, secondProgress, thirdProgress];

  const prevAlpha = ctx.globalAlpha;
  for (let i = 0; i < introBackgroundImages.length; i += 1) {
    const image = introBackgroundImages[i];
    const alpha = progress[i] ?? 0;
    if (alpha <= 0) {
      continue;
    }
    drawCoverImage(image, alpha);
  }

  const cloudsAlpha = thirdProgress;
  if (cloudsAlpha > 0 && oreSpriteSheet.complete && oreSpriteSheet.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;
    for (const ore of introOreSprites) {
      const drawW = ore.frame.w * ore.scale;
      const drawH = ore.frame.h * ore.scale;
      const dx = ore.xRatio * session.w - drawW * 0.5;
      const dy = ore.yRatio * session.h - drawH * 0.5;
      ctx.globalAlpha = 0.7 * cloudsAlpha;
      ctx.drawImage(
        oreSpriteSheet,
        ore.frame.x,
        ore.frame.y,
        ore.frame.w,
        ore.frame.h,
        Math.floor(dx),
        Math.floor(dy),
        Math.floor(drawW),
        Math.floor(drawH)
      );
    }
  }

  if (cloudsAlpha > 0) {
    const time = introMenuElapsed;
    for (const cloud of introClouds) {
      const image = cloud.image;
      if (!(image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)) {
        continue;
      }
      const px = cloud.xRatio * session.w + Math.sin(time * cloud.speed + cloud.phase) * cloud.drift;
      const py = cloud.yRatio * session.h + Math.cos(time * cloud.speed * 0.7 + cloud.phase) * (cloud.drift * 0.4);
      const drawW = image.naturalWidth * cloud.scale;
      const drawH = image.naturalHeight * cloud.scale;
      ctx.globalAlpha = 0.7 * cloudsAlpha;
      ctx.drawImage(image, Math.floor(px - drawW * 0.5), Math.floor(py), Math.floor(drawW), Math.floor(drawH));
    }
  }

  ctx.globalAlpha = prevAlpha;
}

function drawCoverImage(image: HTMLImageElement, alpha = 1): void {
  if (!(image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)) {
    return;
  }

  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = session.w / session.h;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) * 0.5;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) * 0.5;
  }

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, session.w, session.h);
  ctx.globalAlpha = prevAlpha;
}

function drawStratumVignette(): void {
  const drawPad = getCameraDrawPad();
  const currentCfg = getStratumConfig(activeStratumLevel);
  let vignetteAlpha = currentCfg.vignetteAlpha;
  if (stratumTransition.active) {
    const nextCfg = getStratumConfig(stratumTransition.to);
    const eased = easeOutCubic(stratumTransition.progress);
    vignetteAlpha = currentCfg.vignetteAlpha * (1 - eased) + nextCfg.vignetteAlpha * eased;
  }
  const scaledVignetteAlpha = Math.min(1, vignetteAlpha * VIGNETTE_INTENSITY_MULTIPLIER);

  const innerRadius = Math.min(session.w, session.h) * 0.2;
  const outerRadius = Math.max(session.w, session.h) * 0.62;
  const gradient = ctx.createRadialGradient(session.x, session.y, innerRadius, session.x, session.y, outerRadius);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.35, "rgba(0,0,0,0)");
  gradient.addColorStop(0.72, `rgba(0,0,0,${scaledVignetteAlpha * 0.55})`);
  gradient.addColorStop(1, `rgba(0,0,0,${scaledVignetteAlpha})`);

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(
    -drawPad,
    -drawPad,
    session.w + drawPad * 2,
    session.h + drawPad * 2
  );
  ctx.globalAlpha = prevAlpha;
}

function getStratumBrightness(level: number): number {
  const clampedLevel = clamp(level, 1, 4);
  return Math.pow(0.8, clampedLevel - 1);
}

function drawStratumBrightnessOverlay(): void {
  let brightness = getStratumBrightness(activeStratumLevel);
  if (stratumTransition.active) {
    const eased = easeOutCubic(stratumTransition.progress);
    const fromBrightness = getStratumBrightness(stratumTransition.from);
    const toBrightness = getStratumBrightness(stratumTransition.to);
    brightness = fromBrightness * (1 - eased) + toBrightness * eased;
  }

  const darkenAlpha = clamp(1 - brightness, 0, 0.95);
  if (darkenAlpha <= 0) {
    return;
  }

  const drawPad = getCameraDrawPad();
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = darkenAlpha;
  ctx.fillStyle = BLACK;
  ctx.fillRect(
    -drawPad,
    -drawPad,
    session.w + drawPad * 2,
    session.h + drawPad * 2
  );
  ctx.globalAlpha = prevAlpha;
}

function drawStratumBannerText(): void {
  if (stratumBanner.timer <= 0) {
    return;
  }

  const remaining = stratumBanner.timer / stratumBanner.duration;
  const elapsed = 1 - remaining;
  const alpha = clamp(Math.min(elapsed / 0.22, remaining / 0.25), 0, 1);
  if (alpha <= 0) {
    return;
  }

  const y = clamp(session.h * 0.24, 94, 200);
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = WHITE;
  ctx.font = `${Math.round(clamp(session.w * 0.03, 26, 44))}px \"BitPotion\", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stratumBanner.text, session.x, y);
  ctx.globalAlpha = prevAlpha;
}

function easeOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
}

function drawEntity(entity: Entity): void {
  if (!isWolfEncounterVisible(entity)) {
    return;
  }

  if (entity.type === "enemy") {
    const spriteSheet = entity.variant === "wolf" ? wolfSpriteSheet : enemySpriteSheet;
    if (spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const frame = getEnemyFrameRect(entity.variant);
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        spriteSheet,
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

function drawExplosionFx(): void {
  if (fx.explosions.length === 0) {
    return;
  }
  if (!(playerSpriteSheet.complete && playerSpriteSheet.naturalWidth > 0)) {
    return;
  }

  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (const explosion of fx.explosions) {
    const frameIndex = Math.floor(explosion.age * EXPLOSION_FRAME_FPS);
    const frame = EXPLOSION_FRAMES[frameIndex] ?? EXPLOSION_FRAMES[EXPLOSION_FRAMES.length - 1];
    if (!frame) {
      continue;
    }
    const drawW = frame.w * explosion.scale;
    const drawH = frame.h * explosion.scale;
    const dx = explosion.x - drawW * 0.5;
    const dy = explosion.y - drawH * 0.5;
    ctx.drawImage(
      playerSpriteSheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(dx),
      Math.floor(dy),
      Math.floor(drawW),
      Math.floor(drawH)
    );
  }
  ctx.imageSmoothingEnabled = prevSmooth;
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




