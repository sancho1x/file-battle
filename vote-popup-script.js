window.addEventListener('message', function(event) {
        // <--- Додано: Перевірка походження відправника ---
    // Вкажіть тут очікуване походження (URL вашої сторінки на GitHub Pages без шляху)
    // Наприклад: 'https://вашнікнейм.github.io'
    const expectedOrigin = 'https://sancho1x.github.io/file-battle/'; // Змініть на ваше реальне походження

    if (event.origin !== expectedOrigin) {
         console.warn("Pop-up: Received message from unexpected origin:", event.origin);
         // return; // Можна ігнорувати повідомлення з невідомих походжень
    }
    console.log("  Popup Message: Message received!", event.data);
    // Важливо: Перевіряйте event.origin для безпеки!
    // if (event.origin !== 'ваше_основне_походження') return; // Якщо ви використовуєте перевірку, переконайтеся, що вона правильна

    const data = event.data; // <-- Цей рядок тепер буде виконуватись у контексті pop-up при отриманні повідомлення

    // Перевіряємо, чи це повідомлення про оновлення голосів
    if (data.type === 'updateVotes') {
        console.log("  Popup Message: Received vote update data:", data);

        const voteCountsDisplayElement = document.getElementById('voteCountsDisplay');
        const spans = voteCountsDisplayElement ? voteCountsDisplayElement.querySelectorAll('span') : [];

        if (voteCountsDisplayElement && spans.length >= 2) {
            console.log(`Popup Message: Found spans. Updating text. Votes: ${data.votes1}, ${data.votes2}`);
            spans[0].textContent = data.votes1; // Оновлюємо число для Учасника 1
            spans[1].textContent = data.votes2; // Оновлюємо число для Учасника 2
            console.log("Popup Message: Spans updated.");
        } else {
            console.warn("Popup Message: Could not find voteCountsDisplayElement or spans for update.");
        }
    } else {
        console.log("Popup Message: Received message of different type:", data.type);
    }
});
