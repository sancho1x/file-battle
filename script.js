document.addEventListener('DOMContentLoaded', () => {
    // --- UI Елементи ---
    const fileInput = document.getElementById('fileInput');
    const addFilesBtn = document.getElementById('addFilesBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const filePoolList = document.getElementById('filePoolList');
    const poolCountSpan = document.getElementById('poolCount');
    const startBattleBtn = document.getElementById('startBattleBtn');
    const resetBattleBtn = document.getElementById('resetBattleBtn');
    const poolMessageDiv = document.getElementById('poolMessage');
    const controlsSection = document.getElementById('controlsSection');
    const poolSection = document.getElementById('poolSection');
    const battleStatusDiv = document.getElementById('battleStatus');
    const statusHeader = document.getElementById('statusHeader');
    const roundInfoSpan = document.getElementById('roundInfo');
    const matchInfoSpan = document.getElementById('matchInfo');
    const byeInfoSpan = document.getElementById('byeInfo');
    const battleArea = document.getElementById('battleArea');
    const mediaContainer1 = document.getElementById('media1');
    const mediaContainer2 = document.getElementById('media2');
    const contestantName1 = document.querySelector('#contestant1 .contestant-name');
    const contestantName2 = document.querySelector('#contestant2 .contestant-name');
    const voteButtons = document.querySelectorAll('.vote-btn');
    const resultsArea = document.getElementById('resultsArea');
    const resultsHeader = document.getElementById('resultsHeader');
    const winnerDisplay = document.getElementById('winnerDisplay');
    const bracketContainer = document.getElementById('bracketContainer');
    const bracketView = document.getElementById('bracketView');
    const themeSelector = document.getElementById('themeSelector');
    const battleTitleInput = document.getElementById('battleTitleInput');
    const battlePhaseVotingBlock = document.getElementById('battlePhaseVoting'); // <--- ДОДАНО ПОСИЛАННЯ НА БЛОК
    const startVotingBtn = document.getElementById('startVotingBtn');           // <--- ДОДАНО ПОСИЛАННЯ НА КНОПКУ
    const voteDisplay1 = document.getElementById('voteDisplay1');               // <--- ДОДАНО ПОСИЛАННЯ НА ДИСПЛЕЙ 1
    const voteDisplay2 = document.getElementById('voteDisplay2');               // <--- ДОДАНО ПОСИЛАННЯ НА ДИСПЛЕЙ 2
	const votingModeToggle = document.getElementById('votingModeToggle');
    const twitchConfigSection = document.getElementById('twitchConfigSection');
    const twitchChannelInput = document.getElementById('twitchChannelInput');
    const twitchConfirmBtn = document.getElementById('twitchConfirmBtn');
    const twitchStatusSpan = document.getElementById('twitchStatus');
	const votingDurationSelect = document.getElementById('votingDurationSelect'); // <-- ДОДАНО ЦЕЙ РЯДОК
	const voteFormatSection = document.getElementById('voteFormatSection'); // Контейнер для селекту
    const voteFormatSelector = document.getElementById('voteFormatSelector'); // Сам селект
	const coinFlipSection = document.getElementById('coinFlipSection');
	const coinFlipOverlay = document.getElementById('coinFlipOverlay'); // <-- ДОДАЙТЕ ЦЕ
    const coinFlipModal = document.getElementById('coinFlipModal');     // <-- ДОДАЙТЕ ЦЕ
    const coinElement = document.getElementById('coin');
    const coinImage1 = document.getElementById('coinImage1');
    const coinImage2 = document.getElementById('coinImage2');
    const flipCoinBtn = document.getElementById('flipCoinBtn');
    const coinResultMessage = document.getElementById('coinResultMessage');
	const participantModeToggle = document.getElementById('participantModeToggle');
	const mediaModeLabel = document.getElementById('mediaModeLabel');
	const textModeLabel = document.getElementById('textModeLabel');
	const mediaInputsContainer = document.getElementById('mediaInputsContainer');
	const textInputsContainer = document.getElementById('textInputsContainer');
	const textFileInput = document.getElementById('textFileInput');
	const backgroundImageInput = document.getElementById('backgroundImageInput');
	const loadTextParticipantsBtn = document.getElementById('loadTextParticipantsBtn');
	const LOCAL_FALLBACK_IMAGE_1 = 'media/coin_images/default_1.png'; // Шлях до дефолтного зображення 1
	const LOCAL_FALLBACK_IMAGE_2 = 'media/coin_images/default_1.png'; // Шлях до дефолтного зображення 2

    // --- Стан Батлу ---
    let initialFilePool = [];
    let battleHistory = [];
    let currentRoundParticipants = [];
    let nextRoundParticipants = [];
    let currentMatchup = [];
    let currentRound = 0;
    let currentMatchupIndex = 0;
    let totalMatchupsInRound = 0;
    let isBattleRunning = false;
    let battleWinner = null;
	let currentVotingMode = 'manual'; // 'manual' або 'twitch'
    let currentTwitchChannel = '';    // Зберігатиме поточний підключений канал
    let twitchConnected = false;     // Статус підключення
	let isLoadingSettings = false; // <--- ДОДАНО ПРАПОРЕЦЬ
	let votingTimerIntervalId = null; // <-- ДОДАНО: для ID таймера
    let isVotingActive = false;       // <-- ДОДАНО: для стану голосування
    let selectedVotingDuration = 0; // <-- ДОДАНО: для збереження обраної тривалості (в секундах)
	let currentVoteFormat = 'strict'; // Можливі значення: 'strict', 'simple', 'both'. За замовчуванням 'strict'
	let isCoinFlipping = false;
    let coinSide1Url = 'media/1_default.png'; // Дефолтне значення
    let coinSide2Url = 'media/2_default.png'; // Дефолтне значення
	let currentParticipantMode = 'media';

    // --- Ініціалізація ---
    loadSettings();
    updateAddFilesButtonState();
    checkPoolState();

    // --- Обробники Подій ---
	if (participantModeToggle) {
    participantModeToggle.addEventListener('change', handleParticipantModeChange);
    // Додамо кліки на лейбли для зручності
    mediaModeLabel?.addEventListener('click', () => {
        if (participantModeToggle.checked) {
            participantModeToggle.checked = false;
            participantModeToggle.dispatchEvent(new Event('change'));
        }
    });
    textModeLabel?.addEventListener('click', () => {
         if (!participantModeToggle.checked) {
             participantModeToggle.checked = true;
             participantModeToggle.dispatchEvent(new Event('change'));
         }
    });
}

if (textFileInput) {
    textFileInput.addEventListener('change', updateLoadTextButtonState);
}
if (backgroundImageInput) {
    backgroundImageInput.addEventListener('change', updateLoadTextButtonState);
}
if (loadTextParticipantsBtn) {
    loadTextParticipantsBtn.addEventListener('click', handleLoadTextParticipants);
}
	if (flipCoinBtn) {
        flipCoinBtn.addEventListener('click', handleCoinFlipButtonClick);
    }
	if (votingModeToggle) {
        votingModeToggle.addEventListener('change', handleVotingModeChange);
    }
    if (twitchConfirmBtn) {
        twitchConfirmBtn.addEventListener('click', handleTwitchConfirmClick);
    }
	if (startVotingBtn) {
        startVotingBtn.addEventListener('click', handleStartVotingClick); // Обробник кліку на кнопку "Почати голосування"
    }
	    if (voteFormatSelector) { // Перевірка, чи елемент існує
        voteFormatSelector.addEventListener('change', (event) => {
            // 1. Оновлюємо змінну стану поточним значенням селекту
            currentVoteFormat = event.target.value;
            console.log(`Обраний формат голосування: ${currentVoteFormat}`);

            // 2. Оновлюємо налаштування формату в клієнті Twitch (якщо він існує і має метод)
            if (twitch && typeof twitch.setVoteFormat === 'function') {
                twitch.setVoteFormat(currentVoteFormat);
            }

            // 3. Зберігаємо нове налаштування в localStorage
            saveSettings();
        });
    }
	    if (coinFlipOverlay) {
        coinFlipOverlay.addEventListener('click', (event) => {
            // Перевіряємо, чи клік стався саме по оверлею, а не по дочірньому елементу всередині модального вікна
            if (event.target === coinFlipOverlay) {
                console.log("Клік по оверлею, ховаємо модальне вікно монетки.");
                hideCoinFlipUI(); // Викликаємо вашу функцію для приховування
            }
        });
         console.log("Обробник кліку на оверлей монетки додано.");
    } else {
         console.warn("Елемент #coinFlipOverlay не знайдено, неможливо додати обробник кліку для закриття.");
    }
    if (votingDurationSelect) { // <-- ПОЧАТОК НОВОГО ОБРОБНИКА
        votingDurationSelect.addEventListener('change', (event) => {
            // Зберігаємо обране значення (в секундах)
            selectedVotingDuration = parseInt(event.target.value, 10);
            console.log(`Обрана тривалість голосування: ${selectedVotingDuration} секунд`);
            // Примітка: Ми не зберігаємо це в localStorage, щоб воно
            // автоматично скидалося при запуску абсолютно нового батлу,
            // але зберігалося між раундами поточного батлу.
        });
    }
    fileInput.addEventListener('change', updateAddFilesButtonState);
    addFilesBtn.addEventListener('click', handleAddFilesClick);
    clearAllBtn.addEventListener('click', handleClearAllClick);
    filePoolList.addEventListener('click', handleFilePoolListClick);
    startBattleBtn.addEventListener('click', startBattle);
    resetBattleBtn.addEventListener('click', resetToInitialState); // Змінено на reset, логічніше
    themeSelector.addEventListener('change', (event) => {
        applyTheme(event.target.value);
        saveSettings();
    });
    battleTitleInput.addEventListener('input', saveSettings);
    voteButtons.forEach(button => {
        button.addEventListener('click', handleVoteButtonClick);
    });

    // --- Функції ---
function handleParticipantModeChange(event) {
    const isTextMode = event.target.checked;
    console.log(`Switching participant mode to: ${isTextMode ? 'Text' : 'Media'}`);

    if (isTextMode) {
        currentParticipantMode = 'text';
        mediaInputsContainer?.classList.add('hidden');
        textInputsContainer?.classList.remove('hidden');
        mediaModeLabel?.classList.remove('active');
        textModeLabel?.classList.add('active');
        // Очистити пул, якщо він не порожній, бо режими несумісні
        if (initialFilePool.length > 0) {
             // Можна запитати підтвердження
             // if (confirm('Перехід в текстовий режим очистить поточний пул медіа-файлів. Продовжити?')) {
             //     initialFilePool = [];
             //     renderFilePoolList();
             // } else {
             //     // Скасувати зміну режиму
             //     event.target.checked = false;
             //     handleParticipantModeChange({ target: { checked: false } }); // Викликати рекурсивно зі старим значенням
             //     return;
             // }
             // Або просто очищати:
             console.log("Clearing media pool due to switching to Text mode.");
             initialFilePool = [];
             renderFilePoolList(); // Оновлює UI пулу та кнопок
        }
        // Скинути значення медіа інпутів
        if(fileInput) fileInput.value = '';
        updateAddFilesButtonState(); // Оновити стан медіа кнопки
        updateLoadTextButtonState(); // Оновити стан текстової кнопки

    } else {
        currentParticipantMode = 'media';
        mediaInputsContainer?.classList.remove('hidden');
        textInputsContainer?.classList.add('hidden');
        mediaModeLabel?.classList.add('active');
        textModeLabel?.classList.remove('active');
        // Очистити пул, якщо він не порожній
         if (initialFilePool.length > 0) {
             // По аналогії з переходом в Text
             console.log("Clearing text pool due to switching to Media mode.");
             initialFilePool = [];
             renderFilePoolList();
         }
        // Скинути значення текстових інпутів
        if(textFileInput) textFileInput.value = '';
        if(backgroundImageInput) backgroundImageInput.value = '';
        updateLoadTextButtonState(); // Оновити стан текстової кнопки
        updateAddFilesButtonState(); // Оновити стан медіа кнопки
    }
    // Перевірити стан пулу (особливо важливо для кнопки Start Battle)
    checkPoolState();
}

/**
 * Оновлює стан кнопки "Завантажити текстових учасників".
 */
function updateLoadTextButtonState() {
    if (!loadTextParticipantsBtn) return;
    const textFileSelected = textFileInput && textFileInput.files && textFileInput.files.length > 0;
    const imageFileSelected = backgroundImageInput && backgroundImageInput.files && backgroundImageInput.files.length > 0;
    loadTextParticipantsBtn.disabled = !(textFileSelected && imageFileSelected);
}
/**
 * Обробляє завантаження текстового файлу та фону, валідує їх та запускає генерацію.
 */
async function handleLoadTextParticipants() {
    if (currentParticipantMode !== 'text' || !textFileInput?.files?.[0] || !backgroundImageInput?.files?.[0]) {
        updateLoadTextButtonState(); // На випадок, якщо файли прибрали
        return;
    }

    const txtFile = textFileInput.files[0];
    const imgFile = backgroundImageInput.files[0];

    // Деактивуємо кнопку на час обробки
    if(loadTextParticipantsBtn) loadTextParticipantsBtn.disabled = true;
    if(clearAllBtn) clearAllBtn.disabled = true; // І кнопку очищення

    try {
        // 1. Читаємо та валідуємо зображення
        const bgImageUrl = await readFileAsDataURL(imgFile);
        await validateBackgroundImage(bgImageUrl); // Перевіряє 16:9

        // 2. Читаємо та валідуємо текстовий файл
        const textContent = await readFileAsText(txtFile);
        const textLines = textContent.split('\n')
                                  .map(line => line.trim()) // Обрізаємо пробіли по краях
                                  .filter(line => line.length > 0); // Видаляємо порожні рядки

        // Валідація кількості та довжини рядків
        const MAX_CHARS_PER_LINE = 500; // Налаштуй за потреби
        const validationError = validateTextLines(textLines, MAX_CHARS_PER_LINE);
        if (validationError) {
            showPoolMessage(validationError, 'error');
            throw new Error(validationError); // Перериваємо виконання
        }

        // 3. Попередження про 'bye' (якщо потрібно)
        checkPowerOfTwoWarning(textLines.length);

        // 4. Запускаємо генерацію зображень для кожного рядка
        showPoolMessage("Генерація учасників...", "info"); // Інформуємо користувача

        const generationPromises = textLines.map(line =>
            generateTextImage(bgImageUrl, line)
        );
        const generatedDataUrls = await Promise.all(generationPromises);

        // 5. Формуємо новий пул учасників
        const newParticipants = textLines.map((line, index) => ({
            id: Date.now() + Math.random().toString(16).slice(2) + index,
            name: line, // Назва - це сам рядок тексту
            type: 'image/png', // Або jpeg, залежно від canvas.toDataURL
            dataUrl: generatedDataUrls[index],
            isTextParticipant: true // Додаємо прапорець!
        }));

        // 6. Оновлюємо стан та UI
        initialFilePool = newParticipants;
        renderFilePoolList(); // Це викличе checkPoolState всередині
        showPoolMessage("Текстові учасники успішно завантажені!", "info"); // Успіх
        // Очистити поля вибору файлів
        textFileInput.value = '';
        backgroundImageInput.value = '';

    } catch (error) {
        console.error("Error loading text participants:", error);
        // showPoolMessage вже міг бути викликаний з конкретною помилкою валідації
        if (!poolMessageDiv?.textContent || poolMessageDiv.classList.contains('hidden')) {
             showPoolMessage(`Помилка: ${error.message || 'Не вдалося завантажити учасників.'}`, 'error');
        }
        // Скидаємо пул, якщо щось пішло не так
        initialFilePool = [];
        renderFilePoolList();
    } finally {
        // Повертаємо активність кнопок (навіть при помилці)
        updateLoadTextButtonState(); // Перевірить, чи обрані файли (має скинутись)
        if(clearAllBtn) clearAllBtn.disabled = (initialFilePool.length === 0);
    }
}

// --- Допоміжні функції для читання файлів ---
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(new Error(`FileReader error: ${error}`));
        reader.readAsDataURL(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(new Error(`FileReader error: ${error}`));
        reader.readAsText(file);
    });
}

// --- Допоміжні функції для валідації ---
async function validateBackgroundImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const targetRatio = 16 / 9;
            const tolerance = 0.02; // Допустима похибка
            if (Math.abs(aspectRatio - targetRatio) < tolerance) {
                console.log(`Image validated: <span class="math-inline">\{img\.naturalWidth\}x</span>{img.naturalHeight} (Ratio: ${aspectRatio.toFixed(2)})`);
                resolve();
            } else {
                reject(new Error(`Невірне співвідношення сторін фонового зображення. Очікується 16:9, отримано ~${aspectRatio.toFixed(2)}.`));
            }
        };
        img.onerror = () => reject(new Error("Не вдалося завантажити фонове зображення для перевірки."));
        img.src = imageUrl;
    });
}

