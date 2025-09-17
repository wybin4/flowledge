@echo off
echo Запуск всех сервисов...
start cmd /k "cd /d gateway-service && go run ./cmd/main.go"
start cmd /k "cd /d account-service && go run ./cmd/main.go"
start cmd /k "cd /d setting-service && go run ./cmd/main.go"
