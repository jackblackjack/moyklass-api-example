'use strict'
/**
 * Configure Teacher model
 * @version 2021-04-04
 */
const DataTypes = require('sequelize/lib/data-types')
  , DI = require('../di.js')

module.exports = DI.getSequelize().define('teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: false
})
