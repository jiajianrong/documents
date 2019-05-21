function getUser(id) {
    console.log('getUser, id', id)
    return new Promise(function(res, rej){
        setTimeout(function(){
            res({id: 1, name: 'jiajianrong'})
        }, 1000)
    })
}


function getScores(id) {
    console.log('getScores, id', id)
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
var isAsync = false
var asyncResult

function co() {
    
    do {
        r = g.next(asyncResult)
        asyncResult = undefined
        console.log('co, r', r)
    
        // promise
        if ( r.value && r.value.then ) {
            isAsync = true
            r.value.then(function(data){
                isAsync = false
                asyncResult = data
                co()
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
D:\jiajianrong-d\document\documents\node>node generator-demo.js
co, r { value: 1, done: false }
getUser, id 1
co, r { value: Promise { <pending> }, done: false }
main, user { id: 1, name: 'jiajianrong' }
co, r { value: 2, done: false }
co, r { value: 3, done: false }
co, r { value: 4, done: false }
getScores, id 2
co, r { value: Promise { <pending> }, done: false }
main, scores { classA: 100, classB: 99, classC: 98 }
co, r { value: 5, done: false }
co, r { value: { classA: 100, classB: 99, classC: 98 }, done: true }

*/

