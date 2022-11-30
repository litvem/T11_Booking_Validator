
const publishTopic = {
    saveBooking: "booking/save",
    cbOpen: "circuitbreak/open",
    cbClose: "circuitbreak/close",
/*     formatEroor:"booking/error/formatError",
    bookingError: "booking/error" */
}
exports.publishTopic = publishTopic;

const subsscribeTopic = {
    bookingRequest: "booking/request",
    bookingConfirmation: "booking/confirmed/#",
    confirmationError: "booking/error/#"
}
exports.subsscribeTopic = subsscribeTopic;
