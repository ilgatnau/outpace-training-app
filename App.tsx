import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Platform,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import {
  age,
  comparison,
  elapsedPhase,
  Exercise,
  initialState,
  Measurement,
  metrics,
  phases,
  positive,
  Profile,
  Result,
  Routine,
  Session,
  State,
  today,
  uid,
  validDob,
  vo2Cooper,
} from "./src/domain";
import { readState, writeState } from "./src/storage";
const C = {
  bg: "#09130F",
  card: "#14231C",
  line: "#293D31",
  lime: "#CEFA69",
  text: "#F3F7EF",
  muted: "#9BAEA1",
  blue: "#93DCD5",
};
type Icon = React.ComponentProps<typeof Ionicons>["name"];
function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[s.button, secondary && s.secondary]}
    >
      <Text style={[s.buttonText, secondary && { color: C.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
function Field({
  label,
  value,
  onChange,
  numeric = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? "decimal-pad" : "default"}
        multiline={multiline}
        placeholderTextColor={C.muted}
        style={[s.input, multiline && { minHeight: 80 }]}
      />
    </View>
  );
}
function Chips({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={s.wrap}>
      {values.map((v) => (
        <TouchableOpacity
          key={v}
          accessibilityRole="button"
          accessibilityState={{ selected: v === selected }}
          onPress={() => onSelect(v)}
          style={[s.chip, v === selected && { backgroundColor: C.lime }]}
        >
          <Text
            style={{
              color: v === selected ? C.bg : C.muted,
              fontWeight: "600",
            }}
          >
            {v}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const fmt = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
function notify(message: string) {
  if (Platform.OS === "web") globalThis.alert(message);
  else Alert.alert("Touchline", message);
}
export default function App() {
  const [data, setData] = useState<State>(initialState),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [tab, setTab] = useState("Today"),
    [page, setPage] = useState(""),
    [active, setActive] = useState<Routine | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [sessionDraft, setSessionDraft] = useState<{
    routine: string;
    seconds: number;
  } | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [page, tab, active]);
  const pending = useRef(Promise.resolve());
  useEffect(() => {
    readState()
      .then((d) => {
        setData(d);
        setReady(true);
      })
      .catch(() =>
        setError(
          "Your saved data could not be read. It has not been overwritten. Restart the app or restore access to device storage.",
        ),
      );
  }, []);
  function update(fn: (d: State) => State) {
    setData((d) => {
      const next = fn(d);
      pending.current = pending.current
        .catch(() => {})
        .then(() => writeState(next))
        .then(() => setError(""))
        .catch(() =>
          setError(
            "Changes could not be saved. Keep the app open and tap Retry save.",
          ),
        );
      return next;
    });
  }
  function retry() {
    pending.current = pending.current
      .catch(() => {})
      .then(() => writeState(data))
      .then(() => setError(""))
      .catch(() =>
        setError(
          "Storage is still unavailable. Your changes remain in memory.",
        ),
      );
  }
  if (!ready)
    return (
      <SafeAreaView style={s.root}>
        <Text style={[s.title, { margin: 30 }]}>TOUCHLINE</Text>
        <Text style={[s.body, { margin: 30 }]}>
          {error || "Getting your pitch ready…"}
        </Text>
      </SafeAreaView>
    );
  const close = () => setPage("");
  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <View style={s.app}>
        <View style={s.brand}>
          <View style={s.row}>
            <Ionicons name="football" size={25} color={C.lime} />
            <Text style={s.brandText}>TOUCHLINE</Text>
          </View>
          <View style={s.local}>
            <View style={s.dot} />
            <Text style={s.tiny}>ON DEVICE</Text>
          </View>
        </View>
        {error ? (
          <View style={s.card}>
            <Text style={{ color: "#FFBC9A" }}>{error}</Text>
            <Button title="Retry save" onPress={retry} />
          </View>
        ) : null}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {active ? (
            <Timer
              routine={active}
              onCancel={() => setActive(null)}
              onDone={(seconds) => {
                setActive(null);
                setSessionDraft({ routine: active.name, seconds });
                setPage("log");
              }}
            />
          ) : page === "profile" ? (
            <ProfileForm
              profile={data.profile}
              onSave={(p) => {
                update((d) => ({ ...d, profile: p }));
                close();
              }}
              onCancel={close}
            />
          ) : page === "routine" ? (
            <RoutineForm
              initial={editingRoutine}
              onSave={(r) => {
                update((d) => ({
                  ...d,
                  routines: editingRoutine
                    ? d.routines.map((x) => (x.id === r.id ? r : x))
                    : [...d.routines, r],
                }));
                setEditingRoutine(null);
                close();
              }}
              onCancel={close}
            />
          ) : page === "result" ? (
            <ResultForm
              onSave={(r) => {
                update((d) => ({ ...d, results: [...d.results, r] }));
                close();
              }}
              onCancel={close}
            />
          ) : page === "measure" ? (
            <MeasureForm
              adult={!!data.profile.dob && age(data.profile.dob) >= 18}
              onSave={(m) => {
                update((d) => ({ ...d, measurements: [...d.measurements, m] }));
                close();
              }}
              onCancel={close}
            />
          ) : page === "log" ? (
            <SessionForm
              draft={sessionDraft}
              onSave={(v) => {
                update((d) => ({ ...d, sessions: [...d.sessions, v] }));
                close();
                setTab("Today");
              }}
              onCancel={close}
            />
          ) : (
            <>
              {!page && tab === "Today" && (
                <>
                  <Text style={s.eyebrow}>YOUR NEXT LEVEL STARTS HERE</Text>
                  <Text style={s.title}>
                    {data.profile.name
                      ? `Let's go, ${data.profile.name.split(" ")[0]}.`
                      : "Make every\nsession count."}
                  </Text>
                  <Text style={s.body}>Small steps. Stronger game.</Text>
                  {!data.profile.name && (
                    <View style={s.card}>
                      <Text style={s.h2}>Meet your player</Text>
                      <Text style={s.body}>
                        Set up a private player profile to get started. An adult
                        should manage this app for a child.
                      </Text>
                      <Button
                        title="Create player profile →"
                        onPress={() => setPage("profile")}
                      />
                    </View>
                  )}
                  <View style={[s.card, { backgroundColor: C.lime }]}>
                    <Text style={[s.eyebrow, { color: "#355120" }]}>
                      THIS WEEK
                    </Text>
                    <Text style={[s.heroNumber, { color: C.bg }]}>
                      {
                        data.sessions.filter(
                          (x) => Date.now() - Date.parse(x.date) < 7 * 86400000,
                        ).length
                      }{" "}
                      <Text style={{ fontSize: 18 }}>sessions completed</Text>
                    </Text>
                    <Text style={{ color: "#355120" }}>
                      Keep showing up. Progress follows practice.
                    </Text>
                  </View>
                  <View style={s.section}>
                    <Text style={s.h2}>Next on the pitch</Text>
                    <Text style={s.badge}>LET'S MOVE</Text>
                  </View>
                  {data.routines[0] && (
                    <RoutineCard
                      routine={data.routines[0]}
                      onStart={() => setActive(data.routines[0])}
                    />
                  )}
                  <Text style={s.h2}>Your latest wins</Text>
                  <View style={s.grid}>
                    {["sprint20", "yoyo"].map((k) => {
                      const last = data.results
                        .filter((r) => r.metric === k)
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .at(-1);
                      const comp = last
                        ? comparison(data.results, k, last.method)
                        : null;
                      return (
                        <View key={k} style={[s.card, s.stat]}>
                          <Ionicons
                            name={
                              k === "sprint20"
                                ? "flash-outline"
                                : "pulse-outline"
                            }
                            size={25}
                            color={C.lime}
                          />
                          <Text style={s.label}>{metrics[k].label}</Text>
                          <Text style={s.statNumber}>
                            {last ? last.value : "—"}
                          </Text>
                          <Text style={s.tiny}>{metrics[k].unit}</Text>
                          <Text
                            style={[s.tiny, { marginTop: 12, color: C.lime }]}
                          >
                            {comp && comp.points.length > 1
                              ? `${comp.change >= 0 ? "+" : ""}${comp.change.toFixed(2)} improvement`
                              : "Record your starting point"}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Button
                    title="Record a performance test"
                    secondary
                    onPress={() => setPage("result")}
                  />
                  <Text style={s.h2}>Recent sessions</Text>
                  {!data.sessions.length && (
                    <Text style={s.body}>
                      Your training story starts with your first session.
                    </Text>
                  )}
                  {data.sessions
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((x) => (
                      <View style={s.card} key={x.id}>
                        <Text style={s.h3}>{x.routine}</Text>
                        <Text style={s.body}>
                          {x.date} · {fmt(x.seconds)} · Effort {x.effort}/10
                        </Text>
                        {!!x.notes && <Text style={s.body}>{x.notes}</Text>}
                      </View>
                    ))}
                  <Button
                    title="Log a completed session"
                    secondary
                    onPress={() => {
                      setSessionDraft(null);
                      setPage("log");
                    }}
                  />
                </>
              )}
              {!page && tab === "Train" && (
                <>
                  <Text style={s.eyebrow}>TRAIN WITH PURPOSE</Text>
                  <Text style={s.title}>Your playbook.</Text>
                  <Text style={s.body}>
                    Choose a session or build your own. Start with a warm-up and
                    use routines appropriate to the player's age and ability.
                  </Text>
                  <Button
                    title="+ Build a routine"
                    onPress={() => {
                      setEditingRoutine(null);
                      setPage("routine");
                    }}
                  />
                  {data.routines.map((r) => (
                    <View key={r.id}>
                      <RoutineCard routine={r} onStart={() => setActive(r)} />
                      <Button
                        title="Edit routine"
                        secondary
                        onPress={() => {
                          setEditingRoutine(r);
                          setPage("routine");
                        }}
                      />
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() =>
                          update((d) => ({
                            ...d,
                            routines: d.routines.filter((x) => x.id !== r.id),
                          }))
                        }
                      >
                        <Text style={s.delete}>Remove routine</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
              {!page && tab === "Progress" && (
                <Progress
                  data={data}
                  onAdd={() => setPage("result")}
                  onDelete={(id) =>
                    update((d) => ({
                      ...d,
                      results: d.results.filter((x) => x.id !== id),
                    }))
                  }
                />
              )}
              {!page && tab === "Profile" && (
                <>
                  <Text style={s.eyebrow}>THE PLAYER BEHIND THE PROGRESS</Text>
                  <Text style={s.title}>
                    {data.profile.name || "Your player."}
                  </Text>
                  <View style={s.card}>
                    <Text style={s.h2}>{data.profile.position}</Text>
                    <Text style={s.body}>
                      {data.profile.dob
                        ? `${age(data.profile.dob)} years old · `
                        : ""}
                      {data.profile.foot} foot
                    </Text>
                    <Text style={s.body}>{data.profile.goal}</Text>
                    <Button
                      title="Edit profile"
                      secondary
                      onPress={() => setPage("profile")}
                    />
                  </View>
                  <View style={s.section}>
                    <Text style={s.h2}>Growth & measurements</Text>
                  </View>
                  <Text style={s.body}>
                    Private context for training. Growth can affect performance;
                    weight alone is not a fitness score.
                  </Text>
                  <Button
                    title="+ Add measurements"
                    onPress={() => setPage("measure")}
                  />
                  {data.measurements
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => (
                      <View key={m.id} style={s.card}>
                        <Text style={s.h3}>{m.date}</Text>
                        <Text style={s.body}>
                          {m.height} cm · {m.weight} kg
                          {m.waist ? ` · Waist ${m.waist} cm` : ""}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            update((d) => ({
                              ...d,
                              measurements: d.measurements.filter(
                                (x) => x.id !== m.id,
                              ),
                            }))
                          }
                        >
                          <Text style={s.delete}>Remove entry</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  <Text style={s.h2}>Your data stays with you</Text>
                  <Text style={s.body}>
                    No account, ads, analytics, or backend. Data lives in app
                    storage on this device. Uninstalling may remove it. Export a
                    backup before changing phones. Device or OS backups may
                    apply.
                  </Text>
                  <Button
                    title="Export JSON backup"
                    secondary
                    onPress={() =>
                      Share.share({
                        message: JSON.stringify(data, null, 2),
                        title: "Touchline backup",
                      }).catch(() => notify("Export was unavailable."))
                    }
                  />
                  <Text style={s.tiny}>
                    Backups include personal measurements. Share only with
                    people you trust.
                  </Text>
                  <Button
                    title="Restore JSON backup"
                    secondary
                    onPress={() => setPage("restore")}
                  />
                  <Button
                    title="Delete all player data"
                    secondary
                    onPress={() => setPage("delete")}
                  />
                </>
              )}
            </>
          )}
          {page === "restore" && !active && (
            <Restore
              onSave={(v) => {
                update(() => v);
                close();
                setTab("Today");
              }}
              onCancel={close}
            />
          )}
          {page === "delete" && !active && (
            <View style={s.card}>
              <Text style={s.h2}>Delete all data?</Text>
              <Text style={s.body}>
                This removes the profile, results, measurements, and training
                history from this app. This cannot be undone without an exported
                backup.
              </Text>
              <Button
                title="Delete permanently"
                onPress={() => {
                  update(() => JSON.parse(JSON.stringify(initialState)));
                  close();
                  setTab("Today");
                }}
              />
              <Button title="Keep my data" secondary onPress={close} />
            </View>
          )}
        </ScrollView>
        {!active && (
          <View style={s.nav}>
            {(
              [
                { label: "Today", icon: "grid-outline" },
                { label: "Train", icon: "football-outline" },
                { label: "Progress", icon: "stats-chart-outline" },
                { label: "Profile", icon: "person-outline" },
              ] as { label: string; icon: Icon }[]
            ).map((t) => (
              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: tab === t.label }}
                key={t.label}
                onPress={() => {
                  setTab(t.label);
                  close();
                }}
                style={s.navItem}
              >
                <Ionicons
                  name={t.icon}
                  size={23}
                  color={tab === t.label ? C.lime : C.muted}
                />
                <Text
                  style={{
                    color: tab === t.label ? C.lime : C.muted,
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
function RoutineCard({
  routine,
  onStart,
}: {
  routine: Routine;
  onStart: () => void;
}) {
  const list = phases(routine);
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.iconBox}>
          <Ionicons name="football-outline" size={25} color={C.lime} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.h3}>{routine.name}</Text>
          <Text style={s.tiny}>
            {Math.ceil(list.reduce((a, p) => a + p.seconds, 0) / 60)} min ·{" "}
            {routine.exercises.length} exercises
          </Text>
        </View>
      </View>
      {routine.exercises.map((e) => (
        <Text key={e.id} style={s.body}>
          {e.name} · {e.sets} × {e.reps} · {e.work}s work
          {e.distance ? ` · ${e.distance} m` : ""}
        </Text>
      ))}
      <Button title="Start session →" onPress={onStart} />
    </View>
  );
}
function FormHead({
  title,
  onCancel,
}: {
  title: string;
  onCancel: () => void;
}) {
  return (
    <>
      <TouchableOpacity onPress={onCancel}>
        <Text style={s.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.title}>{title}</Text>
    </>
  );
}
function ProfileForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: Profile;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [p, set] = useState(profile);
  return (
    <>
      <FormHead title="Your player." onCancel={onCancel} />
      {(["name", "dob", "position", "foot", "goal"] as const).map((k) => (
        <Field
          key={k}
          label={
            {
              name: "Player name",
              dob: "Date of birth (YYYY-MM-DD)",
              position: "Playing position",
              foot: "Preferred foot",
              goal: "Training goal",
            }[k]
          }
          value={p[k]}
          onChange={(v) => set({ ...p, [k]: v })}
        />
      ))}
      <Text style={s.body}>
        For a child, an adult should own and manage this profile.
      </Text>
      <Button
        title="Save profile"
        onPress={() => {
          if (!p.name.trim() || !validDob(p.dob))
            return notify("Enter a name and a valid date of birth.");
          onSave({ ...p, name: p.name.trim() });
        }}
      />
    </>
  );
}
function RoutineForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Routine | null;
  onSave: (r: Routine) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || ""),
    [items, setItems] = useState<Exercise[]>(initial?.exercises || []),
    [fields, set] = useState({
      name: "",
      sets: "3",
      reps: "5",
      work: "30",
      rest: "30",
      setRest: "120",
      distance: "",
    });
  function add() {
    const nums = ["sets", "reps", "work"] as const;
    if (
      !fields.name.trim() ||
      nums.some((k) => !positive(fields[k])) ||
      ["sets", "reps"].some(
        (k) => !Number.isInteger(Number(fields[k as keyof typeof fields])),
      ) ||
      ["rest", "setRest"].some(
        (k) =>
          fields[k as keyof typeof fields].trim() === "" ||
          !Number.isFinite(Number(fields[k as keyof typeof fields])) ||
          Number(fields[k as keyof typeof fields]) < 0,
      ) ||
      Number(fields.sets) > 20 ||
      Number(fields.reps) > 50 ||
      Number(fields.work) > 3600 ||
      Number(fields.rest) > 3600 ||
      Number(fields.setRest) > 3600 ||
      (fields.distance !== "" && !positive(fields.distance))
    )
      return notify(
        "Use a name, whole sets (1–20), whole reps (1–50), work time (1–3600 sec), and recovery (0–3600 sec). Distance is optional.",
      );
    setItems([
      ...items,
      {
        id: uid(),
        name: fields.name.trim(),
        sets: +fields.sets,
        reps: +fields.reps,
        work: +fields.work,
        rest: +fields.rest,
        setRest: +fields.setRest,
        distance: fields.distance ? +fields.distance : undefined,
      },
    ]);
    set({ ...fields, name: "" });
  }
  return (
    <>
      <FormHead title="Build your session." onCancel={onCancel} />
      <Field label="Routine name" value={name} onChange={setName} />
      {items.map((e, i) => (
        <View key={e.id} style={s.card}>
          <Text style={s.h3}>
            {i + 1}. {e.name}
          </Text>
          <Text style={s.body}>
            {e.sets} × {e.reps} · {e.work}s work · {e.rest}s / {e.setRest}s rest
          </Text>
          <TouchableOpacity
            onPress={() => setItems(items.filter((x) => x.id !== e.id))}
          >
            <Text style={s.delete}>Remove exercise</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={s.card}>
        <Text style={s.h2}>Add exercise</Text>
        {Object.entries(fields).map(([k, v]) => (
          <Field
            key={k}
            label={
              {
                name: "Exercise name",
                sets: "Sets",
                reps: "Repetitions per set",
                work: "Work duration (seconds)",
                rest: "Rest between repetitions (seconds)",
                setRest: "Rest between sets (seconds)",
                distance: "Distance (m, optional)",
              }[k]!
            }
            value={v}
            numeric={k !== "name"}
            onChange={(v) => set({ ...fields, [k]: v })}
          />
        ))}
        <Button title="Add exercise to routine" secondary onPress={add} />
      </View>
      <Button
        title="Save routine"
        onPress={() => {
          if (!name.trim() || !items.length)
            return notify("Name the routine and add at least one exercise.");
          onSave({
            id: initial?.id || uid(),
            name: name.trim(),
            exercises: items,
          });
        }}
      />
    </>
  );
}
function Timer({
  routine,
  onCancel,
  onDone,
}: {
  routine: Routine;
  onCancel: () => void;
  onDone: (seconds: number) => void;
}) {
  const list = useRef(phases(routine)).current,
    [index, setIndex] = useState(0),
    [remaining, setRemaining] = useState(list[0].seconds),
    [running, setRunning] = useState(false),
    [finished, setFinished] = useState(false),
    [confirm, setConfirm] = useState(false);
  const clock = useRef(Date.now()),
    elapsed = useRef(0),
    state = useRef({ index: 0, remaining: list[0].seconds });
  const cue = (text: string) => {
    Vibration.vibrate(250);
    Speech.speak(text);
  };
  useEffect(() => {
    if (!running) return;
    clock.current = Date.now();
    const tick = () => {
      const now = Date.now(),
        delta = Math.floor((now - clock.current) / 1000);
      if (delta < 1) return;
      clock.current += delta * 1000;
      const prev = state.current;
      const next = elapsedPhase(list, prev.index, prev.remaining, delta);
      elapsed.current += Math.min(
        delta,
        list
          .slice(prev.index + 1)
          .reduce((a, p) => a + p.seconds, prev.remaining),
      );
      state.current = next;
      setIndex(next.index);
      setRemaining(next.remaining);
      if (next.done) {
        setRunning(false);
        setFinished(true);
        cue("Session complete");
      } else if (next.index !== prev.index)
        cue(list[next.index].label === "WORK" ? "Work" : "Recover");
    };
    const id = setInterval(tick, 250);
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [running, list]);
  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  const p = list[index];
  return (
    <>
      <Text style={s.eyebrow}>{routine.name}</Text>
      <Text style={s.title}>{finished ? "Great work." : p.exercise}</Text>
      <View
        style={[
          s.card,
          {
            alignItems: "center",
            paddingVertical: 44,
            borderColor: p.recovery ? C.blue : C.lime,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[s.eyebrow, { color: p.recovery ? C.blue : C.lime }]}>
          {finished ? "SESSION COMPLETE" : p.label}
        </Text>
        <Text style={s.timer}>{fmt(remaining)}</Text>
        <Text style={s.body}>
          Set {p.set} · Rep {p.rep}
        </Text>
        <Text style={s.tiny}>
          Phase {index + 1} of {list.length}
        </Text>
      </View>
      <Text style={s.body}>
        Sound and vibration cues are enabled. Background notification delivery
        is not guaranteed; keep the app visible during timed work.
      </Text>
      {finished ? (
        <Button
          title="Save & rate session"
          onPress={() => onDone(elapsed.current)}
        />
      ) : (
        <>
          <Button
            title={running ? "Pause" : "Start / resume"}
            onPress={() => {
              if (!running) cue(p.recovery ? "Recover" : "Work");
              setRunning(!running);
            }}
          />
          <Button
            title="Skip current interval"
            secondary
            onPress={() => {
              if (index === list.length - 1) {
                setFinished(true);
                setRunning(false);
                setRemaining(0);
              } else {
                const n = index + 1;
                state.current = { index: n, remaining: list[n].seconds };
                setIndex(n);
                setRemaining(list[n].seconds);
                clock.current = Date.now();
                cue(list[n].recovery ? "Recover" : "Work");
              }
            }}
          />
        </>
      )}
      {confirm ? (
        <View style={s.card}>
          <Text style={s.body}>
            Save the work completed so far or discard this session?
          </Text>
          <Button
            title="Finish early & save"
            onPress={() => onDone(elapsed.current)}
          />
          <Button title="Discard session" secondary onPress={onCancel} />
          <Button
            title="Continue training"
            secondary
            onPress={() => setConfirm(false)}
          />
        </View>
      ) : (
        <Button
          title="End session"
          secondary
          onPress={() => {
            setRunning(false);
            setConfirm(true);
          }}
        />
      )}
    </>
  );
}
function SessionForm({
  draft,
  onSave,
  onCancel,
}: {
  draft: { routine: string; seconds: number } | null;
  onSave: (v: Session) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(draft?.routine || ""),
    [minutes, setMinutes] = useState(
      draft ? String(Math.round((draft.seconds / 60) * 100) / 100) : "30",
    ),
    [effort, setEffort] = useState("5"),
    [fatigue, setFatigue] = useState("3"),
    [notes, setNotes] = useState("");
  return (
    <>
      <FormHead title="Session in the bank." onCancel={onCancel} />
      <Field label="Session name" value={name} onChange={setName} />
      <Field
        label="Duration (minutes)"
        value={minutes}
        onChange={setMinutes}
        numeric
      />
      <Text style={s.label}>Effort · 1 easy, 10 maximum</Text>
      <Chips
        values={Array.from({ length: 10 }, (_, i) => String(i + 1))}
        selected={effort}
        onSelect={setEffort}
      />
      <Text style={s.label}>Fatigue · 1 fresh, 10 exhausted</Text>
      <Chips
        values={Array.from({ length: 10 }, (_, i) => String(i + 1))}
        selected={fatigue}
        onSelect={setFatigue}
      />
      <Field
        label="Notes (how it felt, discomfort, conditions)"
        value={notes}
        onChange={setNotes}
        multiline
      />
      <Button
        title="Save session"
        onPress={() => {
          if (!name.trim() || !positive(minutes) || +minutes > 1440)
            return notify(
              "Enter a session name and duration between 0 and 1440 minutes.",
            );
          onSave({
            id: uid(),
            date: today(),
            routine: name.trim(),
            seconds: Math.round(+minutes * 60),
            effort: +effort,
            fatigue: +fatigue,
            notes,
          });
        }}
      />
    </>
  );
}
function ResultForm({
  onSave,
  onCancel,
}: {
  onSave: (r: Result) => void;
  onCancel: () => void;
}) {
  const [metric, setMetric] = useState("sprint20"),
    [value, setValue] = useState(""),
    [method, setMethod] = useState("Hand timing"),
    [date, setDate] = useState(today()),
    [cooper, setCooper] = useState(false);
  return (
    <>
      <FormHead title="Mark your progress." onCancel={onCancel} />
      <Text style={s.label}>Performance test</Text>
      <Chips
        values={Object.keys(metrics).map((k) => metrics[k].label)}
        selected={metrics[metric].label}
        onSelect={(v) => {
          const k = Object.keys(metrics).find((k) => metrics[k].label === v)!;
          setMetric(k);
          setValue("");
          setCooper(false);
          setMethod(
            k === "vo2"
              ? "Wearable estimate"
              : k === "yoyo"
                ? "Yo-Yo IR1 protocol"
                : k === "speed"
                  ? "GPS device"
                  : k === "recovery"
                    ? "Heart-rate monitor"
                    : "Hand timing",
          );
        }}
      />
      {metric === "vo2" && (
        <>
          <Text style={s.body}>
            Estimates are not laboratory measurements. A field-test equation may
            not be validated for a child's age or ability. Use an appropriate
            supervised test.
          </Text>
          <Chips
            values={["Enter estimate", "Cooper 12-min estimate"]}
            selected={cooper ? "Cooper 12-min estimate" : "Enter estimate"}
            onSelect={(v) => {
              setCooper(v.startsWith("Cooper"));
              setMethod(
                v.startsWith("Cooper")
                  ? "Cooper 12-minute equation"
                  : "Wearable estimate",
              );
              setValue("");
            }}
          />
        </>
      )}
      {metric === "repeat" && (
        <Text style={s.body}>
          Enter mean sprint time. Record distance, repetition count, and rest
          protocol in the method so future tests match.
        </Text>
      )}
      {metric === "recovery" && (
        <Text style={s.body}>
          Enter heart rate at exercise end minus heart rate after one minute.
          Keep recovery conditions consistent.
        </Text>
      )}
      <Field
        label={
          cooper
            ? "Distance covered in 12 minutes (m)"
            : `${metrics[metric].label} (${metrics[metric].unit})`
        }
        value={value}
        onChange={setValue}
        numeric
      />
      <Field label="Test date (YYYY-MM-DD)" value={date} onChange={setDate} />
      <Field
        label="Measurement method / device / protocol"
        value={method}
        onChange={setMethod}
      />
      <Text style={s.body}>
        Repeat the same protocol and conditions. Phone GPS and hand timing may
        miss small changes in short sprints.
      </Text>
      <Button
        title="Save result"
        onPress={() => {
          if (!positive(value) || !validDob(date) || !method.trim())
            return notify(
              "Enter a positive result, a valid date no later than today, and the measurement method.",
            );
          let n = +value;
          try {
            if (cooper) n = vo2Cooper(n);
          } catch (e) {
            return notify((e as Error).message);
          }
          onSave({ id: uid(), date, metric, value: n, method: method.trim() });
        }}
      />
    </>
  );
}
function MeasureForm({
  adult,
  onSave,
  onCancel,
}: {
  adult: boolean;
  onSave: (m: Measurement) => void;
  onCancel: () => void;
}) {
  const [height, H] = useState(""),
    [weight, W] = useState(""),
    [waist, S] = useState(""),
    [date, D] = useState(today());
  return (
    <>
      <FormHead title="Growing stronger." onCancel={onCancel} />
      <Field label="Measurement date (YYYY-MM-DD)" value={date} onChange={D} />
      <Field label="Height (cm)" value={height} onChange={H} numeric />
      <Field label="Weight (kg)" value={weight} onChange={W} numeric />
      {adult && (
        <Field
          label="Waist (cm, optional)"
          value={waist}
          onChange={S}
          numeric
        />
      )}
      <Text style={s.body}>
        Measurements are context, not targets. For children, discuss growth or
        nutrition concerns with a qualified professional.
      </Text>
      <Button
        title="Save measurements"
        onPress={() => {
          if (
            !positive(height) ||
            !positive(weight) ||
            +height > 280 ||
            +weight > 500 ||
            !validDob(date) ||
            (waist && !positive(waist))
          )
            return notify(
              "Enter valid positive measurements and a date no later than today.",
            );
          onSave({
            id: uid(),
            date,
            height: +height,
            weight: +weight,
            ...(adult && waist ? { waist: +waist } : {}),
          });
        }}
      />
    </>
  );
}
function Progress({
  data,
  onAdd,
  onDelete,
}: {
  data: State;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const [metric, M] = useState("sprint20"),
    [period, P] = useState("All time"),
    [method, S] = useState("");
  const methods = Array.from(
    new Set(
      data.results.filter((r) => r.metric === metric).map((r) => r.method),
    ),
  );
  const selected = methods.includes(method) ? method : methods[0] || "";
  const days = period === "30 days" ? 30 : period === "90 days" ? 90 : Infinity;
  const c = comparison(
    data.results.filter(
      (r) => Date.parse(r.date) >= Date.now() - days * 86400000,
    ),
    metric,
    selected,
  );
  return (
    <>
      <Text style={s.eyebrow}>YOU VS. YOUR YESTERDAY</Text>
      <Text style={s.title}>See the difference.</Text>
      <Button title="+ Record a test" onPress={onAdd} />
      <Chips
        values={Object.values(metrics).map((v) => v.label)}
        selected={metrics[metric].label}
        onSelect={(v) =>
          M(Object.keys(metrics).find((k) => metrics[k].label === v)!)
        }
      />
      <Chips
        values={["30 days", "90 days", "All time"]}
        selected={period}
        onSelect={P}
      />
      {methods.length > 0 && (
        <>
          <Text style={s.label}>Compare the same measurement method</Text>
          <Chips values={methods} selected={selected} onSelect={S} />
        </>
      )}
      {c ? (
        <>
          <View style={s.card}>
            <Text style={s.h2}>{metrics[metric].label}</Text>
            <Text style={s.heroNumber}>
              {c.latest} <Text style={s.tiny}>{metrics[metric].unit}</Text>
            </Text>
            <Text style={s.body}>
              Starting {c.first} · Personal best {c.best}
            </Text>
            <Text
              style={{
                color: c.change >= 0 ? C.lime : "#FFBC9A",
                fontSize: 18,
              }}
            >
              {c.points.length < 2
                ? "Add another result to see change"
                : `${c.change > 0 ? "+" : ""}${c.change.toFixed(2)} improvement`}
            </Text>
            <Text style={s.tiny}>
              {metric === "vo2" ? "Estimated · " : ""}
              {selected}
            </Text>
            <ScrollView
              horizontal
              contentContainerStyle={{
                alignItems: "flex-end",
                height: 160,
                gap: 12,
                paddingTop: 20,
              }}
            >
              {c.points.map((r) => (
                <View key={r.id} style={{ alignItems: "center", width: 62 }}>
                  <Text style={s.tiny}>{r.value}</Text>
                  <View
                    style={{
                      width: 26,
                      borderRadius: 7,
                      backgroundColor: C.lime,
                      height: Math.max(
                        8,
                        (100 * r.value) /
                          Math.max(...c.points.map((x) => x.value)),
                      ),
                    }}
                  />
                  <Text style={[s.tiny, { fontSize: 9, marginTop: 8 }]}>
                    {r.date.slice(5)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text style={[s.tiny, { marginTop: 12 }]}>
              {metrics[metric].lower
                ? "Lower values are better."
                : "Higher values are better."}{" "}
              Bars show recorded results.
            </Text>
          </View>
          {c.points
            .slice()
            .reverse()
            .map((r) => (
              <View style={s.card} key={r.id}>
                <View style={s.section}>
                  <Text style={s.h3}>
                    {r.value} {metrics[metric].unit}
                  </Text>
                  <Text style={s.tiny}>{r.date}</Text>
                </View>
                <Text style={s.tiny}>{r.method}</Text>
                <TouchableOpacity onPress={() => onDelete(r.id)}>
                  <Text style={s.delete}>Remove result</Text>
                </TouchableOpacity>
              </View>
            ))}
        </>
      ) : (
        <View style={s.card}>
          <Ionicons name="trending-up" size={40} color={C.lime} />
          <Text style={s.h2}>Your starting line.</Text>
          <Text style={s.body}>
            No results in this period. Record a test, then repeat it using the
            same method to follow your progress.
          </Text>
        </View>
      )}
      <Text style={s.h2}>Training consistency</Text>
      <Text style={s.body}>
        {
          data.sessions.filter(
            (x) => Date.parse(x.date) >= Date.now() - days * 86400000,
          ).length
        }{" "}
        sessions in this period
      </Text>
      <Text style={s.tiny}>
        Fitness changes with growth, recovery, and testing conditions. These
        results support training decisions, not medical diagnosis.
      </Text>
    </>
  );
}
function Restore({
  onSave,
  onCancel,
}: {
  onSave: (s: State) => void;
  onCancel: () => void;
}) {
  const [raw, R] = useState("");
  return (
    <>
      <FormHead title="Restore your backup." onCancel={onCancel} />
      <Text style={s.body}>
        Paste an exported Touchline JSON backup. Restoring replaces all current
        data.
      </Text>
      <Field label="Backup JSON" value={raw} onChange={R} multiline />
      <Button
        title="Replace data from backup"
        onPress={() => {
          try {
            const parsed = validateBackup(raw);
            onSave(parsed);
          } catch {
            notify("This backup is invalid or uses an unsupported version.");
          }
        }}
      />
    </>
  );
}
import { validateBackup } from "./src/backup";
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === "android" ? NativeStatusBar.currentHeight : 0,
  },
  app: { flex: 1, width: "100%", maxWidth: 740, alignSelf: "center" },
  brand: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: C.line,
    borderBottomWidth: 1,
  },
  brandText: {
    color: C.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 3,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  local: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, backgroundColor: C.lime, borderRadius: 3 },
  content: { padding: 24, paddingBottom: 40 },
  eyebrow: {
    color: C.lime,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    color: C.text,
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 43,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  body: { color: C.muted, fontSize: 14, lineHeight: 23, marginBottom: 12 },
  h2: {
    color: C.text,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  h3: { color: C.text, fontSize: 17, fontWeight: "700", marginBottom: 6 },
  card: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 22,
    marginVertical: 10,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  badge: { color: C.lime, fontSize: 9, letterSpacing: 1.5, fontWeight: "700" },
  button: {
    backgroundColor: C.lime,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 8,
    minHeight: 52,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: C.line,
  },
  buttonText: { color: C.bg, fontSize: 14, fontWeight: "800" },
  heroNumber: {
    color: C.text,
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 10,
  },
  tiny: { color: C.muted, fontSize: 11, lineHeight: 17 },
  grid: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, padding: 18 },
  label: { color: C.muted, fontSize: 12, marginBottom: 8, marginTop: 10 },
  statNumber: { fontSize: 32, fontWeight: "800", color: C.text },
  iconBox: {
    backgroundColor: "#26382B",
    padding: 13,
    borderRadius: 15,
    marginBottom: 12,
  },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 13,
    paddingBottom: 17,
    backgroundColor: C.bg,
  },
  navItem: { flex: 1, alignItems: "center", padding: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 15,
    color: C.text,
    fontSize: 16,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 10 },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  delete: { color: "#E6AA90", fontSize: 12, paddingVertical: 12 },
  back: { color: C.lime, marginBottom: 24, fontSize: 15 },
  timer: {
    color: C.text,
    fontSize: 76,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginVertical: 24,
  },
});
