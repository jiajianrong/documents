var a = { x: {x1: 1} }
a.y = a
//-----------
var b = { y: 1 }
var c = { c1: b, c2: {c3: b, c4: 2}, c5: 3 }
//-----------
var m = { z1: 1 }
var n = { z2: m }
m.z3 = n
//-----------

var parents = []

function loop( obj ) {
    
    if (parents.indexOf(obj)>-1) {
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


loop(m)
console.log('parents:',parents)