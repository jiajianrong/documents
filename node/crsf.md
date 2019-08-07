## CSRF概念

攻击者在他们自己的网站使用如下表单去引诱用户发送post请求


```
<form action="https://my.site.com/me/something-destructive" method="POST">
  <button type="submit">Click here for free money!</button>
</form>
```

攻击者也可以采用ajax请求，例如甚至是delete方法，来伪造用户请求



## 对策


#### POST请求使用json。因为攻击者的<form>无法发送json，所以你的服务端只接受json提交就行

#### 禁用CORS。如果不得不启用CORS的话，仅仅启用`OPTIONS, HEAD, GET`这类不会造成数据更改的请求。
但禁用CORS并不能阻止表单提交(不使用JS或AJAX，所以禁用CORS无效)

#### 检测referrer。尽管referrer不那么有效，但是如果请求的referrer明确不为你的域名，返回403就行

#### 确保GET请求不更改数据(库)

#### 不要用POST方法。因为<form>表单只能用POST或GET，如果你选择了PUT/PATCH/DELETE的话，可被伪造的方法就减少了

#### 最终办法是使用CSRF token，有如下几步：

- 服务端发给客户端一个token
- 客户端提交请求的时候，带上该token
- 服务端校验该token

为了完成请求伪造，攻击者不得不从你的服务器获取该token，而他们必须只能用JS去获取。
所以如果你的服务器禁用CORS的话，攻击者就没办法拿到token了。

一定要确保该token不能被直接请求获取到，比如创建一个 `/getCsrf` 的路由。更不要在该路由支持CORS

token也不能被轻易猜到




## 误用示例


###### 在JSON AJAX请求中添加token

如上所述，如果服务端禁用CORS并且所有接口都只接受是JSON的话，那么一定没必要为请求添加token

###### 将获取token暴露在请求接口中

千万不要创建一个 `/csrf` 的GET请求暴露token，更不要为其启用CORS



[译自](https://github.com/pillarjs/understanding-csrf)
* 58金融前端 *










