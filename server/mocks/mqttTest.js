const mqtt = require("../mqtt");
const topics = require("../topics");

 var bookingRequest = {
    source:"client1",
    "userid": 12345,
    "requestid": 13,
    "dentistid": 1,
    "issuance": 1602406766314,
    "date": "2020-12-14"
}

var bookingResponse = {
    "userid": 12345,
    "requestid": 13,
    "time": "9:30"
}

mqtt.client.on("connect", () => {
    console.log(`MQTT client connected`);
    mqtt.subscribe(topics.subsscribeTopic.bookingRequest);
    mqtt.subscribe(topics.subsscribeTopic.bookingConfirmation);

}); 

mqtt.client.publish(topics.publishTopic.saveBooking, JSON.stringify(bookingRequest),0)
console.log("Publish: " + topics.publishTopic.saveBooking);
mqtt.client.publish(topics.subsscribeTopic.bookingConfirmation, JSON.stringify(bookingResponse),0)
console.log("Publish: " + topics.publishTopic.saveBooking);

mqtt.client.on("message", (topic, message) => {
    const data = JSON.parse(message);
    switch (topic) {
        case topics.subsscribeTopic.bookingRequest:
            console.log(topics.subsscribeTopic.bookingRequest)
            console.log("Booking request received: " + data);
            break;
        case topics.subsscribeTopic.bookingConfirmation:
            console.log(topics.subsscribeTopic.bookingConfirmation)
            console.log("Booking request received: " + data);
            console.log("Sending email...");
            break; 
    }
});








