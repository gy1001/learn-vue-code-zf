const {defineConfig} = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, "src/assets/common.scss")
      ]
    }
  },

  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            require("postcss-plugin-px2rem")({
              rootValue: 37.5, // 设计稿宽度/10，如750设计稿就是75
              propList: ['*'], // 需要转换的属性，*表示所有
              selectorBlackList: [], // 不转换的选择器
              replace: true,
              mediaQuery: false,
              minPixelValue: 0
            })
          ]
        }
      }
    }
  }
})
