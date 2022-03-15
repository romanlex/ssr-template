import { IncomingHttpHeaders } from 'http2'
import fetch from 'cross-fetch'
import commonConfig from 'config/config-APP_TARGET'
import { requestMeta } from 'server/controllers/react/model/store'
import { camelcaseKeysDeep } from 'shared/libs/string/camelize'
import { forwardInternalResponseHeaders } from 'server/controllers/react/model/events'
import { logger } from './logger'

interface FetchConfig {
  sendInternalCookies?: boolean
  host: string
  meta?: {
    cookie: string | undefined
    headers: IncomingHttpHeaders | undefined
  }
}

function fetchWithParams(f: typeof fetch) {
  return (config: FetchConfig) => {
    logger.debug('Create fetch instance with config:', config)
    // eslint-disable-next-line no-undef
    return (url: RequestInfo, otherParams?: RequestInit) => {
      const meta = requestMeta.getState()
      const requestConfig = Object.freeze({
        headers: {
          'Content-Type': 'application/json',
          ...(meta.headers as Record<string, string>),
          ...(config.sendInternalCookies ? { Cookie: meta?.cookie || '' } : {}),
        },
        ...otherParams,
      })

      logger.debug(`Api request to ${config.host + url} with params:`, requestConfig)
      return f(config.host + url, { ...requestConfig, cache: 'reload' })
    }
  }
}

const fetchApi = fetchWithParams(fetch)({
  sendInternalCookies: process.env.BUILD_TARGET === 'server',
  host: commonConfig.apiHost,
})

interface FetchResponse extends Response {
  json<T>(): Promise<T>
}

const fetchApiCamelized = async (input: RequestInfo, init?: RequestInit | undefined): Promise<FetchResponse> => {
  const response = await fetchApi(input, init)
  const body = await response.json()
  logger.debug(`Get response:`, { input, body })

  const camelizedBody = camelcaseKeysDeep(body)

  if (process.env.BUILD_TARGET === 'server') {
    forwardInternalResponseHeaders(response.headers)
  }

  return {
    ...response,
    headers: response.headers,
    body: camelizedBody,
    json: async <T>(): Promise<T> => camelizedBody,
  }
}

export { fetchApiCamelized as api }
