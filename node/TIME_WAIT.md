## TIME_WAIT sockets

����������̫��`TIME_WAIT`״̬��socketʱ����ζ��TCP���ӿ��ܻ�ﵽ����õĶ˿����ơ���ʱ�������޷��ٴ����µ�TCP���ӡ�

Kenrel��Ϣ

    kernel: TCP: request_sock_TCP: Possible SYN flooding on port 8009. Sending cookies.  Check SNMP counters.


�����м��`TIME_WAIT`״̬��socket����

    watch -n 1 "netstat -nt | grep TIME_WAIT | wc -l"

�����ö˿�����

    cat /proc/sys/net/ipv4/ip_local_port_range


#### �������

����socket

LinuxϵͳĬ�ϻ�� 32768 �� 61000 ֮��ѡ��һ����ʱ�˿ڡ�

TCP����socket�ڹرպ󣬻���һ�β�����ʱ��(��Դδ��ȫ����)������ʹ���� `SO_REUSEADDR` ��ʶ(����ʹ�ã��ñ�ʶ��ʹTCPĳ�̶ֳ��ϲ��ɿ�)

���� `tcp_tw_reuse` ��������`TIME_WAIT`״̬��socket���� `/etc/sysctl.conf` ����룺

    net.ipv4.tcp_tw_reuse = 1



*[����](https://onlinehelp.opswat.com/centralmgmt/What_you_need_to_do_if_you_see_too_many_TIME_WAIT_sockets.html)*