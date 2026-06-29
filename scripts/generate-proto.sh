#!/usr/bin/env bash
set -eo pipefail

echo "==> Generating Protobuf files via Buf..."

if ! command -v buf >/dev/null 2>&1; then
    echo "buf is not installed. Run 'make bootstrap' first."
    exit 1
fi

buf lint
buf generate

echo "==> Protobuf generation complete."
