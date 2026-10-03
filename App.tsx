import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { grandpaLabel, hasProgress, kidLabel, nextPose, poseLabel, poseText, resetPose, toggleReady, type PoseState } from "./src/pose";
import { loadPose, savePose } from "./src/store";

export default function App() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PoseState | null>(null);
  const [note, setNote] = useState("Both get ready.");
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    loadPose()
      .then((loaded) => {
        setState(loaded);
        setNote(loaded.done ? "All posed." : hasProgress(loaded) ? "Saved pose loaded." : "Both get ready.");
      })
      .catch(() => {
        setState(null);
        setNote("Could not read the pose.");
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    savePose(state).catch(() => setNote("Could not save the pose."));
  }, [ready, state]);

  if (!ready || !state) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the pose</Text>
        </View>
      </SafeAreaView>
    );
  }

  function onToggle(who: "kid" | "grandpa") {
    const result = toggleReady(state!, who);
    setState(result.state);
    setNote(result.note);
    setConfirmNew(false);
  }

  function onNext() {
    const result = nextPose(state!);
    setState(result.state);
    setNote(result.note);
    setConfirmNew(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Text style={styles.title}>Both Ready</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.pose}>{poseLabel(state)}</Text>
        <Text style={styles.line}>{poseText(state)}</Text>
        <View style={styles.row}>
          <Text style={styles.status}>{kidLabel(state)}</Text>
          <Text style={styles.status}>{grandpaLabel(state)}</Text>
        </View>
        <View style={styles.row}>
          <BigButton label="Kid ready" filled={state.kid} inRow onPress={() => onToggle("kid")} />
          <BigButton label="Grandpa ready" filled={state.grandpa} inRow onPress={() => onToggle("grandpa")} />
        </View>
        <BigButton label="Next pose" onPress={onNext} />
        {confirmNew ? (
          <View style={styles.row}>
            <BigButton label="Confirm new" filled inRow onPress={onConfirmNew} />
            <BigButton label="Cancel new" inRow onPress={onCancelNew} />
          </View>
        ) : (
          <BigButton label="New poses" onPress={() => setConfirmNew(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmNew() {
    const result = resetPose();
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  function onCancelNew() {
    setConfirmNew(false);
    setNote("New poses canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F3EA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#2C2416" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#2C2416" },
  note: { fontSize: 18, color: "#5C4A32", minHeight: 26 },
  pose: { fontSize: 22, fontWeight: "700", color: "#2C2416" },
  line: { fontSize: 40, fontWeight: "800", color: "#B45309", lineHeight: 48, minHeight: 96 },
  row: { flexDirection: "row", gap: 8 },
  status: { flex: 1, fontSize: 22, fontWeight: "800", color: "#2C2416", textAlign: "center" },
  button: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2C2416",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#2C2416" },
  buttonText: { fontSize: 20, fontWeight: "800", color: "#2C2416", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
