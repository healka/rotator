/**
 * Image360Viewer - Встраиваемый компонент для 360° просмотра изображений
 * Использование: <div data-image360-viewer data-config="images.json"></div>
 */

class Image360Viewer {
    constructor(container, configPath = 'images.json') {
        this.container = container;
        this.configPath = configPath;
        this.images = [];
        this.currentImageIndex = 0;
        this.isLoading = false;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.sensitivity = 2;
        
        // Для инерции
        this.velocity = 0;
        this.friction = 0.95;
        this.isInertiaActive = false;
        this.velocityHistory = [];
        this.maxVelocityHistory = 5;
        
        this.init();
    }

    async init() {
        this.injectStyles();
        this.createElements();
        this.setupEventListeners();
        await this.loadConfig();
    }

    injectStyles() {
        if (document.getElementById('image360-viewer-styles')) {
            return; // Стили уже загружены
        }

        const styles = `
            .image360-viewer {
                position: relative;
                width: 100%;
                height: 400px;
                border-radius: 10px;
                overflow: hidden;
                background: #f5f5f5;
                cursor: grab;
                user-select: none;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .image360-viewer:active {
                cursor: grabbing;
            }

            .image360-viewer img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
                transition: opacity 0.1s ease;
                pointer-events: none;
                user-select: none;
            }

            .image360-viewer .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #666;
                z-index: 2;
            }

            .image360-viewer .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #007bff;
                border-radius: 50%;
                animation: image360-spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes image360-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .image360-viewer .controls {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                border-radius: 20px;
                padding: 8px 15px;
                display: flex;
                align-items: center;
                gap: 15px;
                color: white;
                font-size: 12px;
                z-index: 3;
            }

            .image360-viewer .fullscreen-btn {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }

            .image360-viewer .fullscreen-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .image360-viewer.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10000;
                border-radius: 0;
            }

            .image360-viewer .error {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #dc3545;
                padding: 20px;
                z-index: 2;
            }

            .image360-viewer .hint {
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 11px;
                opacity: 0.8;
                z-index: 3;
                pointer-events: none;
            }

            /* Адаптивность */
            @media (max-width: 768px) {
                .image360-viewer {
                    height: 250px;
                }
                
                .image360-viewer .controls {
                    bottom: 5px;
                    padding: 6px 12px;
                    font-size: 11px;
                }
                
                .image360-viewer .hint {
                    font-size: 10px;
                    padding: 4px 10px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'image360-viewer-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createElements() {
        this.container.className = 'image360-viewer';
        this.container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка изображений...</p>
            </div>
            <img src="" alt="360° просмотр" style="display: none;">
            <div class="hint">💡 Перетащите для поворота</div>
            <div class="controls">
                <span class="counter">1 / 1</span>
                <button class="fullscreen-btn">🔍 Полный экран</button>
            </div>
        `;

        this.loadingEl = this.container.querySelector('.loading');
        this.imageEl = this.container.querySelector('img');
        this.counterEl = this.container.querySelector('.counter');
        this.fullscreenBtn = this.container.querySelector('.fullscreen-btn');
        this.hintEl = this.container.querySelector('.hint');
    }

    setupEventListeners() {
        // Управление мышью
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        this.container.addEventListener('mousemove', (e) => this.handleDrag(e));
        this.container.addEventListener('mouseup', () => this.endDrag());
        this.container.addEventListener('mouseleave', () => this.endDrag());
        
        // Touch события для мобильных устройств
        this.container.addEventListener('touchstart', (e) => this.startTouch(e));
        this.container.addEventListener('touchmove', (e) => this.handleTouch(e));
        this.container.addEventListener('touchend', () => this.endDrag());
        
        // Полноэкранный режим
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Клавиатурные сокращения (только когда контейнер в фокусе)
        this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.container.setAttribute('tabindex', '0');
        
        // Предотвращение контекстного меню
        this.imageEl.addEventListener('contextmenu', (e) => e.preventDefault());
        this.imageEl.addEventListener('dragstart', (e) => e.preventDefault());
        this.imageEl.addEventListener('selectstart', (e) => e.preventDefault());

        // Скрытие подсказки после первого взаимодействия
        let hintHidden = false;
        const hideHint = () => {
            if (!hintHidden) {
                this.hintEl.style.opacity = '0';
                setTimeout(() => this.hintEl.style.display = 'none', 300);
                hintHidden = true;
            }
        };
        this.container.addEventListener('mousedown', hideHint);
        this.container.addEventListener('touchstart', hideHint);
    }

