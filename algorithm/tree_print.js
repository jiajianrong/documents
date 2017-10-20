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

node1.left = node2
node1.right = node3

node2.left = node4
node4.left = node7

node3.left = node5
node3.right = node6

node5.left = node8
node5.right = node9





function printDepth(node) {

	console.log(node.value)
	
	if (node.left) printDepth(node.left)
	if (node.right) printDepth(node.right)
}


//printDepth(node1)
/////////////////////////




function push_child(node) {
	if (node.left) {
		queue.push(node.left)
		nextlast = node.left
	}
	if (node.right) {
		queue.push(node.right)
		nextlast = node.right
	}
	
	
	if (last==node) {
		console.log('-')
		last = nextlast
	}
	
	print_q();
}



function print_q() {
	if (queue.length==0) {return;}
	
	var node = queue.shift();
	
	console.log(node.value)
	
	push_child(node)
}




var queue = []
queue.push(node1)
var last = node1
var nextlast
print_q()

