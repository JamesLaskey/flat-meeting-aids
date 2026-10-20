# flat-meeting-aids
Collection of tools to help run flat meetings. Help set an agenda and vote for decision making

## Status
This repo is currently in development and prototyping! Not looking for outside contributions at the moment (and definitely not AI contributions)

## Proposed Functionality
Non hierarchical meetings, ie. one without a predesignated approver/set of approvers, can be found in organizing committee meetings, political organizations, and anarchist spaces. These are spaces where members are known, reasonably trusted, and expected to be treated as equals. Coming to decisions in such environments, especially in a timely manner, can be hard. The intention with these utilities is to help those meetings run smoothly, reach more egalitarian decisions, and avoid [tyranny of structurelessness](https://www.jofreeman.com/joreen/tyranny.htm) style issues. To that end a non exhaustive set of features this repo might explore:
- agenda proposal handling to ensure that all items on the agenda meet certain criteria (have a time limit, have questions and desired outcomes, have someone assigned to lead the discussion, etc) and that the overall agenda will fit within the meeting timeframe
- agenda backlog and triage to ensure items don't get stranded week after week
- time keeping during meetings with nudges during the final minutes of each item to ensure action items are handled
- tools to help finalize decisions and make sure everyone is heard such as round robin through participant (or a random subset) to give them a chance to speak, approval voting, ranked choice voting, etc
- encoding [Robert's rules of order](https://assembly.cornell.edu/sites/default/files/roberts_rules_simplified.pdf) into a bot to help track position in the process

These utilities could then be packaged up into a few different locations:
- plugins for docs
- obsidian plugin
- chrome extension
- standalone web page
Currently undecided which of these is the most useful but they all rely on common web technologies