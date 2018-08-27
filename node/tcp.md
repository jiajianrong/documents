## 正常TCP建连接三次握手过程：

![](https://github.com/jiajianrong/MarkdownPhotos/blob/master/tcp/tcp-typical-3-hand-shake.png?raw=true)


- 第一步：client 发送 syn 到server 发起握手；
- 第二步：server 收到 syn后回复syn+ack给client；
- 第三步：client 收到syn+ack后，回复server一个ack表示收到了server的syn+ack（此时client的56911端口的连接已经是established）



#### tcp_abort_on_overflow

tcp_abort_on_overflow为0表示如果三次握手第三步的时候全连接队列满了那么server扔掉client 发过来的ack（在server端认为连接还没建立起来）

为了证明客户端应用代码的异常跟全连接队列满有关系，我先把tcp_abort_on_overflow修改成1，1表示第三步的时候如果全连接队列满了，server发送一个reset包给client，表示废掉这个握手过程和这个连接（本来在server端这个连接就还没建立起来）。

接着测试然后在客户端异常中可以看到很多connection reset by peer的错误，到此证明客户端错误是这个原因导致的。


简单来说TCP三次握手后有个accept队列，进到这个队列才能从Listen变成accept，默认backlog值是50，很容易就满了。满了之后握手第三步的时候server就忽略了client发过来的ack包（隔一段时间server重发握手第二步的syn+ack包给client），如果这个连接一直排不上队就异常了。


## 深入理解TCP握手过程中建连接的流程和队列

![](https://github.com/jiajianrong/MarkdownPhotos/blob/master/tcp/tcp-sync-queue-and-accept-queue.jpg?raw=true)

如上图所示，这里有两个队列：syns queue(半连接队列）；accept queue（全连接队列）

三次握手中，在第一步server收到client的syn后，把相关信息放到半连接队列中，同时回复syn+ack给client（第二步）；


> 比如syn floods攻击就是针对半连接队列的，攻击方不停地建连接，但是建连接的时候只做第一步，第二步中攻击方收到server的syn+ack后故意扔掉什么也不做，导致server上这个队列满其它正常请求无法进来


第三步的时候server收到client的ack，如果这时全连接队列没满，那么从半连接队列拿出相关信息放入到全连接队列中，否则按tcp_abort_on_overflow指示的执行。

这时如果全连接队列满了并且tcp_abort_on_overflow是0的话，server过一段时间再次发送syn+ack给client（也就是重新走握手的第二步），如果client超时等待比较短，就很容易异常了。




## 如果TCP连接队列溢出，有哪些指标可以看呢？


#### netstat -s

    [root@server ~]#  netstat -s | egrep "listen|LISTEN" 
    667399 times the listen queue of a socket overflowed
    667399 SYNs to LISTEN sockets ignored

比如上面看到的 667399 times ，表示全连接队列溢出的次数，隔几秒钟执行下，如果这个数字一直在增加的话肯定全连接队列偶尔满了。


#### ss

    [root@server ~]# ss -lnt
    Recv-Q Send-Q Local Address:Port  Peer Address:Port 
    0        50               *:3306             *:*


上面看到的第二列Send-Q 表示第三列的listen端口上的全连接队列最大为50，第一列Recv-Q为全连接队列当前使用了多少

全连接队列的大小取决于：min(backlog, somaxconn) . backlog是在socket创建的时候传入的，somaxconn是一个os级别的系统参数

半连接队列的大小取决于：max(64, /proc/sys/net/ipv4/tcp_max_syn_backlog)。 不同版本的os会有些差异




## 实践验证下上面的理解

把java中backlog改成10（越小越容易溢出，默认50），继续跑压力，这个时候client又开始报异常了，然后在server上通过 ss 命令观察到：

    Fri May  5 13:50:23 CST 2017
    Recv-Q Send-QLocal Address:Port  Peer Address:Port
    11         10         *:3306               *:*

按照前面的理解，这个时候我们能看到3306这个端口上的服务全连接队列最大是10，但是现在有11个在队列中和等待进队列的，肯定有一个连接进不去队列要overflow掉



## 容器中的Accept队列参数

Tomcat默认短连接，backlog（Tomcat里面的术语是Accept count）Ali-tomcat默认是200, Apache Tomcat默认100，nodejs默认511，Nginx默认511。

nodejs默认值在 `net.js` 的 `Server.prototype._listen2` 方法中：

    // Use a backlog of 512 entries. We pass 511 to the listen() call because
    // the kernel does: backlogsize = roundup_pow_of_two(backlogsize + 1);
    // which will thus give us a backlog of 512 entries.
    var err = this._handle.listen(backlog || 511);




## 进一步思考

如果client走完第三步在client看来连接已经建立好了，但是server上的对应连接实际没有准备好，这个时候如果client发数据给server，server会怎么处理呢？（有同学说会reset，还是实践看看）

![](https://github.com/jiajianrong/MarkdownPhotos/blob/master/tcp/tcp-typical-3-hand-shake.png?raw=true)

如上图，150166号包是三次握手中的第三步client发送ack给server，然后150167号包中client发送了一个长度为816的包给server，因为在这个时候client认为连接建立成功，但是server上这个连接实际没有ready，所以server没有回复，一段时间后client认为丢包了然后重传这816个字节的包，一直到超时，client主动发fin包断开该连接。

这个问题也叫client fooling，可以看[这里](https://github.com/torvalds/linux/commit/5ea8ea2cb7f1d0db15762c9b0bb9e7330425a071)

从上面的实际抓包来看不是reset，而是server忽略这些包，然后client重传，一定次数后client认为异常，然后断开连接。







*[转自](https://blog.csdn.net/zlfing/article/details/75252312)*














