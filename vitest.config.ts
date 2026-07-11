import { fileURLToPath, URL } from 'node:url'

import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// Config de teste standalone: só os plugins necessários (sem vue-devtools, que
// mantém o server vivo no fim da suíte). O alias `@` continua disponível.
export default defineConfig({
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { watch: null },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**', 'dist/**'],
  },
})
