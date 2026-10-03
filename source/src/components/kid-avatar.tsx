import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { kidById } from "@/data"
import { cn } from "cn"

export function KidAvatar({ kidId, className }: { kidId: string; className?: string }) {
  const k = kidById(kidId)
  return (
    <Avatar className={cn("size-7", className)}>
      <AvatarFallback className="text-[11px] font-semibold">#{k.num}</AvatarFallback>
    </Avatar>
  )
}
