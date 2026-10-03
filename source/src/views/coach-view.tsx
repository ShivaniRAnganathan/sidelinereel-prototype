import * as React from "react"
import {
  ArrowLeftRightIcon,
  CheckIcon,
  ChevronDownIcon,
  FlagIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { GAME, kidById, kidLabel, ROSTER, SEND_TIME, type Clip } from "@/data"
import { useDemo } from "@/store"

export function CoachView() {
  const { clips, sent } = useDemo()
  const queue = clips.filter((c) => c.origin !== null)
  const pending = queue.filter((c) => c.status === "review")
  const reviewed = queue.filter((c) => c.status !== "review")
  const autoClips = clips.filter((c) => c.status === "auto")
  const pct = queue.length ? Math.round((reviewed.length / queue.length) * 100) : 100

  // Parent reports first, then by game time.
  const ordered = [...pending].sort(
    (a, b) =>
      Number(b.origin === "parent") - Number(a.origin === "parent") ||
      a.time.localeCompare(b.time)
  )

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardDescription>{GAME}</CardDescription>
          <CardTitle className="text-lg leading-snug">
            {pending.length === 0
              ? "All clear. Sunday's recap is ready."
              : `${pending.length} ${pending.length === 1 ? "clip needs" : "clips need"} your check before Sunday's recap`}
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          <Progress value={pct} aria-label="Reviewed" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {reviewed.length} of {queue.length} reviewed
            </span>
            <span>Recap sends {SEND_TIME}</span>
          </div>
          {sent && pending.length > 0 && (
            <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
              Recap already went out. These clips were held, not sent.
            </p>
          )}
        </CardContent>
      </Card>

      {ordered.map((c) => (
        <ReviewCard key={c.id} clip={c} />
      ))}

      {reviewed.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Reviewed
          </h3>
          <Card size="sm" className="gap-0 py-1">
            {reviewed.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <Separator />}
                <ReviewedRow clip={c} />
              </React.Fragment>
            ))}
          </Card>
        </section>
      )}

      <Collapsible>
        <Card size="sm" className="gap-0 py-0">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 px-4 py-3 text-left text-sm">
            <SparklesIcon className="size-4 text-emerald-600" />
            <span className="flex-1">
              <span className="font-medium">{autoClips.length} clips auto-published</span>
              <span className="block text-xs text-muted-foreground">
                90%+ confident. No check needed.
              </span>
            </span>
            <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <ul className="flex flex-col py-1">
              {autoClips.map((c) => (
                <li key={c.id} className="flex items-center gap-2 px-4 py-1.5 text-sm">
                  <span className="w-11 font-mono text-xs text-muted-foreground">{c.time}</span>
                  <span className="flex-1 truncate">{c.label}</span>
                  <span className="text-xs">{kidLabel(c.kidId)}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {c.confidence}%
                  </Badge>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

function ReviewCard({ clip }: { clip: Clip }) {
  const { dispatch } = useDemo()
  const [reassignOpen, setReassignOpen] = React.useState(false)
  const [dialogKey, setDialogKey] = React.useState(0)
  const guess = kidById(clip.guessId)
  const isParent = clip.origin === "parent"

  return (
    <Card size="sm" data-testid={`review-${clip.id}`}>
      <CardContent className="gap-3">
        <div className="flex gap-3">
          <ClipThumb jersey={clip.jersey} hue={clip.hue} time={clip.time} className="h-20 w-32 shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-sm font-medium">{clip.label}</div>
            {isParent ? (
              <div className="text-sm">
                Tagged <span className="font-medium">{kidLabel(clip.guessId)}</span>
              </div>
            ) : (
              <div className="text-sm">
                Guess: <span className="font-medium">{kidLabel(clip.guessId)}</span>,{" "}
                {clip.confidence}% confident
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {isParent && (
            <Badge variant="destructive">
              <FlagIcon /> Parent report
            </Badge>
          )}
          <Badge
            variant="outline"
            className="h-auto border-amber-300 bg-amber-50 whitespace-normal text-amber-900"
          >
            {clip.reason}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Could be:</span>
          {clip.candidates.map((id) => (
            <span key={id} className="flex items-center gap-1 text-foreground">
              <KidAvatar kidId={id} className="size-6" />
              {kidById(id).name}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            dispatch({ type: "confirm", id: clip.id })
            toast.success(`Confirmed: ${guess.first} (#${guess.num})`)
          }}
        >
          <CheckIcon /> Confirm
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            setDialogKey((k) => k + 1) // fresh default pick each time
            setReassignOpen(true)
          }}>
          <ArrowLeftRightIcon /> Reassign
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive">
              <Trash2Icon /> Drop
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Drop this clip?</AlertDialogTitle>
              <AlertDialogDescription>
                It won't go in any kid's reel or the Sunday recap.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  dispatch({ type: "drop", id: clip.id })
                  toast("Clip dropped.")
                }}
              >
                Drop clip
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
      <ReassignDialog key={dialogKey} clip={clip} open={reassignOpen} onOpenChange={setReassignOpen} />
    </Card>
  )
}

function ReassignDialog({
  clip,
  open,
  onOpenChange,
}: {
  clip: Clip
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { dispatch } = useDemo()
  const likely = clip.candidates.filter((id) => id !== clip.guessId)
  const [pick, setPick] = React.useState(likely[0] ?? "")
  const others = ROSTER.filter((k) => k.id !== clip.guessId && !likely.includes(k.id))

  const option = (id: string, hint?: string) => (
    <Label
      key={id}
      htmlFor={`r-${clip.id}-${id}`}
      className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-muted"
    >
      <RadioGroupItem value={id} id={`r-${clip.id}-${id}`} />
      <KidAvatar kidId={id} />
      <span className="flex-1 font-normal">{kidById(id).name}</span>
      {hint && <Badge variant="secondary">{hint}</Badge>}
    </Label>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Who is in this clip?</DialogTitle>
          <DialogDescription>
            {clip.label} at {clip.time} · tagged {kidLabel(clip.guessId)}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={pick} onValueChange={setPick} className="gap-2">
          {likely.map((id) => (
            option(id, "Likely")
          ))}
          <Separator className="my-1" />
          {others.map((k) => (
            option(k.id)
          ))}
        </RadioGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!pick}
            onClick={() => {
              const k = kidById(pick)
              dispatch({ type: "reassign", id: clip.id, kidId: pick })
              onOpenChange(false)
              toast.success(`Moved to ${k.first}'s reel (#${k.num})`)
            }}
          >
            Move to {pick ? `#${kidById(pick).num} ${kidById(pick).first}` : "…"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewedRow({ clip }: { clip: Clip }) {
  const { dispatch } = useDemo()
  const outcome =
    clip.status === "dropped"
      ? "Dropped"
      : clip.status === "reassigned"
        ? `Moved to ${kidLabel(clip.kidId)}`
        : `Confirmed ${kidLabel(clip.kidId)}`
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm">
      <span className="w-11 font-mono text-xs text-muted-foreground">{clip.time}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{clip.label}</span>
        <span className="block text-xs text-muted-foreground">
          {outcome}
          {clip.origin === "parent" && " · parent report"}
        </span>
      </span>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => dispatch({ type: "undo", id: clip.id })}
        aria-label="Undo"
      >
        <RotateCcwIcon /> Undo
      </Button>
    </div>
  )
}
