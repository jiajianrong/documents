function demical2binary(n) {
    
    let r;
    let arr = [];
    
    while (n!==0) {
        r = n%2;
        arr.push(r);
        n = Math.floor(n/2);
    }
    
    console.log(arr.reverse())

}

demical2binary(321)


/*
1位十六进制 = 4位二进制
1字节       = 8位二进制

文本方式,每一位十六进制占一个字节.
二进制方式,每两位十六进制占一个字节.
*/