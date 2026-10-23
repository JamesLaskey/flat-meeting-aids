import { Temporal } from '@js-temporal/polyfill';

type TimeoutFn = (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
type ClearTimeoutFn = (id: string | number | NodeJS.Timeout) => void;

export interface TimeWarning {
    timeRemaining: Temporal.Duration,
    text: string,
}

export class MeetingTimer {
    warnings: Array<TimeWarning> = [];
    timeExtensionCallback: (timer: RunningMeetingTimer) => Promise<void> = async (timer:RunningMeetingTimer) => {
    };
    intendedDuration: Temporal.Duration;
    timeoutFn: TimeoutFn = setTimeout;
    clearTimeoutFn: ClearTimeoutFn = clearTimeout; 

    constructor(
        intendedDuration: Temporal.Duration,
    ) {
        this.intendedDuration = intendedDuration;
    }

    addWarning(warning: TimeWarning): MeetingTimer {
        this.warnings.push(warning)
        return this
    }

    setTimeoutFn(timeoutFn: TimeoutFn, clearFn: ClearTimeoutFn): MeetingTimer {
        this.timeoutFn = timeoutFn;
        this.clearTimeoutFn = clearFn
        return this
    }

    start(): RunningMeetingTimer {
        return new RunningMeetingTimer(
            this.timeoutFn,
            this.clearTimeoutFn,
            Temporal.Now.instant(), 
            this.intendedDuration,
            this.warnings,
            this.timeExtensionCallback,
        )
    }
}

class RunningMeetingTimer {
    endTime?: Temporal.Instant;
    timers: Array<NodeJS.Timeout | string | number> = [];
    timeoutFn: TimeoutFn = setTimeout;
    clearTimeoutFn: ClearTimeoutFn = clearTimeout;

    constructor(
        timeoutFn: TimeoutFn,
        clearTimeoutFn: ClearTimeoutFn,
        startTime: Temporal.Instant,
        intendedDuration: Temporal.Duration,
        warnings: Array<TimeWarning>,
        timeExtensionNeededCallback: (timer: RunningMeetingTimer) => Promise<void>,
    ) {
        this.timeoutFn = timeoutFn;
        this.clearTimeoutFn = clearTimeoutFn;
        const timerId = this.timeoutFn(async () => {
            await timeExtensionNeededCallback(this)
        }, intendedDuration.milliseconds)
        this.timers.push(timerId)
    }

    public end() {
        this.timers.forEach(timerId => {
            this.clearTimeoutFn(timerId)
        });
        this.endTime = Temporal.Now.instant()
    }
}