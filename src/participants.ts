import { Access } from "./access"

// Identifier which maps to a set of privileges
export type Role = string
export type ParticipantId = string

export interface Participant {
    id: ParticipantId,
    displayName: string,
}

export function createParticipant(name: string, roles: Array<Role>): Participant {
    const p = {
        id: crypto.randomUUID(),
        displayName: name,
    }
    Access.addParticipant(p)
    roles.forEach((r) => {
        Access.giveRole(p, r)
    })
    return p
}