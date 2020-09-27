Promise.all = function(promArr) {
	let results = [];
	let countDone = 0;
	
	return new Promise(resolve=>{
		promArr.forEach((prom, i)=>{
			
			Promise.resolve(prom).then(data=>{
				countDone++;
				results[i] = data;
				
				if (countDone===promArr.length) {
					resolve(results);
				}
			});
		});
	});
}

let p = new Promise(function(res) {
	setTimeout(()=>{res(2)}, 1000);
})

Promise.all([1,p,3]).then(console.log);