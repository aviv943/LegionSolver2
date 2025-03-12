const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const languages = ['GMS', 'KMS', 'JMS', 'TMS', 'CMS'];

module.exports = {
    devServer: {
        compress: true,
        static: {
            directory: path.join(__dirname, 'dist')
        },
        open: true,
        watchFiles: ['src/**/*'],
        port: 3000
    },
    entry: './src/main.js',
    output: {
        filename: 'bundle.js'
    },
    mode: 'development',
    module: {
        rules: [
            { 
                test: /\.js$/, 
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [{'plugins': ['@babel/plugin-proposal-class-properties']}]
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: false,
            languages
        }),
    ]
};
