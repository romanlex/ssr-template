import Logger from 'js-logger'
import { sentryHandler } from './sentry-handler'

const logger = Logger
// eslint-disable-next-line no-console
console.debug('Init logger')

logger.useDefaults()
const consoleHandler = logger.createDefaultHandler()

if (process.env.NODE_ENV === 'production') {
  logger.setLevel(logger.INFO)
} else {
  logger.setLevel(logger.DEBUG)
}

logger.setHandler((messages, context) => {
  consoleHandler(messages, context)
  sentryHandler(messages, context)
})

export { logger as Logger }

export default logger
