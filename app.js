var http = require('http');

var server = http.createServer(function(request, response) {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.end("Hello World\n");
});

server.listen(8000);
console.log("Server running at http://127.0.0.1:8000/");

/*
Old example ping output: 
Wed Sep 30 12:29:24 2015 64 bytes from 10.0.30.22: icmp_seq=2 ttl=126 time=43.8 ms
*/