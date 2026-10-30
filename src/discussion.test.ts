import { expect, test } from 'vitest'
import { createParticipant } from './participants'
import { DiscussionQueue } from './discussion'

const alice = createParticipant("Alice", [])
const barb = createParticipant("Barbara", [])
const clarissa = createParticipant("Clarissa", [])
const dana = createParticipant("Dana", [])
const elena = createParticipant("Elena", [])

const allParticipants = new Set([alice, barb, clarissa, dana, elena])

test("DiscussionQueue_raiseTopic_nextSpeakerIsTopicRaiser", () => {
    const dq = new DiscussionQueue(allParticipants)

    dq.raiseNewTopic(alice)

    expect(dq.nextSpeaker()).toBe(alice)
})

test("DiscussionQueue_raiseTopic_proceedThroughTopics", () => {
    const dq = new DiscussionQueue(allParticipants)

    dq.raiseNewTopic(alice)
    dq.raiseNewTopic(clarissa)
    dq.raiseNewTopic(barb)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(clarissa)
    expect(dq.nextSpeaker()).toBe(barb)
})

test("DiscussionQueue_raiseTopic_sameInitiatorCanHaveMultipleTopics", () => {
    const dq = new DiscussionQueue(allParticipants)

    dq.raiseNewTopic(alice, "topicA")
    dq.raiseNewTopic(alice, "topicB")
    dq.raiseNewTopic(barb)
    dq.raiseNewTopic(alice, "topicC")

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(barb)
    expect(dq.nextSpeaker()).toBe(alice)
})

test("DiscussionQueue_addToTopic_nextSpeakerAdvancesThroughQueue", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    dq.addToTopic(barb, id)
    dq.addToTopic(clarissa, id)
    dq.addToTopic(dana, id)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(barb)
    expect(dq.nextSpeaker()).toBe(clarissa)
    expect(dq.nextSpeaker()).toBe(dana)
})

test("DiscussionQueue_addToTopic_speakerCanOnlyBeAddedOnce", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    dq.addToTopic(barb, id)
    dq.addToTopic(clarissa, id)

    expect(dq.addToTopic(barb, id)).toBe(false)
})

test("DiscussionQueue_addToTopic_goThroughEachTopicQueuesBeforeTopics", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    const id2 = dq.raiseNewTopic(barb)
    dq.addToTopic(clarissa, id)
    dq.addToTopic(clarissa, id2)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(clarissa)
    expect(dq.nextSpeaker()).toBe(barb)
    expect(dq.nextSpeaker()).toBe(clarissa)
})

test("DiscussionQueue_removeFromTopicQueue_notPartOfQueueIsNoOp", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    dq.addToTopic(clarissa, id)
    dq.dropFromTopicQueue(clarissa, id)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBeUndefined()
})

test("DiscussionQueue_removeFromTopicQueue_ifQueueEmptyTopicIsClosed", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    const id2 = dq.raiseNewTopic(dana)
    dq.addToTopic(clarissa, id)
    dq.nextSpeaker()
    dq.dropFromTopicQueue(clarissa, id)

    expect(dq.nextSpeaker()).toBe(dana)
})

test("DiscussionQueue_removeFromTopicQueue_participantOnlyDroppedFromThatQueue", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    const id2 = dq.raiseNewTopic(dana)
    dq.addToTopic(clarissa, id)
    dq.addToTopic(clarissa, id2)
    dq.dropFromTopicQueue(clarissa, id)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(dana)
    expect(dq.nextSpeaker()).toBe(clarissa)
})

test("DiscussionQueue_closeTopic_topicSkipped", () => {
    const dq = new DiscussionQueue(allParticipants)

    const id = dq.raiseNewTopic(alice)
    const id2 = dq.raiseNewTopic(dana)
    const id3 = dq.raiseNewTopic(elena)
    dq.addToTopic(clarissa, id)
    dq.addToTopic(clarissa, id2)
    dq.closeTopic(id2)

    expect(dq.nextSpeaker()).toBe(alice)
    expect(dq.nextSpeaker()).toBe(clarissa)
    expect(dq.nextSpeaker()).toBe(elena)
})

test("DiscussionQueue_nextSpeaker_emptyQueueReturnsUndefined", () => {
    const dq = new DiscussionQueue(allParticipants)

    expect(dq.nextSpeaker()).toBeUndefined()
})

test("DiscussionQueue_nextSpeaker_finishedQueueReturnsUndefined", () => {
    const dq = new DiscussionQueue(allParticipants)

    dq.raiseNewTopic(alice)
    dq.nextSpeaker()

    expect(dq.nextSpeaker()).toBeUndefined()
})
