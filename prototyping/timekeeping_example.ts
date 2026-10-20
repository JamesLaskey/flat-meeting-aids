import { Temporal } from '@js-temporal/polyfill';

// Full meeting timekeeping
// Given agenda with durations, auto create timers and advance through them
// Instantiate agenda
// Start meeting
// Topic 1 needs 10 minutes and has a 2 minute warning
// Topic 2 uses its full time and needs additional time, time extension +10 minutes
// Topic 3 uses less time than needed and finishes 2 minutes early
// Topic 4 would run past end of meeting given earlier over time
// Topic 5 held until next meeting

// Add hoc timekeeping utility
// Create a timer with default warnings at half time and 2 minutes remaining
// Additional time added and shows over time
const adhocTimer = MeetingTimer