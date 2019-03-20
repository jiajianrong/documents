## TIME_WAIT sockets

当服务器有太多`TIME_WAIT`状态的socket时，意味着TCP连接可能会达到其可用的端口限制。此时服务器无法再创建新的TCP连接。

Kenrel信息

    kernel: TCP: request_sock_TCP: Possible SYN flooding on port 8009. Sending cookies.  Check SNMP counters.


命令行检测`TIME_WAIT`状态的socket数量

    watch -n 1 "netstat -nt | grep TIME_WAIT | wc -l"

检测可用端口上限

    cat /proc/sys/net/ipv4/ip_local_port_range


#### 解决方案

重用socket

Linux系统默认会从 32768 到 61000 之间选择一个临时端口。

TCP本地socket在关闭后，会有一段不可用时间(资源未完全回收)，除非使用了 `SO_REUSEADDR` 标识(谨慎使用：该标识会使TCP某种程度上不可靠)

启用 `tcp_tw_reuse` 可用重用`TIME_WAIT`状态的socket：在 `/etc/sysctl.conf` 里加入：

    net.ipv4.tcp_tw_reuse = 1



*[译自](https://onlinehelp.opswat.com/centralmgmt/What_you_need_to_do_if_you_see_too_many_TIME_WAIT_sockets.html)*