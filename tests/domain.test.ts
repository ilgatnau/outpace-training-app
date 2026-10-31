import { describe, it, expect } from "vitest";
import {
  age,
  validDob,
  positive,
  vo2Cooper,
  comparison,
  phases,
  elapsedPhase,
  initialState,
} from "../src/domain";
import { validateBackup } from "../src/backup";
describe("player and measurements", () => {
  it("calculates age around a birthday", () => {
    expect(age("2015-10-31", new Date("2026-10-30"))).toBe(10);
    expect(age("2015-10-31", new Date("2026-10-31"))).toBe(11);
  });
  it("rejects impossible and future dates", () => {
    expect(validDob("2025-02-30")).toBe(false);
    expect(validDob("2099-01-01")).toBe(false);
    expect(validDob("2015-01-01")).toBe(true);
  });
  it("rejects invalid numeric entries", () => {
    ["", " ", "NaN", "Infinity", "-2", "0"].forEach((v) =>
      expect(positive(v)).toBe(false),
    );
    expect(positive("4.12")).toBe(true);
  });
  it("computes a Cooper estimate and rejects an invalid distance", () => {
    expect(vo2Cooper(2400)).toBe(42.4);
    expect(() => vo2Cooper(400)).toThrow();
  });
});
describe("progress comparisons", () => {
  const r = [
    {
      id: "a",
      metric: "sprint20",
      date: "2026-01-01",
      value: 4.5,
      method: "gates",
    },
    {
      id: "b",
      metric: "sprint20",
      date: "2026-02-01",
      value: 4.1,
      method: "gates",
    },
    {
      id: "c",
      metric: "sprint20",
      date: "2026-03-01",
      value: 3,
      method: "hand",
    },
  ];
  it("only compares the same method and treats lower times as improvement", () => {
    const c = comparison(r, "sprint20", "gates")!;
    expect(c.points).toHaveLength(2);
    expect(c.best).toBe(4.1);
    expect(c.change).toBeCloseTo(0.4);
  });
  it("handles missing results", () =>
    expect(comparison([], "vo2", "device")).toBeNull());
  it("treats higher endurance scores as improvement", () => {
    const c = comparison(
      r
        .slice(0, 2)
        .map((x) => ({
          ...x,
          metric: "yoyo",
          value: x.id === "a" ? 400 : 600,
        })),
      "yoyo",
      "gates",
    )!;
    expect(c.change).toBe(200);
    expect(c.best).toBe(600);
  });
});
describe("interval engine", () => {
  const r = {
    id: "r",
    name: "test",
    exercises: [
      {
        id: "e",
        name: "sprint",
        sets: 2,
        reps: 2,
        work: 10,
        rest: 20,
        setRest: 60,
      },
    ],
  };
  const p = phases(r);
  it("uses rep rest, set rest, and no final rest", () =>
    expect(p.map((x) => x.seconds)).toEqual([10, 20, 10, 60, 10, 20, 10]));
  it("catches up across several intervals when returning from background", () =>
    expect(elapsedPhase(p, 0, 10, 45)).toEqual({
      index: 3,
      remaining: 55,
      done: false,
    }));
  it("finishes without running past the last phase", () =>
    expect(elapsedPhase(p, 0, 10, 999)).toEqual({
      index: 6,
      remaining: 0,
      done: true,
    }));
  it("transitions on exact boundaries", () =>
    expect(elapsedPhase(p, 0, 10, 10)).toEqual({
      index: 1,
      remaining: 20,
      done: false,
    }));
});
describe("backup safety", () => {
  it("roundtrips the initial schema", () =>
    expect(validateBackup(JSON.stringify(initialState))).toEqual(initialState));
  it("rejects unsupported versions and broken data", () => {
    expect(() => validateBackup('{"version":2}')).toThrow();
    const v = structuredClone(initialState);
    v.routines[0].exercises[0].sets = -1;
    expect(() => validateBackup(JSON.stringify(v))).toThrow();
  });
  it("rejects invalid dates and unknown tests", () => {
    const v = structuredClone(initialState);
    v.results.push({
      id: "r",
      date: "2026-01-01",
      metric: "unknown",
      value: 4,
      method: "hand",
    });
    expect(() => validateBackup(JSON.stringify(v))).toThrow();
  });
});
