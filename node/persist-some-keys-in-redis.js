var RDS_PORT = 5217,
    RDS_HOST = 'host.69dns.org',
    RDS_OPTS = { password: 'password' };

var redis = require('redis'),
    client = redis.createClient( RDS_PORT, RDS_HOST, RDS_OPTS );
    

// 为match出的所有redis item设置永不过期
client.on('ready', async function(err){
    
    console.log('ready');
    
    // number
    let totalCount = await getTotalCount();
    console.log('totalCount', totalCount);
    
    // array
    let allKeys = await getAllKeys(totalCount);
    console.log('allKeys', allKeys.length);
    
    // map
    let allKVs = await getAllKVs(allKeys);
    console.log('allKVs', allKVs.size);
    
    // map
    let filterFn = matchOA('xuhechuan');
    let destKVs = filterBy(allKVs, filterFn);
    console.log('destKVs', destKVs.size);
    
    // loop-check
    destKVs.forEach(async function(value, key) {
        let data = await pttl(client, key);
        console.log( data===-1 ? -1 : data/1000/3600/24);
    });
    
    // loop-persist
    destKVs.forEach(async function(value, key) {
        await client.persist(key);
    });
    
    // loop-check
    destKVs.forEach(async function(value, key) {
        let data = await pttl(client, key);
        console.log( data===-1 ? -1 : data/1000/3600/24);
    });
    
    
    //client.set('nodejs_test_jiajianrong', 'tttttest_by_fe', redis.print);
    //client.get('nodejs_test_jiajianrong', redis.print);
});



function getTotalCount() {
    return new Promise(function(res, rej) {
        client.dbsize(function(err, data) {
            res( err ? 0 : data )
        });
    })
}


async function getAllKeys(totalCount) {
    let step = 100;
    const len = Math.ceil(totalCount/step);
    let start = 0;
    let data;
    const keys = [];
    
    for (let i=0; i<len; i++) {
        if (i===len-1) {
            step = (totalCount % step === 0) ? step : (totalCount % step);
        }
        data = await getKeys(start, step);
        Array.prototype.push.apply(keys, data[1]);
        start = +(data[0]);
    }
    
    return keys;
}


function getKeys(start, step) {
    return new Promise(function(res, rej) {
        client.scan(start, 'match', '*',  'count', step, function(err, data){
            res( err ? null : data );
        })
    })
}


function getValue(client, key) {
    return new Promise(function(res, rej) {
        client.get(key, function(err, data) {
            res( err ? null : data );
        })
    })
}


async function getAllKVs(allKeys) {
    let kvs = new Map();
    
    for (let i=0; i<allKeys.length; i++) {
        let data = await getValue(client, allKeys[i]);
        kvs.set(allKeys[i], data);
    }
    
    return kvs;
}


function matchOA(oaname) {
    return function(value, key) {
        try {
            return JSON.parse(value).user.username === oaname;
        } catch(e) {
            return false;
        }
    }
}


function filterBy(map, f) {
    let destKVs = new Map();
    
    map.forEach(function(value, key){
        if ( f(value, key) ) {
            destKVs.set(key, value);
        }
    });
    
    return destKVs;
}


function persist(client, key) {
    return new Promise(function(res, rej) {
        client.persist(key, function(err, data) {
            res( err ? null : data );
        })
    })
}


function pttl(client, key) {
    return new Promise(function(res, rej) {
        client.pttl(key, function(err, data) {
            res( err ? null : data );
        })
    })
}






