module.exports = {
    publicPath: process.env.BUILD_TYPE === 'production' ? '/selphi-vue-example/' : '/',
    chainWebpack: config => {
        config.module
          .rule('vue')
          .use('vue-loader')
          .tap(options => ({
            ...options,
            compilerOptions: {
              // treat any tag that starts with ion- as custom elements
              isCustomElement: tag => tag.startsWith('facephi-')
            }
          }))
      }
}
