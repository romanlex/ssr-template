import { Config } from 'config/config-APP_TARGET'

const config: Config = {
  apiHost: window.env?.apiHost || window.location.host,
}

export default config
