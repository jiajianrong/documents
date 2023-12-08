const querystring = require('querystring');
const http = require('http');


let req_query = querystring.stringify({
  "uid": "10101010",
});
let req_body = querystring.stringify({
  "citycode": "101010",
});
let req_header = {
  "content-type": "application/x-www-form-urlencoded",
  'content-length': Buffer.byteLength(req_body),
};


const options = {
  hostname: 'sport-portal-fc.fc.libaba.net',
  port: 80,
  method: 'POST',
  path: '/?' + req_query,
  headers: req_header,
};


const req = http.request(options, (res) => {
  console.log(res.statusCode);
  res.setEncoding('utf8');
  res.on('data', console.log);
  res.on('end', () => {});
}).on('error', console.error);

req.write(req_body);
req.end();

