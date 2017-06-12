# 深入了解script加载机理


本文将讲述浏览器是如何加载并执行JS的。

(whatwg的官方文档)[https://html.spec.whatwg.org/multipage/scripting.html#script]定义了各种加载及执行js的方式。看上去很绝望吧？这就是为什么本文会将其转译为人类可以读懂的语言。




## 第一段js代码

	<script src="//other-domain.com/1.js"></script>
	<script src="2.js"></script>

浏览器将会并行加载他们，并且以最快的方式执行，同时保证2.js一定在1.js执行之后执行；而1.js也会等待到其前面的js或css执行之后执行。

不幸的是，在此之间，浏览器会推迟页面渲染。这要归罪于早期的dom api `document.write`，它允许在浏览器正在解析文档上输出string。
较新一点的浏览器会继续扫描并解析文档、以及加载其他外部资源(js/css/img等)，但是渲染还是被推迟了。




## 感谢IE(认真的)

	<script src="//other-domain.com/1.js" defer></script>
	<script src="2.js" defer></script>

微软很早就意识到了这个性能问题，并且在IE4里就引入了defer关键字。使用defer意味着“我承诺在js中不使用类似`document.write`妨碍document的解析”。defer最终被HTML4所采纳。

上面例子中，浏览器并行加载js，并在`DOMContentLoaded`触发前，顺序执行它们。

defer很快就变得一团糟糕：src属性和defer属性，采用script标签加载还是采用动态script加载，使得添加一段js一共有6种不同的方式。当然浏览器之间还会打架。Mozilla在2009年(发布声明)[https://hacks.mozilla.org/2009/06/defer/]反对使用defer。

对此whatwg官方做出澄清，规定defer不影响动态加载的js文件，也不影响以及缺少src的js代码。其他情形下defer script应该在document解析之后顺序执行。




## 感谢IE(别当真，这次是挖苦的意思)

IE4-9存在一个会(导致script标签无序执行的严重bug)[https://github.com/h5bp/lazyweb-requests/issues/42]

	<script src="//other-domain.com/1.js" defer></script>
	<script src="2.js" defer></script>


1.js

	console.log('1');
	document.getElementsByTagName('p')[0].innerHTML = 'Changing some content';
	console.log('2');

2.js

	console.log('3');


我们期待结果会打印1,2,3，但IE9及更早的浏览器会打印1,3,2。一个dom操作会导致IE中断当前js的执行，转而执行下一个js。

IE10及其他浏览器并无bug，js的执行会被推迟到整个document加载并解析之后(`DOMContentLoaded`之前)。如果你也是这么希望的，那么没有任何问题。但如果你想要更快的执行的话：




## 伟大的HTML5来了！

	<script src="//other-domain.com/1.js" async></script>
	<script src="2.js" async></script>

HTML5引入了async属性，通常使用这一属性的前提会假定你不会在代码里使用`document.write`。async会使所有js并行加载，并在加载完成后立即执行，而无需等待document是否解析完成。

不幸的是，因为所有script标签都会尽早执行，所以2.js可能会在1.js之前执行。因此可能会破坏js之间的依赖关系。




## 我们需要一个JS库！？

最理想的状况浏览器在不影响渲染的前提下，异步加载js文件并按顺序立即执行。但不幸的是HTML不支持。

因此诞生了多种解决方案。一些需要我们改变js代码，将之包裹到一个回调函数中，然后顺序执行，如(requireJS)[http://requirejs.org/]。也有使用XHR并行加载，然后使用`eval()`顺序执行的解决方案。不过XHR不支持跨域，所以要求服务器设置(CORS header)[https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS]以及浏览器能够支持。更有一些黑科技解决方案，如(LabJS)[http://labjs.com/]。

黑科技的原理是诱导浏览器加载js资源，加载完成后仅仅触发成功事件而非立即执行。在LabJS里，script标签都被故意添加了错误的mime类型，例如`<script type="script/cache" src="...">`。

一旦js资源全部加载完毕，它们会被再次用正确的mime类型添加，然后期待浏览器会从缓存中读取并立即顺序执行。随着HTML5要求浏览器不得加载mime类型未知的script资源，这一方案变得毫无意义。值得注意的是LabJS也做出相应改变，最终采用了本文的解决方案。

使用script loader不可避免的有一个性能问题：必须等库文件加载并执行完毕后，才能去使用它加载和执行所有其他js资源。




## DOM大显身手！

答案隐藏在HTML5文档script-loading一节的最下面。

The async IDL attribute controls whether the element will execute asynchronously or not. If the element's "force-async" flag is set, then, on getting, the async IDL attribute must return true, and on setting, the "force-async" flag must first be unset…

让我们把它翻译成地球语言。

	[
	  '//other-domain.com/1.js',
	  '2.js'
	].forEach(function(src) {
	  var script = document.createElement('script');
	  script.src = src;
	  document.head.appendChild(script);
	});

动态创建的script标签会被异步加载，而且不会阻碍浏览器渲染。由于是加载后立即执行，意味着无法保证顺序。不过我们可以显式的指定非async：

	[
	  '//other-domain.com/1.js',
	  '2.js'
	].forEach(function(src) {
	  var script = document.createElement('script');
	  script.src = src;
	  script.async = false;
	  document.head.appendChild(script);
	});

上面的代码应该使用inline的方式写在head标签里，使得在不阻碍渲染的情况下，尽早加载js资源，并且尽早顺序执行。2.js可能会先于1.js加载，但是一定会等待到1.js执行后才执行。庆祝吧，异步加载-顺序执行。

所有支持async属性的浏览器都兼容这种js加载方式，除了Safari5.0(5.1没问题)。除此之外，低版本的不支持async属性的Firefox和Opera也可以完美支持这种方式，因为这些浏览器本身会已顺序执行的方式执行动态加载的js资源。




## 上述真的是加载js的最快方式吗？

如果在动态加载的范畴的话，是的。否则不是。上面的例子需要浏览器解析和执行js才能判断哪些script需要被加载。这会导致被加载的script忽略浏览器的preload扫描。浏览器会使用这些预加载扫描去发现接下来有可能需要的资源，或者在页面渲染被其他资源阻碍的情况下去发现当前页面需要的资源。

我们可以把这一特性加入到document的head里：

	<link rel="subresource" href="//other-domain.com/1.js">
	<link rel="subresource" href="2.js">

这会告诉浏览器，当前页面需要1.js和2.js。`link[rel=subresource]`和`link[rel=prefetch]`类型，只是(含义不同)[http://www.chromium.org/spdy/link-headers-and-server-hint/link-rel-subresource]。不幸的是它当前仅被很少的浏览器支持(如Chrome)，而且你声明script两次，一次是通过link元素，一次是script元素。

纠正：其实提前加载link元素并不在预加载扫描阶段，而是在正常的dom解析阶段。但动态加载js仍然不会被提前预加载。




## 令人沮丧的事实

如何最快的异步的加载script并且顺序执行，没有银弹！

HTTP2/SPDY有效降低请求开销，使得传输多个独立的可缓存的文件成为最快的加载方式。例如：

	<script src="dependencies.js"></script>
	<script src="enhancement-1.js"></script>
	<script src="enhancement-2.js"></script>
	<script src="enhancement-3.js"></script>
	…
	<script src="enhancement-10.js"></script>

每一个enhancement文件都是一个组件，但都需要dependencies.js。理想情况下我们希望异步加载所有js，然后尽快顺序执行(译者注：别忘了，尽快执行的意思是指无需等待document解析完成)。

但事实上并没有明确的办法实现这样的功能，除非我们在dependencies.js里记录每一个enhancement的加载状态。甚至`async=false`也无能为力，执行10.js势必会阻塞1-9。只有一个浏览器在不使用黑科技的前提下使之成为可能...




## IE的独到之处

IE加载script时和别的浏览器不一样。

	var script = document.createElement('script');
	script.src = 'whatever.js';

IE已经开始加载whatever.js了。而其他浏览器不会，它们会等到script被加入到document后才开始真正的加载。IE有一个事件：readystatechange，还有一个变量：readystate，它们会告知加载的进度。这非常有用，我们可以割裂加载过程和执行过程。

	var script = document.createElement('script');

	script.onreadystatechange = function() {
	  if (script.readyState == 'loaded') {
		// Our script has download, but hasn't executed.
		// It won't execute until we do:
		document.body.appendChild(script);
	  }
	};

	script.src = 'whatever.js';

我们可以创建自己的流程，决定什么时候真正执行js(即把script加入文档)。IE6就有了这一个功能了，非常伟大。但和`async=false`一样，它仍然无法被预加载扫描。




## 够了！到底要怎样加载js？

如果不想阻碍渲染，并且是顺序执行，还要有良好的浏览器支持，我建议：

	<script src="//other-domain.com/1.js"></script>
	<script src="2.js"></script>

把上面代码放置到body尾部。

希望(JavaScript Module)[http://wiki.ecmascript.org/doku.php?id=harmony:modules]能够带来更好的解决办法。




## 肯定会有更好的解决方案吧？

如果你想要更极致的性能并且不介意麻烦，你可以把上述几种手段整合一下：

首先针对预加载功能，添加subresource属性。

	<link rel="subresource" href="//other-domain.com/1.js">
	<link rel="subresource" href="2.js">

接下来在使用inline写法在head里使用`async=false`动态加载js，然后增加IE基于readystate的降级方案，最后用defer降级方案兜底。

	var scripts = [
	  '1.js',
	  '2.js'
	];
	var src;
	var script;
	var pendingScripts = [];
	var firstScript = document.scripts[0];

	// Watch scripts load in IE
	function stateChange() {
	  // Execute as many scripts in order as we can
	  var pendingScript;
	  while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
		pendingScript = pendingScripts.shift();
		// avoid future loading events from this script (eg, if src changes)
		pendingScript.onreadystatechange = null;
		// can't just appendChild, old IE bug if element isn't closed
		firstScript.parentNode.insertBefore(pendingScript, firstScript);
	  }
	}

	// loop through our script urls
	while (src = scripts.shift()) {
	  if ('async' in firstScript) { // modern browsers
		script = document.createElement('script');
		script.async = false;
		script.src = src;
		document.head.appendChild(script);
	  }
	  else if (firstScript.readyState) { // IE<10
		// create a script and add it to our todo pile
		script = document.createElement('script');
		pendingScripts.push(script);
		// listen for state changes
		script.onreadystatechange = stateChange;
		// must set src AFTER adding onreadystatechange listener
		// else we’ll miss the loaded event for cached scripts
		script.src = src;
	  }
	  else { // fall back to defer
		document.write('<script src="' + src + '" defer></'+'script>');
	  }
	}

压缩之后大概362字节。

	!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",[
	  "//other-domain.com/1.js",
	  "2.js"
	])

与简单的script标签置底相比，这真的值得吗？如果你有些script文件是通过动态有条件加载的话，(像BBC一样)[http://responsivenews.co.uk/post/18948466399/cutting-the-mustard]，你可能会因为提前加载而受益。否则基本没必要，还是直接置底吧。





## 快速参考



Plain script elements

	<script src="//other-domain.com/1.js"></script>
	<script src="2.js"></script>

Spec says: Download together, execute in order after any pending CSS, block rendering until complete.

Browsers say: Yes sir!



Defer

	<script src="//other-domain.com/1.js" defer></script>
	<script src="2.js" defer></script>

Spec says: Download together, execute in order just before DOMContentLoaded. Ignore “defer” on scripts without “src”.

IE < 10 says: I might execute 2.js halfway through the execution of 1.js. Isn’t that fun??

The (browsers in red)[http://caniuse.com/#search=defer] say: I have no idea what this “defer” thing is, I’m going to load the scripts as if it weren’t there.

Other browsers say: Ok, but I might not ignore “defer” on scripts without “src”.



Async

	<script src="//other-domain.com/1.js" async></script>
	<script src="2.js" async></script>

Spec says: Download together, execute in whatever order they download in.

The (browsers in red)[http://caniuse.com/#search=async] say: What’s ‘async’? I’m going to load the scripts as if it weren’t there.

Other browsers say: Yeah, ok.



Async false

	[
	  '1.js',
	  '2.js'
	].forEach(function(src) {
	  var script = document.createElement('script');
	  script.src = src;
	  script.async = false;
	  document.head.appendChild(script);
	});

Spec says: Download together, execute in order as soon as all download.

Firefox < 3.6, Opera says: I have no idea what this “async” thing is, but it just so happens I execute scripts added via JS in the order they’re added.

Safari 5.0 says: I understand “async”, but don’t understand setting it to “false” with JS. I’ll execute your scripts as soon as they land, in whatever order.

IE < 10 says: No idea about “async”, but there is a (workaround)[https://www.html5rocks.com/en/tutorials/speed/script-loading/#interesting-ie] using “onreadystatechange”.

Other (browsers in red)[http://caniuse.com/#search=async] say: I don’t understand this “async” thing, I’ll execute your scripts as soon as they land, in whatever order.

Everything else says: I’m your friend, we’re going to do this by the book.





*[译自html5rocks](https://www.html5rocks.com/en/tutorials/speed/script-loading/)，转载请注明来自58金融前端团队*






























































































































































