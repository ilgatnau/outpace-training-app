import { describe, it, expect } from "vitest";
import { exerciseGuides, guideForExercise } from "../src/exercises";
import { initialState, phases } from "../src/domain";
import { validateBackup } from "../src/backup";
describe("exercise presets and guides", () => {
  it("provides a 20 m sprint preset with meaningful recovery and an endpoint setup", () => {
    const g = exerciseGuides.find((g) => g.id === "sprint20")!;
    expect(g.defaults.distance).toBe(20);
    expect(g.defaults.rest).toBeGreaterThan(g.defaults.work);
    expect(g.setup(25)).toContain("25 m");
    expect(g.setup()).toMatch(/start and finish cones/i);
  });
  it("all presets can form valid timed routines and survive backup restore", () => {
    for (const g of exerciseGuides) {
      const state = structuredClone(initialState);
      const exercise = {
        ...g.defaults,
        id: "preset-exercise",
        name: g.title,
        guideId: g.id,
      };
      state.routines = [
        { id: "preset-routine", name: g.title, exercises: [exercise] },
      ];
      expect(phases(state.routines[0]).length).toBeGreaterThan(0);
      expect(
        validateBackup(JSON.stringify(state)).routines[0].exercises[0].guideId,
      ).toBe(g.id);
      expect(g.steps.length).toBeGreaterThanOrEqual(3);
      expect(g.setup()).toMatch(/cone/i);
      expect(g.tip.length).toBeGreaterThan(20);
    }
  });
  it("automatically supplies guides to existing starter routines", () => {
    for (const r of initialState.routines)
      for (const e of r.exercises) expect(guideForExercise(e)).toBeDefined();
  });
  it("keeps the selected guide when a player renames a preset", () =>
    expect(
      guideForExercise({ name: "Tuesday speed work", guideId: "sprint20" })?.id,
    ).toBe("sprint20"));
  it("does not invent technique for an unknown custom exercise", () =>
    expect(
      guideForExercise({ name: "My custom strength circuit" }),
    ).toBeUndefined());
  it("does not confuse 10, 20 and 30 metre legacy sprint names", () => {
    for (const [name, id] of [
      ["10 m sprint", "acceleration10"],
      ["20 m acceleration", "sprint20"],
      ["30 m sprint", "sprint30"],
    ])
      expect(guideForExercise({ name })?.id).toBe(id);
  });
  it("preserves exercise identity through phases with duplicate names", () => {
    const r = {
      id: "r",
      name: "same labels",
      exercises: [
        {
          id: "one",
          name: "Sprint",
          sets: 1,
          reps: 1,
          work: 5,
          rest: 0,
          setRest: 0,
          guideId: "sprint20",
        },
        {
          id: "two",
          name: "Sprint",
          sets: 1,
          reps: 1,
          work: 8,
          rest: 0,
          setRest: 0,
          guideId: "sprint30",
        },
      ],
    };
    expect(phases(r).map((p) => p.exerciseId)).toEqual(["one", "two"]);
  });
  it("rejects malformed guide IDs without breaking older backups", () => {
    const s = structuredClone(initialState);
    (s.routines[0].exercises[0] as any).guideId = 5;
    expect(() => validateBackup(JSON.stringify(s))).toThrow();
    delete s.routines[0].exercises[0].guideId;
    expect(() => validateBackup(JSON.stringify(s))).not.toThrow();
  });
});
