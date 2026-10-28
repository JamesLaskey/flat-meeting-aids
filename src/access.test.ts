import { expect, test } from 'vitest'
import { InMemAccess } from './access'

test("InMemAccess_registerCap_capabilityExists", () => {
    const access = new InMemAccess()

    expect(access.registerCapability("canCallFoo", new Set("foo"))).toBe(true)
})