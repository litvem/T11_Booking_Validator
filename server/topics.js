/** Object.freeze makes the object inmutable */

const publishTopic = Object.freeze({
    saveBooking: "booking/save",
    cbOpen: "circuitbreak/open",
    cbClose: "circuitbreak/close",
/*     formatEroor:"booking/error/formatError",
    bookingError: "booking/error" */
});

exports.publishTopic = publishTopic;

const subsscribeTopic = Object.freeze({
    bookingRequest: "booking/request",
    bookingConfirmation: "booking/confirmed/#",
    confirmationError: "booking/error/#"
});
exports.subsscribeTopic = subsscribeTopic;
