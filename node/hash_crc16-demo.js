var result = require('crypto').createHash('md5').update('taskid_1').digest('hex');
console.log(result, result.length);
process.exit(0);




var crypto = require('crypto');
var crc = require('crc');
var numArr = [];

for (let i=0; i<100000; i++) {
	var md5 = crypto.createHash('md5');
	var key = 'taskid_'+i;
	md5.update(key);
	let result = md5.digest('hex');
	let num = crc.crc16(result);
	numArr.push(num);
}


var comparing_step = 100;
var final_map = {};

for (let i=0; i<numArr.length; i++) {
	let currNum = numArr[i];
	let multiple = Math.floor(currNum / comparing_step);
	final_map[multiple] = final_map[multiple] ? (final_map[multiple]+1) : 1;
}

console.log(final_map);








