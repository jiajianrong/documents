
function merge(arr_l, arr_r) {
	let arr_result = []
	
	let i = 0
	let j = 0
	
	while ( i<arr_l.length && j<arr_r.length ) {
		let item_l = arr_l[i]
		let item_r = arr_r[j]
		
		if (item_l<=item_r) {
			arr_result.push(item_l)
			i++
		} else {
			arr_result.push(item_r)
			j++
		}		
	}
	
	let arr_remain
	
	// arr_l has more values
	if (i<arr_l.length) {
		arr_remain = arr_l.slice(i)
	// arr_r has more values
	} else if (j<arr_r.length) {
		arr_remain = arr_r.slice(j)
	}
	
	Array.prototype.splice.call(arr_result, arr_result.length, 0, ...arr_remain)
	
	return arr_result
}



function mergeSort(arr) {
	if (arr.length<=1) {
		return arr;
	}
	
	let mid = Math.floor(arr.length/2)
	let arr_l = arr.slice(0, mid)
	let arr_r = arr.slice(mid)
	
	let arr_l_sorted = mergeSort(arr_l)
	let arr_r_sorted = mergeSort(arr_r)
	
	return merge(arr_l_sorted, arr_r_sorted)
}



console.log( mergeSort([2,8,76,6,1,99,45,5,3,7,10]) )
//console.log(merge([2,4,6,8,8,20,22],[1, 1,3,7,10,11]))















