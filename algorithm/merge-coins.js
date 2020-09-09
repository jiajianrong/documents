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





/*

var results = []
var coins = [2,3,5]

for(var i=0;i<coins.length;i++) {
	process(coins[i])
}

console.log(results)






function process(n) {
	cumulate( sum(n), n )
}


function sum(n) {
	var newarr = []
	for(var i=0;i<results.length;i++) {
		newarr[i] = results[i] + n
	}
	return newarr
}


function cumulate(arr2, n) {
	// todo: uniq
	results.push(n)
	for(var i=0;i<arr2.length;i++) {
		results.push(arr2[i])
	}
}

*/