function validateTextLines(lines, maxChars) {
    const n = lines.length;
    if (n < 2) {
        return "Текстовий файл повинен містити щонайменше 2 непорожніх рядки.";
    }
    if (n % 2 !== 0) {
        return `Помилка: Кількість учасників (${n}) повинна бути ПАРНОЮ!`;
    }
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > maxChars) {
            return `Помилка: Рядок ${i + 1} містить більше <span class="math-inline">\{maxChars\} символів \("</span>{lines[i].substring(0, 30)}...").`;
        }
    }
    return null; // Немає помилок
}

 function checkPowerOfTwoWarning(n) {
     const isPowerOfTwo = (n > 0) && ((n & (n - 1)) === 0);
     if (n >= 2 && n % 2 === 0 && !isPowerOfTwo) {
         const message = `Увага: Кількість учасників (${n}) не є ступенем двійки (2, 4, 8...). Деякі учасники отримають автоматичний прохід ('bye') в першому раунді.`;
         showPoolMessage(message, "warning");
     } else if (poolMessageDiv && poolMessageDiv.classList.contains('warning-message') && !poolMessageDiv.textContent.startsWith('Увага')) {
        // Якщо було якесь інше попередження, а тепер все добре, ховаємо його
         showPoolMessage("", "hidden");
     } else if (!poolMessageDiv?.classList.contains('error-message')) {
         // Якщо не було помилки і не треба попередження про 'bye', ховаємо повідомлення (якщо воно було)
          showPoolMessage("", "hidden");
     }
     // Не ховаємо, якщо там вже є помилка або попередження про 'bye'
 }
/**
 * Генерує зображення з текстом на фоні.
 * @param {string} backgroundImageUrl - Data URL фонового зображення (вже валідованого 16:9).
 * @param {string} textLine - Рядок тексту для накладання.
 * @returns {Promise<string>} - Promise, що повертає Data URL згенерованого зображення (image/png).
 */
async function generateTextImage(backgroundImageUrl, textLine) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            try {
                // --- Налаштування Canvas ---
                // Використовуємо розміри завантаженого фону або фіксовані 16:9
                const canvasWidth = img.naturalWidth > 1920 ? 1920 : img.naturalWidth; // Обмежимо ширину
                const canvasHeight = canvasWidth / (16 / 9);
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // 1. Малюємо фон
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // 2. Налаштовуємо текст
                const maxTextWidth = canvas.width * 0.85; // Текст займає 85% ширини
                const maxTextHeight = canvas.height * 0.8; // і 80% висоти
                const paddingY = canvas.height * 0.1;
                const paddingX = canvas.width * 0.075;

                // --- Вибір розміру шрифту (ступінчастий варіант) ---
                let baseFontSize = canvas.height * 0.1; // Початковий розмір (10% від висоти)
                const len = textLine.length;
                if (len > 300) {
                     baseFontSize = canvas.height * 0.05; // Дрібний
                } else if (len > 100) {
                     baseFontSize = canvas.height * 0.07; // Середній
                } else if (len > 50) {
                     baseFontSize = canvas.height * 0.09; // Трохи менший
                }
                // Можна додати ще градацій

                ctx.font = `bold ${baseFontSize}px Arial, sans-serif`; // Налаштуй шрифт
                ctx.fillStyle = 'white'; // Колір тексту
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Додамо тінь для кращої читабельності
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = canvas.height * 0.015; // Розмір тіні залежить від розміру канви
                ctx.shadowOffsetX = canvas.width * 0.005;
                ctx.shadowOffsetY = canvas.width * 0.005;


                // 3. Розбиваємо текст на рядки, якщо він не влазить по ширині
                // Функція для розбивки (можна винести окремо)
                function wrapText(context, text, x, y, maxWidth, lineHeight) {
                    const words = text.split(' ');
                    let line = '';
                    let lines = [];

                    for(let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = context.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            lines.push(line.trim());
                            line = words[n] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line.trim());

                     // Перевірка чи не вилазить по висоті
                     if (lines.length * lineHeight > maxTextHeight) {
                         // Текст занадто довгий, навіть після розбивки.
                         // Можна зменшити шрифт і спробувати ще раз, або обрізати.
                         // Поки що просто виведемо як є, може вилізти.
                         console.warn("Wrapped text might exceed max height for:", text);
                     }

                     // Розрахунок початкової Y позиції для центрування блоку тексту
                     const totalTextHeight = lines.length * lineHeight;
                     let currentY = y - (totalTextHeight / 2) + (lineHeight / 2); // Починаємо зверху центру

                     // Малюємо рядки
                     lines.forEach(singleLine => {
                        if (currentY > paddingY + maxTextHeight) return; // Не малювати якщо вийшли за межі
                        context.fillText(singleLine, x, currentY);
                        currentY += lineHeight;
                     });
                }

                // Викликаємо розбивку та малювання
                 const lineHeight = baseFontSize * 1.2; // Міжрядковий інтервал
                wrapText(ctx, textLine, canvas.width / 2, canvas.height / 2, maxTextWidth, lineHeight);


                // 4. Конвертуємо в Data URL
                 // Важливо: Переконайся, що браузер підтримує toDataURL для великих зображень
                resolve(canvas.toDataURL('image/png'));

            } catch (e) {
                 console.error("Canvas drawing error:", e);
                 reject(new Error(`Помилка генерації зображення для тексту: "${textLine.substring(0,30)}..."`));
            }
        };
        img.onerror = () => reject(new Error("Не вдалося завантажити фонове зображення для генерації."));
        img.src = backgroundImageUrl;
    });
}

/**
 * Встановлює URL зображень для монетки,
 * намагаючись використовувати кастомні на основі нікнейму,
 * або дефолтні, якщо кастомні не існують.
 * @param {string} nickname - Нікнейм каналу Twitch.
 */
function fetchCoinImages(nickname) { // Тепер ця функція синхронна, бо не робить await запитів
    console.log(`Спроба завантажити зображення монетки для: ${nickname}`);

    // Базові шляхи
    const baseUrl = 'media/coin_images/';
    const defaultSide1 = baseUrl + 'default_1.png';
    const defaultSide2 = baseUrl + 'default_2.png';

    let potentialCustomSide1 = null;
    let potentialCustomSide2 = null;

    if (nickname && typeof nickname === 'string' && nickname.trim() !== '') {
        const cleanNickname = nickname.trim().toLowerCase();
        potentialCustomSide1 = `<span class="math-inline">\{baseUrl\}</span>{cleanNickname}_1.png`;
        potentialCustomSide2 = `<span class="math-inline">\{baseUrl\}</span>{cleanNickname}_2.png`;
        console.log(`Потенційні кастомні шляхи: ${potentialCustomSide1}, ${potentialCustomSide2}`);
    } else {
        console.log("Нікнейм не вказано, використовуються дефолтні зображення.");
    }

    // Логіка вибору шляхів
    // Ми завжди будемо намагатися встановити кастомні шляхи, якщо вони сформовані.
    // Браузер сам спробує їх завантажити. Якщо це не вдасться (файл не існує за цим шляхом),
    // спрацює обробник onerror в updateCoinImages, який встановить дефолтні.

    let finalSide1Url = defaultSide1; // За замовчуванням - дефолт
    let finalSide2Url = defaultSide2; // За замовчуванням - дефолт

    if (potentialCustomSide1 && potentialCustomSide2) {
         // Якщо є потенційні кастомні шляхи, використовуємо їх.
         // updateCoinImages обробить помилку 404 і поставить дефолтні, якщо файл не знайдено.
         finalSide1Url = potentialCustomSide1;
         finalSide2Url = potentialCustomSide2;
         console.log("Використовуються потенційні кастомні шляхи.");
    } else {
         console.log("Використовуються дефолтні шляхи.");
    }


    // Викликаємо функцію для оновлення зображень, передаючи ФІНАЛЬНІ URL
    console.log(`Оновлення зображень монетки: Сторона 1 - ${finalSide1Url}, Сторона 2 - ${finalSide2Url}`);
    updateCoinImages(finalSide1Url, finalSide2Url);
}

// Приклад гіпотетичної функції updateCoinImages
// Вам потрібно переконатися, що ваша реальна функція робить щось подібне
function updateCoinImages(urlSide1, urlSide2) {
    const imgElement1 = document.getElementById('coinImage1');
    const imgElement2 = document.getElementById('coinImage2');

    console.log(`updateCoinImages викликано. Спроба завантажити: Сторона 1 - ${urlSide1}, Сторона 2 - ${urlSide2}`);

    if (imgElement1) {
        // Видаляємо попередні обробники, якщо є
        imgElement1.onload = null;
        imgElement1.onerror = null;

        // Додаємо обробник успішного завантаження
        imgElement1.onload = function() {
            console.log(`✅ Зображення сторони 1 успішно завантажено з URL: ${imgElement1.src}`);
            // Після успіху обробник помилки вже не потрібен
            imgElement1.onerror = null;
        };

        // Додаємо обробник помилки завантаження
        imgElement1.onerror = function() {
            console.warn(`❌ Помилка завантаження зображення сторони 1 з URL: ${urlSide1}. Спроба використати резервне локальне зображення.`);
            imgElement1.src = LOCAL_FALLBACK_IMAGE_1; // Встановлюємо локальне резервне

            // Після встановлення резервного src, видаляємо обробник onerror
            // і додаємо новий onload для резервного зображення (опціонально)
            imgElement1.onerror = null; // Важливо, щоб уникнути циклу
            imgElement1.onload = function() {
                 console.log(`✅ Резервне локальне зображення сторони 1 успішно завантажено: ${imgElement1.src}`);
                 imgElement1.onload = null; // Видаляємо цей обробник після успіху
            };
        };

        // Встановлюємо src. Це ініціює спробу завантаження.
        imgElement1.src = urlSide1;
    }

    if (imgElement2) {
        // Видаляємо попередні обробники, якщо є
        imgElement2.onload = null;
        imgElement2.onerror = null;

        // Додаємо обробник успішного завантаження
        imgElement2.onload = function() {
            console.log(`✅ Зображення сторони 2 успішно завантажено з URL: ${imgElement2.src}`);
             imgElement2.onerror = null; // Після успіху обробник помилки вже не потрібен
        };

        // Додаємо обробник помилки завантаження
        imgElement2.onerror = function() {
            console.warn(`❌ Помилка завантаження зображення сторони 2 з URL: ${urlSide2}. Спроба використати резервне локальне зображення.`);
            imgElement2.src = LOCAL_FALLBACK_IMAGE_2; // Встановлюємо локальне резервне

             // Після встановлення резервного src, видаляємо обробник onerror
            // і додаємо новий onload для резервного зображення (опціонально)
            imgElement2.onerror = null; // Важливо, щоб уникнути циклу
             imgElement2.onload = function() {
                 console.log(`✅ Резервне локальне зображення сторони 2 успішно завантажено: ${imgElement2.src}`);
                 imgElement2.onload = null; // Видаляємо цей обробник після успіху
             };
        };

        // Встановлюємо src. Це ініціює спробу завантаження.
        imgElement2.src = urlSide2;
    }
}

// Переконайтеся, що у вас визначені змінні GAS_WEB_APP_URL, coinSide1Url, coinSide2Url
// const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/ВАШ_УНІКАЛЬНИЙ_ID/exec'; // Ваш реальний URL GAS
// const coinSide1Url = 'path/to/local/default1.png'; // Реальний шлях до локального дефолтного зображення
// const coinSide2Url = 'path/to/local/default2.png'; // Реальний шлях до локального дефолтного зображення

