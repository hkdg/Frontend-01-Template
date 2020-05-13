const http = require('http');
const server = http.createServer('127.0.0.1',(req, res) => {
    // console.log(res);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
}).listen(8060);