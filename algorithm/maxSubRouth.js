(function(){



class Node {
    constructor(n) {
        this.value = n;
        this.left = null;
        this.right = null;
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
	
	stack.push(node);

	if (node.left) {
		calPaths(node.left);
	}
	if (node.right) {
		calPaths(node.right);
	}
	
	if (isLeaf(node)) {
		//console.log(stack);
		stack.forEach(item => console.log(item.value));
		console.log('\n')
	}
	
	stack.pop();
	
}

// 穷举所有路径
calPaths(root);





function solve(node) {

    if (node.left && !node.right) {
        return node.value + solve(node.left);
    } else if (!node.left && node.right) {
        return node.value + solve(node.right);
    } else if (node.left && node.right){
        let a = solve(node.left);
        let b = solve(node.right);
		
        if (a>b) {
            return node.value + a;
        } else {
            return node.value + b;
        }
    } else if (!node.left && !node.right) {
        return node.value;
    }
}

// 计算最大和路径
console.log(solve(root));


})();