/**
 * Показує UI для підкидання монетки. [cite: 103]
 */
function showCoinFlipUI() {
    // Перевіряємо наявність нових елементів
    if (!coinFlipModal || !coinFlipOverlay || !coinFlipSection) {
        console.error("Не знайдено елементи модального вікна монетки.");
        return;
    }

    // Показуємо контейнер модального вікна та оверлей
    coinFlipModal.classList.remove('hidden');
    coinFlipOverlay.classList.remove('hidden');

    // Ваш існуючий код для налаштування вмісту модального вікна (coinFlipSection)
    // (Залиште його як є, але клас hidden вже не потрібен на coinFlipSection)
    // if (coinFlipSection) coinFlipSection.classList.remove('hidden'); // Цей рядок тепер не потрібен, якщо ви видалили hidden з HTML
    // if (startVotingBtn) startVotingBtn.classList.add('hidden'); // Залиште це, якщо ховаєте кнопку "Почати голосування" при нічиїй
    // if (votingDurationSelect) votingDurationSelect.classList.add('hidden'); // Залиште це, якщо ховаєте селект тривалості при нічиїй
    if (flipCoinBtn) flipCoinBtn.disabled = false;
    if (coinResultMessage) coinResultMessage.textContent = '';
    if (coinElement) coinElement.classList.remove('flip-side1', 'flip-side2');
    // ---> ДОДАЙТЕ ЦЕ <--- [cite: 104]
    // Робимо стандартні кнопки вибору переможця активними [cite: 104]
    if (voteButtons) { // [cite: 105]
        voteButtons.forEach(btn => btn.disabled = false); // [cite: 105]
        console.log("Стандартні кнопки вибору переможця активовано для вирішення нічиєї."); // [cite: 105]
    }
    // ---> КІНЕЦЬ ДОДАНОГО <--- [cite: 105]
}

/**
 * Ховає UI для підкидання монетки (модальне вікно).
 */
function hideCoinFlipUI() {
    // Перевіряємо наявність нових елементів
    if (!coinFlipModal || !coinFlipOverlay) {
        // Немає елементів, нічого ховати
         // console.warn("Не знайдено елементи модального вікна монетки для приховування."); // Можна додати лог
         return;
    }

    // Ховаємо контейнер модального вікна та оверлей
    coinFlipModal.classList.add('hidden');
    coinFlipOverlay.classList.add('hidden');

    // Очищаємо стан монетки при приховуванні
    if (coinElement) coinElement.classList.remove('flip-side1', 'flip-side2');
    if (coinResultMessage) coinResultMessage.textContent = '';
    if (flipCoinBtn) flipCoinBtn.disabled = true; // Зазвичай блокують кнопку після використання

    console.log("UI модального вікна монетки приховано.");

    // if (coinFlipSection) coinFlipSection.classList.add('hidden'); // Цей рядок тепер не потрібен
    // Можливо, тут треба знову показати startVotingBtn/votingDurationSelect,
    // але скоріше за все, після монетки одразу йде вибір переможця і наступний раунд
}

    /**
     * Обробляє клік на кнопку "Підкинути монету".
     */
    function handleCoinFlipButtonClick() {
        if (isCoinFlipping || !coinElement || !flipCoinBtn) {
            return; // Не робити нічого, якщо анімація вже йде або елементів немає
        }

        isCoinFlipping = true;
        flipCoinBtn.disabled = true; // Блокуємо кнопку під час анімації
        if (coinResultMessage) coinResultMessage.textContent = 'Монетка обертається...';
        coinElement.classList.remove('flip-side1', 'flip-side2'); // Скинути попередню анімацію

        // Генеруємо випадковий результат: 0 = Учасник 1, 1 = Учасник 2
    const outcome = Math.floor(Math.random() * 2);
    console.log('Результат підкидання монетки (0=Уч.1, 1=Уч.2):', outcome);

    // Затримка для гарантованого скидання класів
    setTimeout(() => {
        if (outcome === 0) {
            coinElement.classList.add('flip-side1');
        } else {
            coinElement.classList.add('flip-side2');
        }
    }, 10);

    // Зачекати завершення CSS-анімації (1000ms = 1s - має співпадати з CSS!)
    setTimeout(() => {
        const winnerIndex = outcome; // 0 або 1
        const winnerDetermined = winnerIndex + 1; // 1 або 2
        // Перевірка currentMatchup[winnerIndex]?.name захищає від помилки, якщо елемент відсутній
        const winnerName = currentMatchup && currentMatchup[winnerIndex] ? currentMatchup[winnerIndex].name : `Учасник ${winnerDetermined}`;

         if (coinResultMessage) {
              // --- ВИПРАВЛЕНО ТУТ ---
              // Використовуємо innerHTML для обробки HTML-тегів
              // Використовуємо синтаксис ${змінна} для вставки значень змінних
              coinResultMessage.innerHTML = `Монетка вирішила: Переможець - Учасник <span class="math-inline">${winnerDetermined} (${winnerName})</span>!`;
         }

         // --- ВИДАЛЯЄМО АВТОМАТИЧНИЙ ВИКЛИК ---
         // console.log(`Нічия вирішена монеткою. Переможець: ${winnerName}`);
         // resolveTie(winnerIndex); // <<< ВИДАЛИТИ або ЗАКОМЕНТУВАТИ ЦЕЙ РЯДОК

         // Залишаємо кнопку підкидання монети неактивною, поки не буде обрано переможця вручну
         isCoinFlipping = false; // Дозволяємо нове підкидання, якщо потрібно (але кнопка лишається disabled)
         // flipCoinBtn.disabled = false; // Не розблоковуємо кнопку тут

    }, 3000); // Час анімації з CSS
}


    /**
     * Обробляє зміну режиму голосування (перемикач).
     */
function handleVotingModeChange(event) {
        if (isLoadingSettings) {
            console.log("handleVotingModeChange: Пропуск обробки під час завантаження.");
            return;
        }
        console.log("===== Початок handleVotingModeChange (зміна користувачем) =====");

        const isChatMode = event.target.checked;

        if (isChatMode) {
            currentVotingMode = 'twitch';
            if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');
			if (voteFormatSection) voteFormatSection.classList.remove('hidden'); // ПОКАЗАТИ блок формату
            console.log("-> Режим встановлено на: 'twitch'");
            updateTwitchStatus(twitchConnected, currentTwitchChannel);
        } else {
            currentVotingMode = 'manual';
            if (twitchConfigSection) twitchConfigSection.classList.add('hidden');
			if (voteFormatSection) voteFormatSection.classList.add('hidden'); // СХОВАТИ блок формату
            console.log("-> Режим встановлено на: 'manual'");
            disconnectFromTwitch();
            if (isBattleRunning && battlePhaseVotingBlock) {
                 battlePhaseVotingBlock.classList.add('hidden');
            }
        }
        updateActiveLabel();

        // ЛОГ ПЕРЕД ЗБЕРЕЖЕННЯМ
        console.log(`Виклик saveSettings з currentVotingMode = "${currentVotingMode}"`);
        saveSettings(); // Зберігаємо новий режим
		checkPoolState(); // <-- ДОДАЙТЕ ЦЕЙ РЯДОК
        console.log("===== Кінець handleVotingModeChange =====");
    }
/**
     * Оновлює стиль активного лейбла для перемикача режимів.
     * Робить текст поточного режиму жирнішим.
     */
    function updateActiveLabel() {
        const manualLabel = document.getElementById('manualModeLabel');
        const chatLabel = document.getElementById('chatModeLabel');
        if (!manualLabel || !chatLabel) {
             // Якщо лейблів немає, нічого не робимо
             // console.warn("Не знайдено елементи #manualModeLabel або #chatModeLabel.");
             return;
        }

        if (currentVotingMode === 'manual') {
             manualLabel.classList.add('active');
             chatLabel.classList.remove('active');
        } else { // 'twitch'
             manualLabel.classList.remove('active');
             chatLabel.classList.add('active');
        }
    }
    /**
     * Обробляє клік на кнопку Підтвердити/Змінити для Twitch каналу.
     */
    function handleTwitchConfirmClick() {
        const isCurrentlyEditing = !twitchChannelInput.disabled;
        const channelName = twitchChannelInput.value.trim().toLowerCase();

        if (isCurrentlyEditing) { // Натиснуто "Підтвердити"
            if (!channelName) {
                alert("Будь ласка, введіть назву каналу Twitch.");
                return;
            }
            console.log(`Спроба підключення до каналу: ${channelName}`);
            // TODO: Реалізувати логіку відключення від старого каналу (якщо є)
            // TODO: Реалізувати логіку підключення до нового каналу
            // Поки що просто імітуємо успішне підключення (або неуспішне)
            connectToTwitch(channelName); // Функція підключення (створимо пізніше)

        } else { // Натиснуто "Змінити"
            console.log(`Редагування каналу ${currentTwitchChannel}`);
            // TODO: Відключення від поточного каналу
             disconnectFromTwitch(); // Функція відключення (створимо пізніше)

            twitchChannelInput.disabled = false; // Робимо поле активним
            twitchConfirmBtn.textContent = 'Підтвердити'; // Міняємо текст кнопки
            updateTwitchStatus(false); // Скидаємо статус
        }
    }

     /**
      * Оновлює відображення статусу підключення до Twitch.
      * @param {boolean} isConnected - Чи є активне з'єднання?
      * @param {string} [channel=currentTwitchChannel] - Назва каналу (для відображення).
      * @param {string} [errorMsg] - Повідомлення про помилку (опціонально).
      */
     function updateTwitchStatus(isConnected, channel = currentTwitchChannel, errorMsg = null) {
        if (!twitchStatusSpan) return;
		const previousConnectedState = twitchConnected; // Зберігаємо попередній стан
        twitchConnected = isConnected;
        if (isConnected) {
            twitchStatusSpan.textContent = `Підключено до чату #${channel}`;
            twitchStatusSpan.className = 'twitch-status connected';
            twitchChannelInput.disabled = true; // Блокуємо поле
            twitchConfirmBtn.textContent = 'Змінити'; // Міняємо кнопку
        } else {
            twitchChannelInput.disabled = false; // Розблоковуємо поле
            twitchConfirmBtn.textContent = 'Підтвердити';
             if (errorMsg) {
                 twitchStatusSpan.textContent = `Помилка: ${errorMsg}`;
                 twitchStatusSpan.className = 'twitch-status disconnected';
             } else {
                 twitchStatusSpan.textContent = 'Не підключено';
                 twitchStatusSpan.className = 'twitch-status';
             }
        }
    console.log(`Статус Twitch оновлено: connected=<span class="math-inline">\{isConnected\}, channel\=</span>{channel}, error=${errorMsg}`);

    // --- ДОДАЙТЕ ЦЕЙ БЛОК ---
    // Викликаємо перевірку стану кнопки, ТІЛЬКИ якщо статус підключення змінився
    if (twitchConnected !== previousConnectedState) {
        checkPoolState();
    }
    // --- КІНЕЦЬ ДОДАНОГО БЛОКУ ---
}
    /**
     * Зберігає базові налаштування в localStorage.
     * ОНОВЛЕНО: Зберігає формат голосування.
     */
    function saveSettings() {
        try {
             const modeToSave = currentVotingMode;
             // --- ЗМІНА ТУТ ---
             console.log(`--- Початок saveSettings: Збереження votingMode = "${modeToSave}", voteFormat = "${currentVoteFormat}" ---`);
             // --- КІНЕЦЬ ЗМІНИ ---
             localStorage.setItem('battleTheme', themeSelector.value);
             localStorage.setItem('battleTitle', battleTitleInput.value);
             localStorage.setItem('votingMode', modeToSave);
             // --- ДОДАНИЙ РЯДОК ---
             localStorage.setItem('voteFormat', currentVoteFormat); // Зберегти обраний формат
             // --- КІНЕЦЬ ДОДАНОГО РЯДКА ---
             console.log(`--- Кінець saveSettings: Збережено voteFormat='${localStorage.getItem('voteFormat')}' ---`);
        } catch (e) {
             console.error("Помилка під час збереження налаштувань в localStorage:", e);
        }
    }

    /**
     * Завантажує налаштування з localStorage та ВСТАНОВЛЮЄ ПОЧАТКОВИЙ СТАН UI.
     */
