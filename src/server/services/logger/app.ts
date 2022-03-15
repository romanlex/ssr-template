import { injectable } from 'inversify'
import winston from 'winston'
import dayjs from 'dayjs'
import 'winston-daily-rotate-file'
import { config } from 'server/config'
import { Logger } from './interface'
import { accessLogger } from './middlewares/morgan'

const { printf } = winston.format

const messageFormat = printf(({ level, message, timestamp }) => {
  return `[${level}] [${dayjs(timestamp).format('DD.MM.YYYY-HH:mm:ss')}]: ${message}`
})

@injectable()
export class AppLogger implements Logger {
  private _logger

  constructor() {
    this._logger = winston.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          filename: config.LOGGER.APP_LOG_PATH,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: config.LOGGER.APP_MAX_SIZE,
          maxFiles: config.LOGGER.APP_MAX_SIZE,
          level: 'info',
          handleExceptions: true,
        }),
        new winston.transports.DailyRotateFile({
          filename: config.LOGGER.APP_ERROR_LOG_PATH,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: config.LOGGER.APP_MAX_SIZE,
          maxFiles: config.LOGGER.APP_MAX_SIZE,
          level: 'error',
          handleExceptions: true,
        }),
      ],
      format: winston.format.combine(
        winston.format((info) => {
          info.level = info.level.toUpperCase()
          return info
        })(),
        winston.format.timestamp(),
        winston.format.json(),
        // winston.format.colorize({ all: true }),
        messageFormat
      ),
      level: config.LOGGER.LEVEL,
      exitOnError: false,
    })

    this._logger.add(
      new winston.transports.Console({
        handleExceptions: true,
        level: config.LOGGER.LEVEL,
        format: winston.format.combine(
          winston.format((info) => {
            info.level = info.level.toUpperCase()
            return info
          })(),
          winston.format.timestamp(),
          winston.format.json(),
          messageFormat
        ),
      })
    )
  }

  accessLogger = accessLogger
  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(level: string, message: string, meta: any): void {
    this._logger.log(level, message)
    if (meta) {
      this._logger.log(level, JSON.stringify(meta, null, 2))
    }
  }

  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, meta: any): void {
    this._logger.log('info', message)
    if (meta) {
      this._logger.log('info', JSON.stringify(meta, null, 2))
    }
  }

  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, meta: any): void {
    this._logger.log('debug', message)
    if (meta) {
      this._logger.log('debug', JSON.stringify(meta, null, 2))
    }
  }

  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, meta: any): void {
    this._logger.log('warn', message)
    if (meta) {
      this._logger.log('warn', JSON.stringify(meta, null, 2))
    }
  }

  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, meta: any): void {
    this._logger.log('error', message)
    if (meta) {
      this._logger.log('error', JSON.stringify(meta, null, 2))
    }
  }

  // TODO:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verbose(message: string, meta: any): void {
    this._logger.log('verbose', message)
    if (meta) {
      this._logger.log('verbose', JSON.stringify(meta, null, 2))
    }
  }
}
