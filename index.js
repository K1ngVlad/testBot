const TelegramApi = require('node-telegram-bot-api');

const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TOKEN; //Токен вашего бота

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: '1', callback_data: 1 },
        { text: '2', callback_data: 2 },
        { text: '3', callback_data: 3 },
      ],
      [
        { text: '4', callback_data: 4 },
        { text: '5', callback_data: 5 },
        { text: '6', callback_data: 6 },
      ],
      [
        { text: '7', callback_data: 7 },
        { text: '8', callback_data: 8 },
        { text: '9', callback_data: 9 },
      ],
      [{ text: '10', callback_data: 10 }],
    ],
  }),
};

const restartGame = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: 'Сыграть ещё раз', callback_data: '/restart' }]],
  }),
};

const ranNum = (n) => Math.ceil(Math.random() * n);

const startGame = async (chatId) => {
  chats[chatId] = ranNum(10);
  await bot.sendMessage(chatId, `Отгадывай`, gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/game', description: 'Начать игру' },
  ]);

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name;
    switch (text) {
      case '/start':
        await bot.sendSticker(
          chatId,
          'https://tlgrm.ru/_/stickers/039/535/0395358a-70e2-437f-9459-4101b904ede5/1.webp'
        );
        await bot.sendMessage(
          chatId,
          `Привет, ${firstName} ${lastName}, я...я ещё не определился как меня зовут, грубо говоря я тестовый бот! На данный момент я ничего не умею, все претензии к моему создателю.`
        );
        break;
      case '/game':
        await bot.sendMessage(
          chatId,
          `Давай поиграем в игру! Я загадаю случайное число от 1 до 10, а ты будешь отгадывать!`
        );
        startGame(chatId);
        break;

      default:
        await bot.sendMessage(chatId, `Не правильно! Попробуй ещё раз!`);
        break;
    }
  });

  bot.on('callback_query', async (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;

    if (data === '/restart') {
      startGame(chatId);
      return;
    }

    if (chats[chatId] === null) {
      await bot.sendMessage(
        chatId,
        `Воу, воу, полегче, ковбой! Я ещё не успел загадать число. Если хочешь сыграть ещё раз, нажми на кнопку "Сыграть ещё раз"`,
        restartGame
      );
      return;
    }

    await bot.sendMessage(chatId, `Ты выбрал число ${data}.`);
    if (data - 0 === chats[chatId]) {
      await bot.sendMessage(chatId, `Поздравляю, ты отгадал!`, restartGame);
      chats[chatId] = null;
    } else {
      await bot.sendMessage(
        chatId,
        `Не правильно! Бот загадал ${chats[chatId]}`,
        restartGame
      );
      chats[chatId] = null;
    }
  });
};

start();