function loadSettings() {
     isLoadingSettings = true; // <-- Встановлюємо прапорець НА ПОЧАТКУ
     console.log("===== Початок loadSettings (isLoadingSettings = true) =====");
     const savedTheme = localStorage.getItem('battleTheme') || 'dark';
     const savedTitle = localStorage.getItem('battleTitle') || 'Додайте назву';
     const savedMode = localStorage.getItem('votingMode');
     const savedChannel = localStorage.getItem('twitchChannel') || ''; // Зчитуємо збережений канал
	 const savedFormat = localStorage.getItem('voteFormat') || 'strict'; // Завантажуємо формат, 'strict' за замовчуванням

     console.log(`Зчитано з localStorage: savedMode='${savedMode}', savedChannel='${savedChannel}', savedFormat='${savedFormat}'`);

     // Визначаємо поточний режим на основі збереженого
     currentVotingMode = savedMode === 'twitch' ? 'twitch' : 'manual';
	 currentVoteFormat = ['strict', 'simple', 'both'].includes(savedFormat) ? savedFormat : 'strict'; // Перевірка, чи збережене значення валідне
     console.log(`-> Присвоєно currentVotingMode = "${currentVotingMode}", currentVoteFormat = "${currentVoteFormat}"`);

     // Застосовуємо тему, заголовок, встановлюємо значення поля вводу каналу
     applyTheme(savedTheme);
     battleTitleInput.value = savedTitle;
     if (twitchChannelInput) twitchChannelInput.value = savedChannel;
	 if (voteFormatSelector) {
            voteFormatSelector.value = currentVoteFormat; // Встановлюємо завантажене значення в селект
        }

     // Встановлюємо стан перемикача
        if (votingModeToggle) {
            const shouldBeChecked = (currentVotingMode === 'twitch');
            console.log(`Встановлюємо votingModeToggle.checked = ${shouldBeChecked}`);
            votingModeToggle.checked = shouldBeChecked;
        }
        // Налаштовуємо видимість блоків Twitch та Формату
        if (currentVotingMode === 'twitch') {
            console.log("Режим 'twitch', показуємо блоки Twitch та Формату");
            if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');
            // --- ЗМІНА ТУТ ---
            if (voteFormatSection) voteFormatSection.classList.remove('hidden'); // ПОКАЗАТИ блок формату
         if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');

         if (savedChannel) { // Перевіряємо, чи є збережений канал
             console.log(`Канал ${savedChannel} знайдено, встановлюємо UI 'Налаштовано' і спробуємо підключитись`);
             if (twitchChannelInput) twitchChannelInput.disabled = true;
             if (twitchConfirmBtn) twitchConfirmBtn.textContent = 'Змінити';
             if (twitchStatusSpan) {
                  // Можна показати статус, що йде спроба підключення
                  twitchStatusSpan.textContent = `Канал: #${savedChannel}. Підключення...`;
                  twitchStatusSpan.className = 'twitch-status ready'; // або можна додати новий клас 'connecting'
             }
             currentTwitchChannel = savedChannel; // Встановлюємо поточний канал
             twitchConnected = false; // Поки що вважаємо, що не підключено

             // --- ДОДАНО АВТОМАТИЧНЕ ПІДКЛЮЧЕННЯ ---
             console.log("!!! Режим 'twitch' і канал збережено. Запускаємо авто-підключення...");
             // Викликаємо функцію підключення зі збереженим каналом
             connectToTwitch(savedChannel);
             // ----------------------------------------

         } else { // Якщо режим 'twitch', але канал не збережено
             console.log("Канал не збережено, встановлюємо UI 'Не налаштовано'.");
             if (twitchChannelInput) twitchChannelInput.disabled = false;
             if (twitchConfirmBtn) twitchConfirmBtn.textContent = 'Підтвердити';
             if (twitchStatusSpan) {
                 twitchStatusSpan.textContent = 'Введіть канал та підтвердіть';
                 twitchStatusSpan.className = 'twitch-status';
             }
             currentTwitchChannel = '';
             twitchConnected = false;
         }
        } else { // currentVotingMode === 'manual'
            console.log("Режим 'manual', ховаємо блоки Twitch та Формату");
            if (twitchConfigSection) twitchConfigSection.classList.add('hidden');
            // --- ЗМІНА ТУТ ---
            if (voteFormatSection) voteFormatSection.classList.add('hidden'); // СХОВАТИ блок формату
            // --- КІНЕЦЬ ЗМІНИ ---
            // ... (існуюча логіка для скидання стану Twitch) ...
        }

        // --- ДОДАНИЙ БЛОК ОНОВЛЕННЯ КЛІЄНТА ---
        // Оновлюємо формат у клієнта Twitch після завантаження налаштувань
        if (twitch && typeof twitch.setVoteFormat === 'function') {
             twitch.setVoteFormat(currentVoteFormat);
        }
        // --- КІНЕЦЬ ДОДАНОГО БЛОКУ ---

        updateActiveLabel(); // Оновити виділення активного режиму
        console.log(`===== Завершення loadSettings. Фінальний currentVotingMode="${currentVotingMode}", currentVoteFormat="${currentVoteFormat}" =====`);
        isLoadingSettings = false; // Зняти прапорець завантаження
    }

     // --- Додайте також ці (поки порожні) функції для підключення/відключення ---
function connectToTwitch(channelName) {
    console.log(`ЗАПУСК connectToTwitch для каналу ${channelName}`);

    // --- ДОДАНО: Спочатку спробуємо відключитися від попереднього каналу, якщо він був ---
    // (Потрібно буде додати метод disconnect в клас TwitchIRCClient, див. Крок 3)
    if (twitch && typeof twitch.disconnect === 'function' && twitchConnected) {
         console.log("Відключення від попереднього каналу...");
         twitch.disconnect();
         updateTwitchStatus(false); // Оновлюємо UI, щоб показати, що ми відключились
    }
    // -------------------------------------------------------------------------------

    // Анонімні дані для підключення
    const twitchUsername = "justinfan1234512"; // Або інший анонімний логін
    const twitchToken = ""; // Для анонімного підключення токен не потрібен

    try {
         // Викликаємо реальний метод init з нашого об'єкта twitch (з voting 1.1.js)
         twitch.init(
              twitchUsername,
              twitchToken,
              channelName, // <-- Використовуємо ім'я каналу з поля вводу!
              (data) => { // Обробник повідомлень (можна залишити або адаптувати)
                   const { login, message, tags } = data;
                   // Можна додати логіку тут, наприклад, для адмін-команд
                   // console.log(`${login}: ${message}`);
                    if (message.toLowerCase() === '!resetvotes') {
                         const isMod = tags.mod === '1';
                         const isBroadcaster = login.toLowerCase() === channelName.toLowerCase(); // Порівнюємо з поточним каналом
                         if (isMod || isBroadcaster) {
                              console.log(`Користувач ${login} ініціював скидання голосів.`);
                              twitch.resetVotes();
                         } else {
                              console.log(`Користувач ${login} спробував скинути голоси без прав.`);
                         }
                    }
              }
         );

         // Якщо init не викинув помилку одразу (WebSocket може підключатися асинхронно),
         // оновлюємо UI та зберігаємо канал.
         // Важливо: Стан 'connected' краще оновлювати в самому init або через callback/Promise,
         // бо WebSocket підключається асинхронно. Поки що оновимо оптимістично.
         currentTwitchChannel = channelName; // Зберігаємо підтверджений канал
         localStorage.setItem('twitchChannel', currentTwitchChannel); // Зберігаємо канал в localStorage
         updateTwitchStatus(true); // Оновлюємо UI (тимчасово вважаємо, що підключено)
		 fetchCoinImages(currentTwitchChannel); // Завантажуємо картинки для монетки

    } catch (error) {
         console.error("Помилка під час виклику twitch.init():", error);
         currentTwitchChannel = ''; // Канал не підтверджено
         updateTwitchStatus(false, channelName, `Помилка ініціалізації: ${error.message}`);
    }
}

function disconnectFromTwitch() {
    console.log(`ЗАПУСК disconnectFromTwitch (поточний канал: ${currentTwitchChannel})`);
     if (twitch && typeof twitch.disconnect === 'function') {
         twitch.disconnect(); // <-- Викликаємо реальний метод
     } else {
         console.warn("Об'єкт twitch або метод disconnect не знайдено.");
     }
     // Скидаємо стан UI
     // currentTwitchChannel = ''; // Не скидаємо тут, щоб користувач бачив останній введений
     updateTwitchStatus(false); // Оновлюємо UI
}

    /**
     * Обробляє клік на кнопку "Почати голосування".
     * Запускає процес голосування з таймером або без нього.
     */
function handleStartVotingClick() {
    console.log("handleStartVotingClick called");
    if (!startVotingBtn || !votingDurationSelect) return; // Перевірка наявності елементів

    // --- ПОЧАТОК НОВОЇ ПЕРЕВІРКИ ---
    if (currentVotingMode === 'twitch' && !twitchConnected) {
        // Якщо режим чату, але підключення відсутнє
        alert("Неможливо почати голосування: Чат Twitch не підключено! \n\nПідключіть канал у налаштуваннях або перемкніться в ручний режим.");
        return; // Зупиняємо виконання функції
    }
    // --- КІНЕЦЬ НОВОЇ ПЕРЕВІРКИ ---

    // Показуємо лічильники голосів (якщо вони ще не видимі)
    if (voteDisplay1) voteDisplay1.classList.remove('hidden');
    if (voteDisplay2) voteDisplay2.classList.remove('hidden');

    // Блокуємо кнопку "Почати голосування" та селект вибору тривалості
    startVotingBtn.disabled = true;
    votingDurationSelect.disabled = true; // Не можна змінювати тривалість під час голосування

    // Дозволяємо прийом голосів у Twitch клієнті (якщо режим Twitch активний)
    // Цей блок тепер виконується тільки якщо перевірка вище пройдена
    if (currentVotingMode === 'twitch' && twitch && typeof twitch.enableVoting === 'function') {
        twitch.enableVoting(); // Викликаємо новий метод у Twitch клієнта
    }

    isVotingActive = true; // Встановлюємо прапорець, що голосування активне

    // Використовуємо значення тривалості, яке було збережено при виборі з dropdown
    const duration = selectedVotingDuration;
    if (duration > 0) {
        // Якщо обрана конкретна тривалість, запускаємо таймер
        startVotingTimer(duration);
    } else {
        // Якщо обрано "Оберіть тривалість" (значення 0), таймер не потрібен
        console.log("Голосування розпочато (без обмеження часу)");
        // Можна змінити текст кнопки, щоб показати, що голосування йде
        startVotingBtn.textContent = "Голосування триває...";
        // isVotingActive вже true, голоси будуть прийматися безкінечно (до ручного вибору)
    }
}
    /**
     * Запускає таймер зворотного відліку для голосування.
     * @param {number} duration - Тривалість у секундах.
     */
    function startVotingTimer(duration) {
        console.log(`Запуск таймера голосування на ${duration} секунд`);
        let remainingTime = duration;

        // Очищаємо попередній інтервал, якщо він раптом існує
        if (votingTimerIntervalId) {
            clearInterval(votingTimerIntervalId);
        }

        updateTimerDisplay(remainingTime); // Одразу показуємо початковий час на кнопці

        // Створюємо новий інтервал, який спрацьовує кожну секунду
        votingTimerIntervalId = setInterval(() => {
            remainingTime--; // Зменшуємо час
            updateTimerDisplay(remainingTime); // Оновлюємо текст на кнопці

            if (remainingTime <= 0) {
                // Якщо час вийшов, зупиняємо таймер і обробляємо завершення
                stopVotingTimer('timer_end');
            }
        }, 1000); // Інтервал в 1000 мс (1 секунда)
    }

    /**
     * Оновлює текст на кнопці "Почати голосування", показуючи час, що залишився.
     * @param {number} remainingSeconds - Кількість секунд, що залишились.
     */
    function updateTimerDisplay(remainingSeconds) {
        if (!startVotingBtn) return; // Перевірка наявності кнопки

        // Розрахунок хвилин та секунд
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        // Форматування часу у вигляд ММ:СС (з ведучими нулями)
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Встановлення тексту кнопки
        startVotingBtn.textContent = `Залишилось: ${formattedTime}`;
    }

/**
     * Зупиняє таймер голосування (якщо він був запущений) та обробляє завершення/скидання.
     * Також контролює дозвіл на голосування в Twitch клієнті.
     * @param {string} reason - Причина зупинки ('timer_end', 'manual_selection', 'reset', 'battle_end', 'console_command', 'new_matchup', 'prepare_round', 'error').
     */
    function stopVotingTimer(reason) {
        console.log(`Зупинка голосування. Причина: ${reason}`);

        // 1. Зупиняємо інтервал таймера, якщо він активний
        if (votingTimerIntervalId) {
            clearInterval(votingTimerIntervalId);
            votingTimerIntervalId = null; // Скидаємо ID
        }

        // 2. Встановлюємо прапорець, що голосування більше не активне
        isVotingActive = false;

        // 3. Забороняємо прийом голосів у Twitch клієнті
        if (currentVotingMode === 'twitch' && twitch && typeof twitch.disableVoting === 'function') {
            twitch.disableVoting(); // Викликаємо новий метод у Twitch клієнта
        }

        // 4. Оновлюємо UI кнопки "Почати голосування" та селекту
        if (startVotingBtn) {
            if (reason === 'timer_end') {
                const votes1 = twitch?.votes ? twitch.votes['!1'] : 0;
                const votes2 = twitch?.votes ? twitch.votes['!2'] : 0;
                console.log(`Голосування завершено таймером. Рахунок: ${votes1} - ${votes2}`);
                if (currentVotingMode === 'twitch' && votes1 === votes2 && votes1 > 0) {
                    // НІЧИЯ в режимі Twitch!
                    startVotingBtn.textContent = "Нічия!"; // Текст можна залишити
                    startVotingBtn.disabled = false; // <-- КОМЕНТУЄМО АБО ВИДАЛЯЄМО ЦЕЙ РЯДОК
                    // if(votingDurationSelect) votingDurationSelect.classList.add('hidden'); // Цей рядок ви вже коментували/видаляли
                    showCoinFlipUI(); //
                    fetchCoinImages(currentTwitchChannel); //
                } else {
                    // Не нічия, або ручний режим, або 0-0
                    startVotingBtn.textContent = "Голосування завершено";
                    startVotingBtn.disabled = false; // Залишаємо активною для перезапуску
                    hideCoinFlipUI(); //
                }
            } else if (reason === 'console_command'){
                 startVotingBtn.textContent = "Голосування завершено";
                 startVotingBtn.disabled = false;
                 hideCoinFlipUI();
             }
             else {
                // В інших випадках (manual_selection, new_matchup, reset, battle_end і т.д.) [cite: 258]
                startVotingBtn.textContent = "Почати голосування"; // [cite: 258]
                startVotingBtn.disabled = false; // Робимо кнопку знову активною [cite: 258]
                hideCoinFlipUI(); // Ховаємо монетку [cite: 259]
            }
            // --- КІНЕЦЬ ЗМІН ---
        }
        // Логіка розблокування votingDurationSelect залишається правильною [cite: 260, 261, 262, 263]
        if (votingDurationSelect && reason !== 'timer_end') { // Розблоковуємо селект, крім випадку нічиєї [cite: 260]
             votingDurationSelect.disabled = false; // [cite: 260]
        } else if (votingDurationSelect && reason === 'timer_end') { // [cite: 261]
            // Якщо таймер завершився, але не нічия - розблокувати [cite: 261]
            const votes1 = twitch?.votes ? twitch.votes['!1'] : 0; // [cite: 261]
            const votes2 = twitch?.votes ? twitch.votes['!2'] : 0; // [cite: 261]
            if (!(currentVotingMode === 'twitch' && votes1 === votes2 && votes1 > 0)) { // [cite: 262]
                 votingDurationSelect.disabled = false; // [cite: 263]
            }
        }

        // 5. Спеціальна логіка для повного скидання батлу
        if (reason === 'reset' || reason === 'battle_end') {
            // Скидаємо обрану тривалість на значення за замовчуванням ("Оберіть тривалість")
             if (votingDurationSelect) {
                votingDurationSelect.value = "0";
            }
            selectedVotingDuration = 0; // Скидаємо збережене значення

            // Ховаємо лічильники голосів
             if (voteDisplay1) voteDisplay1.classList.add('hidden');
             if (voteDisplay2) voteDisplay2.classList.add('hidden');
        }
    }
