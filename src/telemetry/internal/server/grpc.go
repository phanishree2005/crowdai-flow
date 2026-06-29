package server

import (
	"context"
	"io"
	"time"

	pb "github.com/crowdflow/enterprise/api/gen/go/crowdflow/telemetry/v1"
	"github.com/crowdflow/enterprise/src/telemetry/internal/cqrs"
	"github.com/crowdflow/enterprise/src/telemetry/internal/domain"
	"github.com/crowdflow/enterprise/src/telemetry/internal/metrics"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type TelemetryGRPCServer struct {
	pb.UnimplementedTelemetryServiceServer
	commandHandler *cqrs.TelemetryCommandHandler
}

func NewTelemetryGRPCServer(handler *cqrs.TelemetryCommandHandler) *TelemetryGRPCServer {
	return &TelemetryGRPCServer{
		commandHandler: handler,
	}
}

func (s *TelemetryGRPCServer) Ingest(stream pb.TelemetryService_IngestServer) error {
	var eventsProcessed int32

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			return stream.SendAndClose(&pb.IngestResponse{
				Success:         true,
				EventsProcessed: eventsProcessed,
			})
		}
		if err != nil {
			return err
		}

		start := time.Now()

		cmd := cqrs.IngestTelemetryCommand{
			Data: domain.TelemetryData{
				DeviceID:     req.DeviceId,
				Timestamp:    req.Timestamp.AsTime(),
				Latitude:     req.Latitude,
				Longitude:    req.Longitude,
				Heading:      req.Heading,
				Speed:        req.Speed,
				BatteryLevel: req.BatteryLevel,
				Temperature:  req.Temperature,
				Payload:      req.Payload,
			},
		}

		err = s.commandHandler.Handle(context.Background(), cmd)
		if err != nil {
			metrics.IngestLatency.WithLabelValues("error").Observe(time.Since(start).Seconds())
			return status.Errorf(codes.Internal, "failed to ingest telemetry: %v", err)
		}

		metrics.IngestLatency.WithLabelValues("success").Observe(time.Since(start).Seconds())
		eventsProcessed++
	}
}
