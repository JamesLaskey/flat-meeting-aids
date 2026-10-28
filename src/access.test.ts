import { expect, test } from 'vitest'
import { Access, InMemAccess, test_setAccess } from './access'
import { createParticipant } from './participants'

test("InMemAccess_registerCap_returnsTrueIfAdded", () => {
    test_setAccess(new InMemAccess())

    expect(Access.registerCapability("canCallFoo", new Set(["foo"]))).toBe(true)
})

test("InMemAccess_registerCap_returnsFalseIfAlreadyAdded", () => {
    test_setAccess(new InMemAccess())

    Access.registerCapability("canCallFoo", new Set(["foo"]))

    expect(Access.registerCapability("canCallFoo", new Set("foo"))).toBe(false)
})

test("InMemAccess_check_returnsFalseIfNotGranted", () => {
    test_setAccess(new InMemAccess())
    Access.registerCapability("canCallFoo", new Set(["foo"]))
    const alice = createParticipant("Alice", [])

    expect(Access.check(alice, "foo")).toBe(false)
})

test("InMemAccess_giveCap_participantHasCap", () => {
    test_setAccess(new InMemAccess())
    Access.registerCapability("canCallFoo", new Set(["foo"]))
    const alice = createParticipant("Alice", [])

    Access.giveCapability(alice, "canCallFoo")

    expect(Access.check(alice, "foo")).toBe(true)
})

test("InMemAccess_giveRoleDuringParticipantCreation_participantHasRole", () => {
    test_setAccess(new InMemAccess())
    Access.registerCapability("canCallFoo", new Set(["foo"]))
    Access.registerRole("fooer", new Set(["canCallFoo"]))

    const alice = createParticipant("Alice", ["fooer"])

    expect(Access.check(alice, "foo")).toBe(true)
})

test("InMemAccess_retractRole_participantLosesAccess", () => {
    test_setAccess(new InMemAccess())
    Access.registerCapability("canCallFoo", new Set(["foo"]))
    Access.registerRole("fooer", new Set(["canCallFoo"]))
    const alice = createParticipant("Alice", ["fooer"])

    Access.retractRole(alice, "fooer")

    expect(Access.check(alice, "foo")).toBe(false)
})

test("InMemAccess_retractRole_participantRetainsAccessViaSeparateRole", () => {
    test_setAccess(new InMemAccess())
    Access.registerCapability("canCallFoo", new Set(["foo"]))
    Access.registerRole("fooer", new Set(["canCallFoo"]))
    Access.registerRole("fooer2", new Set(["canCallFoo"]))
    const alice = createParticipant("Alice", ["fooer", "fooer2"])

    Access.retractRole(alice, "fooer")

    expect(Access.check(alice, "foo")).toBe(true)
})