let i=0
console.log(i)
setInterval(()=>{console.log(++i)}, 1000)



function debounce(f, delay) {
	var timer
	
	return function() {
		let context = this
		let args = arguments
		
		clearTimeout(timer)
		timer = null
		
		timer = setTimeout( ()=>{
			clearTimeout(timer)
			timer = null
			f.apply(context, args)
		}, delay )
	}
}

/*
f = (name) => console.log('f called, ' + name)
ff = debounce(f, 2000)

ff('11111')
setTimeout(ff, 1000, '22222')
setTimeout(ff, 2000, '33333')
setTimeout(ff, 3000, '44444')
setTimeout(ff, 4000, '55555')
setTimeout(ff, 5000, '66666')
*/



function throttle(f, interval) {
	var timer
	
	return function() {
		let context = this
		let args = arguments
		
		if (timer) return;
		
		timer = setTimeout( ()=>{
			clearTimeout(timer)
			timer = null
			f.apply(context, args)
		}, interval )

	}
}


//*
f = (name) => console.log('f called, ' + name)
ff = throttle(f, 2000)

ff('11111')
setTimeout(ff, 1000, '22222')
setTimeout(ff, 2000, '33333')
setTimeout(ff, 3000, '44444')
setTimeout(ff, 4000, '55555')
setTimeout(ff, 5000, '66666')
setTimeout(ff, 6000, '77777')
setTimeout(ff, 7000, '88888')
//*/
