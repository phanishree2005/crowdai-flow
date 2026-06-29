package com.crowdflow.analytics.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryEvent {
    @JsonProperty("event_id")
    private String eventId;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("timestamp")
    private Instant timestamp;
    
    @JsonProperty("data")
    private TelemetryData data;

    public TelemetryEvent() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public TelemetryData getData() { return data; }
    public void setData(TelemetryData data) { this.data = data; }

    // Helper to compute Geohash or simple grid ID for keyBy
    public String getGeohash() {
        if (data == null) return "unknown";
        // Simple 2-decimal rounding as a mock "geohash" for the grid
        return String.format("%.2f,%.2f", data.getLatitude(), data.getLongitude());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TelemetryData {
        @JsonProperty("DeviceID")
        private String deviceId;
        @JsonProperty("Latitude")
        private double latitude;
        @JsonProperty("Longitude")
        private double longitude;
        @JsonProperty("Speed")
        private float speed;
        @JsonProperty("BatteryLevel")
        private float batteryLevel;

        public TelemetryData() {}

        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public float getSpeed() { return speed; }
        public void setSpeed(float speed) { this.speed = speed; }

        public float getBatteryLevel() { return batteryLevel; }
        public void setBatteryLevel(float batteryLevel) { this.batteryLevel = batteryLevel; }
    }
}
