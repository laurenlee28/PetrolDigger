# PetrolDigger

🏗️ PetrolDigger: NPU-Powered Drilling Race
PetrolDigger는 지층 깊숙이 숨겨진 석유를 찾아 AI와 경쟁하는 실시간 시추 액션 게임입니다. 고정된 시추 지점에서 파이프를 늘려가며 어둠 속에 가려진 지층을 탐험하고, 90초 안에 AI보다 더 많은 석유 알갱이를 수집하세요!

🌟 Key Features
Dual-Screen Competition: 왼쪽은 사용자, 오른쪽은 NPU 가속 기반 AI의 화면으로 실시간 대결을 펼칩니다.

Geological Layers: * Sandstone (사암): 시작 지점의 부드러운 황색 지층.

Bedrock (기반암): 단단하고 불규칙한 회색 암석 지층.

Shale (혈암): 우리가 목표로 하는 짙은 회색의 물결무늬 지층. **석유(Oil)**가 매장되어 있습니다.

Fog of War (Masking): 시추 전에는 아무것도 보이지 않습니다. 드릴이 지나간 자리에만 실제 지층의 모습과 석유가 드러납니다.

Fever Time: Shale 지층에 도달하면 화면이 빛나고 경쾌한 음악과 함께 본격적인 채굴이 시작됩니다.

Leaderboard: 최고의 시추 기록을 로컬 데이터로 저장하고 관리합니다.

🛠️ Tech Stack
Language: Python 3.10+

Game Engine: Pygame

AI Engine: NPU-based Inference (ONNX / OpenVINO)

Data: JSON-based Leaderboard system

🚀 Getting Started
Prerequisites
Python이 설치되어 있어야 합니다.

가상환경(venv) 사용을 권장합니다.

Installation
Bash
# Repository 클론
git clone https://github.com/YourID/PetrolDigger.git
cd PetrolDigger

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 필수 라이브러리 설치
pip install pygame
Running the Game
Bash
python src/main.py
🎮 How to Play
방향키 (Arrow Keys): 드릴 헤드의 방향을 조정하여 파이프를 늘립니다.

목표: 90초 이내에 최대한 깊이 내려가 Shale 지층을 찾고, 그 안의 황금빛 석유 알갱이를 최대한 많이 수집하세요.

Tip: 지나갔던 길을 다시 가도 안전하지만, 새로운 구역을 파헤쳐야 더 많은 석유를 찾을 수 있습니다!

📈 Roadmap
[x] 기본 드릴 조작 및 파이프 생성 로직

[ ] 지층별 마스킹 및 리빌 시스템 구현

[ ] Shale 지층 도달 시 피버 타임 연출

[ ] NPU 기반 AI 모델 통합

[ ] 리더보드 시스템 구축

📄 License
이 프로젝트는 MIT License를 따릅니다.
