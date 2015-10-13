var NUMBER_OF_TICKS_ON_X_AXIS = 30;
var NUMBER_OF_TICKS_ON_Y_AXIS = 10;
var START_OF_Y_AXIS = 0;
var END_OF_Y_AXIS = 100;
var AXIS_WIDTH = 3000;
var DROP_LIMIT_MILLISECONDS = 1000;
var AXIS_HEIGHT = 500;

function setupDOM() {

}

function parseFile(array) {
    var pings = [];
    var drops = [];
    var xStart;
    var xEnd;
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
    renderChart(pings, xStart, xEnd);
    printDrops(drops);
}

function printDrops(drops) {
    for (var i = 0; i < drops.length; i++) {
        var node = document.createElement("LI");
        var textNode = document.createTextNode(drops[i]);
        node.appendChild(textNode);
        document.getElementById("drops").appendChild(node);
    }
}

function getUnixTimestamp(date) {
    return moment(date, 'MMM DD hh:mm:ss YYYY').unix() * 1000;
}

function renderChart(data, xStart, xEnd) {
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
        xScale = d3.time.scale().range([MARGINS.left, WIDTH - MARGINS.right]).domain([xStart, xEnd]),
        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([START_OF_Y_AXIS, END_OF_Y_AXIS]),
        xAxis = d3.svg.axis()
        .ticks(NUMBER_OF_TICKS_ON_X_AXIS)
        .scale(xScale)
        .tickFormat(timeFormat),
        yAxis = d3.svg.axis()
        .ticks(NUMBER_OF_TICKS_ON_Y_AXIS)
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
        .attr('stroke-width', 1)
        .attr('fill', 'none');
}
