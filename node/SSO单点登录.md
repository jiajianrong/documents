## SSO在nodejs KOA服务端的流程

#### 简单描述流程如下

- 用户请求url(https://domain.com/path/?query)，koa中间件做下列处理
- 判断redis中是否存在：session.user。存在则退出该中间件：next()；不存在则继续
- 判断url.query.ticket是否存在。不存在则302到OA登录页，结束koa；存在则继续
- 向CAS server发请求判断ticket是否有效。有效则解析response生成user信息并写入redis：session.user，并302到原始url，结束koa；无效返回Err Json给用户，结束koa

其中OA登录页成功则将ticket拼入用户原始url：(https://domain.com/path/?query&ticket=aaa)，并302到此url；失败则继续停留在登录页



如图

![](https://github.com/jiajianrong/MarkdownPhotos/blob/master/sso/sso.jpg?raw=true)


- step1： 建立session (koa-generic-session)

    app.use(session({
        // cookie key
        key: 'cookie_key',
        // redis key
        prefix: 'cookie_key_redis:',
        //由于代理服务器会直接pipe走用户请求，无法在这之后再修改ctx.headers
        //rolling: true,
        //ttl: 1000 * 3600 * 24,
        store: redisStore(REDIS_SERVER),
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 1000 * 3600 * 24 * 30, //30 days in ms
            overwrite: true,
            signed: true
        },
    }));

 

- step2：验证登录态 (wm-sso.authSession)

    app.use(authSession);


- 首先判断session.user是否存在，存在则说明用户已登录，直接退出中间件

    let sessionUser = ctx.session.user;
    if (sessionUser) {
        await next();
        return ;
    }


- 接下来去cas服务器校验

    // 重定向到CAS服务器登录（其实不是一定会重定向cas页面）
    let authResult = await cas.authenticate(ctx);


- 成功后从authResult获取用户信息，存入redis；并302到无url.query.ticket的页面(service参数)

    ctx.session.user = user;
    return ctx.redirect(service);

 
- 在cas.authenticate()里判断是否有query.ticket，有的话cas.validate；没有的话将页面请求302到passport登录页


- cas.validate会发请求到cas服务器判断

    // 有 ticket!
    if (ticket) {
        // 现在用CAS服务器验证它
        let res = await this.validate(ticket, service)
        return res
    } else {
        ctx.redirect(redirectURL)
    }


- passport页面会判断自己域名下的cookie是否有效，有效的话302到来源页(service参数)；无效的话200出oa登录页html




*58金融原创，转载请注明