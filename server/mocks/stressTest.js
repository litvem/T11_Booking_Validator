const mqtt = require("mqtt");
const topics = require("../topics");

const incDate = date => {
    let newDate = date.getDate()
    switch (date.getDay()) {
        case 0:
            newDate += 2
            break
        case 6:
            newDate += 3
            break
        default:
            newDate++
    }
    return new Date(date.getFullYear(), date.getMonth(), newDate)
}
const getFormattedDate = date => date.toISOString().split("T")[0]

const LOCALHOST = "mqtt://localhost:1883"
let client = mqtt.connect(LOCALHOST)

let date = new Date()

let foo = {
    userid: "test@test.com",
    dentistid: 1,
    issuance: 1602406766314,
    date: getFormattedDate(date),
    time: "10:30-11:00",
    name: "Peter",
    sessionid: 0
}

client.subscribe(`${topics.publishTopic.emailConfirmation}#`)
client.subscribe(topics.publishTopic.cbOpen)

/**
 * Creates a booking request and awaits the confirmation response.
 * <br>
 * Resolves to the amount of seconds between request and response.
 * <br>
 * Rejects to a string explaining the error if timed out or met by an open circuit.
 *
 * @returns {Promise<{reqid: number, restime: number} | string>}
 */
const createRequest = () => new Promise((resolve, reject) => {
    date = incDate(date)
    let dateStr = getFormattedDate(date)
    let issuance = new Date().getTime()
    foo.issuance = issuance
    foo.date = dateStr
    let id = foo.sessionid + 1
    foo.sessionid = id
    console.log(`Sending request ${id}`)
    client.publish(topics.subsscribeTopic.bookingRequest, JSON.stringify(foo), 2)

    // Times out request after 5 seconds and rejects it
    let timeout = setTimeout(() => reject("Request timed out after 5s"), 5000)

    client.on("message", (t, m) => {
        if (t === `${topics.publishTopic.emailConfirmation}${id}`) {
            clearTimeout(timeout)
            resolve({
                reqid: id,
                restime: new Date().getTime() - issuance
            })
        } else if (t === topics.publishTopic.cbOpen) {
            reject("Circuit Breaker opened")
        }
    })
})

// Sends 5 requests per second
let test = setInterval(async () => {
    try {
        let res = await createRequest()
        console.log(`Request ${res.reqid} took ${res.restime} ms`)
    } catch (e) {
        console.log(e)
        clearInterval(test)
    }
}, 200)