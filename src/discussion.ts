import { Temporal } from "@js-temporal/polyfill";
import type { Participant } from "./participants";
import { drop, first } from "es-toolkit/compat";

type SpeakerMetadata = {
    timeSpentTalking: Temporal.Duration,
    timesJoined: number
}
export type TopicId = string
type Topic = {
    id: TopicId
    initiator: Participant,
    description: string,
    queue: Array<Participant>,
}
export class DiscussionQueue {
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

        this.topics = this.topics.filter((t) => {
            return t.id !== topic
        })
        
        return toFinish?.queue ?? []
    }

    private advanceQueue(topic: Topic): Participant | undefined {
        const nextSpeaker = first(topic.queue)
        if (!nextSpeaker) {
            return undefined            
        }

        const remainingQueue = drop(topic.queue, 1)
        topic.queue = remainingQueue
        return nextSpeaker
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
        var topic = first(this.topics)
        if (!topic) {
            this.lastSpeaker = undefined
            return undefined
        }

        var nextSpeaker = this.advanceQueue(topic)
        var panicSearchDepth = 0
        while (!nextSpeaker && this.topics.length > 0 && panicSearchDepth++ < 500) {
            this.closeTopic(topic.id)
            topic = first(this.topics)                
            if (!topic) {
                this.lastSpeaker = undefined
                return undefined
            }
            nextSpeaker = this.advanceQueue(topic)
        }
        if (!nextSpeaker) {
            this.lastSpeaker = undefined
            return undefined    
        }
        this.lastSpeaker = {
            speaker: nextSpeaker,
            startTime: Temporal.Now.instant()
        }
        return nextSpeaker
    }
}