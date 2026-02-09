const registerCommandHandlers = require('./commands/index');
const registerDateHandlers = require('./date')
const registerActionHandlers = require('./actions')
// const registerInputHandlers = require('./input')
// const registerEquipmentHandlers = require('./equipment')
const registerInputHandlers = require('./inputAndEquipment')

function setupBot(bot) {
  registerCommandHandlers(bot)
  registerDateHandlers(bot)
  registerActionHandlers(bot)
//   registerEquipmentHandlers(bot)
//   registerInputHandlers(bot)
  registerInputHandlers(bot)
}

module.exports = { setupBot }