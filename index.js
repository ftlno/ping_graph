var m = require('moment');
var fs = require('fs');
var timestamps = [];

var dateRegex = /\w{3}\s+[0-9]{1,2}\s+[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\s+[0-9]{4}/;
var timeRegex = /time=([0-9]{1,4}\.[0-9]{1})/;

var parseFile = function(callback) {
    fs.readFile('ping.txt', 'utf8', function(err, contents) {
        var array = contents.toString().split("\n");
        var arrayLength = array.length;

        for (var i = 0; i < arrayLength; i++) {
            var timestamp = array[i].toString().match(timeRegex);
            timestamps.push(timestamp);
        }

        callback();
    });
};

var renderTimestamps = function() {
    var timestampsLength = timestamps.length;
    for (var i = 0; i < timestampsLength; i++) {
        if (timestamps[i] !== null) {
            var ping = Number(timestamps[i][1]);
            console.log(ping);
        }
    }
};

parseFile(renderTimestamps);
