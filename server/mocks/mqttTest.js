/**
 * This file runs a basic test on the mqtt connection,
 * makes sure that it subscribes to the topic and send one publish topic to mosquitto. 
 * It also have a basic test for the controllers switch case that handles the 
 * subscribe topics.
 */

const topics = require("../topics");
const mqtt = require("../mqtt");

var bookingRequest = {
    source:"client1",
    "userid": 12345,
    "requestid": 13,
    "dentistid": 1,
    "issuance": 1602406766314,
    "date": "2020-12-14"
}

mqtt.connect(); 
/** Expected output:
 *  ----------------
 * Succesful subscribtion to: booking/request
 * Succesful subscribtion to: booking/confirmed/#
 * Succesful subscribtion to: booking/error/#
*/

// Look at mosquitto terminal if published
mqtt.client.publish(topics.publishTopic.saveBooking, JSON.stringify(bookingRequest),0)


var topic = "booking/confirmed/123"
switch (true) {
    case topic.includes(topics.subsscribeTopic.bookingRequest):
        console.log("Booking request received: " );
        break;
    case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
        console.log("Booking request received: " );
        console.log("Sending email...");
        break; 
}
/** Expected output (often printed first):
 *  --------------------------------------
 * Booking request received: 
 * Sending email...
*/













