import 'reflect-metadata'
import { Container } from 'inversify'
import { Logger, AppLogger } from 'server/services/logger'
import { TYPES } from './types'

const ioc = new Container()

ioc.bind<Logger>(TYPES.Logger).to(AppLogger)

export { ioc }
export default ioc
export * from './types'
