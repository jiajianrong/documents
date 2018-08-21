*本文译自[Nginx官方文档](https://www.nginx.com/blog/tuning-nginx/)，转载请注明来自58金融前端团队*

NGINX以其负载均衡、缓存、web服务器而闻名于世。对于大部分用户来说，Nginx及Linux的默认配置已经足够，但本文讲述少数一些参数及其优化手段。我们将会从一些Linux参数说起，这些参数会影响一些Nginx参数。


## Linux调参

现代的Linux kernels (2.6+)参数配置已经适用于大多数应用场景了，不过调整其中一些的值仍然能提升性能。我们可以通过检查内核错误日志是否
提示某个参数设置的太低，然后将其调高一点。这里我们只讲述最常见的一些参数。


#### Backlog Queue

下面这两个参数涉及到Connection队列。如果接收的Connection很多，但其中一些明显相应较慢(即性能不均衡)，可以考虑改变他俩：

- `net.core.somaxconn` – Nginx等待接收的connection的最大个数。因为Nginx能够非常快速的接收connection，所以它的默认值非常低。当站点服务器负担很大时，非常值得提高该参数值。如果内核错误日志标明了该值太小，可以大胆提高到错误日志不再出现。

Note：如果该值大于512，需要同时调高Nginx [listen](http://nginx.org/en/docs/http/ngx_http_core_module.html#listen) 指令的 `backlog` 参数。

- `net.core.netdev_max_backlog` – 网卡在将包流量提交给CPU之前，能够缓存的上限。在高带宽的机器上提高该参数值可以提升性能。检查关于该参数的内核错误日志，并依据网卡使用文档，适当调整该值。


#### File Descriptors

操作系统使用文件描述符来代表connection或打开的文件等等。Nginx为每一个connection使用两个文件描述符，一个面向client，一个面向upstream server。不过如果 `HTTP keepalive` 启用的话，面向upstream server端的文件描述符个数降大幅降低。如果一个系统需要承担大量connection的话，可以考虑调高下面两个参数：

- `sys.fs.file_max` – 系统级的文件描述符个数限制
- `nofile` – 用户级的文件描述符个数限制, 在 `/etc/security/limits.conf` 文件里设置


#### Ephemeral Ports

Nginx提供反向代理服务时，每一个到upstream server的connection都需要一个临时端口。可以通过这一参数设置其范围：

- net.ipv4.ip_local_port_range – 通常可以设置为1024到65000



## Nginx调参

下面的几个参数适合用户自行调高。


#### Worker Processes

Nginx能够使用多个工作进程，每个都可以处理大数量的并发connection。下面两个指令可以调整其个数，及其处理connection的方式。

- [worker processes](http://nginx.org/en/docs/ngx_core_module.html#worker_processes) – Nginx worker process的个数(默认值为1)。推荐使用 `auto` 值来实现一个CPU一个worker process的配置。在worker process需要处理大量磁盘 I/O时，可以增加work process个数

- [worker_connections](http://nginx.org/en/docs/ngx_core_module.html#worker_connections) – 每一个worker process能够处理的最大并发connection数量。默认值为512，但是大多数系统有足够的资源支持一个更大值。服务器硬件配置及流量特征会对该参数起决定作用，可以通过测试计算出合适的值


#### Keepalive Connections

[Keepalive Connections](https://www.nginx.com/blog/http-keepalives-and-web-performance/) 能够显著降低用于打开关闭connection的CPU和网络资源。Nginx响应了client的connection，然后创建了新的到达upstream server的connection。Nginx对于client和upstream都支持keepalive。


调整client端keepalive的指令：

- [keepalive_requests](http://nginx.org/en/docs/http/ngx_http_core_module.html#keepalive_requests) – 一个client可以通过一个keepalive connection发起的最大请求数。默认值是100。当使用压力测试时，会通过一个client发送大量请求，因此提高该值将有助于提高压测峰值

- [keepalive_timeout](http://nginx.org/en/docs/http/ngx_http_core_module.html#keepalive_timeout) – 设置闲置状态的keepalive connection存活时间


调整upstream端keepalive的指令：

- [keepalive](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive) – 每一个worker process面向upstream server的闲置keepalive connection的个数。没有默认值。


为了能使upstream端keepalive起作用，还需下面两个指令：

[proxy_http_version](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version) 1.1;
[proxy_set_header](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header) Connection "";



#### Access Logging

为每个请求记录日志，会消耗CPU和I/O资源。可以使用access-log缓存来降低该消耗。Buffer可以避免每次请求都执行一次写操作。Nginx可以缓存一组日志并将其一次写入文件。

[access log](http://nginx.org/en/docs/http/ngx_http_log_module.html#access_log)指令可以指定 `buffer=size` 和 `flush=time`。也可以通过 `off` 参数关闭日志记录。


#### Sendfile

操作系统的 `sendfile()` 方法将数据从一个文件描述符拷贝到另一个。该方法经常能实现zero-copy，可以用来加速TCP数据传输。[sendfile](http://nginx.org/en/docs/http/ngx_http_core_module.html#sendfile)指令可以被用在 `http` 或 `server` 或 `location` 上下文。Nginx能够将缓存或或硬盘内容直接写到socket里，而不用切换上下文到user space，因此即快速又消耗更少的CPU。


#### Limits

可以设置如下指令，以避免client消耗太多资源：


- [limit_conn](http://nginx.org/en/docs/http/ngx_http_limit_conn_module.html#limit_conn) 和 [limit_conn_zone](http://nginx.org/en/docs/http/ngx_http_limit_conn_module.html#limit_conn_zone) – 设置Nginx接收client connection的个数上限，例如针对单一IP地址。设置这些可以避免某一个client占用过多connection

- [limit_rate](http://nginx.org/en/docs/http/ngx_http_core_module.html#limit_rate) – 限制对单一client的每个connection响应的数据量(如果一个client和Nginx有多个connection的话，这个值代表对每个connection的限速)。设置这个可以避免系统被某一client过度占用。

- [limit_req](http://nginx.org/en/docs/http/ngx_http_limit_req_module.html#limit_req) 和 [limit_req_zone](http://nginx.org/en/docs/http/ngx_http_limit_req_module.html#limit_req_zone) – 限制了Nginx处理请求的频率，效果类似 `limit_rate`。这两个配置可以提高应用的安全性，特别是登录页面，设置请求频率为一个合理的值满足用户手动输入消耗的时间，比如2秒，但是对于程序执行(像DDoS)提交又太慢

- [max_conns](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#max_conns) 参数(该指令作用于upstream) – 设置upstream群能接收到的最大并发connection个数。设置这个值可以避免upstream服务器负载过高。默认值为0(无限制)。

- [queue](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#queue) (NGINX特有) – 设置一个queue临时放置请求，仅当upstream群里的所有服务器都都达到 `max_conns` 限制。`queue` 指令设置了queue里存放请求数的最大值，以及(可选)最久可以存放多长时间(默认60秒)，超过该时间请求将直接返回错误信息。如果没有设置 `queue` 指令的话，Nginx将不会创建queue并存放请求。



## Caching

Nginx可以将response缓存至硬盘，并用以直接向后续client返回，而不用再代理请求。[详见](https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/)



## Compression

尽管压缩过程会占用CPU，但它能够大幅降低带宽。注意不要压缩本来已经压缩过的对象，如JPEG。[详见](https://www.nginx.com/resources/admin-guide/compression-and-decompression/)。

























