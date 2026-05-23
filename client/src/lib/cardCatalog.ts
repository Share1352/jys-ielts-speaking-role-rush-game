export interface RoleCardView {
  id: string;
  title: string;
  privateBrief: string;
}

export interface ChaosCardView {
  id: string;
  instruction: string;
  successCriteria: string;
  examplePhrases: string[];
}

const topicRoles: Array<Array<[string, string, string]>> = [
  [
    ['ai_parent_guardian', 'Parent Guardian', 'Push for strong limits on unsupervised AI use and request weekly progress evidence from teachers.'],
    ['ai_teacher_workload', 'Overloaded Teacher', 'Support AI for drafting but demand a realistic marking policy so staff burnout does not rise.'],
    ['ai_student_advocate', 'Student Advocate', 'Argue that responsible AI can reduce stress and increase creativity if students still explain their reasoning.'],
    ['ai_university_admissions', 'University Admissions Officer', 'Warn that AI-generated portfolios without authentic voice may reduce trust in applicant performance.'],
    ['ai_principal_budget', 'Principal with Limited Budget', 'Need a policy that schools can implement without buying expensive new software each semester.'],
    ['ai_rural_teacher', 'Rural School Teacher', 'Highlight unstable internet access and ask for an option that works for low-connectivity communities.'],
    ['ai_ethics_researcher', 'Education Ethics Researcher', 'Prioritize transparent citation standards and a staged rollout with measurable impact checks.'],
    ['ai_employer_partner', 'Local Employer Partner', 'Request graduates who can collaborate with AI while still communicating clearly under pressure.']
  ],
  [
    ['transport_bus_driver', 'Bus Driver Union Leader', 'Support more bus lanes but require guarantees on shift safety and fair schedules.'],
    ['transport_shop_owner', 'Main Street Shop Owner', 'Fear reduced car access will hurt sales and ask for a staged plan with delivery windows.'],
    ['transport_disabled_resident', 'Resident with Mobility Needs', 'Demand curb access, reliable lifts, and protected drop-off points across all districts.'],
    ['transport_env_planner', 'Environmental Planner', 'Push for rapid emissions cuts through low-emission zones and high-frequency buses.'],
    ['transport_suburban_parent', 'Suburban Parent', 'Need predictable school commute options that do not add daily childcare pressure.'],
    ['transport_courier_manager', 'Courier Operations Manager', 'Require practical freight routes so local logistics remains stable during transition.'],
    ['transport_mayor_adviser', 'Mayor Policy Adviser', 'Need a politically viable compromise that shows early wins before the next budget cycle.'],
    ['transport_student_commuter', 'Part-Time Student Commuter', 'Support cheaper late-evening transport and safer stations after classes.']
  ]
];

