import express from 'express'
import { createEvent, Event } from 'effector'
import { matchRoutes } from 'react-router-config'
import { splitMap } from 'shared/libs/effector/split-map'
import { ROUTES } from '../../../../routes/routes'

const BLACKLIST_INTERNAL_API_HEADERS = ['content-type', 'cache-control', 'e-tag', 'if-none-match']

export const serverStarted = createEvent<{
  req: express.Request
  res: express.Response
}>()

export const requestHandled = serverStarted.map(({ req, res }) => ({ req, res }))

export const forwardInternalResponseHeaders = createEvent<Headers>('forward response from internal api')

const getHeaders = (headers: Headers) => {
  const headerObj: Record<string, string> = {}
  const keys = headers.keys()
  let header = keys.next()
  while (header.value) {
    const val = headers.get(header.value)
    if (val) headerObj[header.value] = val
    header = keys.next()
  }
  return headerObj
}

export const forwardInternalResponseHeadersAsObject = forwardInternalResponseHeaders.filterMap((headers) =>
  getHeaders(headers)
)

export const forwardInternalResponseHeadersFiltered: Event<Record<string, string>> =
  forwardInternalResponseHeadersAsObject.filterMap((headers) =>
    Object.keys(headers).reduce((acc, key) => {
      if (BLACKLIST_INTERNAL_API_HEADERS.includes(key)) return acc
      acc[key] = headers[key]
      return acc
    }, {})
  )

export const requestMetaReceived = requestHandled.filterMap(({ req }) => ({
  cookies: req.cookies,
  cookie: req.headers.cookie,
  baseUrl: `http${req.secure ? 's' : ''}://${req.headers.host}`,
  headers: Object.keys(req.headers).reduce((acc, key) => {
    if (BLACKLIST_INTERNAL_API_HEADERS.includes(key)) return acc
    acc[key] = req.headers[key]
    return acc
  }, {}),
}))

export const { routeResolved, __: routeNotResolved } = splitMap({
  source: requestHandled,
  cases: {
    routeResolved: ({ req, res }) => {
      const routes = matchRoutes(ROUTES, req.url.split('?')[0])

      if (routes.length > 0) {
        const route = routes[0]

        return {
          route: route.route,
          match: route.match,
          req,
          res,
        }
      }

      return undefined
    },
  },
})
