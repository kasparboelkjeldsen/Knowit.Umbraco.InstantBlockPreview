const { defineConfig } = require('@vue/cli-service')



module.exports = defineConfig({
  filenameHashing: false,
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/umbraco/delivery/api/': {
        target: 'https://localhost:44388/',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'https://localhost:44388/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
