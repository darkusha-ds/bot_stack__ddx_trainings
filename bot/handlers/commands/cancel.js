const { resetSession } = require('../imports')

module.exports = function (bot) {
    bot.command('cancel', async (ctx) => {
        await resetSession(ctx.from.id);
        await ctx.reply('❌ Ввод отменён. Можешь начать заново с /add');
    });
}