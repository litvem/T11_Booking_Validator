const CircuitBreaker = require('opossum');
const mqtt = require("./mqtt");
const topics = require("./topics");
const { MinPriorityQueue }= require('@datastructures-js/priority-queue');
const { sendEmail } = require('./emailConfirmation');

const MAX_SIZE = 5; 
const fallbackMessage = "Out of Service"
const overload = "The Booking queue is overloaded"
/* var payload; */
var state;

mqtt.connect();

let issuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp);
exports.issuancePQueue= issuancePQueue;

const options = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 10% of requests fail, trip the circuit
  resetTimeout: 30000 // After 30 seconds, try again.
};

async function receiveBookingRequest (payload){
  if(!payload.userid || !payload.requestid || !payload.dentistid || !payload.issuance || !payload.date || !payload.name || !payload.sessionid){
    mqtt.publish(topics.publishTopic.formatError + payload.sessionid, " Invalid booking format")
  }else {
    return new Promise((resolve, reject) => {
      if (issuancePQueue.size() >= MAX_SIZE){
        mqtt.publish(topics.publishTopic.bookingError + payload.sessionid, JSON.stringify(overload))
        reject("Queue at max capacity");
      }else{
        issuancePQueue.enqueue(payload);
        console.log("Queue sizes : " + issuancePQueue.size())
        resolve("Request added to the queue.");
      } 
  });
  }
}

async function sendNextRequest (){
  if(issuancePQueue.size > 0) {
    var nextRequest = issuancePQueue.dequeue();
    mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
    console.log("Request processed")
    resolve("Request processed");
  }else {
    reject("Queue is Empty")
  }
}
/* --------------------------------------- 
QUESTION: Do I really need to wrap all the other function in a circuit breaker
    it is maybe enough to only have the booking request since it is the only function
    that could affect the load of the component 
  ----------------------------------------*/
async function receiveConfimation (payload){
  /* if(!payload.userid|| !payload.requestid || !payload.date || !payload.time || !payload.name ||!payload.sessionid){} 
  Question: how are we going to handle format errors in the booking confirmation sended from the DB model handler*/
    if(payload.userid.includes("@")){
      try {
        sendEmail(payload)
      } catch (error) {
        console.log(error)
        mqtt.publish(topics.publishTopic.emailError,"Email couldn't be delivered");
      }
    }else{
      console.log("Request confermed...");
    } 
    await sendNextRequest();
}

/*  Object.freeze can be use to make it INMUTABLE */
const circuits ={
  bookingRequestBreaker: new CircuitBreaker(receiveBookingRequest, options)
};

async function breakerStatus(breaker, payload){
  /* breaker.stats.getHystrixStream().setMaxListeners(100); */ // Increase the number of listeners opposum only uses 10
  if(breaker.closed){
    console.log("Breaker closed: Service available")
  }
  /* Fallback */
  breaker.fallback(() => { "Fallback: " + fallbackMessage});
  /* The variable 'state' is use so that the event is only listened once */
  breaker.on("open", () => {
    if(state != "open"){ //
      state = "open" 
      console.log("Circuit breaker status: Open")
    /* Unsubscribes from the booking request topic to give the component time to process the queued bookings  */
      mqtt.unsubscribe(topics.subsscribeTopic.bookingRequest);
      /* Publishes the open state of the breaker using QoS 1 */
      mqtt.publishBreaker(topics.publishTopic.cbOpen, "Bookings are not available at the moment")
    }
  });
  /* If the next request is succesful the  */
  breaker.on("halfOpen", () => {
    if(state != "halfOpen" ){
      state = "halfOpen" 
      mqtt.subscribe(topics.subsscribeTopic.bookingRequest);
      console.log("Circuit breaker status: half-open")
    }
  });

  await breaker.on("close", () => {
    if(state != "close"){
      state = "close"
      mqtt.publishBreaker(topics.publishTopic.cbClose, "Booking is available")
      console.log("Circuit breaker status: closed")
    }
  });

  // In case the close event dont work, this event can be used to close the circuit breaker.
/*     breaker.on("success ", () => {
    breaker.close();
    if(state != "close"){
      state = "close"
      console.log("Success: closed")
      mqtt.client.publish(topics.publishTopic.cbClose, "Service is available", 1)
    }
  });
 */
  /* Solution in case we will use multiple breakers in the component */
  if(payload === null){
    await breaker.fire().then().catch();
  }else{
    await breaker.fire(payload).then().catch();
  }
}

mqtt.client.on("message", async (topic, message) => {
  payload = JSON.parse(message);
  switch (true) {
    case topic.includes(topics.subsscribeTopic.bookingRequest):
      await breakerStatus(circuits.bookingRequestBreaker, payload);
      break; 
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
      /* Look into creating an event for the booking confirmation, were if it takes to long to come
      I shut down the component to decrease the load on the DB model handler 
      
      alternative a function that creates a timestamp when a booking is send and a timestamp for when 
      the confimarmation is received, then we can compare the difference between them 
      either throw and error ( reject) if the time is long, in that way the circuit breaker
      can also be triggered by the delay between messages from the db model handler.
      */
      receiveConfimation();
      break; 
    case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
      sendNextRequest();
      break; 
  }
});

module.exports