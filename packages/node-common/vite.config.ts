import { type UserConfig as UserConfigVite, defineConfig } from 'vite'
import pluginTsConfigPaths from 'vite-tsconfig-paths'
import { type UserConfig as UserConfigVitest } from 'vitest'

// https://vitejs.dev/config/
const config: UserConfigVite & { test: UserConfigVitest } = {
  plugins: [
    pluginTsConfigPaths()
  ],
  test: {
    include: ['src/**/*.{test,spec}.ts']
  }
}

export default defineConfig(config)
