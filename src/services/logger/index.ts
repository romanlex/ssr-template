import type { Container } from 'inversify'
import type { GlobalLogger as BrowserLogger } from 'js-logger'
import type { TYPES } from 'server/ioc/types'

interface LogContextOptions {
  name?: string
}
interface LogContext extends Record<string, unknown> {
  options?: LogContextOptions
}

interface LoggerI {
  get(_name: string): LoggerI
  warn(_message: string, _context?: LogContext): void
  info(_message: string, _context?: LogContext): void
  debug(_message: string, _context?: LogContext): void
  error(_message: string, _context?: LogContext): void
}

interface LoggerOptions {
  loggerName?: string
}

class AppLogger implements LoggerI {
  loggerName: string | null
  logger: BrowserLogger | App.ServerLogger
  constructor(options?: LoggerOptions) {
    this.loggerName = options?.loggerName || null
    this.logger = {} as BrowserLogger

    if (process.env.BUILD_TARGET === 'client') {
      this.logger = require('./browser-logger').Logger as BrowserLogger
    }
    if (process.env.BUILD_TARGET === 'server') {
      const module = require('server/ioc')
      const ioc: Container = module.ioc
      const types: typeof TYPES = module.TYPES
      const logger = ioc.get<App.ServerLogger>(types.Logger) as App.ServerLogger
      this.logger = logger
    }
  }

  get(name: string) {
    const logger = new AppLogger({ loggerName: name })
    return logger
  }

  warn(message: string, context?: LogContext | unknown) {
    if (process.env.BUILD_TARGET === 'client') {
      if (context) {
        ;(this.logger as BrowserLogger).warn(this.buildMessage(message, context), context)
      } else {
        ;(this.logger as BrowserLogger).warn(this.buildMessage(message, context))
      }
    }
    if (process.env.BUILD_TARGET === 'server') {
      ;(this.logger as App.ServerLogger).warn(this.buildMessage(message, context), context)
    }
  }

  info(message: string, context?: LogContext | unknown) {
    if (process.env.BUILD_TARGET === 'client') {
      if (context) {
        ;(this.logger as BrowserLogger).info(this.buildMessage(message, context), context)
      } else {
        ;(this.logger as BrowserLogger).info(this.buildMessage(message, context))
      }
    }
    if (process.env.BUILD_TARGET === 'server') {
      ;(this.logger as App.ServerLogger).info(this.buildMessage(message, context), context)
    }
  }

  debug(message: string, context?: LogContext | unknown) {
    if (process.env.BUILD_TARGET === 'client') {
      if (context) {
        ;(this.logger as BrowserLogger).debug(this.buildMessage(message, context), context)
      } else {
        ;(this.logger as BrowserLogger).debug(this.buildMessage(message, context))
      }
    }
    if (process.env.BUILD_TARGET === 'server') {
      ;(this.logger as App.ServerLogger).debug(this.buildMessage(message, context), context)
    }
  }

  error(message: string, context?: LogContext | unknown) {
    if (process.env.BUILD_TARGET === 'client') {
      if (context) {
        ;(this.logger as BrowserLogger).error(this.buildMessage(message, context), context)
      } else {
        ;(this.logger as BrowserLogger).error(this.buildMessage(message, context))
      }
    }
    if (process.env.BUILD_TARGET === 'server') {
      ;(this.logger as App.ServerLogger).error(this.buildMessage(message, context), context)
    }
  }

  private buildMessage(message: string, context?: LogContext | unknown): string {
    const loggerName = (context as LogContext)?.options?.name || this.loggerName

    return loggerName ? `[${loggerName}] ${message}` : message
  }
}

const appLogger = new AppLogger()

export { appLogger as Logger }

export default appLogger
