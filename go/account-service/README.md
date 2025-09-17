# User Service (Go + Gin + Mongo + Swagger)

## Генерация Swagger-документации

```bash
swag init -g ./cmd/main.go -o ./cmd/docs
```

Перегенерировать нужно при изменении handler-ов и аннотаций.

## Запуск сервиса

```bash
go run ./cmd/main.go
```

Сервер стартует на `http://localhost:8080`
Swagger UI доступен по `http://localhost:8080/swagger/index.html`