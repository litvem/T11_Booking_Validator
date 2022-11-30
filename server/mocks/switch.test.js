/**
 * Test the functionality of the switch true
 * 
 * For more assertions: https://jestjs.io/docs/expect#tomatchobjectobject
 */

const topics = require("../topics");

function switchTest(topic){
    switch (true) {
        case topic.includes(topics.subsscribeTopic.bookingRequest):
             return "Booking request received.";
            break;
        case topic.includes(topics.subsscribeTopic.bookingConfirmation.slice(0,-1)):
            return "Booking confirmation received. Sending email...";
            break; 
        case topic.includes(topics.subsscribeTopic.confirmationError.slice(0,-1)):
            return "Booking confirmation error was received. Sending new request";
            break; 
    }
};
 
test('Testing confimartion response', () => {
    var topic = "booking/confirmed/123"
    expect(ab(topic)).toBe("Booking confirmation received. Sending email...");
});

test('Testing confimartion response', () => {
    var topic = "booking/request"
    expect(ab(topic)).toBe("Booking request received.");
});

test('Testing confimartion response', () => {
    var topic = "booking/error/123"
    expect(ab(topic)).toBe("Booking confirmation error was received. Sending new request");
});


