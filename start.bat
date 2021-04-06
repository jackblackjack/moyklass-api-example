::@echo off
:: Starts the server

::SET NODE_ENV=development
:: SET SUPPRESS_NO_CONFIG_WARNING=0
::npm run dev-start
@echo off
REM $$
REM Start app.
REM $$
SET NODE_ENV=development
:: SET SUPPRESS_NO_CONFIG_WARNING=0
node --harmony ./src/server.js
