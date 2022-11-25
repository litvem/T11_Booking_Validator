const mqtt = require("./mqtt");
const topics = require("./topics");
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 

const MAX_SIZE = 10; // just as an example for now
mqtt.connect();

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp); 

mqtt.client.on("message", (topic, message) => {
    const payload = JSON.parse(message);
    switch (topic) {
        case topics.subsscribeTopic.bookingRequest:
            // ALTERNATIVE for load balancer- if approved: add topic to publish as change it here.
            (inssuancePQueue.size < MAX_SIZE) ? inssuancePQueue.enqueue(payload) : mqtt.publish(topics.subsscribeTopic.confirmationError, "The queue is overloaded");
            break; 
        case topics.subsscribeTopic.bookingConfirmation:
            (payload.email) ? console.log("Replace with email function") : console.log("Sending email...")
            var nextRequest = inssuancePQueue.dequeue();
            mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
            break; 
        case topics.subsscribeTopic.confirmationError:
            var nextRequest = inssuancePQueue.dequeue();
            mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
            break; 
    }
});

