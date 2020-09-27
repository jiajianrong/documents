var arr = [ [1,2,3], 4, 5, [6, [7, 8, [9, 10], [11]], 12]]

//递归
var result = []
function flat(arr) {
	for (let i=0; i<arr.length; i++) {
		let item = arr[i]
		if (Array.isArray(item)) {
			flat(item)
		} else {
			result.push(item)
		}
	}
}
flat(arr)
console.log(result)


//非递归
var i = 0
while (i<arr.length) {
	let item = arr[i]
	if (Array.isArray(item)) {
		Array.prototype.splice.call(arr, i, 1, ...item)
		i--
	}
	i++
}
console.log(arr)




//非递归2
var arr = [ [1,2,3], 4, 5, [6, [7, 8, [9, 10], [11]], 12]]
while (arr.length) {
	let item = arr.shift()
	if (Array.isArray(item)) {
		for (let i=item.length-1; i>=0; i--) {
			arr.unshift(item[i])
		}
		continue
	}
	console.log(item)
}
