const { getSession, setSession, db, fs, path, Markup } = require('./imports')
const { conf_keyboard } = require('./keyboards')

module.exports = function registerInputHandlers(bot) {
  bot.on('text', async (ctx) => {
    const text = ctx.message.text?.trim()
    if (!text) return

    console.log('[input.js] Получено сообщение:', text)

    const session = await getSession(ctx.from.id)
    if (!session?.confirmed || !session?.equipment) {
      console.log('[input.js] Пропуск: нет подтверждённого оборудования')
      return
    }

    const isInputLine = /^([\d.,]+\s+){2}[\d.,]+$/.test(text)
    if (!isInputLine) {
      console.log('[input.js] Пропуск: не распознано как 3 числа')
      return
    }

    const [a, b, c] = text.split(/\s+/).map(s => Number(s.replace(',', '.')))
    console.log('[input.js] Распаршено как:', { a, b, c })

    if ([a, b, c].some(n => isNaN(n))) {
      return ctx.reply('❗ Ошибка: введите 3 числа. Например: 60 10 4 или 30,5 12 3')
    }

    if (session.equipment.type === 'cardio') {
      const speed = a
      const time = b
      const incline = c
      const distance = +(speed * (time / 60)).toFixed(2)
      const elevation = +(distance * (incline / 100)).toFixed(1)

      await db.query(`
        INSERT INTO cardio_sessions (
          user_id, username, date, equipment_id, equipment_name,
          speed_kmh, duration_min, incline_percent, distance_km
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        ctx.from.id.toString(),
        ctx.from.username || ctx.from.first_name,
        session.date,
        session.equipment.id,
        session.equipment.display,
        speed,
        time,
        incline,
        distance
      ])

      const imagePath = path.join(__dirname, '..', 'images', session.equipment.image || '')
      const caption = `✅ Добавлено:\n\n🏃 ${session.equipment.display}\n📏 ${distance} км за ${time} мин при ${speed} км/ч\n⛰ Подъём: ${incline}% (~${elevation} м)`
      if (fs.existsSync(imagePath)) {
        await ctx.replyWithPhoto({ source: imagePath }, { caption, ...conf_keyboard })
      } else {
        await ctx.reply(caption, conf_keyboard)
      }

    } else {
      const weight = +a.toFixed(1)
      const reps = b
      const sets = c
      const total = weight * reps * sets

      await db.query(`
        INSERT INTO workouts (
          user_id, username, date, equipment_id, equipment_name,
          weight, reps, sets, total
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        ctx.from.id.toString(),
        ctx.from.username || ctx.from.first_name,
        session.date,
        session.equipment.id,
        session.equipment.display,
        weight,
        reps,
        sets,
        total
      ])

      const imagePath = path.join(__dirname, '..', 'images', session.equipment.image || '')
      const caption = `✅ Добавлено:\n\n🏋️ ${session.equipment.display}\n🔢 ${weight} кг x ${reps} x ${sets}\n📊 Итог: ${total} кг`
      if (fs.existsSync(imagePath)) {
        await ctx.replyWithPhoto({ source: imagePath }, { caption, ...conf_keyboard })
      } else {
        await ctx.reply(caption, conf_keyboard)
      }
    }

    session.confirmed = false
    session.equipment = null
    await setSession(ctx.from.id, session)
    console.log('[input.js] Успешно обработано и сброшена сессия')
  })
}