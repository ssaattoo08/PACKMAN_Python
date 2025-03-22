import pygame
import random
import math
import sys

# 初期化
pygame.init()

# 画面設定
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("パックマンゲーム")

# 色の定義
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
BLUE = (0, 0, 255)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
PINK = (255, 192, 203)

# パックマンの設定
class Pacman:
    def __init__(self):
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT // 2
        self.radius = 20
        self.speed = 5
        self.direction = 0  # 0: 右, 1: 下, 2: 左, 3: 上
        self.mouth_angle = 45
        self.mouth_direction = 1
        self.score = 0

    def move(self, keys):
        if keys[pygame.K_LEFT]:
            self.x = max(self.radius, self.x - self.speed)
            self.direction = 2
        if keys[pygame.K_RIGHT]:
            self.x = min(SCREEN_WIDTH - self.radius, self.x + self.speed)
            self.direction = 0
        if keys[pygame.K_UP]:
            self.y = max(self.radius, self.y - self.speed)
            self.direction = 3
        if keys[pygame.K_DOWN]:
            self.y = min(SCREEN_HEIGHT - self.radius, self.y + self.speed)
            self.direction = 1

        # 口の開閉アニメーション
        self.mouth_angle += self.mouth_direction * 3
        if self.mouth_angle >= 45:
            self.mouth_direction = -1
        elif self.mouth_angle <= 0:
            self.mouth_direction = 1

    def draw(self, screen):
        # パックマンの体（円）を描画
        pygame.draw.circle(screen, YELLOW, (self.x, self.y), self.radius)

        # 口を描画（扇形を黒で描画）
        start_angle = self.direction * 90 + self.mouth_angle
        end_angle = self.direction * 90 + 360 - self.mouth_angle

        # 口の部分を黒で描画
        points = [(self.x, self.y)]
        for angle in range(start_angle, end_angle):
            points.append(
                (self.x + self.radius * math.cos(math.radians(angle)),
                 self.y + self.radius * math.sin(math.radians(angle)))
            )
        points.append((self.x, self.y))
        if len(points) > 2:
            pygame.draw.polygon(screen, YELLOW, points)

        # 口の部分を黒色で塗りつぶす
        pygame.draw.circle(screen, YELLOW, (self.x, self.y), self.radius - 2)

# エサの設定
class Food:
    def __init__(self):
        self.radius = 5
        self.reset_position()
        self.eaten = False

    def reset_position(self):
        self.x = random.randint(self.radius, SCREEN_WIDTH - self.radius)
        self.y = random.randint(self.radius, SCREEN_HEIGHT - self.radius)

    def draw(self, screen):
        if not self.eaten:
            pygame.draw.circle(screen, WHITE, (self.x, self.y), self.radius)

# ゴーストの設定
class Ghost:
    def __init__(self, color):
        self.radius = 20
        self.color = color
        self.reset_position()
        self.speed = 3
        self.direction = random.randint(0, 3)  # 0: 右, 1: 下, 2: 左, 3: 上

    def reset_position(self):
        self.x = random.randint(self.radius, SCREEN_WIDTH - self.radius)
        self.y = random.randint(self.radius, SCREEN_HEIGHT - self.radius)

    def move(self):
        # ランダムに方向を変更
        if random.random() < 0.02:  # 2%の確率で方向を変更
            self.direction = random.randint(0, 3)

        # 移動
        if self.direction == 0:  # 右
            self.x = min(SCREEN_WIDTH - self.radius, self.x + self.speed)
        elif self.direction == 1:  # 下
            self.y = min(SCREEN_HEIGHT - self.radius, self.y + self.speed)
        elif self.direction == 2:  # 左
            self.x = max(self.radius, self.x - self.speed)
        elif self.direction == 3:  # 上
            self.y = max(self.radius, self.y - self.speed)

    def draw(self, screen):
        # ゴーストの体
        pygame.draw.circle(screen, self.color, (self.x, self.y), self.radius)
        # ゴーストの目
        pygame.draw.circle(screen, WHITE, (self.x - 5, self.y - 5), 3)
        pygame.draw.circle(screen, WHITE, (self.x + 5, self.y - 5), 3)

# スコアの設定
class Score:
    def __init__(self):
        self.font = pygame.font.Font(None, 36)
        self.value = 0

    def draw(self, screen):
        score_text = self.font.render(f"スコア: {self.value}", True, WHITE)
        screen.blit(score_text, (10, 10))

# ゲームオブジェクトの作成
pacman = Pacman()
foods = [Food() for _ in range(10)]  # エサを10個作成
ghosts = [Ghost(RED), Ghost(PINK)]  # ゴーストを2体作成
score = Score()

# メインゲームループ
clock = pygame.time.Clock()
running = True

while running:
    # イベント処理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # キー入力の取得
    keys = pygame.key.get_pressed()

    # パックマンの移動
    pacman.move(keys)

    # ゴーストの移動
    for ghost in ghosts:
        ghost.move()

    # 衝突判定
    for food in foods:
        if not food.eaten:
            distance = math.sqrt((pacman.x - food.x)**2 + (pacman.y - food.y)**2)
            if distance < pacman.radius + food.radius:
                food.eaten = True
                score.value += 10
                food.reset_position()

    # ゴーストとの衝突判定
    for ghost in ghosts:
        distance = math.sqrt((pacman.x - ghost.x)**2 + (pacman.y - ghost.y)**2)
        if distance < pacman.radius + ghost.radius:
            running = False

    # 画面の描画
    screen.fill(BLACK)
    
    # エサの描画
    for food in foods:
        food.draw(screen)
    
    # ゴーストの描画
    for ghost in ghosts:
        ghost.draw(screen)
    
    # パックマンの描画
    pacman.draw(screen)
    
    # スコアの描画
    score.draw(screen)
    
    pygame.display.flip()

    # FPSの制限
    clock.tick(60)

# ゲーム終了
pygame.quit()
sys.exit() 