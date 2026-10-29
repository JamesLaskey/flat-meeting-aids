import { Temporal } from "@js-temporal/polyfill";
import type { Participant } from "./participants";
import { drop, first } from "es-toolkit/compat";

type SpeakerMetadata = {
    timeSpentTalking: Temporal.Duration,
    timesJoined: number
}
type TopicId = string
type Topic = {
    id: TopicId
    initiator: Participant,
    description: string,
    queue: Array<Participant>,
}
class DiscussionQueue {
    allParticipants: Map<Participant, SpeakerMetadata>
    topics: Array<Topic> = []
    lastSpeaker: {speaker: Participant, startTime: Temporal.Instant} | undefined

    constructor(participants: Set<Participant>) {
        this.allParticipants = new Map()
        participants.keys().forEach((p) => {
            this.allParticipants.set(p, {
                timeSpentTalking: new Temporal.Duration(),
                timesJoined: 0
            })
        })
    }

    raiseNewTopic(initiator: Participant, description?: string): TopicId {
        const topic: Topic = {
            id: crypto.randomUUID(),
            initiator: initiator,
            description: description ?? "",
            queue: [initiator]
        }
        this.topics.push(topic)
        return topic.id
    }

    addToTopic(participant: Participant, topic: TopicId) {
        const queue = this.topics.find((t) => t.id === topic)?.queue
        // Cannot be in the queue for the same topic multiple times
        if (queue?.some((p) => p.id === participant.id)) {
            return
        }
        queue?.push(participant)
    }

    dropFromTopicQueue(participant: Participant, topic: TopicId) {
        this.topics
            .find((t) => t.id === topic)?.queue
            .filter((p) => p.id === participant.id)
    }

    closeTopic(topic: TopicId): Array<Participant> {
        const toFinish = this.topics.find((t) => {
            return t.id === topic
        })

        this.topics.filter((t) => {
            return t.id === topic
        })
        
        return toFinish?.queue ?? []
    }

    nextSpeaker(): Participant | undefined {
        if (this.lastSpeaker) {
            const stats = this.allParticipants.getOrInsert(this.lastSpeaker.speaker, {
                timeSpentTalking: new Temporal.Duration(),
                timesJoined: 0
            })
            const timeSpent = Temporal.Now.instant().since(this.lastSpeaker.startTime)
            stats.timeSpentTalking.add(timeSpent)
            stats.timesJoined += 1
        }
        const topic = first(this.topics)
        if (!topic) {
            return undefined
        }
        const nextSpeaker = first(topic.queue)
        if (!nextSpeaker) {
            // This shouldn't happen!
            console.log("speaker order has gotten corrupted and topic not closed when queue empty")
            this.closeTopic(topic.id)
            return undefined
        }
        const remainingQueue = drop(topic.queue, 1)
        if (remainingQueue.length === 0) {
            this.topics = drop(this.topics, 1)
        } else {
            topic.queue = remainingQueue
        }
        this.lastSpeaker = {
            speaker: nextSpeaker,
            startTime: Temporal.Now.instant()
        }
        return nextSpeaker
    }
}