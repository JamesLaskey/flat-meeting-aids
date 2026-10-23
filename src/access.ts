import type { Participant, ParticipantId, Role } from "./participants"

interface AccessSystem {
    check(p: Participant, requestFn: any): Boolean
    requiredCap(requestFn: any): Capability | undefined
    registerCapability(capName: string, fns: Set<any>): Boolean
    giveCapability(p: Participant, capName: string): Boolean
    retractCapability(p: Participant, capName: string): Boolean
    rolesToCapabilities(r: Role): Set<CapabilityId>
    giveRole(p: Participant, r: Role): Boolean
    retractRole(p: Participant, r: Role): Boolean
}

type CapabilityId = string;
export type Capability = {readonly name: CapabilityId, readonly functions: Set<any>};

class InMemAccess {
    participantRolesDB: Map<ParticipantId, Set<Role>> = new Map();
    participantAccessDB: Map<ParticipantId, Set<CapabilityId>> = new Map();
    capabilitiesDB: Map<CapabilityId, Capability> = new Map();
    rolesDB: Map<Role, Set<CapabilityId>> = new Map();

    check(p: Participant, requestFn: any): Boolean {
        const participantCaps = this.participantAccessDB.get(p.id)
        if (!participantCaps) {
            return false
        }
        return participantCaps.keys().some((c: CapabilityId) => {
            return this.capabilitiesDB.get(c)?.functions.keys()
                .some((capFn: any) => { return requestFn === capFn })
        })
    }

    //TODO: Maybe return an Array
    requiredCap(requestFn: any): Capability | undefined {
        return this.capabilitiesDB.values().find((c: Capability) => {
            return c.functions.keys().some((capFn: any) => { return requestFn === capFn })
        })
    }

    registerCapability(capName: string, fns: Set<any>): Boolean {
        const cap: Capability = {
            name: capName,
            functions: fns,
        }
        this.capabilitiesDB.set(capName, cap);
        return true
    }

    giveCapability(p: Participant, capName: string): Boolean {
        const cap = this.capabilitiesDB.get(capName)
        if (!cap) {
            return false
        }
        this.participantAccessDB.getOrInsert(p.id, new Set()).add(capName)
        return true
    }

    retractCapability(p: Participant, capName: string): Boolean {
        const cap = this.capabilitiesDB.get(capName)
        if (!cap) {
            return false
        }
        const pCaps = this.participantAccessDB.getOrInsert(p.id, new Set())
        const result = pCaps.delete(capName)
        if (!result) {
            return result
        }
        this.participantAccessDB.set(p.id, pCaps)
        return true
    }

    rolesToCapabilities(r: Role): Set<CapabilityId> {
        return this.rolesDB.get(r) ?? new Set()
    }

    giveRole(p: Participant, r: Role): Boolean {
        var failures = false
        this.rolesToCapabilities(r).keys().forEach((capId: CapabilityId) => {
            failures || this.giveCapability(p, capId)
        })
        this.participantRolesDB.getOrInsert(p.id, new Set()).add(r)
        return failures
    }

    retractRole(p: Participant, r: Role): Boolean {
        const caps = this.rolesToCapabilities(r)
        var failures = false

        const pRoles = this.participantRolesDB.getOrInsert(p.id, new Set())
        const capsFromOtherRoles = pRoles.keys().flatMap<CapabilityId>((role: Role) => {
            if (role === r) {
                return new Set()
            }
            return this.rolesDB.get(role) ?? new Set()
        }).reduce<Set<CapabilityId>>((acc, capId) => { return acc.add(capId) }, new Set())
        this.rolesToCapabilities(r).keys().forEach((capId: CapabilityId) => {
            if (!capsFromOtherRoles.has(capId)) {
                failures || this.retractCapability(p, capId)
            }
        })
        return true
    }
}

export var Access: AccessSystem = new InMemAccess()