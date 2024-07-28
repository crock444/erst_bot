const TelegramApi = require('node-telegram-bot-api');
const {game_option, again_option} = require('/Options')
const token = '7403193046:AAE_O_mYXKiAcC9FerTWb76p8KEIFTPg3TU';
const bot = new TelegramApi(token, { polling: true });

const chat = {}; // Хранит загаданное число для каждого чата
const messages = {}; // Хранит ID сообщения с кнопками для каждого чата



const start_game = async (chatID) => {
    // Генерируем рандомное число
    chat[chatID] = Math.floor(Math.random() * 10);

    // Отправляем сообщение о начале игры
    await bot.sendMessage(chatID, 'Я выберу рандомное число от 0 до 9, а ты должен угадать его');

    // Отправляем сообщение с панелью цифр
    const gameMessage = await bot.sendMessage(chatID, 'Угадывай', game_option);

    // Сохраняем ID сообщения с клавиатурой
    messages[chatID] = gameMessage.message_id;
};

const start = () => {
    bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие перед пользователем' },
        { command: '/info', description: 'Получение большей информации обо мне' },
        { command: '/game', description: 'Начать игру с ботом' },
    ]);

    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatID = msg.chat.id;

        if (text === '/start') {
            await bot.sendSticker(chatID, 'https://sl.combot.org/tproger_stickers/webp/16xf09f94a5.webp');
            return bot.sendMessage(chatID, 'Добро пожаловать в моего первого телеграмм бота на языке JavaScript');
        }
        if (text === '/info') {
            return bot.sendMessage(chatID, 'Хочешь узнать больше обо мне? Переходи по ссылке.');
        }
        if (text === '/game') {
            return start_game(chatID);
        }

        return bot.sendMessage(chatID, 'Я не понимаю, что ты говоришь(');
    });

    bot.on('callback_query', async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        // Обработка кнопки "Сыграть еще раз"
        if (data === '/again') {
            // Удаление старой клавиатуры
            if (messages[chatId]) {
                try {
                    await bot.deleteMessage(chatId, messages[chatId]);
                } catch (e) {
                    console.log(`Ошибка удаления сообщения: ${e}`);
                }
            }
            // Начать игру заново
            await start_game(chatId);
            return;
        }

        // Проверка правильности ответа
        if (data == chat[chatId]) {
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chat[chatId]}`, again_option);
        } else {
            await bot.sendMessage(chatId, `К сожалению, ты не угадал. Бот загадал цифру ${chat[chatId]}`, again_option);
        }

        // Не отправляем новую панель с цифрами сразу
        // Отправляем только сообщение с результатом и кнопкой "Сыграть еще раз"
    });
};

start();



