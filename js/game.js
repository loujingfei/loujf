/**
 * Game 类 - 游戏主控制器
 */
class Game {
    constructor() {
        // 初始化各个管理器
        this.cardManager = new CardManager();
        this.slotManager = new SlotManager();
        this.levelManager = new LevelManager();
        this.scoreManager = new ScoreManager();
        this.leaderboardManager = new LeaderboardManager();
        
        // 游戏状态
        this.isPaused = false;
        this.isGameOver = false;
        this.isPlaying = false;
        
        // DOM元素
        this.cardArea = document.getElementById('cardArea');
        this.levelDisplay = document.getElementById('levelDisplay');
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化游戏
     */
    initialize() {
        // 初始化槽位管理器
        this.slotManager.initialize();
        
        // 初始化排行榜事件
        this.leaderboardManager.initializeEventListeners();
        
        // 绑定游戏事件
        this.bindGameEvents();
        
        // 绑定UI事件
        this.bindUIEvents();
        
        // 开始游戏
        this.startNewGame();
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        // 重置状态
        this.isGameOver = false;
        this.isPaused = false;
        this.isPlaying = true;
        
        // 清空管理器
        this.cardManager.clearAll();
        this.slotManager.clearAll();
        this.scoreManager.reset();
        
        // 回到第一关
        this.levelManager.resetToFirstLevel();
        
        // 更新UI
        this.updateLevelDisplay();
        this.scoreManager.updateUI();
        
        // 生成关卡
        this.generateLevel();
        
        this.isPlaying = true;
    }

    /**
     * 开始新关卡
     */
    startNextLevel() {
        // 进入下一关
        this.levelManager.nextLevel();
        
        // 清空管理器（保持分数）
        this.cardManager.clearAll();
        this.slotManager.clearAll();
        this.scoreManager.resetCombo();
        
        // 更新UI
        this.updateLevelDisplay();
        this.scoreManager.updateUI();
        
        // 生成新关卡
        this.generateLevel();
        
        this.isPlaying = true;
    }

    /**
     * 重新开始当前关卡
     */
    restartCurrentLevel() {
        // 重置状态
        this.isGameOver = false;
        this.isPaused = false;
        this.isPlaying = true;
        
        // 清空管理器
        this.cardManager.clearAll();
        this.slotManager.clearAll();
        this.scoreManager.reset();
        
        // 更新UI
        this.scoreManager.updateUI();
        
        // 重新生成关卡
        this.generateLevel();
        
        this.isPlaying = true;
    }

    /**
     * 生成关卡
     */
    generateLevel() {
        const config = this.levelManager.getCurrentLevelConfig();
        this.levelManager.generateLevelLayout(config, this.cardManager, this.cardArea);
    }

    /**
     * 更新关卡显示
     */
    updateLevelDisplay() {
        const level = this.levelManager.getCurrentLevel();
        const maxLevel = this.levelManager.getMaxLevel();
        
        if (level >= maxLevel) {
            this.levelDisplay.textContent = `第 ${level} 关 (无限模式)`;
        } else {
            this.levelDisplay.textContent = `第 ${level} 关 / ${maxLevel}`;
        }
    }

    /**
     * 绑定游戏事件
     */
    bindGameEvents() {
        // 卡片点击事件
        document.addEventListener('cardClicked', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            
            const cardId = e.detail.cardId;
            const card = this.cardManager.getCard(cardId);
            
            if (card && !card.isDisabled) {
                this.handleCardClick(card);
            }
        });

        // 卡片消除事件
        document.addEventListener('cardsEliminated', (e) => {
            const type = e.detail.type;
            const indices = e.detail.indices;
            this.handleCardsEliminated(type, indices);
        });
    }

