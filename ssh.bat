@echo off
for /f %%i in ('pi_ip.bat') do set PIIP=%%i
@echo on
start "" "c:\Program Files (x86)\PuTTY\putty.exe" -i "\Users\Mike Barborak\Documents\raspberrypi\id_rsa.ppk" pi@%PIIP%
