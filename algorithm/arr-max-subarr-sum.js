let arr = [1,-2,1,1,1,-2,2,1,-4,2];

let curr = 0;
let sum = 0;
let result = 0;

while(curr<arr.length) {
	
	sum += arr[curr];
	
	if (sum>0) {
		result = Math.max(result, sum);
	} else {
		sum = 0;
	}
	
	curr++;
}


console.log(result);