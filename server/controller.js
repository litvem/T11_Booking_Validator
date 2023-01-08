const CircuitBreaker = require('opossum');
const mqtt = require("./mqtt");
const topics = require("./topics");
const { MinPriorityQueue }= require('@datastructures-js/priority-queue');
const { sendEmail } = require('./emailConfirmation');
const cbStatus = "Circuit Breaker: ";

/**
 * The MAX_SIZE, THRESHOLD_MAXS_SIZE and bookingRequestOption are set up 
 * with values to make the presentation as easy as possible.
 */
const MAX_SIZE = 5;
const THRESHOLD_MAXS_SIZE = MAX_SIZE * 0.6; // 60% of the load balancer max size
const fallbackMessage = "Out of Service"
const confirmationResponse = "Request confermed but No email Provided..."
const emailSendMessage = "Email was sended"
const emailError = "Email couldn't be delivered";
const emptyQueueMessage = "Queue is empty"
const nextRequestMessage = "Sending next request"
var state;
var waitingForConfirmation = false;

mqtt.connect();

let issuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp);

const bookingRequestOption = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 1, // When 1% of requests fail, trigger the circuit breaker. 
  resetTimeout: 4000 // After 4 seconds, try again. 
};

async function receiveBookingRequest (payload){
    return new Promise((resolve, reject) => {
      if (issuancePQueue.size() >= MAX_SIZE){
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
    console.log( cbStatus + "Open")
    mqtt.publishQoS1(topics.publishTopic.cbOpen, "Bookings are not available at the moment")
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
  console.log(cbStatus + "Half-Open")
  if(issuancePQueue.size() <= THRESHOLD_MAXS_SIZE){
    circuits.bookingRequestBreaker.close();
    onClose();
  }else{
    circuits.bookingRequestBreaker.open();
    console.log(cbStatus + "Reentering Open State")
  }
};

function onClose(){
  if(state != "close"){
    state = "close"
    mqtt.publishQoS1(topics.publishTopic.cbClose, "Bookings are available");
    console.log( cbStatus + "Closed")
  }
};
/**
 * If a request is received while the open state is active,
 * the fallback send a message to the browser and resends 
 */

circuits.bookingRequestBreaker.fallback((payload) => { 
  console.log(fallbackMessage + ". Sending response to " + payload.name + " with sessionId " +  payload.sessionId)
  mqtt.publishQoS2(topics.publishTopic.bookingError + payload.sessionId, JSON.stringify(fallbackMessage))

  //The event listener is not beign trigered on the open state requirering us to publish the open topic in the fallback as a backup
  mqtt.publishQoS1(topics.publishTopic.cbOpen, "")
 });


mqtt.client.on("message", async (topic, message) => {
  const payload = JSON.parse(message);
  switch (true) {
    case topic.includes(topics.subsscribeTopic.bookingRequest):
      circuits.bookingRequestBreaker.on('open',onOpen)
      circuits.bookingRequestBreaker.on("halfOpen", onHalfOpen);
      circuits.bookingRequestBreaker.on('close',onClose)

      await circuits.bookingRequestBreaker.fire(payload).then(()=>{
        circuits.bookingRequestBreaker.removeListener('open', onOpen)
        circuits.bookingRequestBreaker.removeListener('close',onClose)
        if(circuits.bookingRequestBreaker.listenerCount('halfOpen') == 2){
          circuits.bookingRequestBreaker.removeListener('halfOpen', onHalfOpen)
        }

        // To see verify the number of listener in every breaker event uncomment this code
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
    console.log(nextRequestMessage)
    console.log("Queue sizes : " + issuancePQueue.size())
    waitingForConfirmation = true;
  }else{
    waitingForConfirmation = false;
    console.log(emptyQueueMessage)
    console.log("Queue sizes : " + issuancePQueue.size())
  }
};

async function receiveConfimation (payload){
  if(!JSON.stringify(payload.userid).includes("@test")){
    await sendEmail(payload).then(()=> {
      console.log(emailSendMessage)
      mqtt.publishQoS1(topics.publishTopic.emailConfirmation + payload.sessionId , JSON.stringify(payload));
      sendNextRequest();
    }).catch((err)=>{
      console.log(err);
      console.log(emailError)
      mqtt.publishQoS1(topics.publishTopic.emailError + payload.sessionId, JSON.stringify(payload));
      sendNextRequest();
    })

  }else{
    console.log(confirmationResponse);
    mqtt.publishQoS1(topics.publishTopic.emailConfirmation + payload.sessionId, JSON.stringify(payload));
    sendNextRequest();
  }  
};


