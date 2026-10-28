import { Temporal } from '@js-temporal/polyfill';

type TimeoutFn = (callback: () => void, ms: number) => string | number | NodeJS.Timeout;
type ClearTimeoutFn = (id: string | number | NodeJS.Timeout) => void;

export type TimeNotifFn = (t: TimeNotification) => Promise<void>

export interface TimeNotification {
    delay: Temporal.Duration,
    genNotifFn: TimeNotifFn,
}

export class SingleItemTimerFactory {
    notifications: Array<TimeNotification> = [];
    timeExtensionCallback: (timer: RunningSingleItemTimer) => Promise<void> = async (timer:RunningSingleItemTimer) => {
    };
    intendedDuration: Temporal.Duration;
    timeoutFn: TimeoutFn = setTimeout;
    clearTimeoutFn: ClearTimeoutFn = clearTimeout; 

    constructor(
        intendedDuration: Temporal.Duration,
    ) {
        this.intendedDuration = intendedDuration;
    }

    addNotification(notification: TimeNotification): SingleItemTimerFactory {
        this.notifications.push(notification)
        return this
    }

    setTimeoutFn(timeoutFn: TimeoutFn, clearFn: ClearTimeoutFn): SingleItemTimerFactory {
        this.timeoutFn = timeoutFn;
        this.clearTimeoutFn = clearFn
        return this
    }

    warnAtXMinutesBeforeEnd(minutes: number): SingleItemTimerFactory {
        const warnTimer: TimeNotification = {
            delay: this.intendedDuration.subtract(Temporal.Duration.from({ minutes: minutes })),
            genNotifFn: async (t: TimeNotification) => {
                console.log("You have %d minutes remaining!", minutes)
            }
        }
        this.addNotification(warnTimer)
        return this
    }

    warnAtXMinutesOvertime(minutes: number): SingleItemTimerFactory {
        const warnTimer: TimeNotification = {
            delay: this.intendedDuration.add(Temporal.Duration.from({ minutes: minutes })),
            genNotifFn: async (t: TimeNotification) => {
                console.log("You have gone %d minutes over!", minutes);
            }
        }
        this.addNotification(warnTimer)
        return this
    }

    start(): RunningSingleItemTimer {
        return new RunningSingleItemTimer(
            this.timeoutFn,
            this.clearTimeoutFn,
            Temporal.Now.instant(), 
            this.intendedDuration,
            this.notifications,
            this.timeExtensionCallback,
        )
    }
}

class RunningSingleItemTimer {
    startTime: Temporal.Instant
    endTime?: Temporal.Instant
    timers: Array<NodeJS.Timeout | string | number> = []
    timeoutFn: TimeoutFn = setTimeout
    clearTimeoutFn: ClearTimeoutFn = clearTimeout

    constructor(
        timeoutFn: TimeoutFn,
        clearTimeoutFn: ClearTimeoutFn,
        startTime: Temporal.Instant,
        intendedDuration: Temporal.Duration,
        notifications: Array<TimeNotification>,
        timeExtensionNeededCallback: (timer: RunningSingleItemTimer) => Promise<void>,
    ) {
        this.startTime = startTime
        this.timeoutFn = timeoutFn
        this.clearTimeoutFn = clearTimeoutFn
        const timerId = this.timeoutFn(async () => {
            await timeExtensionNeededCallback(this)
        }, intendedDuration.total({ unit: 'milliseconds' }))
        this.timers.push(timerId)
        notifications.forEach((t: TimeNotification) => {
            const timerId = this.timeoutFn(async () => {
                await t.genNotifFn(t)
            }, t.delay.total({ unit: 'milliseconds' }))
            this.timers.push(timerId)
        })
    }

    get overtime(): Temporal.Duration {
        return Temporal.Now.instant().since(this.startTime)
    }

    public end() {
        this.timers.forEach(timerId => {
            this.clearTimeoutFn(timerId)
        });
        this.endTime = Temporal.Now.instant()
    }
}