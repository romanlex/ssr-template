import { Store } from 'effector'
import { CurrencyCode } from 'namespaces/enums'
import { SERVICE_NAME } from '../constants'
import { domain } from './domain'
import { getAppOptionsFx, updateAppOptions } from './events'

export const DEFAULT_APP_OPTIONS: App.AppOptions = {
  currency: {
    code: CurrencyCode.RUB,
    exchangeRate: 1,
  },
  nextSchoolYearProductsExists: false,
  phoneConfirmationType: 'sms',
  prerender: false,
  showOlympiadBanner: false,
}

const $appOptions: Store<App.AppOptions> = domain.createStore(DEFAULT_APP_OPTIONS, {
  sid: SERVICE_NAME,
})

$appOptions.on(updateAppOptions, (_, payload) => payload).on(getAppOptionsFx.doneData, (_, data) => data)

export { $appOptions }
