/* globals require module __dirname */
var path = require('path');

module.exports = {
  entry: {
    breakout: './src/games/breakout.js',
    pacman: './src/games/pacman.js',
    pong: './src/games/pong.js',
    pong2: './src/games/pong2.js',
    snake: './src/games/snake.js',
    tetris: './src/games/tetris.js',
    dragrace: './src/games/dragrace.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
  },
};
