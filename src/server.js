'use strict'
/**
 * Init server.
 * @version 2020-04-04
 */
const Path = require('path')
      , Config = require('config')

let server = null

try {
  // Init app.
  const app = require(Path.join(__dirname, 'app.js'))

  // Define a listen port for app.
  const listen_port = (Config.server.port || 8192)

  // Start app listen.
  server = app.listen(listen_port ,
            Config.server.hostname || 'localhost', () => {
              require(Path.join(__dirname, 'di.js')).getLog('info')
              .info('%s: %s listening on %s:%d as pid #%d in "%s" (instance=%d).',
                new Date(), Config.app.name, Config.server.hostname || 'localhost',
                listen_port, process.pid, process.env.NODE_ENV || '', (process.env.NODE_APP_INSTANCE || 0)
              )
            }
          )

  module.exports = server
}
catch(err) {
  require(Path.join(__dirname, 'di.js')).getLog('error', 'Error while running: %O', err)
  console.trace(err)
}
