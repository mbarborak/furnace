#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi
killall node
PATH=/home/pi/node-v6.9.4-linux-armv6l/bin:${PATH}
cd /home/pi/furnace
rm nohup.out
nohup node server.js &
nohup http-server -p 8080 -c 0 &
