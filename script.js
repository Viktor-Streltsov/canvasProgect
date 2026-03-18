let canvas;

let currentLang = 'ru';
let currentTheme = 'light';

let currentIconColor = '#4a90e2';
let currentBackgroundColor = '#666';

const STORAGE_KEYS = {
    theme: 'canvasProgectTheme',
    lang: 'canvasProgectLang'
};

const I18N = {
    ru: {
        documentTitle: 'CPB test task shopify dev departement',
        appTitle: 'CPB test task shopify dev departement',
        bgTitle: 'ФОН',
        bgColorLabel: 'Цвет фигур фона',
        iconsTitle: 'ИКОНКИ',
        iconColorLabel: 'Цвет иконок',
        exportTitle: 'ЭКСПОРТ',
        scaleLabel: 'Масштаб:',
        deleteBtn: 'Удалить выбранное',
        clearBtn: 'Очистить холст',
        duplicateBtn: 'Дублировать',
        infoText: 'Фон меняется только тип и цвет. Иконки можно перемещать, вращать, удалять (Del), дублировать (Ctrl+D).',
        themeLight: 'Светлая',
        themeDark: 'Тёмная'
    },
    en: {
        documentTitle: 'CPB test task shopify dev departement',
        appTitle: 'CPB test task shopify dev departement',
        bgTitle: 'BACKGROUND',
        bgColorLabel: 'Background shape color',
        iconsTitle: 'ICONS',
        iconColorLabel: 'Icon color',
        exportTitle: 'EXPORT',
        scaleLabel: 'Scale:',
        deleteBtn: 'Delete selected',
        clearBtn: 'Clear canvas',
        duplicateBtn: 'Duplicate',
        infoText: 'Background changes only type and color. Icons can be moved, rotated, deleted (Del), duplicated (Ctrl+D).',
        themeLight: 'Light',
        themeDark: 'Dark'
    }
};

function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEYS.lang);
    if (saved === 'en' || saved === 'ru') return saved;
    return 'ru';
}

function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setLangActiveButtons(lang) {
    const enBtn = document.getElementById('langEnBtn');
    const ruBtn = document.getElementById('langRuBtn');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
    if (ruBtn) ruBtn.classList.toggle('active', lang === 'ru');
}

function updateThemeToggleLabel() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const t = I18N[currentLang] || I18N.ru;
    btn.textContent = currentTheme === 'dark' ? t.themeLight : t.themeDark;
}

function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'ru';
    const t = I18N[currentLang] || I18N.ru;

    document.documentElement.lang = currentLang;
    document.title = t.documentTitle;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        if (t[key] !== undefined) el.textContent = t[key];
    });

    setLangActiveButtons(currentLang);
    updateThemeToggleLabel();
}

function syncThemeToCanvas() {
    if (!canvas) return;

    const canvasBg = getCssVar('--canvas-bg');
    const shapeStroke = getCssVar('--shape-stroke');

    canvas.backgroundColor = canvasBg;
    canvas.getObjects().forEach(obj => {
        // Фоновые фигуры имеют stroke (обводку)
        if (obj && obj.stroke && obj.strokeWidth > 0) {
            obj.set('stroke', shapeStroke);
        }
    });

    canvas.renderAll();
}

function applyTheme(theme) {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('theme-dark', currentTheme === 'dark');

    localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
    updateThemeToggleLabel();
    syncThemeToCanvas();
}

function initCanvas() {
    canvas = new fabric.Canvas('fabricCanvas', {
        backgroundColor: getCssVar('--canvas-bg'),
        selection: true
    });

    syncThemeToCanvas();
}

function setupHeaderControls() {
    const enBtn = document.getElementById('langEnBtn');
    const ruBtn = document.getElementById('langRuBtn');
    const themeBtn = document.getElementById('themeToggleBtn');

    if (enBtn) {
        enBtn.addEventListener('click', () => applyLanguage('en'));
    }
    if (ruBtn) {
        ruBtn.addEventListener('click', () => applyLanguage('ru'));
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
}

// Обработчик выбора цвета иконок
function setupIconColorPicker() {
    const iconColorPicker = document.getElementById('iconColorPicker');
    
    if (iconColorPicker) {
        iconColorPicker.addEventListener('change', function() {
            console.log('Изменен цвет иконки:', this.value);
            currentIconColor = this.value;
            
            // Если есть выбранный объект, меняем его цвет
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', currentIconColor);
                canvas.renderAll();
            }
        });
        
        // Устанавливаем начальный цвет
        currentIconColor = iconColorPicker.value;
    }
}

// Обработчик выбора цвета фона
function setupBackgroundColorPicker() {
    const bgColorPicker = document.getElementById('bgColorPicker');
    
    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', function() {
            console.log('Изменен цвет фоновых фигур:', this.value);
            currentBackgroundColor = this.value;
            
            // Если есть выбранный объект, меняем его цвет
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', currentBackgroundColor);
                canvas.renderAll();
            }
        });
        
        // Устанавливаем начальный цвет
        currentBackgroundColor = bgColorPicker.value;
    }
}

// Обработчик выбора фигуры фона
function setupBackgroundShapeButtons() {
    const buttons = document.querySelectorAll('.bg-shape-btn');
    console.log('Найдено кнопок фона:', buttons.length);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Клик по фигуре фона:', this.dataset.shape);
            // Убираем активный класс у всех
            document.querySelectorAll('.bg-shape-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущему
            this.classList.add('active');
            
            const shape = this.dataset.shape;
            addBackgroundShape(shape);
        });
    });
}