    async loadConfig() {
        try {
            this.isLoading = true;
            const response = await fetch(this.configPath);
            
            if (!response.ok) {
                throw new Error(`Не удалось загрузить конфигурацию: ${response.status}`);
            }
            
            const config = await response.json();
            
            if (!config.images || !Array.isArray(config.images)) {
                throw new Error('Неверный формат конфигурации: отсутствует массив images');
            }
            
            this.images = config.images;
            this.baseUrl = config.baseUrl || '';
            
            if (this.images.length === 0) {
                throw new Error('Список изображений пуст');
            }
            
            await this.preloadImages();
            this.showViewer();
            
        } catch (error) {
            console.error('Ошибка загрузки конфигурации:', error);
            this.showError(error.message);
        }
        
        this.isLoading = false;
    }

    async preloadImages() {
        // Предзагружаем первые несколько изображений для быстрого старта
        const preloadCount = Math.min(5, this.images.length);
        const promises = [];
        
        for (let i = 0; i < preloadCount; i++) {
            promises.push(this.preloadImage(this.getImageUrl(i)));
        }
        
        await Promise.all(promises);
        
        // Продолжаем загрузку остальных в фоне
        if (this.images.length > preloadCount) {
            setTimeout(() => {
                for (let i = preloadCount; i < this.images.length; i++) {
                    this.preloadImage(this.getImageUrl(i));
                }
            }, 100);
        }
    }

    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
            img.src = src;
        });
    }

    getImageUrl(index) {
        const imagePath = this.images[index];
        return this.baseUrl ? `${this.baseUrl}/${imagePath}` : imagePath;
    }

    showViewer() {
        this.loadingEl.style.display = 'none';
        this.imageEl.style.display = 'block';
        this.displayCurrentImage();
        this.updateCounter();
    }

    showError(message) {
        this.loadingEl.style.display = 'none';
        this.container.innerHTML += `
            <div class="error">
                <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                <h3>Ошибка загрузки</h3>
                <p>${message}</p>
            </div>
        `;
    }

    displayCurrentImage() {
        if (this.images.length === 0) return;
        this.imageEl.src = this.getImageUrl(this.currentImageIndex);
    }

    updateCounter() {
        this.counterEl.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
    }

    nextImage() {
        if (this.images.length === 0) return;
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.displayCurrentImage();
        this.updateCounter();
    }

    previousImage() {
        if (this.images.length === 0) return;
        this.currentImageIndex = this.currentImageIndex === 0 ? 
            this.images.length - 1 : this.currentImageIndex - 1;
        this.displayCurrentImage();
        this.updateCounter();
    }

    goToImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentImageIndex = index;
            this.displayCurrentImage();
            this.updateCounter();
        }
    }

    startDrag(event) {
        if (this.images.length === 0) return;
        
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.velocityHistory = [];
        this.velocity = 0;
        this.isInertiaActive = false;
        
        if (this.inertiaAnimation) {
            cancelAnimationFrame(this.inertiaAnimation);
        }
    }

    handleDrag(event) {
        if (!this.isDragging || this.images.length === 0) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const currentVelocity = deltaX / this.sensitivity;
        
        this.velocityHistory.push(currentVelocity);
        if (this.velocityHistory.length > this.maxVelocityHistory) {
            this.velocityHistory.shift();
        }
        
        const imageStep = Math.abs(deltaX) / this.sensitivity;
        
        if (imageStep >= 1) {
            if (deltaX > 0) {
                this.nextImage();
            } else {
                this.previousImage();
            }
            this.lastMouseX = event.clientX;
        }
    }

    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.startInertia();
    }

    startTouch(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = event.touches[0].clientX;
            this.velocityHistory = [];
            this.velocity = 0;
            this.isInertiaActive = false;
            
            if (this.inertiaAnimation) {
                cancelAnimationFrame(this.inertiaAnimation);
            }
        }
    }

    handleTouch(event) {
        event.preventDefault();
        if (!this.isDragging || event.touches.length !== 1) return;
        
        const deltaX = event.touches[0].clientX - this.lastMouseX;
        const currentVelocity = deltaX / this.sensitivity;
        
        this.velocityHistory.push(currentVelocity);
        if (this.velocityHistory.length > this.maxVelocityHistory) {
            this.velocityHistory.shift();
        }
        
        const imageStep = Math.abs(deltaX) / this.sensitivity;
        
        if (imageStep >= 1) {
            if (deltaX > 0) {
                this.nextImage();
            } else {
                this.previousImage();
            }
            this.lastMouseX = event.touches[0].clientX;
        }
    }

    startInertia() {
        if (this.velocityHistory.length === 0) return;
        
        const avgVelocity = this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;
        
        if (Math.abs(avgVelocity) > 0.5) {
            this.velocity = avgVelocity;
            this.isInertiaActive = true;
            this.animateInertia();
        }
    }

    animateInertia() {
        if (!this.isInertiaActive || Math.abs(this.velocity) < 0.1) {
            this.isInertiaActive = false;
            return;
        }

        if (Math.abs(this.velocity) >= 1) {
            if (this.velocity > 0) {
                this.nextImage();
            } else {
                this.previousImage();
            }
        }

        this.velocity *= this.friction;
        this.inertiaAnimation = requestAnimationFrame(() => this.animateInertia());
    }

    stopInertia() {
        this.isInertiaActive = false;
        this.velocity = 0;
        if (this.inertiaAnimation) {
            cancelAnimationFrame(this.inertiaAnimation);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().then(() => {
                this.container.classList.add('fullscreen');
                this.fullscreenBtn.textContent = '🔍 Выход';
            }).catch(err => {
                console.error('Ошибка входа в полноэкранный режим:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.container.classList.remove('fullscreen');
                this.fullscreenBtn.textContent = '🔍 Полный экран';
            });
        }
    }

    handleKeydown(event) {
        if (this.images.length === 0) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.stopInertia();
                this.previousImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.stopInertia();
                this.nextImage();
                break;
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case 'Escape':
                if (this.isInertiaActive) {
                    this.stopInertia();
                }
                break;
        }
    }
}

// Автоматическая инициализация при загрузке DOM
function initImage360Viewers() {
    const containers = document.querySelectorAll('[data-image360-viewer]');
    
    containers.forEach(container => {
        if (container.image360ViewerInstance) {
            return; // Уже инициализирован
        }
        
        const configPath = container.dataset.config || 'images.json';
        container.image360ViewerInstance = new Image360Viewer(container, configPath);
    });
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImage360Viewers);
} else {
    initImage360Viewers();
}

// Обработка изменений в fullscreen
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const fullscreenViewers = document.querySelectorAll('.image360-viewer.fullscreen');
        fullscreenViewers.forEach(viewer => {
            viewer.classList.remove('fullscreen');
            const btn = viewer.querySelector('.fullscreen-btn');
            if (btn) {
                btn.textContent = '🔍 Полный экран';
            }
        });
    }
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Image360Viewer;
}

// Глобальная функция для ручной инициализации
window.Image360Viewer = Image360Viewer;
window.initImage360Viewers = initImage360Viewers;

