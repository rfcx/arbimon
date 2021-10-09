import path from 'path'
import iconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'

import pluginVue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    pluginVue(),
    pluginWindiCSS(),
    pluginIcons({ compiler: 'vue3' }),
    Components({
      resolvers: iconsResolver()
    })
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ]
  },
  server: {
    port: 8080,
    open: true
  }
})
