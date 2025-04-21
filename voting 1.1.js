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
        this.voteFormat = 'strict'; // <-- НОВА ВЛАСТИВІСТЬ (default 'strict')
    }

    // Метод для встановлення формату голосування ззовні (з script.js)
    setVoteFormat(format) {
        const validFormats = ['strict', 'simple', 'both'];
        if (validFormats.includes(format)) {
            this.voteFormat = format;
            console.log(`Twitch IRC: Vote format set to '${this.voteFormat}'`);
        } else {
            console.warn(`Twitch IRC: Invalid vote format provided: ${format}. Using '${this.voteFormat}'.`);
            this.voteFormat = 'strict'; // Повертаємо до безпечного значення
        }
    }

    init(username, oauthToken, channel, onMessageCallback) {
    // Перевірка, чи вже є активне з'єднання
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.warn(`Twitch IRC: Спроба ініціалізації при вже відкритому з'єднанні до #${this.channel}. Спочатку відключіться.`);
        // Можливо, варто викликати disconnect() тут або просто вийти
        // this.disconnect();
        return; // Не продовжуємо, якщо вже підключено
    }

    this.username = username;
    this.token = oauthToken;
    this.channel = channel.toLowerCase();
    this.onMessage = onMessageCallback; // Зберігаємо переданий колбек

    console.log(`Twitch IRC: Ініціалізація підключення до #${this.channel}...`);
    this.socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    // --- Призначаємо ВСІ обробники подій ТУТ, всередині init ---
    this.socket.onopen = () => {
      // Анонімне підключення
      this.send(`NICK ${this.username}`);
      this.send(`JOIN #${this.channel}`);
      this.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
      console.log(`🔌 Twitch IRC: з'єднання до #${this.channel} відкрито.`);
      // Оновлюємо дисплей при підключенні, щоб показати початкові нулі
      this.updateVoteDisplay();
      // Можливо, оновити статус в UI тут, сигналізуючи про успішне підключення
      if (typeof updateTwitchStatus === 'function') {
           updateTwitchStatus(true, this.channel);
      }
    };

    this.socket.onmessage = (event) => { // <--- ПЕРЕМІЩЕНО СЮДИ
      const raw = event.data.trim();
      // Один рядок може містити кілька повідомлень IRC
      raw.split('\r\n').forEach(this._handleMessage.bind(this));
    };

    this.socket.onerror = (err) => { // <--- Залишаємо один екземпляр
      console.error(`❌ Twitch IRC помилка для #${this.channel}:`, err);
      // Оновлюємо статус UI на помилку, якщо є функція оновлення
      if (typeof updateTwitchStatus === 'function') {
          updateTwitchStatus(false, this.channel, 'Помилка з\'єднання');
      }
      // Важливо: onerror може спрацювати ДО onclose при невдалому підключенні
      this.socket = null; // Скидаємо сокет при помилці
      this.channel = null;
    };

    this.socket.onclose = () => { // <--- Залишаємо один екземпляр
      console.log(`🔌 Twitch IRC: з'єднання до #${this.channel} закрито.`);
      const wasConnectedChannel = this.channel; // Зберігаємо ім'я каналу, який закрився
      this.socket = null; // Скидаємо сокет
      this.channel = null; // Скидаємо канал
      // Оновлюємо статус UI на відключено, якщо є функція оновлення
      // І перевіряємо, чи закрився саме той канал, який відображається як поточний
      if (typeof updateTwitchStatus === 'function' && typeof currentTwitchChannel !== 'undefined' && wasConnectedChannel === currentTwitchChannel) {
          updateTwitchStatus(false);
      }
    };
    // --------------------------------------------------------------

  } // <--- ОСЬ ТУТ ПРАВИЛЬНЕ МІСЦЕ ДЛЯ ЗАКРИВАЮЧОЇ ДУЖКИ МЕТОДУ init

  send(msg) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      // console.warn("Twitch IRC: Спроба відправки при закритому сокеті.");
    }
  }

    _handleMessage(raw) {
        // Відповідь на PING
        if (raw.startsWith("PING")) {
            this.send("PONG :tmi.twitch.tv");
            return;
        }

        // Парсинг повідомлення чату (PRIVMSG)
        const match = raw.match(/@([^ ]+) :([^!]+)!.* PRIVMSG #([^ ]+) :(.+)/);
        if (match) {
            const tagsRaw = match[1];
            const usernameRaw = match[2];
            const channelName = match[3];
            const message = match[4].trim();

            // Парсинг тегів (існуючий код)
     const tags = Object.fromEntries(
          tagsRaw.split(";").map(s => {
              const [key, value] = s.split("=");
              // Просте декодування значень тегів (може потребувати покращення для всіх спецсимволів)
              const decodedValue = value ? value.replace(/\\s/g, ' ').replace(/\\:/g, ';').replace(/\\\\/g, '\\').replace(/\r/g, '').replace(/\n/g, '') : '';
              return [key, decodedValue];
          })
      );
      const displayName = tags["display-name"] || usernameRaw; // Ім'я для показу
      const usernameLogin = tags["login"] || usernameRaw; // Логін для ідентифікації (важливо!)

            // --- ПОЧАТОК НОВОЇ ЛОГІКИ ВИЗНАЧЕННЯ ГОЛОСУ ---
            let voteCommand = null; // Змінна для зберігання '!1' або '!2', якщо голос дійсний

            // Перевіряємо, чи повідомлення відповідає поточному формату
            const lowerCaseMessage = message.toLowerCase(); // Порівнюємо без урахування регістру

            // 1. Перевірка на '!1' або '!2' (для режимів 'strict' та 'both')
            if (this.voteFormat === 'strict' || this.voteFormat === 'both') {
                if (lowerCaseMessage === '!1') {
                    voteCommand = '!1';
                } else if (lowerCaseMessage === '!2') {
                    voteCommand = '!2';
                }
            }

            // 2. Перевірка на '1' або '2' (для режимів 'simple' та 'both'),
            //    тільки якщо голос ще не визначено попередньою перевіркою
            if (voteCommand === null && (this.voteFormat === 'simple' || this.voteFormat === 'both')) {
                if (lowerCaseMessage === '1') {
                    voteCommand = '!1'; // Ми все ще використовуємо '!1' внутрішньо для підрахунку
                } else if (lowerCaseMessage === '2') {
                    voteCommand = '!2'; // Використовуємо '!2' внутрішньо
                }
            }
            // --- КІНЕЦЬ НОВОЇ ЛОГІКИ ВИЗНАЧЕННЯ ГОЛОСУ ---

            // Обробка голосу, ТІЛЬКИ ЯКЩО voteCommand було визначено
            if (voteCommand !== null) {
                this._processVote(usernameLogin, voteCommand, tags); // Передаємо '!1' або '!2'
            }

            // Виклик загального обробника повідомлень (завжди викликається)
            if (this.onMessage) {
                this.onMessage({
                    username: displayName,
                    login: usernameLogin,
                    channel: channelName,
                    message: message, // Оригінальне повідомлення
                    tags: tags
                });
            }
        }
    }

  // <-- ВИПРАВЛЕННЯ: Додаємо 'tags' як третій параметр
  _processVote(usernameLogin, vote, tags) {
    // 1. Перевірка чи дозволено голосування
    if (!this.votingAllowed) {
        // console.log(`Vote from ${usernameLogin} for ${vote} ignored (voting not allowed).`);
        return; // Ігноруємо голос
    }

    // 2. Визначаємо ім'я для логування (беремо з тегів, якщо це перший голос)
    let displayName = tags["display-name"] || usernameLogin; // Ім'я для показу з поточного повідомлення

    // 3. Обробка голосу
    if (this.userVotes.hasOwnProperty(usernameLogin)) { // Перевіряємо, чи користувач вже голосував
      // Користувач вже голосував - перевіряємо, чи змінився голос
      const previousVoteData = this.userVotes[usernameLogin];
      if (previousVoteData.vote !== vote) {
        // Голос змінився
        this.votes[previousVoteData.vote]--; // Зменшуємо лічильник старого голосу
        this.votes[vote]++;                 // Збільшуємо лічильник нового голосу
        previousVoteData.vote = vote;       // Оновлюємо голос в записі користувача
        // Оновлюємо displayName про всяк випадок, якщо користувач змінив його в Twitch
        previousVoteData.displayName = displayName;
        this.updateVoteDisplay();           // Оновлюємо лічильники на сторінці
        // Використовуємо displayName для логу
        console.log(`🗳️ ${displayName} змінив(ла) голос на ${vote}. Результат: !1:${this.votes['!1']} !2:${this.votes['!2']}`);
      } else {
        // Голос не змінився - нічого не робимо
        // console.log(`Vote from ${displayName} for ${vote} ignored (already voted).`);
      }
    } else {
      // Це перший голос від цього користувача в поточному раунді
      this.votes[vote]++; // Збільшуємо лічильник
      // Зберігаємо голос та ім'я користувача
      this.userVotes[usernameLogin] = { vote: vote, displayName: displayName };
      this.updateVoteDisplay(); // Оновлюємо лічильники на сторінці
      // Використовуємо displayName для логу
      console.log(`🗳️ ${displayName} проголосував(ла) за ${vote}. Результат: !1:${this.votes['!1']} !2:${this.votes['!2']}`);
    }
  }

  getVoteResults() {
    return `!1:${this.votes['!1']} !2:${this.votes['!2']}`;
  }

updateVoteDisplay() {
      // Тепер шукаємо батьківські span'и
      const voteDisplay1Element = document.getElementById('voteDisplay1');
      const voteDisplay2Element = document.getElementById('voteDisplay2');

      // Проста версія: завжди використовуємо "голосів"
      const textSuffix = ' голосів';

      // --- Покращена версія з відмінюванням (опціонально, можна розкоментувати) ---
      function getSuffix(count) {
          count = Math.abs(count) % 100; // Беремо останні 2 цифри
          const lastDigit = count % 10;
          if (count > 10 && count < 20) { // 11-19 голосів
              return ' голосів';
          }
          if (lastDigit === 1) { // 1, 21, 31... голос
              return ' голос';
          }
          if (lastDigit >= 2 && lastDigit <= 4) { // 2-4, 22-24... голоси
              return ' голоси';
          }
          return ' голосів'; // 0, 5-9, 10, 20... голосів
      }
      const textSuffix1 = getSuffix(this.votes['!1']);
      const textSuffix2 = getSuffix(this.votes['!2']);
      // --- Кінець покращеної версії --- */


     if (voteDisplay1Element) {
         // Встановлюємо весь текст: число + суфікс
         // voteDisplay1Element.textContent = this.votes['!1'] + textSuffix; // Проста версія
         voteDisplay1Element.textContent = this.votes['!1'] + textSuffix1; // Покращена версія
     }
     if (voteDisplay2Element) {
          // Встановлюємо весь текст: число + суфікс
         // voteDisplay2Element.textContent = this.votes['!2'] + textSuffix; // Проста версія
         voteDisplay2Element.textContent = this.votes['!2'] + textSuffix2; // Покращена версія
     }
  }

  resetVotes() {
    console.log("🔄 Скидання голосів...");
    this.votes = { '!1': 0, '!2': 0 };
    this.userVotes = {};
    this.updateVoteDisplay();
    console.log("📊 Голоси скинуто. Поточний результат:", this.getVoteResults());
  }
  enableVoting() {
      console.log("Twitch IRC: Voting ENABLED");
      this.votingAllowed = true;
  }

  disableVoting() {
      console.log("Twitch IRC: Voting DISABLED");
      this.votingAllowed = false;
  }
  
  disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`🔌 Twitch IRC: відключення від #${this.channel}...`);
      this.send(`PART #${this.channel}`);
      this.socket.close();
      // Обробник onclose далі скине сокет і канал
    } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
        console.log(`🔌 Twitch IRC: відміна підключення до #${this.channel}...`);
        this.socket.close(); // Закриваємо сокет, що підключається
    } else {
      // console.log("🔌 Twitch IRC: Немає активного з'єднання для відключення.");
      this.socket = null; // Просто переконуємось, що все скинуто
      this.channel = null;
    }
  }
} // <--- КІНЕЦЬ КЛАСУ TwitchIRCClient

// --- Ініціалізація Twitch клієнта ---
// Створюємо екземпляр клієнта (буде доступний глобально для script.js)
const twitch = new TwitchIRCClient();

// ВАЖЛИВО: Змініть _processVote, щоб він приймав `tags` для отримання `display-name`
// Потрібно змінити виклик _processVote в _handleMessage:
// Замість: this._processVote(usernameLogin, message);
// Має бути: this._processVote(usernameLogin, message, tags); // Передаємо tags
// І змінити сам _processVote: function _processVote(usernameLogin, vote, tags) {...}
// АБО краще модифікувати _processVote, щоб він брав ім'я з this.userVotes,
// куди ми його запишемо при першому голосуванні. Давайте зробимо так.

// Змінимо _handleMessage, щоб передавати tags в _processVote
// (потрібно переконатися, що tags доступні в цій області видимості)
// Це вже зроблено у версії коду вище (в _handleMessage парситься tags).
// Тепер змінимо _processVote, щоб зберігати і використовувати ім'я. (Зроблено вище).