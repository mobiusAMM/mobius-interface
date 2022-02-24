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

      config.resolve.fallback = {
        string_decoder: require.resolve("string_decoder/"),
        stream: require.resolve("stream-browserify"),
        path: false,
        fs: false,
        util: false,
      };

      config.plugins.unshift(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      config.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });

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
