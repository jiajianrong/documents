# react 事务机制

本文旨在研究react是如何实现批量更新

## 表现

#### Case 1

react 在更新自身state状态时，有时会做批量更新，有时不会。例如


	class App extends React.Component {
	  
	    constructor(props) {
	        super(props)
	        this.state = {
	            x: 1
	        }
	    }
	  
	    render() {
	        console.log('app render')
	        return(
	            <div>
	                {this.state.x}
	                <a href="javascript:;" onClick={()=>this.onClick()}>click</a>
	            </div>
	        );
	    }
	  
	    componentDidMount() {
	        this.setState({x:6})
	        console.log(this.state)
	        this.setState({x:7})
	        console.log(this.state)
	    }
	  
	    onClick() {
	        this.setState({x:4})
	        console.log(this.state)
	        this.setState({x:5})
	        console.log(this.state)
	    }
	}
	
	
	ReactDOM.render(<App />, document.getElementById('app'));


如上，在react生命周期的方法里，或者react注册的事件方法里，setState都会被自动批量更新


#### Case 2

但是使用了setTimeout或ajax后，回调函数就不会自动批量更新，如下

	componentDidMount() {
        setTimeout(()=>{
            this.setState({x:4})
            console.log(this.state)
            this.setState({x:5})
            console.log(this.state)
        }, 3000)
    }

    // or
	
	onClick() {
        ajax('get', 'url', ()=>{
            this.setState({x:4})
            console.log(this.state)
            this.setState({x:5})
            console.log(this.state)
        }, 3000)
    }


#### Case 3

父子组件之间也会存在批量更新的情况，比如父亲将自己的一个state变量x作为prop传递给孩子，并且将一个更改该state变量x的回调函数 作为prop也传递给该孩子


	class App extends React.Component {
	  
	    constructor(props) {
	        super(props)
	        this.state = {
	            x: 1
	        }
	    }
	  
	    render() {
	        console.log(`parent render, this.state.x=${this.state.x}`)
	        return ( 
	            <div>
	                x in parent: {this.state.x}
	                <br />
	                <Child x={this.state.x} clickHandler={this.clickHandler} />
	            </div>
	        );
	    }
	  
	    clickHandler = () => {
	        this.setState({
	            x: 2
	        })
	    }
	  
	}


此时孩子对于父亲传来的prop x，仅仅是简单render。孩子自己也定义了一个state变量y并render。同时定义一个click回调函数，先更新自身的state.y，然后再调用父亲传来的prop函数，进而更新父亲的state.x


	export default class Child extends React.Component {
	
	    constructor(props) {
	        super(props)
	        this.state = {
	            y: 3
	        }
	    }
	  
	    render() {
	        console.log(`child render, this.props.x=${this.props.x}, this.state.y=${this.state.y}`)
	        return (
	            <div>
	                x in child: {this.props.x}
	                <br />
	    		        y in child: {this.state.y}
	    		        <br />
	    		        <a href="javascript:;" onClick={this.clickHandler}>child_change</a>
	            </div>
	        );
	    }
	  
	    clickHandler = () => {
	        this.setState({
	            y: 4
	        })
	        this.props.clickHandler()
	    }
	  
	}


此时由于在clickHandler里是先更新的孩子的state.y，然后再更新父亲的state.x，所以按理推测应该是 孩子.render -> 父亲.render，而 父亲.render 又会触发 孩子.render

但是真实情况是 父亲.render -> 孩子.render ，over，没有重复渲染。当然这都是批量更新的功劳


#### Case 4

把case 3中最后一段代码替换成(包一层setTimeout)

    clickHandler = () => {
        setTimeout(() => {
            this.setState({
                y: 4
            })
            this.props.clickHandler()
        }, 1000)
    }

结果也变成了(有重复渲染)  孩子.render -> 父亲.render -> 孩子.render 



## 结果

可以看出，使用了批量更新的情况下，可以避免render方法的重复调用，提升渲染效率


## 原理

componentDidMount是react的生命周期，而clickHandler回调函数尽管不属于生命周期，但其实react的所有事件都是自己实现的合成事件，所以任何事件回调函数都可以视作在react生命周期里

而react批量更新正是利用了这一机制，引入了一个事务概念：在生命周期的函数里，每次setState，都会把要更新的对象 暂存在一个数组`dirtyComponents`里。等到所有父亲/孩子的所有的setState执行完毕，**同步**执行数组里的所有操作

在执行数组里所有操作时，react会保证优先从父亲节点开始render，叶子孩子最后render，进而避免重复render


## 细节

#### case1: 生命周期

	`componentDidMount`   ->
	`ReactMount._renderNewRootComponent`
	`ReactUpdates.batchedUpdates`   ->
	`batchingStrategy.batchedUpdates`   ->
		`ReactDefaultBatchingStrategy.isBatchingUpdates = true;`
		`Transaction.perform`

