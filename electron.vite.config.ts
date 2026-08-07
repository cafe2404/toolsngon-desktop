import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { transformWithEsbuild } from 'vite'

const reactNativeMarkdownDisplayJsx = () => ({
  name: 'react-native-markdown-display-jsx',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.includes('react-native-markdown-display') || !id.endsWith('.js')) return null
    return transformWithEsbuild(code, id, {
      loader: 'jsx',
      jsx: 'automatic'
    })
  }
})

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'), // nếu có
          device: resolve(__dirname, 'src/preload/device-preload.ts')
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@components': resolve('src/renderer/src/components'),
        '@routes': resolve('src/renderer/src/routes'),
        '@contexts': resolve('src/renderer/src/contexts'),
        'react-native': 'react-native-web'
      }
    },
    plugins: [reactNativeMarkdownDisplayJsx(), react(), tailwindcss()]
  }
})
