@echo off
for /f %%i in ('pi_ip.bat') do set PIIP=%%i
@echo on
scp.bat * pi@%PIIP%:/home/pi/furnace/