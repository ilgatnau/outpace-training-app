import { beforeEach, describe, it, expect, vi } from "vitest";
const mock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: mock }));
import { readState, writeState, KEY } from "../src/storage";
import { initialState } from "../src/domain";
describe("device persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("starts with independent defaults without stored data", async () => {
    mock.getItem.mockResolvedValue(null);
    const s = await readState();
    s.profile.name = "Changed";
    expect(initialState.profile.name).toBe("");
    expect(mock.getItem).toHaveBeenCalledWith(KEY);
  });
  it("loads saved profiles and sessions", async () => {
    const s = structuredClone(initialState);
    s.profile.name = "Alex";
    mock.getItem.mockResolvedValue(JSON.stringify(s));
    expect(await readState()).toEqual(s);
  });
  it("writes the entire versioned state", async () => {
    await writeState(initialState);
    expect(mock.setItem).toHaveBeenCalledWith(
      KEY,
      JSON.stringify(initialState),
    );
  });
  it("does not silently overwrite damaged data", async () => {
    mock.getItem.mockResolvedValue("{bad");
    await expect(readState()).rejects.toThrow();
    expect(mock.setItem).not.toHaveBeenCalled();
  });
  it("reports device write failures", async () => {
    mock.setItem.mockRejectedValue(Error("full"));
    await expect(writeState(initialState)).rejects.toThrow("full");
  });
});
