require('http').createServer(function(req, res) {
     res.writeHead(200, {'Content-Type': 'text/plain'})
     res.end('Hello World3')
     throw "http_request_err"
}).listen(5005, '127.0.0.1')

process.on('uncaughtException', function(e){
    console.log('uncaughtException')
    console.log(e)
})

throw "global_err"




//--------------------------------------
// diff between promise and async/await
//--------------------------------------
async function getData() {
    return Promise.reject({a:1})
}
async function getData() {
    return Promise.resolve({a:1})
}


const makeRequest1 = () => {
    try {
        getData()
            .then(result => {
                // this parse may fail
                const data = JSON.parse(result)
            })
        // uncomment this block to handle asynchronous errors
        .catch((err) => {
            console.log('err inner')
        })
    } catch (err) {
        console.log('err outer')
    }
}


const makeRequest2 = async () => {
    try {
        // this parse may fail
        const result = await getData()
        const data = JSON.parse(result)
    } catch (err) {
        console.log('err')
    }
}


process.on('unhandledRejection', function(err){
    console.log('unhandledRejection', err)
})

makeRequest1()
makeRequest2()
















