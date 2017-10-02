var P = 'abcab'.split('')

var next = []

//makeNext(P, next)
//console.log('next: ', next)


my(P)


function my(arr) {

	var suf = getSuf(arr)
	
	
	var max_match = 0
	
	for ( var i=0;i<arr.length;i++) {
	
		var curr_match_char = arr[i]
	
		for (var j=suf.length-1;j>=0;j--) {
			
			var suf_item = suf[j];
			
			
			if (curr_match_char == suf_item[i]) {
			
				max_match++
				break;
			
			} else {
				suf.pop()
			}
		
		}
	
	}
	console.log(max_match)
	return max_match;
	
	
	
	//console.log(suf)

    function getSuf(arr) {
	
		var r = []
		
		for(var i=0;i<arr.length-1;i++) {
			
			var previous = r[i-1] || '';
			
			r.push(arr[arr.length-1-i]+previous)
		}
		
		return r
	
	}

}





function makeNext(P, next)
{
    var q,k;
	//q:模版字符串下标；k:最大前后缀长度
	
    next[0] = 0;
	//模版字符串的第一个字符的最大前后缀长度为0
    
	for (q=1,k=0; q<P.length; ++q)
	//for循环，从第二个字符开始，依次计算每一个字符对应的next值
    {
		//递归的求出P[0]···P[q]的最大的相同的前后缀长度k
        while(k>0 && P[q]!=P[k])
            k = next[k-1];          
			//不理解没关系看下面的分析，这个while循环是整段代码的精髓所在，确实不好理解  
        
		//如果相等，那么最大相同前后缀长度加1
		if (P[q] == P[k])
            k++;
        
        next[q] = k;
    }
}







module.exports = my