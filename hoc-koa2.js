
var app = new koa()
app.use(logger())
app.use(getDiscount)
app.use(getPrice)
app.listen(80)

var mockCtx = { url: 'baidu.com', params: 'a=b' }
app.accept(mockCtx)
console.log(mockCtx)




/**
 * ģ��koa2
 */
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



/**
 * �����м�� ���պ���
 */
function compose(middleware/*arr*/) {
	
	return function(ctx, next) {
	
		let index = -1
		
		return dispatch(0)
		
		function dispatch(i) {
			
			index = i
			
			var fn = middleware[i]
			
			if (!fn)
				return
			
			fn( ctx, function n(){
				return dispatch(i+1)
			} )
			
		}
	
	}

}





/**
 * ������ӡ����
 */
function logger(cfg) {

	return function(ctx, next) {
		
		console.log('logger start')
		next()
		console.log('logger end')
		
	}

}



/**
 * �����̶��ۿ�
 */
function getDiscount(ctx, next) {
	
	console.log('getDiscount')
	ctx.discount = 0.9
	next()
	
}



/**
 * Ŀ�귽�� ���body
 */
function getPrice(ctx) {

	console.log('getPrice')
	ctx.price = 100
	ctx.body = "final price is " + ( ctx.price * ctx.discount )
	
}



