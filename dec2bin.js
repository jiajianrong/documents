function dec2any(dec, n) {
	var arr = [];
	while (dec > 0) {
		arr.unshift(dec%n);
		dec = Math.floor(dec/n);
	}
	console.log(arr);
	return arr.join('');
}

dec2any(100, 16);

// dec10 -> any(n)
Number(str|num).toString(n);

// any(n) -> dec10
parseInt(str|num, n);

// str|num可以为'17', 0x17, 17等


/*
1位十六进制 = 4位二进制
1字节       = 8位二进制

文本方式,每一位十六进制占一个字节.
二进制方式,每两位十六进制占一个字节.
*/