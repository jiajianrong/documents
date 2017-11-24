# reducer与store的本质

我觉得`reducer combine`和`action creater`把初学者都带沟里去了，搞了一大堆名词，却没有讲明白



#### define reducer

其实`store`就是执行`root reducer`所返回的对象

`root reducer`如下：(假设`store`只有 `users` 和 `products` 数据，并只监听两个事件 `user-add` 与 `product-add` )

	export default function reducer( previousState={
	    users: [],
	    products: []
	}, action ) {
	
		switch (action.type) {
	
			case 'user-add':
				return {
				    users: [ ...previousState.users, action.payload ],
				    products: previousState.products
				}
	        
	        case 'product-add':
	            return {
	                users: previousState.users,
	                products: [ ...previousState.products, action.payload ]
	            }
	        
	        default: 
	            return previousState
		}	
	
	}
    

#### define store

把上面的`reducer`传给`createAppStore`就可以了，redux在初始化的时候会执行一遍`reducer`，返回默认`store`

	let store = createAppStore(reducer);


#### dispatch action

在适当的地方(如某个Component)适当的时候(如按钮点击)，使用 `store.dispatch` 来触发`reducer` 进而更新 `store`

	addUser = () => {
        store.dispatch({ 
            type: 'user-add',
            payload: {id: Math.random(), name: 'user'}
        })
    }
    
    addProduct = () => {
        store.dispatch({ 
            type: 'product-add',
            payload: {id: Math.random(), name: 'product'}
        })
    }


#### Component update

更新后的 `store` 会使订阅相关数据的Component触发"更新"生命周期

	const mapStateToProps = (state, ownProps) => {
	    return {users: state.users}
	};
	
	export default connect(mapStateToProps)(ReduxCompA);



*转载请注明来自58金融前端团队*