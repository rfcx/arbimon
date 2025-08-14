import pluginInteractionVariants from '@windicss/plugin-interaction-variants'
import pluginFlowbite from 'flowbite-windicss-plugin'
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
    pluginFlowbite,
    plugin(({ addComponents }) => {
      // INFO: Can't believe windicss does not have w-fit
      addComponents({ '.w-fit': { width: ['-moz-fit-content', 'fit-content'] } })
    })
  ],
  extract: {
    include: [
      'node_modules/flowbite/**/*.js',
      'node_modules/flowbite-datepicker/**/*.js',
      './**/*.vue'
    ]
  },
  theme: {
    extend: {
      screens: {
        xs: '300px',
        sm: '700px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1600px',
        '4xl': '1920px',
        's-xl': '1140px'
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        16: 'repeat(16, minmax(0, 1fr))'
      },
      spacing: {
        17: '4.25rem',
        30: '7.5rem'
      },
      fontFamily: {
        header: ['ABCFavoritExpanded'],
        display: ['ABCFavoritExtended'],
        eyebrow: ['Roboto Mono'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
      },
      fontSize: { // ref: https://www.figma.com/file/sP3kZZDOiOd5hqTZCkXH0x/RFCx%2FArbimon-Design-Library?type=design&node-id=1846%3A9636&mode=design&t=Fp0xjfu9wQz3wggK-1
        xxs: '0.5rem',
        sm: ['0.875rem', '1.125rem'], // Paragraph caption - font size 14px, line height 16px
        base: ['1rem', '1.5rem'], // Paragraph regular - font size 16px, line height 24px
        lg: ['1.25rem', '1.75rem'], // Paragraph large - font size 20px, line height 28px
        xl: ['1.25rem', '1.5rem'], // Headline 100 - font size 20px, line height 24px
        '2xl': ['1.5rem', '2rem'], // Paragraph Callout - font size 24px, line height 32px
        '3xl': ['1.875rem', '2.5rem'], // Headline 200 - font size 30px, line height 40px
        '4xl': ['2.5rem', '3rem'], // Headline 300 - font size 40px, line height 48px
        '5xl': ['3.25rem', '3.75rem'] // Headline 400 - font size 52px, line height 60px
      },
      textColor: {
        primary: '#fff',
        warning: '#FFCD00',
        danger: '#D46767',
        secondary: '#E9E6E1',
        placeholder: '#D3D2CF'
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
        ibis: '#A31A33',
        palm: '#00543B',
        chirp: '#D2FF8A',
        // Neutrals
        insight: '#FFFEFC',
        cloud: '#F9F6F2',
        fog: '#E9E6E1',
        'util-gray-01': '#D3D2CF',
        'util-gray-02': '#A1A19E',
        'util-gray-03': '#4B4B4B',
        'util-gray-04': '#242424',
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
          light: '#F5D2D8',
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
          DEFAULT: '#14130d',
          dark: '#100f0a'
        },
        'steel-gray': {
          DEFAULT: '#1e1c13',
          light: '#4a4942',
          dark: '#18160f'
        },
        'mirage-gray': {
          DEFAULT: '#373639',
          light: '#060508',
          dark: '#040406'
        },
        'danger-background': '#FFDADA'
      },
      backgroundImage: {
        'hero-data': "url('@/_assets/landing/hero-data.webp')",
        'hero-testimonial': "url('@/_assets/landing/testimonials/bg-image.webp')",
        'hero-contact': "url('@/_assets/contact/hero-contact-us.webp')",
        'hero-cta-home': "url('@/_assets/cta/cta-home.webp')",
        'hero-cta': "url('@/_assets/cta/fauna.webp')",
        'hero-cta-frog': "url('@/_assets/cta/frog-hero.webp')",
        'hero-cta-monkey': "url('@/_assets/cta/monkey-hero.webp')",
        'hero-cta-bird': "url('@/_assets/cta/fauna-1-hero.webp')",
        'hero-cta-frog-bg': "url('@/_assets/cta/frog-bg.webp')",
        'hero-cta-monkey-bg': "url('@/_assets/cta/monkey-bg.webp')",
        'hero-cta-bird-bg': "url('@/_assets/cta/fauna-1-bg.webp')"
      },
      aspectRatio: {
        '2.5/1': '2.5 / 1'
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
    tab: 'py-2 pr-4 pl-3 text-gray-700 border-b-0 border-transparent lg:hover:bg-transparent lg:p-0 dark:text-insight dark:hover:text-frequency lg:(dark:hover:border-b-0 dark:hover:border-b-frequency)',
    'tab-active': '!text-insight !dark:text-frequency lg:!border-b-0 lg:!border-b-frequency',
    // button
    btn: 'px-6 py-3 text-base text-center text-pitch rounded-full font-display',
    'btn-medium': 'py-2',
    'btn-small': 'py-1',
    'btn-primary': 'bg-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:bg-frequency dark:hover:bg-chirp dark:focus:ring-chirp',
    'btn-secondary': 'rounded-full text-frequency border border-frequency hover:bg-chirp focus:ring-4 focus:ring-chirp dark:text-frequency dark:hover:bg-chirp dark:border-frequency dark:hover:text-pitch dark:hover:border-chirp dark:focus:ring-chirp',
    'btn-disabled': 'cursor-not-allowed bg-util-gray-04 text-util-gray-02 border-transparent',
    'btn-danger': 'bg-transparent text-danger border-2 border-danger hover:(bg-danger text-pitch)',
    'btn-icon': 'py-2 px-3 rounded-full text-frequency border border-frequency hover:bg-chirp hover:text-pitch hover:border-chirp',
    // title
    'text-giant': 'text-3xl md:text-5xl lg:text-7xl leading-10 font-header tracking-tight',
    // navbar
    'navbar-item': 'box-content text-insight flex items-center justify-center hover:text-frequency h-9',
    'navbar-menu-item': 'mx-2',
    // input
    'input-field': 'p-2 w-full text-base border border-util-gray-03 rounded-md dark:(bg-pitch text-insight placeholder:text-util-gray-01) focus:(border-frequency ring-frequency)',
    'search-input': 'input-field border-cloud'
  }
})
