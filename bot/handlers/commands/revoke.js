const { isAdmin, revokeUser } = require('../imports')

module.exports = function (bot) {
    bot.command('revoke', async (ctx) => {
        if (!(await isAdmin(ctx.from.id))) return ctx.reply('⛔️ Недостаточно прав.');

        const parts = ctx.message.text.split(' ');
        const userId = parseInt(parts[1]);
        if (!userId) return ctx.reply('⚠️ Укажи ID пользователя');

        await revokeUser(userId);
        ctx.reply(`🚫 Доступ пользователя ${userId} отозван`);
    });
}