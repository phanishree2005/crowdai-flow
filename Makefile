.PHONY: bootstrap lint test build run down clean sbom proto

bootstrap:
	./scripts/bootstrap.sh

proto:
	./scripts/generate-proto.sh

lint:
	./scripts/lint.sh

test: test-go test-rust

test-go:
	./scripts/test.sh # Will just run Go/Rust in reality, handled by the script

test-rust:
	# Handled in test.sh

build:
	go build -o bin/server ./cmd/server
	cargo build --release

up:
	docker-compose up -d

down:
	docker-compose down

sbom:
	# Requires syft or npm cyclonedx depending on ecosystem
	npm run sbom

clean:
	rm -rf bin/ target/ gen/ node_modules/
