## 使用webpack打包服务端代码 - part 2: 使用gulp驱动


上一篇里我们使用webpack配置了服务端项目，有一些小调整，
如对`node_modules`目录下的所有依赖不做分析和打包。
我们重用了前端项目的配置，避免维护前后端两套项目。

你已经有了webpack应用在前端项目的经验。
你可能会为服务端项目使用babel require hook。
你可能期望同在前后端适用一代码，使用多个loader。
你也可能期望使用HMR。

我已经将项目[backend-with-webpack](https://github.com/jlongster/backend-with-webpack/tree/part1-es6)
转为使用babel loader和es6 module，并且后续会保持一致。



## Gulp

Gulp是一个任务执行工具，用以自动执行任务。
即使不用来转换和打包module，Gulp依然可以作为控制中心(master controller)，
去驱动webpack以及其他工作。

我们需要将webpack的使用方式由CLI改为API，并使用gulp任务实现。
我们把先用gulp改造[配置文件](https://github.com/jlongster/backend-with-webpack/blob/part1-es6/webpack.config.js)

唯一的区别在于，config对象不上export出去，而是传递给了webpack api。

```
var gulp = require('gulp');
var webpack = require('webpack');

var config = {
  ...
};

gulp.task('build-backend', function(done) {
  webpack(config).run(function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }
    done();
  });
});
```

传递一个config对象给`webpack`函数，得到一个compiler。
可以`run`或者`watch`这个compiler。
因此如果你希望创建一个`build-watch`任务，可以在文件修改时自动重新编译，你可以使用`watch`。



## 多个webpack配置

我们创建一个基础的webpack config文件。

```
var DeepMerge = require('deep-merge');

var deepmerge = DeepMerge(function(target, source, key) {
  if(target instanceof Array) {
    return [].concat(target, source);
  }
  return source;
});

// generic

var defaultConfig = {
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] },
    ]
  }
};

if(process.env.NODE_ENV !== 'production') {
  defaultConfig.devtool = 'source-map';
  defaultConfig.debug = true;
}

function config(overrides) {
  return deepmerge(defaultConfig, overrides || {});
}
```


接下来我们增加一个针对前端项目的config：

```
var frontendConfig = config({
  entry: './static/js/main.js',
  output: {
    path: path.join(__dirname, 'static/build'),
    filename: 'frontend.js'
  }
});
```

针对服务端项目的config：

```
var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var backendConfig = config({
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  node: {
    __dirname: true,
    __filename: true
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ]
});
```


我们现在有了两个配置任务：

```
function onBuild(done) {
  return function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }

    if(done) {
      done();
    }
  }
}

gulp.task('frontend-build', function(done) {
  webpack(frontendConfig).run(onBuild(done));
});

gulp.task('backend-build', function(done) {
  webpack(backendConfig).run(onBuild(done));
});
```

也可以更疯狂一些，多建立几个：

```
gulp.task('frontend-build', function(done) {
  webpack(frontendConfig).run(onBuild(done));
});

gulp.task('frontend-watch', function() {
  webpack(frontendConfig).watch(100, onBuild());
});

gulp.task('backend-build', function(done) {
  webpack(backendConfig).run(onBuild(done));
});

gulp.task('backend-watch', function() {
  webpack(backendConfig).watch(100, onBuild());
});

gulp.task('build', ['frontend-build', 'backend-build']);
gulp.task('watch', ['frontend-watch', 'backend-watch']);
```

`watch`函数的第一个参数可以为毫秒值的延迟，
因此100ms以内的所有改动都只触发一次rebuild。



## Nodemon

nodemon是用来查看文件改变并自动重启node程序的。
但我们只关心手动重启的部分。

执行完`npm i nodemon`，并且在gulp文件头添加了`var nodemon = require('nodemon')`之后，
我们可以创建一个任务，来执行编译(打包)后的服务端文件：

```
gulp.task('run', ['backend-watch', 'frontend-watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/backend'),
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', function() {
    console.log('Restarted!');
  });
});
```

这个任务依赖`backend-watch`和`frontend-watch`任务，
因此这两个watcher将会自动被执行。

`execMap`和`scripts`配置指定了如何执行程序，
其他的配置是提供给nodemon的watcher使用的，不过我们这里并没使用nodemon的watch功能，
因此`ignore`是`*`；`watch`是一个不存在的目录；`ext`是一个不存在的文件后缀。

所以我们的node程序如何在文件更改的情况下重启呢？
在`backend-watch`任务里，我们手动调用`nodemon.restart()`：

```
gulp.task('backend-watch', function() {
  webpack(backendConfig).watch(100, function(err, stats) {
    onBuild()(err, stats);
    nodemon.restart();
  });
});
```

现在当执行`backend-watch`时，如果一个文件更改了，webpack将会重新编译，node进程也会自动重启。
所有的工作已准备完成，我们执行启动所有的工作：

```
gulp run
```


## Tips

#### 更好的性能

如果你使用了sourcemap，你会注意到compilation性能会随着文件越多越下降得厉害，
即使你使用了增量编译(watcher)。
这因为webpack必须重新生成整个sourcemap文件，即使仅有一个module文件更改了。

可以将`devtool`的值从`source-map`改为`#eval-source-map`，
这会告诉webpack为每一个module都去创建单独的source-map，
然后在运行时通过`eval`执行每个module和他的sourcemap。

增加`#`前缀告诉webpack你使用`//#`注释，而非旧的`//@`格式。

```
config.devtool = '#eval-source-map';
```


#### node变量

node有自己的特点变量，如`__dirname`。
webpack需要处理他们，因为原始的值已经丢失。

通过`node configuration entry`，需要指定`__dirname`和`__filename`为true。



译自[Backend Apps with Webpack (Part II)](https://jlongster.com/Backend-Apps-with-Webpack--Part-II)，转载请说明来自58金融