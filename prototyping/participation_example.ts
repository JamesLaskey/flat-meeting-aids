// Pick random order of participants with buttons to advance to next person

import { Access } from "../src/access";
import { DiscussionQueue } from "../src/discussion";
import { createParticipant, type Participant } from "../src/participants";
import { rotationForRole } from "../src/rotation";

console.log(" ----- ROTATION ----- ")
// Rotation
// Create a new rotation
// Swap people
// Advance through the rotation with add and remove roles
const alice = createParticipant("Alice", [])
const barb = createParticipant("Barbara", [])
const clarissa = createParticipant("Clarissa", [])
const rotationMembers: Array<Participant> = [
   alice,
   barb,
   clarissa, 
]
const rotation = rotationForRole(rotationMembers, "facilitator")
console.log(rotation.currentHolder) // Alice is current
rotation.activateCurrent()
console.log(Access.getRoles(rotation.currentHolder)) // Alice now has 'facilitator' role
rotation.finishActive()
console.log(Access.getRoles(rotation.currentHolder)) // Alice 'facilitator' role removed
rotation.advance()
console.log(rotation.currentHolder) // Barbara is now current

console.log(" ----- DISCUSSION QUEUE ----- ")
// Discussion Queue
const dq = new DiscussionQueue(new Set(rotationMembers))
// Start a discussion by adding topics, first proposed topics go first
const aID = dq.raiseNewTopic(alice, "topicA")
const bID = dq.raiseNewTopic(barb, "topicB")
console.log(dq.nextSpeaker()) // Alice
dq.addToTopic(clarissa, aID)
dq.addToTopic(barb, aID)
console.log(dq.nextSpeaker()) // Clarissa
console.log(dq.nextSpeaker()) // Barb
console.log(dq.nextSpeaker()) // Barb, now on topicB
dq.addToTopic(alice, bID)
dq.addToTopic(barb, bID)
console.log(dq.nextSpeaker()) // Alice
console.log(dq.closeTopic(bID)) // contains Barb who did not get a chance to speak
console.log(dq.nextSpeaker() === undefined) // noone, discussion ends
console.log(dq.allParticipants) // show speaker stats