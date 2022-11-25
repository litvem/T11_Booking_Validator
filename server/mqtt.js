const mqtt = require("mqtt");
const dotenv = require("dotenv");
const topics = require("./topics");
dotenv.config();

/* var LOCALHOST = "tcp://127.0.0.1:1883" */
var LOCALHOST = "mqtt://localhost:1883"
client = mqtt.connect(LOCALHOST)
exports.client =client;

/**
 * Function that subscribes to all topics.
 */
function subscribeToAll (){
    Object.values(topics.subsscribeTopic).forEach(topic => {
        client.subscribe(topic, function (err) {
            if (!err) {
                console.log("Succesful subscribtion to: " + topic)
            }else{
                console.log(err.message)
            }
        }) 
    });
}

/**
 * Function that connects to the mosquitto broker
 */
exports.connect = function(){
    /** function called when client is connected */
    client.on("connect", () => {
        console.log(`MQTT client connected`);
        subscribeToAll();
    }); 
    /** function called when client has error */
    client.on("error", (err) => {
        console.log(err);
        client.end();
    }); 
    /** function called when client is disconnected */
    client.on('disconnect', function () {
        console.log('Status: Disconnected from Mqtt broker')
        client.reconnect();
    })

    /**  function called when client is reconnecting */
    client.on('reconnect', function () {
        console.log('Status: Reconnecting to Mqtt broker')
    })

    /** function called  when client is offline */ 
    client.on('offline', function () {
        console.log('Status: Offline, Disconnected from Mqtt broker')
        client.reconnect();
    })
}

/**
 * Function that publish a message to the broker, uses QoS 1
 * @param {String} topic 
 * @param {String} message 
 */
exports.publish = function (topic, message){
    client.publish(topic, message, 1)
}

/**
 * Function that subscribes to a specific topic.
 * @param {String} topic 
 */
exports.subscribe = function (topic){
    client.subscribe(topic, function (err) {
        if (!err) {
            console.log("Succesful subscribtion to: " + topic)
        }else{
            console.log(err.message)
        }
    })
}



