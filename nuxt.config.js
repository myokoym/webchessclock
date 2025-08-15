
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'webchessclock',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'リアルタイムで同期する対局時計（チェスクロック）をインターネット経由で複数人が操作できるWebアプリ。最大100人まで対応、秒読み対応、フィッシャーモード対応。' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    'bootstrap-vue/nuxt',
  ],
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      "socket.io-client"
    ],
    // Disable PostCSS plugins to avoid PostCSS 8 compatibility issues
    postcss: {
      plugins: {
        'postcss-import': false,
        'postcss-url': false,
        'postcss-preset-env': {
          autoprefixer: {
            grid: true
          }
        }
      }
    },
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
