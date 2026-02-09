const { getSession, setSession, db, fs, path } = require('./imports')
const { conf_keyboard, confirm_keyboard } = require('./keyboards')
const { findEquipment } = require('./imports')

module.exports = function registerInputHandlers(bot) {
  bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim()
    const session = await getSession(ctx.from.id)

    if (!session) return

    // === 1. Числовой ввод (вес, повторы, подходы / скорость, время, наклон)
    const parts = text.split(/\s+/)
    if (parts.length === 3) {
      const [a, b, c] = parts.map(s => Number(s.replace(',', '.')))
      if ([a, b, c].every(n => !isNaN(n)) && session.confirmed && session.equipment) {
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
          const total = +(weight * reps * sets).toFixed(1) // округление до 1 знака

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

        // Очистить сессию
        session.confirmed = false
        session.equipment = null
        await setSession(ctx.from.id, session)
        return
      }
    }

    // === 2. Иначе — это поиск тренажера
    if (!session.date || session.confirmed) return

    const eq = await findEquipment(text)
    if (!eq) return ctx.reply('❌ Тренажер не найден. Попробуй снова.')

    session.equipment = eq
    await setSession(ctx.from.id, session)

    const imagePath = path.join(__dirname, '..', 'images', eq.image || '')
    const caption = `Это "${eq.display}" (№${eq.id})?\n\nПодтвердить?`

    if (fs.existsSync(imagePath)) {
      await ctx.replyWithPhoto({ source: imagePath }, { caption, ...confirm_keyboard })
    } else {
      await ctx.reply(`Нашел "${eq.display}" (№${eq.id}). Фото не найдено.\n\nПодтвердить?`, confirm_keyboard)
    }
  })
}