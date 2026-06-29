package com.crowdflow.analytics;

import com.crowdflow.analytics.functions.SpatialAggregationFunction;
import com.crowdflow.analytics.functions.TelemetryDeserializer;
import com.crowdflow.analytics.models.AggregatedMetrics;
import com.crowdflow.analytics.models.TelemetryEvent;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows;
import org.apache.flink.streaming.api.windowing.time.Time;

import java.time.Duration;

public class Job {
    public static void main(String[] args) throws Exception {
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        String brokers = System.getenv().getOrDefault("KAFKA_BROKERS", "localhost:9092");

        KafkaSource<TelemetryEvent> source = KafkaSource.<TelemetryEvent>builder()
                .setBootstrapServers(brokers)
                .setTopics("telemetry_events")
                .setGroupId("analytics-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new TelemetryDeserializer())
                .build();

        DataStream<TelemetryEvent> stream = env.fromSource(
                source,
                WatermarkStrategy.<TelemetryEvent>forBoundedOutOfOrderness(Duration.ofSeconds(20))
                        .withTimestampAssigner((event, timestamp) -> event.getTimestamp().toEpochMilli()),
                "Kafka Source");

        DataStream<AggregatedMetrics> aggregatedStream = stream
                .keyBy(TelemetryEvent::getGeohash)
                .window(TumblingEventTimeWindows.of(Time.minutes(1)))
                .aggregate(new SpatialAggregationFunction());

        // For simplicity, sinking output as strings back to Kafka
        KafkaSink<String> sink = KafkaSink.<String>builder()
                .setBootstrapServers(brokers)
                .setRecordSerializer(KafkaRecordSerializationSchema.builder()
                        .setTopic("aggregated_metrics")
                        .setValueSerializationSchema(new SimpleStringSchema())
                        .build()
                )
                .build();

        aggregatedStream
                .map(AggregatedMetrics::toJson)
                .sinkTo(sink);

        env.execute("CrowdFlow Spatial-Temporal Analytics");
    }
}
