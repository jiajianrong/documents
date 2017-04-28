# WebSocket链接的负载均衡解决方案

######Load Balancing Websocket Connections######


Websocket做负载均衡很困难。毕竟http诞生了快30年了，我们有足够的时间去沉淀一套完善的解决框架。可是Websocket仅仅在2011年成为标准。


##Websocket有什么问题？##

并发量。

传统的负载均衡方案应对的是一个立即返回相应的“短命”请求。这意味着即使是一个每分钟百万请求（每个请求花费10ms完成）的站点，只要并发量在200以下，服务器都可以轻松应对。

Websocket却是“持久”连接 - 意味着大量连接是同时开启着的，这会带来一些挑战：

**文件描述符限制**

操作系统使用文件描述符操作文件、连接等。每当负载均衡服务器代理一个连接，它就会创建两个描述符 - 一个用来读一个用来写。

每个文件描述符都会消耗内存。业内的准则是每4MB RAM可以有256个描述符。所以8GB内存的负载均衡系统支持大概50万个并发连接。


**临时端口限制**

每当负载均衡server连接到后台业务server，它都会使用一个临时端口。理论上可以使用65535个端口，但是大多数现代的Linux系统会限制大约一半的端口。最要命的是这些端口在使用之后不会自动回收（注：传统http请求由于生命周期极短，不存在此问题）。相反这些端口进入一个[TIME_WAIT state](http://www.isi.edu/touch/pubs/infocomm99/infocomm99-web/)来确保不会丢包。这种状态能持续长达一分钟，严重影响了可用端口数量。


**多协议请求的session分配限制**

绝大部分双向连接技术，如socket.io或SignalR，为了兼容不支持Websocket的浏览器，通常都会混合使用Websocket和HTTP长轮询（降级）。而HTTP请求会帮助防火墙和网关处理随后的Websocket请求。

问题是HTTP请求和Websocket请求都需要被负载均衡到同一业务server（也叫sticky sessions）。通常有两种方式可以满足这个要求，但各自都有一些问题。

- **IP-Hash** 根据请求签名来计算出hash。这一方法简单，并且在分发请求时保持了stateless特征，缺点是有点粗糙。如果一个大公司的内部网络都在唯一的一个网关后，那么该公司所有的请求都会被当做一个客户端IP，从而路由到了同一台业务server。

- **cookie injection** 会给HTTP请求和Websocket请求都添加一个cookie。这意味着所有的负载均衡server都要共享同一份cookie-to-backendServer数据映射表。同时也要求负载均衡server同时是一台SSL-Termination（注：即要求负载均衡server解码SSL连接并route解码后的连接）



##解决方案##

**DNS负载均衡**

DNS拥有极多的domain-ip关系映射。一个domain或subdomain可以被映射到不同IP，DNS再将请求以round-robin的方式路由出去.

优点是DNS可扩展性极好，几乎不用去维护就可以达到负载均衡。

缺点是DNS负载均衡非常基础，不提供性能监控、SSL解析、也不支持应用复杂的均衡算法二次路由。DNS文件也被深度缓存，所以有改动的话需要一些时间。

**网络层负载均衡**

在DNS之后，最快最有强大的是网络层负载均衡。它通常都会用刀锋服务器实现。但是现在我们把这种任务交给AWS之类的去做。

**应用层负载均衡**

应用层负载均衡是最简单并且可扩展性是最好的，如Nginx。

优点是大部分解决方案能提供health-check、SSL-Termination、cookie-injection、IP-Hash。

缺点是连接的并发数：应用层负载均衡/反向代理都run在唯一的一台server上，因此受限于文件描述符和临时端口号限制，并且非常消耗资源。并发连接数的物理限制导致负载均衡存在扩展性瓶颈。

**Orchestrator方式**

使用Orchestration server则提供一种和传统的负载均衡概念不同方式。它维护一系列业务节点，执行cluster管理。最顶层则是维护业务server的外部URL，并且提供一系列HTTP API给客户端调用，进而直连到业务server。

Orchestration server是依赖cluster概念，如[Zookeeper](https://zookeeper.apache.org/)。

优点是扩展性非常好。Orchestration server给客户端提供获取业务server的HTTP API。而这一API则非常轻量并且可以使用传统负载均衡策略。既然客户端可以直连到业务server，就不存在连接并发限制，也不用考虑inject cookie及其他session一致性的工具。

缺点是每一个业务server缺乏统一连接功能。对应TCP服务来说，每个server需要一个专有IP，也缺乏负载均衡层的保护。



##结论##

最好的策略是随机应变。所有的负载均衡策略都可以处理中小型需求，但是对于大规模应用，最好是混用这些方案。

最常见的方案是：一个应用层的负载均衡代理一组业务server。DNS进而将请求路由到不同的应用层负载均衡server。


![best](https://github.com/jiajianrong/MarkdownPhotos/blob/master/node-steps/dsn-load-balancer.png)



Orchestration server / 业务server分配 方案则是另一种理念，它便于大规模开发及高效管理资源，但是需要大量定制化工作。云提供商可以帮你解决许多工作，但是对于大规模的Websocket支持工作仍未成型。




*[原文出处](https://deepstream.io/blog/load-balancing-websocket-connections/)
转载请注明来自58金融前端团队*



