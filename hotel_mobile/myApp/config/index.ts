import { defineConfig } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'myApp',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2, 
      750: 1, 
      375: 2, 
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    framework: 'react',
    compiler: 'vite',
    // 关键修改：添加 mini 配置
    mini: {
      // 添加 workers 配置
      workers: 'src/workers',
      // 编译配置
      compile: {
        exclude: []
      },
      // 优化配置
      optimizeMainPackage: {
        enable: true
      },
      // 添加这个配置来禁用某些 webworker 特性
      postcss: {
        autoprefixer: {
          enable: true
        },
        pxtransform: {
          enable: true,
          config: {}
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

  // 如果是开发环境，添加一些额外的配置
  if (process.env.NODE_ENV === 'development') {
    baseConfig.mini.compile.exclude = [
      // 可以在这里排除某些引起问题的模块
      // /WAAccelerateWorker\.js$/
    ]
  }

  console.log('🔥 [Emergency Fix]: Forcing baseLevel 30 and disabling slicing...')
  return baseConfig
})