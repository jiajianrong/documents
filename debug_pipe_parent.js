console.log('parent')
process.stdout.write('proc.stdo')

var fork = require('child_process').fork
var spawn = require('child_process').spawn



// spawn
//var p = spawn('node', ['--inspect-brk=9226', './child.js'])
//p.stdout.on('data', data=>console.log(`stdout: ${data}`)  )
//p.stdout.pipe(process.stdout)

//spawn('node', ['./child.js'], {stdio:[0,1,2]})

// fork
//process.execArgv = ['--inspect-brk=9226']
//fork( './child.js', [], {execArgv: ['--inspect-brk=9226']} );


