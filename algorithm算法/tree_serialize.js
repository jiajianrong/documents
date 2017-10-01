var Node = function(value) {
	this.value = value
}
Node.prototype.toString = function(){
	var str = this.value;
	if (this.left && this.right)
		str += '[ left=' + this.left.toString() + ' right=' + this.right.toString() + ' ]'
	else if (this.left)
		str += '[ left=' + this.left.toString() + ' ]'
	else if (this.right)
		str += '[ right=' + this.right.toString() + ' ]'
	return str;
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


var arr = [];


function printDepth(node) {
	
	arr.push(node.value)
	
	if (node.left) printDepth(node.left)
	else arr.push('#')
	
	if (node.right) printDepth(node.right)
	else arr.push('#')
}


printDepth(node1)

console.log('序列化前：' + node1.toString())

console.log("序列化后：" + arr.join('!'))



// 反序列化

var root = new Node(arr.shift());
var stack = [root];

var current = root;

de_left(root)


console.log("反序列化后：", root.toString())


function de_left() {

	if (!arr.length) {return;}

	var node = new Node(arr.shift());
	
	if (node.value=='#') {
		de_right();
		return;
	}
	
	
	current.left = node;
	
	current = node
	
	stack.push(node);
	
	de_left()

}





function de_right() {
	
	if (!arr.length) {return;}
	
	var node = new Node(arr.shift());
	
	
	if (node.value=='#') {
		stack.pop();
		current = stack[stack.length-1];
		
		de_right();
		return;
	}
	
	
	current.right = node;
	
	current = node
	
	
	stack.pop()
	stack.push(node)
	
	
	de_left();

}

















