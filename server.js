var express = require('express');
var app = express();
var path = require('path');
var util = require('util');
var exec = require('child_process').exec;
var moment = require('moment');
var fs = require('fs');

var db = require('./db.js');

var dateRegex = /\w{3}\s+[0-9]{1,2}\s+[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\s+[0-9]{4}/;
var pingTimeRegex = /.*?time=(.*?ms)/;
var ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

var ping_address = process.env.PING_TARGET;
var ping_interval = 1000;
var interval;

// Ping and NeDB
function handlePingOutput(error, stdout, stderr) {
    if (error || stdout.match(/DUP/)) {
        return;
    }

    try {
        var line = stdout.split("\n")[1];
        var date = line.match(dateRegex)[0];
        var dateInUnixTime = moment(date, 'MMM DD hh:mm:ss YYYY').unix();
        var ip = line.match(ipRegex)[0];
        var ping = Number(line.match(pingTimeRegex)[1].split(" ")[0]);

        var pingObjToSave = {
            "date": date,
            "unixtime": (dateInUnixTime * 1000),
            "ip": ip,
            "ping": ping
        };

        db.savePingObjToDatabase(pingObjToSave);
    } catch (err) {
        console.log(err);
    }
}

function startTimer() {
    interval = setInterval(function() {
        exec("ping -c 1 " + ping_address + " | perl -nle 'BEGIN {$|++} print scalar(localtime), \" \", $_' ", handlePingOutput);
    }, ping_interval);
}

function stopTimer() {
    clearInterval(interval);
}

function compare(a, b) {
    if (a.unixtime < b.unixtime) {
        return -1;
    }
    if (a.unixtime > b.unixtime) {
        return 1;
    }
    return 0;
}


// Express API
app.use('/', express.static(__dirname + '/'));

app.get('/logs', function(request, response) {
    var returnHtml = "<ul>";
    var files = fs.readdirSync('.');
    var logsExist = false;
    for (var i = 0; i < files.length; i++) {
        if (files[i].endsWith('.txt')) {
            returnHtml += ('<li><a href="' + files[i] + '"> ' + files[i] + '</a></li>');
            logsExist = true;
        }
    }
    if (!logsExist) {
        response.end("There are not saved any logs.");
        return;
    }
    returnHtml += "</ul>";
    response.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': returnHtml.length
    });
    response.write(returnHtml);
    response.end();
});

app.get('/*.txt', function(request, response) {
    response.sendFile(path.join(__dirname + '/' + request.url));
});

var databaseQueryCallback = function(err, docs) {
    if (err) {
        console.log(err);
        return;
    }
    docs.sort(compare);
    response.end(JSON.stringify(docs));
};

app.get('/data', function(request, response) {
	db.queryDatabase({}, function(err, docs) {
		if (err) {
      	  console.log(err);
			return;
		}
		docs.sort(compare);
		response.end(JSON.stringify(docs));
	});
});

app.get('/last24hours', function(request, response) {
    var oneDayAgo = moment().subtract(1, 'days').unix() * 1000;
	db.queryDatabase({
        "unixtime": {
            $gt: oneDayAgo
        }}, function(err, docs) {
    			if (err) {
					console.log(err);
					return;
				}
				docs.sort(compare);
				response.end(JSON.stringify(docs));
			});
});

app.get('/reset', function(request, response) {
    if (request.query.secret === process.env.SECRET) {
        stopTimer();
		
		db.saveDatabaseToLogFileAndEmpty(startTimer);

    } else {
        response.end("Wrong secret password.");
    }
});

app.get('/newtarget', function(request, response) {
    if (request.query.secret === process.env.SECRET && request.query.target) {
        stopTimer();
        process.env.PING_TARGET = request.query.target;
        ping_address = process.env.PING_TARGET;
		
		db.saveDatabaseToLogFileAndEmpty(startTimer);

    } else {
        response.end("Wrong secret password og no specified target");
    }
});

module.exports = {
	ping_address: ping_address
}

app.listen(5000);
startTimer();
