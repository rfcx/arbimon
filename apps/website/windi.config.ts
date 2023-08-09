import pluginInteractionVariants from '@windicss/plugin-interaction-variants'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'
import pluginAspectRatio from 'windicss/plugin/aspect-ratio'
import pluginFilter from 'windicss/plugin/filters'
import pluginForms from 'windicss/plugin/forms'
import pluginLineClamp from 'windicss/plugin/line-clamp'
import pluginScrollSnap from 'windicss/plugin/scroll-snap'
import pluginTypography from 'windicss/plugin/typography'

const range = (length: number, startAt = 1): number[] =>
  Array.from({ length }, (_, idx) => idx + startAt)

export default defineConfig({
  darkMode: false,
  plugins: [
    plugin(({ addComponents }) => {
      const navbarItems = {
        '.navbar-menu-item.router-link-exact-active,.navbar-menu-item.router-link-active:not(.router-link-needs-exact)': {
          'box-shadow': 'inset 0 -3px 0 #ADFF2C'
        },
        '@media (max-width: 699px)': {
          '.navbar-menu-item.router-link-exact-active,.navbar-menu-item.router-link-active:not(.router-link-needs-exact)': {
            'box-shadow': 'inset 5px 0 0 #ADFF2C'
          }
        },
        '.router-link-active > a > span': {
          'font-weight': '700'
        }
      }
      addComponents(navbarItems)
    }),
    pluginInteractionVariants,
    pluginAspectRatio,
    pluginFilter,
    pluginForms,
    pluginLineClamp,
    pluginScrollSnap,
    pluginTypography({ dark: true })
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
      fontFamily: {
        header: ['ABCFavoritExpanded'],
        display: ['ABCFavoritExtended'],
        eyebrow: ['Roboto Mono'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
      },
      colors: {
        // Primary
        frequency: '#ADFF2C',
        moss: '#1E1C13',
        echo: '#14130D',
        pitch: '#060508',
        // Secondary
        spoonbill: '#FFAFAF',
        flamingo: '#FF6868',
        palm: '#008059',
        chirp: '#D2FF8A',
        // Neutrals
        insight: '#FFFEFC',
        cloud: '#F9F6F2',
        fog: '#E9E6E1',
        'util-gray-01': '#7F7D78',
        'util-gray-02': '#4B4B4B',
        'util-gray-03': '#242424',
        // Olds
        placeholder: '#999',
        faded: '#333',
        subtle: '#F9F6F2',
        'brand-primary': {
          DEFAULT: '#ADFF2C',
          light: '#bdff56',
          dark: '#8acc23'
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
        },
        info: {
          DEFAULT: '#45485D'
        },
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
        }
      }
    }
  },
  safelist: [
    range(12).map(i => `grid-cols-${i}`),
    range(12).map(i => `md:grid-cols-${i}`)
  ],
  shortcuts: {
    // buttons
    btn: 'px-5 py-2 text-base text-center text-pitch rounded-full font-display',
    'btn-primary': 'bg-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:bg-frequency dark:hover:bg-chirp dark:focus:ring-chirp',
    'btn-secondary': 'rounded-full text-frequency border border-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:text-frequency dark:hover:bg-chirp dark:border-frequency dark:hover:text-pitch dark:hover:border-chirp dark:focus:ring-chirp',
    'btn-warning': 'bg-warning hover:bg-warning-dark',
    'btn-danger': 'bg-danger hover:bg-danger-dark',
    'btn-icon': 'py-2 px-3 rounded-full text-frequency border border-frequency hover:bg-chirp hover:text-pitch hover:border-chirp',
    // nav
    'navbar-container': 'box-content text-insight flex items-center justify-center h-13',
    'navbar-item': 'box-content text-insight flex items-center justify-center h-13',
    'navbar-menu-item': 'px-2',
    // input
    'input-field': 'bg-box-grey border text-sm rounded-lg block w-full p-2.5 focus:border-brand-primary bg-mirage-grey text-white'
  }
})
