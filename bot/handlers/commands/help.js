module.exports = function (bot) {
    bot.command('help', async (ctx) => {
        await ctx.reply(
            `📖 <b>Справка</b>\n\n` +
            `🔹 /add — начать новую тренировку\n` +
            `🔹 /cancel — отменить текущий ввод\n` +
            `🔹 /help — показать это сообщение\n` +
            `🔹 /stats — твоя статистика\n` +
            `🔹 /history — последние тренировки\n` +
            `🔹 /equipment — список оборудования`,
            { parse_mode: 'HTML' }
        );
    });
}