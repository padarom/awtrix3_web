// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui', '@unocss/nuxt', '@vueform/nuxt'],
  ssr: false,
  hooks: {
    'prerender:routes' ({ routes }) {
      routes.clear()
    }
  },
  // This is needed
  app: { baseURL: process.env.APP_BASE_URL || '/' }
})
