var next = require('./str_match_kmp_next')



var source = 'www.fish'.split(''); ////
var target = 'ww.'.split('')

var offset = computeOffset(target)


var cursor = 0

compare(source, target)



function compare(source, target) {

	for ( var i=cursor; i<source.length-target.length; i++ ) {
	
		for (var j=0; j<=target.length; j++) {
		
			if (j==target.length) {
				console.log('has')
				return true
			}
			
			if (source[i+j] == target[j]) {
				continue;
			} else {
				cursor = cursor + offset;
				break;
			}
		
		}
	
	}

}












function computeOffset(next) {
	
	var max = 0;
	for (var i=0;i<next.length;i++) {
		if (next[i]>max) max=next[i]
	}
	return next.length-max

}


