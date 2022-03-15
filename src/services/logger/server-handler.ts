import { ILogHandler } from 'js-logger'
import { ioc, TYPES } from 'server/ioc'

const logger = ioc.get<App.ServerLogger>(TYPES.Logger)

export const serverHandler: ILogHandler = (messages, context) => {
  const { level = { name: 'INFO' }, name } = context

  if (level.name === 'ERROR') {
    const error = messages[0]
    if (error.error && error.error instanceof Error && error.error.message && error.error.message.includes('://'))
      logger.error(`[${name}] ${error.error.message}`, { ...context, args: messages })
  }

  if (level.name === 'INFO' || level.name === 'DEBUG') {
    logger.info(`[${name}] ${messages[0]}`)
  }

  if (level.name === 'WARNING') {
    logger.warn(`[${name}] ${messages[0]}`)
  }
}
