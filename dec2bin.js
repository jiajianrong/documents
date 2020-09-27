// 十进制转为n进制，返回数组
function dec2any(dec, n) {
	var arr = [];
	while (dec > 0) {
		arr.unshift(dec%n);
		dec = Math.floor(dec/n);
	}
	return arr;
}
console.log(dec2any(31, 16));


// dec10 -> any
// str|num可以为'17', 0x17, 17等
Number(str|num).toString(n);

Number(11).toString(16) //"b"
Number(11).toString(2)  //"1011"
Number(0x11).toString() //"17"

// any -> dec10
// str|num可以为'17', 0x17, 17等
parseInt(str|num, n);

parseInt(101, 2)   //5  ==> 2进位制数101，转为10进制
parseInt('14', 16) //20 ==> 以字符串14代表的16进位制的数，转为10进制
parseInt(0x17, 10) //23 ==> 16进位制数0x17，转为10进制

/*
1位十六进制 = 4位二进制
1字节       = 8位二进制
文本方式,每一位十六进制占一个字节.
二进制方式,每两位十六进制占一个字节.
*/