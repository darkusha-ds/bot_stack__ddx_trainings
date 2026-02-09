const { Telegraf } = require('telegraf')
const { setupBot } = require('./handlers')

const { botToken } = require('./utils/config');
const accessGuard = require('./middleware/access'); // ⬅️ добавлено

const bot = new Telegraf(botToken)

bot.use(accessGuard); // ⬅️ подключаем ДО setupBot

setupBot(bot)

bot.launch().then(() => {
  console.log('✅ Бот запущен!')
})