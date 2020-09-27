var coins = [1, 2, 3, 5]
var results = split_arr(coins)
console.log(results)


function split_arr(arr) {
	
	if (arr.length===1) {
		return arr;
	}
	
	let curr = arr[0]
	let arr_remain = arr.slice(1)
	
	let arr_result = split_arr(arr_remain)
	
	return compose(curr, arr_result)
}


function compose(n, arr) {
	
	let len = arr.length
	
	for (let i=0;i<len;i++) {
		arr.push(arr[i]+n)
	}
	
	arr.unshift(n)
	
	return arr
}