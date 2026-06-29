#!/usr/bin/env bash
set -eo pipefail

echo "==> Creating release..."

if ! command -v goreleaser >/dev/null 2>&1; then
    echo "goreleaser is not installed."
    exit 1
fi

goreleaser release --clean

echo "==> Release complete."
