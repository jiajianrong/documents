var nodes = [];
for ( let i=0; i<20; i++ ) {
    let node = { value: 'node'+i };
    nodes.push(node);
}

nodes[0].children = [ nodes[1], nodes[2], nodes[3] ];

nodes[1].children = [ nodes[4], nodes[5], nodes[6] ];
nodes[2].children = [ nodes[7], nodes[8], nodes[9] ];
nodes[3].children = [ nodes[10], nodes[11], nodes[12] ];

nodes[7].children = [ nodes[13], nodes[14], nodes[15] ];
nodes[8].children = [ nodes[16], nodes[17], nodes[18] ];

nodes[18].children = [ nodes[19] ];


// count number
function count(node) {
    let n = node.children ? node.children.length : 0;
    for (let key in node.children) {
        n += count(node.children[key]);
    }
    return n;
}




