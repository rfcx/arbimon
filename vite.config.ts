import path from 'path'
import pluginIconsResolver from 'unplugin-icons/resolver'
import pluginIcons from 'unplugin-icons/vite'
import pluginComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'

import pluginVue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    pluginComponents({
      resolvers: pluginIconsResolver({ prefix: 'icon' })
    }),
    pluginIcons({
      compiler: 'vue3',
      autoInstall: true
    }),
    pluginVue(),
    pluginWindiCSS()
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
