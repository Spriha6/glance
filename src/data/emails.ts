import type { Email } from '../types'

// Mock data is generated relative to "now" so timestamps and deadlines always read naturally.
const now = new Date()

const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000)
const hoursAgo = (hours: number) => minutesAgo(hours * 60)

function daysFromNow(days: number, hours: number, minutes = 0) {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hours, minutes, 0, 0)
  return date
}

const weekday = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' })

type EmailSeed = Omit<Email, 'preview' | 'actionItems' | 'unread' | 'archived'> & {
  actionItems?: string[]
  unread?: boolean
  archived?: boolean
}

function createEmail({ actionItems = [], unread = false, archived = false, ...seed }: EmailSeed): Email {
  return {
    ...seed,
    unread,
    archived,
    preview: seed.body[0],
    actionItems: actionItems.map((text, index) => ({ id: `${seed.id}-task-${index}`, text, done: false })),
  }
}

const deckDue = daysFromNow(1, 17)
const scorecardDue = daysFromNow(1, 12)
const flightDeparts = daysFromNow(1, 8, 15)
const invoiceDue = daysFromNow(2, 12)
const critDate = daysFromNow(2, 14)
const contractDue = daysFromNow(3, 17)
const shutoffDate = daysFromNow(4, 9)

export const initialEmails: Email[] = [
  createEmail({
    id: 'launch-review',
    sender: { name: 'Priya Raman', email: 'priya.raman@northwind.studio', organization: 'Northwind Studio' },
    subject: 'Launch review moved up — need your slides by tomorrow, 5 PM',
    body: [
      'Quick heads-up: leadership moved the Q4 launch review up a day, so we need the final deck earlier than planned.',
      'Could you send me your section — the pricing rationale and the onboarding activation metrics — by tomorrow at 5 PM? I’ll stitch everything together that evening. If the activation numbers aren’t final yet, a clearly labeled estimate is fine.',
      'Also, Daniel asked whether we can cut the competitive landscape slide down to a single page. Let me know if you have opinions before I start trimming.',
      'Thanks so much,\nPriya',
    ],
    receivedAt: minutesAgo(38),
    unread: true,
    priority: 'urgent',
    category: 'work',
    summary:
      'The Q4 launch review moved up a day. Priya needs your pricing rationale and onboarding metrics slides by tomorrow at 5 PM — labeled estimates are fine if numbers aren’t final. She also wants your take on trimming the competitive slide to one page.',
    actionItems: [
      'Send pricing rationale and onboarding metrics slides',
      'Weigh in on cutting the competitive slide to one page',
    ],
    deadline: { label: 'Launch review slides', due: deckDue },
  }),
  createEmail({
    id: 'ci-failure',
    sender: { name: 'Relay CI', email: 'notifications@relay-ci.dev' },
    subject: 'main · Build #2318 failed in checkout-service',
    body: [
      'Build #2318 on main failed during the integration test stage. 3 of 412 tests failed in checkout-service.',
      'Failing tests: tax_calculation_handles_multi_region, applies_discount_before_tax, rounds_to_currency_precision. Triggered by commit 4f1c9a2 “Refactor tax calculation helpers” by Theo Nakamura.',
      'View the full log in Relay CI to see stack traces and retry the pipeline.',
    ],
    receivedAt: minutesAgo(52),
    unread: true,
    priority: 'normal',
    category: 'updates',
    summary:
      'Three tax-calculation integration tests failed on main after Theo’s refactor commit. Nothing is assigned to you — Theo is likely already on it.',
  }),
  createEmail({
    id: 'interview-feedback',
    sender: { name: 'Alicia Gómez', email: 'alicia.gomez@northwind.studio', organization: 'Northwind Studio · Recruiting' },
    subject: 'Feedback needed: Sam Chen, Senior Product Designer loop',
    body: [
      'Thanks for interviewing Sam Chen yesterday for the Senior Product Designer role. We’re planning to make a decision in tomorrow afternoon’s hiring sync.',
      'Could you submit your scorecard by noon tomorrow? Three of the four interviewers have already submitted, and the early signal is positive — your portfolio review is the last piece we need.',
      'If you have concerns you’d rather discuss live, grab 15 minutes on my calendar before the sync.',
      'Best,\nAlicia',
    ],
    receivedAt: hoursAgo(3),
    unread: true,
    priority: 'important',
    category: 'work',
    summary:
      'Alicia needs your interview scorecard for Sam Chen by noon tomorrow so the team can decide at the hiring sync. You’re the last interviewer to submit; feedback so far is positive.',
    actionItems: ['Submit your scorecard for Sam Chen'],
    deadline: { label: 'Interview scorecard', due: scorecardDue },
  }),
  createEmail({
    id: 'newsletter-onboarding',
    sender: { name: 'The Product Brief', email: 'hello@productbrief.news' },
    subject: 'Why the best onboarding flows feel shorter than they are',
    body: [
      'This week: a teardown of five onboarding flows that took longer than average to complete — yet scored highest on perceived speed.',
      'The common thread is momentum. Each flow front-loads a small, satisfying win, defers account setup until value is visible, and uses progress cues that never stall at 90%.',
      'Also inside: the “empty state budget” framework, a reader Q&A on activation metrics, and three job postings from teams hiring PMs.',
    ],
    receivedAt: hoursAgo(4),
    unread: true,
    priority: 'normal',
    category: 'newsletter',
    summary:
      'A teardown of onboarding flows that feel fast despite taking longer: deliver an early win, defer setup until value is clear, and keep progress cues moving. Relevant to your activation metrics work.',
  }),
  createEmail({
    id: 'contract-redlines',
    sender: { name: 'Jordan Park', email: 'jordan.park@lumenhealth.co', organization: 'Lumen Health' },
    subject: 'Contract redlines — two open questions before we sign',
    body: [
      'Our legal team finished reviewing the services agreement. We’re close — just two open questions before we can sign.',
      `First, we’d like to move payment terms from Net-30 to Net-45 to match our standard vendor cycle. Second, we’ve proposed narrower language for the indemnification clause in section 9.2 (redline attached). Could you confirm both by ${weekday(contractDue)} end of day? That keeps us on track for a kickoff the following week.`,
      'Happy to hop on a call if it’s easier to talk through 9.2.',
      'Thanks,\nJordan',
    ],
    receivedAt: hoursAgo(5),
    unread: true,
    priority: 'important',
    category: 'work',
    summary:
      `Lumen Health is nearly ready to sign. Jordan wants confirmation on two changes by ${weekday(contractDue)}: moving payment terms to Net-45 and narrower indemnification language in section 9.2.`,
    actionItems: [
      'Confirm whether Net-45 payment terms work',
      'Review the revised indemnification language in section 9.2',
    ],
    deadline: { label: 'Lumen Health contract response', due: contractDue },
  }),
  createEmail({
    id: 'flight-checkin',
    sender: { name: 'Skyline Air', email: 'trips@skylineair.example' },
    subject: 'Check-in is open: SFO → DEN tomorrow at 8:15 AM',
    body: [
      'Your trip to Denver is almost here. Check-in is now open for flight SA 482, departing San Francisco (SFO) tomorrow at 8:15 AM.',
      'Confirmation code: KX7P2M. Seat 14C. Boarding begins at 7:35 AM from Terminal 2. Add a checked bag online to save $10 compared to the airport counter.',
      'Safe travels — the Skyline Air team',
    ],
    receivedAt: hoursAgo(6),
    priority: 'important',
    category: 'updates',
    summary:
      'Check-in is open for your SFO → DEN flight tomorrow at 8:15 AM (seat 14C, confirmation KX7P2M). Boarding starts at 7:35 AM from Terminal 2.',
    actionItems: ['Check in and save your boarding pass'],
    deadline: { label: 'Flight SA 482 departs', due: flightDeparts },
  }),
  createEmail({
    id: 'invoice-overdue',
    sender: { name: 'Marcus Bell', email: 'marcus.bell@northwind.studio', organization: 'Northwind Studio · Finance' },
    subject: 'Approval needed: Invoice #4821 is 12 days overdue',
    body: [
      'Invoice #4821 from Fieldwork Research ($8,400) is still waiting on your approval and is now 12 days past due.',
      `The vendor let us know a 2% late fee applies if payment isn’t scheduled by ${weekday(invoiceDue)} at noon. Once you approve it in the finance portal, I can release payment the same day.`,
      'If anything on the invoice looks off, just reply here and I’ll put it on hold instead.',
      'Best,\nMarcus',
    ],
    receivedAt: hoursAgo(6.5),
    unread: true,
    priority: 'urgent',
    category: 'work',
    summary:
      `Invoice #4821 ($8,400, Fieldwork Research) is 12 days overdue and needs your approval. A 2% late fee kicks in if it isn’t scheduled by ${weekday(invoiceDue)} at noon.`,
    actionItems: ['Approve invoice #4821 in the finance portal'],
    deadline: { label: 'Approve invoice #4821', due: invoiceDue },
  }),
  createEmail({
    id: 'design-crit',
    sender: { name: 'Elena Torres', email: 'elena.torres@northwind.studio', organization: 'Northwind Studio' },
    subject: `Can we move ${weekday(critDate)}’s design crit?`,
    body: [
      `I’ve got a conflict with the customer research readout, so I’m hoping to move ${weekday(critDate)}’s design crit from 2 PM to later in the afternoon.`,
      'Would 3:30 or 4 PM work for you? If neither does, I can also do the next morning before 11.',
      'Thanks!\nElena',
    ],
    receivedAt: hoursAgo(7),
    priority: 'important',
    category: 'work',
    summary: `Elena needs to move ${weekday(critDate)}’s 2 PM design crit. She’s offering 3:30 PM, 4 PM, or the next morning before 11.`,
    actionItems: ['Reply to Elena with a new crit time'],
  }),
  createEmail({
    id: 'one-on-one',
    sender: { name: 'Ben Okafor', email: 'ben.okafor@northwind.studio', organization: 'Northwind Studio' },
    subject: 'Agenda for our 1:1',
    body: [
      'I started a doc for our 1:1 tomorrow. So far I’ve added Q4 planning priorities and a check-in on how the new review process is working for you.',
      'Add anything you’d like to cover — no topic too small. If you want to spend part of the time on career goals, we can do that too.',
      'Ben',
    ],
    receivedAt: hoursAgo(26),
    priority: 'normal',
    category: 'work',
    summary:
      'Ben shared an agenda doc for tomorrow’s 1:1 covering Q4 priorities and the new review process. He’s asking you to add your own topics.',
    actionItems: ['Add your topics to the 1:1 agenda doc'],
  }),
  createEmail({
    id: 'dinner',
    sender: { name: 'Maya Patel', email: 'maya.patel@mailbox.org' },
    subject: 'Dinner Sunday? 🍝',
    body: [
      'We’re doing a pasta night at our place on Sunday — would love for you to come! Thinking 7 PM, but we’re flexible.',
      'Let me know if you’re in and whether you have any food restrictions these days. And if you still have my blue serving dish, bring it along!',
      'xx Maya',
    ],
    receivedAt: hoursAgo(28),
    unread: true,
    priority: 'normal',
    category: 'personal',
    summary: 'Maya is hosting pasta night Sunday around 7 PM and wants to know if you can come. She also asked you to bring back her blue serving dish.',
    actionItems: ['RSVP to Maya’s pasta night', 'Bring back the blue serving dish'],
  }),
  createEmail({
    id: 'water-shutoff',
    sender: { name: 'Harbor Property Management', email: 'office@harborpm.example' },
    subject: `Scheduled water shutoff — ${weekday(shutoffDate)}, 9 AM to 1 PM`,
    body: [
      `Water service to the building will be shut off on ${weekday(shutoffDate)} from 9 AM to 1 PM while our plumbers replace the main valve.`,
      'Please avoid running dishwashers or washing machines during this window. Hot water may take up to an hour to return to normal temperature afterward.',
      'We apologize for the inconvenience. — Harbor PM',
    ],
    receivedAt: hoursAgo(30),
    priority: 'normal',
    category: 'updates',
    summary: `Building water will be off ${weekday(shutoffDate)} from 9 AM to 1 PM for a valve replacement. No action needed — just avoid appliances during that window.`,
  }),
  createEmail({
    id: 'newsletter-tokens',
    sender: { name: 'Design Systems Weekly', email: 'issue@dsweekly.news' },
    subject: 'Issue #212: Design tokens that survive a rebrand',
    body: [
      'How three teams structured their token layers so a full rebrand took days instead of months.',
      'Key idea: separate primitive tokens (raw values) from semantic tokens (intent), and never let components reference primitives directly.',
      'Plus: a new open-source contrast checker and a deep dive on motion tokens.',
    ],
    receivedAt: hoursAgo(32),
    priority: 'normal',
    category: 'newsletter',
    summary:
      'Teams that survived rebrands separated primitive tokens from semantic ones and kept components on semantic tokens only. Also covers contrast tooling and motion tokens.',
  }),
  createEmail({
    id: 'newsletter-render',
    sender: { name: 'The Render', email: 'editors@therender.dev' },
    subject: 'React Compiler in production, six months later',
    body: [
      'We talked to four teams that turned on the React Compiler in production apps. The verdict: fewer manual memos, modest render wins, and a few surprises.',
      'The biggest gains came in list-heavy screens. The surprises came from code that mutated props or relied on referential identity in effects.',
      'Also this week: server actions patterns, a CSS anchor positioning primer, and our favorite new dev tools.',
    ],
    receivedAt: hoursAgo(52),
    unread: true,
    priority: 'normal',
    category: 'newsletter',
    summary:
      'Teams using the React Compiler in production saw fewer manual memos and better list performance; problems came from mutating props or effects that depend on referential identity.',
  }),
  createEmail({
    id: 'coffee-receipt',
    sender: { name: 'Cedar & Co. Coffee', email: 'receipts@cedarco.example' },
    subject: 'Your receipt — order #10392',
    body: [
      'Thanks for stopping by! Here’s your receipt for order #10392.',
      'Oat milk cortado — $5.25\nCardamom bun — $4.50\nTotal — $9.75',
      'You’re 2 stamps away from a free drink.',
    ],
    receivedAt: hoursAgo(76),
    archived: true,
    priority: 'normal',
    category: 'updates',
    summary: 'Receipt for a $9.75 order (cortado and cardamom bun). You’re two stamps from a free drink.',
  }),
  createEmail({
    id: 'offsite-photos',
    sender: { name: 'Nadia Rahman', email: 'nadia.rahman@northwind.studio', organization: 'Northwind Studio' },
    subject: 'Offsite photos are up 📸',
    body: [
      'Thanks again for a great offsite! I’ve uploaded all the photos to the shared team album, including the very competitive trivia night.',
      'Feel free to grab any for your profile or slides. Let me know if you’d like any taken down.',
      'Nadia',
    ],
    receivedAt: hoursAgo(98),
    archived: true,
    priority: 'normal',
    category: 'work',
    summary: 'Nadia uploaded the team offsite photos to the shared album. You can use them freely or ask her to remove any.',
  }),
]
