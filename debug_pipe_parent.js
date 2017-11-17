process.stdout.write('proc.stdout on parent')

var fork = require('child_process').fork
var spawn = require('child_process').spawn



// spawn
//var p = spawn('node', ['--inspect-brk=9226', './debug_pipe_child.js'])
//var p = spawn('node', [ './debug_pipe_child.js'])
//p.stdout.on('data', data=>console.log(`stdout: ${data}`)  )
//p.stdout.pipe(process.stdout)

//spawn('node', ['./debug_pipe_child.js'], {stdio:[0,1,2]})



// fork
//process.execArgv = ['--inspect-brk=9226']
//fork( './debug_pipe_child.js', [], {execArgv: ['--inspect-brk=9226']} );


