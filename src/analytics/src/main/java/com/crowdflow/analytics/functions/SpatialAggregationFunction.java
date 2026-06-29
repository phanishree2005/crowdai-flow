package com.crowdflow.analytics.functions;

import com.crowdflow.analytics.models.AggregatedMetrics;
import com.crowdflow.analytics.models.TelemetryEvent;
import org.apache.flink.api.common.functions.AggregateFunction;

public class SpatialAggregationFunction implements AggregateFunction<TelemetryEvent, SpatialAggregationFunction.Accumulator, AggregatedMetrics> {

    public static class Accumulator {
        public String geohash;
        public long count;
        public double sumSpeed;
    }

    @Override
    public Accumulator createAccumulator() {
        Accumulator acc = new Accumulator();
        acc.count = 0;
        acc.sumSpeed = 0.0;
        return acc;
    }

    @Override
    public Accumulator add(TelemetryEvent value, Accumulator accumulator) {
        if (value == null || value.getData() == null) return accumulator;
        
        accumulator.geohash = value.getGeohash();
        accumulator.count++;
        accumulator.sumSpeed += value.getData().getSpeed();
        return accumulator;
    }

    @Override
    public AggregatedMetrics getResult(Accumulator accumulator) {
        double avgSpeed = accumulator.count == 0 ? 0 : accumulator.sumSpeed / accumulator.count;
        return new AggregatedMetrics(accumulator.geohash, accumulator.count, avgSpeed);
    }

    @Override
    public Accumulator merge(Accumulator a, Accumulator b) {
        Accumulator merged = new Accumulator();
        merged.geohash = a.geohash != null ? a.geohash : b.geohash;
        merged.count = a.count + b.count;
        merged.sumSpeed = a.sumSpeed + b.sumSpeed;
        return merged;
    }
}
