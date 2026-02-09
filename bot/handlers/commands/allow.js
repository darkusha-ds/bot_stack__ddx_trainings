const { isAdmin, allowUser} = require('../imports')

module.exports = function (bot) {
    bot.command('allow', async (ctx) => {
        if (!(await isAdmin(ctx.from.id))) return ctx.reply('⛔️ Недостаточно прав.');

        const parts = ctx.message.text.split(' ');
        const userId = parseInt(parts[1]);
        if (!userId) return ctx.reply('⚠️ Укажи ID пользователя');

        await allowUser(userId, null, ctx.from.id, ctx.from.username || ctx.from.first_name);
        ctx.reply(`✅ Пользователь ${userId} получил доступ`);
    });
}