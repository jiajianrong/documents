# react router V4 集成 ant-design V3 - 路由方案

antd被普遍使用到后台管理系统，一般左侧为antd的Menu及Menu.Item的目录栏，而每一个Menu.Item里则放入一个react-router的<Link>，如下：

#### index.js

	<Router>
		<App/>
	</Router>


#### App.js

	<Sider collapsible>
        <Menu theme="dark" 
            defaultSelectedKeys={['/']}
            >
            <Menu.Item key="1">
                <Icon type="reload" />
                <span>首页</span>
                <Link to="/"></Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Icon type="pie-chart" />
                <span>对账管理</span>
                <Link to="/ChannelCharge"></Link>
            </Menu.Item>
            <Menu.Item key="3">
                <Icon type="desktop" />
                <span>计费管理</span>
                <Link className="ui-menu" to="/CustomerCharge"></Link>
            </Menu.Item>
        </Menu>
    </Sider>


	<Switch>
        {/* 首页 */}
		<Route exact path="/" component={Home}/>
        {/* 对账管理 */}
        <Route path="/ChannelCharge" component={ChannelCharge}/>
        {/* 计费管理 */}
        <Route path="/CustomerCharge" component={CustomerCharge}/>
    </Switch>



## 问题

- 触发浏览器后退或前进键，location和页面都正确相应，但Menu.Item未能(选中态还是上一个Item)
- 页面刷新后，location和页面都正确相应，但Menu.Item未能(无Item选中)


## 分析

当浏览器前进后退，或者刷新时，<Router>组件会使其之内的<Route>组件 按照location正确显示出来。但是此时Menu.Item的更新是缺失的

因此需要在location变化之后，以及<App>加载后(刷新时)，触发Menu.Item更新选中态

antd为Menu提供了 `selectedKeys` 修改选中Item的key值。我们只需要在浏览器前进后退及刷新时，修改这个值即可

那么如何识别浏览器前进后退呢？ react-router 为 <Route>组件注入了几个常用的props，包含`match, location, history`。每次路由变化时，location prop也会变化，因此在<Route>组件的更新生命周期的任何方法，都可以得到当前的`location.pathname`，然后做适当适配即可赋值给<Menu>的`selectedKeys`属性


## 解决

#### index.js

需要修改原有的 `<App/>` 写法，为 App 组件提供必须的 `props: {match, location, history}`

	<Router>
		<Route component={App}/>
	</Router>


####App.js

关键点在于Menu.Item的key值 要和 props里的location.pathname值 对应起来，这样在路由变化时，直接将后者少许变换即可赋值给前者

这里采用了一级路由相同，即认为是同路由，大大简化了匹配计算过程

	
	let totalPath = this.props.location.pathname
    let prefixPath = totalPath.match(/^\/[^/]*/)[0]

	<Sider collapsible>
        <Menu theme="dark" 
            defaultSelectedKeys={['/']}
            mode="inline"
            selectedKeys={[prefixPath]}
            >
            <Menu.Item key="/">
                <Icon type="reload" />
                <span>首页</span>
                <Link to="/"></Link>
            </Menu.Item>
            <Menu.Item key="/ChannelCharge">
                <Icon type="pie-chart" />
                <span>对账管理</span>
                <Link to="/ChannelCharge"></Link>
            </Menu.Item>
            <Menu.Item key="/CustomerCharge">
                <Icon type="desktop" />
                <span>计费管理</span>
                <Link className="ui-menu" to="/CustomerCharge"></Link>
            </Menu.Item>
        </Menu>
    </Sider>


其余代码无需变化，仅仅几行代码即可解决问题(包括浏览器前进后退及刷新)








*原创，转载请注明来自58金融前端团队*