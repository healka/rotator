# 🔄 Встраиваемый 360° просмотрщик изображений

Легкий и удобный JavaScript компонент для создания интерактивного 360° просмотра изображений, который можно легко встроить на любой сайт.

## ✨ Возможности

- 🖱️ **Перетаскивание мышью** для поворота изображения
- 📱 **Touch-поддержка** для мобильных устройств
- 🌊 **Инерция** при быстром движении
- 🔍 **Полноэкранный режим**
- ⌨️ **Клавиатурные сокращения** (стрелки, F для полного экрана)
- 🚀 **Предзагрузка изображений** для плавной работы
- 📐 **Адаптивный дизайн**
- 🎯 **Легкое встраивание** одной строкой кода

## 🚀 Быстрый старт

### 1. Подключите скрипт

```html
<script src="https://your-github-pages.com/image360-viewer.js"></script>
```

### 2. Создайте JSON конфигурацию

Создайте файл `images.json`:

```json
{
  "baseUrl": "https://raw.githubusercontent.com/username/repo/main",
  "images": [
    "images/01.jpg",
    "images/02.jpg",
    "images/03.jpg",
    "images/04.jpg",
    "images/05.jpg"
  ]
}
```

### 3. Добавьте элемент на страницу

```html
<div data-image360-viewer data-config="images.json"></div>
```

Готово! 🎉

## 📁 Структура проекта

```
your-repo/
├── image360-viewer.js    # Основной скрипт компонента
├── images.json          # Конфигурация изображений
├── images/              # Папка с изображениями
│   ├── 01.jpg
│   ├── 02.jpg
│   └── ...
└── demo.html           # Демонстрация использования
```

## 🛠️ Использование

### Базовое встраивание

```html
<!-- Простейший способ -->
<div data-image360-viewer></div>

<!-- С указанием конфигурации -->
<div data-image360-viewer data-config="my-images.json"></div>

<!-- С кастомными размерами -->
<div data-image360-viewer data-config="images.json" style="height: 500px;"></div>
```

### Программная инициализация

```javascript
// Автоматическая инициализация всех элементов
initImage360Viewers();

// Ручная инициализация
const container = document.getElementById('my-viewer');
const viewer = new Image360Viewer(container, 'path/to/config.json');
```

### Конфигурация JSON

```json
{
  "baseUrl": "https://your-cdn.com",
  "images": [
    "path/to/image1.jpg",
    "path/to/image2.jpg",
    "relative/path/image3.jpg"
  ]
}
```

**Параметры:**
- `baseUrl` (опционально) - базовый URL для изображений
- `images` - массив путей к изображениям

## 🌐 Размещение на GitHub

### Шаг 1: Подготовка репозитория

1. Создайте репозиторий на GitHub
2. Загрузите файлы:
   - `image360-viewer.js`
   - `images.json` (или несколько JSON файлов)
   - Папку `images/` с изображениями

### Шаг 2: Настройка GitHub Pages

1. Перейдите в Settings репозитория
2. Найдите раздел "Pages"
3. Выберите источник "Deploy from a branch"
4. Выберите ветку `main` и папку `/ (root)`

### Шаг 3: Обновление конфигурации

В файле `images.json` укажите правильный `baseUrl`:

```json
{
  "baseUrl": "https://raw.githubusercontent.com/username/repo-name/main",
  "images": ["images/01.jpg", "images/02.jpg"]
}
```

### Шаг 4: Использование на своем сайте

```html
<script src="https://username.github.io/repo-name/image360-viewer.js"></script>
<div data-image360-viewer data-config="https://username.github.io/repo-name/images.json"></div>
```

## 🎮 Управление

| Действие | Описание |
|----------|----------|
| **Перетаскивание мышью** | Поворот изображения |
| **Touch и свайп** | Поворот на мобильных устройствах |
| **Стрелки ← →** | Переключение изображений |
| **Ctrl/Cmd + F** | Полноэкранный режим |
| **Escape** | Остановка инерции |

## 🎨 Кастомизация стилей

Компонент автоматически добавляет CSS стили, но вы можете их переопределить:

```css
.image360-viewer {
    height: 600px !important;
    border-radius: 20px !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
}

.image360-viewer .controls {
    background: rgba(255,255,255,0.9) !important;
    color: #333 !important;
}
```

## 📱 Адаптивность

Компонент автоматически адаптируется под разные размеры экрана:

- **Desktop**: Полная функциональность
- **Tablet**: Оптимизированные элементы управления
- **Mobile**: Компактный интерфейс, touch-управление

## 🔧 API

### Методы класса Image360Viewer

```javascript
const viewer = new Image360Viewer(container, configPath);

// Управление изображениями
viewer.nextImage();           // Следующее изображение
viewer.previousImage();       // Предыдущее изображение
viewer.goToImage(index);      // Перейти к изображению по индексу

// Полноэкранный режим
viewer.toggleFullscreen();    // Переключить полноэкранный режим

// Инерция
viewer.stopInertia();         // Остановить инерцию
```

### События

```javascript
// Компонент автоматически обрабатывает события:
// - mousedown, mousemove, mouseup
// - touchstart, touchmove, touchend
// - keydown
// - fullscreenchange
```

## 🚨 Требования

- Современный браузер с поддержкой ES6+
- Поддержка `fetch()` API
- Поддержка `requestAnimationFrame()`

## 📄 Лицензия

MIT License - используйте свободно в коммерческих и некоммерческих проектах.

## 🤝 Поддержка

Если у вас есть вопросы или предложения:

1. Откройте Issue в репозитории
2. Создайте Pull Request с улучшениями
3. Поделитесь своими примерами использования

---

**Создано с ❤️ для удобного встраивания 360° просмотрщиков на любые сайты!**

