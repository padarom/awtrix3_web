import createAwtrixApi from '~/utils/createAwtrixApi'

/**
 * Automatically creates a global awtrix API instance that can be reused within
 * the application and all of its components. Can be used like this:
 *
 *   const { $awtrixApi } = useNuxtApp()
 */
export default defineNuxtPlugin({
  name: 'awtrixApi',
  enforce: 'pre',

  setup () {
    return {
      provide: { awtrixApi: createAwtrixApi() }
    }
  }
})