    /**
     * 处理卡片点击
     * @param {Card} card - 被点击的卡片
     */
    handleCardClick(card) {
        // 将卡片添加到槽位
        const success = this.slotManager.addCard({
            id: card.id,
            type: card.type,
            card: card
        });

        if (success) {
            // 更新卡片状态
            card.moveToSlot(-1);
            
            // 移除卡片DOM元素
            if (card.element && card.element.parentNode) {
                card.element.remove();
            }
            
            // 更新其他卡片的可点击状态
            this.cardManager.updateCardStates();
            
            // 检查游戏状态
            this.checkGameState();
        }
    }

    /**
     * 处理卡片消除
     * @param {number} type - 卡片类型
     * @param {Array} indices - 槽位索引数组
     */
    handleCardsEliminated(type, indices) {
        console.log('卡片消除: 类型=' + type + ', 索引=' + indices.join(','));
        
        // 增加分数
        const points = this.scoreManager.addEliminationScore(3);
        console.log('消除分数: ' + points + ', 当前分: ' + this.scoreManager.getCurrentScore());
        
        // 更新UI
        this.scoreManager.updateUI();
        
        // 从卡片管理器中移除卡片
        indices.forEach(slotIndex => {
            const slotData = this.slotManager.slots[slotIndex];
            if (slotData) {
                console.log('移除卡片 ID: ' + slotData.id);
                this.cardManager.removeCard(slotData.id);
            }
        });
        
        console.log('剩余卡片数: ' + this.cardManager.getAllCards().length);
        console.log('槽位卡片数: ' + this.slotManager.getCardCount());
        
        // 更新其他卡片的可点击状态
        this.cardManager.updateCardStates();
        
        // 检查游戏胜利条件
        this.checkWinCondition();
    }

    /**
     * 检查游戏状态
     */
    checkGameState() {
        console.log('检查游戏状态: 槽位数=' + this.slotManager.getCardCount());
        // 检查是否可以继续
        if (!this.slotManager.canContinue()) {
            console.log('游戏失败: 槽位已满');
            this.gameOver(false);
        }
    }

    /**
     * 检查胜利条件
     */
    checkWinCondition() {
        // 检查是否所有卡片都已消除
        const remainingCards = this.cardManager.getAllCards();
        const cardsInPlay = remainingCards.filter(card => !card.inSlot);
        
        console.log('检查胜利条件:');
        console.log('  剩余卡片总数: ' + remainingCards.length);
        console.log('  游戏中卡片数: ' + cardsInPlay.length);
        console.log('  槽位卡片数: ' + this.slotManager.getCardCount());
        
        if (cardsInPlay.length === 0 && this.slotManager.getCardCount() === 0) {
            console.log('触发胜利条件!');
            this.gameOver(true);
        }
    }

    /**
     * 游戏结束
     * @param {boolean} isWin - 是否胜利
     */
    gameOver(isWin) {
        this.isGameOver = true;
        this.isPlaying = false;
        
        if (isWin) {
            // 胜利
            const level = this.levelManager.getCurrentLevel();
            const bonus = this.scoreManager.getLevelCompletionBonus(level);
            
            // 显示通关图片弹窗
            this.showLevelCompleteModal();
            
            // 自动进入下一关（延迟1.5秒）
            setTimeout(() => {
                this.hideLevelCompleteModal();
                this.startNextLevel();
            }, 1500);
        } else {
            // 失败
            // 重置连击
            this.scoreManager.resetCombo();
            
            // 如果是高分，记录到排行榜
            if (this.leaderboardManager.canEnterLeaderboard(this.scoreManager.getCurrentScore())) {
                this.leaderboardManager.addScore({
                    score: this.scoreManager.getCurrentScore(),
                    level: this.levelManager.getCurrentLevel(),
                    combo: this.scoreManager.getMaxCombo(),
                    date: new Date().toISOString()
                });
            }
            
            // 显示失败弹窗
            this.showResultModal(false);
        }
    }

