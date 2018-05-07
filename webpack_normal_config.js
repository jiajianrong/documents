//webpack.config.js
const path = require('path');
const htmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output:{
        path: path.resolve(__dirname,'./dist'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: ['', '.js'] //这里是import的时候不带后缀，webpack帮我们自动查看的后缀列表
    },
    plugins:[
        new htmlPlugin({
            template : './index.html',
            filename: 'index.html'
        })
    ],
    module:{
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query:{presets:['latest']},
                exclude: path.resolve(__dirname,'./node_modules')
            },{
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },{
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },{
                test: /\.html$/,
                loader: 'html-loader',
            },{
                test: /\.(jpg|png|gif|svg)$/i,
                use: ['url-loader?limit=500&name=images/[name]-[hash:5].[ext]','image-webpack-loader'],
            }
        ]
    }
}


//webpack的use可以换成loader或者loaders，loader传字符串，loaders传数组，use和loaders一样