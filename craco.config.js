const SentryWebpackPlugin = require('@sentry/webpack-plugin')

const now = Math.floor(new Date().getTime() / 1000)

module.exports = {
  babel: {
    presets: [
      [
        "@babel/preset-react",
        { runtime: "automatic", importSource: "@emotion/react" },
      ],
    ],
  },
  webpack: {
    plugins: {
    },
  },
  eslint: {
    enable: false,
  },
  typescript: { enableTypeChecking: false },
}
