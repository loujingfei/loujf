/**
 * LevelManager 类 - 管理关卡系统
 */
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.levels = this.generateLevels();
    }

    /**
     * 生成关卡配置
     * @returns {Array} 关卡配置数组
     */
    generateLevels() {
        const levels = [];
        
        for (let level = 1; level <= this.maxLevel; level++) {
            levels.push({
                level: level,
                // 卡片类型数量从4逐渐增加到7
                cardTypes: Math.min(7, 3 + Math.floor(level / 2)),
                // 每种类型的卡片数量
                cardsPerType: 3 + Math.floor(level / 3),
                // 层级数量
                layers: Math.min(5, 1 + Math.floor(level / 2)),
                // 游戏区域宽高的偏移量
                offsetX: 20,
                offsetY: 20,
                // 卡片间距
                cardGap: 10,
                // 最大卡片总数限制
                maxCards: Math.min(50, 15 + level * 5)
            });
        }
        
        return levels;
    }

    /**
     * 获取当前关卡配置
     * @returns {Object} 关卡配置
     */
    getCurrentLevelConfig() {
        if (this.currentLevel > this.maxLevel) {
            // 超过最大关卡，使用最高配置
            return this.levels[this.maxLevel - 1];
        }
        return this.levels[this.currentLevel - 1];
    }

    /**
     * 获取指定关卡配置
     * @param {number} level - 关卡编号
     * @returns {Object|null} 关卡配置
     */
    getLevelConfig(level) {
        if (level < 1 || level > this.maxLevel) {
            return null;
        }
        return this.levels[level - 1];
    }

    /**
     * 进入下一关
     * @returns {boolean} 是否成功进入下一关
     */
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            return true;
        } else if (this.currentLevel === this.maxLevel) {
            // 已通过最后一关，可以继续玩无限模式
            this.currentLevel = this.maxLevel;
            return false;
        }
        return false;
    }

    /**
     * 重新开始当前关卡
     */
    restartLevel() {
        // 关卡编号不变，只是重置游戏状态
    }

    /**
     * 回到第一关
     */
    resetToFirstLevel() {
        this.currentLevel = 1;
    }

    /**
     * 跳转到指定关卡
     * @param {number} level - 关卡编号
     * @returns {boolean} 是否成功跳转
     */
    goToLevel(level) {
        if (level >= 1 && level <= this.maxLevel) {
            this.currentLevel = level;
            return true;
        }
        return false;
    }

    /**
     * 获取当前关卡编号
     * @returns {number} 关卡编号
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * 获取最大关卡数
     * @returns {number} 最大关卡数
     */
    getMaxLevel() {
        return this.maxLevel;
    }

    /**
     * 生成关卡卡片布局
     * @param {Object} config - 关卡配置
     * @param {CardManager} cardManager - 卡片管理器
     * @param {HTMLElement} cardArea - 卡片区域元素
     */
    generateLevelLayout(config, cardManager, cardArea) {
        // 清空现有卡片
        cardManager.clearAll();
        cardArea.innerHTML = '';

        // 生成卡片类型数组
        // 每种类型的卡片数量必须是3的倍数，才能完全消除
        const cardTypes = [];
        
        // 计算每组3张卡片需要多少组
        const groupsPerType = config.cardsPerType;  // 每种类型有几组3张
        
        for (let type = 0; type < config.cardTypes; type++) {
            // 每种类型添加 groupsPerType 组，每组3张相同卡片
            for (let group = 0; group < groupsPerType; group++) {
                cardTypes.push(type, type, type);
            }
        }
        
        // 计算总卡片数
        const totalCards = cardTypes.length;
        
        // 如果超过最大卡片数，适当减少
        if (totalCards > config.maxCards) {
            // 移除多余卡片（保持3的倍数）
            const removeCount = totalCards - config.maxCards;
            const removeGroups = Math.ceil(removeCount / 3);
            
            // 从最后开始移除完整的组
            for (let i = 0; i < removeGroups; i++) {
                cardTypes.pop();
                cardTypes.pop();
                cardTypes.pop();
            }
        }

        console.log(`生成关卡: 卡片类型数=${config.cardTypes}, 每种类型组数=${config.cardsPerType}, 总卡片数=${cardTypes.length}`);

        // 随机打乱卡片类型
        this.shuffleArray(cardTypes);

        // 计算游戏区域大小
        // 使用offsetWidth/offsetHeight而不是getBoundingClientRect，因为前者更可靠
        const areaWidth = cardArea.offsetWidth || 500;  // 默认宽度
        const areaHeight = cardArea.offsetHeight || 400; // 默认高度
        
        console.log(`游戏区域尺寸: 宽=${areaWidth}, 高=${areaHeight}, offsetWidth=${cardArea.offsetWidth}, offsetHeight=${cardArea.offsetHeight}`);

        // 计算卡片网格
        const cardSize = 70;
        const effectiveWidth = areaWidth > 0 ? areaWidth : 500;
        const effectiveHeight = areaHeight > 0 ? areaHeight : 400;
        
        const cols = Math.floor((effectiveWidth - config.offsetX * 2) / (cardSize + config.cardGap));
        const rows = Math.floor((effectiveHeight - config.offsetY * 2) / (cardSize + config.cardGap));
        
        console.log(`卡片网格: 列=${cols}, 行=${rows}, 计算宽度=${effectiveWidth}, 计算高度=${effectiveHeight}`);

        // 生成卡片布局
        const positions = this.generateCardPositions(
            cardTypes.length,
            config.layers,
            cols,
            rows,
            areaWidth,
            areaHeight,
            cardSize,
            config.cardGap,
            config.offsetX,
            config.offsetY
        );
        
        console.log(`生成位置数: ${positions.length}`);

        // 创建卡片
        cardTypes.forEach((type, index) => {
            if (index < positions.length) {
                const pos = positions[index];
                const card = cardManager.createCard(
                    type,
                    pos.x,
                    pos.y,
                    pos.layer
                );
                cardArea.appendChild(card.createElement());
            }
        });

        // 更新卡片的可点击状态
        cardManager.updateCardStates();
    }

    /**
     * 生成卡片位置（分层堆叠）
     */
    generateCardPositions(count, layers, cols, rows, areaWidth, areaHeight, cardSize, gap, offsetX, offsetY) {
        const positions = [];

        // 为每层生成卡片位置
        for (let layer = 0; layer < layers; layer++) {
            const cardsInLayer = Math.ceil(count / layers);
            
            // 每层减少一些卡片和位置，形成金字塔形状
            const layerOffset = layer * 2;
            const layerCols = Math.max(3, cols - layerOffset);
            const layerRows = Math.max(3, rows - layerOffset);

            for (let i = 0; i < cardsInLayer; i++) {
                // 随机位置，但避免完全重叠
                const col = Math.random() * (layerCols - 1);
                const row = Math.random() * (layerRows - 1);

                // 计算实际位置（居中）
                const layerStartX = (effectiveWidth - (layerCols * (cardSize + gap))) / 2;
                const layerStartY = (effectiveHeight - (layerRows * (cardSize + gap))) / 2;

                const x = offsetX + layerStartX + col * (cardSize + gap);
                const y = offsetY + layerStartY + row * (cardSize + gap);
                
                console.log(`卡片 ${positions.length}: x=${Math.round(x)}, y=${Math.round(y)}, layer=${layer}`);

                positions.push({
                    x: x,
                    y: y,
                    layer: layer
                });

                if (positions.length >= count) break;
            }

            if (positions.length >= count) break;
        }

        return positions;
    }

    /**
     * 随机打乱数组
     * @param {Array} array - 要打乱的数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * 获取关卡难度描述
     * @param {number} level - 关卡编号
     * @returns {string} 难度描述
     */
    getDifficultyDescription(level) {
        if (level <= 2) return '简单';
        if (level <= 5) return '中等';
        if (level <= 8) return '困难';
        return '专家';
    }

    /**
     * 获取关卡通过所需的分数
     * @param {number} level - 关卡编号
     * @returns {number} 所需分数
     */
    getRequiredScore(level) {
        return level * 100;
    }
}