import pluginVue from '@vitejs/plugin-vue'
import pluginAutoImport from 'unplugin-auto-import/vite'
import pluginIconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import { ElementPlusResolver as pluginElementPlusResolver } from 'unplugin-vue-components/resolvers'
import pluginComponents from 'unplugin-vue-components/vite'
import { defineConfig, UserConfig as UserConfigVite } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'
import pluginTsConfigPaths from 'vite-tsconfig-paths'
import { UserConfig as UserConfigVitest } from 'vitest'

// https://vitejs.dev/config/
const config: UserConfigVite & { test: UserConfigVitest } = {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "./src/element.scss" as *;'
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
        pluginElementPlusResolver({ importStyle: 'sass' })
      ]
    }),
    pluginIcons({
      compiler: 'vue3',
      customCollections: {
        'custom-icons': {
          download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
          'chevron-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376L277.76 489.6a32 32 0 000 44.672l331.648 340.352a29.12 29.12 0 0041.728 0 30.592 30.592 0 000-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 000-42.688 29.12 29.12 0 00-41.728 0z"></path></svg>',
          'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.592 30.592 0 000 42.752L652.736 512 340.864 831.872a30.592 30.592 0 000 42.752 29.12 29.12 0 0041.728 0L714.24 534.336a32 32 0 000-44.672L382.592 149.376a29.12 29.12 0 00-41.728 0z"></path></svg>'
        }
      }
    }),
    pluginTsConfigPaths(),
    pluginVue(),
    pluginWindiCSS()
  ],
  server: {
    port: 8080,
    open: false
  },
  test: {
    include: ['src/**/*.{test,spec}.ts']
  }
}

export default defineConfig(config)
