/**
 * This files test the min priority queue
 * It was created as prove of concept for this functionality
 */

const {MinPriorityQueue}= require('@datastructures-js/priority-queue'); 

let inssuancePQueue = new MinPriorityQueue((bookingRequest) => bookingRequest.timeStamp); 

var obj1 = {
    timeStamp: 3
}
var obj2 = {
    timeStamp: 1
}
var obj3 = {
    timeStamp: 2
}

inssuancePQueue.enqueue(obj1);
inssuancePQueue.enqueue(obj2);
inssuancePQueue.enqueue(obj3);

console.log(inssuancePQueue.dequeue());
console.log(inssuancePQueue.dequeue());
console.log(inssuancePQueue.dequeue());

/**
 * Expected output:
 * { timeStamp: 1 }
 * { timeStamp: 2 }
 * { timeStamp: 3 }
 */







  
