export type RoomPhase =
  | 'lobby'
  | 'round_setup'
  | 'prep'
  | 'ready_to_speak'
  | 'speaker_selection'
  | 'speaking'
  | 'speaker_finished'
  | 'guesses_revealed'
  | 'scoring'
  | 'secret_revealed'
  | 'round_complete';

export type SpeakerBonusCategory =
  | 'used_idiom'
  | 'used_advanced_sentence_structure'
  | 'completed_chaos_card'
  | 'fulfilled_role'
  | 'almost_no_grammar_or_pronunciation_mistakes';

export const SPEAKER_BONUS_CATEGORIES: SpeakerBonusCategory[] = [
  'used_idiom',
  'used_advanced_sentence_structure',
  'completed_chaos_card',
  'fulfilled_role',
  'almost_no_grammar_or_pronunciation_mistakes'
];

export type TimerKind = 'prep' | 'speaker' | 'follow_up';

export interface TimerState {
  kind: TimerKind;
  durationSec: number;
  remainingSec: number;
  running: boolean;
  startedAtEpochMs: number | null;
}

export interface RoundTimerState {
  prepTimer: TimerState;
  speakerTimer: TimerState;
  followUpTimer: TimerState;
}

export interface GuessSubmission {
  guesserPlayerId: string;
  targetSpeakerId: string;
  guessedRoleId: string;
  guessedChaosCardId: string;
  submittedAtEpochMs: number;
  locked: boolean;
}

export interface FollowUpRequest {
  playerId: string;
  forSpeakerPlayerId: string;
  requestedAtEpochMs: number;
}

export interface PlayerRoundPrivateState {
  roleId: string;
  chaosCardId: string;
  rerolledRole: boolean;
  rerolledChaosCard: boolean;
}

export interface PlayerPublicState {
  id: string;
  displayName: string;
  score: number;
  connected: boolean;
  isCurrentSpeaker: boolean;
}

export interface RoundState {
  roundNumber: number;
  phase: RoomPhase;
  topicPrompt: string;
  speakerOrder: string[];
  currentSpeakerIndex: number;
  timer: RoundTimerState;
  followUpRequests: FollowUpRequest[];
  guesses: GuessSubmission[];
}

export interface PublicRoomState {
  roomCode: string;
  players: PlayerPublicState[];
  round: RoundState | null;
}

export interface TeacherPayload {
  role: 'teacher';
  publicState: PublicRoomState;
  playerPrivateStateById: Record<string, PlayerRoundPrivateState>;
}

export interface StudentPayload {
  role: 'student';
  selfPlayerId: string;
  publicState: PublicRoomState;
  selfPrivateState: PlayerRoundPrivateState | null;
}

export interface ViewerPayload {
  role: 'viewer';
  publicState: PublicRoomState;
}

export type RoomPayload = TeacherPayload | StudentPayload | ViewerPayload;

// ---------------------------------------------------------------------------
// Game content (single source of truth for client + server)
//
// Written for 15-17 year-old Vietnamese students at around B1 level.
// Keep the language simple, natural and friendly.
//
// IMPORTANT: a public situation must NOT contain a question mark, the word
// "should", or the phrase "do you think" (see ensurePromptsCompliant on the
// server). Phrase every prompt as a topic or situation, never a question.
// ---------------------------------------------------------------------------

export interface RoleCard {
  id: string;
  title: string;
  /** One short, clear sentence describing what this person wants or feels. */
  privateBrief: string;
}

export interface ChaosCard {
  id: string;
  instruction: string;
  successCriteria: string;
  examplePhrases: string[];
}

