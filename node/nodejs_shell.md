## 使用nodejs执行Shell或bash脚本

输出格式是缓存的、非流式的

```
const { exec } = require('child_process');
exec('ls | grep js', (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err)
  } else {
   // the *entire* stdout and stderr (buffered)
   console.log(`stdout: ${stdout}`);
   console.log(`stderr: ${stderr}`);
  }
});
```

使用promise

```
const util = require('util');
const exec = util.promisify(require('child_process').exec);
async function lsWithGrep() {
  try {
      const { stdout, stderr } = await exec('ls | grep js');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
  }catch (err)=>{
     console.error(err);
  };
};
lsWithGrep();
```

使用output stream

```
const { spawn } = require('child_process');
const child = spawn('ls', );
// use child.stdout.setEncoding('utf8'); if you want text chunks
child.stdout.on('data', (chunk) => {
  // data from the standard output is here as buffers
});
// since these are streams, you can pipe them elsewhere
child.stderr.pipe(dest);
child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```


同步执行

```
const { execSync } = require('child_process');
// stderr is sent to stdout of parent process
// you can set options.stdio if you want it to go elsewhere
const stdout = execSync('ls');
const { spawnSync} = require('child_process');
const child = spawnSync('ls', );
console.error('error', child.error);
console.log('stdout ', child.stdout);
console.error('stderr ', child.stderr);
```


## 使用nodejs执行Shell或bash文件

```
const exec = require('child_process').exec, child;
const myShellScript = exec('sh doSomething.sh /myDir');
myShellScript.stdout.on('data', (data)=>{
    console.log(data); 
    // do whatever you want here with data
});
myShellScript.stderr.on('data', (data)=>{
    console.error(data);
});
```

也可以使用 `child_process.execFile` 方法执行文件

也可以使用 [shelljs](https://github.com/shelljs/shelljs) 或者 [cli](https://github.com/node-js-libs/cli)




[译自](https://stackfame.com/run-shell-script-file-or-command-nodejs)
