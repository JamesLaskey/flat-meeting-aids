// Pick random order of participants with buttons to advance to next person

import { Access } from "../src/access";
import { createParticipant, type Participant } from "../src/participants";
import { rotationForRole } from "../src/rotation";

// Volunteers
// Ask people to opt out and then pick a random participant
// Ask people to opt in and then pick a random participant

// Rotation
// Create a new rotation
// Swap people
// Advance through the rotation with add and remove roles
const rotationMembers: Array<Participant> = [
    createParticipant("Alice", []),
    createParticipant("Barbara", []),
    createParticipant("Clarissa", []),
]
const rotation = rotationForRole(rotationMembers, "facilitator")
console.log(rotation.currentHolder) // Alice is current
rotation.activateCurrent()
console.log(Access.getRoles(rotation.currentHolder)) // Alice now has 'facilitator' role
rotation.finishActive()
console.log(Access.getRoles(rotation.currentHolder)) // Alice 'facilitator' role removed
rotation.advance()
console.log(rotation.currentHolder) // Barbara is now current