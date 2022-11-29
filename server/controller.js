const mqtt = require("./mqtt");
const topics = require("./topics");
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 
const { sendEmail } = require("./emailConfirmation");

const MAX_SIZE = 10; 
mqtt.connect();

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.issuance);

function sendRequest() {
    if(inssuancePQueue.size > 0) {
        var nextRequest = inssuancePQueue.dequeue();
        mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
    }else {
        console.log("Queue is Empty")
    }
}

mqtt.client.on("message", (topic, message) => {
    const payload = JSON.parse(message);
/** not adding the email or the name since, we can make it optional
    "All components must be capable of appropriately handling standard failures,
    such as wrongly formatted data inputs or out of bounds inputs for the defined
    interfaces."
*/ 
    if(!payload.userid || !payloadrequestid || !payload.dentistid || !payload.issuance || !payload.date || !payload.name){
        // add publish format error message.
    }
    switch (true) {
        case topic.includes(topics.subsscribeTopic.bookingRequest):
            // ALTERNATIVE for load balancer- if approved: add topic to publish as change it here. 
            // NEW TOPIC ADDED!
            (inssuancePQueue.size < MAX_SIZE) ? inssuancePQueue.enqueue(payload) : mqtt.publish(topics.publishTopic.bookingError, "The booking queue is overloaded");
            break; 
        case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
            (payload.email) ? sendEmail(payload) : console.log("Sending email...")
            sendRequest();

            break; 
        case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
             sendRequest();
            break; 
    }
});

/**
 * Do we await for the response or do we want to dequeue continuesly?
    
    setInterval(function(){
    someMethod();
    },5000)
 */