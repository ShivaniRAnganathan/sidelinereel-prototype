import * as React from "react"
import {
  CONFUSABLE,
  INITIAL_CLIPS,
  isPublished,
  kidById,
  ROSTER,
  type Clip,
} from "@/data"

export type RecapSnapshot = {
  perKid: { kidId: string; count: number }[]
  held: Clip[]
  families: number
}

type State = { clips: Clip[]; sent: RecapSnapshot | null }

type Action =
  | { type: "confirm"; id: string }
  | { type: "reassign"; id: string; kidId: string }
  | { type: "drop"; id: string }
  | { type: "undo"; id: string }
  | { type: "parentReport"; id: string; parentOf: string }
  | { type: "send" }
  | { type: "unsend" }
  | { type: "reset" }

const initial = (): State => ({
  clips: INITIAL_CLIPS.map((c) => ({ ...c })),
  sent: null,
})

export function reelFor(clips: Clip[], kidId: string) {
  return clips.filter((c) => c.kidId === kidId && isPublished(c))
}

function reducer(state: State, a: Action): State {
  const patch = (id: string, p: Partial<Clip>) => ({
    ...state,
    clips: state.clips.map((c) => (c.id === id ? { ...c, ...p } : c)),
  })
  switch (a.type) {
    case "confirm": {
      const c = state.clips.find((x) => x.id === a.id)!
      return patch(a.id, { status: "confirmed", kidId: c.guessId })
    }
    case "reassign":
      return patch(a.id, { status: "reassigned", kidId: a.kidId })
    case "drop":
      return patch(a.id, { status: "dropped" })
    case "undo": {
      const c = state.clips.find((x) => x.id === a.id)!
      return patch(a.id, { status: "review", kidId: c.guessId })
    }
    case "parentReport": {
      const c = state.clips.find((x) => x.id === a.id)!
      const kid = kidById(a.parentOf)
      return patch(a.id, {
        status: "review",
        origin: "parent",
        guessId: c.kidId,
        reportedBy: a.parentOf,
        reason: `${kid.first}'s parent says this isn't ${kid.first}`,
        candidates: [c.kidId, ...(CONFUSABLE[c.kidId] ?? [])],
        jersey: c.jersey,
      })
    }
    case "send":
      return {
        ...state,
        sent: {
          perKid: ROSTER.map((k) => ({
            kidId: k.id,
            count: reelFor(state.clips, k.id).length,
          })),
          held: state.clips.filter((c) => c.status === "review"),
          families: ROSTER.length,
        },
      }
    case "unsend":
      return { ...state, sent: null }
    case "reset":
      return initial()
  }
}

type Ctx = State & { dispatch: React.Dispatch<Action> }
const DemoContext = React.createContext<Ctx | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initial)
  return (
    <DemoContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DemoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const ctx = React.useContext(DemoContext)
  if (!ctx) throw new Error("useDemo outside provider")
  return ctx
}
