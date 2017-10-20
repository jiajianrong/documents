// -----------
// need uniq
// -----------
function f(n) {

	if (n==0 || n==1) {
		count++
		return;
	}
	
	if (n>=5) f(n-5);
	if (n>=2) f(n-2);
	if (n>=1) f(n-1);
}




// -----------
// hardcode
// -----------
function f(left, curr, n) {

	if (left<=0) {
		if (left==0) count++
		return
	}
	
	if (curr>=5) f(left-5, 5, n);
	if (curr>=2) f(left-2, 2, n);
	if (curr>=1) f(left-1, 1, n);
}

//var count = 0;
//f(10, 5, 10)
//console.log(count)





// -----------
// 
// -----------
function f(left, curr, n) {

	if (left<=0) {
		if (left==0) count++
		return
	}
	
	for (var i=0;i<coins.length;i++) {
		var C = coins[i]
		if (curr>=C) f(left-C, C, n);
	}
}

var count = 0;
var coins = [1,2,5].reverse()
f(5, 5, 5)
console.log(count)





// -----------
// increaze
// -----------
function sumN(sum, c, n){
    if(sum >= n){
        if(sum == n) ++cnt;
        return;
    }
    else{
        
        if(c >= 5)
            sumN(sum+5, 5, n);
		if(c >= 2)
            sumN(sum+2, 2, n);
        if(c >= 1)
            sumN(sum+1, 1, n);
    }
}

var cnt = 0;
sumN(0,5,5)
console.log(cnt)