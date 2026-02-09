const { start_keyboard, date_keyboard, confirm_keyboard, conf_keyboard } = require('../keyboards')

module.exports = function test_key(bot) {
  bot.command('1', async (ctx) => {
    await ctx.reply(
        'debug_keyboards',
        start_keyboard)
  })
  bot.command('2', async (ctx) => {
    await ctx.reply(
        'debug_keyboards',
        date_keyboard)
  })
  bot.command('3', async (ctx) => {
    await ctx.reply(
        'debug_keyboards',
        confirm_keyboard)
  })
  bot.command('4', async (ctx) => {
    await ctx.reply(
        'debug_keyboards',
        conf_keyboard)
  })
}