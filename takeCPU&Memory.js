if (ctx.query.takeCpu) {
	setTimeout(() => {
		let _TIME_DURATION = +(ctx.query.takeCpu || 10) * 1000;
		let _startTime = +new Date();
		let _t, _currTime;
		// _TIME_DURATION时间内设置 cpu100% 
		do {
			_currTime = +new Date();
			_t = _currTime - _startTime;
		} while (_t<_TIME_DURATION);
	}, 1000);
}

if (ctx.query.takeMemory) {
	setTimeout(() => {
		let _TIME_DURATION = +(ctx.query.takeMemory || 10) * 1000;
		a = Buffer.alloc(1024*1024*1024*1.5, 'a');
		// _TIME_DURATION时间内设置 memory1.5G 
		setTimeout(() => {
			a = null;
		}, _TIME_DURATION);
	}, 1000);
}

let curr = new Date();
let min = curr.getMinutes();
if (min >= 55) {
	throw new CustomError('more than 55');
}