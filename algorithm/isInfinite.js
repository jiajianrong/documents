let parents = [];
let yes = false;

// 执行obj返回false
let x = {
	b21: 8,
	b22: 10,
};
let obj = {
	a: x,
	b: {
		b1: 6,
		b2: x,
	},
}


// 执行obj2返回true
let obj2 = {
	a: 1,
}
let obj3 = {
	c: obj2,
}
obj2.b = obj3;



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


isInfinite(obj2);
console.log(yes);