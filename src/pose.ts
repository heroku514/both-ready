export const POSES = [
  "Hands on hips.",
  "One eye closed.",
  "Arms up high.",
  "Chin on hands.",
  "One foot lifted.",
  "Big smile.",
] as const;

const POSE_WORDS = ["Pose one", "Pose two", "Pose three", "Pose four", "Pose five", "Pose six"] as const;

export type PoseState = {
  index: number;
  kid: boolean;
  grandpa: boolean;
  done: boolean;
};

export const EMPTY_POSE: PoseState = {
  index: 0,
  kid: false,
  grandpa: false,
  done: false,
};

export function poseLabel(state: PoseState): string {
  if (state.done) return "Done";
  return POSE_WORDS[state.index] ?? POSE_WORDS[0];
}

export function poseText(state: PoseState): string {
  if (state.done) return "All posed.";
  return POSES[state.index] ?? POSES[0];
}

export function kidLabel(state: PoseState): string {
  return state.kid ? "Kid in" : "Kid out";
}

export function grandpaLabel(state: PoseState): string {
  return state.grandpa ? "Grandpa in" : "Grandpa out";
}

export function hasProgress(state: PoseState): boolean {
  return state.done || state.index > 0 || state.kid || state.grandpa;
}

export function parsePose(raw: string | null): PoseState {
  if (!raw) return EMPTY_POSE;
  try {
    const data = JSON.parse(raw) as Partial<PoseState>;
    const index = typeof data.index === "number" && data.index >= 0 && data.index < POSES.length
      ? Math.floor(data.index)
      : 0;
    const done = data.done === true;
    return {
      index: done ? 0 : index,
      kid: !done && data.kid === true,
      grandpa: !done && data.grandpa === true,
      done,
    };
  } catch {
    return EMPTY_POSE;
  }
}

function bothNote(state: PoseState, who: "kid" | "grandpa", on: boolean): string {
  if (state.kid && state.grandpa) return "Both ready.";
  if (who === "kid") return on ? "Kid is ready." : "Kid stepped back.";
  return on ? "Grandpa is ready." : "Grandpa stepped back.";
}

export function toggleReady(state: PoseState, who: "kid" | "grandpa"): { state: PoseState; note: string } {
  if (state.done) return { state, note: "All posed." };
  const next = who === "kid" ? { ...state, kid: !state.kid } : { ...state, grandpa: !state.grandpa };
  const on = who === "kid" ? next.kid : next.grandpa;
  return { state: next, note: bothNote(next, who, on) };
}

export function nextPose(state: PoseState): { state: PoseState; note: string } {
  if (state.done) return { state, note: "All posed." };
  if (!state.kid || !state.grandpa) return { state, note: "Wait for both." };
  if (state.index + 1 >= POSES.length) {
    return { state: { index: state.index, kid: false, grandpa: false, done: true }, note: "All posed." };
  }
  return { state: { index: state.index + 1, kid: false, grandpa: false, done: false }, note: "Next pose." };
}

export function resetPose(): { state: PoseState; note: string } {
  return { state: EMPTY_POSE, note: "Both get ready." };
}
