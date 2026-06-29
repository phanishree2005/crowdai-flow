package cqrs

import (
	"context"

	"github.com/crowdflow/enterprise/src/telemetry/internal/domain"
	"github.com/crowdflow/enterprise/src/telemetry/internal/eventsourcing"
)

// IngestTelemetryCommand is a CQRS Command
type IngestTelemetryCommand struct {
	Data domain.TelemetryData
}

type TelemetryCommandHandler struct {
	eventStore eventsourcing.EventStore
}

func NewTelemetryCommandHandler(store eventsourcing.EventStore) *TelemetryCommandHandler {
	return &TelemetryCommandHandler{
		eventStore: store,
	}
}

func (h *TelemetryCommandHandler) Handle(ctx context.Context, cmd IngestTelemetryCommand) error {
	// 1. Validate Command against domain constraints
	if err := cmd.Data.Validate(); err != nil {
		return err
	}

	// 2. Convert Command to Event for Event Sourcing
	event := eventsourcing.TelemetryIngestedEvent{
		EventID:   generateID(),
		Type:      "TelemetryIngested",
		Timestamp: cmd.Data.Timestamp,
		Data:      cmd.Data,
	}

	// 3. Persist Event
	return h.eventStore.Append(ctx, event)
}

func generateID() string {
	// Placeholder for UUID generation
	return "evt-12345"
}