function updateAddFilesButtonState() {
    // Додай перевірку режиму на початку
    if (currentParticipantMode !== 'media' || !addFilesBtn) {
        if(addFilesBtn) addFilesBtn.disabled = true; // Вимикаємо в текстовому режимі
        return;
    }
    // Існуюча логіка
    addFilesBtn.disabled = !fileInput || !fileInput.files || fileInput.files.length === 0;
}

    function handleAddFilesClick() {
		if (currentParticipantMode !== 'media') return;
        const files = fileInput.files;
        if (!files || files.length === 0) {
            updateAddFilesButtonState();
            return;
        }
        const fileReadPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                if (initialFilePool.some(poolFile => poolFile.name === file.name)) { resolve(null); return; }
                const reader = new FileReader();
                reader.onload = (event) => resolve({ id: Date.now() + Math.random().toString(16).slice(2), name: file.name, type: file.type, dataUrl: event.target.result });
                reader.onerror = (error) => { console.error("FileReader error:", error); reject({ file: file.name, error }); };
                try { reader.readAsDataURL(file); }
                catch (readError) { console.error("Error calling readAsDataURL:", readError); reject({ file: file.name, error: readError }); }
             });
        });

        Promise.all(fileReadPromises)
            .then(results => {
                const newFiles = results.filter(r => r !== null);
                if (newFiles.length > 0) {
                     initialFilePool = initialFilePool.concat(newFiles);
                     renderFilePoolList();
                }
                fileInput.value = '';
                updateAddFilesButtonState();
            })
            .catch(errorInfo => {
                console.error("Помилка обробки файлів:", errorInfo);
                showPoolMessage(`Не вдалося обробити файл: ${errorInfo.file || 'невідомий файл'}`, 'error');
                updateAddFilesButtonState();
            });
    }

     function handleClearAllClick() {
        if (confirm('Ви впевнені, що хочете видалити всі файли з пулу?')) {
            initialFilePool = [];
            renderFilePoolList();
        }
    }

    function handleFilePoolListClick(event) {
        if (event.target.classList.contains('delete-file-btn')) {
            // Потрібно використовувати file.id як рядок, бо dataset завжди рядок
            const fileIdToDelete = event.target.dataset.fileId;
            initialFilePool = initialFilePool.filter(file => String(file.id) !== fileIdToDelete);
            renderFilePoolList();
        }
    }

    function renderFilePoolList() {
        try {
            filePoolList.innerHTML = '';
            const count = initialFilePool.length;
            poolCountSpan.textContent = count;

            if (count > 0) {
                 poolSection.classList.remove('hidden');
                 clearAllBtn.classList.remove('hidden');
            } else {
                 poolSection.classList.add('hidden');
                 clearAllBtn.classList.add('hidden');
                 checkPoolState();
                 return;
            }

            initialFilePool.forEach((file, index) => {
                const li = document.createElement('li');
                const numberSpan = document.createElement('span');
                numberSpan.classList.add('file-number');
                numberSpan.textContent = `${index + 1}) `;
                li.appendChild(numberSpan);

                const nameSpan = document.createElement('span');
                nameSpan.classList.add('file-name');
                nameSpan.textContent = `${file.name} (${file.type})`;
                li.appendChild(nameSpan);

                const controlsSpan = document.createElement('span');
                controlsSpan.classList.add('file-controls');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-file-btn');
                deleteBtn.dataset.fileId = file.id; // Зберігаємо ID як dataset атрибут
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Видалити цей файл';
                controlsSpan.appendChild(deleteBtn);

                li.appendChild(controlsSpan);
                filePoolList.appendChild(li);
            });

            checkPoolState();
        } catch (error) {
            console.error("Помилка під час рендерингу списку файлів:", error);
            showPoolMessage("Сталася помилка при оновленні списку файлів.", "error");
            if(startBattleBtn) startBattleBtn.disabled = true;
        }
    }

function checkPoolState() {
     try {
         const n = initialFilePool.length;
         let message = "";
         let messageType = "hidden";
         if (!startBattleBtn || !poolMessageDiv) return;
         startBattleBtn.disabled = true; // За замовчуванням кнопка вимкнена

         // --- Існуючі перевірки ---
         if (n === 0) {
            messageType = "hidden";
            showPoolMessage(message, messageType);
            return;
         }
         if (n === 1) { // Не повинно траплятися з валідацією, але про всяк випадок
             message = "Потрібно щонайменше 2 учасники для батлу.";
             messageType = "warning";
             showPoolMessage(message, messageType);
             return;
         }
         if (n % 2 !== 0) { // Також не повинно траплятися
             message = `Помилка: Кількість учасників (${n}) повинна бути ПАРНОЮ!`;
             messageType = "error";
             showPoolMessage(message, messageType);
             return;
         }
         // Перевірка підключення Twitch (тільки якщо режим Twitch активний)
         if (currentVotingMode === 'twitch' && !twitchConnected) {
             message = "Чат не підключено. Введіть назву каналу з якого будуть враховуватися голоси та натисність кнопку Підтвердити або перемкніться в ручний режим";
             messageType = "error";
             showPoolMessage(message, messageType);
             return;
         }
         // --- Кінець існуючих перевірок ---

         // Якщо ми дійшли сюди, кількість >= 2, парна, і Twitch підключений (якщо потрібно)
         startBattleBtn.disabled = false; // Вмикаємо кнопку

         // --- ВИПРАВЛЕНА ЛОГІКА для повідомлень ---
         const isPowerOfTwo = (n > 0) && ((n & (n - 1)) === 0);
         if (!isPowerOfTwo) {
             // Показуємо ЛИШЕ попередження про ступінь двійки, якщо потрібно
             message = `Увага: Кількість учасників (${n}) не є ступенем двійки (2, 4, 8...). Деякі учасники отримають автоматичний прохід ('bye') в першому раунді.`;
             messageType = "warning";
             showPoolMessage(message, messageType);
         } else {
             // В іншому випадку (кількість парна, ступінь двійки, чат підключено) - ПРИХОВУЄМО будь-яке попереднє повідомлення
             showPoolMessage("", "hidden");
         }
         // --- КІНЕЦЬ ВИПРАВЛЕНОЇ ЛОГІКИ ---

     } catch(error) {
         console.error("Помилка в checkPoolState:", error);
         showPoolMessage("Сталася помилка при перевірці стану пулу.", "error");
         if(startBattleBtn) startBattleBtn.disabled = true;
     }
 }

function startBattle() {
        if (startBattleBtn.disabled) {
            checkPoolState();
            return;
        }
        isBattleRunning = true;
        battleWinner = null;
        currentRound = 0;
        battleHistory = [];
        let participantsForRound1 = [...initialFilePool];
        shuffleArray(participantsForRound1);
        nextRoundParticipants = participantsForRound1;

        // --- Оновлення UI ---
        controlsSection.classList.add('hidden');
        poolSection.classList.add('hidden');
        battleStatusDiv.classList.remove('hidden');
        resultsArea.classList.add('hidden'); // <-- Ховаємо результати
        battleArea.classList.add('hidden');
        if (battlePhaseVotingBlock) battlePhaseVotingBlock.classList.add('hidden');
        startBattleBtn.classList.add('hidden');
        resetBattleBtn.classList.add('hidden'); // Ховаємо і кнопку скидання

        // ===== ВИДАЛЯЄМО КЛАС З BODY =====
        document.body.classList.remove('results-visible-padding');
        // =================================

        prepareNextRound();
    }

    function prepareNextRound() {
        try {
            currentRound++;
            currentRoundParticipants = [...nextRoundParticipants];
            const roundData = { round: currentRound, matchups: [], byes: [] };
            nextRoundParticipants = [];
            currentMatchupIndex = 0;
            byeInfoSpan.classList.add('hidden');

            if (currentRoundParticipants.length === 1) {
                endBattle(currentRoundParticipants[0]);
                return;
            }

            let participantsToPair = [...currentRoundParticipants];
            let byesGiven = [];

            if (currentRound === 1) {
                const n = initialFilePool.length;
                const isPowerOfTwo = (n > 0) && ((n & (n - 1)) === 0);

                if (!isPowerOfTwo && n % 2 === 0) { // Тільки якщо парне, але не степінь двійки
                    let nextHighestPowerOfTwo = 1;
                    while (nextHighestPowerOfTwo < n) nextHighestPowerOfTwo *= 2;
                    const numberOfByes = nextHighestPowerOfTwo - n;

                    for (let i = 0; i < numberOfByes; i++) {
                        if (participantsToPair.length > 0) {
                           const luckyParticipant = participantsToPair.pop();
                           nextRoundParticipants.push(luckyParticipant);
                           byesGiven.push(luckyParticipant);
                           roundData.byes.push(luckyParticipant.id);
                        }
                    }
                    if (byesGiven.length > 0) {
                        byeInfoSpan.textContent = `Автоматично пройшли: ${byesGiven.map(p => p.name).join(', ')}`;
                        byeInfoSpan.classList.remove('hidden');
                    }
                }
                 // Якщо непарне, логіка checkPoolState не дасть почати, тому цей випадок тут не обробляємо
            }

            totalMatchupsInRound = participantsToPair.length / 2;
            roundInfoSpan.textContent = `Раунд: ${currentRound}`;
            stopVotingTimer('prepare_round');

            if (currentRoundParticipants.length === 1) {
                endBattle(currentRoundParticipants[0]);
                return;
            }
            if (totalMatchupsInRound > 0 || roundData.byes.length > 0) {
                 battleHistory.push(roundData);
            }

            if (totalMatchupsInRound > 0) {
                 statusHeader.textContent = `Батл триває`;
                 presentNextMatchup(participantsToPair);
            } else if (nextRoundParticipants.length === 1) {
                 endBattle(nextRoundParticipants[0]);
            } else if (nextRoundParticipants.length > 1 && participantsToPair.length === 0) {
                 console.log(`Раунд ${currentRound}: Усі пройшли через 'bye'. Готуємо наступний раунд.`);
                 prepareNextRound();
            } else {
                 console.error("Незрозуміла ситуація в prepareNextRound.");
                 resetToInitialState();
            }
        } catch (error) {
            console.error("Помилка в prepareNextRound:", error);
            alert("Сталася помилка під час підготовки раунду.");
            resetToInitialState();
        }
    }

function presentNextMatchup(participantsInPlay) {
        try {
            console.log(`--- Перевірка режиму в presentNextMatchup: currentVotingMode = "${currentVotingMode}" ---`);
            stopVotingTimer('new_matchup'); // Зупиняємо попередній таймер/голосування
			
			hideCoinFlipUI(); // Гарантовано ховаємо монетку при переході до нового матчу

            // Додаткова перевірка: чи не закінчились матчі в раунді?
             if (currentMatchupIndex >= totalMatchupsInRound) {
                 console.warn(`presentNextMatchup викликано, коли індекс матчу (${currentMatchupIndex}) >= кількості матчів (${totalMatchupsInRound}). Мав бути викликаний prepareNextRound.`);
                 // Спробуємо виправити ситуацію, викликавши prepareNextRound
                  prepareNextRound();
                 return; // Виходимо з функції
             }

            // --- Керуємо видимістю блоку голосування та Twitch ---
        if (currentVotingMode === 'twitch') {
            console.log("Показ блоку голосування Twitch");
            if (battlePhaseVotingBlock) battlePhaseVotingBlock.classList.remove('hidden');

            // ---> ДОДАЙТЕ ЦІ РЯДКИ ДЛЯ ВІДНОВЛЕННЯ <---
            if (startVotingBtn) {
                 startVotingBtn.textContent = "Почати голосування"; // Скидаємо текст
                 startVotingBtn.disabled = false; // Робимо активною
                 startVotingBtn.classList.remove('hidden'); // Показуємо
            }
             if (votingDurationSelect) {
                 votingDurationSelect.value = String(selectedVotingDuration); // Встановлюємо обрану тривалість
                 votingDurationSelect.disabled = false; // Розблоковуємо
                 votingDurationSelect.classList.remove('hidden'); // Показуємо
            }
                 if (voteDisplay1) voteDisplay1.classList.add('hidden');
                 if (voteDisplay2) voteDisplay2.classList.add('hidden');
                 if (twitchConnected && twitch && typeof twitch.resetVotes === 'function') {
                     console.log("Режим Twitch, скидання голосів...");
                     twitch.resetVotes();
                 } else {
                     console.log("Режим Twitch, але немає активного підключення або resetVotes, голоси не скидаються.");
                 }
             } else { // 'manual' mode
                  console.log("Приховування блоку голосування Twitch (ручний режим)");
                  if (battlePhaseVotingBlock) battlePhaseVotingBlock.classList.add('hidden');
                  if (twitch && typeof twitch.disableVoting === 'function') {
                      twitch.disableVoting();
                  }
             }

            // --- Вибираємо пару учасників ---
            const index1 = currentMatchupIndex * 2;
            const index2 = index1 + 1;
            // Додаткова перевірка індексів
            if(index1 >= participantsInPlay.length || index2 >= participantsInPlay.length) {
                 console.error(`Помилка індексів (i1=${index1}, i2=${index2}) при формуванні пари в presentNextMatchup! Учасників: ${participantsInPlay.length}. Індекс матчу: ${currentMatchupIndex}/${totalMatchupsInRound}`);
                 // Спробуємо перейти до наступного раунду, можливо, список учасників був неправильний
                  prepareNextRound();
                 return;
            }
            currentMatchup = [participantsInPlay[index1], participantsInPlay[index2]];

            // --- Відображаємо учасників ---
            matchInfoSpan.textContent = `Матч: ${currentMatchupIndex + 1} / ${totalMatchupsInRound}`;
            displayContestant(mediaContainer1, contestantName1, currentMatchup[0]);
            displayContestant(mediaContainer2, contestantName2, currentMatchup[1]);
            battleArea.classList.remove('hidden');
            resultsArea.classList.add('hidden');
            voteButtons.forEach(btn => btn.disabled = false);

        } catch(error) {
             console.error("Помилка в presentNextMatchup:", error);
             alert("Сталася помилка під час показу наступного матчу.");
             stopVotingTimer('error');
             resetToInitialState();
        }
    }

