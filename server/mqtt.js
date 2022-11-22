const mqtt = require("mqtt");
const dotenv = require("dotenv");
dotenv.config();

var LOCALHOST = "mqtt://localhost:1883"
client = mqtt.connect(LOCALHOST)

/** function called when client is connected */
client.on("connect", () => {
    console.log(`MQTT client connected`);
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

module.exports = client;


