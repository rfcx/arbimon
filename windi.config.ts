import { defineConfig } from 'windicss/helpers'
import pluginAspectRatio from 'windicss/plugin/aspect-ratio'
import pluginForms from 'windicss/plugin/forms'
import pluginLineClamp from 'windicss/plugin/line-clamp'

import pluginIcons from '@windicss/plugin-icons'

export default defineConfig({
  darkMode: false,
  theme: {
    extend: {
      textColor: {
        primary: '#fff',
        secondary: '#999'
      },
      colors: {
        'brand-primary': {
          light: '#E6F3EA',
          DEFAULT: '#31984F',
          dark: '#25713b'
        },
        'blue-grey': {
          DEFAULT: '#232436',
          light: '#E5E5E7',
          dark: '#0C0D16'
        },
        'dark-grey': {
          DEFAULT: '#141525',
          light: '#E3E3E5',
          dark: '#06060D'
        },
        danger: {
          DEFAULT: '#D46767',
          light: '',
          dark: ''
        },
        warning: {
          DEFAULT: '#FFCD00',
          light: '',
          dark: ''
        }
      }
    }
  },
  shortcuts: {
    btn: 'py-2 px-4 text-primary font-semibold rounded-lg shadow-md cursor-pointer',
    'btn-primary': 'bg-brand-primary hover:bg-brand-primary-dark'
  },
  plugins: [
    pluginAspectRatio,
    pluginForms,
    pluginIcons,
    pluginLineClamp
  ]
})
