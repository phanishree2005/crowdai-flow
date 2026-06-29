#!/usr/bin/env bash
set -eo pipefail

echo "==> Running Go benchmarks..."
go test -bench=. -benchmem ./...

echo "==> Running Rust benchmarks..."
cargo bench

echo "==> Benchmarks complete."
