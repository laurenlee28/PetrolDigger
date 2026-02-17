import pygame
import sys

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger")
clock = pygame.time.Clock()

# 색상 및 지층 설정
SANDSTONE = (244, 164, 96)
BEDROCK = (105, 105, 105)
SHALE = (47, 79, 79)
OIL_WAVE = (20, 20, 20)
USER_COLOR = (0, 191, 255)
WHITE = (255, 255, 255)

# 플레이어 변수
player_pos = [WIDTH // 4, 50]
player_path = [list(player_pos)]
player_dir = [0, 0]
speed = 5

def draw_layers(surface):
    # 왼쪽 (사용자 영역) 배경 그리기
    # Sandstone
    pygame.draw.rect(surface, SANDSTONE, (0, 0, WIDTH // 2, HEIGHT * 0.3))
    # Bedrock
    pygame.draw.rect(surface, BEDROCK, (0, HEIGHT * 0.3, WIDTH // 2, HEIGHT * 0.4))
    # Shale
    shale_y = HEIGHT * 0.7
    pygame.draw.rect(surface, SHALE, (0, shale_y, WIDTH // 2, HEIGHT * 0.3))
    
    # Shale 물결무늬
    for i in range(12):
        y_offset = shale_y + (i * 25)
        pygame.draw.arc(surface, OIL_WAVE, (0, y_offset, WIDTH // 2, 60), 3.14, 0, 2)

def main():
    global player_pos, player_dir
    
    running = True
    while running:
        # 배경 그리기 (Step 2 적용)
        screen.fill((0, 0, 0))
        draw_layers(screen)
        
        # 1. 이벤트 처리
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

        # 2. 위치 업데이트
        if player_dir != [0, 0]:
            player_pos[0] += player_dir[0]
            player_pos[1] += player_dir[1]
            
            # 경계 제한
            player_pos[0] = max(0, min(player_pos[0], WIDTH // 2 - 5))
            player_pos[1] = max(0, min(player_pos[1], HEIGHT))
            
            player_path.append(list(player_pos))

        # 3. 그리기
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()