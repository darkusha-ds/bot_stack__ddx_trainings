const start = require('./start');
const help = require('./help');
const cancel = require('./cancel');
const stats = require('./stats');
const history = require('./history');
const equipment = require('./equipment');
const allow = require('./allow');
const revoke = require('./revoke');
const test = require('./test_keys')

module.exports = function registerCommandHandlers(bot) {
  start(bot);
  help(bot);
  cancel(bot);
  stats(bot);
  history(bot);
  equipment(bot);
  allow(bot);
  revoke(bot);
  test(bot);
};