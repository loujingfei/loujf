/**
 * SlotManager 类 - 管理槽位系统
 */
class SlotManager {
    constructor() {
        this.slots = []; // 7个槽位，每个存储card对象或null
        this.slotElements = [];
        this.maxSlots = 7;
        this.initialized = false;
    }

    /**
     * 初始化槽位
     */
    initialize() {
        if (this.initialized) return;

        this.slots = new Array(this.maxSlots).fill(null);
        this.slotElements = Array.from(document.querySelectorAll('.slot'));
        this.initialized = true;
    }

    /**
     * 添加卡片到槽位
     * @param {Object} cardData - 卡片数据 {id, type, card}
     * @returns {boolean} 是否成功添加
     */
    addCard(cardData) {
        // 查找第一个空槽位
        const emptyIndex = this.slots.findIndex(slot => slot === null);
        
        if (emptyIndex === -1) {
            // 槽位已满
            return false;
        }

        // 添加卡片到槽位
        this.slots[emptyIndex] = cardData;

        // 更新UI
        this.updateSlotUI();

        // 检查是否有可以消除的卡片
        const eliminated = this.checkForElimination();

        return true;
    }

    /**
     * 检查并执行消除
     * @returns {boolean} 是否发生了消除
     */
    checkForElimination() {
        // 统计每种类型的卡片数量
        const typeCount = {};
        this.slots.forEach((slot, index) => {
            if (slot) {
                if (!typeCount[slot.type]) {
                    typeCount[slot.type] = [];
                }
                typeCount[slot.type].push(index);
            }
        });

        let eliminated = false;

        // 检查每种类型是否有3张
        for (const type in typeCount) {
            if (typeCount[type].length >= 3) {
                // 找到需要消除的卡片索引
                const indicesToRemove = typeCount[type].slice(0, 3);
                
                // 触发消除事件
                const event = new CustomEvent('cardsEliminated', {
                    detail: {
                        type: parseInt(type),
                        indices: indicesToRemove
                    }
                });
                document.dispatchEvent(event);

                // 从槽位移除卡片
                indicesToRemove.forEach(index => {
                    this.slots[index] = null;
                });

                eliminated = true;
            }
        }

        if (eliminated) {
            // 重新排列槽位（将所有卡片移到左边）
            this.compactSlots();
            this.updateSlotUI();
        }

        return eliminated;
    }

    /**
     * 紧凑槽位，将卡片移到左边
     */
    compactSlots() {
        // 收集所有非空卡片
        const cards = this.slots.filter(slot => slot !== null);
        
        // 清空槽位
        this.slots.fill(null);
        
        // 将卡片从左到右重新填入
        cards.forEach((card, index) => {
            this.slots[index] = card;
        });
    }

    /**
     * 更新槽位UI
     */
    updateSlotUI() {
        this.slotElements.forEach((slotElement, index) => {
            // 清空槽位
            slotElement.innerHTML = '';

            const slotData = this.slots[index];
            if (slotData && slotData.card) {
                // 创建卡片元素
                const cardElement = document.createElement('div');
                cardElement.className = 'card in-slot';
                cardElement.dataset.id = slotData.id;
                cardElement.dataset.type = slotData.type;
                cardElement.innerHTML = slotData.card.getIcon();
                slotElement.appendChild(cardElement);
            }
        });
    }

    /**
     * 检查槽位是否已满
     * @returns {boolean} 是否已满
     */
    isFull() {
        return this.slots.every(slot => slot !== null);
    }

    /**
     * 获取槽位中的卡片数量
     * @returns {number} 卡片数量
     */
    getCardCount() {
        return this.slots.filter(slot => slot !== null).length;
    }

    /**
     * 获取空槽位数量
     * @returns {number} 空槽位数量
     */
    getEmptySlotCount() {
        return this.slots.filter(slot => slot === null).length;
    }

    /**
     * 检查是否可以继续游戏
     * @returns {boolean} 是否可以继续
     */
    canContinue() {
        if (this.isFull()) {
            // 槽位已满，检查是否可以消除
            const typeCount = {};
            this.slots.forEach(slot => {
                if (slot) {
                    typeCount[slot.type] = (typeCount[slot.type] || 0) + 1;
                }
            });

            // 如果有任何类型有3张或更多，可以消除
            for (const type in typeCount) {
                if (typeCount[type] >= 3) {
                    return true;
                }
            }

            // 无法消除，游戏结束
            return false;
        }
        
        return true;
    }

    /**
     * 清空所有槽位
     */
    clearAll() {
        this.slots.fill(null);
        this.updateSlotUI();
    }

    /**
     * 获取当前槽位状态
     * @returns {Array} 槽位状态数组
     */
    getSlotState() {
        return this.slots.map(slot => 
            slot ? { id: slot.id, type: slot.type } : null
        );
    }

    /**
     * 显示槽位预览动画
     * @param {number} slotIndex - 槽位索引
     */
    highlightSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.slotElements.length) {
            const slot = this.slotElements[slotIndex];
            slot.style.background = 'rgba(255, 255, 255, 0.6)';
            slot.style.borderColor = 'rgba(255, 255, 255, 0.9)';
            
            setTimeout(() => {
                slot.style.background = '';
                slot.style.borderColor = '';
            }, 300);
        }
    }
}