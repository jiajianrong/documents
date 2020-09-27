// 未排序正整数 累加和小于等于给定值 的最长子数组长度
let arr = [1,2,1,1,1,2,2,1];
let target = 4;

let left = 0;
let right = 0;
let sum = arr[0];
let len = 0; // 符合条件的最长子数组的长度


while(right<arr.length) {
	
	if (sum<target) {
		right++;
		if (right===arr.length) {
			break;
		}
		sum += arr[right];
	
	} else {
		len = Math.max(len, getCurrLen());
		sum -= arr[left];
		left++;
	}
}


function getCurrLen() {
	return sum===target ? right-left+1 : right-left+1-1;
}

console.log(len);