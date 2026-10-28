import type { Participant, ParticipantId, Role } from "./participants"

interface AccessSystem {
    addParticipant(p: Participant): void
    check(p: Participant, requestFn: any): Boolean
    requiredCap(requestFn: any): Capability | undefined
    registerCapability(capName: string, fns: Set<any>): Boolean
    getCapabilities(p: Participant): Array<CapabilityId>
    giveCapability(p: Participant, capName: string): Boolean
    retractCapability(p: Participant, capName: string): Boolean
    registerRole(r: Role, caps: Set<CapabilityId>): Boolean
    rolesToCapabilities(r: Role): Set<CapabilityId>
    getRoles(p: Participant): Array<Role>
    giveRole(p: Participant, r: Role): Boolean
    retractRole(p: Participant, r: Role): Boolean
}

type FunctionKey = string
type CapabilityId = string;
export type Capability = {readonly name: CapabilityId, readonly functions: Set<FunctionKey>};

export class InMemAccess implements AccessSystem { 
    participantRolesDB: Map<ParticipantId, Set<Role>> = new Map();
    participantAccessDB: Map<ParticipantId, Set<CapabilityId>> = new Map();
    capabilitiesDB: Map<CapabilityId, Capability> = new Map();
    rolesDB: Map<Role, Set<CapabilityId>> = new Map();

    addParticipant(p: Participant): void {
        this.participantRolesDB.getOrInsert(p.id, new Set())
        this.participantAccessDB.getOrInsert(p.id, new Set())
    } 

    check(p: Participant, requestFn: FunctionKey): Boolean {
        const participantCaps = this.participantAccessDB.get(p.id)
        if (!participantCaps || participantCaps.size === 0) {
            console.log("participant not registered")
            return false
        }
        return participantCaps?.keys().some((c: CapabilityId) => {
            return this.capabilitiesDB.get(c)?.functions.keys()
                .some((capFn: FunctionKey) => { 
                    return requestFn === capFn 
                })
        }) ?? false
    }

    //TODO: Maybe return an Array
    requiredCap(requestFn: any): Capability | undefined {
        return this.capabilitiesDB.values().find((c: Capability) => {
            return c.functions.keys().some((capFn: any) => { return requestFn === capFn })
        })
    }

    registerCapability(capName: string, fns: Set<FunctionKey>): Boolean {
        if (this.capabilitiesDB.has(capName)) {
            return false
        }
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
        this.participantAccessDB.get(p.id)?.add(capName)
        return true
    }

    retractCapability(p: Participant, capName: string): Boolean {
        const cap = this.capabilitiesDB.get(capName)
        if (!cap) {
            return false
        }
        const pCaps = this.participantAccessDB.get(p.id) ?? new Set()
        const result = pCaps.delete(capName)
        if (!result) {
            return result
        }
        this.participantAccessDB.set(p.id, pCaps)
        return true
    }

    registerRole(r: Role, caps: Set<CapabilityId>): Boolean {
        this.rolesDB.set(r, caps)
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
        this.participantRolesDB.get(p.id)?.add(r)
        return failures
    }

    retractRole(p: Participant, r: Role): Boolean {
        const pRoles = this.participantRolesDB.get(p.id) ?? new Set()
        pRoles.delete(r)
        const capsFromOtherRoles = pRoles.keys().flatMap<CapabilityId>((role: Role) => {
            if (role === r) {
                return new Set()
            }
            return this.rolesDB.get(role) ?? new Set()
        }).reduce<Set<CapabilityId>>((acc, capId) => { return acc.add(capId) }, new Set())
        var failures = false
        this.rolesToCapabilities(r).keys().forEach((capId: CapabilityId) => {
            if (!capsFromOtherRoles.has(capId)) {
                failures || this.retractCapability(p, capId)
            }
        })
        return !failures
    }

    getCapabilities(p: Participant): Array<CapabilityId> {
        return this.participantAccessDB.get(p.id)?.keys().toArray() ?? []
    }

    getRoles(p: Participant): Array<Role> {
        return this.participantRolesDB.get(p.id)?.keys().toArray() ?? []
    }
}

export var Access: AccessSystem = new InMemAccess()
export function test_setAccess(a: AccessSystem) {
    Access = a
}