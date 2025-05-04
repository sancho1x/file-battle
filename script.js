// Змінна для зберігання посилання на pop-up вікно голосів
let voteStatusPopup = null;
window.battleVoteStatusPopup = voteStatusPopup; // Робимо глобально доступним для зручності

// Глобальна функція для надсилання оновлень голосів та суфіксів до pop-up
// ЦЯ ФУНКЦІЯ НАДСИЛАЄ ПОВІДОМЛЕННЯ
window.sendVoteUpdateToPopup = function(votes1, suffix1, votes2, suffix2) { // <--- ПЕРЕКОНАЙТЕСЯ, ЩО ПРИЙМАЮТЬСЯ ВСІ 4 АРГУМЕНТИ
    console.log(`  ⬆️ sendVoteUpdateToPopup: Received data for popup: ${votes1}${suffix1} | ${votes2}${suffix2}. Attempting to send message.`); // Лог про отримані дані

    const currentPopup = window.battleVoteStatusPopup;

    // Перевіряємо, чи pop-up вікно відкрито і доступне
    if (currentPopup && !currentPopup.closed) {
        try {
            // <--- КЛЮЧОВИЙ МОМЕНТ ДЛЯ GITHUB PAGES: Визначаємо цільове походження ---
            // Походження pop-up вікна буде таким самим, як походження основного вікна
            const targetOrigin = window.location.origin;
            // <--- Кінець ключового моменту ---

            // Надсилаємо об'єкт з даними про голоси та суфікси
            currentPopup.postMessage({
                 type: 'updateVotes', // Тип повідомлення
                 votes1: votes1,
                 suffix1: suffix1, // Надсилаємо суфікси
                 votes2: votes2,
                 suffix2: suffix2  // Надсилаємо суфікси
            }, targetOrigin); // <--- Надсилаємо повідомлення до певного походження

             console.log(`  ⬆️ sendVoteUpdateToPopup: Message sent successfully to origin: ${targetOrigin}`); // Лог про успішне надсилання
        } catch (error) {
            console.warn(`  ❌ sendVoteUpdateToPopup: Failed to send message:`, error); // Лог про помилку надсилання
            console.error("Деталі помилки при надсиланні:", error);
            // Якщо помилка надсилання, скидаємо посилання, можливо вікно закрилось неочікувано
            window.battleVoteStatusPopup = null;
        }
    } else {
        console.log("  ⬆️ sendVoteUpdateToPopup: Popup window not open or accessible. Message not sent."); // Лог, якщо pop-up не відкритий
    }
};

// <--- ДОДАНО: Глобальна функція для очищення посилання на pop-up при його закритті користувачем ---
window.clearBattleVotePopupReference = function() {
     console.log("  Main window: Clearing pop-up reference.");
     window.battleVoteStatusPopup = null;
};
// <--- КІНЕЦЬ ДОДАНОГО ---

// === КІНЕЦЬ ДОДАНОГО ГЛОБАЛЬНОГО КОДУ ===
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
	const LOCAL_FALLBACK_IMAGE_2 = 'media/coin_images/default_2.png'; // Шлях до дефолтного зображення 2
	const themeToggleBtn = document.getElementById('theme-toggle');
    const imageLoadingMessageContainer = document.getElementById('imageLoadingMessageContainer'); // <-- НОВЕ
    const textValidationMessageContainer = document.getElementById('textValidationMessageContainer'); // <-- НОВЕ
	const poolReductionControls = document.getElementById('poolReductionControls'); // Новий контейнер
	const poolSizeSelect = document.getElementById('poolSizeSelect'); // Новий select
	const confirmPoolReductionBtn = document.getElementById('confirmPoolReductionBtn'); // Нова кнопка
	const mediaLoadingMessageContainer = document.getElementById('mediaLoadingMessageContainer');
	const hideVotesCheckbox = document.getElementById('hideVotesCheckbox'); // <-- НОВЕ
    const voteCountDisplays = document.querySelectorAll('.vote-count'); // <-- НОВЕ (колекція)
	const voteDisplay1Element = document.getElementById('voteDisplay1');
	const voteDisplay2Element = document.getElementById('voteDisplay2');

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
	let hideVotesEnabled = false; // <-- НОВЕ
	let clickCount = 0; // Лічильник послідовних кліків
    let lastClickTime = 0; // Час останнього кліка
    let clickTimeout = null; // Для скидання лічильника кліків через таймаут
    const doubleClickDelay = 1000; // Максимальний час між кліками для потрійного кліка (в мс)

    // --- Ініціалізація ---
    loadSettings();
    updateAddFilesButtonState();
    checkPoolState();

    // --- Обробники Подій ---
if (voteDisplay1Element) {
    voteDisplay1Element.addEventListener('click', function(event) {
        // <--- ЛОГІКА ПОТРІЙНОГО КЛІКА ---
        const currentTime = new Date().getTime(); // Поточний час кліка

        // Якщо клік занадто повільний після попереднього, скидаємо лічильник
        if (currentTime - lastClickTime > doubleClickDelay) {
            clickCount = 1;
        } else {
            // Інакше збільшуємо лічильник
            clickCount++;
        }

        lastClickTime = currentTime; // Оновлюємо час останнього кліка

        // Очищаємо попередній таймаут, якщо він був
        clearTimeout(clickTimeout);

        // Встановлюємо таймаут для скидання лічильника, якщо наступний клік буде занадто пізно
        clickTimeout = setTimeout(() => {
            clickCount = 0; // Скидаємо лічильник, якщо не було швидкого наступного кліка
            // console.log("  📊   Click counter reset."); // Опціональний лог
        }, doubleClickDelay); // Час для таймауту такий самий, як максимальна затримка між кліками

        // Перевіряємо, чи досягли 2 кліків
        if (clickCount === 2) {
            console.log("  📊   Double click detected on vote display."); // Лог про потрійний клік

            // <--- ВИКЛИКАЄМО ФУНКЦІЮ ВІДКРИТТЯ POP-UP ---
            displayVoteStatusPopup();
            // <--- КІНЕЦЬ ВИКЛИКУ ---

            // Скидаємо лічильник кліків після виявлення потрійного кліка
            clickCount = 0;
            lastClickTime = 0;
             // Таймаут теж бажано скинути після успішного потрійного кліка
             clearTimeout(clickTimeout);
        }
        // <--- КІНЕЦЬ ЛОГІКИ ПОТРІЙНОГО КЛІКА ---
    });
}

