import type { Agenda, ProposedAgendaItem } from "./agenda"
import { createAgenda, stringToPriority } from "./agenda";
import type { MeetingStructure } from "./meeting"
import { datamark } from "datamark";
import { inlineText, sectionsAtDepth, textContent } from "datamark/parse";
import * as z from "zod";
import { Temporal } from '@js-temporal/polyfill';

const AgendaFrontmatterSchema = z.object({
    proposedOn: z.string(),
    duration: z.number(),
    priority: z.string(),
    proposer: z.string(),
})

const MeetingFrontmatterSchema = z.object({ 
    duration: z.number(),
    roles: z.array(z.string()).optional(),
    timers: z.array(z.string()).optional(),
});

const AgendaItemFormat = datamark({
    frontmatterSchema: AgendaFrontmatterSchema,

    parse(doc): ProposedAgendaItem {
        const priority = stringToPriority(doc.frontmatter.priority)
        return {
            proposedOn: Temporal.Instant.from(doc.frontmatter.proposedOn),
            proposedBy: doc.frontmatter.proposer,
            votes: 0,
            priority: priority,
            expectedDuration: Temporal.Duration.from({minutes: doc.frontmatter.duration}),
            title: "",
        }
    }
})

export const MeetingFormat = datamark({
    frontmatterSchema: MeetingFrontmatterSchema,

    parse(doc): {structure: MeetingStructure, agenda: Agenda} {
        const sections = sectionsAtDepth(doc.root, 2);
        console.log(doc)
        sections.forEach(sec => {
            // This is a little jank :/
            const text = textContent(sec);
            var proposedItem = AgendaItemFormat.parse(text);
            proposedItem.title = inlineText(sec.heading!.children);
        });
        return {
            structure: {
                duration: Temporal.Duration.from({minutes: doc.frontmatter.duration}),
                allowedRoles: doc.frontmatter.roles || [],
                timeWarnings: []
            }, 
            agenda: createAgenda([]),
        }
    }
})