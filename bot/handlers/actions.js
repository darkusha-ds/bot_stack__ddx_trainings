const { getSession, setSession, resetSession } = require('./imports')

module.exports = function registerActionHandlers(bot) {
  bot.action('CONFIRM_EQUIPMENT', async (ctx) => {
    const session = await getSession(ctx.from.id)
    session.confirmed = true
    await setSession(ctx.from.id, session)
    await ctx.answerCbQuery()

    if (session.equipment.type === 'cardio') {
      await ctx.reply('🏃 Введи данные: скорость (км/ч), время (мин), угол подъема (%)\nНапример: 14 30 5')
    } else {
      await ctx.reply('💪 Введи: вес, повторения, подходы\nНапример: 60 10 4')
    }
  })

  bot.action('RETRY_EQUIPMENT', async (ctx) => {
    const session = await getSession(ctx.from.id)
    await setSession(ctx.from.id, {
      date: session.date,
      confirmed: false,
      equipment: null
    })
    await ctx.answerCbQuery()
    await ctx.reply('🔁 Введи номер или название тренажера заново:')
  })

  bot.action('ADD_WORKOUT', async (ctx) => {
    const oldSession = await getSession(ctx.from.id)
    const session = {
      date: oldSession.date,
      confirmed: false,
      equipment: null
    }
    await setSession(ctx.from.id, session)
    await ctx.answerCbQuery()
    await ctx.reply('🔢 Введи номер или название следующего тренажера:')
  })

  bot.action('SAVE_WORKOUT', async (ctx) => {
    await resetSession(ctx.from.id)
    await ctx.answerCbQuery()
    await ctx.reply('💾 Тренировка сохранена. Используй /add чтобы начать новую.')
  })
}