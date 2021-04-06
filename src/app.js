'use strict'
/**
 * Init app.
 * @version 2021-04-06
 */
const Path = require('path')
      , DI = require(Path.join(__dirname,'di.js'))
      , { performance } = require('perf_hooks')
      , { v4: uuidv4 } = require('uuid')
      , Koa = require('koa')
      , koaBunyanLogger = require('koa-bunyan-logger')
      , Compose = require('koa-compose')
      , { routes, allowedMethods } = require(Path.join(__dirname, 'routes.js'))

try {
  // Init database connection.
  DI.getSequelize().authenticate()
              .catch(err => {
                throw new Error(`Unable to connect to the database: ${err}`)
              })

  // Init app.
  const app = new Koa()

  // Set error handler.
  app.on('error', (err, ctx) => {
    ctx.status = 400
    ctx.log.error('server error', err, ctx)
  })

  // Create composed stack.
  const stackComposed = Compose([
    // Use logger in app.
    koaBunyanLogger(DI.getLog('trace')),
    // Set unique request id in "X-Request-Id" header.
    (ctx, next) => {
      ctx.log.debug('Got a request from %s for %s', ctx.request.ip, ctx.path)
      ctx.response.set('X-Response-Id', uuidv4())
      return next()
    },
    // Set response time in "X-Response-Time" header.
    async (ctx, next) => {
      try {
        let t1 = performance.now()
        await next()

        let t2 = performance.now()
        let response_time =  Math.ceil(t2 - t1)

        // Set header value.
        ctx.response.set('X-Response-Time', response_time + 'ms')
      }
      catch (err) {
        // Define status code of error.
        ctx.status = err.statusCode || err.status || 500;

        // Entry error log.
        ctx.log.error( 'Catch error (code: ' + ctx.status + ') "' + err.message + '"')

        // Set the body.
        ctx.body = {
            error: true,
            message: err.message,
            stack: (undefined !== err.stack ? err.stack : [])
        }
      }
    },
    (ctx, next) => {
      ctx.response.set('X-Robots-Tag', 'noindex, nofollow')
      return next()
    }
  ])

  // Attach middleware.
  app.use(stackComposed)
  app.use(routes())
  app.use(allowedMethods())

  // Export app
  module.exports = app
}
catch(error) {
  DI.getLog('error').error(`An error occured while run app: ${error}`)
}
