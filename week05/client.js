const net = require('net');

class Request {
    constructor(options) {
        const { host, port, path, methods, headers, body } = options;
        this.host = host;
        this.port = port || 8060;
        this.path = path;
        this.methods = methods || 'GET';
        this.headers = headers || {};
        this.protocol = 'HTTP/1.1';
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = "application/x-www-form-urlencoded"
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.body = JSON.stringify(body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.body = Object.keys(body).map(item => `${item}=${encodeURIComponent(body[item])}`).join('&');
        }
        this.headers['Content-Length'] = this.body.length;
    }
    toString() {
        return `${this.methods} ${this.path} ${this.protocol}\r
${Object.keys(this.headers).map(item => `${item}: ${this.headers[item]}`).join('\r\n')}
\r
${this.body}`
    }
    send() {
        return new Promise((resolve, reject) => {
            const responseParse = new ResponseParse();
            const client = net.createConnection({
                host: this.host,
                port: this.port
            }, () => {
                // 'connect' 监听器
                console.log('已连接到服务器');
                client.write(this.toString());
            });
            client.on('data', (data) => {
                console.log(JSON.stringify(data.toString()));
                
                responseParse.receive(data.toString());
                if(responseParse.isFinish){
                    resolve(responseParse.response);
                }
                // client.end();
            });
            client.on('error', (err) => {
                console.log('err');
                reject(err);
            });
            client.on('end', () => {
                console.log('已从服务器断开');
            });
        })

    }
}

class Response {

}

class ResponseParse {
    constructor() {
        this.WAITING_STATUS_LINE_START = 1;
        this.WAITING_STATUS_LINE_END = 2;
        this.WAITING_HEADER_NAME = 3;
        this.WAITING_HEADER_SPACE = 4;
        this.WAITING_HEADER_VALUE = 5;
        this.WAITING_HEADER_LINE_END = 6;
        this.WAITING_HEADER_AFTER_START = 7
        this.WAITING_HEADER_AFTER_END = 8

        this.CURRENT_STATUS_LINE = this.WAITING_STATUS_LINE_START;
        this.header = {};
        this.name = '';
        this.value = '';
        this.char = '';
    }
    get isFinish() {
        return this.bodyParse&&this.bodyParse.isFinish;
    }
    get response(){
        this.char.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            header: this.header,
            body: this.bodyParse.char,
        }
    }
    receive(data) {

        for (let a = 0; a < data.length; a++) {
            this.receiveChar(data.charAt(a));
        }
    }
    receiveChar(char) {
        if (this.CURRENT_STATUS_LINE === this.WAITING_STATUS_LINE_START) {
            if (char === '\r') {
                this.CURRENT_STATUS_LINE = this.WAITING_STATUS_LINE_END;
            } else {
                this.char += char;
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_NAME;

            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_AFTER_START;
            } else {
                this.name += char;
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_VALUE;
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_LINE_END;
                this.header[this.name] = this.value;
                this.name = '';
                this.value = '';
            } else {
                this.value += char;
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_NAME;
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_AFTER_START) {
            if (char === '\n') {
                this.CURRENT_STATUS_LINE = this.WAITING_HEADER_AFTER_END;
                this.bodyParse = new BodyParse();
            }
        } else if (this.CURRENT_STATUS_LINE === this.WAITING_HEADER_AFTER_END) {
            if (this.header['Transfer-Encoding'] === 'chunked') {
                
                this.bodyParse.receiveChar(char);
            }
            
        }

    }

}

class BodyParse {
    constructor() {
        this.BODY_LENGTH = 1;
        this.BODY_LENGTH_LINE_END = 2;
        this.BODY_CONTENT_START = 3;
        this.BODY_CONTENT_END = 4;
        this.STRING_START = 5;
        this.length = 0;
        this.char = '';
        this.isFinish = false;
        this.CURRENT_STATUS_LINE = this.BODY_LENGTH;
    }
    receiveChar(char) {
        
        if (this.CURRENT_STATUS_LINE === this.BODY_LENGTH) {
            if (char === '\r') {
                this.CURRENT_STATUS_LINE = this.BODY_LENGTH_LINE_END;
                if(this.length === 0){
                    this.isFinish = true;
                    this.CURRENT_STATUS_LINE = -1;
                }
            } else {
                // console.log('char ' + parseInt(char,16));
                this.length *= 10;
                // this.length += (parseInt(char,16) + '').charCodeAt(0) - '0'.charCodeAt(0);
                this.length += parseInt(char,16);
            }
        } else if (this.CURRENT_STATUS_LINE === this.BODY_LENGTH_LINE_END) {
            if (char === '\n') {
                this.CURRENT_STATUS_LINE = this.BODY_CONTENT_START;
            }
        } else if (this.CURRENT_STATUS_LINE === this.BODY_CONTENT_START) {
            this.char += char;
            if (--this.length === 0) {
                this.CURRENT_STATUS_LINE = this.BODY_CONTENT_END;
            }
        }else if (this.CURRENT_STATUS_LINE === this.BODY_CONTENT_END) {
            if (char === '\r') {
                this.CURRENT_STATUS_LINE = this.STRING_START;
            }
        }else if (this.CURRENT_STATUS_LINE === this.STRING_START) {
            if (char === '\n') {
                this.CURRENT_STATUS_LINE = this.BODY_LENGTH;
            }
        }

    }

}

void async function () {
    const request = new Request({
        host: '127.0.0.1',
        post: 8060,
        path: '/',
        methods: 'POST',
        headers: {
            'x-foo': "test"
        },
        body: {
            name: 'chenjunxian'
        }
    })
    const data = await request.send();
    console.log(data);
}();

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

