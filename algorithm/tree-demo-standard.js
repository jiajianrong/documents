class Node {
    constructor(n) {
        this.value = n;
        this.left = null;
        this.right = null;
    }
	toString(){
		var str = this.value;
		if (this.left && this.right)
			str += '[ left=' + this.left.toString() + ' right=' + this.right.toString() + ' ]'
		else if (this.left)
			str += '[ left=' + this.left.toString() + ' ]'
		else if (this.right)
			str += '[ right=' + this.right.toString() + ' ]'
		return str;
	}
}


let root = new Node(8);
let node1 = new Node(1);
let node7 = new Node(7);
let node5 = new Node(5);
let node2 = new Node(2);
let node3 = new Node(3);
let node4 = new Node(4);
let node9 = new Node(9);
let node6 = new Node(6);
/**
       8
   1       7
 5   2    6
3 4   9
**/
root.left = node1;
root.right = node7;
node1.left = node5;
node1.right = node2;
node5.left = node3;
node5.right = node4;
node2.right = node9;
node7.left = node6;


//-------------------------


let child = new Node(5);
let nodeChild3 = new Node(3);
let nodeChild4 = new Node(4);

child.left = nodeChild3;
child.right = nodeChild4;

module.exports = {root, child, Node};
