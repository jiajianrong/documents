const fs = require('fs')
const http = require('http')
const stream = require('stream')

const pass = stream.PassThrough()

const out = fs.createWriteStream('./x.pdf')

const req = http.request({
    hostname: 'wiki.69corp.com',
    port: 80,
    path: '/images/4/4f/Yun%E5%B9%B3%E5%8F%B0%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C.pdf',
}, res => {
    res.pipe(pass).pipe(out)
    /*
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
    */
})

//out.write('123')

req.end()