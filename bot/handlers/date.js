const { Markup, getSession, setSession, resetSession } = require('./imports')
const { date_keyboard } = require('./keyboards')

module.exports = function registerDateHandlers(bot) {
  bot.command('add', async (ctx) => {
    await resetSession(ctx.from.id)
    await ctx.reply(
      '🗓 Выбери дату тренировки:',
      date_keyboard
    )
  })

  bot.action('date_today', async (ctx) => {
    await ctx.answerCbQuery()
    const session = await getSession(ctx.from.id)
    session.date = new Date().toISOString().slice(0, 10)
    await setSession(ctx.from.id, session)
    await ctx.reply('✅ Дата выбрана: Сегодня')
    await ctx.reply('🔢 Введи номер или название тренажера:')
  })

  bot.action('date_other', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.reply('📆 Введи дату в формате ДД.ММ.ГГГГ')
  })

  bot.hears(/^\d{2}\.\d{2}\.\d{4}$/, async (ctx) => {
    const session = await getSession(ctx.from.id)
    const [d, m, y] = ctx.message.text.split('.')
    session.date = new Date(`${y}-${m}-${d}`).toISOString().slice(0, 10)
    await setSession(ctx.from.id, session)
    await ctx.reply(`✅ Дата выбрана: ${ctx.message.text}`)
    await ctx.reply('🔢 Введи номер или название тренажера:')
  })
}