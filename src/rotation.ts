import { Access } from "./access";
import type { Participant, Role } from "./participants";

type OnActiveFn = (r: Rotation, p: Participant) => void
type OnInActiveFn = (r: Rotation, p: Participant) => void

export class Rotation {
    currentHolder: Participant;
    participants: Array<Participant>;
    onActive: OnActiveFn;
    onInActive: OnInActiveFn;

    constructor(
        initialParticipants: Array<Participant>,
        onActive: OnActiveFn,
        onInActive: OnInActiveFn,
    ) {
        this.participants = initialParticipants;
        this.currentHolder = initialParticipants.at(0)!
        this.onActive = onActive;
        this.onInActive = onInActive;
    }

    advance() {
        this.finishActive();
        const currentIndex = this.participants.findIndex((p: Participant) => p === this.currentHolder)
        const nextIndex = (currentIndex + 1) % this.participants.length
        this.currentHolder = this.participants.at(nextIndex)!
    }

    activateCurrent() {
        this.onActive(this, this.currentHolder)
    }
    
    finishActive() {
        this.onInActive(this, this.currentHolder)
    }

    addParticipant(p: Participant, position: number) {
        this.participants.splice(position, 0, p);
    }

    removeParticipant(toRemove: Participant) {
        this.participants = this.participants.filter((p: Participant) => p === toRemove)
    }

    swap(p1: Participant, p2: Participant) {
        const i1 = this.participants.findIndex((p: Participant) => p === p1)
        const i2 = this.participants.findIndex((p: Participant) => p === p2)
        this.participants[i1] = p2
        this.participants[i2] = p1
    }
}

export function rotationForRole(participants: Array<Participant>, role: Role): Rotation {
    return new Rotation(
        participants,
        (r: Rotation, p: Participant) => {
            Access.giveRole(p, role);
        },
        (r: Rotation, p: Participant) => {
            Access.retractRole(p, role);
        },
    );
}