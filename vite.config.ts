import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaultApiProxyTarget = 'http://127.0.0.1:3001'
  const rawApiProxyTarget = env.VITE_API_PROXY_TARGET || defaultApiProxyTarget

  const apiProxyTarget = (() => {
    try {
      new URL(rawApiProxyTarget)
      return rawApiProxyTarget
    } catch {
      console.warn(
        `Invalid VITE_API_PROXY_TARGET '${rawApiProxyTarget}', falling back to '${defaultApiProxyTarget}'`,
      )
      return defaultApiProxyTarget
    }
  })()

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
