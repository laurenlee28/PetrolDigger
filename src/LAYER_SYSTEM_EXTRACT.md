# 2D 픽셀 레이어 시스템 - 코드 추출

Geosteering Quest에서 사용된 2D 픽셀 기반 지질 레이어 렌더링 시스템입니다.

## 📋 핵심 개념

- **픽셀 단위 그리드**: 모든 레이어가 픽셀 단위로 렌더링됨
- **노이즈 텍스처**: 각 레이어에 자연스러운 픽셀 노이즈 패턴 추가
- **블록 기반 파괴**: 드릴이 지나간 부분은 블록별로 health 관리
- **레이어 경계선**: 지질층 간 시각적 구분

---

## 1️⃣ 레이어 데이터 정의

```typescript
// 지질층 정의 (useMemo로 최적화)
const layers = useMemo(() => [
  { 
    color: "#3f3f46", 
    name: "Overburden", 
    thickness: 80, 
    hardness: 0.1, 
    friction: 0.2, 
    density: "1.2 G/CM³",
    props: { gamma: 120, res: 5, por: 25, perm: 500 } 
  },
  { 
    color: "#1c1917", 
    name: "Cap Rock", 
    thickness: 120, 
    hardness: 0.8, 
    friction: 0.7, 
    density: "2.4 G/CM³",
    props: { gamma: 40, res: 200, por: 2, perm: 0.1 } 
  },
  { 
    color: "#09090b", 
    name: "Impermeable", 
    thickness: 100, 
    hardness: 0.5, 
    friction: 0.4, 
    density: "2.1 G/CM³",
    props: { gamma: 150, res: 10, por: 5, perm: 10 } 
  },
  { 
    color: "#059669", 
    name: "Reservoir (Target)", 
    thickness: 80, 
    target: true,  // 타겟 레이어
    hardness: 0.3, 
    friction: 0.4, 
    density: "1.8 G/CM³",
    props: { gamma: 80, res: 100, por: 18, perm: 1200 } 
  },
  { 
    color: "#78716c", 
    name: "Basement", 
    thickness: 300, 
    hardness: 0.9, 
    friction: 0.8, 
    density: "2.8 G/CM³",
    props: { gamma: 20, res: 1000, por: 0.5, perm: 0.01 } 
  },
], []);
```

---

## 2️⃣ 블록 그리드 초기화

```typescript
// 픽셀 스케일 상수
const PIXEL_SCALE = 4; // 각 블록의 크기 (픽셀)

// 블록 그리드 생성
const blockGridRef = useRef<Map<string, {
  x: number, 
  y: number, 
  color: string, 
  health: number
}>>(new Map());

// 레이어 초기화 (컴포넌트 마운트 시)
useEffect(() => {
  const grid = new Map();
  let yPos = 0;
  
  layers.forEach((layer) => {
    const layerHeight = layer.thickness;
    
    // 각 레이어를 PIXEL_SCALE 단위 블록으로 분할
    for (let y = yPos; y < yPos + layerHeight; y += 1) {
      for (let x = -200; x < 400; x += 1) {
        const key = `${x},${y}`;
        grid.set(key, {
          x,
          y,
          color: layer.color,
          health: 1.0  // 초기 체력 100%
        });
      }
    }
    yPos += layerHeight;
  });
  
  blockGridRef.current = grid;
}, [layers]);
```

---

## 3️⃣ 픽셀 레이어 렌더링 (Canvas)

