import { createParticipant } from "../src/participants";
import { ApprovalElection, OptInElection, OptOutElection, RankedChoiceElection } from "../src/voting";

const Alice = createParticipant("Alice", [])
const Barbara = createParticipant("Barbara", [])
const Clarissa = createParticipant("Clarissa", [])
const Dana = createParticipant("Dana", [])

// Opt In Volunteering
const optIn = new OptInElection()
optIn.castBallot({
    optIn: Barbara
})
optIn.castBallot({
    optIn: Dana
})
console.log(optIn.runElection()) // one of Barbara or Dana

// Opt Out Volunteering
const optOut = new OptOutElection(new Set([Alice, Barbara, Clarissa, Dana]))
optOut.castBallot({
    optOut: Alice
})
optOut.castBallot({
    optOut: Barbara
})
console.log(optOut.runElection()) // one of Clarissa or Dana

// Approval voting
const approvalElection = new ApprovalElection("is this project good?")
approvalElection.castBallot({
    vote: "yay",
    voter: Alice
})
approvalElection.castBallot({
    vote: "yay",
    voter: Barbara
})
approvalElection.castBallot({
    vote: "nay",
    voter: Clarissa
})
const approvalResult = approvalElection.runElection()
console.log(approvalResult) // passes

// Ranked choice voting
const rcvElection = new RankedChoiceElection(new Set(["option1", "option2", "option3"]))
const option1Id = rcvElection.listChoices().keys().find((c) => c.name === "option1")!.id
const option2Id = rcvElection.listChoices().keys().find((c) => c.name === "option2")!.id
const option3Id = rcvElection.listChoices().keys().find((c) => c.name === "option3")!.id
rcvElection.castBallot(rcvElection.createBallot([option1Id, option2Id]))
rcvElection.castBallot(rcvElection.createBallot([option2Id, option3Id]))
rcvElection.castBallot(rcvElection.createBallot([option3Id, option2Id]))
console.log(rcvElection.runElection())

// Indicate degree of support