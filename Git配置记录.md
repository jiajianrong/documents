## Git的两种传输方式

1. Http/Https
1. SSH

在项目目录的.git子目录里config文件里修改

```
[remote "origin"]
    url = git@github.com:jiajianrong/documents.git
```

也可以用如下命令修改
（[Git官方文档](https://help.github.com/en/github/using-git/changing-a-remotes-url#switching-remote-urls-from-https-to-ssh)）

```
$ git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```






## SSH传输方式的配置




#### 在Client(或笔记本)上，生成SSH公钥私钥

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

除非改名，默认一般会生成id_rsa文件和id_rsa.pub文件




#### 在Client(或笔记本)上，拷贝并配置公钥到Github或Gitlab上

本步骤类似从一台Client机器免密登录到一台Server机器的步骤一样，
使Git服务器或Server机器信任Client。
需要在Server的~/.ssh目录里创建authorized_keys文件，
并把上一步生成的id_rsa.pub的内容复制到authorized_key里，
然后执行：

```
chmod 600 ~/.ssh/authorized_key
```



#### 在Client(或笔记本)上，移动公钥私钥到~/.ssh/目录

如果在~/.ssh/目录里已经有了名为id_rsa和id_rsa.pub的文件的话，
需要重命名刚刚生成的id_rsa和id_rsa.pub文件(或者重新生成另一个名字)。
为了区分用来登录不同服务器的多组公钥私钥，
在~/.ssh/目录里创建文件config，配置内容如下：

```
# github.com
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile C:/Users/jiajianrong/.ssh/id_github_rsa
User jiajianrong

# igit.59corp.com
Host igit.59corp.com
HostName igit.59corp.com
PreferredAuthentications publickey
IdentityFile C:/Users/jiajianrong/.ssh/id_rsa
User jiajianrong
```



#### 此时所有配置步骤已完成

可以在Client端向Git Server以SSH的方式免密提交(push)。
此时完整目录结构如下：

```
~/
    .gitconfig
    .ssh/
        config
        id_rsa
        id_rsa.pub
```

作为Client端，我们已经完成了Server端对我们的认证。
但我们还需要保证Server端传来的数据是可靠的，
因此也要在Client认证Server。


这个一般是Client端在第一次请求到Server时，Server会把自己公钥传给Client。
(这里由于没有Https的官方认证，只能这么搞)

Client接收到Server的公钥后，将其存在~/.ssh/目录的known_hosts文件里。
也就完成了Client对Server的认证。



----




## Git提交信息的配置

即可以全局配置，也可以为每个项目单独配置。


#### 全局配置

在~/目录下创建.gitconfig文件，配置内容如下：

```
[user]
    name = jiajianrong
    email = jiajianrong@59.com
```


#### 为单个项目配置

在项目目录的.git目录下，配置内容如下：

```
[core]
    repositoryformatversion = 0
    filemode = false
    bare = false
    logallrefupdates = true
    ignorecase = true
[remote "origin"]
    url = git@github.com:jiajianrong/documents.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master
[user]
    name = jiajianrong
    email = 16446358@qq.com
```

