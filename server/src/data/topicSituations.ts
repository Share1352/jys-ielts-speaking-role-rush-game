export interface TopicCategory {
  id: string;
  title: string;
  publicSituation: string;
  roleCards: RoleCard[];
}

export interface RoleCard {
  id: string;
  title: string;
  privateBrief: string;
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'ai_homework_policy',
    title: 'AI Homework Policy',
    publicSituation:
      'A school district is allowing AI tools for most homework and families want clear guardrails that protect learning quality, fairness, and wellbeing.',
    roleCards: [
      { id: 'ai_parent_guardian', title: 'Parent Guardian', privateBrief: 'Push for strong limits on unsupervised AI use and request weekly progress evidence from teachers.' },
      { id: 'ai_teacher_workload', title: 'Overloaded Teacher', privateBrief: 'Support AI for drafting but demand a realistic marking policy so staff burnout does not rise.' },
      { id: 'ai_student_advocate', title: 'Student Advocate', privateBrief: 'Argue that responsible AI can reduce stress and increase creativity if students still explain their reasoning.' },
      { id: 'ai_university_admissions', title: 'University Admissions Officer', privateBrief: 'Warn that AI-generated portfolios without authentic voice may reduce trust in applicant performance.' },
      { id: 'ai_principal_budget', title: 'Principal with Limited Budget', privateBrief: 'Need a policy that schools can implement without buying expensive new software each semester.' },
      { id: 'ai_rural_teacher', title: 'Rural School Teacher', privateBrief: 'Highlight unstable internet access and ask for an option that works for low-connectivity communities.' },
      { id: 'ai_ethics_researcher', title: 'Education Ethics Researcher', privateBrief: 'Prioritize transparent citation standards and a staged rollout with measurable impact checks.' },
      { id: 'ai_employer_partner', title: 'Local Employer Partner', privateBrief: 'Request graduates who can collaborate with AI while still communicating clearly under pressure.' }
    ]
  },
  {
    id: 'city_transport_transition',
    title: 'City Transport Transition',
    publicSituation:
      'A growing city must cut traffic and pollution while keeping transport affordable for workers, families, and small businesses.',
    roleCards: [
      { id: 'transport_bus_driver', title: 'Bus Driver Union Leader', privateBrief: 'Support more bus lanes but require guarantees on shift safety and fair schedules.' },
      { id: 'transport_shop_owner', title: 'Main Street Shop Owner', privateBrief: 'Fear reduced car access will hurt sales and ask for a staged plan with delivery windows.' },
      { id: 'transport_disabled_resident', title: 'Resident with Mobility Needs', privateBrief: 'Demand curb access, reliable lifts, and protected drop-off points across all districts.' },
      { id: 'transport_env_planner', title: 'Environmental Planner', privateBrief: 'Push for rapid emissions cuts through low-emission zones and high-frequency buses.' },
      { id: 'transport_suburban_parent', title: 'Suburban Parent', privateBrief: 'Need predictable school commute options that do not add daily childcare pressure.' },
      { id: 'transport_courier_manager', title: 'Courier Operations Manager', privateBrief: 'Require practical freight routes so local logistics remains stable during transition.' },
      { id: 'transport_mayor_adviser', title: 'Mayor Policy Adviser', privateBrief: 'Need a politically viable compromise that shows early wins before the next budget cycle.' },
      { id: 'transport_student_commuter', title: 'Part-Time Student Commuter', privateBrief: 'Support cheaper late-evening transport and safer stations after classes.' }
    ]
  },
  {
    id: 'tourism_pressure',
    title: 'Tourism Pressure in a Small Town',
    publicSituation:
      'Tourism is rising quickly in a small town and residents are demanding a plan that protects local life while preserving jobs.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `tourism_role_${i + 1}`, title: ['Guesthouse Owner','Lifelong Resident','Town Youth Worker','Heritage Guide','Waste Services Manager','Street Musician','Hospital Nurse','Weekend Visitor'][i], privateBrief: ['Need year-round income not only peak-season spikes.','Worry rent inflation is forcing families away from the center.','Want youth spaces protected from party tourism spillover.','Need crowd control that does not damage historic landmarks.','Demand funding for waste and toilet capacity upgrades.','Depend on tourist flow but dislike strict noise curfews.','Concerned that emergency services are overloaded in summer.','Accept timed entry systems if communication is simple.'][i] }))
  },
  {
    id: 'teen_career_shift', title: 'Teen Career Shift', publicSituation: 'Many teenagers prefer flexible careers and schools must redesign preparation pathways for uncertain job markets.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `career_role_${i + 1}`, title: ['Career Counselor','Tech Startup Mentor','Vocational Trainer','Anxious Parent','Gap-Year Student','Public School Accountant','Freelance Designer','Labor Economist'][i], privateBrief: ['Need practical internship maps across industries.','Want project-based modules with portfolio assessment.','Insist hands-on trades remain respected and funded.','Fear unstable income and weak benefits for young workers.','Argue for life-skills coaching before specialization.','Must control costs while adding new programs.','Support flexible pathways with client communication training.','Request evidence-driven pilots before systemwide reform.'][i] }))
  },
  {
    id: 'housing_fairness', title: 'Housing Fairness', publicSituation: 'A city is balancing affordable housing targets with neighborhood concerns about infrastructure capacity and livability.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `housing_role_${i + 1}`, title: ['Tenant Organizer','Property Developer','School Principal','Retired Homeowner','Transit Engineer','Construction Worker','Social Worker','City Budget Officer'][i], privateBrief: ['Push for stronger renter protections and transparent waitlists.','Need faster approvals to keep project costs manageable.','Need school expansion planning before large move-ins.','Worried about rapid neighborhood change and noise.','Require density near transit for viable service frequency.','Need stable jobs and safe timelines during build phases.','See rising homelessness and demand immediate action.','Need phased funding that avoids deficit spikes.'][i] }))
  },
  {
    id: 'digital_wellbeing', title: 'Digital Wellbeing at School', publicSituation: 'Schools are redesigning phone and social-media rules to reduce distraction and anxiety while preserving useful digital learning.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `wellbeing_role_${i + 1}`, title: ['School Psychologist','Debate Team Captain','Cyberbullying Counselor','PE Teacher','Parent Association Chair','App Developer','Librarian','Classroom Assistant'][i], privateBrief: ['Need calmer breaks and stronger support referral pathways.','Want controlled access for research and team coordination.','See harm patterns and demand quick reporting tools.','Prefer active lunch blocks without phones on fields.','Need consistent rules across grades and subjects.','Can provide focus-mode features if schools set standards.','Need media literacy integrated into regular assignments.','Need practical routines that are easy to enforce daily.'][i] }))
  },
  {
    id: 'water_shortage', title: 'Water Shortage Plan', publicSituation: 'A region facing repeated drought must reduce water use across homes, farming, and industry without causing social conflict.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `water_role_${i + 1}`, title: ['Small Farmer','Urban Tenant','Factory Manager','Public Health Officer','Restaurant Owner','Reservoir Engineer','Community Mediator','Climate Youth Leader'][i], privateBrief: ['Need seasonal flexibility to avoid crop loss.','Need fair pricing that protects low-income households.','Can invest in recycling systems if transition support exists.','Prioritize safe hygiene standards during restrictions.','Need clear guidance for kitchen sanitation and operations.','Require urgent leak repairs and meter modernization.','Need trust-building meetings across competing groups.','Demand long-term adaptation, not temporary slogans.'][i] }))
  },
  {
    id: 'school_inclusion', title: 'School Inclusion Strategy', publicSituation: 'A school network is updating inclusion policies to support multilingual and neurodiverse students through mainstream classes.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `inclusion_role_${i + 1}`, title: ['Special Education Coordinator','New Arrival Student','Homeroom Teacher','Interpreter Volunteer','Parent of Autistic Child','Curriculum Designer','Exam Supervisor','After-School Coach'][i], privateBrief: ['Need staffing commitments for individualized support.','Need orientation support and friendship mentoring.','Need planning time for differentiated lessons.','Need translated communication in family meetings.','Need sensory-friendly routines and predictable transitions.','Need inclusive assessments that preserve rigor.','Need fair accommodations during timed tasks.','Need mixed-ability activities with social confidence goals.'][i] }))
  },
  {
    id: 'public_health_campaign', title: 'Public Health Campaign', publicSituation: 'A community health team is planning a preventive campaign and must rebuild trust among groups with different concerns.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `health_role_${i + 1}`, title: ['Clinic Nurse','Religious Community Leader','Youth Influencer','Elderly Care Coordinator','Pharmacist','Data Privacy Advocate','Municipal Communications Officer','Migrant Worker Representative'][i], privateBrief: ['Need practical outreach hours beyond weekdays.','Need respectful messaging aligned with community values.','Can amplify campaign if content is honest and relatable.','Need home-visit support for isolated seniors.','Need clear medication guidance and side-effect communication.','Demand transparent data boundaries in outreach tools.','Need a consistent multilingual media calendar.','Need access for people with unstable schedules and transport.'][i] }))
  },
  {
    id: 'food_waste_reduction', title: 'Food Waste Reduction', publicSituation: 'A city coalition must reduce food waste from supermarkets, homes, and restaurants while keeping redistribution safe and efficient.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `food_role_${i + 1}`, title: ['Supermarket Manager','Food Bank Coordinator','Restaurant Chef','Waste Collection Lead','University Student','Cold-Chain Logistics Planner','Public Safety Inspector','Neighborhood Volunteer'][i], privateBrief: ['Need legal clarity on donation timelines and liability.','Need predictable supply and storage support.','Can redesign menus around surplus ingredients.','Need route changes and sorting standards.','Can lead awareness campaigns on portion planning.','Need investment in refrigerated transfer points.','Need compliance checks without heavy bureaucracy.','Need simple pickup systems for local donors.'][i] }))
  },
  {
    id: 'workplace_flexibility', title: 'Workplace Flexibility Policy', publicSituation: 'A regional employer network is rewriting remote and hybrid work rules to balance productivity, wellbeing, and equal promotion access.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `work_role_${i + 1}`, title: ['Team Manager','Junior Employee','HR Director','Single Parent Worker','IT Security Lead','Office Landlord','Occupational Therapist','Labor Rights Advocate'][i], privateBrief: ['Need clear output-based expectations across teams.','Need mentorship visibility in hybrid settings.','Need fair evaluation standards for all work modes.','Need schedule flexibility during caregiving hours.','Need secure device and data handling policies.','Need predictable occupancy planning for leases.','Need ergonomic guidance for home setups.','Need safeguards against hidden overtime pressure.'][i] }))
  },
  {
    id: 'community_safety_nightlife', title: 'Nightlife and Community Safety', publicSituation: 'A district with expanding nightlife needs a policy that supports cultural activity while reducing late-night disturbances and harm.',
    roleCards: Array.from({ length: 8 }).map((_, i) => ({ id: `night_role_${i + 1}`, title: ['Live Music Venue Owner','Night Shift Nurse','Police Liaison Officer','Resident Association Leader','Taxi Driver','University Event Organizer','Street Cleaner Supervisor','Harm Reduction Volunteer'][i], privateBrief: ['Need predictable licensing conditions to keep shows viable.','Need quieter routes near hospital zones.','Need prevention-first plans instead of heavy punitive action.','Need sleep protection and complaint follow-up.','Need safer pickup points after midnight.','Need safer student event protocols and transport.','Need staffing budgets for weekend cleaning peaks.','Need hydration and de-escalation stations near hotspots.'][i] }))
  }
];
