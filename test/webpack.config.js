const path = require('path')
const AutoSprite = require('../src/index.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: 'main_[contenthash:5].js',
    path: path.join(__dirname, './dist'),
  },
  devServer: {
    allowedHosts: 'all',
    port: 3000,
    open: false,
  },
  module: {
    rules: [
      // webpack4
      // {
      //   test: /\.png$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         limit: 1024 * 10,
      //       },
      //     },
      //   ],
      // },
      // webpack5
      {
        test: /\.png$/,
        type: 'asset',
        parser:{
          dataUrlCondition:{
            maxSize: 1024 * 10
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', {
          loader: 'css-loader',
          // 下面的配置是为了解决wbepack5下使用file-loader处理图片资源时，生成了多余的图片
          options:{
            esModule: false,
            importLoaders: 1
          }
        }],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|src\/assets)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new AutoSprite({
      glob: 'assets/icons/*.png',
      cwd: path.join(__dirname, './src'),
    }),

    new HtmlWebpackPlugin({
      title: 'AutoSprite',
      template: path.resolve(__dirname, './src/index.html'),
      inject: 'body',
      showErrors: true,
    }),
  ],
}
