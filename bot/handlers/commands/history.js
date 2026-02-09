const { dayjs, locale_ru, db } = require('../imports')

dayjs.locale(locale_ru);

module.exports = function (bot) {
    bot.command('history', async (ctx) => {
        try {
            const userId = ctx.from.id.toString();

            const strength = await db.query(
                `SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC`,
                [userId]
            );

            const cardio = await db.query(
                `SELECT * FROM cardio_sessions WHERE user_id = $1 ORDER BY date DESC`,
                [userId]
            );

            const all = [...strength.rows, ...cardio.rows];

            if (all.length === 0) {
                return ctx.reply('❌ У тебя пока нет записей тренировок.');
            }

            // Группировка по дате
            const grouped = {};

            for (const entry of all) {
                const date = dayjs(entry.date).format('DD.MM.YYYY');
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(entry);
            }

            let text = `📊 Последние тренировки:\n\n`;

            for (const date of Object.keys(grouped).sort((a, b) => dayjs(b, 'DD.MM.YYYY') - dayjs(a, 'DD.MM.YYYY'))) {
                text += `📅 ${date}\n`;
                for (const entry of grouped[date]) {
                if ('weight' in entry) {
                    text += `🏋️ ${entry.equipment_name || '—'}: ${entry.weight}кг × ${entry.reps} × ${entry.sets} = ${entry.total} кг\n`;
                } else {
                    text += `🏃 ${entry.equipment_name || '—'}: ${entry.speed_kmh}км/ч × ${entry.duration_min}мин = ${entry.distance_km} км\n`;
                }
                }
                text += '\n';
            }

            await ctx.reply(text.trim());
        } catch (err) {
            console.error('Ошибка в /history:', err);
            ctx.reply('⚠️ Не удалось загрузить историю.');
        }
    });
}