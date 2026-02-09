import {kafka} from '@packages/utils/kafka'
import { updateUserAnalytics } from './services/analytics.service';


const consumer = kafka.consumer({groupId : 'user-events-group'})

const eventQueue  : any[] = []

const processQueue = async ()=>{
  // console.log('[DEBUG] processQueue called, queue length:', eventQueue.length);
  if(eventQueue.length === 0 )return;

  const events = [...eventQueue];

  for(const event of events){ 

    if(event.action === 'shop_visit'){
      // update shop analytics
    }

    const validActions = [
      'add_to_cart',
      'add_to_wishlist',
      'product_view',
      'remove_from_cart',
      'remove_from_wishlist',
      'purchase'
    ]

    if(!event.action || !validActions.includes(event.action)){
      continue;
    }

    try {
       console.log('[DEBUG] Processing event:', JSON.stringify(event));
       await updateUserAnalytics(event);
       console.log('[DEBUG] Event processed successfully');
    } catch (error) {
      console.log('error processing event : ',error)
    }

  }
  eventQueue.length = 0;
}

setInterval(processQueue,3000);

// kafka consumer for user events

export const consumeKafkaMessages = async()=>{
  //  connect to the kafka broker
  await consumer.connect();
  await consumer.subscribe({topic : 'user-events',fromBeginning : false});
  await consumer.run({
    eachMessage : async({message})=>{

      if(!message.value){
        console.log("did not recieved messages");
        return;
      } 
      const event = JSON.parse(message.value.toString());
      console.log('[DEBUG] Received Kafka message:', event.action);
      eventQueue.push(event);
    }
  })
}

consumeKafkaMessages().catch(console.error);