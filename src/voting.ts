// Implementations of different voting algorithms
import { tabulate, type Ballot} from 'rcv-engine';
import type { Participant } from './participants';
import { shuffle } from 'es-toolkit/compat';

class IllegalElectionException extends Error {}
type ElectionResultEnum = "success" | "tie"
interface ElectionResult<T> {
    result: ElectionResultEnum,
    selected?: T,
    rankingOfChoices: Array<{choice: T, voteCount: number}>,
}

interface Election<R, B> {
    listChoices(): Set<R>
    runElection(): ElectionResult<R>
    castBallot(ballot: B): Boolean
}

export interface OptInBallot {
    optIn: Participant
}
export class OptInElection implements Election<Participant, OptInBallot> {
    participants: Set<Participant> = new Set()

    listChoices(): Set<Participant> {
        return this.participants
    }

    castBallot(ballot: OptInBallot): Boolean {
        this.participants.add(ballot.optIn)
        return true
    }

    runElection(): ElectionResult<Participant> {
        const ordering = shuffle(this.participants.keys().toArray())
        if (ordering.length === 0) {
            throw new IllegalElectionException()
        }
        return {
            result: 'success',
            selected: ordering.at(0)!,
            rankingOfChoices: ordering.map((p) => {
                return {
                    choice: p,
                    voteCount: 1
                }
            })
        }
    }
}

export interface OptOutBallot {
    optOut: Participant
}
export class OptOutElection implements Election<Participant, OptOutBallot> {
    participants: Set<Participant>

    constructor(participants: Set<Participant>) {
        this.participants = participants
    }

    castBallot(b: OptOutBallot): Boolean {
        this.participants.delete(b.optOut)
        return true
    }

    listChoices(): Set<Participant> {
        return this.participants
    }

    runElection(): ElectionResult<Participant> {
        const ordering = shuffle(this.participants.keys().toArray())
        if (ordering.length === 0) {
            throw new IllegalElectionException()
        }
        return {
            result: 'success',
            selected: ordering.at(0)!,
            rankingOfChoices: ordering.map((p) => {
                return {
                    choice: p,
                    voteCount: 1
                }
            })
        }
    }
}

export type ApprovalVoteEnum = "yay" | "nay"
export interface ApprovalBallot {
    vote: ApprovalVoteEnum
    voter: Participant
}
export class ApprovalElection implements Election<string, ApprovalBallot> {
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
    castBallot(ballot: ApprovalBallot): Boolean {
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

type CandidateId = string
type Candidate = {
    id: CandidateId,
    name: string,
    isWriteIn?: boolean,
}
export function createRCVCandidate(name: string): Candidate {
    return {
        id: crypto.randomUUID(),
        name: name,
        isWriteIn: false
    }
}

interface RankedBallot {
  id: string;
  rankings: { type: 'candidate'; id: string }[];
}

export class RankedChoiceElection implements Election<Candidate, RankedBallot> {
    choices: Array<Candidate>
    ballots: Array<Ballot> = []
    constructor(choices: Set<string>) {
        this.choices = choices.keys().map((opt) => {
            return {
                id: crypto.randomUUID(),
                name: opt,
                isWriteIn: false
            }
        }).toArray()
    }

    listChoices(): Set<Candidate> {
        return new Set(this.choices)
    }

    runElection(): ElectionResult<Candidate> {
        const result = tabulate({
            schemaVersion: 1,
            candidates: this.choices,
            ballots: this.ballots,
            options: {
                method: 'irv',
                seats: 1,
                tieBreak: {
                    strategy: 'random',
                    seed: 'flat-meeting-aid'
                },
                quotaMode: 'static',
                writeInsAllowed: false
            }
        })
        if (result.summary.unusualOutcomes.length > 0) {
            return {
                result: 'tie',
                rankingOfChoices: []
            }
        }
        const winnerId = result.winners.at(0)?.candidateId
        return {
                result: 'success',
                selected: this.choices.find((c) => c.id === winnerId),
                rankingOfChoices: result.winners.map((w) => {
                    return {
                        choice: this.choices.find((c) => c.id === w.candidateId)!,
                        voteCount: Number(BigInt(w.finalTally.numerator) / BigInt(w.finalTally.denominator)),
                    }
                })
            }
    }

    createBallot(candidateOrder: CandidateId[]): RankedBallot {
        return {
            id: crypto.randomUUID(),
            rankings: candidateOrder.map((id) => {
                return {
                    type: 'candidate',
                    id: id,
                }
            })
        }
    }

    castBallot(ballot: RankedBallot): Boolean {
        if (this.ballots.some((b) => b.id === ballot.id)) {
            return false
        }
        this.ballots.push(ballot)
        return true
    }
}