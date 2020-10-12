// demo1
var str1 = '12345678901234567890';
var str2 =           '1234567890';
// result = 12345678902469135780

// demo2
var str1 = '6666666666666666666666';
var str2 =  '333333323333343333333';
// result = 6999999990000009999999

// demo3
var str1 = '88';
var str2 = '77';
// result = 165


// 给短的字符串左侧补0，补到和长字符串一样长
function leftpadZero(s1, s2) {
	var len1 = s1.length;
	var len2 = s2.length;
	
	if (len1 === len2) {
		return [s1, s2];
	}
	if (len1 > len2) {
		return [s1, _generateZeroStr(len1-len2) + s2];
	} else {
		return [_generateZeroStr(len2-len1) + s1, s2]
	}
	
	function _generateZeroStr(n) {
		return Array(n).fill('0').join('');
	}
}


// 将两个大数(字符串形式)相加
function sumBigNum(s1, s2) {
	
	var [ss1, ss2] = leftpadZero(s1, s2);
	
	var arr1 = ss1.split('').map(item=>+item);
	var arr2 = ss2.split('').map(item=>+item);
	
	var sum = 0;
	var offset = 0;
	
	// 最终结果
	var result = [];
	
	for (var i=arr1.length-1; i>=0; i--) {
		
		sum = arr1[i] + arr2[i] + offset;
		
		if (sum>=10) {
			offset = 1;
			result.unshift(sum-10);
		} else {
			offset = 0;
			result.unshift(sum);
		}
	}
	
	// in case最高位相加后溢出
	if (offset) {
		result.unshift(offset);
	}
	
	return result.join('');
}


console.log(sumBigNum(str1, str2));
