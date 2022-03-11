/*
require('http').createServer(function(req, res) {
    if (req.url === '/') {
	    res.end(`<html>
		    <h1>welcome</h1>
			<br />
			<a href="/next.html">nextpage</a>
		</html>`)
	} else if (req.url === '/next.html') {
        res.end(`<html>
		    <h1>nextpage</h1>
			<br />
			<a href="/">backtohome</a>
		</html>`)	
	} else {
		res.end('wrong, plz retry')
	}
}).listen(8888)
*/

require('net').createServer(sock=>{
	sock.on('data', data=>{
		console.log(data.toString());
		sock.write('done');
		//sock.end();
	})
}).listen(80, '127.0.0.1');
