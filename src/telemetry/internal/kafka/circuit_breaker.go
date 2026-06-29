package kafka

import (
	"context"
	"errors"
	"time"

	"github.com/crowdflow/enterprise/src/telemetry/internal/metrics"
	"github.com/sony/gobreaker"
)

type CircuitBreakingProducer struct {
	producer *Producer
	cb       *gobreaker.CircuitBreaker
}

func NewCircuitBreakingProducer(brokers, topic string) (*CircuitBreakingProducer, error) {
	p, err := NewProducer(brokers, topic)
	if err != nil {
		return nil, err
	}

	cbSettings := gobreaker.Settings{
		Name:        "KafkaProducer",
		MaxRequests: 100,
		Interval:    10 * time.Second,
		Timeout:     5 * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
			return counts.Requests >= 100 && failureRatio >= 0.6
		},
		OnStateChange: func(name string, from gobreaker.State, to gobreaker.State) {
			metrics.CircuitBreakerState.WithLabelValues(name).Set(float64(to))
		},
	}

	cb := gobreaker.NewCircuitBreaker(cbSettings)

	return &CircuitBreakingProducer{
		producer: p,
		cb:       cb,
	}, nil
}

func (cbp *CircuitBreakingProducer) Produce(ctx context.Context, key string, value []byte) error {
	_, err := cbp.cb.Execute(func() (interface{}, error) {
		err := cbp.producer.ProduceAsync(key, value)
		return nil, err
	})

	if err != nil {
		if errors.Is(err, gobreaker.ErrOpenState) {
			metrics.CircuitBreakerDrops.Inc()
		}
		return err
	}

	return nil
}

func (cbp *CircuitBreakingProducer) Close() {
	cbp.producer.Close()
}
