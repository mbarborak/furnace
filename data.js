const fs = require('fs');
const spawn = require('child_process').spawn;

var colors = [ "yellow", "blue", "purple", "orange", "green", "adc0", "adc1", "adc2", "adc3", "adc4", "adc5", "adc6", "adc7" ];

function read() {
	var resolve;
	var promise = new Promise(r => resolve = r);
	
	// Return data like so:
	// {
	//		colors: [ c0, c1, ... cn ]
	//		values: [ v0, v1, ... vn ]
	// }
	
	var promises = [];
	
	var adc = spawn('sudo', ['python', 'read_adc.py']);
	var adcPromise = new Promise(r => {
		adc.stdout.on('data', (data) => {
			r({adc: data.toString("utf8").replace(/\n/g, "").split("\t")});
		});
	});
	promises.push(adcPromise);
	
	fs.readFile("calibrations.json", "utf8", (err, data) => {
	    if (err) throw err;
	    var calibrations = JSON.parse(data);
		var path = "/sys/bus/w1/devices/";
		fs.readdir(path, (err, items) => {
		    if (err) throw err;
			items.forEach(elem => {
				if (elem.indexOf("28-") != 0) return;
				var color = "unknown";
				if (elem == "28-04166395b9ff") { color = "yellow"; } else
				if (elem == "28-041663941bff") { color = "blue";  } else
				if (elem == "28-04166381b7ff") { color = "purple";  } else
				if (elem == "28-0416634de8ff") { color = "orange";  } else
				if (elem == "28-0316643989ff") { color = "green";  }
				var resolve;
				var promise = new Promise(r => resolve = r);
				promises.push(promise);
				fs.readFile(path + elem + "/w1_slave", "utf8", (err, data) => {
					  if (err) throw err;
					  var value = new Number(data.split("\n")[1].split(" t=")[1]);
					  var temp = value / 1000 * 1.8 + 32;
					  resolve({ 
						  color: color, 
						  value: Math.round(temp + calibrations[color]), 
						  raw: temp + calibrations[color], 
						  uncalibrated: temp
					  });
					});
			});
			Promise.all(promises)
			.then(data => {
				var result = { colors: colors, values: [], raw: [], uncalibrated: [] };
				data.forEach(elem => {
					if (elem.adc != null) {
						var index = colors.indexOf("adc0");
						elem.adc.forEach((e, i) => { 
							var value = Number(e);
							result.values[index + i] = 
							result.raw[index + i] = 
							result.uncalibrated[index + i] = value;
						});
					} else {
						var index = colors.indexOf(elem.color);
						if (index >= 0) {
							result.values[index] = elem.value;
							result.raw[index] = elem.raw;
							result.uncalibrated[index] = elem.uncalibrated;
						}
					}
				});
				resolve(result);
			});
		});
	});
	
	return promise;
}

exports.read = read;

if (process.argv[1].indexOf("data.js") == process.argv[1].length - "data.js".length) {
	if (process.argv.length < 3 || process.argv[2] == "read") {
		read()
		.then(result => result.values.forEach((v, i) => console.log(result.colors[i], v)));
	} else if (process.argv[2] == "calibrate") {
		read()
		.then(result => {
			var total = result.uncalibrated.slice(0, 5).reduce((acc, val) => acc + val, 0);
			var avg = total / 5;
			var calibrations = {};
			result.colors.forEach((color, i) => {
				calibrations[color] = i < 5 ? avg - result.uncalibrated[i] : 0;
				console.log(color, calibrations[color]);
			});
			fs.writeFileSync("calibrations.json", JSON.stringify(calibrations));
		});
	}
}

