let parents = [];
let yes = false;

function isInfinite(obj) {
	// 终止递归
	if (yes) {
		return;
	}
	
	parents.push(obj);
	
	for (let key of Object.keys(obj)) {
		let aChild = obj[key];
		if (typeof aChild==='object') {
			if (parents.includes(aChild)) {
				yes = true;
			}
			isInfinite(aChild);
		}
	}
	
	parents.pop();
}


// 执行obj返回false
let x = {c: 8, d: 10};
let obj = {a: x, b: {b1: x}};

// 执行obj2返回true
let obj2 = {a: 1, b: null};
let obj3 = {c: obj2};
obj2.b = obj3;

isInfinite(obj2);
console.log(yes);