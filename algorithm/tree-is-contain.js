let {root, child} = require('./tree-demo-standard');

function contains(p, c) {
	if (!p) {
		return false;
	}
	let curr = check(p, c);
	if (curr) {
		return true;
	}
	let left = contains(p.left, c);
	if (left) {
		return true;
	}
	let right = contains(p.right, c);
	if (right) {
		return true;
	}
	return false;
}

function check(p, c) {
	if (!c) {
		return true;
	}
	if (!p) {
		return false;
	}
	if (p.value!==c.value) {
		return false;
	}
	return check(p.left, c.left) && check(p.right, c.right);
}

console.log(contains(root, child));
