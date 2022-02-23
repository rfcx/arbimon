import pluginInteractionVariants from '@windicss/plugin-interaction-variants'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'
import pluginAspectRatio from 'windicss/plugin/aspect-ratio'
import pluginFilter from 'windicss/plugin/filters'
import pluginForms from 'windicss/plugin/forms'
import pluginLineClamp from 'windicss/plugin/line-clamp'
import pluginScrollSnap from 'windicss/plugin/scroll-snap'

const range = (size: number, startAt = 1): number[] => {
  return Array.from(Array(size).keys()).map(i => i + startAt)
}

export default defineConfig({
  darkMode: false,
  plugins: [
    plugin(({ addComponents }) => {
      const navbarItems = {
        '.navbar-menu-item.router-link-exact-active': {
          'box-shadow': 'inset 0 -3px 0 #31984f'
        },
        '@media (max-width: 699px)': {
          '.navbar-menu-item.router-link-exact-active': {
            'box-shadow': 'inset 5px 0 0 #31984f'
          }
        }
      }
      addComponents(navbarItems)
    }),
    pluginInteractionVariants,
    pluginAspectRatio,
    pluginFilter,
    pluginForms,
    pluginLineClamp,
    pluginScrollSnap
  ],
  theme: {
    extend: {
      screens: {
        sm: '700px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      fontSize: {
        xxs: '0.5rem'
      },
      textColor: {
        primary: '#fff',
        warning: '#FFCD00',
        danger: '#D46767'
      },
      colors: {
        'brand-primary': {
          DEFAULT: '#31984F',
          light: '#E6F3EA',
          dark: '#25713b'
        },
        faded: '#333',
        subtle: '#ffffff90',
        'box-grey': {
          DEFAULT: '#45485D',
          dark: '#2f3140'
        },
        'steel-grey': {
          DEFAULT: '#232436',
          light: '#4a4c72',
          dark: '#202031'
        },
        'mirage-grey': {
          DEFAULT: '#141525',
          light: '#E3E3E5',
          dark: '#06060D'
        },
        danger: {
          DEFAULT: '#D46767',
          light: '#e5a4a4',
          dark: '#7f3e3e'
        },
        warning: {
          DEFAULT: '#FFCD00',
          light: '#ffe166',
          dark: '#997b00'
        }
      }
    }
  },
  safelist: [
    range(12).map(i => `grid-cols-${i}`),
    range(12).map(i => `md:grid-cols-${i}`)
  ],
  shortcuts: {
    // button
    btn: 'py-2 px-4 text-primary rounded-lg shadow-md cursor-pointer bg-box-grey hover:bg-box-grey-dark focus:(ring-0 outline-none) disabled:(bg-box-grey cursor-not-allowed opacity-50)',
    'btn-primary': 'bg-brand-primary hover:bg-brand-primary-dark',
    'btn-warning': 'bg-warning hover:bg-warning-dark',
    'btn-danger': 'bg-danger hover:bg-danger-dark',
    'btn-icon': 'py-2 px-3',
    // nav;
    'navbar-container': 'box-content text-primary flex items-center justify-center h-13',
    'navbar-item': 'box-content text-primary flex items-center justify-center h-13',
    'navbar-menu-item': 'px-2'
  }
})
