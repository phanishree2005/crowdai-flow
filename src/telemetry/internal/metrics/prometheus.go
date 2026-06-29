package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	EventsIngested = promauto.NewCounter(prometheus.CounterOpts{
		Name: "telemetry_events_ingested_total",
		Help: "The total number of telemetry events successfully ingested to Kafka",
	})

	KafkaDeliveryErrors = promauto.NewCounter(prometheus.CounterOpts{
		Name: "telemetry_kafka_delivery_errors_total",
		Help: "The total number of telemetry events failed to be delivered to Kafka",
	})

	CircuitBreakerDrops = promauto.NewCounter(prometheus.CounterOpts{
		Name: "telemetry_circuit_breaker_drops_total",
		Help: "The total number of events dropped due to the circuit breaker being open",
	})

	CircuitBreakerState = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "telemetry_circuit_breaker_state",
		Help: "The current state of the circuit breaker (0=Closed, 1=HalfOpen, 2=Open)",
	}, []string{"name"})

	IngestLatency = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "telemetry_ingest_latency_seconds",
		Help:    "Latency of processing a single telemetry event from gRPC to Kafka buffer",
		Buckets: prometheus.DefBuckets,
	}, []string{"status"})
)

func Init() {
	// Initialize default states
	CircuitBreakerState.WithLabelValues("KafkaProducer").Set(0)
}