function displayContestant(container, nameElement, fileInfo) {
    container.innerHTML = '';
    if (!fileInfo) {
         container.textContent = 'Помилка: Учасник не знайдений';
         if(nameElement) nameElement.textContent = 'Помилка';
         return;
    }

    // !!! НОВА ЛОГІКА: Ховаємо ім'я для текстових учасників !!!
    if (fileInfo.isTextParticipant) {
        if (nameElement) nameElement.classList.add('hidden'); // Ховаємо H3
    } else {
        if (nameElement) {
             nameElement.textContent = fileInfo.name; // Показуємо ім'я для медіа
             nameElement.classList.remove('hidden');
        }
    }
    // !!! КІНЕЦЬ НОВОЇ ЛОГІКИ !!!

    // Існуюча логіка відображення img/video/audio
    if (fileInfo.type.startsWith('image/')) { // Тепер включає згенеровані png/jpeg
        const img = document.createElement('img');
        img.src = fileInfo.dataUrl;
        img.alt = fileInfo.name;
        container.appendChild(img);
        } else if (fileInfo.type.startsWith('video/')) { // mp4
            const video = document.createElement('video');
            video.src = fileInfo.dataUrl;
            video.controls = true; // Показуємо стандартні контролери відео
            video.preload = "metadata";
            video.onerror = () => { /* ... обробка помилки ... */ };
            container.appendChild(video);
        } else if (fileInfo.type.startsWith('audio/') || fileInfo.type === 'application/ogg') { // <-- ЗМІНЕНО ТУТ
            console.log(`Displaying audio element for type: ${fileInfo.type}`); // Додатковий лог
            const audio = document.createElement('audio');
            audio.src = fileInfo.dataUrl;
            audio.controls = true;
            audio.preload = "metadata";
             audio.onerror = () => { /* ... */ };
            container.appendChild(audio);
        } else {
            container.textContent = `Непідтримуваний тип файлу: ${fileInfo.type}`;
        }
    }

/**
     * Обробляє клік на кнопку вибору переможця (в ручному режимі).
     * Визначає переможця, записує історію та вирішує, чи переходити
     * до наступного матчу поточного раунду, чи готувати наступний раунд.
     */
    function handleVoteButtonClick(event) {
		    if (coinFlipSection && !coinFlipSection.classList.contains('hidden')) {
        console.log("Вибір зроблено після монетки, ховаємо UI монетки.");
        hideCoinFlipUI();
		                 if (startVotingBtn) {
                     startVotingBtn.disabled = false; // Вмикаємо кнопку "Почати голосування"
                     startVotingBtn.textContent = "Почати голосування"; // Можливо, скинути текст
                     startVotingBtn.classList.remove('hidden'); // Переконаємось, що вона видима
                 }
                 if (votingDurationSelect) {
                     votingDurationSelect.disabled = false; // Вмикаємо селект тривалості
                     votingDurationSelect.classList.remove('hidden'); // Переконаємось, що він видимий
                 }
                  console.log("Кнопки голосування та селект тривалості ввімкнено після вибору переможця монетки.");
        // Переконаємось, що кнопка підкидання заблокована на наступний раз
        if(flipCoinBtn) flipCoinBtn.disabled = true;
        if(coinResultMessage) coinResultMessage.textContent = ''; // Очищаємо повідомлення
    }
        if (!isBattleRunning || currentMatchup.length !== 2) return;
        voteButtons.forEach(btn => btn.disabled = true); // Блокуємо кнопки вибору
        //stopVotingTimer('manual_selection'); // Зупиняємо таймер/голосування

        try {
            // Визначаємо переможця та переможеного
            const winnerIndex = parseInt(event.target.dataset.winner, 10) - 1;
            const winner = currentMatchup[winnerIndex];
            const loser = currentMatchup[1 - winnerIndex];
            console.log(`Р${currentRound} М${currentMatchupIndex + 1}: ${winner.name} переміг ${loser.name}`);

            // Записуємо результат матчу в історію поточного раунду
            const currentRoundHistory = battleHistory.find(r => r.round === currentRound);
            if (currentRoundHistory) {
                 currentRoundHistory.matchups.push({
                      p1: currentMatchup[0].id,
                      p2: currentMatchup[1].id,
                      winner: winner.id
                 });
            } else {
                 // Це не повинно траплятись, якщо prepareNextRound працює коректно
                 console.warn(`Не знайдено історію для раунду ${currentRound} при запису матчу.`);
            }

            // Додаємо переможця до списку учасників для НАСТУПНОГО раунду
            nextRoundParticipants.push(winner);
            // Збільшуємо індекс матчу для ПОТОЧНОГО раунду
            currentMatchupIndex++;

            // Вирішуємо, що робити далі (після невеликої затримки)
            setTimeout(() => {
                // Знаходимо список учасників, які грали в цьому раунді (без тих, хто отримав 'bye')
                // Це потрібно, щоб правильно передати список у presentNextMatchup
                 const participantsWhoPlayedThisRound = currentRoundParticipants.filter(p =>
                     !(battleHistory.find(r => r.round === currentRound)?.byes.includes(p.id))
                 );

                 // Перевіряємо, чи є ще матчі в ПОТОЧНОМУ раунді
                if (currentMatchupIndex < totalMatchupsInRound) {
                    // Так, є ще матчі -> показуємо наступний матч
                    console.log(`Перехід до матчу ${currentMatchupIndex + 1} раунду ${currentRound}`);
                    presentNextMatchup(participantsWhoPlayedThisRound);
                } else {
                    // Ні, всі матчі поточного раунду зіграно -> готуємо наступний раунд
                    console.log(`Всі матчі раунду ${currentRound} завершено. Підготовка до наступного раунду.`);
                    prepareNextRound();
                }
            }, 200); // Затримка 200 мс

        } catch (error) {
            console.error("Помилка під час обробки голосування:", error);
            alert("Сталася помилка під час голосування.");
            stopVotingTimer('error'); // Зупиняємо таймер/голосування при помилці
            resetToInitialState();   // Скидаємо гру до початкового стану
        }
    }

/**
     * Завершує батл, показує переможця та турнірну сітку.
     */
    function endBattle(winner) {
         try { // Початок єдиного блоку try
            isBattleRunning = false;
            // Зупиняємо голосування та скидаємо пов'язані елементи UI
            stopVotingTimer('battle_end'); // Важливо викликати це тут, на початку нормального завершення

            battleWinner = winner;
            console.log("Батл завершено! Переможець:", winner);
            console.log("Історія батлу для рендерингу:", JSON.stringify(battleHistory));

            // --- Оновлення UI ---
            // Сховати елементи батлу
            battleArea.classList.add('hidden');
            if (battlePhaseVotingBlock) battlePhaseVotingBlock.classList.add('hidden'); // Завжди ховаємо після бою
            // Лічильники та кнопка голосування вже оброблені в stopVotingTimer('battle_end')

            battleStatusDiv.classList.add('hidden');
            resultsArea.classList.remove('hidden');
            resultsHeader.textContent = 'Батл Завершено!';
			document.body.classList.add('results-visible-padding');

            // --- Відобразити переможця ---
            winnerDisplay.innerHTML = '';
            const winnerTitle = document.createElement('h3');
            winnerTitle.textContent = `🏆 Переможець: ${winner ? winner.name : 'Нічия або помилка'} 🏆`;
            winnerDisplay.appendChild(winnerTitle);
            if (winner) {
                const winnerMediaContainer = document.createElement('div');
                winnerMediaContainer.classList.add('media-container');
                displayContestant(winnerMediaContainer, null, winner);
                winnerDisplay.appendChild(winnerMediaContainer);
            }

            // --- Відобразити турнірну сітку ---
            renderBracket();
            bracketContainer.classList.remove('hidden');

            // --- Показати початкові контрольні елементи та пул ---
            controlsSection.classList.remove('hidden');
            poolSection.classList.remove('hidden');

            // --- Керування кнопками ---
            startBattleBtn.classList.add('hidden'); // Ховаємо кнопку "Почати батл"
            resetBattleBtn.classList.remove('hidden'); // Показуємо кнопку "Новий батл"
            addFilesBtn.disabled = false;
            fileInput.disabled = false;
            updateAddFilesButtonState();
            checkPoolState();

        } catch (error) {
            console.error("Помилка в endBattle:", error);
            alert("Сталася помилка під час завершення батлу.");
            // При помилці теж можна видалити клас, оскільки результати можуть не відобразитись коректно
            document.body.classList.remove('results-visible-padding'); // <-- ВИДАЛЯЄМО при помилці
            stopVotingTimer('error');
            resetToInitialState();
        }
    }

    function renderBracket() {
        console.log("Запуск renderBracket...");
        const bracketView = document.getElementById('bracketView');
        if (!bracketView) {
            console.error("renderBracket: #bracketView не знайдено!");
            return;
        }
        // Очищуємо основний контейнер перед новим рендерингом
        bracketView.innerHTML = '';

        // === СТВОРЮЄМО КОНТЕЙНЕРИ ДИНАМІЧНО ===
        const bracketTitlesView = document.createElement('div');
        bracketTitlesView.id = 'bracketTitlesView'; // ID для CSS
        // CSS має стилізувати #bracketTitlesView як display:flex, row, etc.

        const bracketRoundsWrapper = document.createElement('div');
        bracketRoundsWrapper.id = 'bracketRoundsWrapper'; // ID для CSS
        // CSS має стилізувати #bracketRoundsWrapper як display:flex, row, etc.

        // Додаємо створені контейнери в DOM (в правильному порядку: заголовки, потім раунди)
        bracketView.appendChild(bracketTitlesView);
        bracketView.appendChild(bracketRoundsWrapper);
        // ======================================

        // Перевірки наявності даних (як і раніше)
        if (!battleHistory) {
             bracketView.innerHTML = "<p>Помилка: Історія батлу відсутня.</p>"; return;
        }
        if (battleHistory.length === 0 && !battleWinner) {
             bracketView.innerHTML = "<p>Немає даних для генерації дерева батлу.</p>"; return;
        }
        if (!battleWinner && currentRound > 0 && battleHistory.length > 0) {
             bracketView.innerHTML = "<p>Не вдалося згенерувати дерево батлу (переможець ще не визначений).</p>";
             // Очищуємо вже створений порожній контейнер заголовків
             bracketTitlesView.innerHTML = '';
             return;
        }

        try {
            const totalRounds = battleHistory ? battleHistory.length : 0;
            let participantsMap = new Map(initialFilePool.map(p => [p.id, p]));
            if (battleWinner && !participantsMap.has(battleWinner.id)) {
                participantsMap.set(battleWinner.id, battleWinner);
            }

            // --- Цикл рендерингу раундів (і=0 до totalRounds-1) ---
            for (let i = 0; i < totalRounds; i++) {
                const roundData = battleHistory[i];
                const hasContent = (roundData?.matchups?.length > 0) || (roundData?.byes?.length > 0);

                // === Створюємо ЗАГОЛОВОК ===
                const roundTitle = document.createElement('h4');
                roundTitle.classList.add('bracket-round-title');
                if (!roundData || !hasContent) {
                    // Створюємо "пустишку" для порожнього раунду, щоб зберегти вирівнювання
                    roundTitle.classList.add('bracket-title-placeholder');
                    roundTitle.innerHTML = '&nbsp;'; // Невидимий пробіл
                } else {
                    roundTitle.textContent = getRoundTitle(i, totalRounds);
                }
                // === ДОДАЄМО ЗАГОЛОВОК (або пустишку) в контейнер заголовків ===
                bracketTitlesView.prepend(roundTitle); // prepend для LTR порядку

                // --- Створюємо КОЛОНКУ РАУНДУ ---
                const roundElement = document.createElement('div');
                roundElement.classList.add('bracket-round');
                if (!roundData || !hasContent) {
                    roundElement.classList.add('bracket-round-placeholder');
                     // Можливо, додати стилі для висоти чи вигляду пустишки
                } else {
                    // Додаємо матчі до колонки
                    (roundData.matchups || []).forEach(match => {
                         const matchupElement = document.createElement('div');
                         matchupElement.classList.add('bracket-matchup');
                         const p1 = participantsMap.get(match.p1);
                         const p2 = participantsMap.get(match.p2);
                         if (!p1 || !p2) { console.error(/*...*/); return; }
                         matchupElement.appendChild(createParticipantElement(p1, match.winner === match.p1));
                         matchupElement.appendChild(createParticipantElement(p2, match.winner === match.p2));
                         roundElement.appendChild(matchupElement);
                    });
                    // Додаємо byes до колонки
                    (roundData.byes || []).forEach(byeId => {
                         const matchupElement = document.createElement('div');
                         matchupElement.classList.add('bracket-matchup', 'bye-matchup');
                         const participant = participantsMap.get(byeId);
                         if (!participant) { console.error(/*...*/); return; }
                         matchupElement.appendChild(createParticipantElement(participant, true, true));
                         roundElement.appendChild(matchupElement);
                     });
                }
                // --- Додаємо КОЛОНКУ РАУНДУ (або пустишку) в контейнер раундів ---
                bracketRoundsWrapper.prepend(roundElement); // prepend для LTR порядку

            } // --- Кінець циклу for ---

            // === Блок переможця ---
            if (battleWinner) {
                // Додаємо заголовок переможця
                const winnerTitle = document.createElement('h4');
                winnerTitle.classList.add('bracket-round-title', 'winner-title');
                winnerTitle.textContent = "Переможець";
                bracketTitlesView.prepend(winnerTitle); // Додаємо першим

                // Створюємо колонку переможця
                const winnerRoundElement = document.createElement('div');
                winnerRoundElement.classList.add('bracket-round', 'bracket-winner-round');
                const winnerDisplayElement = document.createElement('div');
                winnerDisplayElement.classList.add('bracket-matchup', 'bracket-winner-display');
                const winnerCard = createParticipantElement(battleWinner, true);
                winnerDisplayElement.appendChild(winnerCard);
                winnerRoundElement.appendChild(winnerDisplayElement);

                // Додаємо колонку переможця
                bracketRoundsWrapper.prepend(winnerRoundElement); // Додаємо першою
            }
        // === КІНЕЦЬ БЛОКУ ПЕРЕМОЖЦЯ ===

        // === ВИКЛИКАЄМО НАЛАШТУВАННЯ ХОВЕРІВ ПІСЛЯ РЕНДЕРІНГУ ===
        setupPreviewHover(); // <--- Оновлено назву
        // ========================================================
        console.log("Рендеринг дерева завершено.");
    } catch (error) {
            console.error("Помилка під час рендерингу раундів дерева:", error);
            bracketView.innerHTML = "<p>Сталася помилка при відображенні дерева батлу.</p>";
        }
    } // === КІНЕЦЬ ФУНКЦІЇ renderBracket ===
    // Спочатку додайте цю допоміжну функцію кудись у файл script.js
    /**
     * Повертає назву раунду на основі його індексу та загальної кількості раундів.
     * @param {number} roundIndex Індекс раунду в масиві історії (рахунок з 0, від ПЕРШОГО до ОСТАННЬОГО)
     * @param {number} totalRounds Загальна кількість раундів в історії
     * @returns {string} Назва раунду
     */
    function getRoundTitle(roundIndex, totalRounds) {
        const roundsFromFinal = totalRounds - 1 - roundIndex; // 0 = фінал, 1 = півфінал...
        if (roundsFromFinal < 0) return `Раунд ${roundIndex + 1}`;
        if (roundsFromFinal === 0) return "Фінал";
        if (roundsFromFinal === 1) return "Півфінал";
        if (roundsFromFinal === 2) return "Чвертьфінал";
        const stageDenominator = Math.pow(2, roundsFromFinal);
        return `1/${stageDenominator} фіналу`;
    }

