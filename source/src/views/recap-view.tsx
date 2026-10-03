import { CircleCheckIcon, ClockIcon, PauseCircleIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"

import { KidAvatar } from "@/components/kid-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { COACH, kidById, kidLabel, ROSTER, SEND_TIME, type Clip } from "@/data"
import { reelFor, useDemo } from "@/store"

export function RecapView() {
  const { clips, sent, dispatch } = useDemo()
  const perKid = sent
    ? sent.perKid
    : ROSTER.map((k) => ({ kidId: k.id, count: reelFor(clips, k.id).length }))
  const held = sent ? sent.held : clips.filter((c) => c.status === "review")
  const total = perKid.reduce((n, k) => n + k.count, 0)

  return (
    <div className="flex flex-col gap-4">
      {sent ? (
        <Card size="sm" className="border-emerald-200 bg-emerald-50/60" data-testid="sent-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CircleCheckIcon className="size-5 text-emerald-600" />
              <CardTitle>Sent {SEND_TIME}, on time</CardTitle>
            </div>
            <CardDescription>
              {sent.families} families got their recap. {total} clips sent.{" "}
              {held.length > 0
                ? `${held.length} held back, not sent as a guess.`
                : "Nothing held."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="sm" variant="outline" onClick={() => dispatch({ type: "unsend" })}>
              Back to preview
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card size="sm">
          <CardHeader>
            <CardTitle>What goes out Sunday</CardTitle>
            <CardDescription>
              Sends {SEND_TIME} whether or not every clip is checked.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                dispatch({ type: "send" })
                toast.success(
                  `Recap sent to ${ROSTER.length} families.` +
                    (held.length ? ` ${held.length} held, not sent.` : "")
                )
              }}
            >
              <ClockIcon /> Simulate send time
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SendIcon className="size-4" /> {sent ? "Sent" : "Going out"} · {total} clips
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-0">
          {perKid.map(({ kidId, count }, i) => (
            <div key={kidId}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 py-2 text-sm" data-testid={`recap-${kidId}`}>
                <KidAvatar kidId={kidId} />
                <span className="flex-1">{kidById(kidId).name}</span>
                <Badge variant={count ? "secondary" : "outline"} className="tabular-nums">
                  {count} {count === 1 ? "clip" : "clips"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PauseCircleIcon className="size-4" /> Held, not sent as a guess · {held.length}
          </CardTitle>
          <CardDescription>
            {held.length
              ? `Still waiting on ${COACH}. Once checked, they join the kid's reel.`
              : "Nothing held. Every flagged clip was checked."}
          </CardDescription>
        </CardHeader>
        {held.length > 0 && (
          <CardContent className="gap-2">
            {held.map((c) => (
              <HeldRow key={c.id} clip={c} />
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function HeldRow({ clip }: { clip: Clip }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm" data-testid={`held-${clip.id}`}>
      <span className="w-11 font-mono text-xs text-muted-foreground">{clip.time}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{clip.label}</span>
        <span className="block text-xs text-muted-foreground">
          {clip.origin === "parent"
            ? `Parent report on ${kidLabel(clip.guessId)}`
            : `Guess ${kidLabel(clip.guessId)}, ${clip.confidence}%`}
        </span>
      </span>
      <Badge variant="outline">Held</Badge>
    </div>
  )
}
