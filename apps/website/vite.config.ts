import pluginVue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pluginAutoImport from 'unplugin-auto-import/vite'
import pluginIconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import { ElementPlusResolver as pluginElementPlusResolver } from 'unplugin-vue-components/resolvers'
import pluginComponents from 'unplugin-vue-components/vite'
import type { UserConfig as UserConfigVite } from 'vite'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'
import pluginTsConfigPaths from 'vite-tsconfig-paths'
import type { UserConfig as UserConfigVitest } from 'vitest'
import { type RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from './src/_services/router/route-names'

const STATIC_ROUTES = [
  ROUTE_NAMES.landingHome,
  ROUTE_NAMES.landingFeatured,
  ROUTE_NAMES.landingHowItWorks,
  ROUTE_NAMES.landingFAQ,
  ROUTE_NAMES.landingPublications,
  ROUTE_NAMES.landingTeam,
  ROUTE_NAMES.landingContact,
  ROUTE_NAMES.callback
]

const flattenRoutes = (route: RouteRecordRaw, pathPrefix = ''): Array<{ path: string, name: string | symbol | undefined }> =>
  [{ path: pathPrefix + route.path, name: route.name }].concat(route.children?.flatMap(r => flattenRoutes(r, pathPrefix + route.path)) ?? [])

// https://vitejs.dev/config/
const config: UserConfigVite & { test: UserConfigVitest } = {
  // Vite aliases are needed for imports in .vue files
  // TODO: Find a way to reuse tsconfig aliases
  resolve: {
    alias: {
      '@rfcx-bio/utils': resolve(__dirname, '../../packages/utils/src/'),
      '@rfcx-bio/common': resolve(__dirname, '../../packages/common/src/'),
      '~': resolve(__dirname, 'src/_services/'),
      '@': resolve(__dirname, 'src/')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/_styles/element-plus.scss" as *;'
      }
    }
  },
  plugins: [
    pluginAutoImport({
      resolvers: [pluginElementPlusResolver()],
      dts: true
    }),
    pluginComponents({
      resolvers: [
        pluginIconsResolver({
          customCollections: ['custom-icons'],
          prefix: 'icon',
          alias: { fas: 'fa-solid', far: 'fa-regular', custom: 'custom-icons' }
        }),
        pluginElementPlusResolver({ importStyle: 'sass', ssr: true })
      ]
    }),
    pluginIcons({
      compiler: 'vue3',
      customCollections: {
        'custom-icons': {
          download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
          'chevron-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376L277.76 489.6a32 32 0 000 44.672l331.648 340.352a29.12 29.12 0 0041.728 0 30.592 30.592 0 000-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 000-42.688 29.12 29.12 0 00-41.728 0z"></path></svg>',
          'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.592 30.592 0 000 42.752L652.736 512 340.864 831.872a30.592 30.592 0 000 42.752 29.12 29.12 0 0041.728 0L714.24 534.336a32 32 0 000-44.672L382.592 149.376a29.12 29.12 0 00-41.728 0z"></path></svg>',
          linkout: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
          'angle-down': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>',
          'el-angle-down': '<svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1664 1312"><path fill="currentColor" d="m1619 552l-742 741q-19 19-45 19t-45-19L45 552q-19-19-19-45.5T45 461l166-165q19-19 45-19t45 19l531 531l531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"></path></svg>',
          'image-slash': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path fill="currentColor" d="M19.5,4H10a1,1,0,0,0,0,2H19.5a1,1,0,0,1,1,1v6.76l-1.88-1.88a3,3,0,0,0-1.14-.71,1,1,0,1,0-.64,1.9.82.82,0,0,1,.36.23l3.31,3.29a.66.66,0,0,0,0,.15.83.83,0,0,0,0,.15,1.18,1.18,0,0,0,.13.18.48.48,0,0,0,.09.11.9.9,0,0,0,.2.14.6.6,0,0,0,.11.06.91.91,0,0,0,.37.08,1,1,0,0,0,1-1V7A3,3,0,0,0,19.5,4ZM3.21,2.29A1,1,0,0,0,1.79,3.71L3.18,5.1A3,3,0,0,0,2.5,7V17a3,3,0,0,0,3,3H18.09l1.7,1.71a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42ZM4.5,7a1,1,0,0,1,.12-.46L7.34,9.25a3,3,0,0,0-1,.63L4.5,11.76Zm1,11a1,1,0,0,1-1-1V14.58l3.3-3.29a1,1,0,0,1,1.4,0L15.91,18Z"/></svg>',
          'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19" stroke="#ADFF2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 5L19 12L12 19" stroke="#ADFF2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
      }
    }),
    pluginTsConfigPaths(),
    pluginVue({
      reactivityTransform: true
    }),
    pluginWindiCSS()
  ],
  server: {
    port: 8101, // Bio-1
    open: false
  },
  ssgOptions: {
    script: 'async',
    includedRoutes (paths, routes) {
      const allRoutes = routes.flatMap(r => flattenRoutes(r))
      return allRoutes.filter(r => (STATIC_ROUTES as string[]).includes(r.name?.toString() ?? '')).map(r => r.path)
    }
  },
  ssr: {
    noExternal: ['mapbox-gl', 'siriwave']
  },
  assetsInclude: [
    '**/*.WAV'
  ],
  test: {
    deps: { inline: ['element-plus'] },
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./setup-component-tests.js']
  }
}

export default defineConfig(config)
