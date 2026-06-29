# Runbooks

## Alert: High Telemetry Latency
**Symptoms**: P99 ingest latency > 20ms.
**Action**: Check Kafka consumer lag and scale out the Telemetry Ingest deployment.

## Alert: Kafka Partition Imbalance
**Symptoms**: Uneven CPU usage across Kafka brokers.
**Action**: Run partition reassignment script.
