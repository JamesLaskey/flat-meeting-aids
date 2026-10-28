import { Temporal } from '@js-temporal/polyfill';
import { SingleItemTimerFactory } from '../src/timekeeping';
import { number } from 'zod';

// Full meeting timekeeping
// Given agenda with durations, auto create timers and advance through them
// Instantiate agenda
// Start meeting
// Topic 1 needs 10 minutes and has a 2 minute warning
// Topic 2 uses its full time and needs additional time, time extension +10 minutes
// Topic 3 uses less time than needed and finishes 2 minutes early
// Topic 4 would run past end of meeting given earlier over time
// Topic 5 held until next meeting

// Add hoc timekeeping utility
// Create a timer with default warnings at half time and 2 minutes remaining
// Additional time added and shows over time
class FakeClock {
    fakeTimerId = 0
    fakeNow = 0
    timers: Array<{time: number, id: number, callback: () => void}> = []
    fakeSetTimeoutFn = (callback: () => void, ms: number):  string | number | NodeJS.Timeout => {
        const id = this.fakeTimerId++
        this.timers.push({
            time: this.fakeNow + ms,
            id: id,
            callback: callback
        })
        this.timers.sort((t1, t2) => t1.time - t2.time)
        return id
    }

    fakeClearTimeoutFn = (id: number | string | NodeJS.Timeout ) => {
        console.log("here2")
        this.timers = this.timers.filter((t) => t.id !== id)
    }

    advance(ms: number) {
        this.fakeNow += ms
        this.timers.sort((t1, t2) => t1.time - t2.time)
        var newTimers: typeof this.timers = []
        this.timers.forEach(e => {
            if (e.time < this.fakeNow) {
                e.callback()
            } else {
                newTimers.push(e)
            }
        });
        this.timers = newTimers
    }

    areTimersActive(): Boolean {
        return this.timers.keys.length > 0
    }
}

const fakeClock1 = new FakeClock()
const adhocTimer = new SingleItemTimerFactory(Temporal.Duration.from({ minutes: 10 }))
    .setTimeoutFn(fakeClock1.fakeSetTimeoutFn, fakeClock1.fakeClearTimeoutFn)
    .warnAtXMinutesBeforeEnd(5)
    .warnAtXMinutesBeforeEnd(2)
    .warnAtXMinutesOvertime(2)
    .start()

console.log("advancing 5 minutes")
fakeClock1.advance(1000 * 60 * 5 + 1)
console.log("advancing 3 minutes, 8 minutes total")
fakeClock1.advance(1000 * 60 * 4)
console.log("advancing 4 minutes, 12 minutes total")