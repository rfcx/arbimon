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
          prefix: 'icon',
          alias: { fas: 'fa-solid', far: 'fa-regular' }
        }),
        pluginElementPlusResolver({ importStyle: 'sass' })
      ]
    }),
    pluginIcons({
      compiler: 'vue3'
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
