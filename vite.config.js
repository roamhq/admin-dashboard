import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  console.log(mode)
  return {
    build: {
      outDir: 'dist',
    },

    plugins: [
      tailwindcss(),
      vue()
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    server: {
      historyApiFallback: true, // Ensures Vue handles routing
      watch: {
        ignored: [
          '**/.wrangler/**', // ignore all .wrangler files and subfolders
        ],
      },
    },

    // Define environment variables
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || ''),
      __IS_DEVELOPMENT__: JSON.stringify(mode === 'development'),
    },
  }
})
