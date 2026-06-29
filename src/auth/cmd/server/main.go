package main

import (
	"context"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/crowdflow/enterprise/src/auth/internal/server"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"

	// Envoy ext_authz
	extauthz "github.com/envoyproxy/go-control-plane/envoy/service/auth/v3"
	// Envoy ratelimit
	ratelimit "github.com/envoyproxy/go-control-plane/envoy/service/ratelimit/v3"
)

func main() {
	log.Println("Starting CrowdFlow Auth Service...")

	// Initialize Redis for Rate Limiting
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis for Rate Limiting")

	// Setup gRPC Server
	grpcServer := grpc.NewServer()
	
	authzServer := server.NewAuthzServer(rdb)
	
	// Register Envoy ExtAuthz and RateLimit services
	extauthz.RegisterAuthorizationServer(grpcServer, authzServer)
	ratelimit.RegisterRateLimitServiceServer(grpcServer, authzServer)

	// Listen on port 9001 for ext_authz
	listener, err := net.Listen("tcp", ":9001")
	if err != nil {
		log.Fatalf("Failed to listen on port 9001: %v", err)
	}

	go func() {
		log.Println("gRPC server listening on :9001")
		if err := grpcServer.Serve(listener); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	// Graceful Shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down Auth Service...")
	grpcServer.GracefulStop()
	rdb.Close()
	log.Println("Shutdown complete")
}
