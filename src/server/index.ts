import http from 'http'
import chalk from 'chalk'
import { Express } from 'express'
import { Container } from 'inversify'

let server: http.Server
let app: Express

export function startServer(port: number, host: string) {
  if (process.env.EXPRESS_PID) {
    console.debug('process already running')
    return
  }

  process.on('uncaughtException', handleExit.bind(null, { exit: true }))
  process.on('SIGINT', handleExit.bind(null, { exit: true }))
  process.on('SIGTERM', handleExit.bind(null, { exit: true }))
  process.on('exit', handleExit.bind(null, { cleanup: true }))

  // this require is necessary for server HMR to recover from error
  app = require('./server').default

  server = http.createServer(app as http.RequestListener)

  process.env.EXPRESS_PID = `${process.pid}`

  let currentApp = app

  server
    .on('error', (err: Error) => {
      console.error(err)
    })
    .listen(port, host, () => {
      const address = server.address()
      if (address && typeof address !== 'string')
        console.info(
          chalk.green.bold(`
      ------------------------------------------------
      🚀 App is started on http://${host}:${port} 🚀
      ------------------------------------------------`)
        )
    })

  if (module.hot) {
    module.hot.accept('./server', () => {
      console.info('🔁  HMR Reloading `./server`...')
      try {
        app = require('./server').default
        server.removeListener('request', currentApp)
        process.removeAllListeners()
        server.on('request', app)
        currentApp = app
      } catch (error) {
        console.error(error)
      }
    })
    console.info('✅  Server-side HMR Enabled!')
  }
}

interface HandleExitOptions {
  cleanup?: boolean
  exit?: boolean
  server?: http.Server
}

// Shutdown Node.js app gracefully
function handleExit(options: HandleExitOptions, err: any): void {
  console.debug('handleExit', options, err)
  const ioc = require('./ioc')

  if (err instanceof Error) {
    const logger = (ioc.ioc as Container).get<App.ServerLogger>(ioc.TYPES.Logger)
    logger.error(err.toString())
    if (err.stack) logger.error(err.stack)
  }

  if (options.cleanup) {
    const actions = [server?.close].filter(Boolean)

    actions.forEach((item, i) => {
      try {
        item(() => {
          if (i === actions.length - 1) process.exit()
        })
      } catch (error) {
        if (i === actions.length - 1) process.exit()
      }
    })
  }

  if (options.exit) process.exit()
}

export default startServer
