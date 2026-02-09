const { Markup } = require('telegraf');
const dayjs = require('dayjs');
const locale_ru = require('dayjs/locale/ru');
const fs = require('fs')
const path = require('path')

const { findEquipment } = require('../utils/helpers')
const { getSession, setSession, resetSession } = require('../utils/session');
const db = require('../utils/db');
const { isAdmin, allowUser, revokeUser } = require('../utils/access')

module.exports = {
    Markup,
    dayjs,
    locale_ru,
    getSession,
    setSession,
    resetSession,
    db,
    fs,
    path,
    findEquipment,
    isAdmin,
    allowUser,
    revokeUser
}