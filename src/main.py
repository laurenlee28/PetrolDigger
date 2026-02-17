import pygame
import sys

# --- 설정 및 초기화 ---
pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("PetrolDigger")
clock = pygame.time.Clock()

# 색상
BLACK = (20, 20, 20)
WHITE = (255, 255, 255)
USER_COLOR = (0, 191, 255)  # 시원한 하늘색 파이프
AI_COLOR = (255, 69, 0)     # 강렬한 주황색 파이프

# 플레이어 변수
player_pos = [WIDTH // 4, 50]  # 왼쪽 화면 중앙 상단
player_path = [list(player_pos)]
player_dir = [0, 0]
speed = 4

def main():
    global player_pos, player_dir
    
    running = True
    while running:
        screen.fill(BLACK)
        
        # 1. 이벤트 처리
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            # 방향키 조작
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:    player_dir = [0, -speed]
                if event.key == pygame.K_DOWN:  player_dir = [0, speed]
                if event.key == pygame.K_LEFT:  player_dir = [-speed, 0]
                if event.key == pygame.K_RIGHT: player_dir = [speed, 0]

        # 2. 위치 업데이트 (이동 중일 때만 경로 추가)
        if player_dir != [0, 0]:
            player_pos[0] += player_dir[0]
            player_pos[1] += player_dir[1]
            
            # 왼쪽 영역을 벗어나지 않게 제한
            player_pos[0] = max(0, min(player_pos[0], WIDTH // 2 - 5))
            player_pos[1] = max(0, min(player_pos[1], HEIGHT))
            
            # 새로운 좌표를 경로에 추가 (파이프가 연장됨)
            player_path.append(list(player_pos))

        # 3. 그리기
        # 중앙 분리선
        pygame.draw.line(screen, WHITE, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 3)
        
        # 유저 파이프 그리기
        if len(player_path) > 1:
            pygame.draw.lines(screen, USER_COLOR, False, player_path, 6)
        
        # 드릴 헤드 (현재 위치)
        pygame.draw.circle(screen, WHITE, player_pos, 10)
        pygame.draw.circle(screen, USER_COLOR, player_pos, 7)

        # 4. 마무리
        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()