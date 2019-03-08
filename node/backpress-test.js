const fs = require('fs');

const writable = fs.createWriteStream('./backpress-test.txt', {
    //highWaterMark: 16384 * 1024, // 16M
    highWaterMark: 16, // 16bit
})

let data = '在Node中，使用Buffer可以读取超过V8内存限制的大文件。原因是Buffer对象不同于其他对象，它不经过V8的内存分配机制。这在于Node并不同于浏览器的应用场景。在浏览器中，JavaScript直接处理字符串即可满足绝大多数的业务需求，而Node则需要处理网络流和文件I/O流，操作字符串远远不能满足传输的性能需求。';
let data_const = data;

for(var i=0;i<100;i++){
    data = data + data_const;
}


const timestamp = process.hrtime();


for(var i=0;i<20000;i++){
    writable.write(data)
}
writable.end('\nend');


const diff = process.hrtime(timestamp);


const NS_PER_SEC = 1e9; //1 s = 1 * 1e9 ns
console.log((diff[0] * NS_PER_SEC + diff[1]) / NS_PER_SEC + 's');
