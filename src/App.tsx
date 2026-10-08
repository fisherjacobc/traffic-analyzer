import { useEffect, useState } from "react"
import { Check, Copy, Undo2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  eventLabels,
  recorders,
  subjects,
  createEvent,
  loadSessions,
  saveSessions,
  type EventType,
  type Session,
} from "@/lib/sessions"

type EventGroup = {
  title: string
  events: { type: EventType; label: string }[]
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const eventGroups: EventGroup[] = [
  ...subjects.map((subject) => ({
    title: capitalize(subject),
    events: [
      { type: `${subject}Entered` as const, label: "Entered" },
      { type: `${subject}Exited` as const, label: "Exited" },
    ],
  })),
  {
    title: "Bus stop",
    events: [
      { type: "busArrivedAtStop", label: "Bus arrives" },
      { type: "busLeftStop", label: "Bus leaves" },
    ],
  },
  {
    title: "Car passenger",
    events: [
      { type: "carPickedUpPerson", label: "Picked up" },
      { type: "carDroppedOffPerson", label: "Dropped off" },
    ],
  },
]

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  })

export function App() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions)
  const [recorder, setRecorder] = useState<string>(recorders[0])

  useEffect(() => saveSessions(sessions), [sessions])

  const active = sessions.find((s) => s.endedAt === null)

  const startSession = () => {
    const started = createEvent("sessionStarted")
    setSessions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        recorder,
        startedAt: started.timestamp,
        endedAt: null,
        events: [started],
      },
    ])
  }

  const record = (type: EventType) => {
    const event = createEvent(type)
    setSessions((prev) =>
      prev.map((s) =>
        s.endedAt === null
          ? {
              ...s,
              events: [...s.events, event],
              endedAt: type === "sessionEnded" ? event.timestamp : null,
            }
          : s
      )
    )
  }

  // Removes the most recent event, but never the sessionStarted event.
  const undo = () =>
    setSessions((prev) =>
      prev.map((s) =>
        s.endedAt === null && s.events.length > 1
          ? { ...s, events: s.events.slice(0, -1) }
          : s
      )
    )

  const endSession = () => {
    if (window.confirm("End this session?")) record("sessionEnded")
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Traffic Analyzer
      </h1>

      {active ? (
        <ActiveSession
          session={active}
          onRecord={record}
          onUndo={undo}
          onEnd={endSession}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New session</CardTitle>
            <CardDescription>Who is recording?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RadioGroup
              value={recorder}
              onValueChange={(value) => setRecorder(value as string)}
            >
              {recorders.map((name) => (
                <Label key={name} className="py-1">
                  <RadioGroupItem value={name} />
                  {name}
                </Label>
              ))}
            </RadioGroup>
            <Button className="h-12" onClick={startSession}>
              Start session
            </Button>
          </CardContent>
        </Card>
      )}

      <SessionList sessions={sessions} />
    </main>
  )
}

function ActiveSession({
  session,
  onRecord,
  onUndo,
  onEnd,
}: {
  session: Session
  onRecord: (type: EventType) => void
  onUndo: () => void
  onEnd: () => void
}) {
  const counts = new Map<EventType, number>()
  for (const event of session.events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1)
  }
  const last = session.events[session.events.length - 1]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recording: {session.recorder}</CardTitle>
        <CardDescription>
          Started {formatTime(session.startedAt)}
        </CardDescription>
        <CardAction>
          <Button variant="destructive" onClick={onEnd}>
            End session
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {eventGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                {group.title}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {group.events.map((event) => (
                  <Button
                    key={event.type}
                    variant="outline"
                    className="h-14 justify-between px-3"
                    onClick={() => onRecord(event.type)}
                  >
                    {event.label}
                    <Badge variant="secondary">
                      {counts.get(event.type) ?? 0}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Last: {eventLabels[last.type]} at{" "}
            {new Date(last.timestamp).toLocaleTimeString()}
          </p>
          <Button
            variant="outline"
            disabled={last.type === "sessionStarted"}
            onClick={onUndo}
          >
            <Undo2 />
            Undo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SessionList({ sessions }: { sessions: Session[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copy = async (session: Session) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(session, null, 2))
      setCopiedId(session.id)
      setTimeout(
        () => setCopiedId((id) => (id === session.id ? null : id)),
        2000
      )
    } catch (err) {
      console.error("Failed to copy session", err)
      window.alert("Could not copy to clipboard")
    }
  }

  if (sessions.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">Sessions</h2>
      {[...sessions].reverse().map((session) => (
        <Card key={session.id} size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Session {session.id} · {session.recorder}
              {session.endedAt === null && <Badge>In progress</Badge>}
            </CardTitle>
            <CardDescription>
              {formatTime(session.startedAt)}
              {session.endedAt && ` – ${formatTime(session.endedAt)}`} ·{" "}
              {session.events.length} events
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                disabled={session.endedAt === null}
                onClick={() => copy(session)}
              >
                {copiedId === session.id ? <Check /> : <Copy />}
                {copiedId === session.id ? "Copied" : "Copy JSON"}
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </section>
  )
}

export default App
