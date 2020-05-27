const http = require('http');
const server = http.createServer('127.0.0.1',(req, res) => {
    console.log(req.headers);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okthththsfbshfgsdfsgsgsrgshfghrtrthhhhrtrhrhhrertsgsdgsbhhwtgwetteteterrtjtjkyukyuk');
}).listen(8060);