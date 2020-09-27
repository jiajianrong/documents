recurse('abcd'.split(''))


function recurse(arr) {
	if (arr.length<=1) {
		return arr;
	}
	
	let c = arr[0]
	let arr_remain = arr.slice(1)
	
	let arr_result = recurse(arr_remain)
	
	return interact(c, arr_result)
}


function interact(c, arr) {
	let arr_t = []
	
	for (let str of arr) {
		arr_t = arr_t.concat( interact_detail(c, str) )
	}
	
	console.log(arr_t)
	return arr_t
}


function interact_detail(c, str) {
	let arr_t = []
	
	for (let i=0; i<=str.length; i++) {
		let strFirst = str.substr(0, i)
		let strLast = str.substr(i)
		arr_t.push(strFirst + c + strLast)
	}
	
	return arr_t
}

