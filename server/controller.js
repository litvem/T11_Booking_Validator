const CircuitBreaker = require('opossum');
const mqtt = require("./mqtt");
const topics = require("./topics");
const { MinPriorityQueue }= require('@datastructures-js/priority-queue');
const { sendEmail } = require('./emailConfirmation');
//To increase the number of default (10) listener for Node uncomment this and give it a number
//require('events').EventEmitter.defaultMaxListeners = <number of listeners wanted>;

/**
 * The MAX_SIZE, THRESHOLD_MAXS_SIZE and bookingRequestOption are set up 
 * with values to make the presentation as easy as possible.
 */
const MAX_SIZE = 5;
const THRESHOLD_MAXS_SIZE = 3; 
const fallbackMessage = "Out of Service"
const overload = "The Booking queue is overloaded"
var state;
var waitingForConfirmation = false;

mqtt.connect();

let issuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp);
exports.issuancePQueue= issuancePQueue;

const bookingRequestOption = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 1, // When 1% of requests fail, trigger the circuit breaker. 
  resetTimeout: 4000 // After 4 seconds, try again. 
};

async function receiveBookingRequest (payload){
    return new Promise((resolve, reject) => {
      if (issuancePQueue.size() >= MAX_SIZE){
        mqtt.publishQoS2(topics.publishTopic.bookingError + JSON.stringify(message.sessionid), JSON.stringify(overload))
        reject();
      }else{
        issuancePQueue.enqueue(payload);
        console.log("Queue sizes : " + issuancePQueue.size())
        resolve();
      } 
  });
};

// Wrapping the breaker in an inmutable object for security purposes. 
const circuits = Object.freeze({
  bookingRequestBreaker: new CircuitBreaker(receiveBookingRequest, bookingRequestOption),
});

function onOpen (){
  if(state != "open"){
    state = "open" 
    console.log("Circuit breaker status: Open")
  /* Publishes the open state of the breaker using QoS 1 */
  mqtt.publishQoS1(topics.publishTopic.cbOpen, "Bookings are not available at the moment")
  /* Unsubscribes from the booking request topic to give the component time to process the queued bookings  */
  mqtt.unsubscribe(topics.subsscribeTopic.bookingRequest);
  }
};

/**
 * The half-open state of the circuit breaker has been modified 
 * so that a load balancer capacity check is executed. 
 * If the load balancer capicity is under a specified threshold capacity
 * the circuit breaker enters  the close state, but if the load balancer
 * capicity is above the threshold capacity the circuit breaker reenters the open state again.
 */
function onHalfOpen() {
  console.log("Circuit breaker status: Half-Open")
  if(issuancePQueue.size() <= THRESHOLD_MAXS_SIZE){
    circuits.bookingRequestBreaker.close();
    mqtt.publishQoS1(topics.publishTopic.cbClose, "Bookings are available");
    console.log("Circuit breaker status: Close")
  }else{
    circuits.bookingRequestBreaker.open();
    console.log("Circuit breaker status: Open")
  }
};

function onClose(){
  if(state != "close"){
    state = "close"
    mqtt.publishQoS1(topics.publishTopic.cbClose, "Bookings are available");
    console.log("Circuit breaker status: closed")
  }
};
/**
 * If a request triggers the fallback, the components 
 * publishes that the circuit breaker is open. 
 */
function fallback(){
  circuits.bookingRequestBreaker.fallback(() => { 
    console.log("Fallback: " + fallbackMessage)
    mqtt.publishQoS1(topics.publishTopic.cbOpen, "Bookings are not available at the moment");
  });
};


mqtt.client.on("message", async (topic, message) => {
  const payload = JSON.parse(message);
  switch (true) {
    case topic.includes(topics.subsscribeTopic.bookingRequest):
      if(circuits.bookingRequestBreaker.close){
        console.log("BREAKER CLOSE")
      }
      fallback();
      circuits.bookingRequestBreaker.on('open',onOpen)
      circuits.bookingRequestBreaker.on("halfOpen", onHalfOpen);
      circuits.bookingRequestBreaker.on('close',onClose)

      await circuits.bookingRequestBreaker.fire(payload).then(()=>{
        circuits.bookingRequestBreaker.removeListener('open', onOpen)
        circuits.bookingRequestBreaker.removeListener('close',onClose)
        if(circuits.bookingRequestBreaker.listenerCount('halfOpen') == 2){
          circuits.bookingRequestBreaker.removeListener('halfOpen', onHalfOpen)
        }
        // To see the number of listener in every breaker event uncomment this code
/*         console.log("listener on open: " + breaker.listenerCount('open'))
        console.log("listener on close: " + breaker.listenerCount('close'))
        console.log("listener on halfOpen: " + breaker.listenerCount('halfOpen')) */
      }).catch();

      if(!waitingForConfirmation){
        sendNextRequest();
      }
      break; 
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
      receiveConfimation(payload);
      break; 
    case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
      sendNextRequest();
      break; 
  }
});

function sendNextRequest (){
  if(issuancePQueue.size() > 0) {
    const nextRequest = JSON.stringify(issuancePQueue.dequeue());
    mqtt.publishQoS2(topics.publishTopic.saveBooking, nextRequest);
    console.log("Sending next booking Request")
    console.log("Queue sizes : " + issuancePQueue.size())
    waitingForConfirmation = true;
  }else{
    waitingForConfirmation = false;
    console.log("Queue is empty")
    console.log("Queue sizes : " + issuancePQueue.size())
  }
};

async function receiveConfimation (payload){
  if(!JSON.stringify(payload.userid).includes("@test")){

      await sendEmail(payload).then(()=> {
        console.log("Email was send")
        mqtt.publishQoS2(topics.publishTopic.emailConfirmation + payload.sessionId , JSON.stringify(payload));
        sendNextRequest();
      }).catch((err)=>{
        console.log(err);
        console.log("Email couldn't be delivered")
        mqtt.publishQoS2(topics.publishTopic.emailError + payload.sessionId, JSON.stringify(payload));
        sendNextRequest();
      })

  }else{
    console.log("Booking request confermed using test email");
    mqtt.publishQoS2(topics.publishTopic.emailConfirmation + payload.sessionId, JSON.stringify(payload));
    sendNextRequest();
  }  
};


