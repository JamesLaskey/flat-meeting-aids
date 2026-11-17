import { Temporal } from '@js-temporal/polyfill';
import { List, Set, Record, type RecordOf } from 'immutable';
import { makeWorldUpdates, type TimeNotification, type UpdateFnResult, type WorldUpdates } from './world';
import { isError } from 'es-toolkit';

type MeetingTimerChain = {
    notifications: List<RecordOf<TimeNotification>>;
    itemTimers: List<RecordOf<TimeNotification>>;
    currentItemTimer: RecordOf<TimeNotification> | undefined;
    intendedDuration: Temporal.Duration;
    runningBudget: Temporal.Duration;
}
const meetingTimerChainDefaults: MeetingTimerChain = {
    notifications: List(),
    itemTimers: List(),
    currentItemTimer: undefined,
    intendedDuration: Temporal.Duration.from({minutes: 60}),
    runningBudget: Temporal.Duration.from({minutes: 60})
}
type MeetingChainUpdateResult = UpdateFnResult<MeetingTimerChain>

export namespace MeetingTimerChain {
    export const factory: Record.Factory<MeetingTimerChain> = Record(meetingTimerChainDefaults)

    export function create(
        intendedDuration: Temporal.Duration,
        timers: List<RecordOf<TimeNotification>>,
        notifications?: List<RecordOf<TimeNotification>>,
    ): RecordOf<MeetingTimerChain> {
        const itemTotalDuration = timers.reduce((acc: Temporal.Duration, item: RecordOf<TimeNotification>) => {
            return acc.add(item.duration)
        }, new Temporal.Duration())
        const runningBudget = intendedDuration.subtract(itemTotalDuration)
        return factory({
            notifications: notifications ?? List(),
            itemTimers: timers,
            intendedDuration: intendedDuration,
            runningBudget: runningBudget,
        })
    }

    export function advance(chain: RecordOf<MeetingTimerChain>): MeetingChainUpdateResult {
        var result = chain
        var updates = makeWorldUpdates()
        const currentTimer = result.currentItemTimer
        var index = -1
        if (currentTimer !== undefined) {
            updates = updates.update('endTimers', t => t.add(currentTimer.uuid))
            index = chain.itemTimers.findIndex(t => t.uuid === currentTimer?.uuid)
        }
        if (chain.currentItemTimer) {
            result = result.set('runningBudget', chain.runningBudget.subtract(getItemElapsedTime(chain.currentItemTimer)))
        }
        var nextTimer = chain.itemTimers.get(index + 1, undefined)
        if (!nextTimer) {
            return [result, updates]
        }
        nextTimer = nextTimer.set('start', Temporal.Now.instant())
        updates = updates.update('startTimers', t => t.push(nextTimer!))
        result = result.merge({
            currentItemTimer: nextTimer,
        })
        return [result, updates]
    }

    export function start(chain: RecordOf<MeetingTimerChain>): MeetingChainUpdateResult {
        const [result, worldUpdates] = advance(chain)
        if (isError(result)) {
            return [result, makeWorldUpdates()]
        }
        const result2 = result.update('notifications', l => l.map((t) => t.set('start', Temporal.Now.instant())))
        const worldUpdates2 = worldUpdates.update('startTimers', t => t.concat(result2.notifications))
        return [result2, worldUpdates2]
    }
}

function getItemElapsedTime(timer: RecordOf<TimeNotification>): Temporal.Duration {
    if (!timer.start) {
        return Temporal.Duration.from({minutes: 0}) 
    }
    return Temporal.Now.instant().since(timer.start)
}

// export class SingleItemTimerFactory {
//     notifications: Array<TimeNotification> = [];
//     timeExtensionCallback: (timer: RunningSingleItemTimer) => Promise<void> = async (timer:RunningSingleItemTimer) => {
//     };
//     intendedDuration: Temporal.Duration;
//     timeoutFn: TimeoutFn = setTimeout;
//     clearTimeoutFn: ClearTimeoutFn = clearTimeout; 

//     constructor(
//         intendedDuration: Temporal.Duration,
//     ) {
//         this.intendedDuration = intendedDuration;
//     }

//     addNotification(notification: TimeNotification): SingleItemTimerFactory {
//         this.notifications.push(notification)
//         return this
//     }

//     setTimeoutFn(timeoutFn: TimeoutFn, clearFn: ClearTimeoutFn): SingleItemTimerFactory {
//         this.timeoutFn = timeoutFn;
//         this.clearTimeoutFn = clearFn
//         return this
//     }

//     warnAtXMinutesBeforeEnd(minutes: number): SingleItemTimerFactory {
//         const warnTimer: TimeNotification = {
//             delay: this.intendedDuration.subtract(Temporal.Duration.from({ minutes: minutes })),
//             genNotifFn: async (t: TimeNotification) => {
//                 console.log("You have %d minutes remaining!", minutes)
//             }
//         }
//         this.addNotification(warnTimer)
//         return this
//     }

//     warnAtXMinutesOvertime(minutes: number): SingleItemTimerFactory {
//         const warnTimer: TimeNotification = {
//             delay: this.intendedDuration.add(Temporal.Duration.from({ minutes: minutes })),
//             genNotifFn: async (t: TimeNotification) => {
//                 console.log("You have gone %d minutes over!", minutes);
//             }
//         }
//         this.addNotification(warnTimer)
//         return this
//     }

//     start(): RunningSingleItemTimer {
//         return new RunningSingleItemTimer(
//             this.timeoutFn,
//             this.clearTimeoutFn,
//             Temporal.Now.instant(), 
//             this.intendedDuration,
//             this.notifications,
//             this.timeExtensionCallback,
//         )
//     }
// }

// class RunningSingleItemTimer {
//     startTime: Temporal.Instant
//     endTime?: Temporal.Instant
//     timers: Array<NodeJS.Timeout | string | number> = []
//     timeoutFn: TimeoutFn = setTimeout
//     clearTimeoutFn: ClearTimeoutFn = clearTimeout

//     constructor(
//         timeoutFn: TimeoutFn,
//         clearTimeoutFn: ClearTimeoutFn,
//         startTime: Temporal.Instant,
//         intendedDuration: Temporal.Duration,
//         notifications: Array<TimeNotification>,
//         timeExtensionNeededCallback: (timer: RunningSingleItemTimer) => Promise<void>,
//     ) {
//         this.startTime = startTime
//         this.timeoutFn = timeoutFn
//         this.clearTimeoutFn = clearTimeoutFn
//         const timerId = this.timeoutFn(async () => {
//             await timeExtensionNeededCallback(this)
//         }, intendedDuration.total({ unit: 'milliseconds' }))
//         this.timers.push(timerId)
//         notifications.forEach((t: TimeNotification) => {
//             const timerId = this.timeoutFn(async () => {
//                 await t.genNotifFn(t)
//             }, t.delay.total({ unit: 'milliseconds' }))
//             this.timers.push(timerId)
//         })
//     } 

//     public end() {
//         this.timers.forEach(timerId => {
//             this.clearTimeoutFn(timerId)
//         });
//         this.endTime = Temporal.Now.instant()
//     }
// }