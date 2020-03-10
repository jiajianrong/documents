## 记录一次小程序内嵌网页调试

疫情期间在家开发小程序，里面有个web-view指向公司的某个oa内部网页。

小程序SSO过程是调用集团SSO小程序，登录成功后返回给我的小程序一些token，
后续从我的小程序所发出的所有的请求，都在cookie里加上这些token。
（注：小程序貌似没有默认的setCookie之类的API，
需要自己实现一个cookie的setter/getting并存到小程序的LocalStorage中）

凡是cookie里加了这些token的请求，集团Nginx层会校验并通过，然后反向代理到我的node服务器。
（注：这里集团运维还是非常严格和规范，不管公司内网还是外网的请求，Nginx都会默认拦截）

web下的背景是这样：假设集团的内网办公系统的一级域名是69corp.com。
具体的各办公系统的二级域名都类似这样：a.69corp.com；b.69corp.com。
69corp.com域名的前置Nginx层会判断一个请求的cookie上是否携带了上面所的token。
是的话则放行；否的话直接把请求302到统一的SSO登录页（根本不管这个请求是ajax还是普通页面）。
输入oa账号密码及盾密码（类似插入工行U盾），登录成功时，
集团SSO服务器会给69corp.com的cookie设置上述的token（以便下一次请求的校验），然后302回原请求。
这样下一次的请求的cookie会自动带上这些token，顺利通过Nginx的校验。

实际操作中，SSO登录成功，SSO服务器将用户请求302回去时，还在url中带了一个ticket。
期望业务服务器（我这里是nodejs）将这个ticket发送到SSO提供的鉴权服务去校验。
（注：讲真我不明白校验为啥要单独搞个ticket，其实直接用cookie就可以了）
校验成功后业务服务器将url再次302到原始url（不带ticket的），且设置业务cookieID，且同步在redis里。
这样下次这个用户的请求再来的时候，业务服务器就知道他已经登录了。


上述的都是web浏览器的情况。然而小程序又有所不同。
因为先登录的是业务小程序，业务小程序依靠LocalStorage里的cookie去判断自身是否已登录业务服务器。
如一开始所述，没有登录的话先调起集团SSO小程序登录，然后再把后者返回的token存到LocalStorage中。
后面再有小程序的请求都会在cookie里带着这些token。

而业务服务器（我这里用了和web同一个的nodejs服务）拿到这些token后，和web端的逻辑一样，
也是先去小程序SSO鉴权服务那边校验token。
通过校验的话，我这里选择了给小程序颁发和web端一致的业务cookieID，且同步在redis里。
后续业务小程序的所有请求里既需要带着SSO颁发的token cookie去通过Nginx，
也需要带着业务服务器颁发的cookieID向业务服务器证明身份。


最后是小程序里内嵌webview网页的情况。
因为此时小程序已经是登录态了，所以我们其实只需要把小程序的登录态同步到webview就可以。
但这里有个麻烦的地方，不像native一样，小程序API里没有提供操作webview的cookie方法。
没有cookie，webview里的请求连Nginx都过不了，也就更到不了业务服务器了。

所以这里只能为我们的业务系统（假设为hello.69corp.com）又申请了一域名。
新域名（假设为hello.69.com）的一级域名直接为69.com，不再受69corp.com的Nginx的拦截。

小程序调起webview的新域名第一个页面时，会把自身的cookie追加到页面url的参数里。
（注：我们没办法修改页面请求的header，就只能修改请求url本身了）
这些cookie可以帮住这个页面（新域名第一个页面）的请求通过Nginx校验和业务服务器校验。

然后在新域名的业务服务器（还是之前的nodejs）里的首页路由里监听该页面get请求的参数。
如果业务cookieID校验没问题的话，将页面请求302回不带参数的原页面地址。
同时最关键的是，在302响应头里为页面请求设置cookie，值就是url里的参数。
这样该页面下一次的请求就会自动带上cookie，且自动通过Nginx和业务服务器的校验。
从而达到小程序把自身登录态同步给webview的功能。


另外，其实还有一个必须新申请域名的原因，
就是小程序里内嵌webview时，该webview的域名必须被微信服务端直接访问到。
而hello.69corp.com的Nginx会拦截所有请求。但新的hello.69.com可以配置不拦截。