#### case2: 事件回调
	
	`clickHandler`   ->
	`ReactEventListener.dispatchEvent`   ->
	`ReactUpdates.batchedUpdates`   ->
	`batchingStrategy.batchedUpdates`   ->
		`ReactDefaultBatchingStrategy.isBatchingUpdates = true;`
		`Transaction.perform`


`Transaction`即是一个事务，而且和sql事务的理解不太一样，坑了我好长时间:(



#### 以 `componentDidMount` 和 `clickHandler` 为例

在`ReactMount.js`里有一段注解：

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

即`componentDidMount`作为一个函数，已经身处事务之中。react事务有如下特征：


- react事务实例在运行`perform`时，不接受别的事务请求，必须等待自身完成后再reinitialize。(即同一时刻只能run一个事务)

- 一个事务只可以处理一个topLevel方法及其所处的Component Context，如上面的`parentComp.componentDidMount`或者`childComp.clickHandler`(这里和sql的事务不同，因为react有多个`dirtyComponent`，这些`dirtyComponent`有上下级关系，所以不像sql一样，react不能简单的把所有要批量处理的方法顺序执行。而是要执行完父亲的事务以后再执行孩子)。

- 事务的`Transaction.perform`方法源码如下：
	
		/**
		 * Executes the function within a safety window. Use this for the top level
		 * methods that result in large amounts of computation/mutations that would
		 * need to be safety checked. The optional arguments helps prevent the need
		 * to bind in many cases.
		 *
		 * @param {function} method Member of scope to call.
		 * @param {Object} scope Scope to invoke from.
		 * @return {*} Return value from `method`.
		 */
		perform: function (method, scope, a, b, c, d, e, f) {
		  /* eslint-enable space-before-function-paren */
		  !!this.isInTransaction() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Transaction.perform(...): Cannot initialize a transaction when there is already an outstanding transaction.') : _prodInvariant('27') : void 0;
		  var errorThrown;
		  var ret;
		  try {
		    this._isInTransaction = true;
		    // Catching errors makes debugging more difficult, so we start with
		    // errorThrown set to true before setting it to false after calling
		    // close -- if it's still set to true in the finally block, it means
		    // one of these calls threw.
		    errorThrown = true;
		    this.initializeAll(0);
		    ret = method.call(scope, a, b, c, d, e, f);
		    errorThrown = false;
		  } finally {
		    try {
		      if (errorThrown) {
		        // If `method` throws, prefer to show that stack trace over any thrown
		        // by invoking `closeAll`.
		        try {
		          this.closeAll(0);
		        } catch (err) {}
		      } else {
		        // Since `method` didn't throw, we don't want to silence the exception
		        // here.
		        this.closeAll(0);
		      }
		    } finally {
		      this._isInTransaction = false;
		    }
		  }
		  return ret;
		},


- **事务开启**：每一个topLevel方法都会调用`ReactDefaultBatchingStrategy.batchedUpdates`，而
`ReactDefaultBatchingStrategy.batchedUpdates`会判断是否自己已经处于事务中，否的话创建一个事务。

`ReactDefaultBatchingStrategy`源码

	var transaction = new ReactDefaultBatchingStrategyTransaction();
	
	var ReactDefaultBatchingStrategy = {
	  isBatchingUpdates: false,
	
	  /**
	   * Call the provided function in a context within which calls to `setState`
	   * and friends are batched such that components aren't updated unnecessarily.
	   */
	  batchedUpdates: function (callback, a, b, c, d, e) {
	    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
	
	    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
	
	    // The code is written this way to avoid extra allocations
	    if (alreadyBatchingUpdates) {
	      return callback(a, b, c, d, e);
	    } else {
	      return transaction.perform(callback, null, a, b, c, d, e);
	    }
	  }
	};

- 每一个处于topLevel所在上下文(即`dirtyComponent`)的`setState`会调用`ReactUpdates.enqueueUpdate`,(简称enqueue)。因此如果之前已经在topLevel的生命周期，则`batchingStrategy.isBatchingUpdates`已经是true，压入`dirtyComponent`队列。否则的话新建一个批量更新并立即执行。


源码如下：
	
		/**
		 * Mark a component as needing a rerender, adding an optional callback to a
		 * list of functions which will be executed once the rerender occurs.
		 */
		function enqueueUpdate(component) {
		  ensureInjected();
		
		  // Various parts of our code (such as ReactCompositeComponent's
		  // _renderValidatedComponent) assume that calls to render aren't nested;
		  // verify that that's the case. (This is called by each top-level update
		  // function, like setState, forceUpdate, etc.; creation and
		  // destruction of top-level components is guarded in ReactMount.)
		
		  if (!batchingStrategy.isBatchingUpdates) {
		    batchingStrategy.batchedUpdates(enqueueUpdate, component);
		    return;
		  }
		
		  dirtyComponents.push(component);
		  if (component._updateBatchNumber == null) {
		    component._updateBatchNumber = updateBatchNumber + 1;
		  }
		}


- 一个`ReactDefaultBatchingStrateryTransaction`事务可能处理多个`setState`方法(好似一个sql事务中处理多个sql语句)。即在每一个在事务(如 `parentComp.xHandler`及`childComp.yHandler`，以及`componentDidMount`)中的`comp.setState`)。


