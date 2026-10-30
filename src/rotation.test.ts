import { expect, test } from 'vitest'
import { createParticipant, type Participant } from './participants'
import { Rotation } from './rotation'

const alice = createParticipant("Alice", [])
const barb = createParticipant("Barbara", [])
const clarissa = createParticipant("Clarissa", [])
const dana = createParticipant("Dana", [])

const rotationMembers = [alice, barb, clarissa]

class testProbe {
    active = false
    participant: Participant | undefined = undefined

    onActive = (r: Rotation, p: Participant) => {
        if (this.active) {
            throw new Error("on active called when already active")
        }
        this.active = true
        this.participant = p
    }

    onInActive = (r: Rotation, p: Participant) => {
        if (!this.active) {
            throw new Error("on inactive called when already non active")
        }
        this.active = false
        this.participant = p
    }
}

test("Rotation_construction_startsWithFirstParticipant", () => {
    const probe = new testProbe()

    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    expect(rotation.currentHolder).toBe(alice)
})

test("Rotation_activate_activateCallbackCalled", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.activateCurrent()

    expect(probe.active).toBe(true)
    expect(probe.participant).toBe(alice)
})

test("Rotation_finishActive_onInactiveCallbackCalled", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.activateCurrent()
    rotation.finishActive()

    expect(probe.active).toBe(false)
    expect(probe.participant).toBe(alice)
})

test("Rotation_advance_movesToNextInRotation", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.advance()

    expect(rotation.currentHolder).toBe(barb)
})

test("Rotation_advance_callsOnInactiveIfNotFinished", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.activateCurrent()
    rotation.advance()

    expect(probe.active).toBe(false)
})

test("Rotation_advance_wrapsOnEndOfParticipantList", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.advance()
    rotation.advance()
    rotation.advance()
    rotation.advance()

    expect(rotation.currentHolder).toBe(barb)
})

test("Rotation_addParticipant_advancesIntoIt", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.addParticipant(dana, 1)
    rotation.advance()

    expect(rotation.currentHolder).toBe(dana)
})

test("Rotation_addParticipant_atPositionBeforeDoesNotInterfereWithActive", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.addParticipant(dana, 0)

    expect(rotation.currentHolder).toBe(alice)
})

test("Rotation_removeParticipant_rotationAdvancesThroughIt", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.removeParticipant(barb)
    rotation.advance()

    expect(rotation.currentHolder).toBe(clarissa)
})

test("Rotation_swap_changesRotationOrder", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.swap(barb, clarissa)
    rotation.advance()

    expect(rotation.currentHolder).toBe(clarissa)
    rotation.advance()
    expect(rotation.currentHolder).toBe(barb)
})

test("Rotation_swap_swappingCurrentMakesSwapIntoNewCurrent", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.swap(alice, clarissa)

    expect(rotation.currentHolder).toBe(clarissa)
})

test("Rotation_swap_swappingCurrentMakesSwapIntoNewCurrentSwitchedOrder", () => {
    const probe = new testProbe()
    const rotation = new Rotation(rotationMembers, probe.onActive, probe.onInActive)

    rotation.advance()
    rotation.advance()
    rotation.swap(clarissa, alice)

    expect(rotation.currentHolder).toBe(alice)
})