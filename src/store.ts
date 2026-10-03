import AsyncStorage from "@react-native-async-storage/async-storage";
import { parsePose, type PoseState } from "./pose";

const KEY = "both-ready-v1";

export async function loadPose(): Promise<PoseState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parsePose(raw);
}

export async function savePose(state: PoseState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
