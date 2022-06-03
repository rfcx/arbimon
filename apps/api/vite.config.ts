import { defineConfig, UserConfig as UserConfigVite } from 'vite'
import pluginTsConfigPaths from 'vite-tsconfig-paths'
import { UserConfig as UserConfigVitest } from 'vitest'

// https://vitejs.dev/config/
const config: UserConfigVite & { test: UserConfigVitest } = {
  plugins: [
    pluginTsConfigPaths()
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
