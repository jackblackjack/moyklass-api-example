'use strict'
/**
 * Configure Student model
 * @version 2021-04-04
 */
const DataTypes = require('sequelize/lib/data-types')
    , DI = require('../di.js')

module.exports = DI.getSequelize().define('lesson', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  start_at: { type: DataTypes.DATEONLY, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.INTEGER, allowNull: false, default: 0 }
},{
  timestamps: false
})
