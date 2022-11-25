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
mqtt.connect();
/**
 * Expect: 
    Succesful subscribtion to: booking/request
    Succesful subscribtion to: booking/confirmed/#
    Succesful subscribtion to: booking/error/#
 */

mqtt.client.publish(topics.publishTopic.saveBooking, JSON.stringify(bookingRequest),0)



/** To test this part another mosquitto terminal needs to publish a message to the topic*/
mqtt.client.on("message", (topic, message) => {
    const data = JSON.parse(message);
    switch (topic) {
        case topics.subsscribeTopic:
            console.log("Booking request received: " + data);
            break;
        case topics.subsscribeTopic.bookingConfirmation:
            console.log("Booking request received: " + data);
            console.log("Sending email...");
            break; 
    }
}); 








