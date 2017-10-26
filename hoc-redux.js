// demo1: hardcode middleware function
var f = decorate(getPrice, [getDiscount, getDiscount, logger])
console.log(f())


// demo2: customize middleware function parameters
var ff = decorate(getPrice, [discountFactory(0.9), discountFactory(0.8), logger])
console.log(ff())




function logger(f) {

	return function(){
		console.log('logger start')
		var r = f()
		console.log('logger end')
		return r
	}
	
}




function getDiscount(f) {
	
	return function(){
		console.log('getDiscount')
		return f() * 0.9
	}

}




function discountFactory(discount) {

	function getDiscount(f) {
		
		return function(){
			console.log('getDiscount')
			return f() * discount
		}

	}
	
	return getDiscount

}




function getPrice() {
	console.log('getPrice')
	return 100;
}





function decorate(target, wrappers) {
	return wrappers.reverse().concat(target).reduceRight(function(p, c){
		return c(p)
	})
}







