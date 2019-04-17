function sleep(n) {
    
    return new Promise((resolve, reject) => {
        setTimeout(resolve, n);
    }).catch(() => console.log('Oops errors!'));
    
}


function sleepRandom() {
    
    return new Promise((resolve, reject) => {
        setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
    }).catch(() => console.log('Oops errors!'));
    
}



async function main() {
    
    console.log('start')
    await sleepRandom()
    console.log('end')
}

main()