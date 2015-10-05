var m = require('moment');
var str = "Thu Oct  2 08:48:41 2015 64 bytes from 10.0.30.22: icmp_seq=7482 ttl=126 time=43.8 ms";

var dateRegex = /\w{3}\s+[0-9]{1,2}\s+[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\s+[0-9]{4}/
var dateParser = str.match(dateRegex);

var dateStr = dateParser[0].replace(/\s+/, ' ');
var dateParsed = m(dateStr, 'MMM DD hh:mm:ss YYYY');

console.log(dateStr);
console.log(dateParsed.toString());
