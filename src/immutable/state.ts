import type { RecordOf } from "immutable"
import type { UpdateFnResult, World } from "./world"
import type { Participant } from "../participants"
import { isError } from "es-toolkit"

type Result<T> = T | Error

type updateFn<T extends Object> = (i: RecordOf<T>) => UpdateFnResult<T>

function update<T extends Object>(
    world: World,
    actor: Participant,
    obj: RecordOf<T>,
    updateFn: updateFn<T>): Result<RecordOf<T>> {
    if (!world.access.check(actor, updateFn)) {
        return new Error("${actor} not allowed to call ${updateFn}")
    }
    const [resultOrErr, updates] = updateFn(obj)
    if (isError(resultOrErr)) {
        return resultOrErr
    }
    const resultObj = resultOrErr
    const worldUpdateErr = world.applyUpdate(updates)
    if (worldUpdateErr) {
        return worldUpdateErr
    }
    const json = resultObj.toJSON().toString()
    const storeErr = world.storage.put("", json)
    if (isError(storeErr)) {
        return storeErr
    }
    const broadcastErr = world.broadcast.send("", json)
    if (isError(broadcastErr)) {
        return broadcastErr
    }
    return obj
}