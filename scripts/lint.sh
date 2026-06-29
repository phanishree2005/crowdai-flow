#!/usr/bin/env bash
set -eo pipefail

echo "==> Linting Go code..."
golangci-lint run ./...

echo "==> Linting Rust code..."
cargo clippy --all-targets --all-features -- -D warnings

echo "==> Linting Protobuf..."
buf lint

echo "==> All linters passed."
