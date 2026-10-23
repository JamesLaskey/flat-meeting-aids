import { Access } from "./access";
import type { Participant, Role } from "./participants";

type OnActiveFn = (r: Rotation, p: Participant) => void
type OnInActiveFn = (r: Rotation, p: Participant) => void

class Rotation {
    currentActive: Participant;
    participants: Array<Participant>;
    onActive: OnActiveFn;
    onInActive: OnInActiveFn;

    constructor(
        initialParticipants: Array<Participant>,
        onActive: OnActiveFn,
        onInActive: OnInActiveFn,
    ) {
        this.participants = initialParticipants;
        this.currentActive = initialParticipants.at(0)!
        this.onActive = onActive;
        this.onInActive = onInActive;
    }

    advance() {
        this.finishParticipant();
        const currentIndex = this.participants.findIndex((p: Participant) => p === this.currentActive)
        const nextIndex = (currentIndex + 1) % this.participants.length
        this.currentActive = this.participants.at(nextIndex)!
    }

    activateParticipant() {
        this.onActive(this, this.currentActive)
    }
    
    finishParticipant() {
        this.onInActive(this, this.currentActive)
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

function rotationForRole(participants: Array<Participant>, role: Role): Rotation {
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