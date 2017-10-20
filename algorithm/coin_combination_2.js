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

