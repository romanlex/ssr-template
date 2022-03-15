declare interface Window {
  INITIAL_STATE: Record<string, unknown>
  env: import('config/config-APP_TARGET').Config
  dataLayer: Array<any>
  initial_state: {
    'service.app-options': App.AppOptions
  }
}
