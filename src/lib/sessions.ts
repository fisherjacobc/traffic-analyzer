export const recorders = ["Jacob Fisher", "Joseph Lee", "Lucas Pannell", "Rick Rawlins", "Swarup Pokhrel"] as const

export const subjects = [
  "car",
  "bus",
  "pedestrian",
  "jaywalker",
  "other",
] as const

export type Subject = (typeof subjects)[number]

export type EventType =
  | "sessionStarted"
  | "sessionEnded"
  | `${Subject}Entered`
  | `${Subject}Exited`
  | "busArrivedAtStop"
  | "busLeftStop"
  | "carPickedUpPerson"
  | "carDroppedOffPerson"

export type SessionEvent = {
  type: EventType
  timestamp: string
}

export type Session = {
  id: number
  recorder: string
  startedAt: string
  endedAt: string | null
  events: SessionEvent[]
}

export const eventLabels: Record<EventType, string> = {
  sessionStarted: "Session started",
  sessionEnded: "Session ended",
  carEntered: "Car entered",
  carExited: "Car exited",
  busEntered: "Bus entered",
  busExited: "Bus exited",
  pedestrianEntered: "Pedestrian entered",
  pedestrianExited: "Pedestrian exited",
  jaywalkerEntered: "Jaywalker entered",
  jaywalkerExited: "Jaywalker exited",
  otherEntered: "Other entered",
  otherExited: "Other exited",
  busArrivedAtStop: "Bus arrived at stop",
  busLeftStop: "Bus left stop",
  carPickedUpPerson: "Car picked up person",
  carDroppedOffPerson: "Car dropped off person",
}

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem("sessions")
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Session[]) : []
  } catch (err) {
    console.error("Failed to load sessions", err)
    return []
  }
}

export function saveSessions(sessions: Session[]) {
  try {
    localStorage.setItem("sessions", JSON.stringify(sessions))
  } catch (err) {
    console.error("Failed to save sessions", err)
  }
}

export const createEvent = (type: EventType): SessionEvent => ({
  type,
  timestamp: new Date().toISOString(),
})