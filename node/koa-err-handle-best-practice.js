const http = require('http');
const Koa = require('koa');
const app = new Koa();

/*
process.on('uncaughtException', (err) => {
    console.log(err.message, 'caught_by_uncaughtException');
    throw err;
});

process.on('unhandledRejection', function (err, p) {
    console.log(err.message, 'caught_by_unhandledRejection');
});
*/


/*
function a() {
    return new Promise((res, rej)=>{
        setTimeout(()=>{rej('xyz')}, 1000)
    }) 
}

function b(name) {
    return name + sss + ' is good';
}

a()
.then(b)
.then(x=>console.log('before catch'))
.catch(e=>{console.log(e.message||e);})
.then(x=>console.log('after catch'))
*/


/*
http
.createServer(function(req, res) {
    var a=b+c;
    res.end('123');
})

.on('error', function(err){
    console.log('err caught', err.message)
})

.listen(9999)
*/


/*

app.on('error', function(err, ctx){
    console.log('app_on_err', err.message, '\n');
    console.log(ctx.res);
});

app.use(async function(ctx, next) {
    console.log('first')
    console.log(ctx.status)
    
    try {
        await next()
    }
    catch (e) {
        console.log(e.message)
        console.log(ctx.status)
        ctx.body = e.message
    }
    
    await next();
    console.log('third')
});
*/
app.use(async function(ctx, next) {
    throw new Error('input must exist')
    console.log('second')
    ctx.body = 'second'
});

app.listen(9999);