    /**
     * 显示通关图片弹窗
     */
    showLevelCompleteModal() {
        const modal = document.getElementById('levelCompleteModal');
        const image = document.getElementById('levelCompleteImage');
        const text = document.querySelector('.level-complete-text');
        
        // 根据关卡设置图片
        const level = this.levelManager.getCurrentLevel();
        image.src = `files/${level}.png`;
        
        image.onerror = function() {
            // 如果图片不存在，使用默认图片
            this.src = 'files/1.png';
            // 如果默认图片也不存在，显示占位文字
            this.style.display = 'none';
            text.textContent = `🎉 第 ${level} 关通关成功!`;
        };
        
        image.onload = function() {
            // 图片加载成功
            this.style.display = 'block';
            text.textContent = '🎉 通关成功!';
        };
        
        modal.classList.add('show');
    }

    /**
     * 隐藏通关图片弹窗
     */
    hideLevelCompleteModal() {
        const modal = document.getElementById('levelCompleteModal');
        modal.classList.remove('show');
    }

    /**
     * 显示结果弹窗
     * @param {boolean} isWin - 是否胜利
     */
    showResultModal(isWin) {
        const modal = document.getElementById('resultModal');
        const title = document.getElementById('resultTitle');
        const message = document.getElementById('resultMessage');
        const score = document.getElementById('resultScore');
        const combo = document.getElementById('resultCombo');
        const nextLevelBtn = document.getElementById('nextLevelResultBtn');
        
        if (isWin) {
            title.textContent = '🎉 恭喜通关!';
            title.style.color = '#38ef7d';
            message.textContent = '您成功完成了本关卡！';
            nextLevelBtn.style.display = 'inline-block';
        } else {
            title.textContent = '😢 游戏结束';
            title.style.color = '#f45c43';
            message.textContent = '槽位已满，无法继续消除！';
            nextLevelBtn.style.display = 'none';
        }
        
        score.textContent = this.scoreManager.getCurrentScore();
        combo.textContent = this.scoreManager.getMaxCombo();
        
        modal.classList.add('show');
    }

    /**
     * 隐藏结果弹窗
     */
    hideResultModal() {
        const modal = document.getElementById('resultModal');
        modal.classList.remove('show');
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (!this.isPlaying || this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pauseBtn').innerHTML = '▶️ 继续';
            document.getElementById('pauseModal').classList.add('show');
        } else {
            document.getElementById('pauseBtn').innerHTML = '⏸️ 暂停';
            document.getElementById('pauseModal').classList.remove('show');
        }
    }

    /**
     * 绑定UI事件
     */
    bindUIEvents() {
        // 重新开始按钮
        document.getElementById('restartBtn').addEventListener('click', () => {
            if (confirm('确定要重新开始游戏吗？')) {
                this.startNewGame();
            }
        });

        // 排行榜按钮
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.leaderboardManager.showLeaderboardModal();
        });

        // 暂停按钮
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        // 继续按钮（暂停弹窗）
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        // 重新开始按钮（暂停弹窗）
        document.getElementById('restartPauseBtn').addEventListener('click', () => {
            if (confirm('确定要重新开始游戏吗？')) {
                this.hidePauseModal();
                this.startNewGame();
            }
        });

        // 重新开始按钮（结果弹窗）
        document.getElementById('restartResultBtn').addEventListener('click', () => {
            this.hidePauseModal();
            this.hideResultModal();
            this.startNewGame();
        });

        // 下一关按钮（结果弹窗）
        document.getElementById('nextLevelResultBtn').addEventListener('click', () => {
            this.hidePauseModal();
            this.hideResultModal();
            this.startNextLevel();
        });

        // 点击弹窗背景关闭
        document.getElementById('resultModal').addEventListener('click', (e) => {
            if (e.target.id === 'resultModal') {
                // 结果弹窗不通过背景关闭，需要用户选择操作
            }
        });

        document.getElementById('pauseModal').addEventListener('click', (e) => {
            if (e.target.id === 'pauseModal') {
                // 暂停弹窗不通过背景关闭
            }
        });
    }

    /**
     * 隐藏暂停弹窗
     */
    hidePauseModal() {
        document.getElementById('pauseModal').classList.remove('show');
    }
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});