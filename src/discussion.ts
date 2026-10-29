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
        this.topics.find((t) => {
            return t.id === topic
        })?.queue.push(participant)
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
        const topic = first(this.topics)
        if (!topic) {
            return undefined
        }
        const nextSpeaker = first(topic.queue)
        const remainingQueue = drop(topic.queue, 1)
        if (remainingQueue.length === 0) {
            this.topics = drop(this.topics, 1)
        } else {
            topic.queue = remainingQueue
        }
        return nextSpeaker
    }
}