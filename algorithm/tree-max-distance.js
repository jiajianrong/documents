   1
 2   3
4   5 6
       7
      8 9 


class Node {
	constructor(v) {
		this.v = v;
	}
}


node1 = new Node(1);
node2 = new Node(2);
node3 = new Node(3);
node4 = new Node(4);
node5 = new Node(5);
node6 = new Node(6);
node7 = new Node(7);
node8 = new Node(8);
node9 = new Node(9);



node1.left  = node2;
node1.right = node3;
node2.left  = node4;
node3.left  = node5;
node3.right = node6;
node6.right = node7;
node7.right = node8;
node7.right = node9;




function process(node) {
	if (!node) {
	     return [0, 0];
	}
	let [leftMaxDistance, leftHeight]  = process(node.left);
	let [rightMaxDistance, rightHeight] = process(node.right);

	let currHeight = Math.max(leftHeight, rightHeight) + 1;

	let maxDistance = Math.max(
		leftMaxDistance,
		rightMaxDistance,
		leftHeight + rightHeight + 1,
	);

	return [maxDistance, currHeight];
}

let arr = process(node1);
console.log(arr);