if (voteDisplay2Element) {
    voteDisplay2Element.addEventListener('click', function(event) {
if (clickCount === 2) {
}
         const currentTime = new Date().getTime();

         if (currentTime - lastClickTime > doubleClickDelay) {
             clickCount = 1;
         } else {
             clickCount++;
         }

         lastClickTime = currentTime;

         clearTimeout(clickTimeout);

         clickTimeout = setTimeout(() => {
             clickCount = 0;
             // console.log("  📊   Click counter reset.");
         }, doubleClickDelay);

         if (clickCount === 2) {
             console.log("  📊   Double click detected on vote display.");

             // <--- ВИКЛИКАЄМО ФУНКЦІЮ ВІДКРИТТЯ POP-UP ---
             displayVoteStatusPopup();
             // <--- КІНЕЦЬ ВИКЛИКУ ---

             // <--- ДОДАЙТЕ СЮДИ КОД ДЛЯ ЗНЯТТЯ БЛЮРУ, ЯКЩО ВІН БУВ ---
             // toggleBlur(event.target); // Приклад
             // <--- КІНЕЦЬ КОДУ БЛЮРУ ---

             clickCount = 0;
             lastClickTime = 0;
             clearTimeout(clickTimeout);
         }
         // <--- КІНЕЦЬ ЛОГІКИ ПОТРІЙНОГО КЛІКА ---
    });
}
// Додаємо обробники до кожного лічильника для одночасного перемикання розмиття
    voteCountDisplays.forEach(clickedDisplay => { // Змінили назву змінної для ясності
        clickedDisplay.addEventListener('click', () => {
            // Перевіряємо умови: опція увімкнена І голосування з таймером активне
            if (hideVotesEnabled && isVotingActive && selectedVotingDuration > 0) {

                // Перевіряємо, чи був елемент, на який клікнули, РОЗМИТИМ
                const isCurrentlyBlurred = clickedDisplay.classList.contains('blurred-votes');

                // Застосовуємо дію до ВСІХ лічильників
                voteCountDisplays.forEach(el => {
                    if (isCurrentlyBlurred) {
                        // Якщо клікнули на розмитий, то ЗНІМАЄМО розмиття з усіх
                        el.classList.remove('blurred-votes');
                    } else {
                        // Якщо клікнули на НЕ розмитий, то ДОДАЄМО розмиття до усіх
                        el.classList.add('blurred-votes');
                    }
                });

                // Логуємо дію
                if (isCurrentlyBlurred) {
                    console.log("Розмиття знято вручну з обох лічильників.");
                } else {
                     console.log("Розмиття застосовано вручну до обох лічильників.");
                }

            } else if (isVotingActive) {
                // Лог, чому перемикання не спрацювало
                console.log("Клік по лічильнику, але розмиття не перемикається (опція вимкнена або голосування без таймера).");
            }
        });
    });
	if (hideVotesCheckbox) { // <-- НОВЕ
    hideVotesCheckbox.addEventListener('change', () => {
        hideVotesEnabled = hideVotesCheckbox.checked;
        console.log(`Стан "Приховувати голоси" змінено на: ${hideVotesEnabled}`);
        saveSettings(); // Зберігаємо новий стан
        // Якщо голосування вже йде, можливо, застосувати/зняти розмиття одразу?
        if (isVotingActive && selectedVotingDuration > 0) {
            if (hideVotesEnabled) {
                voteCountDisplays.forEach(el => el.classList.add('blurred-votes'));
            } else {
                voteCountDisplays.forEach(el => el.classList.remove('blurred-votes'));
            }
        }
    });
}
	if (confirmPoolReductionBtn) {
    confirmPoolReductionBtn.addEventListener('click', handleConfirmPoolReduction);
}
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
	    if (themeToggleBtn) { // Перевіряємо, чи елемент існує
        themeToggleBtn.addEventListener('click', () => {
            // Визначаємо поточну тему за класом body
            const isDark = document.body.classList.contains('theme-dark');
            // Визначаємо наступну тему
            const nextTheme = isDark ? 'light' : 'dark'; // Якщо темна, стане світла; якщо світла, стане темна
            // Застосовуємо нову тему
            applyTheme(nextTheme);
            // Зберігаємо нову тему в налаштуваннях
            saveSettings();
        });
    }
    battleTitleInput.addEventListener('input', saveSettings);
    voteButtons.forEach(button => {
        button.addEventListener('click', handleVoteButtonClick);
    });

    // --- Функції ---
	    function handleShowVoteStatusClick() {
        displayVoteStatusPopup(); // Просто відкриваємо вікно
    }
    // <--- КІНЕЦЬ ДОДАНОГО ---

    function displayVoteStatusPopup() {
        // Якщо вікно вже відкрите, фокусуємо його
        if (voteStatusPopup && !voteStatusPopup.closed) {
            voteStatusPopup.focus();
            console.log("  Main window: Popup already open, focusing.");
            // Можливо, тут варто надіслати поточні дані ще раз, якщо pop-up був відкритий давно
             const currentVotes1 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!1'] !== undefined) ? twitch.votes['!1'] : 0;
             const currentVotes2 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!2'] !== undefined) ? twitch.votes['!2'] : 0;
             const currentSuffix1 = typeof window.getVoteSuffix === 'function' ? window.getVoteSuffix(currentVotes1) : ' голосів';
             const currentSuffix2 = typeof window.getVoteSuffix === 'function' ? window.getVoteSuffix(currentVotes2) : ' голосів';
             window.sendVoteUpdateToPopup(currentVotes1, currentSuffix1, currentVotes2, currentSuffix2);

            return; // Виходимо, якщо вікно вже відкрите
        }

        // === КЛЮЧОВИЙ МОМЕНТ: ВІДКРИВАЄМО ОКРЕМИЙ HTML-ФАЙЛ ===
        // Переконайтеся, що шлях 'vote-status-popup.html' правильний відносно battle.html
        voteStatusPopup = window.open('vote-status-popup.html', 'VoteStatusPopup', 'width=400,height=100,resizable=yes');
        window.battleVoteStatusPopup = voteStatusPopup; // Оновлюємо глобальне посилання

        if (!voteStatusPopup) {
            alert("Не вдалося відкрити спливаюче вікно. Будь ласка, дозвольте pop-up вікна.");
            console.error("  Main window: Failed to open popup window.");
            return;
        }

        console.log("  Main window: Popup window opened. Sending initial data.");

        // <--- Надсилаємо початкові голоси та суфікси після відкриття ---
        // Це потрібно, щоб pop-up одразу показав актуальний рахунок при відкритті
        const initialVotes1 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!1'] !== undefined) ? twitch.votes['!1'] : 0;
        const initialVotes2 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!2'] !== undefined) ? twitch.votes['!2'] : 0;
        // Викликаємо глобальну функцію getVoteSuffix (з voting 1.1.js)
        const initialSuffix1 = typeof window.getVoteSuffix === 'function' ? window.getVoteSuffix(initialVotes1) : ' голосів';
        const initialSuffix2 = typeof window.getVoteSuffix === 'function' ? window.getVoteSuffix(initialVotes2) : ' голосів';

        // Надсилаємо ці початкові дані pop-up вікну.
        // Можливо, потрібна невелика затримка, щоб HTML та скрипт pop-up встигли завантажитись
        // перед отриманням першого повідомлення. Хоча з HTML-файлом це менш критично.
        if (window.sendVoteUpdateToPopup) { // Перевіряємо, чи функція визначена
             // Додамо невелику затримку для надійності (опціонально, але рекомендовано)
             setTimeout(() => {
                 window.sendVoteUpdateToPopup(initialVotes1, initialSuffix1, initialVotes2, initialSuffix2);
             }, 100); // Затримка 100 мс
        } else {
             console.warn("  Main window: window.sendVoteUpdateToPopup is not available to send initial votes.");
        }
        // <--- Кінець надсилання початкових даних ---
    }
