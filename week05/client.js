const net = require('net');

class Request {
    constructor(options) {
        const { host, port, path, methods,headers,body } = options;
        this.host = host;
        this.port = port || 8080;
        this.path = path;
        this.methods = methods || 'GET';
        this.headers = headers || {};
        this.protocol = 'HTTP/1.1';
        if(!this.headers['Content-Type']){
            this.headers['Content-Type'] = "application/x-www-form-urlencoded"
        }
        if(this.headers['Content-Type'] === 'application/json'){
            this.body = JSON.stringify(body);
        }else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded'){
            this.body = Object.keys(body).map(item=>`${item}=${encodeURIComponent(body[item])}`).join('&');
        }
        this.headers['Content-Length'] = this.body.length;
    }
    toString(){
        return `${this.methods} ${this.path} ${this.protocol}\r
${Object.keys(this.headers).map(item=>`${item}: ${this.headers[item]}`).join('\r\n')}
\r
${this.body}`
    }
    send(){
        const client = net.createConnection({ 
            host: '127.0.0.1',
            port: 8060 
        }, () => {
            // 'connect' 监听器
            console.log('已连接到服务器');
            client.write(request.toString());
        });
        client.on('data', (data) => {
            console.log('data');
            console.log(data.toString());
            client.end();
        });
        client.on('end', () => {
            console.log('已从服务器断开');
        });
    }
}

class Response {

}

const request = new Request({
    host: '127.0.0.1',
    post: 8080,
    path: '/',
    methods: 'POST',
    headers: {
        'x-foo': "test"
    },
    body: {
        name: 'chenjunxian'
    }
})
// console.log(request.send())
request.send()

// const client = net.createConnection({ 
//     host: '127.0.0.1',
//     port: 8060 
// }, () => {
//     // 'connect' 监听器
//     console.log('已连接到服务器');

// //     client.write(`POST / HTTP/1.1\r
// // Content-Type: application/x-www-form-urlencoded\r
// // Content-Length: 1000\r
// // \r
// // a=10&b=20`);
// });
// client.on('data', (data) => {
//     console.log('data');
//     console.log(data.toString());
//     client.end();
// });
// client.on('end', () => {
//     console.log('已从服务器断开');
// });

