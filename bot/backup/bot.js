// bot.js
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { findEquipment } = require('./helpers');
const { getSession, setSession, resetSession } = require('./session');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const conf_keyboard = Markup.inlineKeyboard([
    Markup.button.callback('➕ Добавить ещё', 'ADD_WORKOUT'),
    Markup.button.callback('✅ Сохранить тренировку', 'SAVE_WORKOUT')
])

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('add', async (ctx) => {
  await resetSession(ctx.from.id);
  console.log(`[${ctx.from.id}] /add`);
  await ctx.reply(
    '🗓 Выбери дату тренировки:',
    Markup.inlineKeyboard([
      Markup.button.callback('📅 Сегодня', 'date_today'),
      Markup.button.callback('📆 Другой день', 'date_other')
    ])
  );
});

// bot.action('date_today', async (ctx) => {
//   const session = await getSession(ctx.from.id);
//   session.date = new Date().toISOString().slice(0, 10);
//   await setSession(ctx.from.id, session);

//   await ctx.answerCbQuery();
//   console.log(`[${ctx.from.id}] Выбрана дата: ${session.date}`);
//   await ctx.reply('✅ Дата выбрана: Сегодня');
//   await ctx.reply('🔢 Введи номер или название тренажера:');
// });

// bot.action('date_other', async (ctx) => {
//   await ctx.answerCbQuery();
//   await ctx.reply('📆 Введи дату в формате ДД.ММ.ГГГГ');
// });

bot.action('date_today', async (ctx) => {
  const session = await getSession(ctx.from.id);
  session.date = new Date().toISOString().slice(0, 10);
  await setSession(ctx.from.id, session);
  console.log(`[${ctx.from.id}] Выбрана дата: ${session.date}`);
  await ctx.reply('✅ Дата выбрана: Сегодня');
  await ctx.reply('🔢 Введи номер или название тренажера:');
});

bot.action('date_other', async (ctx) => {
  await ctx.reply('📆 Введи дату в формате ДД.ММ.ГГГГ');
});

bot.hears(/^\d{2}\.\d{2}\.\d{4}$/, async (ctx) => {
  const session = await getSession(ctx.from.id);
  const [d, m, y] = ctx.message.text.split('.');
  session.date = new Date(`${y}-${m}-${d}`).toISOString().slice(0, 10);
  await setSession(ctx.from.id, session);
  console.log(`[${ctx.from.id}] Дата вручную: ${session.date}`);
  await ctx.reply(`✅ Дата выбрана: ${ctx.message.text}`);
  await ctx.reply('🔢 Введи номер или название тренажера:');
});

bot.hears(/^\d+\s+\d+\s+\d+$/, async (ctx) => {
  const session = await getSession(ctx.from.id);
  if (!session.confirmed || !session.equipment) {
    return ctx.reply('❗ Сначала выбери и подтверди тренажер');
  }

  const [a, b, c] = ctx.message.text.trim().split(/\s+/).map(Number);

  if (session.equipment.type === 'cardio') {
    const speed = a;
    const time = b;
    const incline = c;

    const distance = +(speed * (time / 60)).toFixed(2); // км
    const elevation = +(distance * (incline / 100)).toFixed(1); // м подъема

    await db.query(`
      INSERT INTO cardio_sessions (
        user_id, username, date, equipment_id, equipment_name,
        speed_kmh, duration_min, incline_percent, distance_km
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    ]);

    const imagePath = path.join(__dirname, 'images', session.equipment.image);
    const caption = `✅ Добавлено:\n\n🏃 ${session.equipment.display}\n📏 ${distance} км за ${time} мин при ${speed} км/ч\n⛰ Подъём: ${incline}% (~${elevation} м)`;

    if (fs.existsSync(imagePath)) {
      await ctx.replyWithPhoto({ source: imagePath }, {
        caption,
        ...conf_keyboard
      });
    } else {
      await ctx.reply(caption, conf_keyboard);
    }

  } else if (session.equipment.type === 'strength') {
    const weight = a;
    const reps = b;
    const sets = c;
    const total = weight * reps * sets;

    await db.query(`
      INSERT INTO workouts (user_id, username, date, equipment_id, equipment_name, weight, reps, sets, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    ]);

    const imagePath = path.join(__dirname, 'images', session.equipment.image);
    const caption = `✅ Добавлено:\n\n🏋️ ${session.equipment.display} (№${session.equipment.id})\n🔢 ${weight} кг x ${reps} x ${sets}\n📊 Итог: ${total} кг`;

    if (fs.existsSync(imagePath)) {
      await ctx.replyWithPhoto({ source: imagePath }, {
        caption,
        ...conf_keyboard
      });
    } else {
      await ctx.reply(caption, conf_keyboard);
    }
  }

  // Сброс
  session.confirmed = false;
  session.equipment = null;
  await setSession(ctx.from.id, session);
});

