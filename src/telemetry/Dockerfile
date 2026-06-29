FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install librdkafka dependencies
RUN apk add --no-cache pkgconfig gcc musl-dev bash build-base \
    librdkafka-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build with CGO enabled for librdkafka
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /telemetry-server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache librdkafka
COPY --from=builder /telemetry-server /telemetry-server
EXPOSE 9000 9090
ENTRYPOINT ["/telemetry-server"]
