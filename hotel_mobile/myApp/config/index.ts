import { defineConfig } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  const config = {
    projectName: 'myApp',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2, 750: 1, 375: 2, 828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    framework: 'react',
    compiler: 'vite',
    mini: {
      baseLevel: 30,
      postcss: {
        pxtransform: {
          enable: true,
          config: { selectorBlackList: [] }
        }
      }
    },
    h5: {
        devServer: {
        proxy: {
            '/api': {
            target: 'https://m1.apifoxmock.com/m1/7810839-7557920-default',
            changeOrigin: true,
            },
        },
        },
    },
  }

  console.log('🔥 [Emergency Fix]: Forcing baseLevel 30 and disabling slicing...');
  return config as any
})