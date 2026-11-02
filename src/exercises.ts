import { Exercise } from "./domain";
export type Guide = {
  id: string;
  title: string;
  category: string;
  image:
    | "sprint"
    | "dribble"
    | "shuttle"
    | "interval"
    | "turn"
    | "endurance"
    | "kickups";
  illustrationDescription?: string;
  imageCaption?: string;
  defaults: Omit<Exercise, "id" | "name" | "guideId">;
  setup: (distance?: number) => string;
  steps: string[];
  tip: string;
};
export const exerciseGuides: Guide[] = [
  {
    id: "acceleration10",
    title: "10 m acceleration",
    category: "Speed",
    image: "sprint",
    defaults: {
      distance: 10,
      sets: 2,
      reps: 4,
      work: 0,
      timing: "stopwatch",
      rest: 45,
      setRest: 120,
    },
    setup: (d) =>
      `Place a start cone and a finish cone ${d || 10} m apart. Leave a clear 10 m run-out beyond the finish.`,
    steps: [
      "Start just behind the first cone, with one foot forward and knees slightly bent.",
      "Push the ground away, drive your arms, and build speed through the finish cone.",
      "Ease down in the run-out, then walk back outside the running lane.",
    ],
    tip: "Use relaxed, controlled efforts first. A coach can reduce the distance or repetitions for younger players.",
  },
  {
    id: "sprint20",
    title: "20 m sprint",
    category: "Speed",
    image: "sprint",
    defaults: {
      distance: 20,
      sets: 3,
      reps: 4,
      work: 0,
      timing: "stopwatch",
      rest: 60,
      setRest: 180,
    },
    setup: (d) =>
      `Measure ${d || 20} m between start and finish cones. Leave at least 10 m of clear run-out after the finish.`,
    steps: [
      "Start behind the first cone in a balanced split stance.",
      "Accelerate smoothly and run through the finish marker; do not slow down before it.",
      "Decelerate gradually beyond the cone. Walk back and take the full scheduled recovery.",
    ],
    tip: "Tap Start sprint at the start and Finish sprint at the finish cone. Rest longer if technique or speed drops.",
  },
  {
    id: "sprint30",
    title: "30 m sprint",
    category: "Speed",
    image: "sprint",
    defaults: {
      distance: 30,
      sets: 2,
      reps: 4,
      work: 0,
      timing: "stopwatch",
      rest: 90,
      setRest: 180,
    },
    setup: (d) =>
      `Set start and finish cones ${d || 30} m apart, with 10–15 m of clear run-out beyond the finish.`,
    steps: [
      "Build speed from a balanced standing start.",
      "Keep the head neutral and shoulders relaxed as you accelerate along the lane.",
      "Run through the finish cone and gradually slow in the run-out area.",
    ],
    tip: "Use this longer sprint only when the player is ready. Avoid chasing a maximal speed when tired.",
  },
  {
    id: "ballControl",
    title: "Cone dribbling",
    category: "Ball skills",
    image: "dribble",
    defaults: { sets: 3, reps: 1, work: 60, rest: 0, setRest: 60 },
    setup: () =>
      "Place start and finish cones around a slalom of four cones, about 2 m apart. Widen the spacing for beginners.",
    steps: [
      "Begin at the start cone with the ball close to your feet.",
      "Weave between the cones using light touches with the inside and outside of both feet.",
      "Go around the finish cone, turn under control, and dribble back.",
    ],
    tip: "Look up between touches. Accuracy and close control matter more than speed.",
  },
  {
    id: "kickups",
    title: "Kick-ups practice",
    category: "Ball skills",
    image: "kickups",
    illustrationDescription:
      "A player balances on one leg and gently taps a football upward with the laces. Cones mark the edges of the practice space, not a running route.",
    imageCaption:
      "ILLUSTRATION · Cones mark your practice space · Gentle upward touches · Not to scale",
    defaults: { sets: 3, reps: 1, work: 60, rest: 0, setRest: 45 },
    setup: () =>
      "Choose a level, clear space and use two cones to mark a practice area about 3 m wide. Keep the cones away from your feet and give each player their own ball and space.",
    steps: [
      "Hold the ball at waist height and drop it toward one foot. Keep the supporting knee slightly bent and watch the ball.",
      "Lift the toes slightly and use the laces to give the ball a soft upward tap. Aim to keep it below waist height and close to your body.",
      "Start with one touch and catch. Then try two touches before catching; gradually build toward alternating feet without a catch.",
      "Reset calmly when the ball drops. During each work interval, practise controlled touches rather than chasing the ball. Rest between sets.",
    ],
    tip: "Beginners can allow a bounce between touches or use a softer ball. Record the longest streak in your session notes, and keep the same rules when comparing attempts. Use feet only; heading is not needed for this drill.",
  },
  {
    id: "intervals",
    title: "Run / walk intervals",
    category: "Stamina",
    image: "interval",
    defaults: {
      distance: 20,
      sets: 2,
      reps: 4,
      work: 30,
      rest: 30,
      setRest: 120,
    },
    setup: (d) =>
      `Mark a clear running lane with cones ${d || 20} m apart. Leave space beyond both endpoints to turn safely.`,
    steps: [
      "Run at a controlled pace for the work interval. If you reach a cone, slow and turn before continuing.",
      "During recovery, walk and allow breathing to settle.",
      "Repeat the run and walk phases without racing the first repetition.",
    ],
    tip: "The repetition rest is the walking phase. Choose a pace that lets the player finish with good control.",
  },
  {
    id: "shuttle",
    title: "20 m shuttle runs",
    category: "Stamina",
    image: "shuttle",
    defaults: {
      distance: 20,
      sets: 2,
      reps: 4,
      work: 30,
      rest: 45,
      setRest: 120,
    },
    setup: (d) =>
      `Mark two lines with pairs of cones ${d || 20} m apart. Cones mark the edges of each line, outside the running lane.`,
    steps: [
      "Run from the start line to the opposite cone line.",
      "Slow before the line, plant under your body, turn, and run back.",
      "Continue for the work interval, then walk during recovery.",
    ],
    tip: "Turn in control rather than cutting sharply around a cone. Alternate the turning leg when comfortable.",
  },
  {
    id: "yoyo",
    title: "Yo-Yo IR1 practice",
    category: "Stamina",
    image: "shuttle",
    defaults: {
      distance: 20,
      sets: 2,
      reps: 3,
      work: 30,
      rest: 30,
      setRest: 120,
    },
    setup: () =>
      "Use cone pairs to mark a 20 m shuttle lane, plus a recovery marker 5 m behind the start line.",
    steps: [
      "For practice, run out and back between the 20 m cone lines at a controlled pace.",
      "Walk in the recovery zone before the next repetition.",
      "For a scored Yo-Yo IR1 test, use the official audio, 10-second recovery, and stopping rules under qualified supervision.",
    ],
    tip: "This timed practice preset is not a scored Yo-Yo test. Do not compare practice distance with official test results.",
  },
  {
    id: "agility505",
    title: "505 change of direction",
    category: "Agility",
    image: "turn",
    defaults: {
      distance: 5,
      sets: 2,
      reps: 3,
      work: 8,
      rest: 60,
      setRest: 120,
    },
    setup: () =>
      "Put a start cone at 0 m, a timing-line cone at 10 m, and a turn-line cone at 15 m. Leave space on both sides of the lane.",
    steps: [
      "Accelerate from the start cone through the timing line toward the turn line.",
      "Place a foot on or beyond the turn line, pivot under control, and return through the timing line.",
      "For a scored 505, time only the final 5 m out and 5 m back, using the same timing method each time.",
    ],
    tip: "Practice at low speed before testing. Keep the knee aligned over the foot and avoid twisting on a planted knee.",
  },
  {
    id: "repeatedSprints",
    title: "Repeated 20 m sprints",
    category: "Speed",
    image: "sprint",
    defaults: {
      distance: 20,
      sets: 2,
      reps: 4,
      work: 0,
      timing: "stopwatch",
      rest: 30,
      setRest: 180,
    },
    setup: (d) =>
      `Place start and finish cones ${d || 20} m apart and keep a clear 10 m run-out. Use a separate walk-back route.`,
    steps: [
      "Sprint from the start cone through the finish cone and ease down in the run-out.",
      "Walk back safely during recovery; allow extra rest if the return needs longer.",
      "Record each sprint time if measuring performance, using the same distance and recovery protocol.",
    ],
    tip: "Start with fewer repetitions for children. Stop the set when technique deteriorates; record the protocol alongside results.",
  },
  {
    id: "endurance",
    title: "Steady endurance run",
    category: "Stamina",
    image: "endurance",
    defaults: { sets: 1, reps: 1, work: 300, rest: 0, setRest: 0 },
    setup: () =>
      "Mark a clear loop with cones at each corner. Measure the loop if you plan to record distance, and use wide turns.",
    steps: [
      "Start at the first cone and jog around the loop in one direction.",
      "Keep a comfortable, even pace and take wide, controlled corners.",
      "At the end of the interval, gradually slow to a walk.",
    ],
    tip: "A player should be able to speak in short sentences. Shorten the work interval for beginners.",
  },
  {
    id: "cooper",
    title: "Cooper 12-minute test",
    category: "Fitness test",
    image: "endurance",
    defaults: { sets: 1, reps: 1, work: 720, rest: 0, setRest: 0 },
    setup: () =>
      "Use a measured track or loop, with cones at known distance markers. Keep the route clear and count full laps plus the final partial lap.",
    steps: [
      "After warming up, cover as much distance as you can sustain over 12 minutes at a controlled, even pace.",
      "A supervising adult records laps and the final position when time ends.",
      "Walk to cool down, then enter the measured distance in the Cooper VO₂ estimate option.",
    ],
    tip: "The equation gives an estimate, not a lab result, and may not suit children. Choose an age-appropriate supervised test rather than using this as a routine maximal effort.",
  },
  {
    id: "warmup",
    title: "Easy warm-up jog",
    category: "Preparation",
    image: "interval",
    defaults: {
      distance: 20,
      sets: 1,
      reps: 1,
      work: 180,
      rest: 0,
      setRest: 0,
    },
    setup: (d) =>
      `Place cones ${d || 20} m apart on level ground. Leave clear space at both ends for wide turns.`,
    steps: [
      "Start with an easy walk, then build into a gentle jog.",
      "Move between the cones and make wide, slow turns at each end.",
      "Follow with comfortable dynamic movements and a few gradual accelerations before faster drills.",
    ],
    tip: "Warm-up length depends on age, weather, and the session. Add time if the player is not ready for faster work.",
  },
  {
    id: "cooldown",
    title: "Cool-down walk",
    category: "Recovery",
    image: "interval",
    defaults: {
      distance: 20,
      sets: 1,
      reps: 1,
      work: 180,
      rest: 0,
      setRest: 0,
    },
    setup: (d) =>
      `Mark an open walking lane with cones ${d || 20} m apart, with room to turn at each end.`,
    steps: [
      "Gradually slow from the final run into a comfortable walk.",
      "Walk between the cones and let breathing settle naturally.",
      "Finish with water and a short check-in on how the session felt.",
    ],
    tip: "A cool-down should feel easy. Stop training and tell the supervising adult about pain, dizziness, or unusual breathlessness.",
  },
];
export function guideForExercise(
  exercise: Pick<Exercise, "name" | "guideId">,
): Guide | undefined {
  if (exercise.guideId)
    return exerciseGuides.find((g) => g.id === exercise.guideId);
  const n = exercise.name.toLowerCase();
  const exact = exerciseGuides.find((g) => g.title.toLowerCase() === n);
  if (exact) return exact;
  if (/kick[ -]?ups?|keep[ -]?y?\s*upp|juggling/.test(n))
    return exerciseGuides.find((g) => g.id === "kickups");
  const id = /ball control|dribbl/.test(n)
    ? "ballControl"
    : /run\s*\/\s*walk|conditioning/.test(n)
      ? "intervals"
      : /505/.test(n)
        ? "agility505"
        : /yo.?yo/.test(n)
          ? "yoyo"
          : /repeat.*sprint/.test(n)
            ? "repeatedSprints"
            : /cooper/.test(n)
              ? "cooper"
              : /30\s*m/.test(n)
                ? "sprint30"
                : /20\s*m.*(?:sprint|acceleration)/.test(n)
                  ? "sprint20"
                  : /10\s*m.*(?:sprint|acceleration)/.test(n)
                    ? "acceleration10"
                    : /shuttle/.test(n)
                      ? "shuttle"
                      : /warm.?up/.test(n)
                        ? "warmup"
                        : /cool.?down/.test(n)
                          ? "cooldown"
                          : /endurance/.test(n)
                            ? "endurance"
                            : undefined;
  return exerciseGuides.find((g) => g.id === id);
}
