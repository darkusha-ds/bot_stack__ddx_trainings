const { getSession, setSession, findEquipment, fs, path, Markup } = require('./imports')
const { confirm_keyboard } = require('./keyboards')

module.exports = function registerEquipmentHandlers(bot) {
  bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim()

    // Если это похоже на ввод 3 чисел — ничего не делаем, передаём дальше
    if ((/^([\d.,]+\s+){2}[\d.,]+$/).test(text)) {
      console.log('[equipment.js] Пропускаю числовой ввод:', text)
      return
    }

    const session = await getSession(ctx.from.id)
    if (!session.date || session.confirmed) return

    const eq = await findEquipment(text)
    if (!eq) return ctx.reply('❌ Тренажер не найден. Попробуй снова.')

    session.equipment = eq
    await setSession(ctx.from.id, session)

    // confirm_keyboard

    const imagePath = path.join(__dirname, '..', 'images', eq.image || '')
    const caption = `Это "${eq.display}" (№${eq.id})?\n\nПодтвердить?`

    if (fs.existsSync(imagePath)) {
      await ctx.replyWithPhoto({ source: imagePath }, { caption, ...confirm_keyboard })
    } else {
      await ctx.reply(`Нашел "${eq.display}" (№${eq.id}). Фото не найдено.\n\nПодтвердить?`, confirm_keyboard)
    }
  })
}