import { Exercise, Result, today, uid } from "./domain";
export function stopwatchSeconds(started: number, finished: number): number {
  if (
    !Number.isFinite(started) ||
    !Number.isFinite(finished) ||
    finished <= started
  )
    throw Error("Finish must be after start");
  const seconds = Math.round((finished - started) / 10) / 100;
  if (seconds <= 0) throw Error("Sprint was too short to record");
  return seconds;
}
export function sprintResult(
  exercise: Exercise,
  seconds: number,
  set: number,
  rep: number,
  sessionId: string,
): Result {
  if (
    !exercise.distance ||
    exercise.distance <= 0 ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  )
    throw Error("A sprint needs a distance and a positive time");
  return {
    id: uid(),
    date: today(),
    metric: [10, 20, 30].includes(exercise.distance)
      ? `sprint${exercise.distance}`
      : "sprintCustom",
    value: seconds,
    method: `Manual taps · ${exercise.distance} m · ${exercise.rest}s rep rest / ${exercise.setRest}s set rest`,
    sessionId,
    exerciseName: exercise.name,
    distance: exercise.distance,
    set,
    rep,
  };
}
export function sprintSummary(results: Result[]) {
  if (!results.length) return null;
  return {
    count: results.length,
    best: Math.min(...results.map((r) => r.value)),
    average: results.reduce((sum, r) => sum + r.value, 0) / results.length,
  };
}
