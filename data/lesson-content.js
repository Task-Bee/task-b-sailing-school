window.TASKB_CONTENT = {
  appName: "Task-B Sailing School",
  module: {
    id: "points-of-sail",
    title: "Points of Sail",
    eyebrow: "Instructional Tool",
    intro: "Learn the basic angles a sailing yacht can make to the wind, from the no-go zone to running downwind.",
    startCta: "Start Lesson"
  },
  courses: [
    {
      id: "close-reach",
      label: "Close\nReach",
      shortLabel: "Close Reach",
      angle: 55,
      side: "starboard",
      sail: "tight",
      summary: "A powerful upwind angle, slightly more open than close hauled.",
      learn: [
        "Keep the sails trimmed fairly tight, but not as hard in as close hauled.",
        "The boat should feel driven and efficient without pinching too high into the wind.",
        "Use this angle when you want good speed while still gaining ground to windward."
      ]
    },
    {
      id: "no-go-zone",
      label: "No-Go\nZone",
      shortLabel: "No-Go Zone",
      angle: 0,
      side: "center",
      sail: "flag",
      summary: "The 90° area around the wind direction where a yacht cannot sail efficiently.",
      learn: [
        "In this zone the sails flap and the boat loses drive.",
        "To reach a destination upwind, sail a zig-zag course using tacks.",
        "The orange sector shows roughly 45° either side of the wind direction."
      ]
    },
    {
      id: "close-hauled",
      label: "Close\nHauled",
      shortLabel: "Close Hauled",
      angle: 45,
      side: "starboard",
      sail: "tight",
      summary: "The highest practical sailing angle to the wind for normal upwind sailing.",
      learn: [
        "Sails are trimmed in close to the centreline.",
        "The helmsman balances pointing high with keeping enough speed through the water.",
        "Small steering and trim changes make a big difference here."
      ]
    },
    {
      id: "beam-reach",
      label: "Beam\nReach",
      shortLabel: "Beam Reach",
      angle: 90,
      side: "starboard",
      sail: "middle",
      summary: "The wind comes from roughly the side of the boat. Usually fast, stable and clear for teaching.",
      learn: [
        "Ease the sails until they are powered but not flapping.",
        "This is often one of the easiest angles for students to feel the boat balance.",
        "Good for practising steering, trim and basic manoeuvres."
      ]
    },
    {
      id: "broad-reach",
      label: "Broad\nReach",
      shortLabel: "Broad Reach",
      angle: 135,
      side: "starboard",
      sail: "open",
      summary: "A downwind angle with the wind coming from behind and to one side.",
      learn: [
        "Sails are eased well out to catch the wind efficiently.",
        "The apparent wind feels lighter, so stay aware of true wind and course changes.",
        "Watch accidental gybes when sailing deep angles."
      ]
    },
    {
      id: "run",
      label: "Run",
      shortLabel: "Run",
      angle: 180,
      side: "center",
      sail: "wide",
      summary: "The boat sails directly or almost directly downwind.",
      learn: [
        "The mainsail is eased far out and the headsail may be hidden behind it.",
        "This angle can feel calm, but the boom must be controlled carefully.",
        "A preventer or a safer broad-reaching route may be better in stronger wind."
      ]
    }
  ],
  placeholders: {
    lessons: {
      title: "Lessons are being built",
      body: "For v0.2, unfinished sections point back to the finished Points of Sail prototype so the student journey stays clean."
    },
    progress: {
      title: "Progress tracking comes later",
      body: "The public prototype stores no student personal data. Progress features can be added later as local, anonymous practice states."
    },
    alerts: {
      title: "Alerts come later",
      body: "Weather, safety and instructor notes can become separate modules after the core lesson screens are stable."
    }
  }
};
