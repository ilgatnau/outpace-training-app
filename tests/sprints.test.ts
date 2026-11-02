import { describe, it, expect } from "vitest";
import {
  exerciseTiming,
  elapsedPhase,
  phases,
  initialState,
  comparison,
  Exercise,
} from "../src/domain";
import { exerciseGuides } from "../src/exercises";
import { sprintResult, sprintSummary, stopwatchSeconds } from "../src/sprints";
import { validateBackup } from "../src/backup";
const sprint: Exercise = {
  id: "s",
  name: "20 m sprint",
  distance: 20,
  sets: 2,
  reps: 2,
  work: 0,
  rest: 30,
  setRest: 90,
  timing: "stopwatch",
};
describe("distance-based sprint timing", () => {
  it("uses stopwatches for every sprint preset and keeps kick-ups as a countdown", () => {
    for (const id of [
      "acceleration10",
      "sprint20",
      "sprint30",
      "repeatedSprints",
    ]) {
      const g = exerciseGuides.find((g) => g.id === id)!;
      expect(
        exerciseTiming({ ...g.defaults, name: g.title, guideId: id }),
      ).toBe("stopwatch");
      expect(g.defaults.work).toBe(0);
    }
    const g = exerciseGuides.find((g) => g.id === "kickups")!;
    expect(exerciseTiming({ ...g.defaults, name: g.title })).toBe("countdown");
  });
  it("upgrades existing sprint routines without rewriting data", () => {
    const e = {
      ...initialState.routines[0].exercises[0],
      work: 6,
      timing: undefined,
    };
    expect(exerciseTiming(e)).toBe("stopwatch");
    expect(
      phases({ ...initialState.routines[0], exercises: [e] })[0],
    ).toMatchObject({
      manual: true,
      seconds: 0,
    });
  });
  it("supports an explicit countdown override", () =>
    expect(exerciseTiming({ ...sprint, timing: "countdown" })).toBe(
      "countdown",
    ));
  it("never automatically advances a manual sprint, however much time elapses", () => {
    const p = phases({ id: "r", name: "r", exercises: [sprint] });
    expect(elapsedPhase(p, 0, 0, 600)).toEqual({
      index: 0,
      remaining: 0,
      done: false,
    });
  });
  it("counts rep and set recovery, then stops ready for the next tap", () => {
    const p = phases({ id: "r", name: "r", exercises: [sprint] });
    expect(p.map((x) => x.seconds)).toEqual([0, 30, 0, 90, 0, 30, 0]);
    expect(elapsedPhase(p, 1, 30, 1000)).toEqual({
      index: 2,
      remaining: 0,
      done: false,
    });
    expect(elapsedPhase(p, 3, 90, 90)).toEqual({
      index: 4,
      remaining: 0,
      done: false,
    });
  });
  it("does not run past a sprint barrier after timed work", () => {
    const p = phases({
      id: "r",
      name: "mixed",
      exercises: [
        {
          ...sprint,
          id: "warmup",
          name: "Warm-up",
          distance: undefined,
          timing: "countdown",
          sets: 1,
          reps: 1,
          work: 10,
        },
        sprint,
      ],
    });
    expect(elapsedPhase(p, 0, 10, 1000)).toEqual({
      index: 1,
      remaining: 0,
      done: false,
    });
  });
  it("measures actual elapsed milliseconds, independent of refresh ticks", () => {
    expect(stopwatchSeconds(1000, 5137)).toBe(4.14);
    expect(() => stopwatchSeconds(1000, 999)).toThrow();
    expect(() => stopwatchSeconds(1000, 1000)).toThrow();
    expect(() => stopwatchSeconds(NaN, 2000)).toThrow();
  });
  it("keeps distance, protocol, repetition and session with each result", () => {
    const r = sprintResult(sprint, 4.12, 2, 1, "session");
    expect(r).toMatchObject({
      metric: "sprint20",
      value: 4.12,
      distance: 20,
      set: 2,
      rep: 1,
      sessionId: "session",
    });
    expect(r.method).toContain("Manual taps");
    expect(r.method).toContain("30s rep rest");
  });
  it("keeps 10, 20, 30 and other distances separate", () => {
    const results = [10, 20, 30, 25].map((distance) =>
      sprintResult({ ...sprint, distance }, 4.12, 1, 1, "s"),
    );
    expect(results.map((r) => r.metric)).toEqual([
      "sprint10",
      "sprint20",
      "sprint30",
      "sprintCustom",
    ]);
    expect(
      comparison(results, "sprint20", results[1].method)?.points,
    ).toHaveLength(1);
    expect(
      sprintResult({ ...sprint, distance: 25 }, 4, 1, 1, "s").method,
    ).not.toBe(sprintResult({ ...sprint, distance: 40 }, 4, 1, 1, "s").method);
  });
  it("computes session best and average from saved attempts", () => {
    const r = [4, 5, 6].map((value) => sprintResult(sprint, value, 1, 1, "s"));
    expect(sprintSummary(r)).toEqual({ count: 3, best: 4, average: 5 });
    expect(sprintSummary([])).toBeNull();
  });
  it("roundtrips stopwatch routines and result metadata through backups", () => {
    const s = structuredClone(initialState);
    s.routines = [{ id: "r", name: "Sprint", exercises: [sprint] }];
    s.results = [sprintResult(sprint, 4.12, 1, 1, "session")];
    expect(validateBackup(JSON.stringify(s))).toEqual(s);
  });
  it("rejects invalid modes, missing distance, and malformed saved repetitions", () => {
    const s = structuredClone(initialState);
    s.routines = [
      {
        id: "r",
        name: "Sprint",
        exercises: [{ ...sprint, distance: undefined }],
      },
    ];
    expect(() => validateBackup(JSON.stringify(s))).toThrow();
    s.routines[0].exercises[0] = { ...sprint, timing: "invalid" as any };
    expect(() => validateBackup(JSON.stringify(s))).toThrow();
    s.routines[0].exercises[0] = sprint;
    s.results = [{ ...sprintResult(sprint, 4, 1, 1, "s"), rep: 0 }];
    expect(() => validateBackup(JSON.stringify(s))).toThrow();
  });
});
