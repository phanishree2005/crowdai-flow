package kafka

import (
	"fmt"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/crowdflow/enterprise/src/telemetry/internal/metrics"
)

type Producer struct {
	producer *kafka.Producer
	topic    string
}

func NewProducer(brokers string, topic string) (*Producer, error) {
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"acks":              "all",
		"retries":           3,
		"linger.ms":         5,
	})

	if err != nil {
		return nil, err
	}

	// Delivery report handler for asynchronous production
	go func() {
		for e := range p.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					fmt.Printf("Delivery failed: %v\n", ev.TopicPartition.Error)
					metrics.KafkaDeliveryErrors.Inc()
				} else {
					metrics.EventsIngested.Inc()
				}
			}
		}
	}()

	return &Producer{producer: p, topic: topic}, nil
}

func (p *Producer) ProduceAsync(key string, value []byte) error {
	err := p.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.topic, Partition: kafka.PartitionAny},
		Key:            []byte(key),
		Value:          value,
	}, nil)

	return err
}

func (p *Producer) Close() {
	p.producer.Flush(15 * 1000)
	p.producer.Close()
}
