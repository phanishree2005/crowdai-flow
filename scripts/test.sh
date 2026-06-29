#!/usr/bin/env bash
set -eo pipefail

echo "==> Running Go unit tests..."
go test -v -race -cover ./...

echo "==> Running Rust unit tests..."
cargo test

echo "==> All tests passed."
