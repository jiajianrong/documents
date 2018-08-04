Node使用Event Loop执行JavaScript代码，并且为一些高耗时任务(如文件I/O)提供了一个Worker Pool。Node使用很少数量的线程去应付很多数量的Client。 Node使用的线程越少，它就有可以把越多系统资源花在client上，而非线程存储和切换上。但真因为Node只使用了很少量的线程，你更应该正确的使用它们。

一条可以让你的Node server运行更快的建议：当node处理每一个client的时间花费越小，server运行的越快。

这就涉及到Event Loop的回调及Worker Pool的任务。

## 为什么应该避免阻塞Event Loop和Worker Pool？

Node使用很少量的线程去处理众多client请求。这些线程分两类：一个Event Loop(也叫主循环、主线程、event线程)，以及Worker Pool里的一组Worker(线程)。

如果一个线程花了很长时间去执行Event Loop回调或者Worker任务，就可以被认为是阻塞的。当一个线程被一个client请求的工作任务所阻塞，它就不能处理其他client请求了。因此考虑下面两个因素：
- 性能：如果你在这俩种线程之一上，总是执行阻塞工作，服务器的吞吐量(每秒处理请求数)就会下降
- 安全：对于某种特点输入，如果你的某个线程被阻塞的话，恶意用户就利用这种输入制造[DoS](https://en.wikipedia.org/wiki/Denial-of-service_attack)


## Node快速回顾

Node采用事件驱动机制：使用Event Loop作为主业务流程，使用Worker Pool处理耗时任务。

#### Event Loop里执行什么任务？

启动之初，Node会先完成初始化阶段，`require`各种模块，及为事件注册回调。接下来Node会进入Event Loop，相应client请求并执行回调。这个回调可能又会注册了一些异步回调，然后这个回调执行完毕，但是这些异步回调还没有，他们会被Event Loop所执行。

Event Loop还会处理这些回调里的一些异步请求，如网络I/O

总结一下，Event Loop执行JavaScript事件注册的回调，以及一些如网络I/O的步请求。


#### Worker Pool里执行什么任务？

Node的Worker Pool是由[libuv](http://docs.libuv.org/en/v1.x/threadpool.html)提供的，它提供了一个统一的任务提交API。

Node使用Worker Pool执行耗时任务，包括文件I/O(如果操作系统没有提供non-blocking版本的I/O的话)，以及一些特殊的高CPU耗时任务。

下面的这些API使用到了Worker Pool：

- I/O密集型
    - [DNS](https://nodejs.org/api/dns.html)：`dns.lookup()`, `dns.lookupService()`
    - [File System](https://nodejs.org/api/fs.html#fs_threadpool_usage)：除`fs.FSWatcher()`和明确使用libuv线程池之外的所有文件API

- CPU密集型
    - [Crypto](https://nodejs.org/api/crypto.html)：`crypto.pbkdf2()`, `crypto.randomBytes()`, `crypto.randomFill()`
    - [Zlib](https://nodejs.org/api/zlib.html#zlib_threadpool_usage)：除了明确使用libuv线程池之外的其他所有zlib API

在Node应用中，Worker Pool的处理对象仅有这些API。

当你在Event Loop的一个回调里执行了上述一个API，Event Loop就会使用Node C++桥，向Worker Pool提交一个任务。而调用C++的工作量相对于任务本身来说，小到可以忽略，因此Event Loop不会自己执行该任务。当给Worker Pool提交任务时，Node会C++方法提供一个指针。


#### Node如何决定接下来执行什么？

简单来说，Event Loop和Worker Pool分别为未完成的event及task设计了queue。

实际上，Event Loop并没有queue，而是持有一个文件描述符的集合，它会通过 epoll(Linux), kqueue(OSX), event ports(Solaris), or IOCP(Windows)让操作系统去监控。这些文件描述符对应着网络socket、文件等等。当操作系统通知某个文件描述符已就绪，Event Loop会将其转译为合适的事件，并触发事件回调。更多内容请见[这里](https://www.youtube.com/watch?v=P9csgxBgaZ8)。

而Worker Pool则使用了一个真实的queue，任务会被提交到queue里执行。queue中的一个Worker接受一个任务，当完成该任务时，Worker就会向Event Loop发送一个特殊事件(标明至少有一个任务完成了)。


#### 如何更好的设计Node应用？

在一个线程一个client的系统中，如Apache，每一个未完成的client都对应一个线程。如果一个线程有阻塞任务，操作系统就会将其切换，进而让其他线程执行。操作系统会保证耗时短的client请求不会被耗时长的干扰。

但因为Node仅使用了少量的线程，如果一个线程处理一个client请求时被阻塞了，后续的client请求就不会被这个线程处理，直到该线程释放出来。这意味着你不该在一个回调或任务里安排太多的工作。



## 不要阻塞Event Loop

Event Loop识别每一个client请求，并为其生成相应。所有的请求即相应都会经过Event Loop。如果Event Loop在任何一个地方被阻塞了，所有的当前client及后续的client都将无法执行。

你的回调的[时间复杂度](https://en.wikipedia.org/wiki/Time_complexity)是一个衡量标准。如果你的回调对于任何请求都执行同样的步骤和花费同样的时间，你给每个client相同(公平)的机会。如果你的回调对于不同参数执行不同步骤，你就需要仔细衡量了。

例如，常量回调：

    app.get('/constant-time', (req, res) => {
      res.sendStatus(200);
    });


O(n)回调：

    app.get('/countToN', (req, res) => {
      let n = req.query.n;

      // n iterations before giving someone else a turn
      for (let i = 0; i < n; i++) {
        console.log(`Iter {$i}`);
      }

      res.sendStatus(200);
    });


O(n^2)回调：

    app.get('/countToN2', (req, res) => {
      let n = req.query.n;

      // n^2 iterations before giving someone else a turn
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          console.log(`Iter ${i}.${j}`);
        }
      }

      res.sendStatus(200);
    });


Node用来执行JavaScript的Google V8引擎一般很快，但是正则和JSON操作会有隐患，后面会讨论。


#### REDOS阻塞Event Loop

一个常见的方式就是使用有问题的正则。我们一般认为正则需要O(n)复杂度。但一些有隐患的正则需要O(2^n)。这意味着如果需要x次计算去匹配该正则的话，则当字符个数加一的情况下需要2*x次计算。因为计算次数是与消耗时间是线性关系的，所以这会阻塞Event Loop。

预防[REDOS](https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS)：

- 不要使用类似 `(a+)*` 的嵌套匹配正则
- 不要为叠词使用or，如 `(a|aa)*`
- 避免使用回引，如 `(a.*) \1`
- 如果只是字符串匹配，使用 `indexOf`，复杂度最多O(n)

示例：

    app.get('/redos-me', (req, res) => {
      let filePath = req.query.filePath;

      // REDOS
      if (fileName.match(/(\/.+)+$/)) {
        console.log('valid path');
      }
      else {
        console.log('invalid path');
      }

      res.sendStatus(200);
    });

这个正则检测是否是一个有效的Linux路径，它是一个嵌套匹配正则。如果恶意请求使用的字符串为 `///.../\n` (100个/)，正则计算的时间将极长。


#### Node核心模块阻塞Event Loop

这几个核心库含有耗时的同步API

- Encryption
- Compression
- File system
- Child process

EncryptionCompression和涉及大量计算，File system则需要File I/O，而这些情况有可能同时出现在Child Process。详细如下：

- Encryption:
    - crypto.randomBytes (synchronous version)
    - crypto.randomFillSync
    - crypto.pbkdf2Sync

- Compression:
    - zlib.inflateSync
    - zlib.deflateSync

- File system:
    - synchronous file system APIs

- Child process:
    - child_process.spawnSync
    - child_process.execSync
    - child_process.execFileSync


#### JSON DOS阻塞Event Loop

`JSON.parse` 和 `JSON.stringify`的复杂度是O(n)，因此大值n将会非常耗时。

We create an object obj of size 2^21 and JSON.stringify it, run indexOf on the string, and then JSON.parse it. The JSON.stringify'd string is 50MB. It takes 0.7 seconds to stringify the object, 0.03 seconds to indexOf on the 50MB string, and 1.3 seconds to parse the string.

我们创建一个2^21大小的object，`JSON.stringify`将花费0.7秒将其转为一个50M长度的字符串，`JSON.parse`将花费1.3秒将其转回对象。

    var obj = { a: 1 };
    var niter = 20;

    var before, res, took;

    for (var i = 0; i < len; i++) {
      obj = { obj1: obj, obj2: obj }; // Doubles in size each iter
    }

    before = process.hrtime();
    res = JSON.stringify(obj);
    took = process.hrtime(n);
    console.log('JSON.stringify took ' + took);

    before = process.hrtime();
    res = str.indexOf('nomatch');
    took = process.hrtime(n);
    console.log('Pure indexof took ' + took);

    before = process.hrtime();
    res = JSON.parse(str);
    took = process.hrtime(n);
    console.log('JSON.parse took ' + took);

可以使用[JSONStream](https://www.npmjs.com/package/JSONStream)或[Big-Friendly Json](https://github.com/philbooth/bfj)，它们提供了异步JSON API。


#### 大计算量阻塞Event Loop

当需要大计算量工作时，有两种方式可取：

###### Partitioning

你可以拆解计算量，从而使每次执行在Event Loop的任务够小：每个任务都需要依赖后续事件的结果返回。在JavaScript中，我们很容易使用闭包来保存一个尚未执行任务状态，如下：

我们要计算1到n的平均大小，未使用拆解的算法花费O(n)：

    for (let i = 0; i < n; i++)
      sum += i;
    let avg = sum / n;
    console.log('avg: ' + avg);

拆解平均数，每一个n需要异步的O(1)：

    function asyncAvg(n, avgCB) {
      // Save ongoing sum in JS closure.
      var sum = 0;
      function help(i, cb) {
        sum += i;
        if (i == n) {
          cb(sum);
          return;
        }

        // "Asynchronous recursion".
        // Schedule next operation asynchronously.
        setImmediate(help.bind(null, i+1, cb));
      }

      // Start the helper, with CB to call avgCB.
      help(1, function(sum){
          var avg = sum/n;
          avgCB(avg);
      });
    }

    asyncAvg(n, function(avg){
      console.log('avg of 1-n: ' + avg);
    });


###### Offloading

Partitioning的工作也是由Event Loop执行的，而Offloading则是将工作交给Worker Pool。你有两种选择：

- 使用由[C++ addon](https://nodejs.org/api/addons.html)内置的Node Worker Pool。[node-webworker-threads](https://www.npmjs.com/package/webworker-threads)提供了访问Worker Pool的途径。
- 创建自己的Worker Pool而非使用Node默认的Worker Pool。可以使用Child Process或者Cluster创建。

offloading的缺点是通信成本。Worker和Event Loop之间只能通过serialize和deserialize来共享对象。


最好能区别对待计算密集型任务和I/O密集型任务，让前者使用专门的Pool而非Node自带的Worker Pool。计算密集型任务受限于CPU个数，而I/O密集型则可以使用多于CPU个数的线程数。因为大部分的I/O处理都浪费在pending/waiting状态，此时处理该I/O任务的线程被CPU挂起也无大碍。因此外部服务提供者，如database和file system已经被优化，可以处理大并发量的pending请求。

因此，对于简单的任务，如遍历有限大小数组的元素，partitioning也许就可以胜任。而offloading则更适用于复杂的计算密集型的任务：在Event Loop和Worker Pool之间传递序列化对象的通信成本会远远低于多核计算带来的收益。



## 不要阻塞Worker Pool

你应该缩减不同任务之间的耗时差异。假设你的服务器需要为一些client请求读取本地文件，你采用了 `fs.readFile()`。这是一个未partitioned的方法：它使用 `fs.read()` 读取整个文件。攻击者或许会使你读取 [`/dev/random`](http://man7.org/linux/man-pages/man4/random.4.html)，一个永远都无法完成的任务。

#### 任务partitioning

大任务同样可以拆解为小任务，小任务又进一步可以拆解。例如，你可以使用 `fs.read`(手动partitioning)或者 `ReadStream`(自动partitioned)。



## 结论

Node有两种线程：一个Event Loop和k个Workers。Event Loop处理回调及non-blocking I/O，Worker则在对应的C++代码上执行异步操作，包括blocking I/O和CPU密集型计算。所有的这些线程一次都只能处理一个任务，因此不要阻塞它们。











*[译自](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)*