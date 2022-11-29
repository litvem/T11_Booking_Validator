/**
 * This files test the min priority queue
 * It was created as prove of concept for this functionality
 */

const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 

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

test('Testing queue order return obj2 timeStamp with value 1', () => {
    expect(dequeue()).toBe('{"userid":12345,"requestid":13,"dentistid":1,"issuance":1,"date":"2020-12-14"}');
});









  
