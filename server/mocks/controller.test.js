/**
 * Test the different components of the controller 
 * For more assertions: https://jestjs.io/docs/expect#tomatchobjectobject
 */

const topics = require("../topics");
const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 


test('Testing queue order return obj2 timeStamp with value 1', () => {
    let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.issuance); 

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

    inssuancePQueue.enqueue(objList[0]);
    inssuancePQueue.enqueue(objList[1]);
    inssuancePQueue.enqueue(objList[2]);

    function dequeue(){
        var request = inssuancePQueue.dequeue(); 
        return JSON.stringify(request);

    }
    expect(dequeue()).toBe('{"userid":12345,"requestid":13,"dentistid":1,"issuance":1,"date":"2020-12-14"}');
});


function mockSwitch(topic){
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
    expect(mockSwitch(topic)).toBe("Booking confirmation received. Sending email...");
});

test('Testing confimartion response', () => {
    var topic = "booking/request"
    expect(mockSwitch(topic)).toBe("Booking request received.");
});

test('Testing confimartion response', () => {
    var topic = "booking/error/123"
    expect(mockSwitch(topic)).toBe("Booking confirmation error was received. Sending new request");
});


