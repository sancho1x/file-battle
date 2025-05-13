class TwitchIRCClient {
    constructor() {
        this.socket = null;
        this.onMessage = null;
        this.votes = {
            '!1': 0,
            '!2': 0
        };
        this.userVotes = {};
        this.votingAllowed = false;
        this.voteFormat = 'strict'; // Default 'strict'
        this.voteQueue = [];       // <<< НОВА ЧЕРГА
        this.queueInterval = null; // <<< ID інтервалу для обробки черги
        this.QUEUE_PROCESS_INTERVAL = 100; // Інтервал обробки черги (мс)
    }

    setVoteFormat(format) {
        const validFormats = ['strict', 'simple', 'both'];
        if (validFormats.includes(format)) {
            this.voteFormat = format;
            console.log(`Twitch IRC: Vote format set to '${this.voteFormat}'`);
        } else {
            console.warn(`Twitch IRC: Invalid vote format provided: ${format}. Using '${this.voteFormat}'.`);
            this.voteFormat = 'strict';
        }
    }

    init(username, oauthToken, channel, onMessageCallback) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.warn(`Twitch IRC: Спроба ініціалізації при вже відкритому з'єднанні до #${this.channel}. Спочатку відключіться.`);
            return;
        }
        this.username = username;
        this.token = oauthToken;
        this.channel = channel.toLowerCase();
        this.onMessage = onMessageCallback;
        console.log(`Twitch IRC: Ініціалізація підключення до #${this.channel}...`);
        this.socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

        this.socket.onopen = () => {
            this.send(`NICK ${this.username}`);
            this.send(`JOIN #${this.channel}`);
            this.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
            console.log(` 🔌  Twitch IRC: з'єднання до #${this.channel} відкрито.`);
            this.updateVoteDisplay();
            if (typeof updateTwitchStatus === 'function') {
                updateTwitchStatus(true, this.channel);
            }
            this._startQueueProcessing(); // <<< ЗАПУСК ОБРОБКИ ЧЕРГИ
        };

        this.socket.onmessage = (event) => {
            const raw = event.data.trim();
            raw.split('\r\n').forEach(this._handleMessage.bind(this));
        };

        this.socket.onerror = (err) => {
            console.error(` ❌  Twitch IRC  помилка   для  #${this.channel}:`, err);
            if (typeof updateTwitchStatus === 'function') {
                updateTwitchStatus(false, this.channel, 'Помилка з\'єднання');
            }
            this._stopQueueProcessing(); // <<< ЗУПИНКА ОБРОБКИ ЧЕРГИ
            this.socket = null;
            this.channel = null;
        };

        this.socket.onclose = () => {
            console.log(` 🔌  Twitch IRC: з'єднання до #${this.channel} закрито.`);
            const wasConnectedChannel = this.channel;
            this._stopQueueProcessing(); // <<< ЗУПИНКА ОБРОБКИ ЧЕРГИ
            this.socket = null;
            this.channel = null;
            if (typeof updateTwitchStatus === 'function' && typeof currentTwitchChannel !== 'undefined' && wasConnectedChannel === currentTwitchChannel) {
                updateTwitchStatus(false);
            }
        };
    }

    send(msg) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
        } else {
            // console.warn("Twitch IRC: Спроба відправки при закритому сокеті.");
        }
    }

    _handleMessage(raw) {
        if (raw.startsWith("PING")) {
            this.send("PONG :tmi.twitch.tv");
            return;
        }

        const match = raw.match(/@([^ ]+) :([^!]+)!.* PRIVMSG #([^ ]+) :(.+)/);
        if (match) {
            const tagsRaw = match[1];
            const usernameRaw = match[2];
            const channelName = match[3];
            const message = match[4].trim();

            const tags = Object.fromEntries(
                tagsRaw.split(";").map(s => {
                    const [key, value] = s.split("=");
                    const decodedValue = value ? value.replace(/\\s/g, ' ').replace(/\\:/g, ';').replace(/\\\\/g, '\\').replace(/\r/g, '').replace(/\n/g, '') : '';
                    return [key, decodedValue];
                })
            );

            const displayName = tags["display-name"] || usernameRaw;
            const usernameLogin = tags["login"] || usernameRaw;

            let voteCommand = null;
            const lowerCaseMessage = message.toLowerCase();

            if (this.voteFormat === 'strict' || this.voteFormat === 'both') {
                if (lowerCaseMessage === '!1') voteCommand = '!1';
                else if (lowerCaseMessage === '!2') voteCommand = '!2';
            }
            if (voteCommand === null && (this.voteFormat === 'simple' || this.voteFormat === 'both')) {
                if (lowerCaseMessage === '1') voteCommand = '!1';
                else if (lowerCaseMessage === '2') voteCommand = '!2';
            }

            // <<< ЗМІНА ТУТ: Додаємо до черги замість прямого виклику _processVote >>>
            if (voteCommand !== null && this.votingAllowed) {
                this.voteQueue.push({ usernameLogin, vote: voteCommand, tags });
                // Опціонально: логування додавання до черги
                console.log(`Added vote from ${usernameLogin} for ${voteCommand} to queue. Queue size: ${this.voteQueue.length}`);
            }
            // <<< КІНЕЦЬ ЗМІНИ >>>

            if (this.onMessage) {
                this.onMessage({
                    username: displayName,
                    login: usernameLogin,
                    channel: channelName,
                    message: message,
                    tags: tags
                });
            }
        }
    }

    // <<< НОВИЙ МЕТОД: Запуск обробки черги >>>
    _startQueueProcessing() {
        if (this.queueInterval) {
            clearInterval(this.queueInterval); // Переконаємось, що старий інтервал зупинено
        }
        this.queueInterval = setInterval(() => {
            if (this.voteQueue.length > 0) {
                const voteData = this.voteQueue.shift(); // Беремо перший елемент з черги
                this._processVote(voteData.usernameLogin, voteData.vote, voteData.tags);
            }
        }, this.QUEUE_PROCESS_INTERVAL);
        console.log("Twitch IRC: Vote queue processing started.");
    }

    // <<< НОВИЙ МЕТОД: Зупинка обробки черги >>>
    _stopQueueProcessing() {
        if (this.queueInterval) {
            clearInterval(this.queueInterval);
            this.queueInterval = null;
            console.log("Twitch IRC: Vote queue processing stopped.");
        }
        // Очистити чергу при зупинці? Залежить від логіки - можливо, голоси, що не встигли обробитися, мають бути втрачені
        this.voteQueue = [];
    }

    _processVote(usernameLogin, vote, tags) {
        // 1. Перевірка чи дозволено голосування (подвійна перевірка, також є в _handleMessage)
        if (!this.votingAllowed) {
            return;
        }

        // 2. Визначаємо ім'я для логування
        let displayName = tags["display-name"] || usernameLogin;

        // 3. Обробка голосу
        if (this.userVotes.hasOwnProperty(usernameLogin)) {
            const previousVoteData = this.userVotes[usernameLogin];
            if (previousVoteData.vote !== vote) {
                this.votes[previousVoteData.vote]--;
                this.votes[vote]++;
                previousVoteData.vote = vote;
                previousVoteData.displayName = displayName; // Оновлюємо ім'я
                this.updateVoteDisplay();
                console.log(` 🗳️ ${displayName} змінив(ла) голос на ${vote}. Результат: !1:${this.votes['!1']} !2:${this.votes['!2']}`);
            }
        } else {
            this.votes[vote]++;
            this.userVotes[usernameLogin] = { vote: vote, displayName: displayName };
            this.updateVoteDisplay();
            console.log(` 🗳️ ${displayName} проголосував(ла) за ${vote}. Результат: !1:${this.votes['!1']} !2:${this.votes['!2']}`);
        }
    }

    getVoteResults() {
        return `!1:${this.votes['!1']} !2:${this.votes['!2']}`;
    }

// У файлі voting 1.1.js, знайдіть функцію updateVoteDisplay.
    // Замініть її на цей код:
    updateVoteDisplay() {
        // Отримуємо посилання на елементи в основному вікні
        const voteDisplay1Element = document.getElementById('voteDisplay1');
        const voteDisplay2Element = document.getElementById('voteDisplay2');

        // <--- ПЕРЕКОНАЙТЕСЯ, ЩО ФУНКЦІЯ getSuffix ОГОЛОШЕНА ПОЗА updateVoteDisplay
        // та зроблена глобальною: window.getVoteSuffix = getSuffix;
        // Якщо getSuffix все ще тут, перенесіть її ВИЩЕ в файл, поза updateVoteDisplay.
        function getSuffix(count) {
            count = Math.abs(count) % 100;
            const lastDigit = count % 10;
            if (count > 10 && count < 20) return ' голосів';
            if (lastDigit === 1) return ' голос';
            if (lastDigit >= 2 && lastDigit <= 4) return ' голоси';
            return ' голосів';
        }
        // <--- Кінець перевірки getSuffix ---


        // Отримуємо актуальні голоси
        const votes1 = this.votes['!1'] || 0; // Використовуйте this.votes для отримання поточного рахунку
        const votes2 = this.votes['!2'] || 0;

        // Розраховуємо суфікси
        const textSuffix1 = getSuffix(votes1);
        const textSuffix2 = getSuffix(votes2);

        // Оновлюємо відображення в ОСНОВНОМУ вікні
        if (voteDisplay1Element) {
             // Можливо, у вас тут складніша логіка з spans, адаптуйте під ваш реальний DOM
            voteDisplay1Element.textContent = votes1 + textSuffix1;
        }
        if (voteDisplay2Element) {
            // Можливо, у вас тут складніша логіка з spans, адаптуйте під ваш реальний DOM
            voteDisplay2Element.textContent = votes2 + textSuffix2;
        }

        // <--- ДОДАНО: Викликаємо функцію надсилання повідомлення до pop-up вікна ---
        // Перевіряємо, чи глобальна функція існує, перш ніж викликати її
        if (typeof window.sendVoteUpdateToPopup === 'function') {
             window.sendVoteUpdateToPopup(votes1, textSuffix1, votes2, textSuffix2);
             //console.log("  📊   updateVoteDisplay: Vote update sent to popup."); // Лог про надсилання
        } else {
             console.warn("  📊   updateVoteDisplay: window.sendVoteUpdateToPopup is not available."); // Лог, якщо функція не визначена
        }
        // <--- КІНЕЦЬ ДОДАНОГО ---
    }

    resetVotes() {
        console.log(" 🔄  Скидання голосів...");
        this.votes = { '!1': 0, '!2': 0 };
        this.userVotes = {};
        this.voteQueue = []; // <<< ОЧИЩУЄМО ЧЕРГУ ПРИ СКИДАННІ
        this.updateVoteDisplay();
        console.log(" 📊  Голоси скинуто. Поточний результат:", this.getVoteResults());
    }

    enableVoting() {
        console.log("Twitch IRC: Voting ENABLED");
        this.votingAllowed = true;
         // Очищаємо чергу перед початком нового голосування, щоб старі голоси не обробились
        this.voteQueue = [];
        console.log("Twitch IRC: Vote queue cleared.");
    }

    disableVoting() {
        console.log("Twitch IRC: Voting DISABLED");
        this.votingAllowed = false;
        // Зазвичай не потрібно очищати чергу при disable, обробка зупиниться в _startQueueProcessing
    }

    disconnect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log(` 🔌  Twitch IRC: відключення від #${this.channel}...`);
            this.send(`PART #${this.channel}`);
            this.socket.close();
        } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            console.log(` 🔌  Twitch IRC: відміна підключення до #${this.channel}...`);
            this.socket.close();
        } else {
            this.socket = null;
            this.channel = null;
        }
         this._stopQueueProcessing(); // <<< Гарантуємо зупинку обробки черги при дисконекті
    }
} // <<< КІНЕЦЬ КЛАСУ TwitchIRCClient

// --- Ініціалізація Twitch клієнта ---
const twitch = new TwitchIRCClient();
