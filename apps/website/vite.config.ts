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
          download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>'
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
