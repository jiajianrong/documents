var source = 'abcdeabcabcabcccabcde'.split(''); ////
var target = 'abcab'.split('')

var offset = computeOffset(target)
console.log('offset: ' + offset)



var cursor = 0

compare(source, target)



function compare(source, target) {

	for ( var i=cursor; i<source.length-target.length; i++ ) {
	
		for (var j=0; j<=target.length; j++) {
		
			if (j==target.length) {
				console.log('has')
				return true
			}
			
			if (source[i+j] == target[j]) {
				continue;
			} else {
				cursor = cursor + offset;
				break;
			}
		
		}
	
	}

}












function computeOffset(arr) {
	
	//abab
	if (arr.length%2==0) {
		for (var x=0; x<=arr.length/2; x++) {
			if (x==arr.length/2) {
				return 0
			}
			
			if (arr[x]==arr[arr.length/2+x]) {
				continue
			} else {
				break
			}
		}
	}

	var pre = getPre(arr)
	var suf = getSuf(arr)
	console.log(pre,suf)
	var offset = matchMax(pre, suf)
	return offset
	
	
	
	function matchMax(arr1, arr2) {
		for(var i=arr1.length-1;i>-1;i--) {
			if (arr1[i]==arr2[i]) {
				return i+1
			}
		}
		return arr1.length;
	}
	
	
	
	function getPre(arr) {
	
		var r = []
		
		for(var i=0;i<arr.length-1;i++) {
			
			var previous = r[i-1] || '';
			
			r.push(previous+arr[i])
		}
		
		return r
	
	}
	
	
	
	function getSuf(arr) {
	
		var r = []
		
		for(var i=0;i<arr.length-1;i++) {
			
			var previous = r[i-1] || '';
			
			r.push(arr[arr.length-1-i]+previous)
		}
		
		return r
	
	}
	
	

}


