var a = { x: 1 }
a.y = a
//-----------
var _b = { y: 1 }
var c = { c1: _b, c2: _b }
//-----------
var m = { z1: 1 }
var n = { z2: m }
m.z3 = n
//-----------

var parents = []

function loop( obj ) {
    
    if (parents.indexOf(obj)>-1) {
        console.log('circular')
        return;
    }
    
    parents.push(obj)
    
    
    var v;
    
    for (var k in obj) {
        v = obj[k]
        console.log(k, v)
        loop(v)
    }

}


loop(c)
console.log('parents:',parents)