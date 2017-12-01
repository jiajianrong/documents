# 详解 request

本文主要讲解原生nodejs知识，不涉及`express`或`koa`框架


## Buffer

当`http.createServer`的回调方法被调用时，说明server端已经获取了全部请求头，但是有可能请求体还没接受。 `request`对象即 [http.IncomingMessage](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_incomingmessage) 实质是一个 [readable stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_readable_streams)。 输入流里，当一段数据到达时，[`data`](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_event_data) 事件回触发。 当所有数据都接受后， [`end`](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_event_end) 会触发。

	http.createServer((request, response) => {
	  console.log('Now we have a http message with headers but no data yet.');
	  request.on('data', chunk => {
	    console.log('A chunk of data has arrived: ', chunk);
	  });
	  request.on('end', () => {
	    console.log('No more data');
	  })
	}).listen(8080)


每一段数据其实都是 [`buffer`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buffer)。 如果不是处理二进制数据的话，建议使用 `request.setEncoding` 设置流字符串的编码方式。


我们一般会"求和"每一段数据，这里使用了 `Buffer.concat`，它会把所有 buffer 合并成一个。

	http.createServer((request, response) => {
	  const chunks = [];
	  request.on('data', chunk => chunks.push(chunk));
	  request.on('end', () => {
	    const data = Buffer.concat(chunks);
	    console.log('Data: ', data);
	  })
	}).listen(8080)


也可以使用 [`concat-stream`](https://github.com/maxogden/concat-stream) 

	const http = require('http');
	const concat = require('concat-stream');
	http.createServer((request, response) => {
	  concat(request, data => {
	    console.log('Data: ', data);
	  });
	}).listen(8080)



## Content-type

如果 server 在接受 无 `file` 的表单提交，或者是默认 `content-type` 的 ajax 请求，那么 `content-type` 就是 `application/x-www-form-urlencoded`，而 encoding 则是 `utf-8`。 可以使用 `querystring` 反序列化键值对。

	const http = require('http');
	const concat = require('concat-stream');
	const qs = require('querystring');
	http.createServer((request, response) => {
	  concat(request, buffer => {
	    const data = qs.parse(buffer.toString());
	    console.log('Data: ', data);
	  });
	}).listen(8080)


如果提交请求的 `content-type` 是 JSON，则可以使用 `JSON.parse` 替代 `qs.parse`。



如果是 提交文件 或者 `multipart content type`，则应该使用 [`node-formidable`](https://github.com/felixge/node-formidable) 之类的类库去移除 boundary 和 Disposition 等等。 直接处理的类库包括 `formidable`， `busboy`， `node-multiparty`。 中间件则包括 `multer`， `connect-busboy`， `connect-multiparty`。 (译者注：最好别自己解析，如果非要挑战的话可以参考 [multipart protocol spec](http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html))



## Pipe

如果并不需要解析处理文件内容，仅仅是将之转移到其他地方，比如另外一个请求，或者写到硬盘，最好用 [pipe](https://github.com/substack/stream-handbook#why-you-should-use-streams) 而不是 buffering， 前者代码量更少，消耗更少内存，速度更快，而且对于 `back pressure` 处理更好。

	http.createServer((request, response) => {
	  request.pipe(fs.createWriteStream('./request'));
	}).listen(8080)


下面有一行对于 `pipe()` 的解释，译者觉得特别好，直接上原文： `.pipe()` is just a function that takes a readable source stream `src` and hooks the output to a destination writable stream `dst`

	src.pipe(dst)



有些恶意攻击也许会提交超大文件，所以需要及时发现数据大小并应对。 如果没有使用框架的话，可以用 [stream-meter](https://github.com/brycebaril/node-stream-meter)，它会在数据超限后抛弃请求。

	limitedStream = request.pipe(meter(1e7));
	limitedStream.on('data', ...);
	limitedStream.on('end', ...);

或者

    request.pipe(meter(1e7)).pipe(createWriteStream(...));



## express/koa

最后建议还是用框架

Express: [body-parser](https://github.com/expressjs/body-parser)

Koa: [bodyParser](https://github.com/koajs/bodyparser)








*[译自](https://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js)，转载请注明来自58金融前端团队*