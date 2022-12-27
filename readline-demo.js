let fs = require('fs');
let readline = require('readline');





function readFileLBL(onClose) {
	let itemArr = [];

	let rl = readline.createInterface({
		input: fs.createReadStream('./aone-app-name.txt')
	});
	rl.on('line', line => {
		itemArr.push(line);
	});
	rl.on('close', () => {
		onClose(itemArr);
	});
}


function handler(itemArr) {
	console.log(itemArr.length);

    let arrDedupped = dedup(itemArr);

	console.log(arrDedupped.length);

	writeFileLBL(arrDedupped);
}


function dedup(itemArr) {
	let map = {};
	itemArr.forEach(item => {
		map[item] = true;
	});
	let keys = Object.keys(map);
	return keys;
}


function writeFileLBL(arr) {
	let ws = fs.createWriteStream('./aone-app-name-dedup.txt');
	arr.forEach(item => {
		ws.write(item + '\n');
	});
	ws.end();
}



// 去重脚本
readFileLBL(handler);