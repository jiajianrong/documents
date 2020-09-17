//JS实现一个带并发限制的异步调度器Scheduler，
//保证同时运行的任务最多有两个。
//完善代码中Scheduler类，使得以下程序能正确输出

class Scheduler {
    constructor() {
        this.promiseArr = [];
		this.resolveArr = [];
        this.running = 0;
		this.cursorId = 0;
    }
    add(promiseCreator) {
		return new Promise(resolve=>{
			this.promiseArr.push(promiseCreator);
			this.resolveArr.push(resolve);
			
			this.callP(resolve, promiseCreator);
        })
    }
	callP() {
		if (this.canStart()) {
			let originalResolve = this.getNextOriginalResolve();
			let promiseCreator = this.getNextPromise();
			
			this.didStart();
			
			return originalResolve(promiseCreator().then(this.didFinish.bind(this)));
		}
	}
	canStart() {
		return this.cursorId<this.promiseArr.length && this.running<2;
	}
	didStart() {
		this.running++;
		this.cursorId++;
	}
	didFinish(data) {
		this.running--;
		this.callP();
		return data;
	}
	getNextOriginalResolve() {
		return this.resolveArr[this.cursorId];
	}
	getNextPromise() {
		return this.promiseArr[this.cursorId];
	}
}


let timeout = (time) => new Promise(resolve => {
    setTimeout(resolve, time)
}) 

let scheduler = new Scheduler();

let addTask = (time, order) => {
    scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4') 
addTask(100, '5') 
// output: 2 3 1 5 4 
// 一开始，1、2两个任务进入队列 
// 500ms时，2完成，输出2，任务3进队 
// 800ms时，3完成，输出3，任务4进队 
// 1000ms时，1完成，输出1，任务5进队
// 1100ms时，5完成，输出5  
// 1200ms时，4完成，输出4 
