/**
 * 
 */

const CircuitBreaker = require('opossum');
const mqtt = require("./mqtt");
const topics = require("./topics");
const { MinPriorityQueue }= require('@datastructures-js/priority-queue');
const { sendEmail } = require('./emailConfirmation');
const { rmSync } = require('fs');
const { count } = require('console');
//To increase the number of default (10) listener for Node uncomment this and give it a number
//require('events').EventEmitter.defaultMaxListeners = <number of listeners wanted>;

const MAX_SIZE = 5;
const THRESHOLD_MAXS_SIZE = 3; 
const fallbackMessage = "Out of Service"
const overload = "The Booking queue is overloaded"
var state;

mqtt.connect();

let issuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp);
exports.issuancePQueue= issuancePQueue;

const bookingRequestOption = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 10, // When 10% of requests fail, trigger the circuit breaker
  resetTimeout: 30000 // After 30 seconds, try again.
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
 * The half-open state has been modified to optimaze the circuit breaker with the load balancer 
 * and the web application. Since the booking validator is connected to the web application, 
 * it is impossible to know how many booking request will be sended to the booking validator.
 * Therefore instead of waiting for success request, during the half-open state the breaker will
 * check if the queue is at specified threhold capacity. If the queue size is bigger than 
 * the specified threhold the breaker enter the open state and if the queue size is under the 
 * threhold the breaker will close instead. 
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

function fallback(){
  circuits.bookingRequestBreaker.fallback(() => { 
    console.log("Fallback: " + fallbackMessage)
    mqtt.publishQoS1(topics.publishTopic.cbOpen, "Bookings are not available at the moment");
  });
};


mqtt.client.on("message", async (topic, message) => {
  var payload = JSON.parse(message);
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

      break; 
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
      console.log("SWITCH TRIGGERED")
      receiveConfimation(payload);
      break; 
    case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
      sendNextRequest();
      break; 
  }rmSync
});

function sendNextRequest (){
  if(issuancePQueue.size() > 0) {
    const nextRequest = JSON.stringify(issuancePQueue.dequeue());
    mqtt.publishQoS2(topics.publishTopic.saveBooking, nextRequest);
    console.log("Sending next booking Request")
  }else{
    console.log("Queue is empty")
  }
};

async function receiveConfimation (payload){
  if(JSON.stringify(payload.userid).includes("@")){
      const err = await sendEmail(payload);
      console.log("sendEmail response: " + err)
      if(err){
        console.log(err);
        mqtt.publishQoS2( JSON.stringify(topics.publishTopic.emailConfirmation + payload.sessionid), "Email couldn't be delivered");
        sendNextRequest();
      }else{
        console.log("Email was sended")
        mqtt.publishQoS2(JSON.stringify(topics.publishTopic.emailConfirmation + payload.sessionid) , JSON.stringify(payload));
        sendNextRequest();
      }
  }else{
    console.log("Request confermed but No email Provided...");
    mqtt.publishQoS2(JSON.stringify(topics.publishTopic.emailConfirmation + payload.sessionid) ,"No email provided");
    sendNextRequest();
  } 
};
