package eventsourcing

import (
	"context"
	"encoding/json"
	"time"

	"github.com/crowdflow/enterprise/src/telemetry/internal/domain"
	"github.com/crowdflow/enterprise/src/telemetry/internal/kafka"
)

type EventStore interface {
	Append(ctx context.Context, event interface{}) error
}

type TelemetryIngestedEvent struct {
	EventID   string               `json:"event_id"`
	Type      string               `json:"type"`
	Timestamp time.Time            `json:"timestamp"`
	Data      domain.TelemetryData `json:"data"`
}

type KafkaEventStore struct {
	producer *kafka.CircuitBreakingProducer
}

func NewKafkaEventStore(producer *kafka.CircuitBreakingProducer) *KafkaEventStore {
	return &KafkaEventStore{producer: producer}
}

func (s *KafkaEventStore) Append(ctx context.Context, event interface{}) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// Assuming the event is TelemetryIngestedEvent to get the partition key (DeviceID)
	// In a real system, we'd use interfaces or reflection to extract aggregate IDs
	var key string
	if e, ok := event.(TelemetryIngestedEvent); ok {
		key = e.Data.DeviceID
	}

	return s.producer.Produce(ctx, key, payload)
}
