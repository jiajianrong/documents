var coins = [1,3,5]
var target = 11

console.log(compute(coins, target))

// ----------------
// dp[i][sum] = ∑dp[i-1][sum-k*Vm]
// when k=0,1,2,3 ... sum/Vm
// ----------------


function compute(arr, sum) {

	var len = arr.length
	
	
	var dp = []
	
	// init
	for (var i=0; i<=len; i++) {
		dp[i] = []
		
		for (var j=0; j<=sum; j++) {
			dp[i][j] = 0
		}
		
		dp[i][0] = 1
	}
	
	
	
	for (var i=1; i<=len; i++) {
	
		for (var j=1;j<=sum;j++) {
		
			for (var k=0; k<=j/arr[i-1]; k++) {
			
				dp[i][j] += dp[i-1][j-k*arr[i-1]]
			
			}
		
		}
	
	}
	
	return dp[len][sum]

}