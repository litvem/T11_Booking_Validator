const options = require('./options');
const state = requere('./state');

class CircuitBreaker {
    constructor(request, options) {
        this.request = request;
        this.state = BreakerState.GREEN;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();

        if (options) {
            this.failureThreshold = options.failureThreshold;
            this.successThreshold = options.successThreshold;
            this.timeout = options.timeout;
        }

        else {
            // Define defaults
            this.failureThreshold = 3;
            this.successThreshold = 2;
            this.timeout = 3000;
        }
    }
}