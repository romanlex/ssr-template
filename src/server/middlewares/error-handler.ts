import { ErrorRequestHandler } from 'express'
import PrettyError from 'pretty-error'
import { ioc, TYPES } from 'server/ioc'

const pe = new PrettyError()
pe.skipNodeFiles()
pe.skipPackage('express')

const logger = ioc.get<App.ServerLogger>(TYPES.Logger)

export const errorRequestHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  logger.error(err.toString())
  logger.error(err.stack || '')
  process.stderr.write(pe.render(err))
  res.status(500)
  res.send('Something wrong!')
  next()
}
