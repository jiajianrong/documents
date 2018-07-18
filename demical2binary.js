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
1位十六进制为4位二进制, 1字节为8位二进制

文本方式,每一位十六进制占一个字节.
二进制方式,每两位十六进制占一个字节.


对于任意一个数, 如果存文本, "16进制的文本"需要8 bytes保存; 
而如果是2进制, 每个数字都是固定的4bytes保存.
如果数据是毫无规律的, 理论上2进制比文本节约50%.
*/