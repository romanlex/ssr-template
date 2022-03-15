import { Event, Effect, guard } from 'effector'
import { api } from 'services/api'
import { domain } from './domain'

export const updateAppOptions: Event<App.AppOptions> = domain.createEvent('update app options')

export const getAppOptions: Event<void> = domain.createEvent('get app options')

export const getAppOptionsFx: Effect<void, App.AppOptions> = domain.createEffect('get app options', {
  async handler() {
    const resp = await api('/app_options')
    const result = await resp.json<App.AppOptions>()
    return result
  },
})

guard({
  source: getAppOptions,
  filter: getAppOptionsFx.pending.map((pending) => !pending),
  target: getAppOptionsFx,
})
