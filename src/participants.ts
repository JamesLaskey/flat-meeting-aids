// Identifier which maps to a set of privileges
export type Role = string
export type ParticipantId = string

export interface Participant {
    id: ParticipantId,
    displayName: string,
    roles: Array<Role>,
}

function createParticipant(name: string, roles: Array<Role>): Participant {
    return {
        id: crypto.randomUUID(),
        displayName: name,
        roles: roles,
    }
}