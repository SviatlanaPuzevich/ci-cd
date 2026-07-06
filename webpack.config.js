const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EslintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  const devMode = mode === 'development';
  const target = devMode ? 'web' : 'browserslist';
  const devtool = devMode ? 'source-map' : undefined;
  const basePath = devMode ? '' : '/ci-cd';

  return {
    mode,
    target,
    devtool,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: `${basePath}/`,
      clean: true,
      filename: '[name].[contenthash].js',
      assetModuleFilename: 'assets/[name][ext]',
    },
    devServer: {
      open: true,
      host: 'localhost',
      historyApiFallback: true,
      hot: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),

      // Duplicate of index.html: GitHub Pages serves this for any unmatched path
      // under /ci-cd/, letting the client-side router handle deep links/refreshes.
      ...(devMode
        ? []
        : [
            new HtmlWebpackPlugin({
              template: 'src/index.html',
              filename: '404.html',
            }),
          ]),

      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),

      new EslintPlugin({ extensions: ['ts', 'js'] }),

      new webpack.DefinePlugin({
        'process.env.PUBLIC_URL': JSON.stringify(basePath),
      }),

      new CopyPlugin({
        patterns: [
          { from: 'src/assets', to: 'assets' },
          { from: 'src/data/plants', to: 'assets/img/plants' },
          { from: path.resolve(__dirname, '_redirects'), to: '' },
        ],
      }),

      new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
        {
          test: /\.(ts|tsx)$/i,
          loader: 'ts-loader',
          exclude: ['/node_modules/', '/dist/'],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.woff2?$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]',
          },
        },
        {
          test: /\.(jpe?g|png|webp|gif|svg)$/i,
          use: [
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                },
                optipng: {
                  enabled: false,
                },
                pngquant: {
                  quality: [0.65, 0.9],
                  speed: 4,
                },
                gifsicle: {
                  interlaced: false,
                },
                webp: {
                  quality: 75,
                },
              },
            },
          ],
          type: 'asset/resource',
        },
        {
          test: /\.m?js$/i,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
  };
};
