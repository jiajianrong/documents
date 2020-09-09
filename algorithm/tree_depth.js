var Node = function(value) {
	this.value = value
}

var node1 = new Node(1)
var node2 = new Node(2)
var node3 = new Node(3)
var node4 = new Node(4)
var node5 = new Node(5)
var node6 = new Node(6)
var node7 = new Node(7)
var node8 = new Node(8)
var node9 = new Node(9)
var node10 = new Node(10)
/*
      1
  2       3
4   7   5   6
       8 9
	    10
*/
node1.left = node2
node1.right = node3

node2.left = node4
node4.left = node7

node3.left = node5
node3.right = node6

node5.left = node8
node5.right = node9

node9.left = node10



function maxDepth(node) {
	
	if (!node) return 0;
	
	var l = maxDepth(node.left) + 1
	var r = maxDepth(node.right) + 1
	
	return Math.max(l, r)
}


var count = maxDepth(node1)
console.log('max depth: ', count)




function minDepth(node) {

	if(!node) return 0;
	
	if(!node.left && !node.right) return 1;
	
	var l = minDepth(node.left) + 1;
	var r = minDepth(node.right) + 1;
	
	l = l===1 ? Infinity : l;
	r = r===1 ? Infinity : r;
	
	return Math.min(l, r);

}



console.log('minDepth: ', minDepth(node1))







// --------------
// 广度遍历
// ---------------

function recursion() {
	
	if (!queue.length) return;
	
	var node = queue.shift()
	
	//console.log(node)
	
	pushChildren(node)

}



function pushChildren(node) {

	if (node.left) {
		queue.push(node.left)
		next = node.left
	}
	if (node.right) {
		queue.push(node.right)
		next = node.right
	}
	
	if (lastline===node) {
		lastline = next
		//console.log('--')
		countMax++
	}
	
	if (!node.left && !node.right) {
		countMin = countMin || countMax
	}
	
	recursion()

}



var countMax = 0
var countMin = 0


var queue = []
queue.push(node1)
var lastline = node1
var next

recursion();

console.log(countMax)
console.log(countMin)


