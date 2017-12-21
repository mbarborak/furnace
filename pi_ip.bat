@echo off
for /L %%N in (1,1,254) do start /b ping -n 1 -w 200 192.168.1.%%N > nul 2>&1
for /f %%i in ('arp -a ^| findstr 00-13-ef-80-3f-c8') do set PIIP=%%i
echo %PIIP%

