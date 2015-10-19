var chartData;
var pings = [];
var drops = [];
var xStart;
var xEnd;

var NUMBER_OF_TICKS_ON_X_AXIS = 10;
var NUMBER_OF_TICKS_ON_Y_AXIS = 10;
var START_OF_Y_AXIS = 0;
var END_OF_Y_AXIS = 100;
var AXIS_WIDTH = getSizeOfXAxis();
var DROP_LIMIT_MILLISECONDS = 1000;
var AXIS_HEIGHT = 600;

function parseFile(array) {
	pings = [];
	drops = [];
    var drop = false;
    var arrayLength = array.length;
    for (var i = 0; i < arrayLength; i++) {
        var ping = array[i].ping;
        var dateInUnixTime = array[i].unixtime;
        if (i < arrayLength - 1) {
            if (drop) {
                ping = START_OF_Y_AXIS;
                drop = false;
            } else {
                var nextInUnixTime = array[i + 1].unixtime;
                if (nextInUnixTime - dateInUnixTime > DROP_LIMIT_MILLISECONDS) {
                    ping = START_OF_Y_AXIS;
                    drop = true;
                    drops.push(array[i].date + " " + array[i].ip);
                }
            }
            if (!xStart) {
                xStart = dateInUnixTime;
            }
            xEnd = dateInUnixTime;
            pings.push({
                ping: ping,
                time: dateInUnixTime
            });
        }
    }
	renderChart();
    printDrops(drops);
}

function printDrops(drops) {
	var node = document.getElementById('drops');
	while (node.hasChildNodes()) {
	    node.removeChild(node.lastChild);
	}
	
    for (var i = 0; i < drops.length; i++) {
        var node = document.createElement("LI");
        var textNode = document.createTextNode(drops[i]);
        node.appendChild(textNode);
        document.getElementById("drops").appendChild(node);
    }
}

function renderChart() {
	var data = pings;
	var node = document.getElementById('visualisation');
	while (node.hasChildNodes()) {
	    node.removeChild(node.lastChild);
	}
	
    document.getElementById('visualisation').setAttribute("width", AXIS_WIDTH);
    document.getElementById('visualisation').setAttribute("height", AXIS_HEIGHT);

    var timeFormat = d3.time.format("%d %b %H:%M");

    var vis = d3.select("#visualisation"),
        WIDTH = AXIS_WIDTH,
	
        HEIGHT = AXIS_HEIGHT,
	
        MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 40
        },
		
        xScale = d3.time.scale()
			.range([MARGINS.left, WIDTH - MARGINS.right])
			.domain([xStart, xEnd]),//([xStart, xEnd]),
		
        yScale = d3.scale.linear()
			.range([HEIGHT - MARGINS.top, MARGINS.bottom])
			.domain([START_OF_Y_AXIS, END_OF_Y_AXIS]),
		
        xAxis = d3.svg.axis()
        	.ticks(NUMBER_OF_TICKS_ON_X_AXIS)
			.scale(xScale)
			.tickSize(-AXIS_HEIGHT+40, 0, 0)
			.tickFormat(timeFormat),
		
        yAxis = d3.svg.axis()
			.ticks(NUMBER_OF_TICKS_ON_Y_AXIS)
			.tickSize(-AXIS_WIDTH+60, 0, 0)
			.scale(yScale)
			.orient("left");
			
    vis.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .call(xAxis);
		
    vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);

    var lineGen = d3.svg.line()
        .x(function(d) {
            return xScale(d.time);
        })
        .y(function(d) {
            return yScale(d.ping);
        })
        .interpolate("linear");
		
    vis.append('svg:path')
        .attr('d', lineGen(data))
        .attr('stroke', '#DF565B')
        .attr('stroke-width', 0.8)
        .attr('fill', 'none')
}

function getSizeOfXAxis() {
	return window.innerWidth - 35;
}

window.onresize = function() {
	AXIS_WIDTH = getSizeOfXAxis();
	parseFile(chartData);
};

var fetchAndParseNewData = function() {
    $.get("/data", function(body) {
		chartData = JSON.parse(body);
		parseFile(chartData);
    });
}

$(document).ready(function() {
    fetchAndParseNewData();
	setInterval(function() {
	    fetchAndParseNewData();
	}, 3000);
});



