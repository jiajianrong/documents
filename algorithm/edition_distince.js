
var a = 'abcdefxxx'
var b = 'abccde'


console.log(round(a,b,0,0))
console.log(recursion(a, b, a.length, b.length))




function round( a, b, i, j ) {

	if (i===a.length-1) {
		return b.length-1-j
	} 
	else if (j===b.length-1) {
		return a.length-1-i
	} 
	else if (a[i]===b[j]) {
		return round( a, b, i+1, j+1 )
	}
	else {
		var r1 = round( a, b, i+1, j ) + 1
		var r2 = round( a, b, i, j+1 ) + 1
		var r3 = round( a, b, i+1, j+1 ) + 1
		return Math.min(r1, r2, r3)
	}

}





function recursion(a, b, i, j) {
    if (j === 0) {
        return i;
    } else if (i === 0) {
        return j;
    } else if (a[i - 1] === b [j - 1]) {
        return recursion(a, b, i - 1, j - 1);
    } else {
        let m1 = recursion(a, b, i - 1, j) + 1;
        let m2 = recursion(a, b, i, j - 1) + 1;
        let m3 = recursion(a, b, i - 1, j - 1) + 1;
        return Math.min(m1, m2, m3);
    }
}



