package com.crowdflow.analytics.models;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AggregatedMetrics {
    private static final ObjectMapper mapper = new ObjectMapper();

    private String geohash;
    private long eventCount;
    private double averageSpeed;

    public AggregatedMetrics() {}

    public AggregatedMetrics(String geohash, long eventCount, double averageSpeed) {
        this.geohash = geohash;
        this.eventCount = eventCount;
        this.averageSpeed = averageSpeed;
    }

    public String getGeohash() { return geohash; }
    public void setGeohash(String geohash) { this.geohash = geohash; }

    public long getEventCount() { return eventCount; }
    public void setEventCount(long eventCount) { this.eventCount = eventCount; }

    public double getAverageSpeed() { return averageSpeed; }
    public void setAverageSpeed(double averageSpeed) { this.averageSpeed = averageSpeed; }

    public String toJson() {
        try {
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
