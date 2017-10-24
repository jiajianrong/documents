# react diff children - 算法和优化

我对这块源码的研究起因于一个报错。

在`Component.render`函数中`{ this.state.fake && (<B/><B/>) }`返回`Adjacent JSX elements must be wrapped in an enclosing tag `

当时觉得很奇怪，又不是定义组件，为什么会有这个规定？



于是把代码改造为

    constructor(props) {
        super(props)
        this.state = {fake:false}
    }
    
    componentDidMount() {
        setTimeout(()=>{
            this.setState({fake: !this.state.fake})
        }, 3000)
    }
    
    render() {
        return (
            <div className="Main">
                <B/>
                { this.state.fake && (<B/>) }
                <B/>
            </div>
        );
    }
    


然后debug 3秒后的 `react-dom/lib/ReactChildReconciler`中`updateChildren`方法，发现`prevChildren`的下标竟然神奇的为".0"和".2"。(为`是否表达式`空出.1)

![](https://raw.githubusercontent.com/jiajianrong/MarkdownPhotos/master/react-learn/ReactChildReconciler.updateChildren.png)

当然`nextChildren`是意料中的".0"和".1"和".2"


#### 结论

diff array的最标准方式是一个叫[Edit distance 最小编辑距离](http://www.dreamxu.com/books/dsa/dp/edit-distance.html)的算法O(nlogn)，react将其做了最大简化。

**通过为每一组children设置和缓存一组下标，然后遍历nextChildren，
react成功的把普通O(n^2)的数组(两个数组遍历)diff算法简化成了O(nlogn)(遍历一个数组+hash另一个)**


#### 分析

react没有做太复杂判断，仅给一个`占位表达式`分配一个下标，
所以如果一次返回两个或多个ReactElement，`nextChildren`后面的序号就无法和`prevChildren`匹配了。

因此react强制表达式必须返回唯一一个top节点


`react-dom/lib/ReactChildReconciler.js`源码如下


    var name;
    var prevChild;
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      prevChild = prevChildren && prevChildren[name];
      var prevElement = prevChild && prevChild._currentElement;
      var nextElement = nextChildren[name];
      if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
        ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
        nextChildren[name] = prevChild;
      } else {
        if (prevChild) {
          removedNodes[name] = ReactReconciler.getHostNode(prevChild);
          ReactReconciler.unmountComponent(prevChild, false);
        }
        // The child must be instantiated before it's mounted.
        var nextChildInstance = instantiateReactComponent(nextElement, true);
        nextChildren[name] = nextChildInstance;
        // Creating mount image now ensures refs are resolved in right order
        // (see https://github.com/facebook/react/pull/7101 for explanation).
        var nextChildMountImage = ReactReconciler.mountComponent(nextChildInstance, transaction, hostParent, hostContainerInfo, context, selfDebugID);
        mountImages.push(nextChildMountImage);
      }
    }
    // Unmount children that are no longer present.
    for (name in prevChildren) {
      if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
        prevChild = prevChildren[name];
        removedNodes[name] = ReactReconciler.getHostNode(prevChild);
        ReactReconciler.unmountComponent(prevChild, false);
      }
    }



其中`shouldUpdateReactComponent(prevElement, nextElement)`方法用来判断是否仅做更新操作即可。该方法的最后一个判断语句是：

	return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;


#### 结论


	{ this.state.fake ? (<div><B/><C/></div>) : (<div><C/><B/></div>) }

上面写法，最好能为B和C加上key，进而重用dom，避免反复创建，如：

	{ this.state.fake ? (<div><B key=".0"/><C key=".1"/></div>) : (<div><C key=".1"/><B key=".0"/></div>) }



*参考:[react-indepth](https://developmentarc.gitbooks.io/react-indepth/content/patterns/rendering_different_content.html)，转载请注明来自58金融前端团队*