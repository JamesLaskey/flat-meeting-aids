import { Temporal } from "@js-temporal/polyfill";
import type { RecordOf } from "immutable";
import { Record, List, Set } from 'immutable';
import type { AccessSystem, InMemAccess } from "../access";

export type UpdateFnResult<T extends Object> = [RecordOf<T> | Error, RecordOf<WorldUpdates>]

export type TimerUUID = string
export type NotificationAction = "none" | "closeDiscussion" | "voteNow" | "warning"
export type NotificationResult = {
    message: String;
    action: NotificationAction;
}
const notificationResultDefaults: NotificationResult = {message: "", action: "none"}
export const makeNotificationResult: Record.Factory<NotificationResult> = Record(notificationResultDefaults)

export type TimeNotification = {
    uuid: TimerUUID;
    start: Temporal.Instant | undefined;
    duration: Temporal.Duration;
    result: NotificationResult;
}
const timeNotificationDefaults: TimeNotification = {
    uuid: "nouuidset",
    start: undefined,
    duration: Temporal.Duration.from({minutes: 1}),
    result: notificationResultDefaults
}
export const makeTimeNotification: Record.Factory<TimeNotification> = Record(timeNotificationDefaults)

export type WorldUpdates = {
    startTimers: List<RecordOf<TimeNotification>>;
    endTimers: Set<TimerUUID>;
}
const worldUpdateDefaults: WorldUpdates = {
    startTimers: List(),
    endTimers: Set(),
}
export const makeWorldUpdates: Record.Factory<WorldUpdates> = Record(worldUpdateDefaults)

interface Storage {
    put(key: string, json: string): Error | undefined;
    get(key: string): string | Error;
}

interface Broadcast {
    send(key: string, json: string): Error | undefined;
}

interface Logger {
    log(msg: string): void;
}

export interface World {
    access: AccessSystem;
    storage: Storage;
    broadcast: Broadcast;
    logger: Logger;

    applyUpdate(updates: RecordOf<WorldUpdates>): Error | undefined;
}
