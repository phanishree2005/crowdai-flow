package com.crowdflow.analytics.functions;

import com.crowdflow.analytics.models.TelemetryEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.flink.api.common.serialization.DeserializationSchema;
import org.apache.flink.api.common.typeinfo.TypeInformation;

import java.io.IOException;

public class TelemetryDeserializer implements DeserializationSchema<TelemetryEvent> {
    private transient ObjectMapper objectMapper;

    @Override
    public void open(InitializationContext context) throws Exception {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    public TelemetryEvent deserialize(byte[] message) throws IOException {
        if (objectMapper == null) {
            objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        }
        try {
            return objectMapper.readValue(message, TelemetryEvent.class);
        } catch (Exception e) {
            // In a production app, we would route to a Dead Letter Queue (DLQ)
            // For now, return a null and handle it downstream or filter
            return null;
        }
    }

    @Override
    public boolean isEndOfStream(TelemetryEvent nextElement) {
        return false;
    }

    @Override
    public TypeInformation<TelemetryEvent> getProducedType() {
        return TypeInformation.of(TelemetryEvent.class);
    }
}
