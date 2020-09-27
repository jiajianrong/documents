function rotate(arr) {
	let startRow = 0;
	let startColumn = 0;
	let endRow = arr.length - 1;
	let endColumn = endRow;
	
	while(startRow<endRow) {
		rotateEdge(arr, startRow++, startColumn++, endRow--, endColumn--);
	}
}


function rotateEdge(arr, startRow, startColumn, endRow, endColumn) {
	
	let steps = endRow - startRow;
	let temp;
	
	for (let step=0; step<steps; step++) {
		
		// 记录上边
		temp = arr[startRow][startColumn+step];
		// 上边赋值，值为左边
		arr[startRow][startColumn+step] = arr[endRow-step][startColumn];
		// 左边赋值，值为下边
		arr[endRow-step][startColumn] = arr[endRow][endColumn-step];
		// 下边赋值，值为右边
		arr[endRow][endColumn-step] = arr[startRow+step][endColumn];
		// 右边赋值，值为上边
		arr[startRow+step][endColumn] = temp;
	}
}



let arr = [
	[1, 2, 3, 4 ],
	[5, 6, 7, 8 ],
	[9, 10,11,12],
	[13,14,15,16],
];
let arr2 = [
	[1, 2, 3, 4, 5 ],
	[6, 7, 8, 9, 10],
	[11,12,13,14,15],
	[16,17,18,19,20],
	[21,22,23,24,25],
];
let arr3 = [
	[ 1, 2, 3, 4, 5, 6],
	[ 7, 8, 9,10,11,12],
	[13,14,15,16,17,18],
	[19,20,21,22,23,24],
	[25,26,27,28,29,30],
	[31,32,33,34,35,36],
];

console.log('before rotate:\n', arr3);
rotate(arr3);
console.log('after rotate:\n', arr3);