// Зміни в createParticipantElement для виклику генерації thumbnail
/**
     * Створює DOM-елемент для учасника в дереві батлу.
     * Включає статичний thumbnail (згенерований для відео) та прихований блок для прев'ю при наведенні.
     * @param {object} participantInfo - Об'єкт з даними учасника { id, name, type, dataUrl }
     * @param {boolean} isWinner - Чи є цей учасник переможцем у даному матчі/раунді
     * @param {boolean} [isBye=false] - Чи отримав учасник автоматичний прохід
     * @returns {HTMLElement} Готовий div елемент учасника
     */
/**
     * Створює DOM-елемент для учасника в дереві батлу.
     * Включає статичний thumbnail (згенерований для відео) та data-атрибути для динамічного прев'ю.
     */
function createParticipantElement(participantInfo, isWinner, isBye = false) {
    const div = document.createElement('div');
    div.classList.add('bracket-participant');
    div.style.position = 'relative';
    if (isWinner) div.classList.add('winner');
    if (isBye) div.classList.add('bye-participant');

    const imgThumbnail = document.createElement('img');
    imgThumbnail.classList.add('bracket-thumbnail');

    const participantName = participantInfo ? participantInfo.name : 'N/A';
    const altText = isBye ? `${participantName} (Bye)` : participantName;
    imgThumbnail.alt = altText;
    div.title = altText; // Додаємо повний текст в title

    let mediaType = 'other';

    // --- Логіка для мініатюр ---
    if (participantInfo && participantInfo.isTextParticipant) {
        // Текстовий учасник - використовуємо згенерований dataUrl
        mediaType = 'image'; // Представляємо як картинку
        imgThumbnail.src = participantInfo.dataUrl; // Показуємо зменшену картинку "текст-на-фоні"
        imgThumbnail.style.objectFit = 'cover'; // або contain
    } else if (participantInfo && participantInfo.type.startsWith('image/')) {
         mediaType = 'image';
         imgThumbnail.src = participantInfo.dataUrl;
         imgThumbnail.style.objectFit = 'cover';
    } else if (participantInfo && participantInfo.type.startsWith('video/')) {
         mediaType = 'video';
         imgThumbnail.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236c757d"%3E%3Cpath d="M10 16.5v-9l6 4.5-6 4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/%3E%3C/svg%3E'; // Placeholder
         imgThumbnail.style.objectFit = 'contain';
         if (typeof generateVideoThumbnail === 'function') {
             generateVideoThumbnail(participantInfo.dataUrl, imgThumbnail, altText);
         }
    } else if (participantInfo && participantInfo.type.startsWith('audio/')) {
         mediaType = 'audio';
         imgThumbnail.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%236c757d\'%3E%3Cpath d=\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\'/%3E%3C/svg%3E'; // Placeholder
         imgThumbnail.style.objectFit = 'contain';
    } else {
         mediaType = 'other';
         imgThumbnail.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236c757d"%3E%3Cpath d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/%3E%3C/svg%3E'; // Placeholder
         imgThumbnail.style.objectFit = 'contain';
    }

    div.appendChild(imgThumbnail);

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('participant-name'); // Цей клас вже має стилі для обрізки [джерело: 691]
    nameSpan.textContent = participantName;
    if (isBye) { nameSpan.textContent += ' (Bye)'; }
    div.appendChild(nameSpan);

    // Додаємо data-атрибути для прев'ю (текстових учасників теж можна показувати як картинку)
    if (participantInfo && (mediaType === 'image' || mediaType === 'video' || mediaType === 'audio')) {
         // Використовуємо dataUrl згенерованого зображення для текстових
        div.dataset.previewUrl = participantInfo.dataUrl;
        div.dataset.mediaType = mediaType === 'audio' ? 'audio' : (mediaType === 'video' ? 'video' : 'image'); // Прев'ю текстових буде 'image'
    }

    return div;
}
	
	/**
 * Асинхронно генерує thumbnail для відео і встановлює його як src для переданого img елемента.
 * @param {string} videoDataUrl - Data URL відеофайлу.
 * @param {HTMLImageElement} imgElement - Елемент <img>, для якого потрібно встановити thumbnail.
 * @param {string} videoName - Назва відео для логування помилок.
 */
