const mqtt = require("mqtt");

const HOST = "mqtt://localhost";
const PORT = 1883;

const REQUEST_INTERVAL = 30;

let closed = true;

const cbTester = mqtt.connect(`${HOST}:${PORT}`);

const messages = {
  request: {
    dentistid: 2,
    time: "8:30-9:00",
    userid: "test@test.com",
    sessionId: "p8i0t1kFtGY0_siP_fj6rhfaq3W07fS5",
    date: "2023-01-15",
    name: "test",
    issuance: "",
  },
};

const topics = {
  request: "booking/request",
  cbOpen: "circuitbreak/open",
  cbClose: "circuitbreak/close",
};

cbTester.on("connect", () => {
  cbTester.subscribe(topics.cbClose);
  cbTester.subscribe(topics.cbOpen);
});

let openingTime;
let closingTime;

cbTester.on("message", (topic, message) => {
  switch (topic) {
    case topics.cbClose:
      closed = true;
      console.log("cb is closed");
      closingTime = new Date();
      let difference = (closingTime.getTime() - openingTime.getTime()) / 1000
      console.log(`The system took ${difference} seconds to empy the queue and close the circuit breaker`)
      break;
    case topics.cbOpen:
      closed = false;
      console.log("cb is open");
      openingTime = new Date();
      break;
  }
});

function publish() {
  let counter = 0;
  let startTime;

  let publish = setInterval(() => {
    if (closed) {
      counter += 1;
      console.log("closed");
      messages.request.issuance = Date.now();
      cbTester.publish(topics.request, JSON.stringify(messages.request), 1000);
      if (counter == 1) {
        startTime = new Date();
      }
    } else {
      let openTime = new Date();
      seconds = (openTime.getTime() - startTime.getTime()) / 1000;
      clearInterval(publish);
      console.log(
        `With requests being sent every ${REQUEST_INTERVAL} milliseconds, it tooked ${counter} requests and ${seconds} seconds to max out the queue and open the cb`
      );
    }
  }, REQUEST_INTERVAL);
}

publish();
