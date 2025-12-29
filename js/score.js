/**
 * ScoreManager 类 - 管理分数系统
 */
class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScore = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.eliminationCount = 0;

        this.loadHighScore();
    }

    /**
     * 加载最高分
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('tileGameHighScore');
            if (saved) {
                this.highScore = parseInt(saved);
            }
        } catch (error) {
            console.error('加载最高分失败:', error);
        }
    }

    /**
     * 保存最高分
     */
    saveHighScore() {
        try {
            localStorage.setItem('tileGameHighScore', this.highScore.toString());
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }

    /**
     * 增加分数（消除卡片）
     * @param {number} cardsEliminated - 消除的卡片数量
     * @returns {number} 增加的分数
     */
    addEliminationScore(cardsEliminated) {
        this.eliminationCount++;
        
        // 基础分
        let baseScore = cardsEliminated * 10;
        
        // 连击加成
        this.combo++;
        const comboBonus = this.combo * 20;
        
        // 计算总分
        const totalScore = baseScore + comboBonus;
        
        this.currentScore += totalScore;
        
        // 更新最高连击
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // 更新最高分
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        return totalScore;
    }

    /**
     * 重置连击
     */
    resetCombo() {
        this.combo = 0;
    }

    /**
     * 关卡完成奖励
     * @param {number} level - 关卡编号
     * @returns {number} 奖励分数
     */
    getLevelCompletionBonus(level) {
        const bonus = level * 100 + this.eliminationCount * 5;
        this.currentScore += bonus;
        
        // 更新最高分
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        return bonus;
    }

    /**
     * 获取当前分数
     * @returns {number} 当前分数
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * 获取最高分
     * @returns {number} 最高分
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * 获取当前连击
     * @returns {number} 当前连击数
     */
    getCombo() {
        return this.combo;
    }

    /**
     * 获取最高连击
     * @returns {number} 最高连击数
     */
    getMaxCombo() {
        return this.maxCombo;
    }

    /**
     * 获取消除次数
     * @returns {number} 消除次数
     */
    getEliminationCount() {
        return this.eliminationCount;
    }

    /**
     * 重置分数
     */
    reset() {
        this.currentScore = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.eliminationCount = 0;
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        document.getElementById('currentScore').textContent = this.currentScore;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('combo').textContent = this.combo;
    }
}