async function generateVideoThumbnail(videoDataUrl, imgElement, videoName = 'video') {
    // Отримуємо цільовий розмір з CSS змінної
    const thumbSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bracket-thumbnail-size') || '64', 10);

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false }); // Вимикаємо альфа-канал для JPEG

    video.preload = 'metadata';
    video.muted = false;
    video.playsInline = true;

    canvas.width = thumbSize;
    canvas.height = thumbSize;

    let timeoutId = null; // Для зберігання ID таймаута

    const cleanup = () => { // Функція для очищення
        if (timeoutId) clearTimeout(timeoutId);
        // Прибираємо обробники, щоб уникнути витоків пам'яті
        video.onloadedmetadata = null;
        video.onseeked = null;
        video.onerror = null;
        // Можна видалити елементи, хоча GC має впоратись
        // video.remove();
        // canvas.remove();
    };

    const thumbnailPromise = new Promise((resolve, reject) => {
        let hasResolved = false; // Прапорець для запобігання подвійному виклику

        // Таймаут завантаження (збільшено до 15 секунд)
        timeoutId = setTimeout(() => {
             if (hasResolved) return;
             hasResolved = true;
             reject(new Error('Таймаут завантаження метаданих відео (15 сек)'));
         }, 15000); // <-- ЗБІЛЬШЕНО ТАЙМАУТ

        video.onloadedmetadata = () => {
            console.log(`Метадані завантажено для "${videoName}"`);
            // Затримка перед встановленням currentTime
            setTimeout(() => {
                 if (hasResolved) return;
                 // Беремо кадр з 1 секунди (або середини)
                 const seekTime = Math.min(1, video.duration / 2 || 0.5);
                 console.log(`Встановлюємо час ${seekTime} для "${videoName}"`);
                 video.currentTime = seekTime;
             }, 100);
        };

        video.onseeked = () => {
            if (hasResolved) return;
            console.log(`Перемотка завершена для "${videoName}" на час ${video.currentTime}`);

            // Використовуємо requestAnimationFrame для малювання після рендеру браузера
            requestAnimationFrame(() => {
                if (hasResolved || !context) return;
                hasResolved = true; // Встановлюємо прапорець тут

                try {
                     // Розрахунок пропорцій
                     const aspectRatio = video.videoWidth / video.videoHeight;
                     let drawWidth = thumbSize;
                     let drawHeight = thumbSize;
                     let x = 0;
                     let y = 0;

                     if (aspectRatio > 1) { // Горизонтальне
                         drawHeight = thumbSize / aspectRatio;
                         y = (thumbSize - drawHeight) / 2;
                     } else { // Вертикальне / квадратне
                         drawWidth = thumbSize * aspectRatio;
                         x = (thumbSize - drawWidth) / 2;
                     }

                    console.log(`Малюємо кадр для "${videoName}"`);
                     // Малюємо кадр
                     context.drawImage(video, x, y, drawWidth, drawHeight);
                     // Конвертуємо в JPEG
                     resolve(canvas.toDataURL('image/jpeg', 0.7)); // Якість 70%
                } catch (drawError) {
                     reject(new Error(`Помилка малювання на canvas: ${drawError}`));
                } finally {
                     cleanup(); // Очистка після успішного малювання або помилки
                 }
            });
        };

         // Обробник помилок відео
         video.onerror = (e) => {
             if (hasResolved) return;
             hasResolved = true; // Встановлюємо, щоб таймаут не спрацював
             let errorMsg = 'Помилка відео елемента';
             if (video.error) {
                 console.error("Код помилки відео:", video.error.code); // Логуємо код помилки
                 switch (video.error.code) {
                     case 1: errorMsg = 'Завантаження відео перервано (MEDIA_ERR_ABORTED).'; break;
                     case 2: errorMsg = 'Помилка мережі при завантаженні (MEDIA_ERR_NETWORK).'; break;
                     case 3: errorMsg = 'Помилка декодування відео (MEDIA_ERR_DECODE).'; break;
                     case 4: errorMsg = 'Формат відео не підтримується (MEDIA_ERR_SRC_NOT_SUPPORTED).'; break;
                     default: errorMsg = `Невідома помилка відео (код: ${video.error.code}).`;
                 }
             }
             reject(new Error(errorMsg));
             cleanup(); // Очистка при помилці
         };

        // Призначаємо src і намагаємось запустити play() для ініціалізації
        try {
            video.src = videoDataUrl;
            // video.play().catch(/*...*/); // Play може бути необов'язковим, якщо currentTime достатньо
        } catch (srcError) {
             if (hasResolved) return;
             hasResolved = true;
             reject(new Error(`Помилка встановлення src для відео: ${srcError}`));
             cleanup();
        }
    });

    // Запускаємо Promise і оновлюємо src зображення
    try {
        const thumbnailUrl = await thumbnailPromise;
        imgElement.src = thumbnailUrl;
        imgElement.style.objectFit = 'cover'; // Встановлюємо cover для згенерованого thumbnail
        console.log(`Thumbnail успішно згенеровано для "${videoName}"`);
    } catch (error) {
        console.error(`Не вдалося згенерувати thumbnail для відео "${videoName}":`, error.message || error);
        // Залишається placeholder
    }
}

    function applyTheme(themeName) {
        document.body.className = '';
        document.body.classList.add(`theme-${themeName}`);
        if (themeSelector.value !== themeName) {
            themeSelector.value = themeName;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showPoolMessage(message, type = 'error') {
        if (!poolMessageDiv) return;
        poolMessageDiv.textContent = message;
        poolMessageDiv.className = 'message-box'; // Reset classes

        if (type === 'error') poolMessageDiv.classList.add('error-message');
        else if (type === 'warning') poolMessageDiv.classList.add('warning-message');
        else if (type === 'info') poolMessageDiv.classList.add('info-message');

        if (type !== 'hidden') poolMessageDiv.classList.remove('hidden');
        else poolMessageDiv.classList.add('hidden');
    }

function resetToInitialState() {
        isBattleRunning = false;
        battleWinner = null;
        battleHistory = [];
        currentRoundParticipants = [];
        nextRoundParticipants = [];
        currentMatchup = [];
        currentRound = 0;
        currentMatchupIndex = 0;
        totalMatchupsInRound = 0;
        stopVotingTimer('reset');

        // Оновлення видимості UI
        if (battleArea) battleArea.classList.add('hidden');
        if (battlePhaseVotingBlock) battlePhaseVotingBlock.classList.add('hidden');
        if (voteDisplay1) voteDisplay1.classList.add('hidden');
        if (voteDisplay2) voteDisplay2.classList.add('hidden');
        if (startVotingBtn) startVotingBtn.disabled = false;
        if (battleStatusDiv) battleStatusDiv.classList.add('hidden');
        if (resultsArea) resultsArea.classList.add('hidden');
        if (controlsSection) controlsSection.classList.remove('hidden');
        if (poolSection) poolSection.classList.remove('hidden');
        if (startBattleBtn) startBattleBtn.classList.remove('hidden');
        if (resetBattleBtn) resetBattleBtn.classList.add('hidden');
        document.body.classList.remove('results-visible-padding');

        // Скидання контрольних елементів (і медіа, і текст)
        if (addFilesBtn) addFilesBtn.disabled = false; 
        if (fileInput) fileInput.disabled = false;
        if (textFileInput) textFileInput.value = '';
        if (backgroundImageInput) backgroundImageInput.value = '';
        if (loadTextParticipantsBtn) loadTextParticipantsBtn.disabled = true;

        /*
        // Скидання режиму на 'media' за замовчуванням? (Або зберігати останній?)
        // Якщо скидати:
        // if (participantModeToggle && participantModeToggle.checked) {
        //     participantModeToggle.checked = false;
        //     handleParticipantModeChange({ target: { checked: false } }); // Викличе оновлення UI
        // } else {
        //     // Якщо режим і так 'media', просто оновити кнопки
        //     // updateAddFilesButtonState(); // <--- БІЛЬШЕ НЕ ТУТ
        //     // updateLoadTextButtonState(); // <--- БІЛЬШЕ НЕ ТУТ
        // }
        */

        // !!! ВИКЛИКИ ПЕРЕМІЩЕНО СЮДИ !!!
        updateAddFilesButtonState(); // Оновлюємо стан кнопки "Додати медіа"
        updateLoadTextButtonState(); // Оновлюємо стан кнопки "Завантажити текст"

        renderFilePoolList(); // Це також викличе checkPoolState
        console.log("Стан скинуто до початкового.");
    }
/**
     * Знаходить всі елементи учасників і додає обробники наведення миші для ДИНАМІЧНОГО прев'ю.
     */
    function setupPreviewHover() { // Перейменовано
        const bracketViewElement = document.getElementById('bracketView');
        if (!bracketViewElement) return;
        const participantElements = bracketViewElement.querySelectorAll('#bracketRoundsWrapper .bracket-participant');

        participantElements.forEach(participantDiv => {
            participantDiv.removeEventListener('mouseenter', handleParticipantHover);
            participantDiv.removeEventListener('mouseleave', handleParticipantLeave);
            // Додаємо обробник лише якщо є що показувати в прев'ю
            if (participantDiv.dataset.previewUrl) {
                participantDiv.addEventListener('mouseenter', handleParticipantHover);
                participantDiv.addEventListener('mouseleave', handleParticipantLeave);
            }
        });
        console.log(`Обробники наведення для ДИНАМІЧНОГО прев'ю встановлено для ${participantElements.length} елементів.`);
    }

    /**
     * Обробник події наведення миші: запускає таймер на створення/показ прев'ю.
     */
    function handleParticipantHover(event) {
        const participantDiv = event.currentTarget;

        // Перевіряємо, чи вже не запущено таймер або не показано прев'ю для цього елемента
        if (participantDiv._playDelayTimeoutId || participantDiv._activePreviewElement) {
            return;
        }

        // Встановлюємо ТАЙМЕР СТВОРЕННЯ ПРЕВ'Ю через 3 секунди
        participantDiv._playDelayTimeoutId = setTimeout(() => {
            // Перевіряємо ще раз, чи курсор все ще над елементом
             if (!participantDiv.matches(':hover')) {
                 participantDiv._playDelayTimeoutId = null;
                 return;
             }
             createAndShowPreview(participantDiv); // Викликаємо функцію створення
        }, 1200); // 3 секунди затримки
    }


/**
 * Створює, позиціонує та показує елемент прев'ю, додаючи його до body.
 * Запускає відтворення для відео та АУДІО після появи.
 * @param {HTMLElement} participantDiv - Елемент учасника, на який навели курсор.
 */
function createAndShowPreview(participantDiv) {
    // Отримуємо дані з атрибутів
    const previewUrl = participantDiv.dataset.previewUrl;
    const mediaType = participantDiv.dataset.mediaType;
    // Отримуємо ім'я для логів (з видимого елемента або за замовчуванням)
    const participantName = participantDiv.querySelector('.participant-name')?.textContent || (mediaType === 'video' ? 'video' : (mediaType === 'audio' ? 'audio' : 'media'));

    // Перевірки: чи є URL, чи не існує вже активного прев'ю для цього елемента
    if (!previewUrl || participantDiv._activePreviewElement) return;

    console.log(`Створюємо прев'ю для "${participantName}" (тип: ${mediaType})`);

    // 1. Створюємо обгортку прев'ю
    const previewWrapper = document.createElement('div');
    previewWrapper.classList.add('bracket-preview-wrapper'); // Клас для CSS стилів вигляду
    previewWrapper.style.position = 'fixed'; // Позиціонування відносно вікна браузера
    previewWrapper.style.zIndex = '110';     // Високий z-index, щоб бути поверх інших
    previewWrapper.style.visibility = 'hidden';// Поки ховаємо для розрахунків

    // 2. Створюємо відповідний медіа-елемент всередині обгортки
    let previewMedia; // Змінна для img, video або audio
    if (mediaType === 'image') {
        previewMedia = document.createElement('img');
        previewMedia.loading = "lazy"; // Ледача загрузка для зображень
        previewMedia.alt = "Preview";
    } else if (mediaType === 'video') {
        previewMedia = document.createElement('video');
        previewMedia.muted = false;      // Відтворення відео без звуку
        previewMedia.loop = true;       // Зациклюємо відео (опціонально)
        previewMedia.preload = "metadata"; // Не завантажуємо все відео одразу
        previewMedia.playsInline = true;  // Для коректної роботи на мобільних
        previewMedia.dataset.isVideoPreview = "true"; // Маркер (хоча вже не використовується в hover логіці)
    } else if (mediaType === 'audio') {
         previewMedia = document.createElement('audio');
         previewMedia.preload = "metadata";
         previewMedia.loop = false;      // Аудіо не зациклюємо
         previewMedia.muted = false;     // Аудіо зі звуком!
         previewMedia.volume = 0.5;    // Встановлюємо гучність на 50% (приклад)
         // Не додаємо атрибут controls, керуємо програмно
    } else {
         console.warn("Невідомий тип медіа для створення прев'ю:", mediaType);
         return; // Не створюємо прев'ю, якщо тип невідомий
    }

    // Встановлюємо джерело і клас для медіа-елемента
    previewMedia.src = previewUrl;
    previewMedia.classList.add('bracket-preview-media');
    previewWrapper.appendChild(previewMedia); // Додаємо медіа в обгортку

    // 3. Додаємо обгортку в кінець body і зберігаємо посилання на неї
    document.body.appendChild(previewWrapper);
    participantDiv._activePreviewElement = previewWrapper;

    // 4. Розраховуємо позицію і робимо видимим (асинхронно, щоб браузер встиг розрахувати розміри)
    requestAnimationFrame(() => {
         // Перевіряємо ще раз, чи прев'ю все ще потрібне (курсор не пішов за цей час)
         if (!participantDiv._activePreviewElement) return;

         const participantRect = participantDiv.getBoundingClientRect(); // Позиція елемента учасника
         const previewRect = previewWrapper.getBoundingClientRect(); // Розміри створеного прев'ю
         const spacing = 10; // Бажаний відступ від елемента учасника

         // Розрахунок top/left, щоб прев'ю було над учасником і по центру
         let top = participantRect.top - previewRect.height - spacing;
         let left = participantRect.left + (participantRect.width / 2) - (previewRect.width / 2);

         // Корекція позиції, щоб прев'ю не виходило за межі вікна
         if (top < spacing) { // Якщо не влазить зверху, показуємо знизу
             top = participantRect.bottom + spacing;
         }
         if (top + previewRect.height > window.innerHeight - spacing) { // Якщо не влазить знизу (навіть після переміщення)
             top = Math.max(spacing, window.innerHeight - previewRect.height - spacing); // Притискаємо до нижнього краю
         }
         if (left < spacing) { // Якщо вилазить зліва
             left = spacing;
         }
         if (left + previewRect.width > window.innerWidth - spacing) { // Якщо вилазить справа
             left = Math.max(spacing, window.innerWidth - previewRect.width - spacing); // Притискаємо до правого краю
         }

         // Встановлюємо розраховану позицію
         previewWrapper.style.top = `${top}px`;
         previewWrapper.style.left = `${left}px`;

         // Робимо видимим з анімацією
         previewWrapper.style.visibility = 'visible'; // Спочатку visibility
         requestAnimationFrame(()=>{ // Потім opacity/transform для анімації
              previewWrapper.style.opacity = '1';
              previewWrapper.style.transform = 'scale(1)';
         });

        // 5. Запускаємо ВІДЕО або АУДІО і таймер зупинки на 10 секунд
        if (mediaType === 'video' || mediaType === 'audio') {
             console.log(`Спроба відтворення ${mediaType} для "${participantName}"`);
             previewMedia.play().then(() => {
                console.log(`${mediaType} відтворення почалося для "${participantName}"`);
                // Встановлюємо таймер зупинки
                participantDiv._pauseTimeoutId = setTimeout(() => {
                    // Перевіряємо, чи елемент все ще існує і чи він не на паузі
                    if (previewMedia && typeof previewMedia.pause === 'function' && !previewMedia.paused) {
                         previewMedia.pause();
                         previewMedia.currentTime = 0; // Скидаємо час при зупинці
                         console.log(`${mediaType} прев'ю зупинено за 10с таймаутом для "${participantName}"`);
                    }
                    participantDiv._pauseTimeoutId = null; // Очищуємо ID таймера
                }, 10000); // 10 секунд відтворення
             }).catch(e => {
                 console.warn(`Помилка автопрогравання ${mediaType} для "${participantName}":`, e);
             });
        }
        // Скидаємо ID таймера затримки запуску, бо він спрацював
        participantDiv._playDelayTimeoutId = null;
    });
}
    /**
     * Обробник події відведення миші: скасовує таймери та видаляє прев'ю, зупиняє медіа.
     */
    function handleParticipantLeave(event) {
        const participantDiv = event.currentTarget;

        // Скасовуємо таймери (як було)
        if (participantDiv._playDelayTimeoutId) clearTimeout(participantDiv._playDelayTimeoutId);
        if (participantDiv._pauseTimeoutId) clearTimeout(participantDiv._pauseTimeoutId);
        participantDiv._playDelayTimeoutId = null;
        participantDiv._pauseTimeoutId = null;

        // Знаходимо і видаляємо активний елемент прев'ю
        const previewToRemove = participantDiv._activePreviewElement;
        if (previewToRemove) {
            // Плавне зникнення
            previewToRemove.style.opacity = '0';
            previewToRemove.style.transform = 'scale(0.9)';
            setTimeout(() => {
                // === ОНОВЛЕНО ТУТ: Зупиняємо і відео, і аудіо ===
                const mediaElement = previewToRemove.querySelector('.bracket-preview-media');
                if(mediaElement && typeof mediaElement.pause === 'function' && !mediaElement.paused) {
                     mediaElement.pause(); // Зупиняємо будь-яке медіа
                     mediaElement.currentTime = 0; // Скидаємо час для обох типів
                     console.log(`Медіа зупинено для прев'ю: ${mediaElement.src.substring(0,50)}...`);
                }
                // =============================================
                if(document.body.contains(previewToRemove)){
                     previewToRemove.remove();
                }
            }, 200); // Час = transition-duration

            participantDiv._activePreviewElement = null;
        }
    }
	// ===== НОВА ФУНКЦІЯ ДЛЯ КОНСОЛІ =====
    /**
     * Достроково завершує поточний раунд голосування (для тестування).
     * Викликати з консолі розробника командою: endVotingNow()
     */
    window.endVotingNow = function() {
        // Перевіряємо, чи голосування взагалі активне (з таймером або без)
        if (isVotingActive) {
            console.log("КОНСОЛЬ: Дострокове завершення голосування...");
            // Викликаємо stopVotingTimer з відповідною причиною
            stopVotingTimer('console_command');
            console.log("КОНСОЛЬ: Голосування завершено командою.");
        } else {
            console.log("КОНСОЛЬ: Голосування наразі не активне, нема чого завершувати.");
        }
    }
    // ===== КІНЕЦЬ НОВОЇ ФУНКЦІЇ =====
	// ===== НОВА ФУНКЦІЯ ДЛЯ КОНСОЛІ (ІМІТАЦІЯ НІЧИЄЇ) =====
    /**
     * Імітує завершення голосування з рівним рахунком (для тестування монетки).
     * Викликати з консолі розробника: simulateTie() або simulateTie(бажана_кількість_голосів)
     * @param {number} [count=5] Кількість голосів для кожної сторони.
     */
    window.simulateTie = function(count = 5) {
        console.log(`КОНСОЛЬ: Спроба імітації нічиєї з рахунком ${count}-${count}...`);

        // 1. Перевірки
        if (currentVotingMode !== 'twitch') {
            console.error("КОНСОЛЬ: Імітація нічиєї можлива тільки в режимі 'З чатом'.");
            return;
        }
        if (!isVotingActive) {
            console.error("КОНСОЛЬ: Голосування не активне. Спочатку почніть голосування.");
            return;
        }
        if (!twitch || typeof twitch.votes === 'undefined') {
             console.error("КОНСОЛЬ: Об'єкт twitch або twitch.votes не знайдено.");
             return;
        }
        if (count <= 0) {
             console.error("КОНСОЛЬ: Кількість голосів для нічиєї має бути більше нуля.");
             return;
        }

        // 2. Встановлення рівного рахунку
        console.log(`КОНСОЛЬ: Встановлення голосів: !1=${count}, !2=${count}`);
        twitch.votes['!1'] = count;
        twitch.votes['!2'] = count;

        // 3. Оновлення дисплею (щоб візуально побачити нічию перед монеткою)
        if (typeof twitch.updateVoteDisplay === 'function') {
            twitch.updateVoteDisplay();
        } else {
             console.warn("КОНСОЛЬ: Функція twitch.updateVoteDisplay() не знайдена.");
        }


        // 4. Зупинка поточного таймера та виклик логіки завершення
        console.log("КОНСОЛЬ: Зупинка таймера та виклик stopVotingTimer('timer_end') для обробки нічиєї...");
        // Зупиняємо інтервал, навіть якщо він був безкінечним (не мав ID)
        if (votingTimerIntervalId) {
            clearInterval(votingTimerIntervalId);
            votingTimerIntervalId = null;
        }
        isVotingActive = false; // Вручну ставимо, що голосування не активне (як робить stopVotingTimer)

        // Викликаємо stopVotingTimer з причиною 'timer_end',
        // яка тепер має перевірити рахунок і показати монетку
        stopVotingTimer('timer_end');

        console.log("КОНСОЛЬ: Імітація нічиєї завершена.");
    }
    // ===== КІНЕЦЬ НОВОЇ ФУНКЦІЇ =====

}); // Кінець DOMContentLoaded
