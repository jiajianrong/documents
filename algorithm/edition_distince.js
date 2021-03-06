var a = 'abcdefxxx'
var b = 'abccde'


console.log(round(a,b,0,0))
console.log(recursion(a, b, a.length, b.length))
console.log(dynamic(a,b))




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



function calculateLevDistance(src, tgt) {
	if (!tgt.length)
		return src.length;
	if (!src.length)
		return tgt.length;
	
	return Math.min(
		calculateLevDistance(src.slice(1), tgt) + 1,
		calculateLevDistance(tgt.slice(1), src) + 1,
		calculateLevDistance(src.slice(1), tgt.slice(1)) + (src[0] == tgt[0] ? 0 : 1)
	);
}






// --------
// 动态规划
// --------
function dynamic(a, b) {

	var lenA = a.length
	var lenB = b.length
	
	var d = []
	
	for (var i=0;i<=lenA;i++) {
		d[i] = []
		d[i][0] = i
	}
	
	for (var j=0;j<=lenB;j++) {
		d[0][j] = j
	}
	
	
	for (var i=1;i<=lenA;i++) {
		
		for (var j=1;j<=lenB;j++) {
			
			if (a[i-1] === b[j-1]) {
				d[i][j] = d[i-1][j-1]
			
			} else {
				d[i][j] = Math.min(d[i-1][j-1], d[i-1][j], d[i][j-1]) + 1
			}
			
		}
	
	}
	
	
	return d[lenA][lenB]

}



