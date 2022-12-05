/** Object.freeze makes the object inmutable
 * and make both objects to work as enums.
 */

const publishTopic = Object.freeze({
    saveBooking: "booking/save",
    cbOpen: "circuitbreak/open",
    cbClose: "circuitbreak/close",
    formatError:"booking/error/formatError/",
    bookingError: "booking/error/",
    emailError:"booking/error/emailconfirmation"
});

exports.publishTopic = publishTopic;

const subsscribeTopic = Object.freeze({
    bookingRequest: "booking/request",
    bookingConfirmation: "booking/confirmed/#",
    confirmationError: "booking/error/#"
});
exports.subsscribeTopic = subsscribeTopic;
