// Implementations of different voting algorithms
import { tabulate } from 'rcv-engine';
import type { Participant } from './participants';

type ElectionResultEnum = "success" | "tie"
interface ElectionResult<T> {
    result: ElectionResultEnum,
    selected: T,
    rankingOfChoices: Array<{choice: T, voteCount: number}>,
}

interface Election<R, B> {
    listChoices(): Set<R>
    runElection(): ElectionResult<R>
    acceptBallot(ballot: B): Boolean
}

interface OptInBallot {
    optIn: Participant
}
class OptInElection implements Election<Participant, OptInBallot> {
    participants: Set<Participant> = new Set()

    listChoices(): Set<Participant> {
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

    listChoices(): Set<Participant> {
        return this.participants
    }

    runElection(): ElectionResult<Participant> {
        throw new Error('Method not implemented.');
    }
}

type ApprovalVoteEnum = "yay" | "nay"
interface ApprovalBallot {
    vote: ApprovalVoteEnum
    voter: Participant
}
class ApprovalElection implements Election<string, ApprovalBallot> {
    atIssue: string
    voters: Set<Participant> = new Set()
    yays = 0
    nays = 0
    constructor(atIssue: string) {
        this.atIssue = atIssue
    }
    listChoices(): Set<string> {
        return new Set([this.atIssue, "reject"])
    }
    runElection(): ElectionResult<string> {
        if (this.yays === this.nays) {
            return {
                result: 'tie',
                selected: '',
                rankingOfChoices: [
                    {choice: "reject", voteCount: this.nays},
                    {choice: this.atIssue, voteCount: this.yays},
                ]
            }
        }
        if (this.yays > this.nays) {
            return {
                result: 'success',
                selected: this.atIssue,
                rankingOfChoices: [
                    {choice: this.atIssue, voteCount: this.yays},
                    {choice: "reject", voteCount: this.nays},
                ]
            }
        } else {
            return {
                result: 'success',
                selected: "reject",
                rankingOfChoices: [
                    {choice: "reject", voteCount: this.nays},
                    {choice: this.atIssue, voteCount: this.yays},
                ]
            }
        }
    }
    acceptBallot(ballot: ApprovalBallot): Boolean {
        if (this.voters.has(ballot.voter)) {
            return false
        }
        this.voters.add(ballot.voter)
        if (ballot.vote === "yay") {
            this.yays += 1
        } else if (ballot.vote === "nay") {
            this.nays += 1
        }
        return true
    }
}