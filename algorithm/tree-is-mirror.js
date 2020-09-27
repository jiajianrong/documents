class Node {
    constructor(n) {
        this.value = n;
        this.left = null;
        this.right = null;
    }
}

let root = new Node(8);
let node1_l = new Node(1);
let node1_r = new Node(1);

let node5_l = new Node(5);
let node5_r = new Node(5);

let node3_l = new Node(3);
let node3_r = new Node(3);

let node4_l = new Node(4);
let node4_r = new Node(4);
/**
       8
   1       1
 5           5
3 4         4 3
**/
root.left = node1_l;
root.right = node1_r;

node1_l.left = node5_l;
node1_r.right = node5_r;

node5_l.left = node3_l;
node5_l.right = node4_r;

node5_r.left = node4_l;
node5_r.right = node3_r;



function isSymmetry(node) {
	if (!node) {
		return true;
	} else {
		return judge(node.left, node.right);
	}
}

function judge(node1, node2) {
	if (!node1 && !node2) {
		return true;
	}
	if (node1 && !node2) {
		return false;
	}
	if (!node1 && node2) {
		return false;
	}
	if (node1.value !== node2.value) {
		return false;
	}
	let diffOuter = judge(node1.left, node2.right);
	let diffInner  = judge(node1.right, node2.left);
	return diffOuter && diffInner;
}

console.log(isSymmetry(root));