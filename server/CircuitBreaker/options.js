class BreakerOptions {
    constructor(failureThreshold, successThreshold, timeout) {
        this.failureThreshold = failureThreshold;
        this.successThreshold = successThreshold;
        this.timeout = timeout;
    }
}
module.exports;