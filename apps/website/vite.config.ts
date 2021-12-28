import pluginVue from '@vitejs/plugin-vue'
import pluginAutoImport from 'unplugin-auto-import/vite'
import pluginIconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import { ElementPlusResolver as pluginElementPlusResolver } from 'unplugin-vue-components/resolvers'
import pluginComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'
import pluginTsConfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "./src/element.scss" as *;'
      }
    }
  },
  plugins: [
    pluginAutoImport({ resolvers: [pluginElementPlusResolver()] }),
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
  }
})
