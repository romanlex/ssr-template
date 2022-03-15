import 'server/bootstrap/init'
import path from 'path'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import removeHeaders from './middlewares/remove-headers'
import { errorRequestHandler } from './middlewares/error-handler'
import ReactController from './controllers/react'
import { ioc, TYPES } from './ioc'

const PUBLIC_DIR =
  process.env.NODE_ENV === 'production' ? path.resolve('public') : (process.env.RAZZLE_PUBLIC_DIR as string)

if (PUBLIC_DIR === null) throw new ReferenceError('PUBLIC_DIR is undefined')

const logger = ioc.get<App.ServerLogger>(TYPES.Logger)

const app = express()

app.set('trust proxy', 1)
app.use(logger.accessLogger)

app.use(removeHeaders)
app.use(express.static(PUBLIC_DIR))
app.use(cookieParser())
app.use(cors())
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '1mb' }))

const router: express.Router = require('express-promise-router')()

/**
 * Health Check endpoints
 */
router.get('/status', (req, res) => {
  res.status(200).end()
})

router.head('/status', (req, res) => {
  res.status(200).end()
})

router.get('/*', ReactController)
app.use(router)

app.use(errorRequestHandler)

export { app as server }

export default app
