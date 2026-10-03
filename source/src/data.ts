export type Kid = { id: string; num: number; name: string; first: string }

export const COACH = "Coach Daniel"
export const TEAM = "Ridgeline Youth Soccer · U10"
export const GAME = "Sat vs Oak Hollow · uploaded 6:40 PM"
export const SEND_TIME = "Sun 6:00 PM"

export const ROSTER: Kid[] = [
  { id: "k1", num: 1, name: "Leo B.", first: "Leo" },
  { id: "k4", num: 4, name: "Maya R.", first: "Maya" },
  { id: "k7", num: 7, name: "Zoe K.", first: "Zoe" },
  { id: "k9", num: 9, name: "Ella W.", first: "Ella" },
  { id: "k11", num: 11, name: "Arjun M.", first: "Arjun" },
  { id: "k12", num: 12, name: "Sam T.", first: "Sam" },
  { id: "k14", num: 14, name: "Priya S.", first: "Priya" },
  { id: "k21", num: 21, name: "Noah L.", first: "Noah" },
]

// Jersey numbers the model is known to mix up on this roster.
export const CONFUSABLE: Record<string, string[]> = {
  k1: ["k11"],
  k11: ["k1"],
  k4: ["k14"],
  k14: ["k4"],
  k12: ["k21"],
  k21: ["k12"],
}

export const kidById = (id: string) => ROSTER.find((k) => k.id === id)!
export const kidLabel = (id: string) => {
  const k = kidById(id)
  return `#${k.num} ${k.name}`
}

export type ClipStatus = "auto" | "review" | "confirmed" | "reassigned" | "dropped"

export type Clip = {
  id: string
  time: string // game clock
  label: string
  kidId: string // current tag
  guessId: string // what the model (or original tag) said
  confidence: number
  status: ClipStatus
  origin: "model" | "parent" | null // why it entered the coach queue
  reason?: string
  candidates: string[]
  jersey: string // what's legible on the jersey in the thumbnail
  hue: number
  reportedBy?: string
}

export const AUTO_THRESHOLD = 90

const auto = (
  id: string,
  time: string,
  label: string,
  kidId: string,
  confidence: number,
  hue: number
): Clip => ({
  id,
  time,
  label,
  kidId,
  guessId: kidId,
  confidence,
  status: "auto",
  origin: null,
  candidates: [],
  jersey: String(kidById(kidId).num),
  hue,
})

export const INITIAL_CLIPS: Clip[] = [
  {
    id: "f1",
    time: "08:12",
    label: "Breakaway shot",
    kidId: "k4",
    guessId: "k4",
    confidence: 62,
    status: "review",
    origin: "model",
    reason: "Confusable: #4 and #14 both on roster",
    candidates: ["k4", "k14"],
    jersey: "?4",
    hue: 140,
  },
  {
    id: "f2",
    time: "23:40",
    label: "Corner kick assist",
    kidId: "k12",
    guessId: "k12",
    confidence: 58,
    status: "review",
    origin: "model",
    reason: "Swapped digits: #12 and #21 both on roster",
    candidates: ["k12", "k21"],
    jersey: "12?",
    hue: 120,
  },
  {
    id: "f3",
    time: "31:05",
    label: "Header clear",
    kidId: "k1",
    guessId: "k1",
    confidence: 55,
    status: "review",
    origin: "model",
    reason: "Confusable: #1 and #11 both on roster",
    candidates: ["k1", "k11"],
    jersey: "1?",
    hue: 155,
  },
  auto("a1", "02:30", "Goal kick", "k1", 97, 130),
  auto("a2", "05:48", "Through ball", "k4", 93, 145),
  auto("a3", "11:20", "Goal!", "k14", 96, 110),
  auto("a4", "14:02", "Steal at midfield", "k7", 95, 135),
  auto("a5", "17:35", "Cross into the box", "k9", 92, 150),
  auto("a6", "19:10", "Shot on target", "k11", 94, 125),
  auto("a7", "26:55", "Sliding tackle", "k12", 91, 140),
  auto("a8", "29:30", "Header on goal", "k21", 93, 115),
  auto("a9", "34:15", "Dribble past two", "k14", 90, 160),
  auto("a10", "38:40", "Assist", "k4", 95, 130),
]

export const isPublished = (c: Clip) =>
  c.status === "auto" || c.status === "confirmed" || c.status === "reassigned"
