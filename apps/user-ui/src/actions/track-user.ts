"use server";

import { getKafka } from '@packages/utils/kafka/index';
 
export async function sendKafkaEvent(eventData : {
    userId? : string,
    productId? : string,
    shopId? : string,
    action : string,
    device? : string,
    country? : string,
    city? : string

}){
    // console.log('[DEBUG] sendKafkaEvent called with:', JSON.stringify(eventData));
    const kafka = getKafka();
    const producer = kafka.producer();
    
    try {
        await producer.connect();
        console.log('[DEBUG] Producer connected');
        await producer.send({
            topic : 'user-events',
            messages : [{value : JSON.stringify(eventData)}]
        })
        console.log('[DEBUG] Message sent to Kafka successfully',eventData.action);
    } catch (error) {
        console.log('error in sending data to kafka ',error);
    }finally {
        await producer.disconnect();
    }
}