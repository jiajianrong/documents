//var str = "99 -( 3-1)*3+40/20"
//var str = "99 +( 3-1)*3*2+40/20"
var str = "99 + 2*( 6-1*3)+40/20"
//var str = "3-1/(3*2)"
//var str = "3-1/3*2"
//var str = "1-2*2+3"
var str = "1+(2*(1+1))"

// run
var arr = prepare(str)
console.log(nifix2postfix(arr))



function prepare(str) {
	function isNumber(c) {
		return !isNaN(+c)
	}
	function compact(arr) {
		return arr.filter(function(item){
			return item!=' '
		})
	}
	function toArray(str) {
		return str.split('')
	}
	
	function tokenize(arr) {
		var r = []
		var curr
		var last = ''
		for(var i=0;i<arr.length;i++) {
			curr = arr[i]
			if (isNumber(curr)) {
				last += curr
			} else {
				if (last==='') {
					r.push(curr)
				} else {
					r.push(last)
					r.push(curr)
					last = ''
				}
			}
		}
		if (last!=='') {
			r.push(last)
		}
		return r
	}
	
	var _arr = toArray(str)
	_arr = compact(_arr)
	_arr = tokenize(_arr)
	return _arr
}



function nifix2postfix(arr) {
	
	function isNumber(c) {
		return !isNaN(+c)
	}
	function isBraceR(c) {
		return c===')'
	}
	function isBraceL(c) {
		return c==='('
	}
	function popUntilBraceL(arr) {
		var _r = []
		var _c
		while( (_c=arr.pop()) !== '(' ) {
			_r.push(_c)
		}
		return _r
	}
	function isPriorityLowerOrEqualThanTarget(curr, target) {
		if (target!=='+' && target!=='-' && target!=='*' && target!=='/') {
			return false
		} else if (curr==='+' || curr==='-') {
			return true
		} else if ( (curr==='*' || curr==='/') && (target==='*' || target==='/') ) {
			return true
		}
		return false
	}
	function popAll(arr) {
		var _r = []
		while ( arr.length ) {
			_r.push(arr.pop())
		}
		return _r
	}
	
	
	var r = []
	var stack = []
	var curr
	//debugger
	for (var i=0;i<arr.length;i++) {
		curr = arr[i]
		if (isNumber(curr)) {
			r.push(curr)
		} else if (isBraceL(curr)) {
			stack.push(curr)
		} else if (isBraceR(curr)) {
			// 出栈到(
			r = r.concat( popUntilBraceL(stack) )
		} else {
			// curr优先级<=栈顶符号
			while( isPriorityLowerOrEqualThanTarget(curr, stack[stack.length-1]) ) {
				r.push( stack.pop() )
			}
			stack.push(curr)
		}
	}
	while(stack.length) {
		r.push(stack.pop())
	}
	
	return r

}

















