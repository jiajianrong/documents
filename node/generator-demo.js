function getUser(id) {
    console.log('userid', id)
    return new Promise(function(res, rej){
        setTimeout(function(){
            res({id: 1, name: 'jiajianrong'})
        }, 1000)
    })
}


function getScores(id) {
    console.log('userid', id)
    return new Promise(function(res, rej){
        setTimeout(function(){
            res({classA: 100, classB: 99, classC: 98})
        }, 1000)
    })
}



//-----------
// frame
//-----------
var r
var v
var isAsync = false

function co(asyncResult) {
    
    do {
        r = g.next(asyncResult)
        v = r.value
        console.log('co, v', v)
    
        // promise
        if ( v && v.then ) {
            isAsync = true
            v.then(function(data){
                isAsync = false
                co(data)
            })
        }
    }
    while( !r.done && !isAsync )

}
//-----------
// frame
//-----------



function* main() {
    yield 1
    let user = yield getUser(1)
    console.log('main, user', user)
    yield 2
    yield 3
    yield 4
    let scores = yield getScores(2)
    console.log('main, scores', scores)
    yield 5
    return scores
}
/*
function* main() {
    yield 1
    yield 2
    yield 3
}
*/
var g = main()

co()

/*
C:\Users\jiajianrong\Desktop>node generator.js
co, v 1
userid 1
co, v Promise { <pending> }
main, user { id: 1, name: 'jiajianrong' }
co, v 2
co, v 3
co, v 4
userid 2
co, v Promise { <pending> }
main, scores { classA: 100, classB: 99, classC: 98 }
co, v 5
co, v { classA: 100, classB: 99, classC: 98 }
*/

