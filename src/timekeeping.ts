import { Temporal } from '@js-temporal/polyfill';

export interface TimeWarning {
    timeRemaining: Temporal.Duration,
    text: string,
}

export class MeetingTimer {
    warnings: Array<TimeWarning> = []
    timeExtensionCallback: (timer: RunningMeetingTimer) => Promise<void> = async (timer:RunningMeetingTimer) => {
    }
    intendedDuration: Temporal.Duration;

    constructor(
        intendedDuration: Temporal.Duration,
    ) {
        this.intendedDuration = intendedDuration;
    }

    addWarning(warning: TimeWarning): MeetingTimer {
        this.warnings.push(warning)
        return this
    }

    start(): RunningMeetingTimer {
        return new RunningMeetingTimer(
            Temporal.Now.instant(), 
            this.intendedDuration,
            this.warnings,
            this.timeExtensionCallback,
        )
    }
}

class RunningMeetingTimer {
    endTime?: Temporal.Instant
    timers: Array<NodeJS.Timeout | string | number> = []

    constructor(
        startTime: Temporal.Instant,
        intendedDuration: Temporal.Duration,
        warnings: Array<TimeWarning>,
        timeExtensionNeededCallback: (timer: RunningMeetingTimer) => Promise<void>,
    ) {
        const timerId = setTimeout(async () => {
            await timeExtensionNeededCallback(this)
        }, intendedDuration.milliseconds)
        this.timers.push(timerId)
    }

    public end() {
        this.timers.forEach(timerId => {
            clearTimeout(timerId)
        });
        this.endTime = Temporal.Now.instant()
    }
}