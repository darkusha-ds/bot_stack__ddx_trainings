const { start_keyboard } = require('../keyboards')

module.exports = function (bot) {
    bot.command('start', async (ctx) => {
        try {
            const name = ctx.from.first_name || ctx.from.username || 'друг';
            await ctx.reply(
                `👋 Привет, ${name}!\n\n` +
                `Я бот для учёта тренировок.\n\n` +
                `Вот что я умею:\n` +
                `• Записывать тренировки (силовые и кардио)\n` +
                `• Хранить историю упражнений\n` +
                `• Показывать прогресс\n\n` +
                `📌 Используй /add чтобы начать тренировку`,
                start_keyboard
            );
        } catch (err) {
            console.error('Ошибка в /start:', err);
            await ctx.reply('⚠️ Что-то пошло не так при запуске. Попробуй позже.');
        }
    });

    bot.action('START_ADD', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.reply('🚀 Введи /add для старта тренировки');
    });
};