// Обработчик выбора иконки
function setupShapeButtons() {
    const buttons = document.querySelectorAll('.shape-btn');
    console.log('Найдено кнопок иконок:', buttons.length);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Клик по иконке:', this.dataset.shape);
            // Убираем активный класс у всех
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущему
            this.classList.add('active');
            
            const shape = this.dataset.shape;
            addShape(shape);
        });
    });
}

// Функция добавления фоновой фигуры
function addBackgroundShape(shapeType) {
    let newObject;
    const x = 300;
    const y = 200;

    switch(shapeType) {
        case 'circle':
            newObject = new fabric.Circle({
                radius: 80,
                fill: currentBackgroundColor,
                stroke: getCssVar('--shape-stroke'),
                strokeWidth: 2,
                left: x,
                top: y,
                selectable: true
            });
            break;
        case 'square':
            newObject = new fabric.Rect({
                width: 160,
                height: 160,
                fill: currentBackgroundColor,
                stroke: getCssVar('--shape-stroke'),
                strokeWidth: 2,
                left: x,
                top: y,
                selectable: true
            });
            break;
        case 'triangle':
            newObject = new fabric.Triangle({
                width: 160,
                height: 160,
                fill: currentBackgroundColor,
                stroke: getCssVar('--shape-stroke'),
                strokeWidth: 2,
                left: x,
                top: y,
                selectable: true
            });
            break;
    }

    if (newObject) {
        canvas.add(newObject);
        canvas.setActiveObject(newObject);
        canvas.renderAll();
    }
}

// Функция добавления иконки
function addShape(shapeType) {
    let newObject;
    const x = Math.random() * 400 + 100;
    const y = Math.random() * 200 + 100;

    switch(shapeType) {
        case 'star':
            newObject = new fabric.Text('★', {
                fontSize: 50,
                fill: currentIconColor,
                left: x,
                top: y,
                fontFamily: 'Arial'
            });
            break;
        case 'umbrella':
            newObject = new fabric.Text('☂', {
                fontSize: 50,
                fill: currentIconColor,
                left: x,
                top: y,
                fontFamily: 'Arial'
            });
            break;
        case 'triangle':
            newObject = new fabric.Triangle({
                width: 60,
                height: 60,
                fill: currentIconColor,
                left: x,
                top: y
            });
            break;
    }

    if (newObject) {
        canvas.add(newObject);
        canvas.setActiveObject(newObject);
        canvas.renderAll();
    }
}

// Настройка событий холста
function setupCanvasEvents() {
    // Обработчик изменения выбранного объекта
    canvas.on('selection:created', function(e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.fill) {
            // Определяем тип объекта и обновляем соответствующий picker
            if (isFabricShape(activeObject)) {
                // Это фоновая фигура (имеет stroke)
                const bgColorPicker = document.getElementById('bgColorPicker');
                if (bgColorPicker && activeObject.stroke) {
                    bgColorPicker.value = activeObject.fill;
                    currentBackgroundColor = activeObject.fill;
                }
            } else {
                // Это иконка
                const iconColorPicker = document.getElementById('iconColorPicker');
                if (iconColorPicker) {
                    iconColorPicker.value = activeObject.fill;
                    currentIconColor = activeObject.fill;
                }
            }
        }
    });

    canvas.on('selection:updated', function(e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.fill) {
            // Определяем тип объекта и обновляем соответствующий picker
            if (isFabricShape(activeObject)) {
                // Это фоновая фигура (имеет stroke)
                const bgColorPicker = document.getElementById('bgColorPicker');
                if (bgColorPicker && activeObject.stroke) {
                    bgColorPicker.value = activeObject.fill;
                    currentBackgroundColor = activeObject.fill;
                }
            } else {
                // Это иконка
                const iconColorPicker = document.getElementById('iconColorPicker');
                if (iconColorPicker) {
                    iconColorPicker.value = activeObject.fill;
                    currentIconColor = activeObject.fill;
                }
            }
        }
    });
}

// Функция для определения фоновой фигуры
function isFabricShape(object) {
    // Фоновые фигуры имеют stroke (обводку)
    return object.stroke && object.strokeWidth > 0;
}

// Функция масштабирования холста
function scaleCanvas(scale) {
    const zoom = parseFloat(scale);
    canvas.setZoom(zoom);
    canvas.renderAll();
}

// Настройка слайдера масштаба
function setupScaleSlider() {
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    
    scaleSlider.addEventListener('input', function() {
        scaleValue.textContent = this.value;
        scaleCanvas(this.value);
    });
}

// Функция экспорта
function exportCanvas(format) {
    const scale = parseFloat(document.getElementById('scaleSlider').value);
    
    if (format === 'png') {
        const dataURL = canvas.toDataURL({
            format: 'image/png',
            multiplier: scale,
            quality: 1
        });
        downloadImage(dataURL, 'canvas-export.png');
    } else if (format === 'svg') {
        const svg = canvas.toSVG({
            multiplier: scale
        });
        downloadSVG(svg, 'canvas-export.svg');
    }
}

// Функция скачивания изображения
function downloadImage(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Функция скачивания SVG
function downloadSVG(svg, filename) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Функции управления
function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
    }
}

function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = getCssVar('--canvas-bg');
    canvas.renderAll();
}

function duplicateSelected() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.clone(function(cloned) {
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
        });
    }
}

// Настройка горячих клавиш
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            deleteSelected();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            duplicateSelected();
        } 
    });
}

function init() {
    currentLang = getInitialLang();
    applyLanguage(currentLang);

    currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    initCanvas();
    setupHeaderControls();

    setupIconColorPicker();
    setupBackgroundColorPicker();
    setupBackgroundShapeButtons();
    setupShapeButtons();
    setupScaleSlider();
    setupKeyboardControls();
    setupCanvasEvents();
}

document.addEventListener('DOMContentLoaded', init);