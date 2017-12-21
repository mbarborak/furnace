# Furnace Project

See [here](https://barborak.com/furnace/) for an overview of the project.

# Windows Batch Files

`pi_ip.bat` use the pi's MAC address to find its dynamic IP.

`scp.bat` uses Putty's pscp and the ip from `pi_ip.bat` to scp to the pi.

`push.bat` uses `scp.bat` to push the files to the pi's home directory.

`ssh.bat` opens a Putty ssh connection to the pi.

# Linux Shell Scripts

`start.sh` is started with `sudo` and starts the Node `server.js` file and a web server.

# Node Scripts

These scripts run on the pi. Obviously I have installed node there and some other things there. Also, they depend on various monitoring equipment being connected to the pi. See the description on the barborak.com website.

`data.js` reads the thermometers and A/D converter.

`server.js` records the data and serves it up on demand via HTTP request.

`read_adc.py` reads the A/D converter using Python and a library mentioned in the description at barborak.com.

# Website

I run a web server on the pi to serve `index.html`. This page shows a timeline of the data that has been read.

The page has some dependencies defined in `bower.json` and managed by `bower`. `bower` depends on `node`. After installing it, you run `bower install` to get the dependencies installed.

# Miscellaneous

To measure the presence of 24V, I built a small circuit described in `circuit-20170213-0821.circuitjs.txt` and viewable with this [app](http://lushprojects.com/circuitjs/). Do `File > Import from Local File`.

# Arduino Furnace Control

This sketch drives the furnace control I built to prevent the furnace limit fault. It works with a relay and two thermistors. When the Arduino reads a temperature difference greater than 69 degrees, it turns on the relay. By putting the relay between the thermostat's white (call for heat) output and the input on the furnace control panel, I can turn off the call for heat before a fault occurs.

