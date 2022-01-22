'use strict';

class Interval {
    startTime = null;
    endTime = null;

    constructor(startTime, endTime) {
        if (startTime > endTime) {
            throw `Interval start time (${startTime}) is greater than its end time (${endTime})!`;
        }
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    get startTime() {
        return this.startTime;
    }
    
    set startTime(time) {
        this.startTime = time;
    }
    
    get endTime() {
        return this.endTime;
    }
    
    set endTime(time) {
        this.endTime = time;
    }
    
    get duration() {
        return this.endTime - this.startTime;
    }
    
    overlaps(other) {
        //                 |<--- this --->|
        // |<--- other --->|              |<--- other --->|
        return this.startTime < other.endTime && this.endTime > other.startTime;
    }
}