bot.action('CONFIRM_EQUIPMENT', async (ctx) => {
  const session = await getSession(ctx.from.id);
  session.confirmed = true;
  await setSession(ctx.from.id, session);

  await ctx.answerCbQuery();
  console.log(`[${ctx.from.id}] Подтвердил тренажер: ${session.equipment?.display}`);

  if (session.equipment.type === 'cardio') {
    await ctx.reply('🏃 Введи данные: скорость (км/ч), время (мин), угол подъема (%)\nНапример: 14 30 5');
  } else {
    await ctx.reply('💪 Введи: вес, повторения, подходы\nНапример: 60 10 4');
  }
});

bot.action('RETRY_EQUIPMENT', async (ctx) => {
  const session = await getSession(ctx.from.id);

  // ❗ сохраняем дату, сбрасываем только тренажер и подтверждение
  const newSession = {
    date: session.date,
    confirmed: false,
    equipment: null
  };

  await setSession(ctx.from.id, newSession);
  await ctx.answerCbQuery();
  console.log(`[${ctx.from.id}] 🔁 Отмена выбора тренажера (дата сохранена)`);

  await ctx.reply('🔁 Введи номер или название тренажера заново:');
});

bot.action('ADD_WORKOUT', async (ctx) => {
  const oldSession = await getSession(ctx.from.id);
  const session = {
    date: oldSession.date,
    confirmed: false,
    equipment: null
  };
  await setSession(ctx.from.id, session);
  console.log(`[${ctx.from.id}] ➕ Добавить ещё`);
  await ctx.reply('🔢 Введи номер или название следующего тренажера:');
});

bot.action('SAVE_WORKOUT', async (ctx) => {
  await resetSession(ctx.from.id);
  console.log(`[${ctx.from.id}] ✅ Тренировка завершена`);
  await ctx.reply('💾 Тренировка сохранена. Используй /add чтобы начать новую.');
});

bot.on('text', async (ctx) => {
  const session = await getSession(ctx.from.id);
  const text = ctx.message.text.trim();

  // ⚠️ Защита от ввода веса, когда ожидается тренажер
  if (/^\d+x\d+x\d+$/.test(text)) {
    return ctx.reply('❗ Сначала введи номер или название тренажера');
  }

  if (!session.date || session.confirmed) {
    return; // Пропуск — дата не выбрана или тренажер уже подтвержден
  }

  const eq = await findEquipment(text);
  if (!eq) {
    return ctx.reply('❌ Тренажер не найден. Попробуй снова.');
  }

  session.equipment = eq;
  await setSession(ctx.from.id, session);

  const imagePath = eq.image ? path.join(__dirname, 'images', eq.image) : null;
  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('✅ Да', 'CONFIRM_EQUIPMENT'),
    Markup.button.callback('🔁 Нет', 'RETRY_EQUIPMENT')
  ]);

  if (imagePath && fs.existsSync(imagePath)) {
    await ctx.replyWithPhoto({ source: imagePath }, {
      caption: `Это "${eq.display}" (№${eq.id})?\n\nПодтвердить?`,
      ...keyboard
    });
  } else {
    await ctx.reply(`Нашел "${eq.display}" (№${eq.id}). Фото не найдено.\n\nПодтвердить?`, keyboard);
  }
});

bot.launch().then(() => {
  console.log('✅ Бот запущен!');
});