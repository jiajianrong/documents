
var app = new koa()
app.use(logger())
app.use(getDiscount)
app.use(getPrice)
app.listen(80)

var mockCtx = { url: 'baidu.com', params: 'a=b' }
app.accept(mockCtx)
console.log(mockCtx)





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





// -------------------
// 生成中间件 最终函数
// -------------------
function compose(middleware) {
	
	return function(ctx, next) {
		
		
		function recursion(i) {
			
			var fn = middleware[i]
			
			if (!fn)
				return
			
			fn(ctx, function(){
				recursion(i+1)
			})
		}
		
		return recursion(0)
	
	}

}





function logger(cfg) {

	return function(ctx, next) {
		console.log('logger start')
		next()
		console.log('logger end')
	}

}




function getDiscount(ctx, next) {
	
	console.log('getDiscount')
	ctx.discount = 0.9
	next()
	
}




function getPrice(ctx) {

	console.log('getPrice')
	ctx.price = 100
	ctx.body = "final price is " + ( ctx.price * ctx.discount )
	
}



