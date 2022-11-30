/**
 * This file runs a basic test on the mqtt connection,
 * makes sure that it subscribes to the topic and send one publish topic to mosquitto. 
 * It also have a basic test for the controllers switch case that handles the 
 * subscribe topics.
*/

const topics = require("../topics");
const mqtt = require("../mqtt");

var bookingRequest = {
    "userid": 12345,
    "requestid": 13,
    "dentistid": 1,
    "issuance": 1,
    "date": "2020-12-14",
}

mqtt.connect(); 
// Look at mosquitto terminal if topic has been published
mqtt.client.publish(topics.publishTopic.saveBooking, JSON.stringify(bookingRequest),0)


/**
 * ** Topic received from broker**
 * To test this part another mosquitto terminal needs to publish a message to the topic
 * topic 1: "booking/confirmed/<some random number>"
 * topic 2: "booking/request"
*/

mqtt.client.on("message", (topic, message) => {
    switch (true) {
        case topic.includes(topics.subsscribeTopic.bookingRequest):
            console.log("Booking request received: " + message);
            break;
            case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
            
            console.log("Booking request received: " + message);
            console.log("Sending email...");
            break; 
    }
});

/** Expected output (often printed first):
 *  --------------------------------------
 * Succesful subscribtion to: booking/request
 * Succesful subscribtion to: booking/confirmed/#
 * Succesful subscribtion to: booking/error/#
 * 
 * if topic 1: 
 * Booking request received: " + <sended message>
 * 
 * if topic 2: 
 * Booking request received: + <sended message>
 * Sending email...
*/













