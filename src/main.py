import pygame
import sys
import random

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger")
clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 24, bold=True)

# 색상 설정
SANDSTONE = (244, 164, 96)
BEDROCK = (105, 105, 105)
SHALE = (47, 79, 79)
OIL_WAVE = (20, 20, 20)
USER_COLOR = (0, 191, 255)
WHITE = (255, 255, 255)
GOLD = (255, 215, 0)

# 플레이어 및 마스크 설정
player_pos = [WIDTH // 4, 50]
player_path = [list(player_pos)]
player_dir = [0, 0]
speed = 5
score = 0

mask_surface = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
mask_surface.fill((20, 20, 20, 255))

# 1. 석유 알갱이 클래스 및 초기화
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

oil_list = [OilDroplet() for _ in range(15)]

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
    while running:
        screen.fill((0, 0, 0))
        draw_layers(screen)
        
        # 석유 알갱이 그리기 (마스크 아래에 그려야 마스크가 걷힐 때 보임)
        for oil in oil_list:
            oil.draw(screen)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:    player_dir = [0, -speed]
                elif event.key == pygame.K_DOWN:  player_dir = [0, speed]
                elif event.key == pygame.K_LEFT:  player_dir = [-speed, 0]
                elif event.key == pygame.K_RIGHT: player_dir = [speed, 0]
            if event.type == pygame.KEYUP:
                if event.key in [pygame.K_UP, pygame.K_DOWN, pygame.K_LEFT, pygame.K_RIGHT]:
                    player_dir = [0, 0]

        # 위치 업데이트 및 충돌 판정
        if player_dir != [0, 0]:
            player_pos[0] += player_dir[0]
            player_pos[1] += player_dir[1]
            player_pos[0] = max(0, min(player_pos[0], WIDTH // 2 - 5))
            player_pos[1] = max(0, min(player_pos[1], HEIGHT))
            player_path.append(list(player_pos))
            pygame.draw.circle(mask_surface, (0, 0, 0, 0), player_pos, 45)

            # 석유 수집 체크
            for oil in oil_list:
                if not oil.collected:
                    dist = ((player_pos[0] - oil.x)**2 + (player_pos[1] - oil.y)**2)**0.5
                    if dist < 15:
                        oil.collected = True
                        score += 10

        # 그리기 루프
        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        
        screen.blit(mask_surface, (0, 0))
        
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)

        # 점수 표시
        score_text = font.render(f"Oil Collected: {score}", True, WHITE)
        screen.blit(score_text, (20, 20))

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()