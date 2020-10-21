## 使用webpack打包服务端代码 - part 1


webpack自定位为模块打包工具(module bundler)，提供了build、transform以及热更新模块的基建能力。

其他所有打包工具都把module作为代码段(code chunk)的集合对待。
但webpack为module提供了强大的处理能力。
如react的[热更新](http://gaearon.github.io/react-hot-loader/)

浏览器一般不能处理JavaScript的module，所以我们需要把module打包成一个或几个文件。
因此webpack之类的工具经常会被当做前端项目的编译工具。

但webpack也可以处理服务端项目，如nodejs。nodejs有自己的module定义，但缺乏基于module开发的基建能力。
gulp设计之初也并非以module为中心，所以也只能使用任务去转换文件。

让我们一起使用webpack来处理node项目吧。
如果你对webpack不熟，你仅需要配置webpack.config.js然后执行webpack命令即可。

webpack接收一个entry point，读取所有依赖树，打包成一个文件(仅考虑最简单的配置)。
我们在服务端项目中也这样做，我们写一个简单的配置，entry point为`src/main.js`，生成文件为`build/backend.js`。

```
var path = require('path');

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  }
}
```

配置`target: 'node'`告诉webpack打包时不要碰及node的原生module，如`fs`和`path`。

不过服务的的webpack并不需要处理和打包`node_modules`目录下module。
我们可以使用webpack的`externals`配置，其列出的module不会被打包。

但不幸的是`externals`的默认处理浏览器端环境，因此`require('foo')`会变成全局变量`foo`。
我们需要保留`require`关键字。可以创建一个json对象，key/value都是module名字，
然后把每个value都加上字符串`commonjs `前缀。
具体说明可以在webpack官网关于[`externals`](https://webpack.js.org/configuration/externals/)一节查看。
现在完整的配置变成了：

```
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  externals: nodeModules
}
```

再次运行webpack命令，查看生成的`build/backend.js`文件，
你会发现`node_modules`目录下的依赖都没有被打包：

```
/* 4 */
/***/ function(module, exports, __webpack_require__) {

    module.exports = require("express");

/***/ }
```

棒！现在你可以使用和处理前端代码一样的loader和transformer，来处理服务端代码了。
可以加上watch来监听并重新编译文件：

```
webpack --watch
```


## Sourcemaps

webpack对Sourcemaps的支持非常好，在config文件里加一个`devtool: 'sourcemap'`配置即可。
在服务端项目中，你可能还需要使用[source-map-support](https://www.npmjs.com/package/source-map-support)，
自动为node代码映射运行时的错误堆栈信息到源文件。
(babel-register已经默认引入了source-map-support)

我们需要在编译后文件的内容的最上面安装source-map-support。
即将如下代码添加到`build/backend.js`文件内容的最上方。

```
require('source-map-support').install();
```

我们可以使用`BannerPlugin`达到目的。

```
plugins: [
  new webpack.BannerPlugin(
    'require("source-map-support").install();',
    { raw: true, entryOnly: false }
  )
],
```

其中
`raw: true`告诉webpack添加文本到代码最上方；
`entryOnly: false`规定添加文本到所有生成的文件，因为你可能使用code splitting。


让我们来试一下，在[main.js第9行](https://github.com/jlongster/backend-with-webpack/blob/part1/src/main.js#L9)
增加一个不存在的foo()方法，然后执行webpack打包，然后执行`node build/backend.js`。
得到如下error：文件名和行号都是正确的！

```
...snip.../backend-with-webpack/build/webpack:/src/main.js:9
foo();
^
ReferenceError: foo is not defined
    at Object.<anonymous> (...snip.../webpack:/src/main.js:9:1)
```


## CSS

如果你 即在服务端又在浏览器端 执行代码，一般来说在后者处理和打包CSS文件。
服务端打包时应该直接忽略CSS文件的依赖。可以使用`IgnorePlugin`忽略掉所有的css和less文件。

```
new webpack.IgnorePlugin(/\.(css|less)$/)
```

事实上，上面配置仅适用在你仅使用code splitting去收集css，如在componentDidMount方法里。
`IgnorePlugin`仅是简单地避免生成这些额外的chunk，
而你如果在服务器端想要避免top-level的require，就无能为力了。
(你会得到一个`module not found`的运行时报错)

需要使用[Dustan Kasten](https://twitter.com/iamdustan/status/577561601353465856)的
`new NormalModuleReplacementPlugin(/\.css$/, 'node-noop')`


## 其他

最后，你可以配置webpack处理像`process`，`__dirname`，`__filename`的变量。
我们的配置文件最终看起来：

```
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ],
  devtool: 'sourcemap'
}
```




译自[Backend Apps with Webpack (Part I)](https://jlongster.com/Backend-Apps-with-Webpack--Part-I)，转载请说明来自58金融
