const { Markup } = require('./imports')

module.exports = {
    start_keyboard: Markup.inlineKeyboard([
        Markup.button.callback('🏋️ Начать тренировку', 'START_ADD')
    ]),
    date_keyboard: Markup.inlineKeyboard([
        Markup.button.callback('📅 Сегодня', 'date_today'),
        Markup.button.callback('📆 Другой день', 'date_other')
    ]),
    choose_equipment: Markup.inlineKeyboard([
        [Markup.button.callback('▶️ Выбрать из базы', 'CHOOSE_EQUIP')],
        [Markup.button.callback('➕ Добавить своё', 'CUSTOM_EQUIP')]
    ]),
    confirm_keyboard : Markup.inlineKeyboard([
        Markup.button.callback('✅ Да', 'CONFIRM_EQUIPMENT'),
        Markup.button.callback('🔁 Нет', 'RETRY_EQUIPMENT')
    ]),
    conf_keyboard: Markup.inlineKeyboard([
        [Markup.button.callback('➕ Добавить ещё', 'ADD_WORKOUT')],
        [Markup.button.callback('✅ Сохранить тренировку', 'SAVE_WORKOUT')]
    ])
}