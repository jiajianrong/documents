# 理解tomcat NIO

在HTTP 1.1, browser和server之间的所有连接都是持久的。
持久意味着使用同一个TCP连接，接受及发送HTTP请求和相应；而非为每一对request/response 都新建一个连接。


tomcat默认的 HTTP connector 是阻塞的，并且每个连接对应一个线程。意味着100并发用户需要100线程。
这会造成线程资源的浪费，因为连接本身可能不一定频繁被使用，而是仅仅被用来keep alive，避免timeout


NIO或非阻塞connector则与此相反。该connector使用一组poller线程来为所有用户维持连接持久(connection alive)。
真正的worker线程只有在http request的data就绪后才会启动。
因此线程资源会被更好的共享利用，并且能承受更高并发。


## 配置tomcat使用 Non-blocking NIO connector 而非默认的 blocking BIO


    <Connector connectionTimeout="20000" maxThreads="1000" port="8080" 
				protocol="org.apache.coyote.http11.Http11NioProtocol" redirectPort="8443"/>




*[译自](https://dzone.com/articles/understanding-tomcat-nio) 转载请注明来自58金融前端团队*