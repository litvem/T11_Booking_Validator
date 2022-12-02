const CircuitBreaker = require('opossum');
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 
const topics = require("../topics");

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp); 
var breaker;
/* var breakerState; */

const options = {
  timeout: 10000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 10, // When 60% of requests fail, trip the circuit
  resetTimeout: 5000 // After 30 seconds, try again.
};

var objList= [{
  "userid": 12345,
  "requestid": 13,
  "dentistid": 1,
  "issuance": 3,
  "date": "2020-12-14"
},
{
  "userid": 12345,
  "requestid": 13,
  "dentistid": 1,
  "issuance": 1,
  "date": "2020-12-14"
},
{
  "userid": 12345,
  "requestid": 13,
  "dentistid": 1,
  "issuance": 2,
  "date": "2020-12-14"
}]


const mockFunction = function(){
    if(inssuancePQueue.size() < 5){
      inssuancePQueue.enqueue(objList[0])
      console.log(breaker.toJSON())
    }  else{
        console.log('Queue is at maxium capacity');
        console.log(breaker.toJSON())
    }  
}

function reportFallbackEvent(result){
  console.log(result);
}

var topic = "booking/request"

function switchTest(topic){
  switch (true) {
      case topic.includes(topics.subsscribeTopic.bookingRequest):
          breaker = new CircuitBreaker(mockFunction, options);
          console.log(breaker.toJSON())
          console.log("-------------------------------------------------------")

          breaker.fallback(() => "Sorry, out of service right now");
          /* breaker.on('fallback', (result) => reportFallbackEvent(result)); */
          
/*           // if high load => OPEN
          breaker.on("open", () => { 
            if(breakerState != "open"){
                breakerState = "open"
                console.log("Circuitbreaker is open");
                console.log("-------------------------------------------------------")
                console.log(breaker.toJSON())
                console.log("-------------------------------------------------------")

                
            }
          })
          // after reset timeout => HALF OPEN
          breaker.on("halfOpen", () => { 
            if(breakerState != "halfOpen"){
                breakerState = "halfOpen";
                console.log("Circuitbreaker halfOpen");
                console.log("-------------------------------------------------------")
                console.log(breaker.toJSON())
                console.log("-------------------------------------------------------")
            }
          });
          // if no failutes => CLOSE
          breaker.on("close", () => {
            if(breakerState != "close"){
                breakerState = "close";
                console.log("Circuitbreaker close")
                console.log("-------------------------------------------------------")
                console.log(breaker.toJSON())
                console.log("-------------------------------------------------------")
            }
          });
 */
          breaker.fire()

          break;
//---------------------------------------------------------------------------------
      case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
          return "Booking confirmation received. Sending email...";
          break; 
      case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
          return "Booking confirmation error was received. Sending new request";
          break; 
  }
};

switchTest(topic);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function delayingSwitch() {     
     await sleep(10000);
    console.log("10 sec passed")
    switchTest(topic);
}
delayingSwitch();

delayingSwitch();

delayingSwitch();



