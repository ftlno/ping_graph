var fsSync = require('fs-sync');
var fs = require('fs');
var Datastore = require('nedb');
var db = new Datastore({
    filename: 'pings.db',
    autoload: true
});
//var server = require('./server.js');

var DBModule = {};

DBModule.savePingObjToDatabase = function(objToSave) {
    db.insert(objToSave, function(err, newDoc) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Ping saved to NeDB");
    });
};

DBModule.queryDatabase = function(options, callback) {
    db.find(options, callback);
};

DBModule.saveDatabaseToLogFileAndEmpty = function(callback) {
	var filename = saveDatabaseBackup();
	db.remove({}, { multi: true }, function (err, numRemoved) {
		if(fsSync.exists('pings.db')){
		    fs.unlinkSync("pings.db");
		}
		callback(filename);
	});
};

var saveDatabaseBackup = function() {
	var backupFilename = getUniqueBackupFilename();
	fsSync.copy("pings.db", backupFilename,{});
	return backupFilename;
};

var getUniqueBackupFilename = function() {
	var files = fs.readdirSync('.');
	var counter = 1;
	for (var i = 0; i < files.length; i++) {
		if (files[i].startsWith("pings") && files[i].endsWith('.txt')) {
			counter++;
		}
	}
	return ("pings" + counter + ".txt");
};

module.exports = DBModule;