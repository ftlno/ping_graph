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

DBModule.saveLogAndWipeDatabase = function(callback) {
	db.find({}).sort({ unixtime: -1 }).exec(function (err, docs) {
		if (docs[0]) {
			var backupFilename = "Pings from " + docs[0].date + ".txt";
			fsSync.copy("pings.db", backupFilename,{});
			db.remove({}, { multi: true }, function (err, numRemoved) {
				if(fsSync.exists('pings.db')){
				    fs.unlinkSync("pings.db");
				}
				callback(backupFilename);
			});
		}
	});
};

module.exports = DBModule;
