import { Config } from 'config/config-APP_TARGET'

if (!process.env.API_URL) throw new Error('API_URL is not defined')

const config: Config = {
  apiHost: process.env.API_URL as string,
}

export default config
