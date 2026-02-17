import pygame
import sys
import random
import math  # 부드러운 빛 조절을 위해 추가

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger - Smooth Visuals")
clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 24, bold=True)
large_font = pygame.font.SysFont("arial", 48, bold=True)

# 색상 설정
SANDSTONE = (244, 164, 96)
BEDROCK = (105, 105, 105)
SHALE = (47, 79, 79)
OIL_WAVE = (20, 20, 20)
USER_COLOR = (0, 191, 255)
WHITE = (255, 255, 255)
GOLD = (255, 215, 0)
FEVER_GREEN = (0, 255, 120) # 초록빛 Glow 색상

# 게임 변수
player_pos = [WIDTH // 4, 50]
player_path = [list(player_pos)]
player_dir = [0, 0]
speed = 5
score = 0
time_limit = 90
start_ticks = pygame.time.get_ticks()

mask_surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
mask_surface.fill((20, 20, 20, 255))

class OilDroplet:
    def __init__(self):
        self.x = random.randint(30, (WIDTH // 2) - 30)
        self.y = random.randint(int(HEIGHT * 0.7) + 20, HEIGHT - 30)
        self.radius = 7
        self.collected = False

    def draw(self, surface):
        if not self.collected:
            pygame.draw.circle(surface, GOLD, (self.x, self.y), self.radius + 3, 1)
            pygame.draw.circle(surface, (0, 0, 0), (self.x, self.y), self.radius)

oil_list = [OilDroplet() for _ in range(25)]

def draw_layers(surface):
    pygame.draw.rect(surface, SANDSTONE, (0, 0, WIDTH // 2, HEIGHT * 0.3))
    pygame.draw.rect(surface, BEDROCK, (0, HEIGHT * 0.3, WIDTH // 2, HEIGHT * 0.4))
    shale_y = HEIGHT * 0.7
    pygame.draw.rect(surface, SHALE, (0, shale_y, WIDTH // 2, HEIGHT * 0.3))
    for i in range(12):
        y_offset = shale_y + (i * 25)
        pygame.draw.arc(surface, OIL_WAVE, (0, y_offset, WIDTH // 2, 60), 3.14, 0, 2)

def main():
    global player_pos, player_dir, score
    
    running = True
    game_over = False
    glow_tick = 0 # 빛의 주기를 계산하기 위한 변수

    while running:
        seconds_passed = (pygame.time.get_ticks() - start_ticks) // 1000
        time_left = max(0, time_limit - seconds_passed)

        if time_left == 0:
            game_over = True

        screen.fill((0, 0, 0))
        draw_layers(screen)
        
        for oil in oil_list:
            oil.draw(screen)
        
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

        if not game_over and player_dir != [0, 0]:
            player_pos[0] += player_dir[0]
            player_pos[1] += player_dir[1]
            player_pos[0] = max(0, min(player_pos[0], WIDTH // 2 - 5))
            player_pos[1] = max(0, min(player_pos[1], HEIGHT))
            player_path.append(list(player_pos))
            pygame.draw.circle(mask_surface, (0, 0, 0, 0), player_pos, 45)

            # --- 수정된 수집 로직 (난이도 하향) ---
            for oil in oil_list:
                if not oil.collected:
                    dist = ((player_pos[0] - oil.x)**2 + (player_pos[1] - oil.y)**2)**0.5
                    if dist < 30: # 판정 범위를 15에서 30으로 확장
                        oil.collected = True
                        score += 10

        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        
        screen.blit(mask_surface, (0, 0))

        # --- 수정된 Glow 연출 (부드러운 초록빛) ---
        if player_pos[1] > HEIGHT * 0.7 and not game_over:
            glow_tick += 0.05 # 변화 속도 조절
            # sin 함수를 이용해 30~70 사이를 부드럽게 오가는 알파값 생성
            dynamic_alpha = int(50 + 20 * math.sin(glow_tick))
            
            fever_overlay = pygame.Surface((WIDTH // 2, HEIGHT), pygame.SRCALPHA)
            fever_overlay.fill((*FEVER_GREEN, dynamic_alpha))
            screen.blit(fever_overlay, (0, 0))
        
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)

        score_text = font.render(f"Oil: {score}", True, WHITE)
        time_text = font.render(f"Time: {time_left}s", True, WHITE if time_left > 10 else (255, 50, 50))
        screen.blit(score_text, (20, 20))
        screen.blit(time_text, (20, 50))

        if game_over:
            over_text = large_font.render("TIME UP!", True, GOLD)
            screen.blit(over_text, (WIDTH // 4 - 100, HEIGHT // 2))

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()