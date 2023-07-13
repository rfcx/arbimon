import pluginInteractionVariants from '@windicss/plugin-interaction-variants'
import pluginFlowbite from 'flowbite-windicss-plugin'
import { defineConfig } from 'windicss/helpers'
import pluginAspectRatio from 'windicss/plugin/aspect-ratio'
import pluginFilter from 'windicss/plugin/filters'
import pluginForms from 'windicss/plugin/forms'
import pluginLineClamp from 'windicss/plugin/line-clamp'
import pluginScrollSnap from 'windicss/plugin/scroll-snap'
import pluginTypography from 'windicss/plugin/typography'

const range = (length: number, startAt = 1): number[] =>
  Array.from({ length }, (_, idx) => idx + startAt)

export default defineConfig({
  darkMode: 'class',
  content: [
    './node_modules/flowbite/**/*.js'
  ],
  plugins: [
    pluginInteractionVariants,
    pluginAspectRatio,
    pluginFilter,
    pluginForms,
    pluginLineClamp,
    pluginScrollSnap,
    pluginTypography({ dark: true }),
    pluginFlowbite
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
      fontFamily: {
        header: ['ABCFavoritExpanded'],
        display: ['ABCFavoritExtended'],
        body: ['Poppins'],
        eyebrow: ['Roboto'],
        sans: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
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
        // Olds
        placeholder: '#999',
        faded: '#333',
        subtle: '#ffffff90',
        primary: {
          DEFAULT: '#31984f',
          light: '#3daa5d',
          dark: '#276e3b',
          50: '#f2fbf4',
          100: '#e1f7e7',
          200: '#c5edd0',
          300: '#97deab',
          400: '#62c67f',
          500: '#3daa5d',
          600: '#31984f',
          700: '#276e3b',
          800: '#235833',
          900: '#1e492c'
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
        'box-gray': {
          DEFAULT: '#45485D',
          dark: '#2f3140'
        },
        'steel-gray': {
          DEFAULT: '#232436',
          light: '#4a4c72',
          dark: '#202031'
        },
        'mirage-gray': {
          DEFAULT: '#141525',
          light: '#E3E3E5',
          dark: '#06060D'
        }
      },
      backgroundImage: {
        'hero-data': "url('@/_assets/landing/hero-data.webp')",
        'hero-testimonial': "url('@/_assets/landing/testimonials/bg-hero.webp')",
        'hero-featured-works': "url('@/_assets/landing/featured/feature-hero.webp')",
        'hero-contact': "url('@/_assets/landing/contact/fauna.webp')"
      }
    },
    animation: {
      wave: 'wave 1.5s ease-in-out infinite'
    }
  },
  safelist: [
    range(12).map(i => `grid-cols-${i}`),
    range(12).map(i => `md:grid-cols-${i}`)
  ],
  shortcuts: {
    // tab
    tab: 'py-2 pr-4 pl-3 text-gray-700 border-b-2 border-transparent lg:hover:bg-transparent lg:p-0 dark:text-insight dark:hover:text-frequency dark:hover:border-b-2 dark:hover:border-b-frequency',
    'tab-active': '!text-insight !dark:text-frequency lg:!border-b-2 lg:!border-b-frequency',
    // button
    btn: 'px-5 py-2 mr-3 text-base text-center text-pitch rounded-full',
    'btn-primary': 'bg-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:bg-frequency dark:hover:bg-chirp dark:focus:ring-chirp',
    'btn-secondary': 'rounded-full text-frequency border border-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:text-frequency dark:hover:bg-chirp dark:border-frequency dark:hover:text-pitch dark:hover:border-chirp dark:focus:ring-chirp',
    // input
    'input-field': 'bg-box-gray border text-sm rounded-lg block w-full p-2.5 focus:border-primary bg-mirage-gray text-white'
  }
})
