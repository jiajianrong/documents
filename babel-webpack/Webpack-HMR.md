## 什么是HMR?

Hot Module Replacement(热更新) 是一个能够无需浏览器刷新而更新JavaScript的 Webpack功能。 热更新里的 `module` 指每一个JavaScript源码文件。 

Webpack在你的bundle文件中加入了HMR Runtime，它运行在浏览器端并完成module更新。

除了HMR Runtime，HMR还有一个HMR server，每当更新发生时，它会使用json数据通知HMR Runtime


![](https://raw.githubusercontent.com/jiajianrong/MarkdownPhotos/master/webpack-hmr/webpack-hmr-process.png)



## 术语

对照上图：

- Webpack Compiler: Webpack编译器，讲js转换为 `bundle.js`
- HMR Server: 给HMR Runtime提供热更新module
- Bundle Server: 给浏览器提供 `bundle.js`
- bundle.js: 这个文件一般会在浏览器上以 `<script>` 标签加载，它会被 `bunder server` 以类似 `http://localhost:8080/bundle.js` 的形式提供
- HMR Runtime: 注入在 `bundle.js` 中的代码，与HMR server交互并将热更新module更新



## 启动时流程

当第一次run HMR server时，（使用 webpack-dev-server 或 webpack-hot-middleware），bundle文件会被创建。 不管是否使用了HMR，如下流程都会被执行：

- A. Webpack Compiler编译你的JS代码
- B. Bundle Server为浏览器提供 `bundle.js`



## 更新时流程

在IDE中修改了代码将会触发下列事件，进而将更新后的module推送给浏览器

- 修改源码文件
- node fs识别修改内容，给到webpack
- Webpack Compiler 重新编译一个或多个module，然后通知HMR Server有更新
- HMR Server 使用 websockets 通知 HMR Runtime 需要更新. HMR Runtime 通过 HTTP 请求这些更新
- HMR Runtime 对更新里的module做替换操作，或者刷新页面



## HMR Runtime 副作用

The HMR Runtime 是所有的关键，它把旧代码替换为新代码

记住：HMR Runtime 不能够自动撤回你的代码中的”副作用“，所以如果需要的换你必须手动调用 **module.hot.dispose()**



## 如何使用 HMR

请见下一节： [Webpack-HMR-practise](https://github.com/jiajianrong/documents/blob/master/babel-webpack/Webpack-HMR-practise.md)








[*译自javascriptstuff*](https://www.javascriptstuff.com/understanding-hmr/)，转载请注明来自58金融前端团队