/** Object.freeze makes the object inmutable
 * and make both objects to work as enums.
 */

const publishTopic = Object.freeze({
    saveBooking: "booking/save", // QoS 2 DB 
    cbOpen: "circuitbreak/open", // QoS 1 
    cbClose: "circuitbreak/close", // QoS 1 
    bookingError: "booking/error/", // + session ID  QoS 1 
    emailError:"emailconfirmation/error/", //  + session ID QoS 1
    emailConfirmation: "emailconfirmation/" //  + session ID QoS 1
});

exports.publishTopic = publishTopic;

const subsscribeTopic = Object.freeze({
    bookingRequest: "booking/request", // QoS 2
    bookingConfirmation: "booking/confirmed/#", // QoS 2
    confirmationError: "booking/error/#" // QoS 2
});
exports.subsscribeTopic = subsscribeTopic;
