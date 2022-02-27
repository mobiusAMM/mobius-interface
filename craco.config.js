const fs = require('fs')
const path = require('path')
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const webpack = require('webpack')

const srcDirs = fs.readdirSync(path.resolve(__dirname, './src'), {
  withFileTypes: true,
})

const aliases = srcDirs
  .filter((dir) => dir.isDirectory())
  .reduce(
    (acc, el) => ({
      ...acc,
      [el.name]: path.resolve(__dirname, `./src/${el.name}`),
    }),
    {}
  )

module.exports = {
  babel: {
    presets: [['@babel/preset-react', { runtime: 'automatic', importSource: '@emotion/react' }]],
    plugins: [
      '@emotion/babel-plugin',
      'babel-plugin-twin',
      'babel-plugin-macros',
      [
        '@simbathesailor/babel-plugin-use-what-changed',
        {
          active: process.env.NODE_ENV === 'development', // boolean
        },
      ],
    ],
  },
  webpack: {
    alias: aliases,
    configure: (config) => {
      const htmlWebpackPlugin = config.plugins.find((plugin) => plugin.constructor.name === 'HtmlWebpackPlugin')
      if (!htmlWebpackPlugin) {
        throw new Error("Can't find HtmlWebpackPlugin")
      }

      config.resolve.fallback = {
        string_decoder: require.resolve('string_decoder/'),
        stream: require.resolve('stream-browserify'),
        path: false,
        fs: false,
        util: false,
      }

      config.plugins.unshift(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      )

      config.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      })

      // htmlWebpackPlugin.userOptions = deepMerge(htmlWebpackPlugin.userOptions, {
      //   title: appInfo.title ?? appInfo.name,
      //   meta: {
      //     viewport: "width=device-width, initial-scale=1",
      //     description: appInfo.description,

      //     "og:title": appInfo.name,
      //     "og:site_name": appInfo.name,
      //     "og:url": appInfo.url,
      //     "og:description": appInfo.description,
      //     "og:type": "website",
      //     "og:image": appInfo.image,

      //     "twitter:card": "summary_large_image",
      //     "twitter:site": `@${appInfo.socials.twitter}`,
      //     "twitter:url": appInfo.url,
      //     "twitter:title": appInfo.name,
      //     "twitter:description": appInfo.description,
      //     "twitter:image": appInfo.image,
      //     "twitter:image:alt": appInfo.imageAlt,
      //   },
      // });

      // pushing here ensures that the dotenv is loaded
      // if (process.env.ANALYZE) {
      //   config.plugins.push(
      //     new BundleAnalyzerPlugin({ analyzerMode: "server" })
      //   );
      // }

      // config.plugins.push(
      //   new FaviconsWebpackPlugin({
      //     logo: "./public/images/icon.png",
      //     publicPath: "/",
      //     favicons: {
      //       appName: appInfo.name,
      //       appShortName: appInfo.name,
      //       appDescription: appInfo.description,
      //       developerName: `${appInfo.name} Team`,
      //       developerURL: appInfo.url,
      //       theme_color: appInfo.themeColor,
      //     },
      //   })
      // );

      return config
    },
  },
  eslint: {
    enable: false,
  },
  typescript: { enableTypeChecking: false },
}
