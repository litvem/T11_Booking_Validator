const CircuitBreaker = require('opossum');
const mqtt = require("./mqtt");
const topics = require("./topics");
const { MinPriorityQueue }= require('@datastructures-js/priority-queue');
const { sendEmail } = require('./emailConfirmation');
//To increase the number of default (10) listener for Node uncomment this and give it a number
//require('events').EventEmitter.defaultMaxListeners = <number of listeners wanted>;

const MAX_SIZE = 5; 
const fallbackMessage = "Out of Service"
const overload = "The Booking queue is overloaded"
var state;

mqtt.connect();

/* Uncomment to simulate a dequeue of the queue
   The function dequeues the booking requeste every 4 seconds
*/
/* setInterval(() => {
    if (issuancePQueue.isEmpty()) return;
    issuancePQueue.dequeue();
    console.log("1 request processed")
}, 4000); */

let issuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp);
exports.issuancePQueue= issuancePQueue;

const bookingRequestOption = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 10, // When 10% of requests fail, trip the circuit
  resetTimeout: 3000 // After 30 seconds, try again.
};

async function receiveBookingRequest (payload){
/*   if(!payload.userid || !payload.requestid || !payload.dentistid || !payload.issuance || !payload.date || !payload.name || !payload.sessionid){
    mqtt.publish(topics.publishTopic.formatError + payload.sessionid, " Invalid booking format")
  }else { */
    return new Promise((resolve, reject) => {
      if (issuancePQueue.size() >= MAX_SIZE){
        mqtt.publish(topics.publishTopic.bookingError + payload.sessionid, JSON.stringify(overload))
        reject();
      }else{
        issuancePQueue.enqueue(payload);
        console.log("Queue sizes : " + issuancePQueue.size())
        resolve();
      } 
  });
/*   } */
}

const circuits = Object.freeze({
  bookingRequestBreaker: new CircuitBreaker(receiveBookingRequest, bookingRequestOption),
  confirmationBreaker: new CircuitBreaker(receiveBookingRequest, bookingRequestOption)

});

function onOpen (){
  if(state != "open"){ //
    state = "open" 
    console.log("Circuit breaker status: Open")
  /* Unsubscribes from the booking request topic to give the component time to process the queued bookings  */
    mqtt.unsubscribe(topics.subsscribeTopic.bookingRequest);
    /* Publishes the open state of the breaker using QoS 1 */
    mqtt.publishBreaker(topics.publishTopic.cbOpen, "Bookings are not available at the moment")
  }
}

function onHalfOpen (){
  if(state != "halfOpen" ){
    state = "halfOpen" 
    mqtt.subscribe(topics.subsscribeTopic.bookingRequest);
    console.log("Circuit breaker status: half-open")
  }
}

function onClose(){
  if(state != "close"){
    state = "close"
    mqtt.publishBreaker(topics.publishTopic.cbClose, "Booking is available")
    console.log("Circuit breaker status: closed")
    const listener = 'close'
  }
}
function fallback(breaker){
  breaker.fallback(() => { 
    console.log("Fallback: " + fallbackMessage)
    mqtt.publishBreaker(topics.publishTopic.cbOpen, "Bookings are not available at the moment")
  });
}

mqtt.client.on("message", async (topic, message) => {
  payload = JSON.parse(message);
  switch (true) {
    case topic.includes(topics.subsscribeTopic.bookingRequest):
      const breaker = circuits.bookingRequestBreaker;
      if(breaker.close){
        console.log("BREAKER CLOSE")
      }
      fallback(breaker);
      breaker.on('open',onOpen)
      breaker.on("halfOpen", onHalfOpen);
      breaker.on('close',onClose)

      await breaker.fire(payload).then(()=>{
        breaker.removeListener('open', onOpen)
        breaker.removeListener('close',onClose)
        if(breaker.listenerCount('halfOpen') == 2){
          breaker.removeListener('halfOpen', onHalfOpen)
        }
        // To see the number of listener in every breaker event uncomment this code
/*         console.log("listener on open: " + breaker.listenerCount('open'))
        console.log("listener on close: " + breaker.listenerCount('close'))
        console.log("listener on halfOpen: " + breaker.listenerCount('halfOpen')) */
      }).catch();


      break; 
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
      receiveConfimation();
      break; 
    case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
      sendNextRequest();
      break; 
  }
});


async function sendNextRequest (){
  if(issuancePQueue.size > 0) {
    var nextRequest = issuancePQueue.dequeue();
    mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
    console.log("Request processed")
  }
}

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

