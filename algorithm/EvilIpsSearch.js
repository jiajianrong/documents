
class EvilIpsSearch{

    /**
     * @param duration 单位：豪秒
     * @param threshold
     * @param callback
     */
    constructor(duration, threshold, callback){
        // 维护多大的时间窗口
        this.duration = duration;

        // 请求数量的阈值。超过阈值的会在窗口结束时刻 加入结果集
        this.threshold = threshold;

        // 回调函数。调用方对恶意IP的处理
        this.callback = callback;

        // 初始化时间窗口
        this._initNextTimeWindow(Date.now());
    }

    // 初始化下一个窗口
    _initNextTimeWindow(time){
        // 窗口起始时间点
        this.startTime = time;

        // 存放窗口内的IP在reqQueue的索引
        this.indexOfIp = {};

        // 时间窗口 内的 [{ip, cnt}, {ip, cnt}]。构成队列
        this.reqQueue = [];
    };

    // 处理当前时刻最新入队的请求
    addRequest(ip, time = Date.now()){
        this._edgeDetectAndHandle(time);

        // 入队。若没到临界点，入的是老队；若是临界点，则这是入队的第一个IP。
        // 如果是新IP，则队尾入队；老IP，不用入队，修改cnt数即可；
        if (this.indexOfIp[ip] >= 0){
            let index = this.indexOfIp[ip];
            this.reqQueue[index].cnt = this.reqQueue[index].cnt + 1;
        } else {
            this.reqQueue.push({ip, cnt: 1});
            this.indexOfIp[ip] = this.reqQueue.length - 1;
        }

        // 打印查看当前窗口内的所有 {ip, cnt}对
        // console.log(this.reqQueue)
    }

    // 窗口临界点判定 && 在临界时间点的处理
    _edgeDetectAndHandle(time){
        if (time - this.startTime >= this.duration){
            // 输出本时间窗口下的 超过阈值请求次数的 IP集合
            let evilIpArr = [];
            for(let i = 0; i < this.reqQueue.length; i++){
                if (this.reqQueue[i].cnt >= this.threshold){
                    evilIpArr.push(this.reqQueue[i]['ip']);
                }
            }
            this.callback(evilIpArr);

            // 初始化 下一个窗口
            this._initNextTimeWindow(time);
        }
    };
}


// 下面是测试部分    不断获取----->20秒时间窗口里 >=5次的请求IP
let iptool = new EvilIpsSearch(20000, 5, (evilIpArr) => {
    // 40秒会有两个时间窗口。这里会触发两次
    console.log('evilIpArr', evilIpArr);
});

let cnt = 1;
let timeId = setInterval(() => {
    if (cnt > 140) {
        clearInterval(timeId);
        return;
    }
    cnt++;


    let s = ~~(Math.random() * 5 + 1); // 1-5
    let str = '192.168.22.' + s;
    // console.log(str)
    iptool.addRequest(str);
}, 1000);