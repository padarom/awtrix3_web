import presetWind4 from '@unocss/preset-wind4'
import presetAttributify from '@unocss/preset-attributify'
import { defineConfig } from 'unocss'

export default defineConfig({
    presets: [
        presetWind4(),
        presetAttributify(),
    ],
})
