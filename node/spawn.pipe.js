var spawn = require('child_process').spawn;
var install = spawn(
	'npm',
	['install', '-d', '--prefer-online', '--registry=https://registry.npm.taobao.org'],
	{
		//cwd: __dirname,
		shell: true, //only 4 windows
	}
);

install.stdout.on('data', (data) => {
    console.log(data.toString());
});


install.stderr.on('data', (data) => {
    console.log(data.toString());
});

install.on('close', (code) => {
    console.log('read all!' + code);
});
install.on('error', (e) => {
    console.log(e);
});
//