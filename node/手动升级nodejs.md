## Window10升级node v8到v10


最近在windows上将node v8升级到了比较新的v10.16.3，记录一下操作流程，以备后用


我安装node都是下载node.zip文件，然后手动解压，所以这里的操作仅局限于zip安装方式



#### Step1 下载并解压 `node-v10.16.3-win-x64.zip` 到 `C:\node-v10.16.3-win-x64`

#### Step2 设置或添加环境变量 `NODE_PATH` 和 `path` 为 `C:\node-v10.16.3-win-x64`

#### Step3 执行 `npm config set registry https://registry.npm.taobao.org` 切换到淘宝源

#### 最后确认用户目录下的 `.npmrc` 文件正确；并且执行 `npm config get cache` 和 `npm config get prefix` 和 `npm config get tmp` 和 `npm config ls` 确认正确


