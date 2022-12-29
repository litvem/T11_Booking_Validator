const mqtt = require("mqtt");

const HOST = "mqtt://localhost";
const PORT = 1883;

let closed = true;

const cbTester = mqtt.connect(`${HOST}:${PORT}`);

const messages = {
  request: {
    dentistid: 2,
    time: "8:30-9:00",
    userid: "test@test.com",
    sessionid: "p8i0t1kFtGY0_siP_fj6rhfaq3W07fS5",
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

cbTester.on("message", (topic, message) => {
  switch (topic) {
    case topics.cbClose:
      closed = true;
      console.log("cb is closed");
      break;
    case topics.cbOpen:
      closed = false;
      console.log("cb is open");
      break;
  }
});

setInterval(() => {
  if (closed) {
    console.log("closed");
    messages.request.issuance = Date.now();
    cbTester.publish(topics.request, JSON.stringify(messages.request), 1000);
  } else {
    console.log("open")
  }
}, 250);