const generatedRoleGroups: Array<{ prefix: string; titles: string[]; briefs: string[] }> = [
  { prefix: 'tourism', titles: ['Guesthouse Owner','Lifelong Resident','Town Youth Worker','Heritage Guide','Waste Services Manager','Street Musician','Hospital Nurse','Weekend Visitor'], briefs: ['Need year-round income not only peak-season spikes.','Worry rent inflation is forcing families away from the center.','Want youth spaces protected from party tourism spillover.','Need crowd control that does not damage historic landmarks.','Demand funding for waste and toilet capacity upgrades.','Depend on tourist flow but dislike strict noise curfews.','Concerned that emergency services are overloaded in summer.','Accept timed entry systems if communication is simple.'] },
  { prefix: 'career', titles: ['Career Counselor','Tech Startup Mentor','Vocational Trainer','Anxious Parent','Gap-Year Student','Public School Accountant','Freelance Designer','Labor Economist'], briefs: ['Need practical internship maps across industries.','Want project-based modules with portfolio assessment.','Insist hands-on trades remain respected and funded.','Fear unstable income and weak benefits for young workers.','Argue for life-skills coaching before specialization.','Must control costs while adding new programs.','Support flexible pathways with client communication training.','Request evidence-driven pilots before systemwide reform.'] },
  { prefix: 'housing', titles: ['Tenant Organizer','Property Developer','School Principal','Retired Homeowner','Transit Engineer','Construction Worker','Social Worker','City Budget Officer'], briefs: ['Push for stronger renter protections and transparent waitlists.','Need faster approvals to keep project costs manageable.','Need school expansion planning before large move-ins.','Worried about rapid neighborhood change and noise.','Require density near transit for viable service frequency.','Need stable jobs and safe timelines during build phases.','See rising homelessness and demand immediate action.','Need phased funding that avoids deficit spikes.'] },
  { prefix: 'wellbeing', titles: ['School Psychologist','Debate Team Captain','Cyberbullying Counselor','PE Teacher','Parent Association Chair','App Developer','Librarian','Classroom Assistant'], briefs: ['Need calmer breaks and stronger support referral pathways.','Want controlled access for research and team coordination.','See harm patterns and demand quick reporting tools.','Prefer active lunch blocks without phones on fields.','Need consistent rules across grades and subjects.','Can provide focus-mode features if schools set standards.','Need media literacy integrated into regular assignments.','Need practical routines that are easy to enforce daily.'] },
  { prefix: 'water', titles: ['Small Farmer','Urban Tenant','Factory Manager','Public Health Officer','Restaurant Owner','Reservoir Engineer','Community Mediator','Climate Youth Leader'], briefs: ['Need seasonal flexibility to avoid crop loss.','Need fair pricing that protects low-income households.','Can invest in recycling systems if transition support exists.','Prioritize safe hygiene standards during restrictions.','Need clear guidance for kitchen sanitation and operations.','Require urgent leak repairs and meter modernization.','Need trust-building meetings across competing groups.','Demand long-term adaptation, not temporary slogans.'] },
  { prefix: 'inclusion', titles: ['Special Education Coordinator','New Arrival Student','Homeroom Teacher','Interpreter Volunteer','Parent of Autistic Child','Curriculum Designer','Exam Supervisor','After-School Coach'], briefs: ['Need staffing commitments for individualized support.','Need orientation support and friendship mentoring.','Need planning time for differentiated lessons.','Need translated communication in family meetings.','Need sensory-friendly routines and predictable transitions.','Need inclusive assessments that preserve rigor.','Need fair accommodations during timed tasks.','Need mixed-ability activities with social confidence goals.'] },
  { prefix: 'health', titles: ['Clinic Nurse','Religious Community Leader','Youth Influencer','Elderly Care Coordinator','Pharmacist','Data Privacy Advocate','Municipal Communications Officer','Migrant Worker Representative'], briefs: ['Need practical outreach hours beyond weekdays.','Need respectful messaging aligned with community values.','Can amplify campaign if content is honest and relatable.','Need home-visit support for isolated seniors.','Need clear medication guidance and side-effect communication.','Demand transparent data boundaries in outreach tools.','Need a consistent multilingual media calendar.','Need access for people with unstable schedules and transport.'] },
  { prefix: 'food', titles: ['Supermarket Manager','Food Bank Coordinator','Restaurant Chef','Waste Collection Lead','University Student','Cold-Chain Logistics Planner','Public Safety Inspector','Neighborhood Volunteer'], briefs: ['Need legal clarity on donation timelines and liability.','Need predictable supply and storage support.','Can redesign menus around surplus ingredients.','Need route changes and sorting standards.','Can lead awareness campaigns on portion planning.','Need investment in refrigerated transfer points.','Need compliance checks without heavy bureaucracy.','Need simple pickup systems for local donors.'] },
  { prefix: 'work', titles: ['Team Manager','Junior Employee','HR Director','Single Parent Worker','IT Security Lead','Office Landlord','Occupational Therapist','Labor Rights Advocate'], briefs: ['Need clear output-based expectations across teams.','Need mentorship visibility in hybrid settings.','Need fair evaluation standards for all work modes.','Need schedule flexibility during caregiving hours.','Need secure device and data handling policies.','Need predictable occupancy planning for leases.','Need ergonomic guidance for home setups.','Need safeguards against hidden overtime pressure.'] },
  { prefix: 'night', titles: ['Live Music Venue Owner','Night Shift Nurse','Police Liaison Officer','Resident Association Leader','Taxi Driver','University Event Organizer','Street Cleaner Supervisor','Harm Reduction Volunteer'], briefs: ['Need predictable licensing conditions to keep shows viable.','Need quieter routes near hospital zones.','Need prevention-first plans instead of heavy punitive action.','Need sleep protection and complaint follow-up.','Need safer pickup points after midnight.','Need safer student event protocols and transport.','Need staffing budgets for weekend cleaning peaks.','Need hydration and de-escalation stations near hotspots.'] }
];

const roleEntries = [
  ...topicRoles.flat(),
  ...generatedRoleGroups.flatMap((group) => group.titles.map((title, index) => [`${group.prefix}_role_${index + 1}`, title, group.briefs[index]] as [string, string, string]))
];

export const roleCardMap: Record<string, RoleCardView> = Object.fromEntries(
  roleEntries.map(([id, title, privateBrief]) => [id, { id, title, privateBrief }])
);

