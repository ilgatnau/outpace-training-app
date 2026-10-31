import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialState, State } from "./domain";
import { validateBackup } from "./backup";
export const KEY = "touchline.v1";
export async function readState(): Promise<State> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? validateBackup(raw) : JSON.parse(JSON.stringify(initialState));
}
export async function writeState(s: State) {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
