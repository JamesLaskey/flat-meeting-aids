// Implementations of different voting algorithms
import { tabulate } from 'rcv-engine';
import type { Participant } from './participants';

interface ElectionResult<T> {
    selected: T,
    rankingOfChoices: Array<T>
}

interface Election<R, B> {
    choices(): Set<R>
    runElection(): ElectionResult<R>
    acceptBallot(ballot: B): Boolean
}

interface OptInBallot {
    optIn: Participant
}
class OptInElection implements Election<Participant, OptInBallot> {
    participants: Set<Participant> = new Set()

    choices(): Set<Participant> {
        return this.participants
    }

    acceptBallot(ballot: OptInBallot): Boolean {
        this.participants.add(ballot.optIn)
        return true
    }

    runElection(): ElectionResult<Participant> {
        throw new Error('Method not implemented.');
    }
}

interface OptOutBallot {
    optOut: Participant
}
class OptOutElection implements Election<Participant, OptOutBallot> {
    participants: Set<Participant>

    constructor(participants: Set<Participant>) {
        this.participants = participants
    }

    acceptBallot(b: OptOutBallot): Boolean {
        this.participants.delete(b.optOut)
        return true
    }

    choices(): Set<Participant> {
        return this.participants
    }

    runElection(): ElectionResult<Participant> {
        throw new Error('Method not implemented.');
    }
}