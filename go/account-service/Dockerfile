# Stage 1: build
FROM golang:1.25.1-alpine AS builder
WORKDIR /app

COPY pkg/ ./pkg/
COPY account-service/ ./account-service/

WORKDIR /app/account-service

RUN echo 'replace github.com/wybin4/flowledge/go/pkg => ../pkg' >> go.mod && \
    go mod tidy && \
    go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd

# Stage 2: runtime
FROM alpine:3.22
RUN apk add --no-cache ca-certificates
COPY --from=builder /server /server
ENTRYPOINT ["/server"]