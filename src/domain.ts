export type Profile = {
  name: string;
  dob: string;
  position: string;
  foot: string;
  goal: string;
};
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  work: number;
  rest: number;
  setRest: number;
  distance?: number;
  guideId?: string;
};
export type Routine = { id: string; name: string; exercises: Exercise[] };
export type Result = {
  id: string;
  date: string;
  metric: string;
  value: number;
  method: string;
};
export type Measurement = {
  id: string;
  date: string;
  height: number;
  weight: number;
  waist?: number;
};
export type Session = {
  id: string;
  date: string;
  routine: string;
  seconds: number;
  effort: number;
  fatigue: number;
  notes: string;
};
export type State = {
  version: 1;
  profile: Profile;
  routines: Routine[];
  results: Result[];
  measurements: Measurement[];
  sessions: Session[];
};
export const metrics: Record<
  string,
  { label: string; unit: string; lower: boolean }
> = {
  sprint10: { label: "10 m acceleration", unit: "sec", lower: true },
  sprint20: { label: "20 m sprint", unit: "sec", lower: true },
  sprint30: { label: "30 m sprint", unit: "sec", lower: true },
  speed: { label: "Maximum speed", unit: "km/h", lower: false },
  yoyo: { label: "Yo-Yo IR1 distance", unit: "m", lower: false },
  agility: { label: "505 agility test", unit: "sec", lower: true },
  repeat: { label: "Repeated sprint mean", unit: "sec", lower: true },
  recovery: { label: "1-min HR recovery", unit: "bpm drop", lower: false },
  vo2: { label: "Estimated VO₂ max", unit: "ml/kg/min", lower: false },
};
export const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const today = () => new Date().toISOString().slice(0, 10);
export function age(dob: string, now = new Date()) {
  const d = new Date(dob + "T00:00:00");
  let n = now.getFullYear() - d.getFullYear();
  if (
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
  )
    n--;
  return n;
}
export function validDob(dob: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(dob) &&
    !isNaN(Date.parse(dob)) &&
    new Date(dob).toISOString().slice(0, 10) === dob &&
    age(dob) >= 0 &&
    age(dob) <= 110
  );
}
export function positive(n: string) {
  return n.trim() !== "" && Number.isFinite(Number(n)) && Number(n) > 0;
}
export function vo2Cooper(distance: number) {
  if (!Number.isFinite(distance) || distance <= 504.9)
    throw Error("Enter a distance greater than 505 m.");
  return Math.round(((distance - 504.9) / 44.73) * 10) / 10;
}
export function comparison(results: Result[], metric: string, method: string) {
  const r = results
    .filter((x) => x.metric === metric && x.method === method)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  if (!r.length) return null;
  const first = r[0].value,
    latest = r[r.length - 1].value;
  const best = metrics[metric].lower
    ? Math.min(...r.map((x) => x.value))
    : Math.max(...r.map((x) => x.value));
  return {
    first,
    latest,
    best,
    change: (latest - first) * (metrics[metric].lower ? -1 : 1),
    points: r,
  };
}
export type Phase = {
  label: string;
  seconds: number;
  recovery: boolean;
  exercise: string;
  exerciseId: string;
  set: number;
  rep: number;
};
export function phases(routine: Routine): Phase[] {
  const out: Phase[] = [];
  routine.exercises.forEach((e) => {
    for (let s = 1; s <= e.sets; s++)
      for (let r = 1; r <= e.reps; r++) {
        out.push({
          label: "WORK",
          seconds: e.work,
          recovery: false,
          exercise: e.name,
          exerciseId: e.id,
          set: s,
          rep: r,
        });
        const rest = r < e.reps ? e.rest : s < e.sets ? e.setRest : 0;
        if (rest > 0)
          out.push({
            label: "RECOVER",
            seconds: rest,
            recovery: true,
            exercise: e.name,
            exerciseId: e.id,
            set: s,
            rep: r,
          });
      }
  });
  return out;
}
export function elapsedPhase(
  list: Phase[],
  index: number,
  remaining: number,
  elapsed: number,
) {
  let left = remaining - elapsed;
  while (left <= 0 && index < list.length - 1) {
    index++;
    left += list[index].seconds;
  }
  return {
    index,
    remaining: Math.max(0, left),
    done: index === list.length - 1 && left <= 0,
  };
}
export const initialState: State = {
  version: 1,
  profile: {
    name: "",
    dob: "",
    position: "Midfielder",
    foot: "Right",
    goal: "Build speed and confidence",
  },
  routines: [
    {
      id: "starter",
      name: "Speed & ball control",
      exercises: [
        {
          id: "a",
          name: "20 m acceleration",
          distance: 20,
          sets: 3,
          reps: 5,
          work: 6,
          rest: 30,
          setRest: 180,
        },
        {
          id: "b",
          name: "Ball control",
          sets: 3,
          reps: 1,
          work: 180,
          rest: 0,
          setRest: 60,
        },
      ],
    },
    {
      id: "endurance",
      name: "Football conditioning",
      exercises: [
        {
          id: "c",
          name: "Run / walk intervals",
          sets: 4,
          reps: 4,
          work: 30,
          rest: 30,
          setRest: 120,
        },
      ],
    },
  ],
  results: [],
  measurements: [],
  sessions: [],
};
export function parseState(raw: string): State {
  const s = JSON.parse(raw);
  if (
    s.version !== 1 ||
    !s.profile ||
    typeof s.profile.name !== "string" ||
    !Array.isArray(s.routines) ||
    !Array.isArray(s.results) ||
    !Array.isArray(s.measurements) ||
    !Array.isArray(s.sessions)
  )
    throw Error("Invalid local data");
  return s;
}
