# Pingu

* Node.js
* NeDB
* Moment.js
* Express
* D3
* JS-dom
* fs-sync

### How to start
Build with Docker:
```docker build -t <docker repo> .```
	
Example:
```docker build -t bekk/pingu .```

Run with Docker:
```docker run -it -p <port mapping> -e PING_TARGET='<ip to ping>' -e SECRET='<password>' <repo>```
	
Example:
```docker run -it -p 80:5000 -e PING_TARGET='vg.no' -e SECRET='hemmelig' bekk/pingu````

It is now running in Docker and pinging vg.no. Direct your web browser to the docker machine's IP on port 80 to see the D3 graph.

### Endpoints

##### /logs
All log files are accessible from here.

##### /data
All data currently in the database is accessible from here.

##### /last24hours
All data from the last 24 hours currently in the database is accessible from here.

##### /reset?secret=password
Used to reset the database and store the current DB as a log file. Query strings required.
Example, goto: ```http://pingu.bekk/reset?secret=hemmelig```
	
##### /newtarget?secret=password&target=target.com
Used to point the app to another IP address. It also resets the database and stores the current DB as a log file. Query strings are required.
Example, goto: ```http://pingu.bekk/newtarget?secret=hemmelig&target=db.no```