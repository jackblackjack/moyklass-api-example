'use strict'
/**
 * Dependency Injection container.
 * @version 2020-04-04
 */
const Path = require("path")
    , Config = require("config")
    , Bunyan = require("bunyan")
    , RotatingFileStream = require("bunyan-rotating-file-stream")
    , Sequelize = require("sequelize")

class DI {
  getSequelize() {
   //
   if (-1 === Object.keys(Config).indexOf('databases')) {
     throw new Error('Section "databases" not found in configuration')
   }

   //
   if (-1 === Object.keys(Config.databases).indexOf('sequelize')) {
     throw new Error(`Cannot found 'sequelize' connection options in configuration`)
   }

   //
   if (!this['sequelize']) {
     const sequelize = new Sequelize(Config.databases['sequelize'])
     this['sequelize'] = sequelize
   }

   //
   return this['sequelize']
 }

 getLog(level = "info") {

   //
   if (-1 === Object.keys(Config).indexOf('log')) {
    throw new Error('Section "log" not found in configuration')
  }

  if (!this['logger']) {
    this['logger'] = {}
  }

  if (-1 === Object.keys(this['logger']).indexOf(level)) {
    this['logger'][level] = Bunyan.createLogger({
      "name": level,
      "stream": new RotatingFileStream({
                                  ...{ "level": level },
						                      ...Config.log,
                                  ...{
                                    "path": Path.join(
                                      Path.dirname(__dirname), 'logs',
                                      (".log" !== Path.extname(level) ? `${Path.basename(level)}.log` : Path.basename(level))
                                    )
                                  }
                                })
                              })
  }

  return this['logger'][level]
 }
}

module.exports = new DI()
