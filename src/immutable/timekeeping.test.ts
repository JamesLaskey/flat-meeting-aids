import { expect, test } from 'vitest'
import { MeetingTimerChain } from './timekeeping'
import { Temporal } from '@js-temporal/polyfill'
import { isImmutable, List, type RecordOf } from 'immutable'
import { makeTimeNotification } from './world'

test('MeetingTimerChain_start', () => {
    const now = Temporal.Instant.fromEpochMilliseconds(10)
    Temporal.Now.instant = () => now 
    const meetingTimerChain = MeetingTimerChain.create(
        Temporal.Duration.from({minutes: 45}),
        List([makeTimeNotification({uuid: "uuid1"})]),
        List([makeTimeNotification({uuid: "uuid2"}), makeTimeNotification({uuid: "uuid3"})]),
    )

    const [result, updates] = MeetingTimerChain.start(meetingTimerChain)

    expect(result).toEqual(MeetingTimerChain.factory({
        notifications: List([makeTimeNotification({uuid: "uuid2", start: now}), makeTimeNotification({uuid: "uuid3", start: now})]),
        itemTimers: List([makeTimeNotification({uuid: "uuid1"})]),
        currentItemTimer: makeTimeNotification({uuid: "uuid1", start: now}),
        intendedDuration: Temporal.Duration.from({minutes: 45}),
        runningBudget: Temporal.Duration.from({minutes: 44}),
    }))
})