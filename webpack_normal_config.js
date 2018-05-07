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
        extensions: ['', '.js'] //������import��ʱ�򲻴���׺��webpack�������Զ��鿴�ĺ�׺�б�
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


//webpack��use���Ի���loader����loaders��loader���ַ�����loaders�����飬use��loadersһ��