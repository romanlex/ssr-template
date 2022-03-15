const path = require('path')
const zlib = require('zlib')
const webpack = require('webpack')
const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionPlugin = require('compression-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const packageJson = require('./package.json')
const appName = packageJson.name.replace('/', '_')

function isTruthy(value) {
  if (typeof value === 'boolean') return value
  if (!value) return false

  return ['1', 'true'].indexOf(value.toLowerCase()) >= 0
}

module.exports = {
  options: {
    verbose: true,
    enableReactRefresh: true,
    enableBabelCache: true,
    enableSourceMaps: true,
    disableWebpackbar: true,
    debug: { nodeExternals: false, compile: false },
    forceRuntimeEnvVars: ['HOST', 'PORT', 'API_URL', 'LOG_LEVEL'],
  },
  plugins: [],
  modifyWebpackOptions({
    options: {
      webpackOptions, // the default options that will be used to configure webpack/ webpack loaders and plugins
    },
  }) {
    return webpackOptions
  },
  modifyWebpackConfig({
    env: {
      target, // 'node' | 'web'
      dev,
    },
    webpackConfig, // the created webpack config
    paths, // the modified paths that will be used by Razzle.
  }) {
    const withAnalyzer = isTruthy(process.env.ANALYZER)
    const shouldUseGzip = isTruthy(process.env.WEBPACK_GZIP)

    if (target === 'node') {
      // https://github.com/liady/webpack-node-externals#quick-usage
      webpackConfig.externalsPresets = { node: true }
    }

    if (target === 'web' && !dev) {
      webpackConfig.devtool = false
      webpackConfig.performance = {
        hints: 'warning',
        maxEntrypointSize: 1024 * 600,
        maxAssetSize: 1024 * 600,
      }
    }

    if (target === 'web') {
      webpackConfig.output.filename = dev ? 'static/js/[name].js' : 'static/js/[name].[contenthash:8].js'

      webpackConfig.optimization = {
        moduleIds: 'deterministic',
        runtimeChunk: {
          name: 'runtime',
        },
        splitChunks: {
          chunks: 'all',
          name: false,
          cacheGroups: {
            commonBoot: {
              test: /(regenerator-runtime|runtime)/,
              name: 'runtime',
              chunks: 'initial',
              minChunks: 1,
              enforce: true,
              reuseExistingChunk: true,
              priority: 100,
            },
            vendorReact: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-config|react-router-dom)[\\/]/,
              chunks: 'all',
              name: 'vendors~react',
              enforce: true,
              priority: 30,
            },
            vendorApp: {
              test: /[\\/]node_modules[\\/](@sentry|core-js|styled-components|styled-normalize|effector|effector-react|@loadable\/component|cross-fetch|react-helmet|react-intl|@formatjs)[\\/]/,
              chunks: 'all',
              name: 'vendors~app',
              enforce: true,
              priority: 20,
            },
          },
        },
      }

      webpackConfig.entry.app = webpackConfig.entry.client

      delete webpackConfig.entry.client
    }

    webpackConfig.stats = true

    webpackConfig.plugins = [
      ...webpackConfig.plugins,
      target === 'web' &&
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: { filename: path.resolve(__dirname, 'build/public') },
        }),
      new webpack.NormalModuleReplacementPlugin(/(.*)-APP_TARGET(\.*)/, function (resource) {
        resource.request = resource.request.replace(/-APP_TARGET/, `-${target === 'web' ? 'client' : 'server'}`)
      }),
      !dev &&
        target === 'web' &&
        withAnalyzer &&
        new StatoscopeWebpackPlugin({
          saveTo: path.resolve(paths.appBuild, `reports/statocscope-[name]-[hash].html`),
          saveStatsTo: path.resolve(paths.appBuild, `reports/stats-[name]-[hash].json`),
          watchMode: false,
          name: appName,
          compressor: 'gzip',
        }),
      !dev &&
        target === 'web' &&
        withAnalyzer &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          analyzerPort: 8888,
          reportFilename: path.resolve(paths.appBuild, `reports/${appName}-${+new Date()}.html`),
          defaultSizes: 'gzip',
          generateStatsFile: false,
          statsFilename: 'stats.json',
          statsOptions: null,
          logLevel: 'info',
          openAnalyzer: true,
        }),
      !dev &&
        shouldUseGzip &&
        target === 'web' &&
        new CompressionPlugin({
          filename: '[path][base].gz',
          test: /\.(js|css|svg|eot|ttf|ott)$/i,
          algorithm: 'gzip',
          threshold: 10240, // in bytes
        }),
      !dev &&
        shouldUseGzip &&
        target === 'web' &&
        new CompressionPlugin({
          filename: '[path][base].br',
          test: /\.(js|css|html|svg)$/i,
          algorithm: 'brotliCompress',
          compressionOptions: {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
          },
          deleteOriginalAssets: false,
          threshold: 10240, // in bytes
        }),
    ].filter(Boolean)

    return webpackConfig
  },
}
