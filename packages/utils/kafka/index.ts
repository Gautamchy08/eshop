import {Kafka } from "kafkajs"

let kafkaInstance: Kafka | null = null;

export const getKafka = () => {
    if (!kafkaInstance) {
        kafkaInstance = new Kafka({
            clientId: "kafka-service",
            brokers: ["pkc-xrnwx.asia-south2.gcp.confluent.cloud:9092"],
            ssl: true,
            sasl: {
                mechanism: "plain",
                username: process.env.KAFKA_API_KEY!,
                password: process.env.KAFKA_API_SECRET!
            }
        });
    }
    return kafkaInstance;
}

// For backward compatibility
export const kafka = new Kafka({
    clientId: "kafka-service",
    brokers: ["pkc-xrnwx.asia-south2.gcp.confluent.cloud:9092"],
    ssl: true,
    sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!
    }
})