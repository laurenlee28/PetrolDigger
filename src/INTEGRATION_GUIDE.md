# 🗺️ 실제 맵 데이터 통합 가이드

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [실제 맵 데이터 구조 정의](#실제-맵-데이터-구조-정의)
3. [백엔드 연동 방법](#백엔드-연동-방법)
4. [미니맵 렌더링](#미니맵-렌더링)
5. [게임플레이 화면 반영](#게임플레이-화면-반영)
6. [단계별 구현 로드맵](#단계별-구현-로드맵)

---

## 🔍 현재 구조 분석

### Mock Mode 동작 방식
```typescript
// GameplayScreen.tsx Line 84
const socket = new SimulationWebSocket('mock'); // ← 현재 Mock 모드

// simulationWebSocket.ts
if (this.url === 'mock') {
    // 100ms마다 더미 데이터 생성
    - drillState: 현재 위치 (x, y, depth, theta)
    - labelMap: 3x3 그리드의 랜덤 지층 타입
    - logParams: [Gamma, Resistivity, Density, Neutron] 랜덤 값
}
```

### 현재 지층 데이터 (하드코딩)
```typescript
// GameplayScreen.tsx Line 124-139
const layers = [
  { color: "#3f3f46", name: "Overburden", thickness: 80, ... },
  { color: "#1c1917", name: "Cap Rock", thickness: 120, ... },
  { color: "#09090b", name: "Impermeable", thickness: 100, ... },
  { color: "#059669", name: "Reservoir (Target)", thickness: 80, target: true, ... },
  { color: "#020617", name: "Basement", thickness: 300, ... }
]
```

---

## 🗂️ 실제 맵 데이터 구조 정의

### Step 1: 타입 정의 확장

**`/types.ts`에 추가:**

```typescript
// ========== 실제 지질 맵 데이터 타입 ==========

export interface GeologyLayer {
  id: string;                    // 레이어 고유 ID
  name: string;                  // "Overburden", "Cap Rock", etc.
  color: string;                 // Hex color (e.g., "#3f3f46")
  depthStart: number;            // 시작 깊이 (m)
  depthEnd: number;              // 종료 깊이 (m)
  thickness: number;             // 두께 (m)
  isTarget: boolean;             // Pay Zone 여부
  
  // 물리적 특성
  hardness: number;              // 0.0 ~ 1.0 (드릴 저항)
  friction: number;              // 0.0 ~ 1.0 (마찰 계수)
  density: number;               // g/cm³
  
  // 로깅 파라미터 범위 (실제 센서 값 기준)
  logProperties: {
    gamma: { min: number; max: number };         // API units
    resistivity: { min: number; max: number };   // Ohm-m
    porosity: { min: number; max: number };      // %
    permeability: { min: number; max: number };  // mD
  };
}

export interface RealMapData {
  id: string;                    // "zone-1", "zone-2", etc.
  name: string;                  // "North Sea Formation"
  difficulty: number;            // 1-5
  
  // 지층 정보
  layers: GeologyLayer[];
  
  // 2D Grid Map (실제 지질 모델)
  gridData: {
    width: number;               // 그리드 가로 크기 (블록 수)
    height: number;              // 그리드 세로 크기 (블록 수)
    cellSize: number;            // 각 셀의 실제 크기 (m)
    cells: number[][];           // 2D 배열, 각 값은 layer ID 또는 타입 인덱스
  };
  
  // 최적 경로 (백엔드에서 계산된 참조 경로)
  optimalPath?: { x: number; y: number }[];
  
  // Pay Zone 타겟 정보
  targetZone: {
    layerId: string;
    centerDepth: number;         // 목표 깊이 (m)
    verticalTolerance: number;   // ±허용 범위 (m)
    horizontalRange: {
      start: number;
      end: number;
    };
  };
}

// 백엔드 응답에 실제 지질 정보 추가
export interface BackendSimulationData {
  drillState: DrillState;
  labelMap: LabelMap;            // 3x3 주변 지층 타입 (기존)
  logParams: LogParameters;      // 센서 값 (기존)
  timestamp: number;
  
  // ↓↓↓ 추가 필드 ↓↓↓
  currentLayer?: {               // 현재 위치의 실제 레이어 정보
    id: string;
    name: string;
    properties: {
      gamma: number;
      resistivity: number;
      porosity: number;
      permeability: number;
    };
  };
}
```

---

## 🔌 백엔드 연동 방법

### Step 2: 맵 데이터 로딩 시스템

**새 파일: `/utils/mapDataLoader.ts`**

```typescript
import { RealMapData, GeologyLayer } from '../types';

/**
 * 실제 맵 데이터를 백엔드 API 또는 로컬 JSON에서 로드
 */
export class MapDataLoader {
  private static cache: Map<string, RealMapData> = new Map();

  /**
   * 맵 데이터 가져오기
   * @param mapId - "zone-1", "zone-2" 등
   * @param source - "api" | "local" (개발 중에는 local JSON 사용)
   */
  static async loadMap(
    mapId: string, 
    source: 'api' | 'local' = 'local'
  ): Promise<RealMapData> {
    
    // 캐시 확인
    if (this.cache.has(mapId)) {
      return this.cache.get(mapId)!;
    }

    if (source === 'api') {
      // 실제 백엔드 API 호출
      const response = await fetch(`/api/maps/${mapId}`);
      if (!response.ok) throw new Error(`Map ${mapId} not found`);
      const data = await response.json();
      this.cache.set(mapId, data);
      return data;
    } else {
      // 로컬 JSON 파일 (개발용)
      const data = await import(`../data/maps/${mapId}.json`);
      this.cache.set(mapId, data.default);
      return data.default;
    }
  }

  /**
   * 특정 좌표의 레이어 정보 가져오기
   */
  static getLayerAtPosition(
    mapData: RealMapData, 
    x: number, 
    y: number
  ): GeologyLayer | null {
    const { gridData, layers } = mapData;
    
    // 좌표를 그리드 인덱스로 변환
    const gridX = Math.floor(x / gridData.cellSize);
    const gridY = Math.floor(y / gridData.cellSize);
    
    // 범위 체크
    if (gridX < 0 || gridX >= gridData.width || 
        gridY < 0 || gridY >= gridData.height) {
      return null;
    }
    
    // 그리드에서 레이어 ID 가져오기
    const layerIndex = gridData.cells[gridY][gridX];
    return layers[layerIndex] || null;
  }

  /**
   * 블록 단위로 맵 데이터를 픽셀 그리드로 변환
   * (GameplayScreen의 blockGridRef 초기화용)
   */
  static convertToBlockGrid(
    mapData: RealMapData,
    blockSize: number = 16
  ): Map<string, { x: number; y: number; color: string; health: number; layerId: string }> {
    const blockGrid = new Map();
    const { gridData, layers } = mapData;
    
    for (let gridY = 0; gridY < gridData.height; gridY++) {
      for (let gridX = 0; gridX < gridData.width; gridX++) {
        const layerIndex = gridData.cells[gridY][gridX];
        const layer = layers[layerIndex];
        
        if (!layer) continue;
        
        // 실제 월드 좌표 계산
        const worldX = gridX * gridData.cellSize;
        const worldY = gridY * gridData.cellSize;
        
        // 블록 생성
        const key = `${worldX},${worldY}`;
        blockGrid.set(key, {
          x: worldX,
          y: worldY,
          color: layer.color,
          health: layer.hardness * 100, // 하드니스에 비례한 내구도
          layerId: layer.id
        });
      }
    }
    
    return blockGrid;
  }
}
```

---

### Step 3: 실제 맵 데이터 예시

**새 파일: `/data/maps/zone-1.json`**

```json
{
  "id": "zone-1",
  "name": "North Sea Formation - Easy",
  "difficulty": 1,
  "layers": [
    {
      "id": "layer-0",
      "name": "Overburden",
      "color": "#3f3f46",
      "depthStart": 0,
      "depthEnd": 80,
      "thickness": 80,
      "isTarget": false,
      "hardness": 0.1,
      "friction": 0.2,
      "density": 1.2,
      "logProperties": {
        "gamma": { "min": 100, "max": 140 },
        "resistivity": { "min": 2, "max": 10 },
        "porosity": { "min": 20, "max": 30 },
        "permeability": { "min": 400, "max": 600 }
      }
    },
    {
      "id": "layer-1",
      "name": "Cap Rock",
      "color": "#1c1917",
      "depthStart": 80,
      "depthEnd": 200,
      "thickness": 120,
      "isTarget": false,
      "hardness": 0.8,
      "friction": 0.7,
      "density": 2.4,
      "logProperties": {
        "gamma": { "min": 30, "max": 50 },
        "resistivity": { "min": 150, "max": 250 },
        "porosity": { "min": 1, "max": 3 },
        "permeability": { "min": 0.05, "max": 0.2 }
      }
    },
    {
      "id": "layer-2",
      "name": "Impermeable",
      "color": "#09090b",
      "depthStart": 200,
      "depthEnd": 300,
      "thickness": 100,
      "isTarget": false,
      "hardness": 0.5,
      "friction": 0.4,
      "density": 2.1,
      "logProperties": {
        "gamma": { "min": 130, "max": 170 },
        "resistivity": { "min": 5, "max": 15 },
        "porosity": { "min": 3, "max": 7 },
        "permeability": { "min": 5, "max": 15 }
      }
    },
    {
      "id": "layer-3",
      "name": "Reservoir (Target)",
      "color": "#059669",
      "depthStart": 300,
      "depthEnd": 380,
      "thickness": 80,
      "isTarget": true,
      "hardness": 0.3,
      "friction": 0.4,
      "density": 1.8,
      "logProperties": {
        "gamma": { "min": 20, "max": 40 },
        "resistivity": { "min": 1800, "max": 2200 },
        "porosity": { "min": 30, "max": 40 },
        "permeability": { "min": 2000, "max": 3000 }
      }
    },
    {
      "id": "layer-4",
      "name": "Basement",
      "color": "#020617",
      "depthStart": 380,
      "depthEnd": 680,
      "thickness": 300,
      "isTarget": false,
      "hardness": 0.95,
      "friction": 0.9,
      "density": 3.2,
      "logProperties": {
        "gamma": { "min": 70, "max": 90 },
        "resistivity": { "min": 400, "max": 600 },
        "porosity": { "min": 0.5, "max": 1.5 },
        "permeability": { "min": 0.005, "max": 0.02 }
      }
    }
  ],
  "gridData": {
    "width": 200,
    "height": 136,
    "cellSize": 5,
    "cells": "[[0,0,0,...], [1,1,1,...], ...]"
  },
  "targetZone": {
    "layerId": "layer-3",
    "centerDepth": 340,
    "verticalTolerance": 40,
    "horizontalRange": {
      "start": 0,
      "end": 1000
    }
  },
  "optimalPath": [
    { "x": 0, "y": 0 },
    { "x": 50, "y": 100 },
    { "x": 100, "y": 200 },
    { "x": 200, "y": 340 },
    { "x": 400, "y": 340 }
  ]
}
```

**참고:** `gridData.cells`는 실제로는 거대한 2D 배열입니다. 예시:
```json
"cells": [
  [0, 0, 0, 0, 0, ...],  // 첫 번째 행 (y=0): 모두 layer 0 (Overburden)
  [0, 0, 0, 0, 0, ...],
  [1, 1, 1, 1, 1, ...],  // layer 1 (Cap Rock) 시작
  ...
]
```

---

## 🗺️ 미니맵 렌더링

### Step 4: 미니맵에 실제 맵 데이터 반영

**`/components/GameplayScreen.tsx` 수정:**

```typescript
// 미니맵 렌더링 부분 (기존 코드 수정)

// 1. 실제 맵 데이터 로드
import { MapDataLoader } from '../utils/mapDataLoader';
import { RealMapData } from '../types';

const [realMapData, setRealMapData] = useState<RealMapData | null>(null);

useEffect(() => {
  // 맵 선택 시 실제 데이터 로드
  MapDataLoader.loadMap(map.id, 'local').then(data => {
    setRealMapData(data);
  });
}, [map.id]);

// 2. 미니맵 캔버스 렌더링 함수
const renderMinimap = (ctx: CanvasRenderingContext2D) => {
  if (!realMapData) return;
  
  const minimapWidth = 180;
  const minimapHeight = 160;
  
  // 실제 지층 렌더링
  realMapData.layers.forEach(layer => {
    ctx.fillStyle = layer.color;
    
    // 깊이를 미니맵 스케일로 변환
    const scaleY = minimapHeight / realMapData.layers[realMapData.layers.length - 1].depthEnd;
    const y = layer.depthStart * scaleY;
    const height = layer.thickness * scaleY;
    
    ctx.fillRect(0, y, minimapWidth, height);
    
    // 타겟 존 강조
    if (layer.isTarget) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, y, minimapWidth, height);
    }
  });
  
  // 현재 드릴 위치 표시
  const drillY = positionRef.current.y * scaleY;
  const drillX = (positionRef.current.x / 1000) * minimapWidth; // 가로 스케일 조정
  
  ctx.fillStyle = COLORS.human;
  ctx.beginPath();
  ctx.arc(drillX, drillY, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // AI 위치 표시
  const aiY = aiPositionRef.current.y * scaleY;
  const aiX = (aiPositionRef.current.x / 1000) * minimapWidth;
  
  ctx.fillStyle = COLORS.ai;
  ctx.beginPath();
  ctx.arc(aiX, aiY, 4, 0, Math.PI * 2);
  ctx.fill();
};
```

---

## 🎮 게임플레이 화면 반영

### Step 5: 픽셀 블록 그리드를 실제 맵 데이터로 초기화

**`/components/GameplayScreen.tsx` 수정:**

```typescript
// 블록 초기화 부분 (기존 코드 대체)

const initializeBlocks = () => {
  if (!realMapData) {
    // 맵 데이터 없으면 기존 방식 사용
    return initializeBlocksFallback();
  }
  
  // 실제 맵 데이터로 블록 그리드 생성
  blockGridRef.current = MapDataLoader.convertToBlockGrid(realMapData, BLOCK_SIZE);
  
  console.log(`✅ Initialized ${blockGridRef.current.size} blocks from real map data`);
};

// 동적 블록 생성 (드릴이 이동할 때 주변 블록만 추가)
const ensureBlocksAroundDrill = (drillX: number, drillY: number) => {
  if (!realMapData) return;
  
  const range = 150; // 드릴 주변 150m 범위만 블록 생성
  
  for (let worldY = drillY - range; worldY < drillY + range; worldY += BLOCK_SIZE / 5) {
    for (let worldX = drillX - range; worldX < drillX + range; worldX += BLOCK_SIZE / 5) {
      const key = `${worldX.toFixed(0)},${worldY.toFixed(0)}`;
      
      if (!blockGridRef.current.has(key)) {
        // 이 위치의 실제 레이어 정보 가져오기
        const layer = MapDataLoader.getLayerAtPosition(realMapData, worldX, worldY);
        
        if (layer) {
          blockGridRef.current.set(key, {
            x: worldX,
            y: worldY,
            color: layer.color,
            health: layer.hardness * 100,
            layerId: layer.id
          });
        }
      }
    }
  }
};

// 게임 루프에서 호출
const gameLoop = () => {
  // ...
  
  // 드릴 주변 블록 보장
  ensureBlocksAroundDrill(positionRef.current.x, positionRef.current.y);
  
  // ...
};
```

---

### Step 6: 센서 데이터를 실제 레이어 속성으로 매핑

```typescript
// 현재 레이어의 실제 로깅 값 계산
const updateSensorData = () => {
  if (!realMapData) return;
  
  const currentLayer = MapDataLoader.getLayerAtPosition(
    realMapData, 
    positionRef.current.x, 
    positionRef.current.y
  );
  
  if (currentLayer) {
    // 레이어의 로깅 속성 범위에서 랜덤 값 생성 (실제처럼 보이게)
    const { logProperties } = currentLayer;
    
    setSensorData({
      gamma: randomInRange(logProperties.gamma.min, logProperties.gamma.max),
      resistivity: randomInRange(logProperties.resistivity.min, logProperties.resistivity.max),
      porosity: randomInRange(logProperties.porosity.min, logProperties.porosity.max),
      perm: randomInRange(logProperties.permeability.min, logProperties.permeability.max)
    });
    
    setCurrentLayerName(currentLayer.name);
  }
};

// 헬퍼 함수
const randomInRange = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};
```

---

## 🔄 백엔드 WebSocket 실제 연동

### Step 7: Mock → Real 전환

**`/components/GameplayScreen.tsx` 수정:**

```typescript
useEffect(() => {
  // 환경 변수로 모드 전환
  const USE_REAL_BACKEND = process.env.REACT_APP_USE_REAL_BACKEND === 'true';
  const BACKEND_URL = process.env.REACT_APP_BACKEND_WS_URL || 'ws://localhost:8080';
  
  const socket = new SimulationWebSocket(
    USE_REAL_BACKEND ? BACKEND_URL : 'mock'
  );
  
  socketRef.current = socket;
  
  socket.connect((data) => {
    setBeData(data);
    
    // 실제 백엔드가 currentLayer 정보를 제공하면 사용
    if (data.currentLayer) {
      setSensorData({
        gamma: data.currentLayer.properties.gamma,
        resistivity: data.currentLayer.properties.resistivity,
        porosity: data.currentLayer.properties.porosity,
        perm: data.currentLayer.properties.permeability
      });
      setCurrentLayerName(data.currentLayer.name);
    }
  });
  
  return () => socket.close();
}, []);
```

**`.env` 파일 설정:**
```bash
# Mock 모드 (개발)
REACT_APP_USE_REAL_BACKEND=false

# 실제 백엔드 (프로덕션)
# REACT_APP_USE_REAL_BACKEND=true
# REACT_APP_BACKEND_WS_URL=ws://your-backend-server.com:8080
```

---

## 📊 단계별 구현 로드맵

### Phase 1: 데이터 구조 준비 ✅
- [ ] `/types.ts`에 `RealMapData`, `GeologyLayer` 타입 추가
- [ ] `/utils/mapDataLoader.ts` 생성
- [ ] `/data/maps/zone-1.json` 예시 파일 생성

### Phase 2: 미니맵 연동 🗺️
- [ ] `GameplayScreen`에 `realMapData` 상태 추가
- [ ] 맵 로딩 로직 구현
- [ ] 미니맵 렌더링 함수 수정
- [ ] 레이어별 색상 반영 확인

### Phase 3: 게임플레이 화면 연동 🎮
- [ ] `initializeBlocks()` 함수를 실제 맵 데이터 기반으로 변경
- [ ] `ensureBlocksAroundDrill()` 동적 블록 생성 구현
- [ ] 레이어 감지 로직 수정
- [ ] 센서 데이터 매핑 구현

### Phase 4: 백엔드 통합 🔌
- [ ] 환경 변수 설정 (`.env`)
- [ ] WebSocket Mock → Real 전환 로직
- [ ] 백엔드 API 맵 데이터 엔드포인트 연결
- [ ] 실시간 센서 데이터 동기화 테스트

### Phase 5: 최적화 ⚡
- [ ] 블록 렌더링 최적화 (Viewport Culling)
- [ ] 맵 데이터 캐싱
- [ ] 청크 단위 로딩 (필요시)

---

## 🧪 테스트 체크리스트

### 로컬 테스트 (Mock + JSON)
```bash
✅ 1. zone-1.json 파일이 올바르게 로드되는가?
✅ 2. 미니맵에 5개 레이어가 정확히 표시되는가?
✅ 3. 드릴이 레이어를 지날 때 색상이 변경되는가?
✅ 4. 센서 값이 레이어별로 다르게 나타나는가?
✅ 5. Pay Zone에 진입하면 타겟 판정이 되는가?
```

### 실제 백엔드 테스트
```bash
✅ 1. WebSocket 연결이 성공하는가?
✅ 2. 드릴 상태(x, y, theta)가 전송되는가?
✅ 3. 백엔드에서 labelMap이 정확히 반환되는가?
✅ 4. 로깅 파라미터가 실시간으로 업데이트되는가?
✅ 5. 최적 경로(optimalPath)가 결과 화면에 표시되는가?
```

---

## 💡 핵심 포인트

### 🎯 현재 → 실제 전환 흐름
```
현재 (Mock):
  하드코딩된 layers 배열 → 랜덤 센서 값 → 더미 최적 경로

실제 (Real):
  JSON/API 맵 데이터 → 레이어별 실제 센서 범위 → 백엔드 계산 최적 경로
```

### 🔑 핵심 변경점
1. **맵 데이터 소스**: 하드코딩 → JSON/API
2. **블록 그리드**: 알고리즘 생성 → 실제 gridData 기반
3. **센서 값**: 랜덤 → 레이어 logProperties 기반
4. **WebSocket**: Mock 100ms 인터벌 → 실제 백엔드 통신

### 🚀 점진적 마이그레이션 전략
```typescript
// 1단계: Mock + JSON (백엔드 없이 테스트)
const mapData = await MapDataLoader.loadMap('zone-1', 'local');

// 2단계: Mock WebSocket + Real Map Data
const socket = new SimulationWebSocket('mock');

// 3단계: Real WebSocket + Real Map Data
const socket = new SimulationWebSocket(BACKEND_URL);
```

---

## 📞 질문 & 트러블슈팅

### Q1. gridData.cells가 너무 큰 경우?
**A:** 청크 단위로 분할하거나 압축 형식(RLE) 사용:
```json
"cells": {
  "format": "rle",
  "data": "0x80,1x120,2x100,3x80,4x300"
}
```

### Q2. 미니맵이 너무 복잡하게 보이는 경우?
**A:** 레이어 단순화 버전 제공:
```typescript
const simplifiedLayers = realMapData.layers.map(layer => ({
  ...layer,
  // gridData 대신 단순 두께 기반 렌더링
}));
```

### Q3. 블록 생성 성능 이슈?
**A:** 뷰포트 기반 동적 로딩:
```typescript
const visibleRange = {
  x: [cameraX - viewportWidth/2, cameraX + viewportWidth/2],
  y: [cameraY - viewportHeight/2, cameraY + viewportHeight/2]
};
// 이 범위 내 블록만 생성/렌더링
```

---

## 🎓 다음 단계

이 가이드를 따라 구현하면:
- ✅ Mock 데이터 → 실제 지질 맵 전환
- ✅ 로컬 JSON 테스트 환경 구축
- ✅ 백엔드 연동 준비 완료
- ✅ 확장 가능한 맵 시스템

**시작은 `/data/maps/zone-1.json` 생성부터!** 🚀
