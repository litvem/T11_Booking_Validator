const mqtt = require("./mqtt");
const topics = require("./topics");
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 

const MAX_SIZE = 10; 
mqtt.connect();

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp); 

mqtt.client.on("message", (topic, message) => {
    const payload = JSON.parse(message);

    if(topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1))) topic = topics.subsscribeTopic.bookingConfirmation;
    if(topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1))) topic = topics.subsscribeTopic.confirmationError;
    
    switch (true) {
        case topics.subsscribeTopic.bookingRequest:
            // ALTERNATIVE for load balancer- if approved: add topic to publish as change it here.
            (inssuancePQueue.size < MAX_SIZE) ? inssuancePQueue.enqueue(payload) : mqtt.publish(topics.subsscribeTopic.confirmationError, "The queue is overloaded");
            break; 
        case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
            (payload.email) ? console.log("Replace with email function") : console.log("Sending email...")
            var nextRequest = inssuancePQueue.dequeue();
            mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
            break; 
        case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
            var nextRequest = inssuancePQueue.dequeue();
            mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
            break; 
    }
});

