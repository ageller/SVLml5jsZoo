@Echo off

Rem This is our usual program, and will be in the background in case this crashes
Rem START "Earth v Mars" "C:\Users\MTUser\Desktop\Earth vs Mars\CollectionViewer-1.2\EvM.exe"

echo Monitoring Zooniverse app.
echo Press Ctrl-C if you don't want to restart automatically.

Rem Now start the loop to keep the Zooniverse open after a crash
:Init

C:\Users\MTUser\AppData\Local\Google\Chrome\Application\chrome_proxy.exe --profile-directory=Default --app-id=afhcomalholahplbjhnmahkoekoijban

:Check

set count=0
for /f "tokens=1,*" %%a in ('tasklist ^| find /I /C "chrome.exe"') do set count=%%a
Rem echo Number of chrome processes : %count%

tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
Rem if "%ERRORLEVEL%"=="0" echo ZooML program is running.

set "TRUE="
IF ERRORLEVEL 1 set TRUE=1
IF %count% LSS 5 set TRUE=1
IF defined TRUE (
	echo ZooML program terminated at %Date% %Time%
	echo Error : %ErrorLevel%
	echo Number of chrome processes : %count%
	echo Press Ctrl-C if you don't want to restart automatically.
	goto Init
)

Rem We could wait some time between checks, but this probably isn't desired (it already takes a while to detect a crash!)
Rem TIMEOUT /T 10 /NOBREAK

goto Check
