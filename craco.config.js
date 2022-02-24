const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const now = Math.floor(new Date().getTime() / 1000)

const srcDirs = fs.readdirSync(path.resolve(__dirname, "./src"), {
  withFileTypes: true,
});

const aliases = srcDirs
  .filter((dir) => dir.isDirectory())
  .reduce(
    (acc, el) => ({
      ...acc,
      [el.name]: path.resolve(__dirname, `./src/${el.name}`),
    }),
    {}
  );

module.exports = {
  webpack: {
    alias: aliases,
    configure: (config) => {
      const htmlWebpackPlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === "HtmlWebpackPlugin"
      );
      if (!htmlWebpackPlugin) {
        throw new Error("Can't find HtmlWebpackPlugin");
      }

      const fallback = config.resolve.fallback || {};
      Object.assign(fallback, {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "assert": require.resolve("assert"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "os": require.resolve("os-browserify"),
          "url": require.resolve("url"),
          "path": require.resolve("path-browserify")
      })
      config.resolve.fallback = fallback;
      config.plugins = (config.plugins || []).concat([
          new webpack.ProvidePlugin({
              process: 'process/browser',
              Buffer: ['buffer', 'Buffer']
          })
      ])

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

      // if (process.env.SENTRY_AUTH_TOKEN) {
      //   config.plugins.push(
      //     new SentryWebpackPlugin({
      //       // sentry-cli configuration
      //       authToken: process.env.SENTRY_AUTH_TOKEN,
      //       org: process.env.SENTRY_ORG,
      //       project: process.env.SENTRY_PROJECT,
      //       environment: process.env.REACT_APP_SENTRY_ENVIRONMENT ?? "unknown",
      //       release: process.env.REACT_APP_SENTRY_RELEASE ?? "unknown",

      //       // webpack specific configuration
      //       include: "./build/",
      //       ignore: ["node_modules"],
      //       setCommits: {
      //         repo: process.env.GITHUB_REPO,
      //         commit:
      //           process.env.GITHUB_SHA ??
      //           process.env.COMMIT_REF ??
      //           process.env.CF_PAGES_COMMIT_SHA,
      //       },
      //       deploy: {
      //         env: process.env.REACT_APP_SENTRY_ENVIRONMENT,
      //         started: now,
      //       },
      //     })
      //   );
    
      return config;
    },
  },
  eslint: {
    enable: false,
  },
  typescript: { enableTypeChecking: false },
}
