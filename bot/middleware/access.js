const { isAllowed } = require('../utils/access');

module.exports = async function accessGuard(ctx, next) {
  const message = ctx.message?.text || ctx.update?.callback_query?.data;
  const command = message?.split(' ')[0];

  const publicCommands = ['/start', '/help']; // список разрешённых без доступа

  if (publicCommands.includes(command)) {
    return next();
  }

  const allowed = await isAllowed(ctx.from.id);
  if (!allowed) {
    return ctx.reply('⛔️ У тебя нет доступа к использованию бота.\nОбратись к администратору.');
  }

  return next();
};