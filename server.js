const http = require('http');
const tempData = require('./data.js');
const querystring = require('querystring');
const fs = require('fs');

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
	var params = { since: 0 };
	var pieces = req.url.split("?");
	if (pieces.length > 1) {
		params = querystring.parse(pieces[1]);
	}
	
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.end(getData(params.since));
});

function getData(since) {
	var content = 
	"{\n  \"colors\": " + JSON.stringify(colors, null, 2) + ",\n  \"data\": [\n" +
	data
		.filter(elem => elem[0] > Number(since))
		.map(elem => JSON.stringify(elem, null, 2))
		.join(",\n")
	+ "  \n]\n}";
	return content;
}

var colors = null;
var data = [];

function gatherData() {
	new Promise(resolve => setTimeout(resolve, 1000))
	.then(() => tempData.read())
	.then(result => {
		if (colors == null) colors = result.colors;
		if (data.length > 60 * 60 * 24 * 3) data.shift();
		
		// Add an indicator of whether we like the ADC sample or not.
		// Remove spurious zeroes from adc0.
		var adcIndex = colors.indexOf("adc0");
		
		if (result.values.slice(adcIndex).reduce((acc, val) => acc + val, 0) > 0) {
			// Looks like a good sample from ADC.
			
			// But if voltage appears to be zero then
			// replace with non zero one time.
			if (data.length > 0) {
				var v = result.values[adcIndex];
				if (v == 0) {
					var lastV = data[data.length - 1][adcIndex];
					if (lastV != 0) {
						result.values[adcIndex] = lastV;
					}
				}
			}
			
			data.push([Date.now()].concat(result.values));
		}
	})
	.then(() => gatherData());
}

gatherData();

const writeEveryMs = 60 * 60 * 24 * 1000;
function writeData() {
	new Promise(resolve => setTimeout(resolve, writeEveryMs))
	.then(() => {
		var now = new Date(Date.now());
		fs.writeFile("data-" + now.toISOString() + ".json", getData(now.getTime() - writeEveryMs));
	})
	.then(() => writeData());
}

writeData();

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});


