function dec2any(dec, n) {
	var arr = [];
	while (dec > 0) {
		arr.unshift(dec%n);
		dec = parseInt(dec/n);
	}
	console.log(arr);
	return arr.join('');
}

dec2any(100, 16)

// dec -> any(n)
Number(dec).toString(n);

// any(n) -> dec
parseInt(anyString, n);