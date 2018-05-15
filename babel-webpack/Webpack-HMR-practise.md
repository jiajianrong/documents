上一节 [深入理解Webpack HMR](https://github.com/jiajianrong/documents/blob/master/babel-webpack/Webpack-HMR.md) 介绍了 HMR 原理及流程，本节将介绍如何在项目中使用 HMR




## 步骤

两步: 配置 和 代码

1. 配置 / Project Setup

一共有3种方式将HMR配置到你的项目，下文将会在Part 1详细阐述。你需要根据自己的项目情况选择一个。

2. 代码 / HMR API

你需要一点JS代码更改才能使HMR工作。下文将会在Part 2详细阐述。




## Part 1: 项目配置

共有三种方式：


1. webpack-dev-server CLI

命令行执行 `webpack-dev-server`，无效修改 `webpack.config.js`，因此该方式是最简单的

2. webpack-dev-server API

在nodejs程序中执行 `WebpackDevServer`，需要修改 `webpack.config.js`

3. webpack-hot-middleware with express

Express server 使用中间件 [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) 实现  带有 HMR 功能的webpack dev server




## 上面三种方式该如何选择?

如果使用了grunt或gulp，则需要使用webpack-dev-server API：你可以在一个gulp/grunt任务里启动webpack-dev-server
如果以自定义node脚本的方式使用webpack，也需要使用webpack-dev-server API
如果使用express，则需要用webpack-hot-middleware，它会被集成在你的express server，无需为提供bundle.js而启动另一个server
除此之外，最简单的方式则是使用webpack-dev-server CLI，无需任何配置




## 我选中了一种方式，如何开始?

直接跳到你选中的方式，完成配置部分，然后跳到 Part 2


1. 配置 webpack-dev-server CLI

确保 webpack.config.js 正确，然后run webpack-dev-server

	webpack-dev-server --content-base=www --inline --watch --hot

> 提升：需要确保 webpack.config.js 没有配置任何 webpack-dev-server 和 HotModuleReplacementPlugin


2. 配置 WebpackDevServer API

Read this section if you've decided to use the  WebpackDevServer  API. Otherwise, scroll to the next section.

If you are starting a new project, use the server API directory of my webpack-3-ways repo. It has a README and lots of comments to explain what's going on.

If you are working with an existing project, you'll have to make 3 changes:

Change #1: 在 webpack.config.js 里添加entry points。例如 webpack/hot/dev-server 和 webpack-dev-server/client

	entry: [
	  './index.js',
	  'webpack/hot/dev-server',
	  'webpack-dev-server/client?http://localhost:8080/',
	],

Change #2: 添加 HotModuleReplacementPlugin

	plugins: [new webpack.HotModuleReplacementPlugin()];

Change #3: 使用hot:true 配置run WebpackDevServer

	const server = new WebpackDevServer(compiler, {
	    hot: true,
		...
	})


3. 配置 webpack-hot-middleware & express

忽略




## Part 2: 代码修改

你的webpack项目现在已经配置好了HMR，但是webpack还不知道什么时候应该重新加载需要热更新的代码

我们将使用**HMR JavaScript API** ，即`module.hot API` 通知webpack哪个文件该更新了




## 最简单的方式

找到你的entry point (比如 index.js 或 main.js )，然后再底部添加：

	if (module.hot) {
	  module.hot.accept();
	}

这句会告诉webpack该文件及其所有依赖可以被替换




## 副作用

如果被热更新的文件/模块会产出副作用，例如，这个文件/模块有代码会给某个dom添加子元素，你需要手动使用 `module.hot.dispose` 消除这些副作用。因为当webpack重新加载该文件/模块时，所有的副作用代码都会被重复。

例如 box-creator.js:

	var sideEffectNode = document.createElement("div");
	sideEffectNode.textContent = "Side Effect";
	document.body.appendChild(sideEffectNode);
	
	// Remove the most recently-added <div> so that when the code runs again and
	// adds a new <div>, we don't end up with duplicate divs.
	if (module.hot) {
	  module.hot.dispose(function() {
	    sideEffectNode.parentNode.removeChild(sideEffectNode);
	  });
	}

这个js文件在会添加一个dom元素。所以当webpack HMR Runtime在卸载该文件时，需要用 `module.hot.dispose` 去移除这个dom元素。






[*译自javascriptstuff*](https://www.javascriptstuff.com/webpack-hmr-tutorial/)，转载请注明来自58金融前端团队