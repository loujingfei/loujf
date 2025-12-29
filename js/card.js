/**
 * Card 类 - 管理游戏卡片
 */
class Card {
    /**
     * 构造函数
     * @param {number} id - 卡片唯一ID
     * @param {number} type - 卡片类型 (0-6)
     * @param {number} x - 卡片X位置
     * @param {number} y - 卡片Y位置
     * @param {number} layer - 卡片层级
     */
    constructor(id, type, x, y, layer) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.element = null;
        this.isDisabled = false;
        this.inSlot = false;
    }

    /**
     * 获取卡片类型的emoji图标
     * @returns {string} emoji图标
     */
    getIcon() {
        const icons = ['🐵', '🦁', '🐯', '🐨', '🦊', '🐀', '🐭'];
        return icons[this.type];
    }

    /**
     * 创建卡片DOM元素
     * @returns {HTMLElement} 卡片元素
     */
    createElement() {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = this.id;
        cardElement.dataset.type = this.type;
        cardElement.innerHTML = this.getIcon();
        cardElement.style.left = `${this.x}px`;
        cardElement.style.top = `${this.y}px`;
        cardElement.style.zIndex = this.layer;

        // 添加点击事件
        cardElement.addEventListener('click', () => this.handleClick());
        
        this.element = cardElement;
        return cardElement;
    }

    /**
     * 处理卡片点击
     */
    handleClick() {
        if (this.isDisabled) return;
        
        // 触发自定义事件
        const event = new CustomEvent('cardClicked', {
            detail: {
                cardId: this.id,
                type: this.type
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 禁用卡片（被其他卡片覆盖）
     */
    disable() {
        this.isDisabled = true;
        if (this.element) {
            this.element.classList.add('disabled');
        }
    }

    /**
     * 启用卡片（不再被覆盖）
     */
    enable() {
        this.isDisabled = false;
        if (this.element) {
            this.element.classList.remove('disabled');
        }
    }

    /**
     * 移动到槽位
     * @param {number} slotIndex - 槽位索引
     */
    moveToSlot(slotIndex) {
        this.inSlot = true;
        if (this.element) {
            this.element.style.position = 'relative';
            this.element.classList.add('in-slot');
            this.element.style.left = '';
            this.element.style.top = '';
            this.element.style.zIndex = '';
        }
    }

    /**
     * 播放消除动画
     * @returns {Promise} 动画完成的Promise
     */
    playEliminateAnimation() {
        return new Promise((resolve) => {
            if (this.element) {
                this.element.classList.add('eliminating');
                setTimeout(() => {
                    this.element.remove();
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        });
    }

    /**
     * 销毁卡片
     */
    destroy() {
        if (this.element) {
            this.element.remove();
        }
        this.inSlot = false;
    }
}

/**
 * CardManager 类 - 管理所有卡片
 */
class CardManager {
    constructor() {
        this.cards = new Map();
        this.nextId = 0;
    }

    /**
     * 创建新卡片
     * @param {number} type - 卡片类型
     * @param {number} x - X位置
     * @param {number} y - Y位置
     * @param {number} layer - 层级
     * @returns {Card} 新创建的卡片
     */
    createCard(type, x, y, layer) {
        const card = new Card(this.nextId++, type, x, y, layer);
        this.cards.set(card.id, card);
        return card;
    }

    /**
     * 获取卡片
     * @param {number} id - 卡片ID
     * @returns {Card|null} 卡片对象
     */
    getCard(id) {
        return this.cards.get(id);
    }

    /**
     * 获取所有卡片
     * @returns {Card[]} 卡片数组
     */
    getAllCards() {
        return Array.from(this.cards.values());
    }

    /**
     * 根据类型获取卡片
     * @param {number} type - 卡片类型
     * @returns {Card[]} 指定类型的卡片数组
     */
    getCardsByType(type) {
        return this.getAllCards().filter(card => card.type === type);
    }

    /**
     * 移除卡片
     * @param {number} id - 卡片ID
     */
    removeCard(id) {
        const card = this.cards.get(id);
        if (card) {
            card.destroy();
            this.cards.delete(id);
        }
    }

    /**
     * 清空所有卡片
     */
    clearAll() {
        this.cards.forEach(card => card.destroy());
        this.cards.clear();
        this.nextId = 0;
    }

    /**
     * 更新卡片的可点击状态
     * 基于卡片的位置和层级判断是否被其他卡片覆盖
     */
    updateCardStates() {
        const cards = Array.from(this.cards.values()).filter(card => !card.inSlot);
        
        // 按层级排序（低层在下）
        cards.sort((a, b) => a.layer - b.layer);

        // 检查每张卡片是否被上层卡片覆盖
        cards.forEach(card => {
            let isCovered = false;
            
            for (const otherCard of cards) {
                if (otherCard.layer <= card.layer) continue;
                if (otherCard.inSlot) continue;

                // 检查是否重叠（简单的矩形碰撞检测）
                const overlap = this.checkOverlap(card, otherCard);
                if (overlap) {
                    isCovered = true;
                    break;
                }
            }

            if (isCovered) {
                card.disable();
            } else {
                card.enable();
            }
        });
    }

    /**
     * 检查两张卡片是否重叠
     * @param {Card} card1 
     * @param {Card} card2 
     * @returns {boolean} 是否重叠
     */
    checkOverlap(card1, card2) {
        const cardSize = 70; // 卡片大小
        const offset = 5; // 允许的重叠偏移量

        return !(card1.x + cardSize - offset <= card2.x ||
                 card1.x + offset >= card2.x + cardSize ||
                 card1.y + cardSize - offset <= card2.y ||
                 card1.y + offset >= card2.y + cardSize);
    }

    /**
     * 获取可点击的卡片
     * @returns {Card[]} 可点击的卡片数组
     */
    getClickabledCards() {
        return this.getAllCards().filter(card => !card.inSlot && !card.isDisabled);
    }
}