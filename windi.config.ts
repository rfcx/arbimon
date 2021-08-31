import { defineConfig } from 'windicss/helpers'
import pluginAspectRatio from 'windicss/plugin/aspect-ratio'
import pluginForms from 'windicss/plugin/forms'
import pluginLineClamp from 'windicss/plugin/line-clamp'

import pluginIcons from '@windicss/plugin-icons'

export default defineConfig({
  darkMode: false,
  plugins: [
    pluginAspectRatio,
    pluginForms,
    pluginIcons,
    pluginLineClamp
  ],
  theme: {
    extend: {
      colors: {
        // Generator: http://mcg.mbitson.com
        'brand-green': {
          DEFAULT: '#31984F',
          50: '#E6F3EA',
          100: '#C1E0CA',
          200: '#98CCA7',
          300: '#6FB784',
          400: '#50A769',
          500: '#31984F',
          600: '#2C9048',
          700: '#25853F',
          800: '#1F7B36',
          900: '#136A26'
        },
        'brand-gray': {
          DEFAULT: '#232436',
          50: '#E5E5E7',
          100: '#BDBDC3',
          200: '#91929B',
          300: '#656672',
          400: '#444554',
          500: '#232436',
          600: '#1F2030',
          700: '#1A1B29',
          800: '#151622',
          900: '#0C0D16'
        },
        'brand-dark-gray': {
          DEFAULT: '#141525',
          50: '#E3E3E5',
          100: '#B9B9BE',
          200: '#8A8A92',
          300: '#5B5B66',
          400: '#373846',
          500: '#141525',
          600: '#121221',
          700: '#0E0F1B',
          800: '#0B0C16',
          900: '#06060D'
        }
      }
    }
  }
})
