var source = 'I am a good bee, and I have a beautiful ball'.split(''); ////
var target = 'beauti'.split('')

console.log(has())


function has(){

		for (var j=0; j<=source.length-target.length; j++) {


				for (var i=0; i<=target.length; i++) {
					
					if (i==target.length) {
						return true;
					}
					
					if (source[j+i] == target[i]) {
						continue;
					} else {
						break;
					}
				
				}
			

		}
		
		return false;

}