# src/main.py
import pygame
import sys
import random
import math # 거리 계산용
from ai_module import DrillingAI

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger - Human vs AI")
clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 24, bold=True)
large_font = pygame.font.SysFont("arial", 48, bold=True)

# 색상 설정
SANDSTONE = (244, 164, 96)
BEDROCK = (105, 105, 105)
SHALE = (47, 79, 79)
OIL_WAVE = (20, 20, 20)
USER_COLOR = (0, 191, 255)
AI_COLOR = (255, 69, 0) # AI 파이프 색상 (주황색)
WHITE = (255, 255, 255)
GOLD = (255, 215, 0)
BLACK = (0, 0, 0)

# 신호등 색상
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)
GRAY = (50, 50, 50)

# 공통 변수
speed = 5
time_limit = 90

class OilDroplet:
    def __init__(self, offset_x=0):
        # offset_x를 받아서 왼쪽/오른쪽 화면에 생성
        self.x = random.randint(30 + offset_x, (WIDTH // 2) - 30 + offset_x)
        self.y = random.randint(int(HEIGHT * 0.7) + 20, HEIGHT - 30)
        self.radius = 7
        self.collected = False

    def draw(self, surface):
        if not self.collected:
            pygame.draw.circle(surface, GOLD, (self.x, self.y), self.radius + 3, 1)
            pygame.draw.circle(surface, BLACK, (self.x, self.y), self.radius)

def draw_layers(surface, offset_x=0):
    pygame.draw.rect(surface, SANDSTONE, (offset_x, 0, WIDTH // 2, HEIGHT * 0.3))
    pygame.draw.rect(surface, BEDROCK, (offset_x, HEIGHT * 0.3, WIDTH // 2, HEIGHT * 0.4))
    shale_y = HEIGHT * 0.7
    pygame.draw.rect(surface, SHALE, (offset_x, shale_y, WIDTH // 2, HEIGHT * 0.3))
    
    for i in range(12):
        y_offset = shale_y + (i * 25)
        pygame.draw.arc(surface, OIL_WAVE, (offset_x, y_offset, WIDTH // 2, 60), 3.14, 0, 2)

def draw_status_light(surface, y_pos):
    pygame.draw.rect(surface, (30, 30, 30), (20, 100, 40, 110), border_radius=10)
    r_color = RED if y_pos <= HEIGHT * 0.3 else GRAY
    y_color = YELLOW if HEIGHT * 0.3 < y_pos <= HEIGHT * 0.7 else GRAY
    g_color = GREEN if y_pos > HEIGHT * 0.7 else GRAY
    pygame.draw.circle(surface, r_color, (40, 125), 12)
    pygame.draw.circle(surface, y_color, (40, 155), 12)
    pygame.draw.circle(surface, g_color, (40, 185), 12)

def main():
    # 1. 게임 시작 전 모든 변수 초기화 (여기가 중요!)
    running = True
    game_over = False
    start_ticks = pygame.time.get_ticks()

    # [유저 설정]
    player_pos = [WIDTH // 4, 50]
    player_path = [list(player_pos)]
    player_dir = [0, 0]
    score = 0
    mask_surface = pygame.Surface((WIDTH // 2, HEIGHT), pygame.SRCALPHA)
    mask_surface.fill((20, 20, 20, 255))
    oil_list = [OilDroplet(offset_x=0) for _ in range(25)]

    # [AI 설정] - 루프 시작 전에 미리 만들어야 함
    ai_player = DrillingAI(WIDTH, HEIGHT, speed)
    ai_score = 0
    ai_mask_surface = pygame.Surface((WIDTH // 2, HEIGHT), pygame.SRCALPHA)
    ai_mask_surface.fill((20, 20, 20, 255))
    ai_oil_list = [OilDroplet(offset_x=WIDTH//2) for _ in range(25)] # 오른쪽 생성

    # --- 메인 루프 (하나만 존재해야 함) ---
    while running:
        # 프리징 방지
        pygame.event.pump()
        
        # 시간 계산
        seconds_passed = (pygame.time.get_ticks() - start_ticks) // 1000
        time_left = max(0, time_limit - seconds_passed)
        if time_left == 0: game_over = True

        # --- 1. 이벤트 처리 (유저 입력) ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if not game_over:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_UP:    player_dir = [0, -speed]
                    elif event.key == pygame.K_DOWN:  player_dir = [0, speed]
                    elif event.key == pygame.K_LEFT:  player_dir = [-speed, 0]
                    elif event.key == pygame.K_RIGHT: player_dir = [speed, 0]
                if event.type == pygame.KEYUP:
                    if event.key in [pygame.K_UP, pygame.K_DOWN, pygame.K_LEFT, pygame.K_RIGHT]:
                        player_dir = [0, 0]

        # --- 2. 로직 업데이트 (유저 & AI) ---
        if not game_over:
            # [유저 이동]
            if player_dir != [0, 0]:
                player_pos[0] += player_dir[0]
                player_pos[1] += player_dir[1]
                # 유저 경계 제한 (왼쪽 화면)
                player_pos[0] = max(0, min(player_pos[0], WIDTH // 2 - 5))
                player_pos[1] = max(0, min(player_pos[1], HEIGHT))
                player_path.append(list(player_pos))
                # 유저 마스크 지우기
                pygame.draw.circle(mask_surface, (0, 0, 0, 0), player_pos, 45)
                # 유저 석유 수집
                for oil in oil_list:
                    if not oil.collected:
                        dist = ((player_pos[0] - oil.x)**2 + (player_pos[1] - oil.y)**2)**0.5
                        if dist < 30: 
                            oil.collected = True
                            score += 10

            # [AI 이동]
            ai_dir = ai_player.decide_direction(ai_oil_list)
            ai_player.update_position(ai_dir)
            # AI 마스크 지우기 (AI 위치에서 WIDTH//2 만큼 빼야 마스크 서피스 좌표와 맞음)
            pygame.draw.circle(ai_mask_surface, (0, 0, 0, 0), 
                             (ai_player.pos[0] - WIDTH // 2, ai_player.pos[1]), 45)
            # AI 석유 수집
            for oil in ai_oil_list:
                if not oil.collected:
                    dist = ((ai_player.pos[0] - oil.x)**2 + (ai_player.pos[1] - oil.y)**2)**0.5
                    if dist < 30:
                        oil.collected = True
                        ai_score += 10

        # --- 3. 화면 그리기 ---
        screen.fill(BLACK)
        
        # 배경 (좌/우)
        draw_layers(screen, 0)
        draw_layers(screen, WIDTH // 2)

        # 석유 알갱이들
        for oil in oil_list: oil.draw(screen)
        for oil in ai_oil_list: oil.draw(screen)

        # 경로 그리기
        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        if len(ai_player.path) > 1:
            pygame.draw.lines(screen, AI_COLOR, False, ai_player.path, 6)

        # 마스크 덮기
        screen.blit(mask_surface, (0, 0))          # 왼쪽 마스크
        screen.blit(ai_mask_surface, (WIDTH // 2, 0)) # 오른쪽 마스크

        # UI 요소들 (중앙선, 헤드)
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        
        # 유저 헤드
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)
        # AI 헤드
        pygame.draw.circle(screen, WHITE, (int(ai_player.pos[0]), int(ai_player.pos[1])), 10)
        pygame.draw.circle(screen, AI_COLOR, (int(ai_player.pos[0]), int(ai_player.pos[1])), 7)

        # 텍스트 UI
        score_text = font.render(f"P1: {score}", True, WHITE)
        ai_score_text = font.render(f"AI: {ai_score}", True, AI_COLOR)
        time_text = font.render(f"Time: {time_left}", True, WHITE if time_left > 10 else RED)
        
        screen.blit(score_text, (20, 20))
        screen.blit(ai_score_text, (WIDTH - 150, 20)) # AI 점수는 오른쪽 상단
        screen.blit(time_text, (WIDTH // 2 - 40, 20)) # 시간은 중앙

        draw_status_light(screen, player_pos[1])

        if game_over:
            result_msg = "DRAW"
            if score > ai_score: result_msg = "YOU WIN!"
            elif score < ai_score: result_msg = "AI WINS!"
            
            over_text = large_font.render("TIME UP!", True, GOLD)
            result_text = large_font.render(result_msg, True, WHITE)
            
            screen.blit(over_text, (WIDTH // 2 - 100, HEIGHT // 2 - 50))
            screen.blit(result_text, (WIDTH // 2 - 100, HEIGHT // 2 + 10))

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()