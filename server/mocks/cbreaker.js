const CircuitBreaker = require('opossum');
const mqtt = require("../mqtt");
const topics = require("../topics");
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 
const { sendEmail } = require("../emailConfirmation");

const MAX_SIZE = 5; 
mqtt.connect();

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp); 

const options = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 60% of requests fail, trip the circuit
  resetTimeout: 3000 // After 30 seconds, try again.
};

/* const init_state =  {
  enabled: true,
  name: 'functionName',
  closed: true,
  open: false,
  halfOpen: false,
  warmUp: false,
  shutdown: false
} */


var counter = 0;
const receiveBookingRequest = () =>{
/*   (inssuancePQueue.size() < MAX_SIZE)? inssuancePQueue.enqueue(payload) : console.log("The booking queue is overloaded");
  console.log(JSON.stringify(payload) + 'in the function')
  console.log(inssuancePQueue.size()) */
  counter ++;
  console.log("**************************")
  console.log("booking request received");
  console.log("<<<<<REQUEST>>>>>>");
  console.log("counter: " + counter)
  console.log("--------------------------")
  console.log("--------------------------")
}

const receiveConfimation = (payload) => {
  (payload.email) ? sendEmail(payload) : console.log("Sending email...")
  var nextRequest = inssuancePQueue.dequeue();
  mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
}

const receiveError = () => {
  var nextRequest = inssuancePQueue.dequeue();
 // mqtt.publish(topics.publishTopic.saveBooking, JSON.stringify(nextRequest));
  console.log(JSON.stringify(nextRequest))
}


const circuits = {
  bookingRequestBreaker: new CircuitBreaker(receiveBookingRequest, options),
  confirmationBreaker: new CircuitBreaker(receiveConfimation, options),
  confirmationErrorBreaker: new CircuitBreaker(receiveError, options),
};

/* var breaker; */
var breakerState;
var payload;

// check stats to see if the circuit should be opened


mqtt.client.on("message", (topic, message) => {
  payload = JSON.parse(message);
  switch (true) {
 //  BOOKING REQUEST   
    case topic.includes(topics.subsscribeTopic.bookingRequest):
/*       breaker = new CircuitBreaker(receiveBookingRequest, options); */
      console.log(circuits.bookingRequestBreaker.toJSON())

     /*  receiveBookingRequest(); */

      circuits.bookingRequestBreaker.fallback(() => "fallback function");
      // if high load => OPEN
/*       circuits.bookingRequestBreaker.on("open", () => { 
        if(breakerState != "open"){
          breakerState = "open";
          console.log("CircuitBreaker open");
          console.log("--------------------")
          console.log(circuits.bookingRequestBreaker.toJSON())
          console.log("--------------------")
          console.log(circuits.bookingRequestBreaker.)
        }
      }) */
      // after reset timeout => HALF OPEN
/*       circuits.bookingRequestBreaker.on("halfOpen", () => { 
       if(breakerState != "halfOpen"){
         breakerState = "halfOpen";
         console.log("Circuitbreaker halfOpen");
         console.log("--------------------")
         console.log(circuits.bookingRequestBreaker.toJSON())
         console.log("--------------------")
       }
     }); */
      // if no failutes => CLOSE
      circuits.bookingRequestBreaker.on("close", () => {
       if(breakerState != "closed"){
         breakerState = "closed";
         console.log("Circuitbreaker is closed")
         console.log("--------------------")
         console.log(circuits.bookingRequestBreaker.toJSON())
         console.log("--------------------")
       }
      });
/*       circuits.bookingRequestBreaker.on("success", () => {
        if(breakerState != "closed"){
          breaker.close();
          console.log("Circuitbreaker closed");
          console.log("Circuitbreaker is closed")
          console.log("--------------------")
          console.log(circuits.bookingRequestBreaker.toJSON())
          console.log("--------------------")
          breakerState = "closed";
        }
      }); */

      circuits.bookingRequestBreaker.fire()
/*       .then(console.log)
      .catch(console.error); */
      break; 

// CONFIRMATION
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
      breaker = new CircuitBreaker(receiveConfimation, options);
      breaker.fallback(() => "circuit breaker fallback");
      // if high load => OPEN
     breaker.on("open", () => { 
        if(breakerState != "open"){
          breakerState = "open"
          console.log("Circuitbreaker is open");
          
        }
      })
      // after reset timeout => HALF OPEN
     breaker.on("halfOpen", () => { 
       if(breakerState != "halfOpen"){
         breakerState = "halfOpen";
         console.log("Circuitbreaker halfOpen");
       }
     });
      // if no failutes => CLOSE
/*             breaker.on("close", () => {
       if(breakerState != "closed"){
         breakerState = "closed";
         console.log("Circuitbreaker is closed")
       }
      }); */
      breaker.on("success", () => {
        if(breakerState != "closed"){
          breaker.close();
          console.log("Circuitbreaker closed");
          breakerState = "closed";
        }
        }
      );

      breaker.fire()
      break; 
// ERROR
    case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
      breaker = new CircuitBreaker(receiveError, options);
      breaker.fallback(() => "circuit breaker closes: " + breaker.state);
      // if high load => OPEN
     breaker.on("open", () => { 
        if(breakerState != "open"){
          breakerState = "open"
          console.log("Circuitbreaker is open");
          
        }
      })
      // after reset timeout => HALF OPEN
     breaker.on("halfOpen", () => { 
       if(breakerState != "halfOpen"){
         breakerState = "halfOpen";
         console.log("Circuitbreaker halfOpen");
       }
     });
      // if no failutes => CLOSE
/*             breaker.on("close", () => {
       if(breakerState != "closed"){
         breakerState = "closed";
         console.log("Circuitbreaker is closed")
       }
      }); */
      breaker.on("success", () => {
        if(breakerState != "closed"){
          breaker.close();
          console.log("Circuitbreaker closed");
          breakerState = "closed";
        }
        }
      );

      breaker.fire()
      break; 
  }
});