export const chaosCardMap: Record<string, ChaosCardView> = {
  chaos_bridge_values: { id: 'chaos_bridge_values', instruction: 'Connect two competing values and propose a bridge between them.', successCriteria: 'Name both values and offer one practical bridge action.', examplePhrases: ['We can protect fairness while keeping efficiency by...', 'A balanced step is to...'] },
  chaos_concession: { id: 'chaos_concession', instruction: 'Give one concession to another stakeholder before defending your main idea.', successCriteria: 'State a real concession and then return to your own proposal.', examplePhrases: ['I accept that this concern is valid, and still we need...', 'That point is reasonable, yet a safer plan is...'] },
  chaos_risk_mitigation: { id: 'chaos_risk_mitigation', instruction: 'Present one risk and one mitigation action in sequence.', successCriteria: 'The risk is concrete and the mitigation is actionable.', examplePhrases: ['A likely risk is..., so we should...', 'To avoid this downside, the team can...'] },
  chaos_timeline: { id: 'chaos_timeline', instruction: 'Outline a short timeline with immediate and later steps.', successCriteria: 'Include at least two time phases and one measurable milestone.', examplePhrases: ['In the first month we can..., then by term two we will...', 'A phased rollout helps us...'] },
  chaos_community_voice: { id: 'chaos_community_voice', instruction: 'Integrate one community perspective that is often overlooked.', successCriteria: 'Name the overlooked group and adapt the plan for them.', examplePhrases: ['We should not ignore families who...', 'An overlooked group here is...'] },
  chaos_resource_limit: { id: 'chaos_resource_limit', instruction: 'Defend your idea under strict budget limits.', successCriteria: 'Mention cost control and one low-cost implementation detail.', examplePhrases: ['Given limited funding, we can start with...', 'A low-cost pilot would...'] },
  chaos_counterargument: { id: 'chaos_counterargument', instruction: 'State the strongest counterargument and respond calmly.', successCriteria: 'The counterargument is fair and the response is specific.', examplePhrases: ['The strongest objection is..., and my response is...', 'Some people will argue..., yet the evidence suggests...'] },
  chaos_data_hint: { id: 'chaos_data_hint', instruction: 'Use a realistic data-style claim without inventing exact statistics.', successCriteria: 'Use trend language and avoid fake precise numbers.', examplePhrases: ['Recent patterns show a steady increase in...', 'Local reports indicate a consistent gap in...'] },
  chaos_empathy_turn: { id: 'chaos_empathy_turn', instruction: 'Reframe the debate through empathy for one affected person.', successCriteria: 'Describe person-level impact and link it to a policy choice.', examplePhrases: ['For a student juggling work and study, this would...', 'From a caregiver perspective, the current system feels...'] },
  chaos_practical_example: { id: 'chaos_practical_example', instruction: 'Give one practical example from daily life to support your plan.', successCriteria: 'The example clearly supports the proposal.', examplePhrases: ['In a typical school week, this could look like...', 'A practical case is when...'] },
  chaos_priority_stack: { id: 'chaos_priority_stack', instruction: 'Rank three priorities and justify the top one.', successCriteria: 'Name three priorities and explain the top choice.', examplePhrases: ['My top priority is..., followed by..., then...', 'I place this first because...'] },
  chaos_tradeoff_explicit: { id: 'chaos_tradeoff_explicit', instruction: 'Describe one unavoidable tradeoff and why it is acceptable.', successCriteria: 'The tradeoff is explicit and defended with reasoning.', examplePhrases: ['We do lose some convenience, but we gain...', 'This tradeoff is acceptable because...'] },
  chaos_stakeholder_invite: { id: 'chaos_stakeholder_invite', instruction: 'Invite a stakeholder into implementation responsibility.', successCriteria: 'Assign a concrete role to a stakeholder group.', examplePhrases: ['Local schools can take responsibility for...', 'Community groups could lead...'] },
  chaos_policy_language: { id: 'chaos_policy_language', instruction: 'Use formal policy language for one sentence.', successCriteria: 'Include a clear recommendation sentence in formal style.', examplePhrases: ['The council should adopt a phased framework that...', 'It is recommended that institutions...'] },
  chaos_clarity_check: { id: 'chaos_clarity_check', instruction: 'Pause briefly to summarize your argument in one clear line.', successCriteria: 'Give a concise restatement before continuing.', examplePhrases: ['In short, the plan protects... while improving...', 'To summarize, we should...'] },
  chaos_long_sentence: { id: 'chaos_long_sentence', instruction: 'Deliver one advanced sentence with a subordinate clause.', successCriteria: 'Use a complex structure accurately.', examplePhrases: ['Although implementation may feel difficult at first, the long-term benefit is...', 'Because multiple groups are affected, we need...'] },
  chaos_conditional: { id: 'chaos_conditional', instruction: 'Use a conditional structure to show consequences.', successCriteria: 'Include an if-clause and a consequence.', examplePhrases: ['If we delay action, we may face...', 'If schools coordinate early, communities can...'] },
  chaos_idiom_natural: { id: 'chaos_idiom_natural', instruction: 'Use one idiom naturally in context.', successCriteria: 'The idiom fits the meaning and tone.', examplePhrases: ['We need to get everyone on the same page.', 'This is not a one-size-fits-all solution.'] },
  chaos_compromise_offer: { id: 'chaos_compromise_offer', instruction: 'Offer a compromise that still keeps your core position.', successCriteria: 'The compromise includes a boundary that protects your core goal.', examplePhrases: ['I can support a pilot first, provided that...', 'A workable middle path is...'] },
  chaos_implementation_barrier: { id: 'chaos_implementation_barrier', instruction: 'Name one implementation barrier and who should solve it.', successCriteria: 'The barrier and responsible actor are both clear.', examplePhrases: ['A key barrier is staff capacity, so district leaders should...', 'The main obstacle is coordination, which the council can...'] },
  chaos_public_trust: { id: 'chaos_public_trust', instruction: 'Explain how to build public trust during rollout.', successCriteria: 'Mention transparency and a feedback loop.', examplePhrases: ['Trust grows when progress is shared openly each month.', 'Public feedback sessions can keep adjustments realistic.'] },
  chaos_equity_lens: { id: 'chaos_equity_lens', instruction: 'Apply an equity lens to your recommendation.', successCriteria: 'Show how policy affects groups differently.', examplePhrases: ['This matters most for households with fewer resources because...', 'An equity-focused step is to...'] },
  chaos_future_impact: { id: 'chaos_future_impact', instruction: 'Project the long-term impact after two years.', successCriteria: 'Describe a plausible long-term outcome tied to the proposal.', examplePhrases: ['After two years, this approach could stabilize...', 'In the longer run, communities may see...'] },
  chaos_reframe_conflict: { id: 'chaos_reframe_conflict', instruction: 'Reframe conflict as a shared problem-solving challenge.', successCriteria: 'Shift language from blame to cooperation.', examplePhrases: ['Rather than blaming one group, we can co-design...', 'This is a shared challenge that needs...'] },
  chaos_minimum_standard: { id: 'chaos_minimum_standard', instruction: 'Set a minimum standard that every school or team must meet.', successCriteria: 'The standard is concrete and universal.', examplePhrases: ['Every school should meet this baseline by...', 'A non-negotiable minimum is...'] },
  chaos_case_comparison: { id: 'chaos_case_comparison', instruction: 'Briefly compare two local contexts and adapt the same policy.', successCriteria: 'The comparison is clear and the adaptation is specific.', examplePhrases: ['In dense urban areas..., while in rural areas...', 'The same principle works differently when...'] },
  chaos_listener_signal: { id: 'chaos_listener_signal', instruction: 'Use signposting language to guide listeners through your points.', successCriteria: 'Use at least two signposts in sequence.', examplePhrases: ['First, we should..., next we need...', 'The key point here is..., finally...'] },
  chaos_responsible_tone: { id: 'chaos_responsible_tone', instruction: 'Use respectful language when disagreeing strongly.', successCriteria: 'Disagree without personal attack and keep a constructive tone.', examplePhrases: ['I understand the intention, but the current proposal may...', 'I respect that view, and I suggest...'] },
  chaos_metric_choice: { id: 'chaos_metric_choice', instruction: 'Choose one success metric and explain why it matters.', successCriteria: 'Name the metric and link it to public benefit.', examplePhrases: ['A useful metric is attendance consistency because...', 'We should track response time to measure...'] },
  chaos_shared_responsibility: { id: 'chaos_shared_responsibility', instruction: 'Distribute responsibility across at least two groups.', successCriteria: 'Clearly allocate tasks to multiple stakeholders.', examplePhrases: ['Schools can handle training, while city teams handle infrastructure.', 'Families and teachers both have roles in...'] }
};

export function getRoleCard(id?: string | null): RoleCardView | null {
  return id ? roleCardMap[id] ?? null : null;
}

export function getChaosCard(id?: string | null): ChaosCardView | null {
  return id ? chaosCardMap[id] ?? null : null;
}

export function roleLabel(id: string): string {
  return roleCardMap[id]?.title ?? id;
}

export function chaosLabel(id: string): string {
  return chaosCardMap[id]?.instruction ?? id;
}
