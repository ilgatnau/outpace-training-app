import { metrics, parseState, State, validDob, exerciseTiming } from "./domain";
const obj = (v: any) => v && typeof v === "object";
const text = (v: any) => typeof v === "string";
const num = (v: any, min = 0, max = 1e6) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const date = (v: any) => text(v) && validDob(v);
export function validateBackup(raw: string): State {
  const s = parseState(raw);
  const p = s.profile;
  if (
    !["name", "dob", "position", "foot", "goal"].every((k) =>
      text((p as any)[k]),
    ) ||
    (p.dob !== "" && !date(p.dob))
  )
    throw Error("Invalid profile");
  const ids = new Set<string>();
  const id = (v: any) => {
    if (!text(v) || !v || ids.has(v)) throw Error("Invalid ID");
    ids.add(v);
  };
  s.routines.forEach((r) => {
    id(r.id);
    if (!text(r.name) || !Array.isArray(r.exercises) || !r.exercises.length)
      throw Error("Invalid routine");
    r.exercises.forEach((e) => {
      id(e.id);
      if (
        !obj(e) ||
        !text(e.name) ||
        (e.guideId !== undefined && !text(e.guideId)) ||
        !Number.isInteger(e.sets) ||
        !num(e.sets, 1, 20) ||
        !Number.isInteger(e.reps) ||
        !num(e.reps, 1, 50) ||
        (e.timing !== undefined &&
          !["countdown", "stopwatch"].includes(e.timing)) ||
        !num(e.work, exerciseTiming(e) === "stopwatch" ? 0 : 1, 3600) ||
        (exerciseTiming(e) === "stopwatch" && !num(e.distance, 0.01)) ||
        !num(e.rest, 0, 3600) ||
        !num(e.setRest, 0, 3600) ||
        (e.distance !== undefined && !num(e.distance, 0.01))
      )
        throw Error("Invalid exercise");
    });
  });
  s.results.forEach((r) => {
    id(r.id);
    if (
      !date(r.date) ||
      !Object.hasOwn(metrics, r.metric) ||
      !num(r.value, 0.00001) ||
      !text(r.method) ||
      !r.method.trim() ||
      (r.sessionId !== undefined && !text(r.sessionId)) ||
      (r.exerciseName !== undefined && !text(r.exerciseName)) ||
      (r.distance !== undefined && !num(r.distance, 0.01)) ||
      (r.set !== undefined &&
        (!Number.isInteger(r.set) || !num(r.set, 1, 20))) ||
      (r.rep !== undefined && (!Number.isInteger(r.rep) || !num(r.rep, 1, 50)))
    )
      throw Error("Invalid result");
  });
  s.measurements.forEach((m) => {
    id(m.id);
    if (
      !date(m.date) ||
      !num(m.height, 1, 280) ||
      !num(m.weight, 0.1, 500) ||
      (m.waist !== undefined && !num(m.waist, 0.1, 500))
    )
      throw Error("Invalid measurement");
  });
  s.sessions.forEach((x) => {
    id(x.id);
    if (
      !date(x.date) ||
      !text(x.routine) ||
      !num(x.seconds, 0, 86400) ||
      !num(x.effort, 1, 10) ||
      !num(x.fatigue, 1, 10) ||
      !text(x.notes)
    )
      throw Error("Invalid session");
  });
  return s;
}
