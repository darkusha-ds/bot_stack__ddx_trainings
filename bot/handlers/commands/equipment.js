const { db } = require('../imports')

module.exports = function (bot) {
    bot.command('equipment', async (ctx) => {
        const res = await db.query(`
            SELECT id, display, type FROM equipment ORDER BY id
        `);

        const list = res.rows.map(eq =>
            `№${eq.id} — ${eq.display} (${eq.type === 'cardio' ? 'кардио' : 'силовой'})`
        ).join('\n');

        await ctx.reply(`📋 Список оборудования:\n\n${list}`);
    });
}