```typescript
// 메인 렌더링 루프에서 호출
const renderLayers = (
  groundCtx: CanvasRenderingContext2D,
  groundWidth: number,
  groundHeight: number,
  camOffsetX: number,
  camOffsetY: number
) => {
  // === 지질 레이어 배경 그리기 ===
  groundCtx.save();
  groundCtx.translate(camOffsetX, camOffsetY);
  
  let layerY = 0;
  layers.forEach((layer, idx) => {
    const layerHeight = layer.thickness * PIXEL_SCALE;
    
    // 1. 기본 레이어 색상
    groundCtx.fillStyle = layer.color;
    groundCtx.fillRect(-groundWidth, layerY, groundWidth * 3, layerHeight);
    
    // 2. 픽셀 노이즈 텍스처 추가
    for (let y = 0; y < layerHeight; y += PIXEL_SCALE) {
      for (let x = -groundWidth; x < groundWidth * 2; x += PIXEL_SCALE) {
        const noiseVal = Math.sin(x * 0.1 + y * 0.1) * Math.cos(x * 0.07);
        
        if (noiseVal > 0.3) {
          // 어두운 픽셀
          groundCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          groundCtx.fillRect(x, layerY + y, PIXEL_SCALE, PIXEL_SCALE);
        } else if (noiseVal < -0.3) {
          // 밝은 픽셀
          groundCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          groundCtx.fillRect(x, layerY + y, PIXEL_SCALE, PIXEL_SCALE);
        }
      }
    }
    
    // 3. 레이어 경계선
    if (idx > 0) {
      groundCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      groundCtx.lineWidth = 2;
      groundCtx.beginPath();
      groundCtx.moveTo(-groundWidth, layerY);
      groundCtx.lineTo(groundWidth * 2, layerY);
      groundCtx.stroke();
    }
    
    // 4. 타겟 레이어 하이라이트
    if (layer.target) {
      groundCtx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      groundCtx.lineWidth = 4;
      groundCtx.setLineDash([8, 4]);
      groundCtx.strokeRect(-groundWidth, layerY + 2, groundWidth * 3, layerHeight - 4);
      groundCtx.setLineDash([]);
    }
    
    layerY += layerHeight;
  });
  
  groundCtx.restore();
};
```

---

## 4️⃣ 블록 파괴 시스템 (드릴링)

```typescript
// 블록별 렌더링 (파괴된 부분 표시)
const renderBlocks = (
  groundCtx: CanvasRenderingContext2D,
  camOffsetX: number,
  camOffsetY: number,
  groundWidth: number,
  groundHeight: number
) => {
  blockGridRef.current.forEach((block) => {
    const blockX = block.x * PIXEL_SCALE;
    const blockY = block.y * PIXEL_SCALE;
    
    // 화면 밖 블록은 렌더링 스킵 (최적화)
    const screenX = blockX + camOffsetX;
    const screenY = blockY + camOffsetY;
    if (screenX < -PIXEL_SCALE * 2 || screenX > groundWidth + PIXEL_SCALE * 2 ||
        screenY < -PIXEL_SCALE * 2 || screenY > groundHeight + PIXEL_SCALE * 2) {
      return;
    }
    
    // 블록 체력에 따른 투명도
    groundCtx.fillStyle = block.color;
    groundCtx.globalAlpha = block.health;
    groundCtx.fillRect(blockX, blockY, PIXEL_SCALE, PIXEL_SCALE);
    
    // 데미지 크랙 효과
    if (block.health < 1 && block.health > 0) {
      groundCtx.globalAlpha = 1;
      const damageLevel = 1 - block.health;
      
      // 심한 데미지 (70% 이상)
      if (damageLevel > 0.7) {
        groundCtx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        groundCtx.lineWidth = 2;
        
        // X자 크랙
        groundCtx.beginPath();
        groundCtx.moveTo(blockX, blockY);
        groundCtx.lineTo(blockX + PIXEL_SCALE, blockY + PIXEL_SCALE);
        groundCtx.moveTo(blockX + PIXEL_SCALE, blockY);
        groundCtx.lineTo(blockX, blockY + PIXEL_SCALE);
        groundCtx.stroke();
        
        // 랜덤 크랙 추가
        for (let i = 0; i < 3; i++) {
          groundCtx.beginPath();
          groundCtx.moveTo(blockX + Math.random() * PIXEL_SCALE, blockY);
          groundCtx.lineTo(blockX + Math.random() * PIXEL_SCALE, blockY + PIXEL_SCALE);
          groundCtx.stroke();
        }
        
        // 어두운 오버레이
        groundCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        groundCtx.fillRect(blockX, blockY, PIXEL_SCALE, PIXEL_SCALE);
        
      } else if (damageLevel > 0.3) {
        // 중간 데미지
        groundCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        groundCtx.lineWidth = 1;
        
        const crackCount = Math.floor(damageLevel * 6);
        for (let i = 0; i < crackCount; i++) {
          groundCtx.beginPath();
          groundCtx.moveTo(blockX + (i * PIXEL_SCALE / crackCount), blockY);
          groundCtx.lineTo(blockX + (i * PIXEL_SCALE / crackCount) + 2, blockY + PIXEL_SCALE);
          groundCtx.stroke();
        }
      }
    }
    
    // 블록 외곽선 (픽셀 아트 스타일)
    if (block.health > 0.3) {
      groundCtx.globalAlpha = 0.3;
      groundCtx.strokeStyle = '#000';
      groundCtx.lineWidth = 1;
      groundCtx.strokeRect(blockX, blockY, PIXEL_SCALE, PIXEL_SCALE);
    }
    
    groundCtx.globalAlpha = 1;
  });
};
```

