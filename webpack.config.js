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
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
  },
};
