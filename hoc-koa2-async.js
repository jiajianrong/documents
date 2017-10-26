var app = new koa()
app.use(logger())
app.use(getDiscount)
app.use(getPrice2)
app.listen(80)

var mockCtx = { url: 'baidu.com', params: 'a=b' }
app.accept(mockCtx)




function koa() {

	this.middleware = []
	
	this.use = function(fn) {
		this.middleware.push(fn)
	}
	
	this.listen = function(port) {
		this.callback = compose(this.middleware)
	}
	
	this.accept = function(ctx) {
		this.callback(ctx)
	}

}




function compose(middleware) {
	
	return function(ctx, next) {
		
		return dispatch(0)
		
		function dispatch(i) {
			
			var fn = middleware[i]
			
			if (!fn)
				return Promise.resolve()
			
			try {
				return Promise.resolve( fn(ctx, function n(){
					return dispatch(i+1)
				}) )
			} catch(err) {
				return Promise.reject(err)
			}
		}
	
	}

}






function logger(cfg) {

	return async function(ctx, next) {
		
		console.log('logger start')
		await next()
		console.log('logger end')
		
	}

}




async function getDiscount(ctx, next) {
	
	console.log('getDiscount')
	ctx.discount = 0.9
	await next()
	
}




async function getPrice2(ctx) {
	
	var price = await fetchPriceRemote()
	ctx.body = price * ctx.discount
	console.log(ctx)
	
}




function fetchPriceRemote() {
	
	return new Promise(function(resolve, reject) {
		setTimeout( function(){
			resolve(100)
		}, 2000 )
	})
	
}



