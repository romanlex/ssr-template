import path from 'path'
import * as ReactDOMServer from 'react-dom/server'
import { fork, serialize, allSettled, scopeBind, Subscription } from 'effector'
import express from 'express'
import { ServerStyleSheet } from 'styled-components'
import { FilledContext } from 'react-helmet-async'
import through from 'through'
import { ChunkExtractor } from '@loadable/server'
import { ioc, TYPES } from 'server/ioc'
import { measurement } from 'shared/libs/measure'
import { DEFAULT_LANG } from 'services/i18n/constants'
import { assets } from '../../assets'
import { forwardInternalResponseHeaders, forwardInternalResponseHeadersFiltered, serverStarted } from './model/events'
import { collectStylesWithJsx } from './collectStyles'
import { requestMeta } from './model/store'
import serializeJs from 'serialize-javascript'
import config from 'config/config-APP_TARGET'

const logger = ioc.get<App.ServerLogger>(TYPES.Logger)

export default async (req: express.Request, res: express.Response) => {
  const pageContructionTime = measurement('page construction', logger.debug.bind(logger))
  const allSettledTime = measurement('all settled', logger.debug.bind(logger))

  const scope = fork()

  scopeBind(forwardInternalResponseHeaders, { scope })

  let forwardHeadersUnwatch: Subscription | undefined

  const serverUnwatch = serverStarted.watch(({ res }) => {
    if (forwardHeadersUnwatch) return
    forwardHeadersUnwatch = forwardInternalResponseHeadersFiltered.watch((headers) => {
      res.set('Content-Type', 'text/html')
      res.set(headers)
    })
  })

  try {
    await allSettled(serverStarted, {
      scope,
      params: { req, res },
    })
  } catch (error) {
    if (typeof error === 'string') {
      logger.error(error)
    } else if (error instanceof Error) {
      logger.error(error.message)
    }
  }

  allSettledTime.measure()

  const serializeTime = measurement('serialize scope', logger.debug.bind(logger))

  const storesValues = serialize(scope, {
    ignore: [requestMeta],
  })

  serializeTime.measure()

  const sheet = new ServerStyleSheet()
  const helmetContext: FilledContext = {} as FilledContext

  const collectStylesTime = measurement('sheet collects styles', logger.debug.bind(logger))

  const chunkExtractor = new ChunkExtractor({
    statsFile:
      process.env.NODE_ENV === 'production'
        ? path.resolve('public', 'loadable-stats.json')
        : path.resolve('build', 'public', 'loadable-stats.json'),
    entrypoints: ['app'],
  })

  const jsx = collectStylesWithJsx(sheet, helmetContext, req, scope, chunkExtractor)

  collectStylesTime.measure()

  let sent = false

  const renderTime = measurement('react dom server render to stream', logger.debug.bind(logger))
  const stream = sheet.interleaveWithNodeStream(ReactDOMServer.renderToNodeStream(jsx))

  stream
    .pipe(
      through(
        function write(data) {
          if (!sent) {
            this.queue(
              htmlStart({
                helmet: helmetContext.helmet,
                assetsCss: assets.app.css,
                assetsJs: assets.app.js,
                chunkExtractor,
                theme: (req.cookies.theme || 'auto') as App.ThemeAlias,
                locale: (req.cookies.locale || DEFAULT_LANG) as App.Locale,
              })
            )
            sent = true
          }
          this.queue(data)
        },
        function end() {
          this.queue(htmlEnd({ storesValues, helmet: helmetContext.helmet, chunkExtractor }))
          this.queue(null)
          renderTime.measure()
          pageContructionTime.measure()
        }
      )
    )
    .pipe(res)

  cleanUp()

  stream.on('error', (error) => {
    if (typeof error === 'string') {
      logger.error(error)
    } else if (error instanceof Error) {
      logger.error(error.message)
    }
    res.status(500).end()
  })

  function cleanUp() {
    sheet.seal()
    if (forwardHeadersUnwatch) forwardHeadersUnwatch()
    serverUnwatch()
  }
}

interface StartProps {
  assetsCss?: string
  assetsJs: string
  helmet: FilledContext['helmet']
  chunkExtractor: ChunkExtractor
  theme?: App.ThemeAlias
  locale?: App.Locale
}

interface EndProps {
  storesValues: Record<string, unknown>
  helmet: FilledContext['helmet']
  chunkExtractor: ChunkExtractor
}

function htmlStart(props: StartProps) {
  return `<!DOCTYPE html>
  <html lang="${props.locale}">
    <head>
      ${props.helmet?.base.toString()}
      ${props.helmet?.meta.toString()}
      ${props.helmet?.title.toString()}
      ${props.helmet?.link.toString()}
      ${props.helmet?.style.toString()}
      ${props.assetsCss ? `<link rel='stylesheet' href='${props.assetsCss}'>` : ''}
      ${props.chunkExtractor.getStyleTags()}
      ${props.chunkExtractor.getLinkTags()}
    </head>
    <body ${props.helmet?.bodyAttributes.toString()} data-theme="${props.theme}">
      <div id='root'>`
}

function htmlEnd(props: EndProps) {
  return `</div>
    <script>
      window.initial_state = ${serializeJs(props.storesValues)}
      window.env = ${serializeJs(config)};
    </script>
    ${props.helmet?.script.toString()}
    ${props.helmet?.noscript.toString()}
    ${props.chunkExtractor.getScriptTags()}
  </body>
</html>
  `
}
