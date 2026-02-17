# src/ai_module.py
import math
import random
import os

# NPU 라이브러리 임포트 (현재는 안정성을 위해 로딩 안 함)
try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False

class DrillingAI:
    def __init__(self, width, height, speed):
        self.width = width
        self.height = height
        self.speed = speed
        # AI 시작 위치 (오른쪽 화면 중앙)
        self.pos = [width * 0.75, 50]
        self.path = [list(self.pos)]
        self.score = 0
        
        # 모델 로딩 강제 스킵 (로딩/프리징 문제 해결)
        self.session = None 

    def _load_model(self):
        # 현재 환경(NPU 없음)을 고려하여 무조건 None 리턴
        return None

    def decide_direction(self, ai_oil_list):
        # 1. 모델이 있다면 추론 (현재는 스킵됨)
        if self.session:
            pass
            
        # 2. 규칙 기반 로직 (가장 가까운 석유 찾기)
        target = None
        min_dist = float('inf')
        
        for oil in ai_oil_list:
            if not oil.collected:
                dist = math.sqrt((self.pos[0] - oil.x)**2 + (self.pos[1] - oil.y)**2)
                if dist < min_dist:
                    min_dist = dist
                    target = oil
        
        if target:
            dx = target.x - self.pos[0]
            dy = target.y - self.pos[1]
            
            # X, Y 중 더 멀리 떨어진 축으로 우선 이동
            if abs(dx) > abs(dy):
                return [self.speed if dx > 0 else -self.speed, 0]
            else:
                return [0, self.speed if dy > 0 else -self.speed]
        
        # 타겟 없으면 아래로 직진
        return [0, self.speed]

    def update_position(self, direction):
        # 1. 일단 이동
        self.pos[0] += direction[0]
        self.pos[1] += direction[1]
        
        # 2. 경계값 설정 (오른쪽 화면 범위 내로 제한)
        # 오른쪽 화면은 width // 2 부터 width 까지임
        min_x = (self.width // 2) + 10
        max_x = self.width - 10
        min_y = 0
        max_y = self.height - 10
        
        # 3. 좌표 강제 고정 (Clamping) - 무한 루프 방지
        if self.pos[0] < min_x: self.pos[0] = min_x
        if self.pos[0] > max_x: self.pos[0] = max_x
        if self.pos[1] < min_y: self.pos[1] = min_y
        if self.pos[1] > max_y: self.pos[1] = max_y
        
        # 4. 경로 기록
        self.path.append(list(self.pos))