---

## 5️⃣ 드릴 충돌 및 블록 파괴

```typescript
// 드릴이 블록과 충돌했을 때
const handleDrillCollision = (drillX: number, drillY: number, drillRadius: number) => {
  const affected: string[] = [];
  
  // 드릴 범위 내 블록 찾기
  for (let dx = -drillRadius; dx <= drillRadius; dx++) {
    for (let dy = -drillRadius; dy <= drillRadius; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= drillRadius) {
        const blockX = Math.floor(drillX + dx);
        const blockY = Math.floor(drillY + dy);
        const key = `${blockX},${blockY}`;
        
        const block = blockGridRef.current.get(key);
        if (block && block.health > 0) {
          // 체력 감소 (중심에 가까울수록 더 많은 데미지)
          const damageMultiplier = 1 - (dist / drillRadius);
          const damage = 0.05 * damageMultiplier; // 프레임당 데미지
          
          block.health = Math.max(0, block.health - damage);
          
          if (block.health <= 0) {
            affected.push(key);
          }
        }
      }
    }
  }
  
  // 완전히 파괴된 블록 제거
  affected.forEach(key => {
    blockGridRef.current.delete(key);
  });
};
```

---

## 6️⃣ 미니맵에서의 레이어 표시

```typescript
// 미니맵 렌더링 (간소화 버전)
const renderMinimap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const scale = 0.5;
  const camY = (-positionRef.current.y * scale) + height / 2;
  const camX = (-positionRef.current.x * scale) + width / 3;

  ctx.save();
  ctx.translate(camX, camY);
  ctx.scale(scale, scale);

  // 레이어 그리기
  let ly = 0;
  layers.forEach(layer => {
    ctx.fillStyle = layer.color;
    ctx.fillRect(-1000, ly, 4000, layer.thickness);
    
    // 타겟 레이어 하이라이트
    if (layer.target) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.strokeRect(-1000, ly, 4000, layer.thickness);
    }
    ly += layer.thickness;
  });

  ctx.restore();
};
```

---

## 🎨 핵심 특징

### ✅ 픽셀 단위 정밀도
- 모든 요소가 `PIXEL_SCALE` 단위로 정렬
- 픽셀 아트 스타일 유지

### ✅ 성능 최적화
- 화면 밖 블록은 렌더링 스킵
- `Map` 자료구조로 빠른 블록 접근
- `useMemo`로 레이어 데이터 캐싱

### ✅ 시각적 피드백
- 노이즈 텍스처로 자연스러운 질감
- 데미지 단계별 크랙 표시
- 타겟 레이어 하이라이트

### ✅ 물리적 특성
- 레이어별 hardness, friction 속성
- 지질학적 센서 데이터 (gamma, resistivity, porosity, permeability)

---

## 🚀 사용 예시

```typescript
// 컴포넌트에서 사용
export function GeologicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 애니메이션 루프
    const animate = () => {
      // 레이어 렌더링
      renderLayers(ctx, canvas.width, canvas.height, camOffsetX, camOffsetY);
      
      // 블록 렌더링
      renderBlocks(ctx, camOffsetX, camOffsetY, canvas.width, canvas.height);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
```

---

## 📝 참고사항

- **imageRendering: 'pixelated'**: CSS 속성으로 픽셀 아트 선명도 유지
- **requestAnimationFrame**: 부드러운 60fps 렌더링
- **Canvas Context 2D**: WebGL 없이 순수 2D 캔버스 사용

이 시스템은 레트로 스타일 게임에 적합하며, 확장 가능한 구조로 다양한 지질 시뮬레이션에 활용 가능합니다! 🎮
