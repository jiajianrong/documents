let fs = require('fs');
let readline = require('readline');


function dedup(itemArr) {
	let map = {};
	itemArr.forEach(item => {
		map[item] = true;
	});
	let keys = Object.keys(map);
	return keys;
}


function readFileLBL(onClose) {
	let itemArr = [];

	let rl = readline.createInterface({
		input: fs.createReadStream('./words.txt')
	});
	rl.on('line', line => {
		itemArr.push(line);
	});
	rl.on('close', () => {
		onClose(itemArr);
	});
}


function handle(arr) {
	let distinctArr = dedup(arr);
	writeFileLBL(distinctArr);
}


function writeFileLBL(arr) {
	let ws = fs.createWriteStream('./distinctWords.txt');
	arr.forEach(item => {
	  ws.write(item + '\n');
	});
	ws.end();
}


// 去重脚本
readFileLBL(handle);
