// Docker用のNuxt設定
const baseConfig = require('./nuxt.config.js')

module.exports = {
  ...baseConfig,
  // Dockerコンテナ内での.nuxtディレクトリ
  buildDir: '/tmp/.nuxt',
  // 開発サーバーの設定
  server: {
    host: '0.0.0.0',
    port: 3000
  }
}