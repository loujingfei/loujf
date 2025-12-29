/**
 * LeaderboardManager 类 - 管理排行榜系统
 */
class LeaderboardManager {
    constructor() {
        this.storageKey = 'tileGameLeaderboard';
        this.maxEntries = 10;
        this.leaderboard = [];
        
        this.loadLeaderboard();
    }

    /**
     * 加载排行榜数据
     */
    loadLeaderboard() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.leaderboard = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载排行榜失败:', error);
            this.leaderboard = [];
        }
    }

    /**
     * 保存排行榜数据
     */
    saveLeaderboard() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboard));
        } catch (error) {
            console.error('保存排行榜失败:', error);
        }
    }

    /**
     * 添加分数到排行榜
     * @param {Object} scoreData - 分数数据 {score, level, combo, date, playerName}
     * @returns {boolean} 是否进入排行榜
     */
    addScore(scoreData) {
        const entry = {
            rank: 0,
            score: scoreData.score || 0,
            level: scoreData.level || 1,
            combo: scoreData.combo || 0,
            date: scoreData.date || new Date().toISOString(),
            playerName: scoreData.playerName || `玩家${Math.floor(Math.random() * 1000)}`
        };

        this.leaderboard.push(entry);
        
        // 按分数降序排序
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        // 只保留前N名
        this.leaderboard = this.leaderboard.slice(0, this.maxEntries);
        
        // 更新排名
        this.leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        this.saveLeaderboard();
        
        // 检查是否进入排行榜
        return this.leaderboard.some(entry => entry.score === entry.score && 
                entry.date === entry.date &&
                entry.level === entry.level &&
                entry.combo === entry.combo);
    }

    /**
     * 获取排行榜
     * @returns {Array} 排行榜数据
     */
    getLeaderboard() {
        return [...this.leaderboard];
    }

    /**
     * 检查分数是否能进入排行榜
     * @param {number} score - 分数
     * @returns {boolean} 是否能进入
     */
    canEnterLeaderboard(score) {
        if (this.leaderboard.length < this.maxEntries) {
            return true;
        }
        
        return score > this.leaderboard[this.leaderboard.length - 1].score;
    }

    /**
     * 获取最高分
     * @returns {number} 最高分
     */
    getHighestScore() {
        return this.leaderboard.length > 0 ? this.leaderboard[0].score : 0;
    }

    /**
     * 清空排行榜
     */
    clearLeaderboard() {
        this.leaderboard = [];
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('清空排行榜失败:', error);
        }
    }

    /**
     * 显示排行榜弹窗
     */
    showLeaderboardModal() {
        const modal = document.getElementById('leaderboardModal');
        const listElement = document.getElementById('leaderboardList');
        
        // 清空列表
        listElement.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            listElement.innerHTML = '<div class="no-leaderboard">暂无排行榜记录</div>';
        } else {
            // 显示排行榜
            this.leaderboard.forEach(entry => {
                const item = this.createLeaderboardItem(entry);
                listElement.appendChild(item);
            });
        }
        
        modal.classList.add('show');
    }

    /**
     * 隐藏排行榜弹窗
     */
    hideLeaderboardModal() {
        const modal = document.getElementById('leaderboardModal');
        modal.classList.remove('show');
    }

    /**
     * 创建排行榜项目元素
     * @param {Object} entry - 排行榜条目
     * @returns {HTMLElement} 项目元素
     */
    createLeaderboardItem(entry) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // 排名样式
        let rankClass = '';
        if (entry.rank === 1) rankClass = 'top-1';
        else if (entry.rank === 2) rankClass = 'top-2';
        else if (entry.rank === 3) rankClass = 'top-3';
        
        // 格式化日期
        const date = new Date(entry.date);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${entry.rank}</div>
            <div class="leaderboard-name">${entry.playerName}</div>
            <div class="leaderboard-score">${entry.score}分</div>
        `;
        
        return item;
    }

    /**
     * 初始化排行榜事件监听
     */
    initializeEventListeners() {
        // 关闭按钮
        document.getElementById('closeLeaderboard').addEventListener('click', () => {
            this.hideLeaderboardModal();
        });
        
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
            this.hideLeaderboardModal();
        });
        
        // 清空排行榜
        document.getElementById('clearLeaderboard').addEventListener('click', () => {
            if (confirm('确定要清空排行榜吗？')) {
                this.clearLeaderboard();
                this.showLeaderboardModal();
            }
        });
        
        // 点击模态框背景关闭
        document.getElementById('leaderboardModal').addEventListener('click', (e) => {
            if (e.target.id === 'leaderboardModal') {
                this.hideLeaderboardModal();
            }
        });
    }
}