// Interactive chart.

(function() {
	
	var data;
	var svg;
	var margin = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 45
	};

	var width = window.innerWidth - 100;
	var height = 500;
	
	var xStart = 0;
	var xEnd = width;
	var yStart = height;
	var yEnd = 0;
	
	var xScale;
	var yScale;
	var line;
	var zoom;
	
	var updatedValues = {
		x: 0,
		y: 0,
		scale: 0 
	};

	var interval;

	function drawInteractiveChart() {
		xStart = xStart + updatedValues.x;
		xEnd = xEnd + updatedValues.x;
		yStart = yStart + updatedValues.y;
		yEnd = yEnd + updatedValues.y;
		console.log(xStart);
		console.log(xEnd);
		var node = document.getElementById('chart');
		while (node.hasChildNodes()) {
		    node.removeChild(node.lastChild);
		}
		xScale = d3.time.scale()
		    .domain(d3.extent(data, function (d) {
		    	return d.unixtime;
			}))
		    .range([xStart, xEnd]);
	
		yScale = d3.scale.linear()
		    .domain(d3.extent(data, function (d) {
				return d.ping;
			}))
		    .range([yStart, yEnd]);
	
		line = d3.svg.line()
		    .x(function (d) {
		    	return xScale(d.unixtime);
			})
		    .y(function (d) {
		    	return yScale(d.ping);
			});
	
		zoom = d3.behavior.zoom()
		    .x(xScale)
		    .y(yScale)
		    .on("zoom", zoomed);
	
		svg = d3.select('#chart')
		    .append("svg:svg")
		    .attr('width', width + margin.left + margin.right)
		    .attr('height', height + margin.top + margin.bottom)
		    .append("svg:g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		    .call(zoom);
	
		svg.append("svg:rect")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("class", "plot");
	
		var make_x_axis = function () {
		    return d3.svg.axis()
		        .scale(xScale)
		        .orient("bottom")
		        .ticks(5);
		};
	
		var make_y_axis  = function () {
		    return d3.svg.axis()
		        .scale(yScale)
		        .orient("left")
		        .ticks(5);
		};
	
		var xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom")
		    .ticks(5);
	
		svg.append("svg:g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0, " + height + ")")
		    .call(xAxis);
	
		var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .ticks(5);
	
		svg.append("g")
		    .attr("class", "y axis")
		    .call(yAxis);
	
		svg.append("g")
		    .attr("class", "x grid")
		    .attr("transform", "translate(0," + height + ")")
		    .call(make_x_axis()
		    .tickSize(-height, 0, 0)
		    .tickFormat(""));
	
		svg.append("g")
		    .attr("class", "y grid")
		    .call(make_y_axis()
		    .tickSize(-width, 0, 0)
		    .tickFormat(""));
	
		var clip = svg.append("svg:clipPath")
		    .attr("id", "clip")
		    .append("svg:rect")
		    .attr("x", 0)
		    .attr("y", 0)
		    .attr("width", width)
		    .attr("height", height);
	
		var chartBody = svg.append("g")
		    .attr("clip-path", "url(#clip)");
	
		chartBody.append("svg:path")
		    .datum(data)
		    .attr("class", "line")
		    .attr("d", line);
	
		function zoomed() {
			clearInterval(interval);
			console.log(d3.event);
			updatedValues.x = d3.event.translate[0];
			updatedValues.y = d3.event.translate[1];
		    svg.select(".x.axis").call(xAxis);
		    svg.select(".y.axis").call(yAxis);
		    svg.select(".x.grid")
		        .call(make_x_axis()
		        .tickSize(-height, 0, 0)
		        .tickFormat(""));
		    svg.select(".y.grid")
		        .call(make_y_axis()
		        .tickSize(-width, 0, 0)
		        .tickFormat(""));
		    svg.select(".line")
		        .attr("class", "line")
		        .attr("d", line);
			interval = setInterval(function() {
				drawInteractiveChart();
			}, 3000);
		}
	}
	$.get("/data", function(body) {
		data = JSON.parse(body);
		drawInteractiveChart();
		interval = setInterval(function() {
			drawInteractiveChart();
		}, 3000);
	});
	
})();


