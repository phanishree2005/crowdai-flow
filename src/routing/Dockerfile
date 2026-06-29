# Build Stage
FROM rust:1.75-slim-bookworm AS builder

WORKDIR /usr/src/app
# Install protobuf compiler for tonic-build
RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
# Create dummy src to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY . .
# Touch main.rs to force rebuild
RUN touch src/main.rs
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/target/release/routing /usr/local/bin/routing
EXPOSE 9002
ENTRYPOINT ["routing"]
