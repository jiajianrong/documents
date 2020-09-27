let { root, Node } = require('./tree-demo-standard');

// 先序
function serialize(node) {
	if (!node) {
		return '#!';
	}
	let res = node.value + '!';
	res += serialize(node.left);
	res += serialize(node.right);
	return res;
}


function unserialize(arr) {
	let c = arr.shift();
	if (c === '#') {
		return null;
	}
	let node = new Node(c);
	node.left = unserialize(arr);
	node.right = unserialize(arr);
	return node;
}


console.log(serialize(root));
let str = '8!1!5!3!#!#!4!#!#!2!#!9!#!#!7!6!#!#!#';
let rootBack = unserialize(str.split('!'));
console.log('before', root.toString());
console.log('after ', rootBack.toString());


//-------------------
// 另一种格式序列化
var arr = [];
function theOtherSerialize(node) {
	arr.push(node.value);
	
	if (node.left) theOtherSerialize(node.left);
	else arr.push('#');
	
	if (node.right) theOtherSerialize(node.right);
	else arr.push('#');
}
theOtherSerialize(root);
console.log('the theOtherSerialize:\n', arr.join('!'));