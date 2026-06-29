package domain

import "time"

type TelemetryData struct {
	DeviceID     string
	Timestamp    time.Time
	Latitude     float64
	Longitude    float64
	Heading      float32
	Speed        float32
	BatteryLevel float32
	Temperature  float32
	Payload      []byte
}

func (t *TelemetryData) Validate() error {
	// Domain validation rules
	if t.DeviceID == "" {
		return ErrInvalidDeviceID
	}
	if t.Latitude < -90 || t.Latitude > 90 {
		return ErrInvalidLocation
	}
	if t.Longitude < -180 || t.Longitude > 180 {
		return ErrInvalidLocation
	}
	return nil
}

var (
	ErrInvalidDeviceID = &DomainError{"invalid device ID"}
	ErrInvalidLocation = &DomainError{"invalid location coordinates"}
)

type DomainError struct {
	msg string
}

func (e *DomainError) Error() string { return e.msg }
