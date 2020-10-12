let { root } = require('./tree-demo-standard');

// 计算最大和
function maxSum(node) {
    if (!node) return 0;
    
	var l = maxSum(node.left);
	var r = maxSum(node.right);
	
    return node.value + Math.max(l, r);
}

// 计算最大深度
function maxDepth(node) {
	if (!node) return 0;
	
	var l = maxDepth(node.left);
	var r = maxDepth(node.right);
	
	return 1 + Math.max(l, r);
}

console.log('max sum: ', maxSum(root));
console.log('max depth: ', maxDepth(root));