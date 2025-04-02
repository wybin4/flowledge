@echo off

REM Переход в директорию docker и запуск docker-compose
cd docker
start cmd /c "docker-compose up -d && exit"
cd ..

REM Переход в директорию next и запуск npm
cd next
start cmd /k "npm run dev"
cd ..

REM Открытие нового терминала для python
cd python
start cmd /k "venv\Scripts\activate && run.bat"
cd ..

REM Открытие нового терминала для kotlin
cd kotlin\admin
start cmd /k ".\gradlew.bat bootRun"