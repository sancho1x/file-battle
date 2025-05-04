// У файлі vote-popup-script.js (БЕЗ ТЕГІВ <script>)

// Цей код виконується У pop-up вікні після його завантаження

// Слухач повідомлень для pop-up вікна
window.addEventListener("message", function(event) {
    // Цей код виконається у pop-up при отриманні повідомлення з основного вікна

    // <--- Важливо для GitHub Pages: Перевіряйте походження відправника ---
    // Отримайте актуальне походження вашої сторінки на GitHub Pages
    // Наприклад: 'https://вашнікнейм.github.io' або 'https://вашнікнейм.github.io/назва_репозиторію'
    // Ймовірно, це буде window.opener.location.origin, АЛЕ краще вказати ТОЧНО очікуване походження.
    const expectedOrigin = 'https://sancho1x.github.io'; // <--- ЗМІНІТЬ НА ВАШЕ РЕАЛЬНЕ ПОХОДЖЕННЯ GitHub Pages (без кінцевого слеша, якщо це корінь сайту)
    // Якщо ваш сайт наприклад https://sancho1x.github.io/file-battle/, походження може бути таким: 'https://sancho1x.github.io'
    // Перевірте в Network tab основного вікна URL battle.html - його походження буде expectedOrigin.

    // Якщо походження не збігається, ігноруємо повідомлення з міркувань безпеки
    if (event.origin !== expectedOrigin) {
         console.warn("Pop-up Console: Received message from unexpected origin:", event.origin, "Expected:", expectedOrigin);
         // return; // Розкоментуйте для суворішої перевірки
    } else {
         console.log("  Popup Console: Message received!", event.data); // ЦЕЙ ЛОГ МАЄ З'ЯВИТИСЬ В КОНСОЛІ POP-UP

         const data = event.data; // data визначена тут, у scope слухача message

         // Перевіряємо, чи це повідомлення про оновлення голосів
         // Переконайтесь, що ці поля присутні в об'єкті, який надсилає script.js
         if (data.type === "updateVotes" && data.votes1 !== undefined && data.suffix1 !== undefined && data.votes2 !== undefined && data.suffix2 !== undefined) {
              console.log("  Popup Console: Received vote update data:", data);

              const displayElement = document.getElementById("voteCountsDisplay");

              if (displayElement) {
                   // Оновлюємо вміст елемента. Використовуємо дані, отримані з повідомлення.
                   // Ви можете змінити цей формат відображення, як вам потрібно.
                   displayElement.textContent = `Учасник 1: ${data.votes1}${data.suffix1} | Учасник 2: ${data.votes2}${data.suffix2}`;
                   // Якщо хочете тільки число:число:
                   // displayElement.textContent = `${data.votes1}:${data.votes2}`;

                   console.log("  Popup Console: Display updated.");
              } else {
                  console.warn("  Popup Console: Could not find #voteCountsDisplay element.");
              }
         } else {
             console.log("  Popup Console: Received message of different type:", data.type);
         }
    }
});

// Додаємо обробник на закриття вікна користувачем (для очищення посилання в основному вікні)
// Цей код виконається у pop-up вікні. Він звертається до основного вікна (opener).
window.onbeforeunload = () => {
     console.log("  Popup Console: Pop-up window closing. Attempting to clear reference in opener.");
     // Перевіряємо, чи існує opener (основне вікно) і чи є в ньому потрібна функція
     if (window.opener && typeof window.opener.clearBattleVotePopupReference === 'function') {
          window.opener.clearBattleVotePopupReference();
     } else {
         console.warn("  Popup Console: Could not access opener or clearBattleVotePopupReference function.");
     }
};

// <--- Додайте інші функції або логіку, яка має виконуватись при завантаженні pop-up, якщо є.
// Наприклад, отримання початкових даних, якщо вони не надсилаються повідомленням.
// Але зазвичай, initialVotes надсилаються першим повідомленням.
