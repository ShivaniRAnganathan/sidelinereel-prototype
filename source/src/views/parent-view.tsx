import { FlagIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { ClipThumb } from "@/components/clip-thumb"
import { KidAvatar } from "@/components/kid-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AUTO_THRESHOLD, COACH, GAME, kidById, ROSTER, type Clip } from "@/data"
import { reelFor, useDemo } from "@/store"

export function ParentView({
  kidId,
  onKidChange,
}: {
  kidId: string
  onKidChange: (id: string) => void
}) {
  const { clips } = useDemo()
  const kid = kidById(kidId)
  const reel = reelFor(clips, kidId)
  // Cover only ever uses a clip that is coach-confirmed or high-confidence.
  const cover =
    reel.find((c) => c.status !== "auto") ??
    [...reel].sort((a, b) => b.confidence - a.confidence).find((c) => c.confidence >= AUTO_THRESHOLD)
  const checking = clips.filter((c) => c.status === "review").length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Viewing as</span>
        <Select value={kidId} onValueChange={onKidChange}>
          <SelectTrigger size="sm" className="flex-1" aria-label="Parent of">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROSTER.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.first}'s parent (#{k.num})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card size="sm" className="pt-0">
        {cover ? (
          <ClipThumb jersey={cover.jersey} hue={cover.hue} big className="aspect-video w-full rounded-none" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
            No clips yet
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <KidAvatar kidId={kidId} />
            <CardTitle>
              {kid.first}'s reel · {reel.length} {reel.length === 1 ? "clip" : "clips"}
            </CardTitle>
          </div>
          <CardDescription>{GAME}</CardDescription>
        </CardHeader>
      </Card>

      {reel.length === 0 && (
        <p className="px-1 text-sm text-muted-foreground">No clips in {kid.first}'s reel right now.</p>
      )}

      {reel.map((c) => (
        <ReelClip key={c.id} clip={c} kidId={kidId} />
      ))}

      {checking > 0 && (
        <p className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
          <ShieldCheckIcon className="mt-px size-4 shrink-0" />
          {COACH} is still checking {checking} team {checking === 1 ? "clip" : "clips"}. We only add
          a clip once we're sure who's in it.
        </p>
      )}
    </div>
  )
}

function ReelClip({ clip, kidId }: { clip: Clip; kidId: string }) {
  const { dispatch } = useDemo()
  const kid = kidById(kidId)
  return (
    <Card size="sm" data-testid={`reel-${clip.id}`}>
      <CardContent className="flex-row gap-3">
        <ClipThumb jersey={clip.jersey} hue={clip.hue} time={clip.time} className="h-18 w-28 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <div className="text-sm font-medium">{clip.label}</div>
          {clip.status === "auto" ? (
            <Badge variant="secondary">Auto-tagged</Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
              <ShieldCheckIcon /> Coach checked
            </Badge>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="xs" variant="outline" className="mt-auto">
                <FlagIcon /> This isn't my kid
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Not {kid.first} in this clip?</AlertDialogTitle>
                <AlertDialogDescription>
                  We'll take it out of {kid.first}'s reel now and ask {COACH} to check who it is.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    dispatch({ type: "parentReport", id: clip.id, parentOf: kidId })
                    toast(`Removed. ${COACH} will check it.`)
                  }}
                >
                  Remove clip
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