/* function breakerStatus(breaker){
            breaker.fallback(() => "circuit breaker closes: " + breaker.state.closed );
            // if high load => OPEN
           breaker.on("open", () => { 
              if(breakerState != "open"){
                breakerState = "open"
                console.log("Circuitbreaker is open");
                
              }
            })
            // after reset timeout => HALF OPEN
           breaker.on("halfOpen", () => { 
             if(breakerState != "halfOpen"){
               breakerState = "halfOpen";
               console.log("Circuitbreaker halfOpen");
             }
           });
            // if no failutes => CLOSE

            breaker.on("close", () => {
             if(breakerState != "closed"){
               breakerState = "closed";
               console.log("Circuitbreaker is closed")
             }
            }); 

            breaker.on("success", () => {
              if(breakerState != "closed"){
                breaker.close();
                console.log("Circuitbreaker closed");
                breakerState = "closed";
              }
              }
            );

            breaker.fire()
}  */

/** Look into it. 
 * Calculating errorThresholdPercentage
The errorThresholdPercentage value is compared to the error rate. 
That rate is determined by dividing the number of failures by
the number of times the circuit has been fired. You can see this comparison here:

// check stats to see if the circuit should be opened

const stats = circuit.stats;
  if ((stats.fires < circuit.volumeThreshold) && !circuit.halfOpen) return;
  const errorRate = stats.failures / stats.fires * 100;
  if (errorRate > circuit.options.errorThresholdPercentage || circuit.halfOpen) {
    circuit.open();
  }

  */

/* 
breaker.fallback(() => "Sorry, out of service right now");

breaker.on("open", () => { 
  if(breakerState != "open"){
    breakerState = "open"
    console.log("Circuitbreaker is open");
    
  }
})
breaker.on("halfOpen", () => { 
  if(breakerState != "halfOpen"){
    breakerState = "halfOpen";
    console.log("Circuitbreaker is halfOpen");
  }
});

breaker.on("close", () => {
  if(breakerState != "close"){
    breakerState = "close";
    console.log("Circuitbreaker is close")
  }
});

breaker.fire() */