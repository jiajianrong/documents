var sumOfSquares = function(list) {
　　var result = 0;
　　for (var i = 0; i < list.length; i++) {
　　　　result += square(list[i]);
　　}
　　return result;
};





function map(fn) {
    return function(arr) {
        return Array.prototype.map.call(arr, fn);
    }
}
function reduce(fn, init) {
    return function(arr) {
        return Array.prototype.reduce.call(arr, fn, init);
    }
}



function square(n) {
    return Math.pow(n, 2);
}
function add(total, curr) {
    return total+curr;
}
function add1(n){
    return n+1;
}



function pipe() {
    let fnArr = Array.prototype.slice.apply(arguments);
    let count = 0;
    let result;
    
    return function(arr) {
        while(count < fnArr.length) {
            
            fn = fnArr[count++];
            
            result = fn.call(null, result || arr);
        }
        
        return result;
    }
}



var sumOfSquares = pipe(map(square), map(add1), reduce(add, 0));
console.log(sumOfSquares([1, 2, 3])); // ==> [1*1+1, 2*2+1, 3*3+1] ==> 17








