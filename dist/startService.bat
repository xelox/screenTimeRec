@echo off
setlocal

set APP_NAME=Simple Application Usage Time Tracker
set APP_EXECUTABLE=nssm.exe
set NSSM_PATH=tracker.exe

echo Installing %APP_NAME% service...

%NSSM_PATH% install %APP_NAME% %APP_EXECUTABLE%
%NSSM_PATH% set %APP_NAME% AppDirectory %CD%
%NSSM_PATH% set %APP_NAME% AppEnvironmentExtra NODE_ENV=production
%NSSM_PATH% set %APP_NAME% AppStdout %CD%\stdout.log
%NSSM_PATH% set %APP_NAME% AppStderr %CD%\stderr.log

%NSSM_PATH% start %APP_NAME%

echo %APP_NAME% service installed and started.

endlocal