export interface TopicCategory {
  id: string;
  title: string;
  publicSituation: string;
  roleCards: RoleCard[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'phones_in_class',
    title: 'Phones in Class',
    publicSituation:
      'A school is making a new rule about using phones during class. Students, teachers and parents all have different feelings about this idea.',
    roleCards: [
      { id: 'phones_student', title: 'Student', privateBrief: 'You like having your phone for music and quick searches, but you know it can make you lose focus.' },
      { id: 'phones_strict_teacher', title: 'Strict Teacher', privateBrief: 'You think phones stop students from learning and you want them turned off in every lesson.' },
      { id: 'phones_young_teacher', title: 'Young Teacher', privateBrief: 'You sometimes use phones for fun class games, so you want a rule that still allows this.' },
      { id: 'phones_worried_parent', title: 'Worried Parent', privateBrief: 'You want to reach your child in an emergency, so you do not want phones banned all day.' },
      { id: 'phones_top_student', title: 'Hard-Working Student', privateBrief: 'You get distracted by other people\'s phones and you want a calmer, quieter classroom.' },
      { id: 'phones_class_monitor', title: 'Class Monitor', privateBrief: 'You have to keep order in class, so you want a clear and fair rule that is easy to follow.' },
      { id: 'phones_it_teacher', title: 'Computer Teacher', privateBrief: 'You believe phones are useful tools and you want students to learn how to use them well.' },
      { id: 'phones_school_nurse', title: 'School Nurse', privateBrief: 'You see students tired from late-night phone use, so you care about their health and sleep.' }
    ]
  },
  {
    id: 'social_media_time',
    title: 'Time on Social Media',
    publicSituation:
      'Many teenagers spend hours every day on social media. Families and schools are talking about how to make this habit healthier.',
    roleCards: [
      { id: 'social_teen_user', title: 'Teenager', privateBrief: 'You enjoy social media to talk with friends, but you feel tired after using it too much.' },
      { id: 'social_influencer', title: 'Young Influencer', privateBrief: 'You make videos online and you think social media gives teenagers a chance to be creative.' },
      { id: 'social_parent', title: 'Parent', privateBrief: 'You worry your child spends too long online and not enough time with the family.' },
      { id: 'social_teacher', title: 'Teacher', privateBrief: 'You notice students are sleepy in class and you think late-night scrolling is the reason.' },
      { id: 'social_counselor', title: 'School Counselor', privateBrief: 'You help students who feel sad when they compare their lives to others online.' },
      { id: 'social_little_sibling', title: 'Younger Brother or Sister', privateBrief: 'You want to copy the older teens and start using social media too.' },
      { id: 'social_coach', title: 'Sports Coach', privateBrief: 'You want teens to spend more time being active and less time looking at screens.' },
      { id: 'social_doctor', title: 'Doctor', privateBrief: 'You see young people with sore eyes and poor sleep, so you ask for more breaks from screens.' }
    ]
  },
  {
    id: 'homework_amount',
    title: 'Too Much Homework',
    publicSituation:
      'Students at one school say they get too much homework every night. The school is thinking about changing its homework rules.',
    roleCards: [
      { id: 'hw_tired_student', title: 'Tired Student', privateBrief: 'You study until late every night and you feel you have no free time at all.' },
      { id: 'hw_strict_teacher', title: 'Strict Teacher', privateBrief: 'You believe homework helps students remember the lesson, so you want to keep giving it.' },
      { id: 'hw_kind_teacher', title: 'Kind Teacher', privateBrief: 'You want to give less homework but make it more useful and interesting.' },
      { id: 'hw_ambitious_parent', title: 'Ambitious Parent', privateBrief: 'You want your child to get top marks, so you like a lot of homework.' },
      { id: 'hw_relaxed_parent', title: 'Relaxed Parent', privateBrief: 'You want your child to rest and enjoy hobbies, not study every single evening.' },
      { id: 'hw_sporty_student', title: 'Sporty Student', privateBrief: 'You train after school, so heavy homework leaves you no time for sport.' },
      { id: 'hw_principal', title: 'Head Teacher', privateBrief: 'You must keep good exam results but also keep students happy and healthy.' },
      { id: 'hw_older_sibling', title: 'Older Brother or Sister', privateBrief: 'You finished school and you think a little homework is fine but too much is stressful.' }
    ]
  },
  {
    id: 'school_uniform',
    title: 'School Uniform Rules',
    publicSituation:
      'A school is deciding whether to keep its uniform or let students wear their own clothes. People in the school have many different ideas.',
    roleCards: [
      { id: 'uniform_fashion_student', title: 'Fashion-Loving Student', privateBrief: 'You want to wear your own clothes and show your own style every day.' },
      { id: 'uniform_shy_student', title: 'Shy Student', privateBrief: 'You like the uniform because then nobody judges you for your clothes or your money.' },
      { id: 'uniform_teacher', title: 'Teacher', privateBrief: 'You think the uniform keeps things equal and helps students feel part of one school.' },
      { id: 'uniform_parent_money', title: 'Parent on a Budget', privateBrief: 'You find buying fashion clothes expensive, so the uniform is cheaper and easier for you.' },
      { id: 'uniform_parent_choice', title: 'Parent Who Likes Choice', privateBrief: 'You think children learn to make good choices when they pick their own clothes.' },
      { id: 'uniform_sporty_student', title: 'Sporty Student', privateBrief: 'You want comfortable clothes that are easy to move and play in.' },
      { id: 'uniform_school_owner', title: 'Head Teacher', privateBrief: 'You care about the school image, so you want students to look smart and tidy.' },
      { id: 'uniform_shop_owner', title: 'Uniform Shop Owner', privateBrief: 'You sell the uniforms, so you want the school to keep using them.' }
    ]
  },
  {
    id: 'healthy_food_school',
    title: 'Food at School',
    publicSituation:
      'The shop at a school sells a lot of snacks and sweet drinks. People want to make the food at school healthier.',
    roleCards: [
      { id: 'food_hungry_student', title: 'Hungry Student', privateBrief: 'You love the snacks and sweet drinks and you do not want them taken away.' },
      { id: 'food_healthy_student', title: 'Health-Conscious Student', privateBrief: 'You want more fruit and water and fewer sweets at the school shop.' },
      { id: 'food_nurse', title: 'School Nurse', privateBrief: 'You worry about students\' health and teeth, so you want healthier choices.' },
      { id: 'food_shop_seller', title: 'Shop Seller', privateBrief: 'You earn money from snacks, so you worry healthy food will not sell as well.' },
      { id: 'food_parent', title: 'Parent', privateBrief: 'You give your child money for lunch and you want it spent on real food.' },
      { id: 'food_pe_teacher', title: 'PE Teacher', privateBrief: 'You teach sport, so you want students to eat food that gives them energy.' },
      { id: 'food_cook', title: 'School Cook', privateBrief: 'You can make healthy meals, but you need them to be cheap and quick to prepare.' },
      { id: 'food_busy_student', title: 'Busy Student', privateBrief: 'You have a short break, so you want food that is fast and easy to grab.' }
    ]
  },
  {
    id: 'teen_part_time_job',
    title: 'Part-Time Jobs for Teens',
    publicSituation:
      'Some teenagers want a part-time job after school to earn their own money. Parents and teachers have different opinions about this.',
    roleCards: [
      { id: 'job_eager_teen', title: 'Teenager Who Wants a Job', privateBrief: 'You want your own money and you think a small job will teach you useful skills.' },
      { id: 'job_strict_parent', title: 'Strict Parent', privateBrief: 'You worry a job will take time away from study, so you want school to come first.' },
      { id: 'job_supportive_parent', title: 'Supportive Parent', privateBrief: 'You think a small job teaches your child to be responsible with time and money.' },
      { id: 'job_teacher', title: 'Teacher', privateBrief: 'You worry tired working students will fall asleep or fall behind in class.' },
      { id: 'job_cafe_owner', title: 'Café Owner', privateBrief: 'You need part-time helpers and you think young workers are friendly and fast.' },
      { id: 'job_older_friend', title: 'Older Friend with a Job', privateBrief: 'You already have a part-time job, so you can share what is good and what is hard.' },
      { id: 'job_careful_student', title: 'Careful Student', privateBrief: 'You want money but you are afraid of being too tired for your exams.' },
      { id: 'job_counselor', title: 'School Counselor', privateBrief: 'You want students to find a healthy balance between work, study and rest.' }
    ]
  },
  {
    id: 'video_games',
    title: 'Time for Video Games',
    publicSituation:
      'Many teenagers play video games for a long time after school. Their families are talking about how much game time is okay.',
    roleCards: [
      { id: 'games_gamer_teen', title: 'Teen Gamer', privateBrief: 'You love gaming to relax and play with friends, and you feel adults do not understand it.' },
      { id: 'games_parent', title: 'Parent', privateBrief: 'You worry your child plays too long and forgets homework and sleep.' },
      { id: 'games_esports_fan', title: 'E-Sports Fan', privateBrief: 'You think gaming can be a real skill and even a future job.' },
      { id: 'games_teacher', title: 'Teacher', privateBrief: 'You notice some students are tired and unfocused after late-night gaming.' },
      { id: 'games_little_sibling', title: 'Younger Sibling', privateBrief: 'You want a turn to play too, and you copy what the older teens do.' },
      { id: 'games_doctor', title: 'Doctor', privateBrief: 'You want young people to take breaks, move their bodies and protect their eyes.' },
      { id: 'games_friend', title: 'Best Friend', privateBrief: 'You play games together online and it is how you both stay close.' },
      { id: 'games_coach', title: 'Sports Coach', privateBrief: 'You wish teens would spend more of their free time playing real sport outside.' }
    ]
  },
  {
    id: 'friendship_problem',
    title: 'A Problem Between Friends',
    publicSituation:
      'Two best friends had a big argument and now they are not talking. Their classmates are not sure how to help them.',
    roleCards: [
      { id: 'friend_upset_one', title: 'Upset Friend', privateBrief: 'You feel hurt because you think your friend let you down.' },
      { id: 'friend_other_one', title: 'The Other Friend', privateBrief: 'You feel it was a small thing and you do not understand why your friend is so angry.' },
      { id: 'friend_peacemaker', title: 'Peacemaker Classmate', privateBrief: 'You want both friends to talk calmly and make up.' },
      { id: 'friend_gossip', title: 'Talkative Classmate', privateBrief: 'You keep telling everyone the story, but this only makes things worse.' },
      { id: 'friend_teacher', title: 'Caring Teacher', privateBrief: 'You noticed the problem and you want to help the students sort it out kindly.' },
      { id: 'friend_quiet_one', title: 'Quiet Classmate', privateBrief: 'You do not want to take sides, but you wish the arguing would stop.' },
      { id: 'friend_loyal', title: 'Loyal Friend', privateBrief: 'You strongly support one side and you find it hard to see the other view.' },
      { id: 'friend_new_student', title: 'New Student', privateBrief: 'You are new and you just want everyone in the class to get along.' }
    ]
  },
  {
    id: 'family_rules',
    title: 'Rules at Home',
    publicSituation:
      'A family is making new rules about bedtime, chores and screen time for the teenagers at home.',
    roleCards: [
      { id: 'family_teen', title: 'Teenager', privateBrief: 'You feel the rules are too strict and you want more freedom.' },
      { id: 'family_mother', title: 'Mother', privateBrief: 'You want a tidy home and a child who sleeps and studies well.' },
      { id: 'family_father', title: 'Father', privateBrief: 'You want fair rules, but you are also a bit relaxed about small things.' },
      { id: 'family_grandparent', title: 'Grandparent', privateBrief: 'You remember stricter old days and you think young people have it easy now.' },
      { id: 'family_younger_child', title: 'Younger Child', privateBrief: 'You want the same rules and the same treats as the older teenager.' },
      { id: 'family_helpful_teen', title: 'Helpful Teenager', privateBrief: 'You do not mind chores, but you want your free time to be respected too.' },
      { id: 'family_busy_parent', title: 'Busy Parent', privateBrief: 'You work a lot, so you need the children to help around the house.' },
      { id: 'family_aunt', title: 'Aunt', privateBrief: 'You think the family should talk together and agree on the rules as a team.' }
    ]
  },
  {
    id: 'plastic_waste',
    title: 'Too Much Plastic',
    publicSituation:
      'A school throws away a lot of plastic bottles and bags every week. Students want to make their school greener.',
    roleCards: [
      { id: 'plastic_green_student', title: 'Green Student', privateBrief: 'You care about the planet and you want the school to stop using plastic bottles.' },
      { id: 'plastic_lazy_student', title: 'Easy-Going Student', privateBrief: 'You find plastic bottles cheap and easy, so you do not want to change your habits.' },
      { id: 'plastic_science_teacher', title: 'Science Teacher', privateBrief: 'You can teach why plastic harms nature and you want the school to act.' },
      { id: 'plastic_shop_seller', title: 'Shop Seller', privateBrief: 'You sell drinks in plastic bottles, so you worry about losing sales.' },
      { id: 'plastic_cleaner', title: 'School Cleaner', privateBrief: 'You pick up the rubbish every day and you want less mess to clean.' },
      { id: 'plastic_parent', title: 'Parent', privateBrief: 'You want the change to be cheap and easy for families to follow.' },
      { id: 'plastic_club_leader', title: 'Eco Club Leader', privateBrief: 'You run the school green club and you have lots of ideas to try.' },
      { id: 'plastic_principal', title: 'Head Teacher', privateBrief: 'You like the green idea but you must think about cost and what is realistic.' }
    ]
  },
  {
    id: 'sports_vs_study',
    title: 'Sports and Study',
    publicSituation:
      'A student is very good at sport but also has important exams coming soon. The family is trying to find a good balance.',
    roleCards: [
      { id: 'balance_student', title: 'Talented Student', privateBrief: 'You love your sport and you do not want to give it up for exams.' },
      { id: 'balance_coach', title: 'Coach', privateBrief: 'You believe in the student\'s sport talent and you want them at every practice.' },
      { id: 'balance_strict_parent', title: 'Strict Parent', privateBrief: 'You think exams matter most and sport can wait until later.' },
      { id: 'balance_supportive_parent', title: 'Supportive Parent', privateBrief: 'You want to support the sport, but you also worry about the exam marks.' },
      { id: 'balance_teacher', title: 'Teacher', privateBrief: 'You want the student to keep up in class and not fall behind before exams.' },
      { id: 'balance_teammate', title: 'Teammate', privateBrief: 'You need this player on the team, so you hope they keep training.' },
      { id: 'balance_old_athlete', title: 'Former Athlete', privateBrief: 'You once chose sport over study, so you can share what you learned.' },
      { id: 'balance_counselor', title: 'School Counselor', privateBrief: 'You want to help the student plan their time so both sport and study fit.' }
    ]
  },
  {
    id: 'school_trip',
    title: 'Planning a School Trip',
    publicSituation:
      'A class is planning a school trip, but everyone wants something different and the budget is small.',
    roleCards: [
      { id: 'trip_fun_student', title: 'Fun-Loving Student', privateBrief: 'You want an exciting trip like a theme park, even if it costs a bit more.' },
      { id: 'trip_quiet_student', title: 'Quiet Student', privateBrief: 'You would prefer a calm trip like a museum or a nature walk.' },
      { id: 'trip_teacher', title: 'Teacher', privateBrief: 'You want the trip to be safe, useful and connected to what the class is learning.' },
      { id: 'trip_money_parent', title: 'Parent on a Budget', privateBrief: 'You want a cheap trip because money is tight at home this month.' },
      { id: 'trip_active_student', title: 'Active Student', privateBrief: 'You want an outdoor trip with lots of movement and games.' },
      { id: 'trip_class_monitor', title: 'Class Monitor', privateBrief: 'You want a trip that most of the class will be happy with.' },
      { id: 'trip_shy_student', title: 'Shy Student', privateBrief: 'You feel nervous about long trips and you prefer to stay near home.' },
      { id: 'trip_driver', title: 'Bus Driver', privateBrief: 'You care about the route and the time, so you want a simple, clear plan.' }
    ]
  }
];

