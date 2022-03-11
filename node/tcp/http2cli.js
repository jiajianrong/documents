const http2 = require('http2')

// The `http2.connect` method creates a new session with example.com
const session = http2.connect('http://localhost:8000')

// If there is any error in connecting, log it to the console
session.on('error', (err) => console.error(err))



const req = session.request({ ':path': '/' })
// since we don't have any more data to send as
// part of the request, we can end it
req.end()

// This callback is fired once we receive a response
// from the server
req.on('response', (headers) => {
  // we can log each response header here
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`)
  }
})

// To fetch the response body, we set the encoding
// we want and initialize an empty data string
req.setEncoding('utf8')
let data = ''

// append response data to the data string every time
// we receive new data chunks in the response
req.on('data', (chunk) => { data += chunk })

// Once the response is finished, log the entire data
// that we received
req.on('end', () => {
  console.log(`\n${data}`)
  // In this case, we don't want to make any more
  // requests, so we can close the session
  session.close()
})