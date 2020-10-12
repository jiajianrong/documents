let { root } = require('./tree-demo-standard');

/*
[8,1,5,3]
[8,1,5,4]
[8,1,2,9]
[8,7,6]
*/
let stack = [];


function isLeaf(node) {
	return !node.left && !node.right;
}


function calPaths(node) {
    if (!node) return;
	
	stack.push(node);
    
	calPaths(node.left);
	calPaths(node.right);
	
	if (isLeaf(node)) {
		stack.forEach(item => console.log(item.value));
		console.log('\n')
	}
	
	stack.pop();
}


// 穷举所有路径
calPaths(root);