function fetch(url) {
    return new Promise(resolve=>{
        setTimeout(()=>{
            resolve(url + ': done')
        }, 1000)
    })
}

fetchAll(['fina1', 'nce2', 'jia3', 'gogo4', 'ray5']).then(console.log)


function fetchAll(urlArr) {
    let allCount = urlArr.length;

    let resArr = [];

    let cursor = 0;
    
    let finishedCount = 0;

    return new Promise(res=>{
        
        function request() {
            if (cursor>=allCount) {
                return;
            }
    
            let current = cursor++;
    
            fetch(urlArr[current]).then(data=>{
                resArr[current] = data;
                console.log(data);
    
                if (++finishedCount === allCount) {
                    console.log(resArr)
                    res(resArr);
                }
    
                request();
            });
        }
    
        request();
        request();
    });

}











//fetchAll2(['fina1', 'nce2', 'jia3', 'gogo4', 'ray5']).then(console.log)


function fetchAll2(urlArr) {
    let allCount = urlArr.length;
    let promArr = [];
    
    for (let i=0; i<urlArr.length; i++) {
        let promise = fetch(urlArr[i]);
        promArr.push(promise);
    }
    
    
    return new Promise(function(res, rej) {
        let dataArr = [];
        let finishedCount = 0;
        
        // 闭包i
        promArr.forEach((prom, i)=>{
             prom.then(function(data){
                finishedCount++;
                
                dataArr[i] = data;
                
                if (finishedCount===allCount) {
                    // 所有请求完毕
                    res(dataArr)
                }
            })
        })
           
        
    });
    
    
}