- 每个`ReactDefaultBatchingStrateryTransaction`事务开始(`Transaction.perform`)时，都会自动添加两个wrapper：`NESTED_UPDATES`和`UPDATE_QUEUEING`。每个wrapper包含一个`initialize`和一个`close`，具体解释可以在`Transaction`中找到

		 *                       wrappers (injected at creation time)
		 *                                      +        +
		 *                                      |        |
		 *                    +-----------------|--------|--------------+
		 *                    |                 v        |              |
		 *                    |      +---------------+   |              |
		 *                    |   +--|    wrapper1   |---|----+         |
		 *                    |   |  +---------------+   v    |         |
		 *                    |   |          +-------------+  |         |
		 *                    |   |     +----|   wrapper2  |--------+   |
		 *                    |   |     |    +-------------+  |     |   |
		 *                    |   |     |                     |     |   |
		 *                    |   v     v                     v     v   | wrapper
		 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
		 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
		 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
		 *                    | |   | |   |   |         |   |   | |   | |
		 *                    | |   | |   |   |         |   |   | |   | |
		 *                    | |   | |   |   |         |   |   | |   | |
		 *                    | +---+ +---+   +---------+   +---+ +---+ |
		 *                    |  initialize                    close    |
		 *                    +-----------------------------------------+


- 除了`ReactDefaultBatchingStrateryTransaction`，还有额外两种事务：`ReactUpdatesFlushTransaction`和`ReactReconcileTransaction`。调用顺序为：



1, `ReactDefaultBatchingStrategy`调用`ReactDefaultBatchingStrategyTransaction`，开启topLevel事务。如下：

	var ReactDefaultBatchingStrategy = {
	  isBatchingUpdates: false,
	
	  /**
	   * Call the provided function in a context within which calls to `setState`
	   * and friends are batched such that components aren't updated unnecessarily.
	   */
	  batchedUpdates: function (callback, a, b, c, d, e) {
	    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
	
	    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
	
	    // The code is written this way to avoid extra allocations
	    if (alreadyBatchingUpdates) {
	      return callback(a, b, c, d, e);
	    } else {
	      return transaction.perform(callback, null, a, b, c, d, e);
	    }
	  }
	};


2, `ReactDefaultBatchingStrategyTransaction`的`close`方法调用`ReactUpdates.flushBatchedUpdates`，即topLevel事务结束时批量更新缓存。如下：

	var FLUSH_BATCHED_UPDATES = {
	  initialize: emptyFunction,
	  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
	};


3，`ReactUpdates.flushBatchedUpdates`调用`ReactUpdatesFlushTransaction`，后者清空`dirtyComponents`，并刷新enqueued的批量更新


	var flushBatchedUpdates = function () {
	  // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
	  // array and perform any updates enqueued by mount-ready handlers (i.e.,
	  // componentDidUpdate) but we need to check here too in order to catch
	  // updates enqueued by setState callbacks and asap calls.
	  while (dirtyComponents.length || asapEnqueued) {
	    if (dirtyComponents.length) {
	      var transaction = ReactUpdatesFlushTransaction.getPooled();
	      transaction.perform(runBatchedUpdates, null, transaction);
	      ReactUpdatesFlushTransaction.release(transaction);
	    }
	
	    if (asapEnqueued) {
	      asapEnqueued = false;
	      var queue = asapCallbackQueue;
	      asapCallbackQueue = CallbackQueue.getPooled();
	      queue.notifyAll();
	      CallbackQueue.release(queue);
	    }
	  }
	};


4，那么`ReactUpdatesFlushTransaction`是如果工作的呢？它调用了`ReactUpdates`里的一个叫`runBatchedUpdates`的方法。这个方法接管了一切关于批量更新的算法。包括：

	4.1， 给`dirtyComponents`排序，父亲组件先于孩子组件被处理
	4.2， 延迟`setState`的回调函数，直到`render`结束后再执行
	4.3， 为每个`dirtyComponent`调用`ReactReconciler`和`ReactReconcileTransaction`重新更新所有孩子
	4.4， 最后执行`setState`的回调函数


5，`ReactReconcileTransaction`处理更新dom相关的细节，如suppress events，restore selection range等。(一个`ReactReconcileTransaction`只处理一个`Component`)。这块内容非常多，后续单讲。



## 结论

`setState`是“异步”的(事实上是同步的，只不过是延迟执行了，并非真正意义上的`process.nextTick`之类的异步，而Vue正是使用了这种真正异步的方式)



*原创，转载请注明来自58金融前端团队*