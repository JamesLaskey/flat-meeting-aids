import { Temporal } from '@js-temporal/polyfill';

type Priority = "mustInclude" | "urgent" | "normal" | "ifTimeAvailable"

export function stringToPriority(st: string): Priority {
    if (st === "mustInclude" || st === "urgent" || st === "normal" || st === "ifTimeAvailable") {
        return st
    }
    return "normal"
}

// Currently just upvoting
type ProposalVotes = number

export interface ProposedAgendaItem {
    proposedOn: Temporal.Instant,
    proposedBy: string,
    votes: ProposalVotes,
    priority: Priority,
    expectedDuration: Temporal.Duration,
    title: string,
}

type ResolutionMethod = "upDownVote" | "rankedChoiceVote" | "discussion"

interface Resolution {
    actionItems?: Array<string>,
    method?: ResolutionMethod,
}

interface AgendaItem {
    proposedOn: Temporal.Instant,
    duration?: Temporal.Duration,
    title: string,
    resolution?: Resolution,
}

export interface Agenda {
    currentItemIndex: number,
    desiredItems: Array<AgendaItem>,
    extraItems: Array<AgendaItem>,
    backlog: Backlog,
}

interface Backlog {
    items: Array<AgendaItem>,
}

export function createAgenda(proposals: Array<ProposedAgendaItem>): Agenda {
    return {
        currentItemIndex: 0,
        desiredItems: [],
        extraItems: [],
        backlog: {items: []}
    }
}