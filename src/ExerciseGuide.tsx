import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Exercise } from "./domain";
import { guideForExercise } from "./exercises";
const images = {
  sprint: require("../assets/exercises/sprint.png"),
  dribble: require("../assets/exercises/dribble.png"),
  shuttle: require("../assets/exercises/shuttle.png"),
  interval: require("../assets/exercises/interval.png"),
  turn: require("../assets/exercises/turn.png"),
  endurance: require("../assets/exercises/endurance.png"),
};
export function ExerciseGuide({
  exercise,
  expanded = false,
}: {
  exercise: Pick<Exercise, "name" | "guideId" | "distance">;
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(expanded);
  const [imageWidth, setImageWidth] = useState(300);
  const guide = guideForExercise(exercise);
  const text = { color: "#9BAEA1", fontSize: 13, lineHeight: 21 } as const;
  return (
    <View
      style={{
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#293D31",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`How to do ${exercise.name}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{
          padding: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Text
          style={{ color: "#CEFA69", fontSize: 13, fontWeight: "700", flex: 1 }}
        >
          How to do it · {guide?.title || "Custom exercise"}
        </Text>
        <Text style={{ color: "#CEFA69" }}>{open ? "−" : "+"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ padding: 14, paddingTop: 0 }}>
          {guide ? (
            <>
              <Image
                source={images[guide.image]}
                onLayout={(event) =>
                  setImageWidth(event.nativeEvent.layout.width)
                }
                accessibilityLabel={`${guide.title}: orange cones mark the drill endpoints and lime arrows show the movement direction. Schematic illustration; see measured setup below.`}
                style={{
                  width: "100%",
                  height: (imageWidth * 360) / 760,
                  borderRadius: 12,
                  backgroundColor: "#14231C",
                }}
                resizeMode="contain"
              />
              <Text style={[text, { fontSize: 10, marginVertical: 8 }]}>
                ILLUSTRATION · Orange cones = markers · Arrows = movement · Not
                to scale
              </Text>
              <Text
                style={{ color: "#F3F7EF", fontWeight: "700", marginBottom: 6 }}
              >
                Set up the cones
              </Text>
              <Text style={text}>{guide.setup(exercise.distance)}</Text>
              <Text
                style={{
                  color: "#F3F7EF",
                  fontWeight: "700",
                  marginTop: 14,
                  marginBottom: 6,
                }}
              >
                How to move
              </Text>
              {guide.steps.map((step, i) => (
                <Text key={step} style={[text, { marginBottom: 7 }]}>
                  {i + 1}. {step}
                </Text>
              ))}
              <View
                style={{
                  backgroundColor: "#243329",
                  padding: 12,
                  borderRadius: 12,
                  marginTop: 8,
                }}
              >
                <Text style={[text, { color: "#CEFA69" }]}>{guide.tip}</Text>
              </View>
            </>
          ) : (
            <Text style={text}>
              This custom drill has no standard guide attached. Choose a preset
              in the routine builder for illustrated instructions, or ask your
              coach to define the setup, movement, and safe recovery.
            </Text>
          )}
          <Text style={[text, { fontSize: 11, marginTop: 12 }]}>
            Warm up first. Children should train with adult supervision. Use a
            clear, level surface and stop if there is pain or dizziness. Presets
            are starting points: adjust them to age and ability.
          </Text>
        </View>
      )}
    </View>
  );
}
