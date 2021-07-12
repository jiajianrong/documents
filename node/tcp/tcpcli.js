var client = new require('net').Socket();
client.connect(80, '127.0.0.1', function() {
    client.write('Client ' + Math.random());
}).on('data', function(data) {
    console.log('DATA: ' + data);
    //client.destroy();
});


