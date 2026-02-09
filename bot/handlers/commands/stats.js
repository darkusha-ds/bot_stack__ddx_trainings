const { db } = require('../imports')

module.exports = function (bot) {
    bot.command('stats', async (ctx) => {
        const userId = ctx.from.id.toString();

        const res1 = await db.query(
            'SELECT COUNT(*) FROM workouts WHERE user_id = $1',
            [userId]
        );
        const res2 = await db.query(
            'SELECT COUNT(*) FROM cardio_sessions WHERE user_id = $1',
            [userId]
        );

        const strength = +res1.rows[0].count;
        const cardio = +res2.rows[0].count;
        const total = strength + cardio;

        await ctx.reply(
            `📊 Твоя статистика:\n\n` +
            `🏋️ Силовые: ${strength}\n` +
            `🏃 Кардио: ${cardio}\n` +
            `📌 Всего: ${total}`
        );
    });
}