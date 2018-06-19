var a = { x: {x1: 1} }
a.y = a


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


loop(a)