import pygame
import sys
import random

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger - Status Light System")
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
BLACK = (0, 0, 0)

# 신호등 색상
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)
GRAY = (50, 50, 50) # 꺼진 불 색상

# 게임 변수
player_pos = [WIDTH // 4, 50]
player_path = [list(player_pos)]
player_dir = [0, 0]
speed = 5
score = 0
time_limit = 90
start_ticks = pygame.time.get_ticks()

mask_surface = pygame.Surface((WIDTH // 2, HEIGHT), pygame.SRCALPHA)
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
            pygame.draw.circle(surface, BLACK, (self.x, self.y), self.radius)

oil_list = [OilDroplet() for _ in range(25)]

def draw_layers(surface):
    pygame.draw.rect(surface, SANDSTONE, (0, 0, WIDTH // 2, HEIGHT * 0.3))
    pygame.draw.rect(surface, BEDROCK, (0, HEIGHT * 0.3, WIDTH // 2, HEIGHT * 0.4))
    shale_y = HEIGHT * 0.7
    pygame.draw.rect(surface, SHALE, (0, shale_y, WIDTH // 2, HEIGHT * 0.3))
    for i in range(12):
        y_offset = shale_y + (i * 25)
        pygame.draw.arc(surface, OIL_WAVE, (0, y_offset, WIDTH // 2, 60), 3.14, 0, 2)

def draw_status_light(surface, y_pos):
    # 신호등 몸체
    pygame.draw.rect(surface, (30, 30, 30), (20, 100, 40, 110), border_radius=10)
    
    # 지층 깊이에 따른 불 켜기
    r_color = RED if y_pos <= HEIGHT * 0.3 else GRAY
    y_color = YELLOW if HEIGHT * 0.3 < y_pos <= HEIGHT * 0.7 else GRAY
    g_color = GREEN if y_pos > HEIGHT * 0.7 else GRAY
    
    # 전등 그리기
    pygame.draw.circle(surface, r_color, (40, 125), 12)
    pygame.draw.circle(surface, y_color, (40, 155), 12)
    pygame.draw.circle(surface, g_color, (40, 185), 12)

def main():
    global player_pos, player_dir, score
    
    running = True
    game_over = False

    while running:
        seconds_passed = (pygame.time.get_ticks() - start_ticks) // 1000
        time_left = max(0, time_limit - seconds_passed)
        if time_left == 0: game_over = True

        screen.fill(BLACK)
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

            for oil in oil_list:
                if not oil.collected:
                    dist = ((player_pos[0] - oil.x)**2 + (player_pos[1] - oil.y)**2)**0.5
                    if dist < 30: 
                        oil.collected = True
                        score += 10

        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        
        screen.blit(mask_surface, (0, 0))

        # 중앙선 및 헤드
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)

        # UI 표시 (점수, 시간, 신호등)
        score_text = font.render(f"Oil: {score}", True, WHITE)
        time_text = font.render(f"Time: {time_left}s", True, WHITE if time_left > 10 else RED)
        screen.blit(score_text, (20, 20))
        screen.blit(time_text, (20, 50))
        
        # 신호등 그리기
        draw_status_light(screen, player_pos[1])

        if game_over:
            over_text = large_font.render("TIME UP!", True, GOLD)
            screen.blit(over_text, (WIDTH // 4 - 100, HEIGHT // 2))

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()