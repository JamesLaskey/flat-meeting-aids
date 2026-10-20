import type { Participant, Role } from './participants'
import type { Agenda } from './agenda'
import type { TimeWarning } from './timekeeping'
import { Temporal } from '@js-temporal/polyfill';

export interface MeetingStructure {
    duration: Temporal.Duration,
    allowedRoles: Array<Role>,
    timeWarnings: Array<TimeWarning>
}

interface Meeting {
    agenda: Agenda,
    participants: Array<Participant>,
    startTime: Temporal.Instant,
    structure: MeetingStructure,
}

function getRandomParticipant(meeting: Meeting): Participant | undefined {
    let participants = meeting.participants;
    if (participants.length === 0) {
        return undefined;
    }
    const i = Math.floor(Math.random() * participants.length);
    return participants[i];
}