// У файлі script.js, знайдіть та замініть вашу функцію writeVotePopupContent на цю:
function writeVotePopupContent(popupDocument) {
     // Отримуємо поточний рахунок для початкового відображення
    const initialVotes1 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!1'] !== undefined) ?
         twitch.votes['!1'] : 0;
    const initialVotes2 = (typeof twitch !== 'undefined' && twitch.votes && twitch.votes['!2'] !== undefined) ? twitch.votes['!2'] : 0;

        popupDocument.open();
        // Ось тут має бути зворотна лапка `
        popupDocument.write(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Голоси Батлу</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                 </style>
                <script src="vote-popup-script.js"></script>
            </head>
            <body class="vote-status-popup">
                <div class="vote-popup-container">
<div id="voteCountsDisplay">
    Учасник 1: <span>${initialVotes1}</span> <br> Учасник 2: <span>${initialVotes2}</span>
</div>
                </div>
            </body>
            </html>
        `); // І ось тут має бути зворотна лапка `
        popupDocument.close();
    }
function handleParticipantModeChange(event) {
    const isTextMode = event.target.checked;
    console.log(`Switching participant mode to: ${isTextMode ? 'Text' : 'Media'}`);

    // --- Ховаємо повідомлення обох режимів при перемиканні ---
    showMediaLoadingMessage('', 'hidden'); // Ховаємо медіа-повідомлення
    showImageLoadingMessage('', 'hidden');   // Ховаємо повідомлення завантаження фону
    showTextValidationMessage('', 'hidden'); // Ховаємо повідомлення валідації тексту
    // --- Кінець доданого ---


    if (isTextMode) { // Перехід в режим 'text'
        currentParticipantMode = 'text';
        mediaInputsContainer?.classList.add('hidden');
        textInputsContainer?.classList.remove('hidden');
        mediaModeLabel?.classList.remove('active');
        textModeLabel?.classList.add('active');

        // Логіка підтвердження очищення пулу медіа, якщо він не порожній
        if (initialFilePool.length > 0 && !initialFilePool[0]?.isTextParticipant) {
             if (confirm('Перехід в текстовий режим очистить поточний пул медіа-файлів. Продовжити?')) {
                 initialFilePool = [];
                 renderFilePoolList(); // Це також викличе checkPoolState
              } else {
                 // Якщо користувач скасував, повертаємо перемикач і виходимо
                 event.target.checked = false;
                 // Можливо, краще викликати handleParticipantModeChange({ target: { checked: false } });
                 // Щоб коректно оновити UI назад в медіа-режим
                 handleParticipantModeChange({ target: { checked: false } });
                 return;
              }
        }

        if(fileInput) fileInput.value = ''; // Очищаємо поле вибору медіа-файлів
        updateAddFilesButtonState(); // Оновлюємо стан кнопки додавання медіа
        updateLoadTextButtonState(); // Оновлюємо стан кнопки завантаження тексту

    } else { // Перехід в режим 'media'
        currentParticipantMode = 'media';
        mediaInputsContainer?.classList.remove('hidden');
        textInputsContainer?.classList.add('hidden');
        mediaModeLabel?.classList.add('active');
        textModeLabel?.classList.remove('active');

        // Логіка очищення пулу, якщо він містить текстових учасників
        if (initialFilePool.length > 0 && initialFilePool[0]?.isTextParticipant) {
             console.log("Clearing text pool due to switching to Media mode.");
             initialFilePool = [];
             renderFilePoolList(); // Це також викличе checkPoolState
        }

        if(textFileInput) textFileInput.value = ''; // Очищаємо поле вибору текстового файлу
        if(backgroundImageInput) backgroundImageInput.value = ''; // Очищаємо поле вибору фону
        updateLoadTextButtonState(); // Оновлюємо стан кнопки завантаження тексту
        updateAddFilesButtonState(); // Оновлюємо стан кнопки додавання медіа
    }

    // Ці функції викликаються після зміни пулу, щоб оновити UI пулу та кнопки старту батлу
    // checkPoolState(); // Цей виклик перенесено або він відбувається через renderFilePoolList
    saveSettings();
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
    // --- Етап 0: Підготовка (без змін) ---
    if (currentParticipantMode !== 'text' || !textFileInput?.files?.[0] || !backgroundImageInput?.files?.[0]) {
        updateLoadTextButtonState(); return;
    }
    const txtFile = textFileInput.files[0];
    const imgFile = backgroundImageInput.files[0];
    if(loadTextParticipantsBtn) loadTextParticipantsBtn.disabled = true;
    if(clearAllBtn) clearAllBtn.disabled = true;
    showImageLoadingMessage('Перевірка фону...', 'info');
    showTextValidationMessage('Перевірка текстового файлу...', 'info');
    showPoolMessage('', 'hidden');
    initialFilePool = [];
    renderFilePoolList();

    let bgImageUrl = null;
    let imageIsValid = false;
    let textProcessingSuccess = false;
    let successfulParticipants = [];
    let failedParticipantsErrors = []; // Лише для помилок *генерації*

    // --- Етап 1: Перевірка фонового зображення (без змін) ---
    try {
        bgImageUrl = await readFileAsDataURL(imgFile);
        await validateBackgroundImage(bgImageUrl);
        showImageLoadingMessage('✅ Фон валідний (16:9).', 'info');
        imageIsValid = true;
    } catch (error) {
        console.error("Помилка фонового зображення:", error);
        showImageLoadingMessage(`❌ Помилка фону: ${error.message || 'Не вдалося перевірити.'}`, 'error');
        imageIsValid = false;
    }

    // --- Етап 2: Перевірка та обробка текстового файлу ---
    try {
        showTextValidationMessage('Перевірка текстового файлу...', 'info'); // Оновлення статусу
        const textContent = await readFileAsText(txtFile);
        // ... (код розбивки тексту на validParticipantsText - без змін) ...
        const allLines = textContent.split('\n');
        const textParticipantsData = [];
        let currentParticipantLines = [];
        allLines.forEach(line => {
            const trimmedLine = line.trimStart();
            if (trimmedLine.startsWith('_')) {
                if (currentParticipantLines.length > 0) textParticipantsData.push(currentParticipantLines.join('\n').trim());
                currentParticipantLines = [line.substring(line.indexOf('_') + 1)];
            } else if (currentParticipantLines.length > 0) currentParticipantLines.push(line);
        });
        if (currentParticipantLines.length > 0) textParticipantsData.push(currentParticipantLines.join('\n').trim());
        const validParticipantsText = textParticipantsData.filter(text => text.length > 0);


        if (validParticipantsText.length === 0) {
            throw new Error("Файл не містить жодного учасника (рядки повинні починатися з '_').");
        }
        const MAX_CHARS_PER_PARTICIPANT = 10000;
        const validationError = validateTextLines(validParticipantsText, MAX_CHARS_PER_PARTICIPANT);
        if (validationError) {
            throw new Error(validationError);
        }

        showTextValidationMessage(`Генерація ${validParticipantsText.length} учасників...`, 'info');
        failedParticipantsErrors = []; // Скидаємо помилки генерації

        for (const [index, participantText] of validParticipantsText.entries()) {
            showTextValidationMessage(`Генерація ${index + 1}/${validParticipantsText.length}...`, 'info');
            try {
                if (!imageIsValid) {
                     console.warn(`Пропуск генерації учасника ${index+1} через невалідний фон.`);
                     // Не додаємо до successfulParticipants і не кидаємо помилку тут
                     continue; // Просто пропускаємо генерацію цього учасника
                }
                // Генеруємо, тільки якщо фон валідний
                const generatedDataUrl = await generateTextImage(bgImageUrl, participantText);
                let name = participantText.split('\n')[0].trim();
                if (name.length > 100) name = name.substring(0, 97) + "...";
                successfulParticipants.push({
                    id: Date.now() + Math.random().toString(16).slice(2) + index,
                    name: name || `Учасник ${index + 1}`, type: 'image/png', dataUrl: generatedDataUrl, isTextParticipant: true
                });
            } catch (genError) {
                console.error(`Помилка генерації учасника ${index + 1}:`, genError);
                const namePreview = participantText.split('\n')[0].trim().substring(0, 40);
                failedParticipantsErrors.push(`• Учасник "${namePreview}${namePreview.length === 40 ? '...' : ''}": ${genError.message || 'Помилка.'}`);
            }
        } // Кінець циклу генерації

        // *** ПОЧАТОК ЗМІН: Логіка визначення фінального статусу тексту ***
        if (failedParticipantsErrors.length > 0) {
            // Якщо були помилки САМЕ ГЕНЕРАЦІЇ (незалежно від фону)
            const totalFailed = failedParticipantsErrors.length;
            const totalAttempted = validParticipantsText.length;
            const errorListHtml = failedParticipantsErrors.map(err => `<li>${err}</li>`).join('');
            const errorMsgHtml = `❌ Не вдалося згенерувати ${totalFailed} з ${totalAttempted} учасників:<ul>${errorListHtml}</ul>`;
            const htmlError = new Error(errorMsgHtml);
            htmlError.isHtml = true;
            throw htmlError; // Кидаємо помилку, щоб її обробив catch нижче
        } else if (!imageIsValid && validParticipantsText.length > 0 && successfulParticipants.length === 0) {
             // !!! НОВА УМОВА !!!
             // Текст валідний (не було помилок вище), АЛЕ фон невалідний,
             // І учасники НЕ були згенеровані (бо ми їх пропускали).
             showTextValidationMessage("⚠️ Неможливо згенерувати учасників: фонове зображення неваліднe.", 'warning');
             textProcessingSuccess = false; // Вважаємо це невдачею для обробки тексту
        } else if (imageIsValid && validParticipantsText.length > 0 && successfulParticipants.length === validParticipantsText.length) {
             // УСПІХ: Фон валідний, текст валідний, всі учасники згенеровані
             showTextValidationMessage(`✅ Текстовий файл оброблено, ${successfulParticipants.length} учасників згенеровано.`, 'info');
             textProcessingSuccess = true;
        } else if (imageIsValid && validParticipantsText.length > 0 && successfulParticipants.length < validParticipantsText.length) {
             // Частковий успіх (хоча не мав би статися, якщо failedParticipantsErrors порожній) - про всяк випадок
             showTextValidationMessage(`⚠️ Текст оброблено, але згенеровано лише ${successfulParticipants.length} з ${validParticipantsText.length} учасників (перевірте консоль).`, 'warning');
             textProcessingSuccess = false; // Не повний успіх
        } else {
             // Інші можливі випадки (наприклад, validParticipantsText порожній - вже оброблено вище)
             // Можна залишити поточне повідомлення або приховати
             // showTextValidationMessage('', 'hidden');
             // Якщо дійшли сюди, значить не було помилок, але й не було повного успіху - можливо варто встановити прапорець
             if (successfulParticipants.length > 0) { // Якщо хоч щось згенерували і не було помилок
                 textProcessingSuccess = true;
             } else {
                 textProcessingSuccess = false; // Якщо нічого не згенерували і не було помилок
             }
        }
        // *** КІНЕЦЬ ЗМІН ***

    } catch (error) { // Обробка помилок Етапу 2 (включаючи помилку генерації з isHtml)
        console.error("Помилка обробки текстового файлу:", error);
        if (error.isHtml) {
             showTextValidationMessage(error.message, 'error');
        } else {
             showTextValidationMessage(`❌ Помилка тексту: ${error.message || 'Не вдалося обробити.'}`, 'error');
        }
        textProcessingSuccess = false;
    }

    // --- Етап 3: Фіналізація та оновлення пулу (без змін) ---
    if (imageIsValid && textProcessingSuccess) {
        initialFilePool = successfulParticipants;
        renderFilePoolList();
    } else {
        console.log("Пул не оновлено через помилки.");
        // Перевіряємо стан пулу (який порожній), щоб показати повідомлення типу "Потрібно 2 учасники"
        checkPoolState();
    }

    // --- Етап 4: Очищення інпутів та оновлення кнопок (без змін) ---
    if(textFileInput) textFileInput.value = '';
    if(backgroundImageInput) backgroundImageInput.value = '';
    updateLoadTextButtonState();
    if(clearAllBtn) clearAllBtn.disabled = (initialFilePool.length === 0);
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

// validateTextLines тепер приймає масив текстів учасників
function validateTextLines(participantsTextArray, maxCharsPerParticipant) { // Змінено назву другого аргументу
    const n = participantsTextArray.length; // Кількість учасників 
    if (n < 2) { // Перевіряємо, чи є хоча б 2 учасники 
        // Оновлене повідомлення про помилку
        return "Текстовий файл повинен містити щонайменше 2 учасники (текст, що починається з '_').";
    }

    // Перевірка на парність більше не потрібна тут, логіка "bye" впорається
    // if (n % 2 !== 0) { 
    //     return `Помилка: Кількість учасників (${n}) повинна бути ПАРНОЮ!`;
    // }

    // Перевіряємо довжину тексту кожного учасника
    for (let i = 0; i < n; i++) {
        if (participantsTextArray[i].length > maxCharsPerParticipant) { // Перевіряємо загальну довжину тексту учасника 
            // Формуємо прев'ю тексту учасника для повідомлення про помилку
            const participantPreview = participantsTextArray[i].substring(0, 40).replace(/\n/g, ' '); // Беремо початок, замінюючи нові рядки пробілами для прев'ю
            // Оновлене повідомлення про помилку
            return `Помилка: Текст учасника <span class="math-inline">\{i \+ 1\} \("</span>{participantPreview}...") містить більше ${maxCharsPerParticipant} символів.`;
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
 * Включає перевірку візуального розміру тексту та відхиляє Promise, якщо текст не поміщається.
 * @param {string} backgroundImageUrl - Data URL фонового зображення (вже валідованого 16:9).
 * @param {string} textLine - Рядок тексту для накладання.
 * @returns {Promise<string>} - Promise, що повертає Data URL згенерованого зображення (image/png)
 * або відхиляється з помилкою, якщо текст занадто великий.
 */
async function generateTextImage(backgroundImageUrl, textLine) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();

        // --- ОГОЛОШЕННЯ ФУНКЦІЇ wrapText (ВИНОСИМО СЮДИ) ---
        // Функція для розбивки тексту на рядки та їх малювання.
        // Повертає загальну використану висоту тексту.
        function wrapText(context, text, x, y, maxWidth, lineHeight, maxTextHeight, paddingY) {
            let lines = [];
            // Спочатку розбиваємо текст за існуючими символами нового рядка ('\n')
            const paragraphs = text.split('\n');
            paragraphs.forEach(paragraph => {
                // Якщо параграф порожній (два \n підряд), додаємо порожній рядок
                if (paragraph.length === 0) {
                    lines.push('');
                    return;
                }
                const words = paragraph.split(' ');
                let currentLine = '';
                for (let n = 0; n < words.length; n++) {
                    const testLine = currentLine + words[n] + ' ';
                    const metrics = context.measureText(testLine);
                    const testWidth = metrics.width;
                    // Розбиваємо рядок, якщо він перевищує максимальну ширину АБО якщо це перше слово
                    // і воно вже довше за maxWidth (уникаємо нескінченного циклу на дуже довгих словах)
                     if (testWidth > maxWidth && (currentLine.length > 0 || n === words.length - 1 && testWidth > maxWidth)) {
                         if (currentLine.length > 0) {
                             lines.push(currentLine.trim());
                         }
                        currentLine = words[n] + ' ';
                    } else {
                        currentLine = testLine;
                    }
                }
                lines.push(currentLine.trim()); // Додаємо останній рядок параграфа
            });

            // Розрахунок початкової Y позиції для центрування блоку тексту
            const totalTextHeight = lines.length * lineHeight;
            let currentY = y - (totalTextHeight / 2) + (lineHeight / 2); // Починаємо зверху центру

            // Малюємо рядки
            lines.forEach(singleLine => {
                 // Перевіряємо, чи поточна позиція Y знаходиться в межах доступної висоти
                 // (враховуючи padding). Малюємо тільки ті рядки, що в межах.
                if (currentY + lineHeight/2 > paddingY && currentY - lineHeight/2 < paddingY + maxTextHeight) {
                     context.fillText(singleLine, x, currentY);
                } else {
                     // Консольне повідомлення про пропущений рядок (опціонально для відладки)
                     console.warn(`Skipping line drawing outside bounds: "${singleLine}" at Y=${currentY.toFixed(2)}`);
                }
                currentY += lineHeight;
            });

            // --- ПОВЕРТАЄМО ЗАГАЛЬНУ ВИКОРИСТАНУ ВИСОТУ ---
            return totalTextHeight;
            // --- КІНЕЦЬ wrapText ---
        }


        img.onload = () => { // img.onload починається тут
            try { // try блок починається тут
                // --- Налаштування Canvas ---
                // Використовуємо розміри завантаженого фону або фіксовані 16:9
                const canvasWidth = img.naturalWidth > 1920 ? 1920 : img.naturalWidth; // Обмежимо ширину
                const canvasHeight = canvasWidth / (16 / 9); // Забезпечуємо 16:9
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // 1. Малюємо фон
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // 2. Налаштовуємо текст
                const maxTextWidth = canvas.width * 0.85; // Текст займає 85% ширини
                const maxTextHeight = canvas.height * 0.85; // і 85% висоти
                const paddingY = canvas.height * 0.075; // Відступ зверху та знизу
                const paddingX = canvas.width * 0.075; // Відступ зліва та справа (використовується неявно через maxTextWidth)


                // --- Вибір розміру шрифту (Логіка: спочатку символи, потім рядки) ---
            let candidateSizeByLength; // Кандидат на розмір шрифту, визначений за загальною кількістю символів
            let candidateSizeByLines;  // Кандидат на розмір шрифту, визначений за кількістю рядків

            const fullText = textLine; // Повний текст для учасника
            const totalLength = fullText.length; // Загальна кількість символів
            const lines = fullText.split('\n'); // Розбиваємо текст на рядки
            const numberOfLines = lines.length; // Кількість рядків

            console.log(`Calculating font size for text: "${fullText.substring(0, Math.min(fullText.length, 50))}..." (Total chars: ${totalLength}, Lines: ${numberOfLines})`);

            // 1. Визначаємо КАНДИДАТ за кількістю символів
            // Ця логіка намагається передбачити, наскільки "довгим" буде текст, враховуючи, що wrapText його розіб'є.
            // Чим довший текст, тим меншим має бути початковий шрифт.
            if (totalLength > 600) { // Дуже-дуже довгий текст
                 candidateSizeByLength = canvas.height * 0.035; // Дуже-дуже дрібний
            } else if (totalLength > 400) { // Дуже довгий текст
                 candidateSizeByLength = canvas.height * 0.045; // Дуже дрібний
            } else if (totalLength > 200) { // Довгий текст
                 candidateSizeByLength = canvas.height * 0.055; // Дрібний
            } else if (totalLength > 100) { // Середній текст
                 candidateSizeByLength = canvas.height * 0.08; // Середній
            } else if (totalLength > 50) { // Короткий текст
                 candidateSizeByLength = canvas.height * 0.09; // Трохи менший
            } else { // Дуже короткий текст
                 candidateSizeByLength = canvas.height * 0.1; // Початковий розмір (10% від висоти)
            }

            // 2. Визначаємо КАНДИДАТ за кількістю рядків
            // Ця логіка намагається передбачити, наскільки "високим" буде текст, незалежно від його ширини.
            // Приблизне співвідношення: baseFontSize * lineHeightMultiplier * numberOfLines <= maxTextHeight
            // baseFontSize * 1.2 * numberOfLines <= canvas.height * 0.9
            // baseFontSize <= canvas.height * (0.9 / 1.2) / numberOfLines
            // baseFontSize <= canvas.height * 0.75 / numberOfLines
            // Ми використовуємо цю ідею для визначення порогів:
            if (numberOfLines > 25) { // Надзвичайно багато рядків
                candidateSizeByLines = canvas.height * 0.025; // Надзвичайно дрібний
            } else if (numberOfLines > 20) { // Дуже багато рядків
                candidateSizeByLines = canvas.height * 0.035; // Дуже дрібний
            } else if (numberOfLines > 15) { // Багато рядків
                 candidateSizeByLines = canvas.height * 0.045; // Малий
            } else if (numberOfLines > 10) { // Помірно багато рядків
                 candidateSizeByLines = canvas.height * 0.06; // Менший
            } else if (numberOfLines > 6) { // Кілька рядків (як ваш приклад з 9 рядками)
                 candidateSizeByLines = canvas.height * 0.08; // Середній (достатній для 9 рядків)
            } else { // Мало рядків (1-6)
                 candidateSizeByLines = canvas.height * 0.1; // Не обмежуємо сильно за кількістю рядків
            }

            // 3. Фінальний baseFontSize - найменший з обох кандидатів
            // Ми беремо найменше значення, щоб гарантувати, що текст поміститься як по ширині (враховуючи переносы), так і по висоті.
            let baseFontSize = Math.min(candidateSizeByLength, candidateSizeByLines);


                // --- Кінець логіки розміру шрифту ---


                ctx.font = `bold ${baseFontSize}px Arial, sans-serif`; // Застосовуємо фінальний baseFontSize
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Додаємо тінь для кращої читабельності
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = baseFontSize / 3; // Розмір тіні пропорційний розміру шрифту
                ctx.shadowOffsetX = baseFontSize / 10;
                ctx.shadowOffsetY = baseFontSize / 10;


                // 3. Розбиваємо текст на рядки та малюємо його на canvas
                // Викликаємо wrapText і отримуємо використану висоту
                const lineHeight = baseFontSize * 1.2; // Міжрядковий інтервал
                const usedTextHeight = wrapText(ctx, textLine, canvas.width / 2, canvas.height / 2, maxTextWidth, lineHeight, maxTextHeight, paddingY); // ВИКЛИКАЄМО wrapText


                // --- ПЕРЕВІРКА ВИСОТИ ТА REJECT ---
                // Перевіряємо, чи висота тексту (яку повернув wrapText) перевищує максимально дозволену зону
                if (usedTextHeight > maxTextHeight) {
                    console.error(`Текст учасника перевищує максимальну висоту. Використано: ${usedTextHeight.toFixed(2)}, Макс: ${maxTextHeight.toFixed(2)} для тексту: "${textLine.substring(0, Math.min(textLine.length, 50))}..."`);
                    // Відхиляємо Promise з інформативним повідомленням для ведучого
                    const participantNamePreview = textLine.split('\n')[0].trim().substring(0, Math.min(textLine.split('\n')[0].trim().length, 40)); // Беремо початок першого рядка для повідомлення
                     const errorMessage = `Текст учасника "${participantNamePreview}${participantNamePreview.length === 40 ? '...' : ''}" занадто великий і не поміщається на фоні.`;
                    reject(new Error(errorMessage));
                    return; // Важливо вийти з функції onload після відхилення
                }
                // --- КІНЕЦЬ ПЕРЕВІРКИ ТА REJECT ---


                // 4. Конвертуємо в Data URL (цей код виконається ТІЛЬКИ якщо текст помістився)
                 // Важливо: Переконайся, що браузер підтримує toDataURL для великих зображень
                resolve(canvas.toDataURL('image/png'));

            } catch (e) { // Перехоплення помилок, що виникли всередині try{} (малювання, toDataURL тощо)
                 console.error("Canvas drawing error:", e);
                 // Якщо сталася інша помилка під час малювання, також відхиляємо Promise
                 reject(new Error(`Помилка генерації зображення для тексту: ${e.message || 'Невідома помилка малювання.'}`));
            }
        }; // Закриваюча дужка для img.onload

        img.onerror = () => { // Обробник помилки завантаження зображення
            console.error("Error loading background image:", backgroundImageUrl);
            reject(new Error("Не вдалося завантажити фонове зображення для генерації."));
        };

        img.src = backgroundImageUrl; // Запуск завантаження фонового зображення
    });
}

/**
 * Встановлює URL зображень для монетки,
 * намагаючись використовувати кастомні на основі нікнейму,
 * або дефолтні, якщо кастомні не існують.
 * @param {string} nickname - Нікнейм каналу Twitch.
 */
function fetchCoinImages(nickname) { // Ця функція синхронна
    console.log('Спроба завантажити зображення монетки для: ' + nickname); // Використовуємо + для логу

    // Базовий шлях до папки із зображеннями монеток.
    // Використовуємо звичайні одинарні лапки.
    const baseUrl = 'media/coin_images/';

    // Шляхи до дефолтних зображень.
    // Можна використати конкатенацію (+).
    const defaultSide1 = baseUrl + 'default_1.png';
    const defaultSide2 = baseUrl + 'default_2.png';


    let potentialCustomSide1 = null;
    let potentialCustomSide2 = null;

    // Перевіряємо, чи передано дійсний нікнейм
    if (nickname && typeof nickname === 'string' && nickname.trim() !== '') {
        const cleanNickname = nickname.trim().toLowerCase(); // Переводимо в нижній регістр

        // !!! ВИКОРИСТОВУЄМО КОНКАТЕНАЦІЮ РЯДКІВ (+) ТУТ !!!
        // З'єднуємо базовий шлях, очищений нікнейм та решту назви файлу за допомогою +.

        potentialCustomSide1 = baseUrl + cleanNickname + '_1.png'; // <--- ЦЕЙ РЯДОК
        potentialCustomSide2 = baseUrl + cleanNickname + '_2.png'; // <--- І ЦЕЙ РЯДОК

        console.log('Потенційні кастомні шляхи: ' + potentialCustomSide1 + ', ' + potentialCustomSide2); // Використовуємо + для логу
    } else {
        console.log("Нікнейм не вказано або порожній, будуть використовуватися дефолтні зображення.");
    }

    // Визначаємо фінальні URL для завантаження.
    let finalSide1Url = defaultSide1; // Початково - дефолтний шлях
    let finalSide2Url = defaultSide2;

    if (potentialCustomSide1 && potentialCustomSide2) {
         // Якщо потенційні кастомні шляхи існують (були сформовані), використовуємо їх.
         finalSide1Url = potentialCustomSide1;
         finalSide2Url = potentialCustomSide2;
         console.log("Спроба використати кастомні шляхи.");
    } else {
         console.log("Використовуються дефолтні шляхи.");
    }

    // Передаємо фінальні URL в updateCoinImages.
    console.log('Передача URL в updateCoinImages: Сторона 1 - ' + finalSide1Url + ', Сторона 2 - ' + finalSide2Url); // Використовуємо + для логу
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
 * Показує UI для підкидання монетки. 
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
    // ---> ДОДАЙТЕ ЦЕ <--- 
    // Робимо стандартні кнопки вибору переможця активними 
    if (voteButtons) { // 
        voteButtons.forEach(btn => btn.disabled = false); // 
        console.log("Стандартні кнопки вибору переможця активовано для вирішення нічиєї."); // 
    }
    // ---> КІНЕЦЬ ДОДАНОГО <--- 
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

    const hideVotesControlElement = document.querySelector('.hide-votes-control'); // Знайдіть елемент

    if (isChatMode) {
        currentVotingMode = 'twitch';
        if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');
        if (voteFormatSection) voteFormatSection.classList.remove('hidden');
        console.log("-> Режим встановлено на: 'twitch'");
        updateTwitchStatus(twitchConnected, currentTwitchChannel);
        // Показати блок приховування голосів у режимі Twitch
        if (hideVotesControlElement) hideVotesControlElement.classList.remove('manual-hidden-element');
    } else {
        currentVotingMode = 'manual';
        if (twitchConfigSection) twitchConfigSection.classList.add('hidden');
        if (voteFormatSection) voteFormatSection.classList.add('hidden');
        console.log("-> Режим встановлено на: 'manual'");
        disconnectFromTwitch();
        if (isBattleRunning && battlePhaseVotingBlock) {
            battlePhaseVotingBlock.classList.add('hidden');
        }
        // Приховати блок приховування голосів у ручному режимі
        if (hideVotesControlElement) hideVotesControlElement.classList.add('manual-hidden-element');
    }

    updateActiveLabel();
    console.log(`Виклик saveSettings з currentVotingMode = "${currentVotingMode}"`);
    saveSettings();
    checkPoolState();
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
     * ОНОВЛЕНО: Зберігає формат голосування та поточну тему з body.
     */
function saveSettings() {
        try {
             const modeToSave = currentVotingMode;
             console.log(`--- Початок saveSettings: Збереження votingMode = "${modeToSave}", voteFormat = "${currentVoteFormat}" ---`);

             const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
             localStorage.setItem('battleTheme', currentTheme);

             localStorage.setItem('battleTitle', battleTitleInput.value);
             localStorage.setItem('votingMode', modeToSave);

             localStorage.setItem('voteFormat', currentVoteFormat); // Зберегти обраний формат

             // --- ДОДАНО: Збереження поточного режиму учасників ---
             localStorage.setItem('participantMode', currentParticipantMode);
             // --- КІНЕЦЬ ДОДАНОГО ---
        localStorage.setItem('hideVotes', hideVotesCheckbox.checked); // <-- НОВЕ
        console.log(`--- Кінець saveSettings: Збережено hideVotes='${localStorage.getItem('hideVotes')}' ---`); // Оновлено лог
    } catch (e) {
        console.error("Помилка під час збереження налаштувань в localStorage:", e);
    }
}

    /**
     * Завантажує налаштування з localStorage та ВСТАНОВЛЮЄ ПОЧАТКОВИЙ СТАН UI.
     */
function loadSettings() {
     isLoadingSettings = true;
     console.log("===== Початок loadSettings (isLoadingSettings = true) =====");
     const savedTheme = localStorage.getItem('battleTheme') || 'dark';
     const savedTitle = localStorage.getItem('battleTitle') || 'Додайте назву';
     const savedMode = localStorage.getItem('votingMode');
     const savedChannel = localStorage.getItem('twitchChannel') || '';
     const savedFormat = localStorage.getItem('voteFormat') || 'strict';
     const savedParticipantMode = localStorage.getItem('participantMode') || 'media';
      const savedHideVotes = localStorage.getItem('hideVotes') === 'true';

     console.log(`Зчитано з localStorage: savedMode='${savedMode}', savedChannel='${savedChannel}', savedFormat='${savedFormat}', savedParticipantMode='${savedParticipantMode}'`);

     // Визначаємо поточний режим на основі збереженого
     currentVotingMode = savedMode === 'twitch' ? 'twitch' : 'manual';
     currentVoteFormat = ['strict', 'simple', 'both'].includes(savedFormat) ? savedFormat : 'strict';

     // --- ДОДАНО: Встановлення поточного режиму учасників ---
     currentParticipantMode = ['media', 'text'].includes(savedParticipantMode) ? savedParticipantMode : 'media';
     // --- КІНЕЦЬ ДОДАНОГО ---

     console.log(`-> Присвоєно currentVotingMode = "${currentVotingMode}", currentVoteFormat = "${currentVoteFormat}", currentParticipantMode = "${currentParticipantMode}"`);

      hideVotesEnabled = savedHideVotes;
      if (hideVotesCheckbox) {
           hideVotesCheckbox.checked = hideVotesEnabled;
           console.log(`loadSettings: Встановлено hideVotesCheckbox.checked = ${hideVotesCheckbox.checked}`);
      }

 // !!! === ЦЕЙ БЛОК ТЕПЕР ВИКОРИСТОВУЄ ЗАВАНТАЖЕНИЙ currentParticipantMode === !!!
     console.log(`Налаштування видимості контейнерів введення для режиму: ${currentParticipantMode}`);
     if (currentParticipantMode === 'text') {
         mediaInputsContainer?.classList.add('hidden');
         textInputsContainer?.classList.remove('hidden');
         mediaModeLabel?.classList.remove('active');
         textModeLabel?.classList.add('active');
     } else { // 'media'
         mediaInputsContainer?.classList.remove('hidden');
         textInputsContainer?.classList.add('hidden');
         mediaModeLabel?.classList.add('active');
         textModeLabel?.classList.remove('active');
     }
 // !!! === КІНЕЦЬ БЛОКУ ДЛЯ РЕЖИМУ УЧАСНИКІВ === !!!


     if (participantModeToggle) {
         participantModeToggle.checked = (currentParticipantMode === 'text');
         console.log(`loadSettings: Встановлено participantModeToggle.checked = ${participantModeToggle.checked} (для режиму "${currentParticipantMode}")`);
     }

     // Застосовуємо тему, заголовок, встановлюємо значення поля вводу каналу
     applyTheme(savedTheme);
     battleTitleInput.value = savedTitle;
     if (twitchChannelInput) twitchChannelInput.value = savedChannel;
     if (voteFormatSelector) {
          voteFormatSelector.value = currentVoteFormat;
     }

     // Встановлюємо стан перемикача голосування
      if (votingModeToggle) {
          const shouldBeChecked = (currentVotingMode === 'twitch');
          console.log(`Встановлюємо votingModeToggle.checked = ${shouldBeChecked}`);
          votingModeToggle.checked = shouldBeChecked;
      }

      // --- ДОДАНО: Встановлення початкової видимості для hide-votes-control ---
      const hideVotesControlElement = document.querySelector('.hide-votes-control');
      if (hideVotesControlElement) {
          if (currentVotingMode === 'manual') {
              hideVotesControlElement.classList.add('manual-hidden-element');
              console.log("loadSettings: Режим 'manual', ховаємо hide-votes-control");
          } else { // 'twitch'
              hideVotesControlElement.classList.remove('manual-hidden-element');
              console.log("loadSettings: Режим 'twitch', показуємо hide-votes-control");
          }
      } else {
          console.warn("loadSettings: Елемент .hide-votes-control не знайдено.");
      }
      // --- КІНЕЦЬ ДОДАНОГО ---


      // Налаштовуємо видимість блоків Twitch та Формату
      if (currentVotingMode === 'twitch') {
          console.log("Режим 'twitch', показуємо блоки Twitch та Формату");
          if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');
          if (voteFormatSection) voteFormatSection.classList.remove('hidden');
           if (twitchConfigSection) twitchConfigSection.classList.remove('hidden');
           if (savedChannel) {
               console.log(`Канал ${savedChannel} знайдено, встановлюємо UI 'Налаштовано' і спробуємо підключитись`);
               if (twitchChannelInput) twitchChannelInput.disabled = true;
               if (twitchConfirmBtn) twitchConfirmBtn.textContent = 'Змінити';
               if (twitchStatusSpan) {
                    twitchStatusSpan.textContent = `Канал: #${savedChannel}.\n Підключення...`;
                    twitchStatusSpan.className = 'twitch-status ready';
               }
               currentTwitchChannel = savedChannel;
               twitchConnected = false;
               console.log("!!! Режим 'twitch' і канал збережено. Запускаємо авто-підключення...");
               connectToTwitch(savedChannel);
           } else {
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
          if (voteFormatSection) voteFormatSection.classList.add('hidden');
      }

      // --- ДОДАНИЙ БЛОК ОНОВЛЕННЯ КЛІЄНТА ---
      // Оновлюємо формат у клієнта Twitch після завантаження налаштувань
      if (twitch && typeof twitch.setVoteFormat === 'function') {
          twitch.setVoteFormat(currentVoteFormat);
      }
      // --- КІНЕЦЬ ДОДАНОГО БЛОКУ ---

      updateActiveLabel();
      console.log(`===== Завершення loadSettings. Фінальний currentVotingMode="${currentVotingMode}", currentVoteFormat="${currentVoteFormat}" =====`);
      isLoadingSettings = false;
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
     * ОНОВЛЕНО: Скидає голоси перед кожним запуском.
     * ОНОВЛЕНО: Обробляє перезапуск зі стану нічиєї.
     */
    function handleStartVotingClick() {
        console.log("handleStartVotingClick called");
        if (!startVotingBtn || !votingDurationSelect) return;

        // --- Перевірка, чи НЕ знаходимось в стані нічиєї (монетка видима) ---
        if (coinFlipModal && !coinFlipModal.classList.contains('hidden')) {
            console.log("Перезапуск голосування зі стану нічиєї.");
            hideCoinFlipUI(); // Ховаємо UI монетки
            // Селект тривалості вже має бути неактивним, робимо його активним
            votingDurationSelect.disabled = false;
        }
        // -----------------------------------------------------------------

        // Перевірка підключення до Twitch (якщо потрібно)
        if (currentVotingMode === 'twitch' && !twitchConnected) {
            alert("Неможливо почати голосування: Чат Twitch не підключено! \n\nПідключіть канал у налаштуваннях або перемкніться в ручний режим.");
            return;
        }

        // --- ПОЧАТОК ЗМІН: Скидання голосів перед стартом ---
        console.log("Скидання попередніх голосів...");
        if (twitch && typeof twitch.resetVotes === 'function') {
            twitch.resetVotes(); // Скидає лічильники і оновлює дисплей на нулі
        } else if (currentVotingMode === 'twitch') {
            console.warn("Не вдалося скинути голоси: twitch.resetVotes не знайдено.");
            // Якщо скидання важливе, можна додати ручне оновлення дисплеїв тут
             if (voteDisplay1) voteDisplay1.textContent = "0 голосів";
             if (voteDisplay2) voteDisplay2.textContent = "0 голосів";
        }
        // Переконаємось, що дисплеї видимі (могли бути приховані)
        if (voteDisplay1) voteDisplay1.classList.remove('hidden');
        if (voteDisplay2) voteDisplay2.classList.remove('hidden');
        // --- КІНЕЦЬ ЗМІН ---

        // Блокуємо кнопку "Почати голосування" та селект вибору тривалості
        startVotingBtn.disabled = true;
        votingDurationSelect.disabled = true;

        // Дозволяємо прийом голосів у Twitch клієнті
        if (currentVotingMode === 'twitch' && twitch && typeof twitch.enableVoting === 'function') {
            twitch.enableVoting();
        }

        isVotingActive = true; // Встановлюємо прапорець, що голосування активне

        // Використовуємо значення тривалості, яке було збережено при виборі
        const duration = selectedVotingDuration;
        if (duration > 0) {
            startVotingTimer(duration); // Запускаємо таймер
        } else {
            console.log("Голосування розпочато (без обмеження часу)");
            startVotingBtn.textContent = "Голосування триває..."; // Оновлюємо текст кнопки
        }
    }
    /**
     * Запускає таймер зворотного відліку для голосування.
     * @param {number} duration - Тривалість у секундах.
     */
    function startVotingTimer(duration) {
        console.log(`Запуск таймера голосування на ${duration} секунд`);
		    if (hideVotesEnabled && duration > 0) { // Тільки якщо опція увімкнена і є тривалість
         console.log("Приховуємо лічильники голосів (розмиття).");
         voteCountDisplays.forEach(el => {
             el.classList.remove('hidden'); // Переконуємось, що вони видимі
             el.classList.add('blurred-votes'); // Додаємо клас розмиття
         });
    } else {
         // Переконуємось, що лічильники видимі і не розмиті, якщо опція вимкнена
         voteCountDisplays.forEach(el => {
             el.classList.remove('hidden', 'blurred-votes');
         });
    }
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
     * ОНОВЛЕНО: Додано період очікування для обробки черги після завершення таймера.
     * ОНОВЛЕНО: Кнопка "Нічия!" тепер активна для перезапуску.
     * @param {string} reason - Причина зупинки ('timer_end', 'manual_selection', 'reset', 'battle_end', 'console_command', 'new_matchup', 'prepare_round', 'error').
     */
    function stopVotingTimer(reason) {
        console.log(`Зупинка голосування. Причина: ${reason}`);
		    console.log("Знімаємо розмиття з лічильників голосів.");
			voteCountDisplays.forEach(el => el.classList.remove('blurred-votes'));

        // 1. Зупиняємо інтервал таймера, якщо він активний
        if (votingTimerIntervalId) {
            clearInterval(votingTimerIntervalId);
            votingTimerIntervalId = null; // Скидаємо ID
        }

        // 2. Встановлюємо прапорець, що голосування більше не активне
        isVotingActive = false;

        // 3. Забороняємо прийом НОВИХ голосів у Twitch клієнті
        if (currentVotingMode === 'twitch' && twitch && typeof twitch.disableVoting === 'function') {
            twitch.disableVoting();
        }

        // 4. Оновлюємо UI кнопки "Почати голосування" та селекту
        if (startVotingBtn) {
            if (reason === 'timer_end') {
                console.log("Таймер завершено. Починаємо очікування обробки черги...");
                startVotingBtn.textContent = "Обробка черги...";
                startVotingBtn.disabled = true; // Неактивна під час обробки
                if (votingDurationSelect) {
                    votingDurationSelect.disabled = true;
                }

                const checkQueueAndFinalize = () => {
                    if (twitch && twitch.voteQueue && twitch.voteQueue.length === 0) {
                        console.log("Черга оброблена. Визначення остаточних результатів...");
                        clearInterval(queueCheckInterval);

                        const votes1 = twitch?.votes ? twitch.votes['!1'] : 0;
                        const votes2 = twitch?.votes ? twitch.votes['!2'] : 0;
                        console.log(`Остаточний рахунок після обробки черги: ${votes1} - ${votes2}`);

                        if (currentVotingMode === 'twitch' && votes1 === votes2 && votes1 > 0) {
                            // --- НІЧИЯ ---
                            startVotingBtn.textContent = "Нічия! (Переголосувати?)"; // Оновлений текст
                            startVotingBtn.disabled = false; // <<< ЗМІНА: Робимо кнопку АКТИВНОЮ
                             if(votingDurationSelect) {
                                 votingDurationSelect.disabled = true; // Селект залишаємо неактивним до перезапуску
                             }
                            showCoinFlipUI(); // Показуємо монетку, але кнопка голосування активна
                            fetchCoinImages(currentTwitchChannel);
                        } else {
                            // --- НЕ НІЧИЯ ---
                            startVotingBtn.textContent = "Голосування завершено";
                            startVotingBtn.disabled = false;
                            hideCoinFlipUI();
                            if(votingDurationSelect) {
                                 votingDurationSelect.disabled = false;
                             }
                        }
                    } else if (!twitch || !twitch.voteQueue) {
                        console.error("Не вдалося перевірити чергу голосів. Завершуємо без очікування.");
                        clearInterval(queueCheckInterval);
                        startVotingBtn.textContent = "Помилка обробки черги";
                        startVotingBtn.disabled = false;
                         if(votingDurationSelect) {
                             votingDurationSelect.disabled = false;
                         }
                    }
                };
                const queueCheckInterval = setInterval(checkQueueAndFinalize, 200);

            } else if (reason === 'console_command'){
                 startVotingBtn.textContent = "Голосування завершено";
                 startVotingBtn.disabled = false;
                 hideCoinFlipUI();
                 if (votingDurationSelect) {
                     votingDurationSelect.disabled = false;
                 }
            } else {
                // В інших випадках (manual_selection, new_matchup, reset, battle_end і т.д.)
                startVotingBtn.textContent = "Почати голосування";
                startVotingBtn.disabled = false;
                hideCoinFlipUI();
                 if (votingDurationSelect) {
                    votingDurationSelect.disabled = false;
                 }
            }
        } else {
             console.warn("stopVotingTimer: Елемент #startVotingBtn не знайдено.");
        }

        // 5. Спеціальна логіка для повного скидання батлу (без змін)
        if (reason === 'reset' || reason === 'battle_end') {
            if (votingDurationSelect) {
                votingDurationSelect.value = "0";
            }
            selectedVotingDuration = 0;
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

        // --- Ініціалізуємо лічильник оброблених файлів ---
        let processedCount = 0;
        const totalFiles = files.length;
        // --- Кінець ініціалізації ---

        // --- Показати початкове повідомлення про завантаження ---
        // Оновлюємо текст, щоб показати початковий прогрес 0 / Total
        showMediaLoadingMessage(`Обробка файлів: ${processedCount} / ${totalFiles}...`, 'info');
        showPoolMessage('', 'hidden'); // Приховуємо повідомлення пулу
        if (addFilesBtn) addFilesBtn.disabled = true; // Вимкнути кнопку
        // --- Кінець показу початкового повідомлення ---

        const fileReadPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                // Перевірка на дублікати залишається
                if (initialFilePool.some(poolFile => poolFile.name === file.name)) {
                    // Якщо дублікат, все одно інкрементуємо лічильник оброблених,
                    // але повідомлення про це не показуємо як успішне завантаження нового.
                    processedCount++;
                    // Оновлюємо повідомлення про прогрес
                    showMediaLoadingMessage(`Обробка файлів: ${processedCount} / ${totalFiles}...`, 'info');
                    resolve(null); // Вирішуємо як null, щоб відфільтрувати пізніше
                    return;
                }

                const reader = new FileReader();

                reader.onload = (event) => {
                    // --- Додано: Інкрементуємо лічильник та оновлюємо прогрес при успіху ---
                    processedCount++;
                    showMediaLoadingMessage(`Обробка файлів: ${processedCount} / ${totalFiles}...`, 'info');
                    // --- Кінець доданого ---
                    resolve({ id: Date.now() + Math.random().toString(16).slice(2), name: file.name, type: file.type, dataUrl: event.target.result });
                };

                reader.onerror = (error) => {
                    console.error("FileReader error:", error);
                    // --- Додано: Інкрементуємо лічильник та оновлюємо прогрес при помилці ---
                    processedCount++;
                     // Можна змінити тип повідомлення на warning/error, якщо є помилки
                     // Але для простоти прогресу залишаємо 'info' під час процесу
                    showMediaLoadingMessage(`Обробка файлів: ${processedCount} / ${totalFiles}...`, 'info');
                    // --- Кінець доданого ---
                    reject({ file: file.name, error }); // Відхиляємо проміс з інформацією про помилку
                };

                try {
                    reader.readAsDataURL(file);
                } catch (readError) {
                    console.error("Error calling readAsDataURL:", readError);
                     // --- Додано: Інкрементуємо лічильник та оновлюємо прогрес при помилці ---
                     processedCount++;
                     showMediaLoadingMessage(`Обробка файлів: ${processedCount} / ${totalFiles}...`, 'info');
                     // --- Кінець доданого ---
                    reject({ file: file.name, error: readError });
                }
            });
        });

        Promise.all(fileReadPromises.map(p => p.catch(e => e))) // Чекаємо завершення ВСІХ промісів (як успішних, так і з помилками)
            .then(results => {
                const successfulResults = results.filter(r => r !== null && !r.error); // Фільтруємо тільки успішно прочитані файли, ігноруючи null (дублікати) та помилки
                const failedResults = results.filter(r => r && r.error); // Вибираємо ті, що завершились помилкою

                const newFiles = successfulResults; // Тепер newFiles - це тільки успішно завантажені

                if (newFiles.length > 0) {
                    initialFilePool = initialFilePool.concat(newFiles);
                    renderFilePoolList(); // renderFilePoolList викличе checkPoolState
                }

                fileInput.value = '';

                // --- Відображення фінального статусу ---
                if (failedResults.length === 0) {
                    // Якщо немає помилок читання файлів
                     if (newFiles.length > 0) {
                          showMediaLoadingMessage(`Успішно завантажено ${newFiles.length} файл(ів).`, 'info');
                     } else if (initialFilePool.length === 0) {
                         // Випадок, коли спробували додати, але всі були дублікатами
                          showMediaLoadingMessage(`Дублікати проігноровано. Пул порожній.`, 'warning');
                     } else {
                         // Випадок, коли спробували додати, і всі були дублікатами, але пул НЕ порожній
                         showMediaLoadingMessage(`Дублікати проігноровано. Пул не змінився.`, 'info');
                     }
                } else {
                    // Якщо були помилки читання файлів
                    const successCount = newFiles.length;
                    const errorCount = failedResults.length;
                    const firstErrorFileName = failedResults[0].file || 'невідомий файл';
                    showMediaLoadingMessage(`Завантажено ${successCount}/${totalFiles} файл(ів). Помилка обробки ${errorCount} файл(ів). Перший: ${firstErrorFileName}`, 'error');

                    // Можна також вивести список усіх помилок у консоль або в poolMessageDiv
                    console.warn("Деталі помилок обробки файлів:", failedResults);
                    // showPoolMessage(`Деякі файли не були оброблені. Перевірте консоль для деталей.`, 'warning'); // Або тут
                     checkPoolState(); // Викликаємо явно, щоб оновити загальне повідомлення пулу після помилок
                }
                // --- Кінець відображення фінального статусу ---


                if (addFilesBtn) addFilesBtn.disabled = false; // Увімкнути кнопку
            })
            .catch(error => {
                 // Цей catch спрацює, якщо в самому Promise.all виникне неочікувана помилка
                 // (що малоймовірно з .map(p => p.catch(e => e)))
                 console.error("Неочікувана помилка в Promise.all:", error);
                 showMediaLoadingMessage("Сталася неочікувана помилка під час обробки файлів.", 'error');
                 if (addFilesBtn) addFilesBtn.disabled = false; // Увімкнути кнопку
                 checkPoolState();
            });
    }

     function handleClearAllClick() {
        if (confirm('Ви впевнені, що хочете видалити всі файли з пулу?')) {
            initialFilePool = [];
            renderFilePoolList();
			showMediaLoadingMessage('', 'hidden'); // Ховаємо повідомлення медіа-завантаження
            showImageLoadingMessage('', 'hidden');   // Ховаємо повідомлення завантаження фону
            showTextValidationMessage('', 'hidden'); // Ховаємо повідомлення валідації тексту
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
			updatePoolReductionUI(); // <-- ДОДАЙТЕ ЦЕЙ РЯДОК

    } catch (error) { //
        console.error("Помилка під час рендерингу списку файлів:", error); //
        showPoolMessage("Сталася помилка при оновленні списку файлів.", "error"); //
        if(startBattleBtn) startBattleBtn.disabled = true; //
        // Якщо сталася помилка рендерингу, також ховаємо/деактивуємо UI скорочення
        if (poolReductionControls) poolReductionControls.classList.add('hidden'); //
    }
}

function checkPoolState() {
    try {
        const n = initialFilePool.length; // Поточна кількість учасників
        let finalMessageText = ""; // Текст повідомлення, який буде встановлено в кінці
        let finalMessageType = "hidden"; // Тип повідомлення ('info', 'warning', 'error', 'hidden')
        let finalEnableButton = false; // Чи повинна бути активна кнопка "Почати Батл"

        if (!startBattleBtn || !poolMessageDiv) return; // Перевірка наявності елементів

        // --- Визначаємо фінальне повідомлення та стан кнопки на основі ПОТОЧНОГО стану пулу ---

        // A. Перевірка на КРИТИЧНІ помилки (блокують старт батлу і мають найвищий пріоритет повідомлення)
        if (n === 0) {
            // Якщо пул порожній
            finalMessageText = "";
            finalMessageType = "hidden";
            finalEnableButton = false;
        } else if (n === 1) {
             finalMessageText = "Потрібно щонайменше 2 учасники для батлу.";
             finalMessageType = "warning"; // Попередження, але блокує старт
             finalEnableButton = false;
        } else if (n % 2 !== 0) {
             finalMessageText = `Помилка: Кількість учасників (${n}) повинна бути ПАРНОЮ!`;
             finalMessageType = "error"; // Критична помилка
             finalEnableButton = false;
        } else if (currentVotingMode === 'twitch' && !twitchConnected) {
             finalMessageText = "Чат не підключено. Введіть назву каналу з якого будуть враховуватися голоси та натисність кнопку Підтвердити або перемкніться в ручний режим";
             finalMessageType = "error"; // Критична помилка
             finalEnableButton = false;
        } else {
            // B. Якщо немає критичних помилок, перевіряємо, чи є повідомлення про помилки генерації
            // Це повідомлення встановлюється функцією handleLoadTextParticipants як 'warning'
            // і включає список проблемних учасників. Ми хочемо його зберегти, якщо воно встановлене
            // і не перекривається критичною помилкою.
            const currentPoolMessageText = poolMessageDiv.textContent; // Отримуємо поточний текст повідомлення
            const isGenFailureWarning = poolMessageDiv.classList.contains('warning-message') && currentPoolMessageText.includes("Не вдалося згенерувати"); // Перевіряємо, чи поточне повідомлення є попередженням про помилку генерації

             if (isGenFailureWarning) {
                  // Якщо є повідомлення про помилки генерації, зберігаємо його
                  finalMessageText = currentPoolMessageText; // Залишаємо існуючий текст повідомлення
                  finalMessageType = "warning"; // Тип повідомлення - warning
                  // Кнопка може бути активна, якщо кількість учасників валідна (парна >=2)
                  finalEnableButton = (n >= 2 && n % 2 === 0 && (currentVotingMode !== 'twitch' || twitchConnected));
             } else {
                  // C. Якщо немає критичних помилок і немає повідомлення про помилки генерації,
                  // перевіряємо на попередження про кількість не ступінь двійки.
                  const isPowerOfTwo = (n > 0) && ((n & (n - 1)) === 0);
                  if (!isPowerOfTwo) {
                      finalMessageText = `Увага: Кількість учасників (${n}) не є ступенем двійки (2, 4, 8...).
 Деякі учасники отримають автоматичний прохід ('bye') в першому раунді.`;
                      finalMessageType = "warning"; // Тип повідомлення - warning
                      finalEnableButton = true; // Кнопка активна з цим попередженням
                  } else {
                      // D. Якщо немає ані помилок, ані попереджень - стан повного успіху.
                      // n >= 2, парне, Twitch підключено (якщо потрібно), І n є ступенем двійки.
                      finalMessageText = `Успішно завантажено ${n} учасників!`;
                      finalMessageType = "info"; // Тип повідомлення - info
                      finalEnableButton = true; // Кнопка активна
                  }
             }
        }

        // --- Встановлюємо визначене повідомлення та стан кнопки в UI ---

        // Перевіряємо, чи потрібно оновлювати повідомлення. Уникаємо зайвих змін DOM.
        const currentPoolMessageType = poolMessageDiv.classList.contains('error-message') ? 'error' :
                                       poolMessageDiv.classList.contains('warning-message') ? 'warning' :
                                       poolMessageDiv.classList.contains('info-message') ? 'info' : 'hidden';

        // Оновлюємо повідомлення тільки якщо текст або тип повідомлення змінився
        if (poolMessageDiv.textContent !== finalMessageText || currentPoolMessageType !== finalMessageType) {
             showPoolMessage(finalMessageText, finalMessageType);
        }

        // Встановлюємо стан кнопки "Почати Батл"
        startBattleBtn.disabled = !finalEnableButton;

    } catch(error) {
        // Якщо сталася помилка всередині самої функції checkPoolState
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
            let stageName = '';
            if (totalMatchupsInRound === 4) {
                stageName = ' - Чвертьфінал';
            } else if (totalMatchupsInRound === 2) {
                stageName = ' - Півфінал';
            } else if (totalMatchupsInRound === 1) {
                stageName = ' - Фінал';
            }
            matchInfoSpan.textContent = `Матч: ${currentMatchupIndex + 1} / ${totalMatchupsInRound}${stageName}`;
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

/**
     * Застосовує тему до body.
     * ВИДАЛЕНО: Логіка для старого themeSelector.
     */
    function applyTheme(themeName) {
        document.body.className = '';
        document.body.classList.add(`theme-${themeName}`);
		document.documentElement.className = `‘theme-${themeName}`;
        // --- ВИДАЛЕНО ЦЕЙ БЛОК, ВІН БІЛЬШЕ НЕ ПОТРІБЕН ---
        // if (themeSelector.value !== themeName) {
        //     themeSelector.value = themeName;
        // }
        // --- КІНЕЦЬ ВИДАЛЕНОГО ---
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

function showPoolMessage(message, type = 'error') {
    if (!poolMessageDiv) return;

    // --- ПОВЕРТАЄМОСЬ ДО textContent ---
    // Використовуємо textContent для безпеки, якщо не потрібен HTML
    poolMessageDiv.textContent = message;
    // --- КІНЕЦЬ ЗМІНИ ---

    poolMessageDiv.className = 'message-box'; // Скидаємо класи
    if (type === 'error') poolMessageDiv.classList.add('error-message');
    else if (type === 'warning') poolMessageDiv.classList.add('warning-message');
    else if (type === 'info') poolMessageDiv.classList.add('info-message');

    if (type !== 'hidden') {
        poolMessageDiv.classList.remove('hidden');
    } else {
        poolMessageDiv.classList.add('hidden');
    }
}
    /**
     * Показує повідомлення щодо фонового зображення.
     */
    function showImageLoadingMessage(message, type = 'error') {
        if (!imageLoadingMessageContainer) return;
        imageLoadingMessageContainer.innerHTML = message; // Використовуємо innerHTML для можливих тегів
        imageLoadingMessageContainer.className = 'message-box'; // Скидання класів
        if (type === 'error') imageLoadingMessageContainer.classList.add('error-message');
        else if (type === 'warning') imageLoadingMessageContainer.classList.add('warning-message');
        else if (type === 'info') imageLoadingMessageContainer.classList.add('info-message');
        if (type !== 'hidden' && message) imageLoadingMessageContainer.classList.remove('hidden');
        else imageLoadingMessageContainer.classList.add('hidden');
    }

    /**
     * Показує повідомлення щодо текстового файлу та його вмісту.
     */
    function showTextValidationMessage(message, type = 'error') {
        if (!textValidationMessageContainer) return;
        textValidationMessageContainer.innerHTML = message; // Використовуємо innerHTML
        textValidationMessageContainer.className = 'message-box'; // Скидання класів
        if (type === 'error') textValidationMessageContainer.classList.add('error-message');
        else if (type === 'warning') textValidationMessageContainer.classList.add('warning-message');
        else if (type === 'info') textValidationMessageContainer.classList.add('info-message');
        if (type !== 'hidden' && message) textValidationMessageContainer.classList.remove('hidden');
        else textValidationMessageContainer.classList.add('hidden');
    }
	/**
     * Показує або приховує повідомлення про статус завантаження та валідації текстових учасників.
* @param {string} message - Текст повідомлення.
* @param {'info'|'warning'|'error'|'hidden'} type - Тип повідомлення для стилізації.
     */
    function showTextValidationMessage(message, type) {
        if (!textValidationMessageContainer) return;
        textValidationMessageContainer.textContent = message;
        textValidationMessageContainer.className = `message-box ${type}-message ${type === 'hidden' ? 'hidden' : ''}`;
    }

    // --- Додано: Функція для відображення повідомлень про завантаження медіа ---
    /**
     * Показує або приховує повідомлення про статус завантаження медіа-файлів.
* @param {string} message - Текст повідомлення.
* @param {'info'|'warning'|'error'|'hidden'} type - Тип повідомлення для стилізації.
     */
    function showMediaLoadingMessage(message, type) {
        if (!mediaLoadingMessageContainer) return;
        mediaLoadingMessageContainer.textContent = message;
        mediaLoadingMessageContainer.className = `message-box ${type}-message ${type === 'hidden' ? 'hidden' : ''}`;
    }
    // --- Кінець доданого ---
// Новий контейнер

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
		if (poolReductionControls) poolReductionControls.classList.add('hidden'); // <-- ДОДАЙТЕ ЦЕЙ РЯДОК
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
        if (mediaType === 'video' || mediaType === 'audio') { // Початок блоку if
             console.log(`Спроба відтворення ${mediaType} для "${participantName}"`);
             previewMedia.play().then(() => { // Початок Promise then()
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
             }).catch(e => { // Початок Promise catch()
                console.warn(`Помилка автопрогравання ${mediaType} для "${participantName}":`, e); // <--- Ймовірно, рядок 661
             }); // Кінець Promise catch(). Ця дужка та дужка перед нею закривають .catch()
         } // <<< ЦЯ ДУЖКА ТЕПЕР ЗАКРИВАЄ БЛОК if ПРАВИЛЬНО.
        // Скидаємо ID таймера затримки запуску, бо він спрацював
        participantDiv._playDelayTimeoutId = null;
    }); // Закриття requestAnimationFrame callback
} // Закриття createAndShowPreview функції
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
	/**
 * Оновлює UI для скорочення пулу (випадаюче меню та кнопка).
 * Викликається з renderFilePoolList.
 */
function updatePoolReductionUI() {
    if (!poolReductionControls || !poolSizeSelect || !confirmPoolReductionBtn) {
        console.warn("Елементи керування скороченням пулу не знайдено.");
        return;
    }

    const currentSize = initialFilePool.length;
    const minTargetSize = 4; // Мінімальний розмір для скорочення
    let possibleSizes = [];

    // Визначаємо можливі розміри для скорочення (ступені двійки < currentSize)
    let powerOfTwo = Math.pow(2, Math.floor(Math.log2(currentSize)));
    if (powerOfTwo >= currentSize) {
        powerOfTwo /= 2; // Беремо найближчий менший ступінь двійки
    }

    while (powerOfTwo >= minTargetSize) {
        possibleSizes.push(powerOfTwo);
        powerOfTwo /= 2;
    }

    // Очищаємо попередні опції
    poolSizeSelect.innerHTML = '';

    if (possibleSizes.length > 0) {
        // Є куди скорочувати
        possibleSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            poolSizeSelect.appendChild(option);
        });
        poolReductionControls.classList.remove('hidden', 'disabled'); // Показуємо та робимо активним
        confirmPoolReductionBtn.disabled = false;
        poolSizeSelect.disabled = false;
    } else {
        // Немає можливості скоротити (або вже < minTargetSize, або є ступенем двійки)
        poolReductionControls.classList.add('hidden'); // Ховаємо блок
        // Можна додати порожню опцію для візуального відображення, якщо блок не ховати
        // const option = document.createElement('option');
        // option.textContent = "-";
        // poolSizeSelect.appendChild(option);
        // poolReductionControls.classList.remove('hidden');
        // poolReductionControls.classList.add('disabled'); // Робимо неактивним
        // confirmPoolReductionBtn.disabled = true;
        // poolSizeSelect.disabled = true;
    }
}

/**
 * Обробляє клік на кнопку "Застосувати" для скорочення пулу.
 */
function handleConfirmPoolReduction() {
    if (!poolSizeSelect || poolSizeSelect.disabled) return;

    const targetSize = parseInt(poolSizeSelect.value, 10);
    const currentSize = initialFilePool.length;

    if (isNaN(targetSize) || targetSize <= 0 || targetSize >= currentSize) {
        console.error(`Некоректний цільовий розмір (${targetSize}) для скорочення з ${currentSize}.`);
        return;
    }

    // Формуємо рядок ПЕРЕД викликом confirm()
    const participantsToRemove = currentSize - targetSize;
    // *** Уважно перевірте, що використовуєте саме ЗВОРОТНІ лапки тут: ` ` ***
    const confirmationMessage = `Ви впевнені, що хочете скоротити пул з ${currentSize} до ${targetSize} учасників?\n${participantsToRemove} випадкових учасників буде видалено.`;

    // *** ДІАГНОСТИКА: Виводимо сформоване повідомлення в консоль ***
    console.log("Повідомлення для confirm():", confirmationMessage);
    // *** --------------------------------------------------------- ***

    // Запитуємо підтвердження, передаючи вже готовий рядок
    if (confirm(confirmationMessage)) { // <-- Передаємо змінну
        console.log(`Скорочення пулу до ${targetSize} учасників...`);

        let shuffledPool = [...initialFilePool];
        shuffleArray(shuffledPool);
        initialFilePool = shuffledPool.slice(0, targetSize);

        console.log(`Пул скорочено. Новий розмір: ${initialFilePool.length}`);

        renderFilePoolList();
        showPoolMessage('Пул успішно скорочено!', 'info');
        showImageLoadingMessage('', 'hidden');
        showTextValidationMessage('', 'hidden');

    } else {
        console.log("Скорочення пулу скасовано користувачем.");
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
	    // --- Тимчасове рішення: Попередження про втрату даних при закритті/оновленні ---
    window.addEventListener('beforeunload', (event) => {
        // Перевіряємо, чи є сенс попереджати користувача.
        // Наприклад, якщо батл біжить, або якщо є учасники в пулі (навіть до початку батлу).
        // Ви можете адаптувати цю умову, якщо потрібно.
        if (isBattleRunning || initialFilePool.length > 0) {
            // Стандартний текст повідомлення контролюється браузером і не може бути змінений з міркувань безпеки.
            // Повернення будь-якого непорожнього рядка активує стандартне вікно попередження.
            event.preventDefault(); // Для деяких старих браузерів
            console.log("Спроба покинути сторінку під час активного батлу."); // Лог для себе
            return 'Ви впевнені, що хочете залишити сторінку? Незбережені дані батлу можуть бути втрачені!'; // Цей рядок може не відображатись, але він активує попередження
        }
        // Якщо умова не виконується (пул порожній і батл не відбувається), нічого не повертаємо, і сторінка закривається без попередження.
    });
    console.log("🛡️ Обробник beforeunload для попередження про втрату даних додано.");
    // --- Кінець тимчасового рішення ---
    // ===== КІНЕЦЬ НОВОЇ ФУНКЦІЇ =====

}); // Кінець DOMContentLoaded
