var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/data', function(request, response) {
    var data = {
        'url': "http://db.no",
        'time': '12345',
        'ms': '10'
    };
    response.json(data);
});


app.listen(3000);