export const CHAOS_CARDS: ChaosCard[] = [
  { id: 'chaos_real_example', instruction: 'Give one real example from your own life.', successCriteria: 'You talk about something that really happened to you.', examplePhrases: ['For example, last year I...', 'This happened to me when...'] },
  { id: 'chaos_because', instruction: 'Use the word "because" to explain your reason.', successCriteria: 'You give a reason using "because".', examplePhrases: ['I think this because...', 'It is a problem because...'] },
  { id: 'chaos_now_and_past', instruction: 'Compare life now and life in the past.', successCriteria: 'You talk about then and now.', examplePhrases: ['In the past people...', 'These days it is different because...'] },
  { id: 'chaos_good_and_bad', instruction: 'Say one good point and one bad point.', successCriteria: 'You give one good side and one bad side.', examplePhrases: ['One good thing is...', 'On the other hand, one bad thing is...'] },
  { id: 'chaos_if_sentence', instruction: 'Use an "if" sentence to talk about a result.', successCriteria: 'You make a sentence with "if".', examplePhrases: ['If we do this, then...', 'If nothing changes, we will...'] },
  { id: 'chaos_about_yourself', instruction: 'Talk about your own life or your own family.', successCriteria: 'You connect the topic to you or your family.', examplePhrases: ['In my family, we...', 'For me, this means...'] },
  { id: 'chaos_feeling', instruction: 'Say how this makes you feel and why.', successCriteria: 'You name a feeling and give a reason.', examplePhrases: ['This makes me feel... because...', 'I feel worried when...'] },
  { id: 'chaos_about_friend', instruction: 'Talk about a friend or someone you know.', successCriteria: 'You give an example about a person you know.', examplePhrases: ['My friend always...', 'I know someone who...'] },
  { id: 'chaos_future', instruction: 'Say what you think will happen in the future.', successCriteria: 'You make a guess about the future.', examplePhrases: ['In the future, I think...', 'Soon this will...'] },
  { id: 'chaos_solution', instruction: 'Give one simple idea to fix the problem.', successCriteria: 'You suggest one clear solution.', examplePhrases: ['One simple idea is to...', 'We could fix this by...'] },
  { id: 'chaos_both_sides', instruction: 'Talk about two people who feel differently.', successCriteria: 'You explain two different opinions.', examplePhrases: ['Some people think..., but others...', 'One person wants..., another wants...'] },
  { id: 'chaos_agree_disagree', instruction: 'Say if you agree or not, and give a reason.', successCriteria: 'You take a side and explain it.', examplePhrases: ['I agree because...', 'I do not agree because...'] },
  { id: 'chaos_first_then', instruction: 'Use "first" and "then" to order your ideas.', successCriteria: 'You use "first" and "then".', examplePhrases: ['First we can..., then we...', 'First of all..., after that...'] },
  { id: 'chaos_for_example', instruction: 'Use the phrase "for example".', successCriteria: 'You say "for example" before an example.', examplePhrases: ['For example, in my school...', 'For example, last week...'] },
  { id: 'chaos_main_reason', instruction: 'Give the most important reason for your idea.', successCriteria: 'You point out your strongest reason.', examplePhrases: ['The main reason is...', 'Most importantly,...'] },
  { id: 'chaos_short_story', instruction: 'Tell a very short story about it.', successCriteria: 'You tell a small story with a beginning and an end.', examplePhrases: ['One day...', 'It started when...'] },
  { id: 'chaos_other_view', instruction: 'Say what someone with a different idea might think.', successCriteria: 'You explain the opposite opinion.', examplePhrases: ['Other people might say...', 'Someone could argue that...'] },
  { id: 'chaos_amount_words', instruction: 'Use words like "many", "some" or "a few".', successCriteria: 'You use a word that shows how many.', examplePhrases: ['Many students...', 'Only a few people...'] },
  { id: 'chaos_school_example', instruction: 'Give an example from your school.', successCriteria: 'You give a real school example.', examplePhrases: ['At my school...', 'In my class we...'] },
  { id: 'chaos_home_example', instruction: 'Give an example from your home or family.', successCriteria: 'You give a real home example.', examplePhrases: ['At home, we...', 'My parents always...'] },
  { id: 'chaos_compare_two', instruction: 'Compare two things and say which is better.', successCriteria: 'You compare two choices and pick one.', examplePhrases: ['A is better than B because...', 'I prefer... rather than...'] },
  { id: 'chaos_advice', instruction: 'Give one piece of advice to someone.', successCriteria: 'You give clear advice.', examplePhrases: ['My advice is to...', 'They could try to...'] },
  { id: 'chaos_parent_view', instruction: 'Explain how a parent might feel about it.', successCriteria: 'You describe a parent\'s feeling.', examplePhrases: ['A parent might feel...', 'Most parents would...'] },
  { id: 'chaos_teacher_view', instruction: 'Explain how a teacher might feel about it.', successCriteria: 'You describe a teacher\'s feeling.', examplePhrases: ['A teacher might think...', 'Teachers often...'] },
  { id: 'chaos_linking_word', instruction: 'Use a linking word like "however" or "also".', successCriteria: 'You use a linking word to join ideas.', examplePhrases: ['I like it. However,...', 'It saves time. Also,...'] },
  { id: 'chaos_clear_ending', instruction: 'End with one clear sentence about your main idea.', successCriteria: 'You finish with a short, clear point.', examplePhrases: ['So, in the end, I think...', 'To sum up,...'] },
  { id: 'chaos_change_mind', instruction: 'Say one thing that could change your mind.', successCriteria: 'You explain what would make you think differently.', examplePhrases: ['I would change my mind if...', 'I might agree if...'] },
  { id: 'chaos_everyday', instruction: 'Connect the topic to something you do every day.', successCriteria: 'You link it to your daily life.', examplePhrases: ['Every day I...', 'In my normal day, this...'] }
];

export const roleCardMap: Record<string, RoleCard> = Object.fromEntries(
  TOPIC_CATEGORIES.flatMap((topic) => topic.roleCards.map((role) => [role.id, role]))
);

export const chaosCardMap: Record<string, ChaosCard> = Object.fromEntries(
  CHAOS_CARDS.map((card) => [card.id, card])
);

export function getRoleCard(id?: string | null): RoleCard | null {
  return id ? roleCardMap[id] ?? null : null;
}

export function getChaosCard(id?: string | null): ChaosCard | null {
  return id ? chaosCardMap[id] ?? null : null;
}

export function roleLabel(id: string): string {
  return roleCardMap[id]?.title ?? id;
}

export function chaosLabel(id: string): string {
  return chaosCardMap[id]?.instruction ?? id;
}
