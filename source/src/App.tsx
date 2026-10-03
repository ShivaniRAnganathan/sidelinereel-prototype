import * as React from "react"
import { RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { TEAM } from "@/data"
import { DemoProvider, useDemo } from "@/store"
import { CoachView } from "@/views/coach-view"
import { ParentView } from "@/views/parent-view"
import { RecapView } from "@/views/recap-view"

const EXPLAIN: Record<string, string> = {
  coach: "Coach checks only the clips the model isn't sure about.",
  parent: "Parents only see coach-checked or 90%+ clips, and can flag one that isn't their kid.",
  recap: "The recap always sends on time. Unchecked clips are held, never guessed.",
}

function Shell() {
  const { clips, dispatch } = useDemo()
  const initialTab = new URLSearchParams(location.search).get("view") ?? "coach"
  const [tab, setTab] = React.useState(initialTab)
  const [parentKid, setParentKid] = React.useState("k14")
  const pending = clips.filter((c) => c.status === "review").length

  return (
    <div className="min-h-svh bg-muted/40 py-0 sm:py-6">
      <div className="mx-auto flex min-h-svh w-full max-w-[390px] flex-col bg-background sm:min-h-[780px] sm:rounded-[28px] sm:shadow-xl sm:ring-1 sm:ring-foreground/10">
        <header className="flex items-center gap-2 px-4 pt-4 pb-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            ▶
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-sm font-semibold">SidelineReel</div>
            <div className="truncate text-xs text-muted-foreground">{TEAM}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              dispatch({ type: "reset" })
              setParentKid("k14")
              toast("Demo reset.")
            }}
          >
            <RotateCcwIcon /> Reset demo
          </Button>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 px-4 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="coach">
              Coach
              {pending > 0 && (
                <Badge className="h-4 min-w-4 px-1 text-[10px] tabular-nums">{pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="parent">Parent</TabsTrigger>
            <TabsTrigger value="recap">Sunday recap</TabsTrigger>
          </TabsList>
          <p className="px-1 text-xs text-muted-foreground">{EXPLAIN[tab]}</p>
          <TabsContent value="coach">
            <CoachView />
          </TabsContent>
          <TabsContent value="parent">
            <ParentView kidId={parentKid} onKidChange={setParentKid} />
          </TabsContent>
          <TabsContent value="recap">
            <RecapView />
          </TabsContent>
        </Tabs>
        <footer className="px-4 pb-4 text-center text-[11px] text-muted-foreground">
          Prototype · demo data · by Ajaia
        </footer>
      </div>
      <Toaster position="top-center" richColors={false} />
    </div>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <Shell />
    </DemoProvider>
  )
}
