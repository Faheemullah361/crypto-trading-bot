@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%"=="" ECHO OFF
@REM set title of command window
title %COMSPEC% /c %~nx0 %*
@REM enable extensions
setlocal EnableExtensions
@REM enable delayed expansion
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "MAVEN_PROJECTBASEDIR=%SCRIPT_DIR%"
SET "MVNW_USERNAME=%MVNW_USERNAME%"
SET "MVNW_PASSWORD=%MVNW_PASSWORD%"
SET "MVNW_REPOURL=%MVNW_REPOURL%"
SET "MVNW_VERBOSE=%MVNW_VERBOSE%"

@REM Determine command-line arguments for the wrapper jar
set WRAPPER_JAR=%SCRIPT_DIR%\.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPERTIES=%SCRIPT_DIR%\.mvn\wrapper\maven-wrapper.properties

IF EXIST "%WRAPPER_PROPERTIES%" (
  for /F "usebackq tokens=1,2 delims==" %%A in ("%WRAPPER_PROPERTIES%") do (
    if "%%A"=="distributionUrl" set DISTRIBUTION_URL=%%B
    if "%%A"=="wrapperUrl" set WRAPPER_URL=%%B
  )
) ELSE (
  ECHO Cannot find "%WRAPPER_PROPERTIES%"
  EXIT /B 1
)

@REM Download maven-wrapper.jar if not present
IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Downloading Maven Wrapper from %WRAPPER_URL%
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $u='%WRAPPER_URL%'; $o='%WRAPPER_JAR%'; $wc=New-Object System.Net.WebClient; if ('%MVNW_USERNAME%' -ne '') { $wc.Credentials = New-Object System.Net.NetworkCredential('%MVNW_USERNAME%','%MVNW_PASSWORD%') }; $wc.DownloadFile($u,$o)"
  IF ERRORLEVEL 1 (
    ECHO Failed to download Maven Wrapper JAR
    EXIT /B 1
  )
)

@REM Run Maven Wrapper
set JAVA_EXE=java.exe
"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 EXIT /B 1
