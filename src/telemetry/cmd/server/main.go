package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/crowdflow/enterprise/src/telemetry/internal/cqrs"
	"github.com/crowdflow/enterprise/src/telemetry/internal/eventsourcing"
	"github.com/crowdflow/enterprise/src/telemetry/internal/kafka"
	"github.com/crowdflow/enterprise/src/telemetry/internal/metrics"
	"github.com/crowdflow/enterprise/src/telemetry/internal/server"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"
)

func main() {
	log.Println("Starting CrowdFlow Telemetry Ingestion Service...")

	// 1. Initialize Observability (Prometheus)
	metrics.Init()
	go func() {
		http.Handle("/metrics", promhttp.Handler())
		log.Println("Metrics server listening on :9090")
		if err := http.ListenAndServe(":9090", nil); err != nil {
			log.Fatalf("Metrics server failed: %v", err)
		}
	}()

	// 2. Initialize Kafka Producer with Circuit Breaker
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "localhost:9092"
	}

	producer, err := kafka.NewCircuitBreakingProducer(kafkaBrokers, "telemetry_events")
	if err != nil {
		log.Fatalf("Failed to initialize Kafka producer: %v", err)
	}
	defer producer.Close()

	// 3. Initialize Event Sourcing & CQRS Handlers
	eventStore := eventsourcing.NewKafkaEventStore(producer)
	commandHandler := cqrs.NewTelemetryCommandHandler(eventStore)

	// 4. Initialize gRPC Server
	grpcServer := grpc.NewServer()
	telemetryServer := server.NewTelemetryGRPCServer(commandHandler)
	
	// Note: Registration of proto interface will be linked via the generated code later.
	// For now we just instantiate the server struct.
	_ = telemetryServer

	listener, err := net.Listen("tcp", ":9000")
	if err != nil {
		log.Fatalf("Failed to listen on port 9000: %v", err)
	}

	go func() {
		log.Println("gRPC Telemetry server listening on :9000")
		if err := grpcServer.Serve(listener); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	// Graceful Shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down Telemetry Service...")
	grpcServer.GracefulStop()
	log.Println("Shutdown complete")
}
