FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /auth-server ./cmd/server

FROM scratch
COPY --from=builder /auth-server /auth-server
EXPOSE 9001
ENTRYPOINT ["/auth-server"]
