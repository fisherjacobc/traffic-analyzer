import { Button } from "@/components/ui/button"

type Counter = {
  label: string
}

const counters: Counter[] = [
  { label: "Ped in Crosswalk" },
  { label: "Ped Jaywalking" },
  { label: "Car" },
  { label: "Car & Ped @ Intersection" },
  { label: "Car & Ped in Road" },
  { label: "Bus" },
  { label: "Bus & Ped @ Intersection" },
  { label: "Bus & Ped in Road" },
  { label: "Car Parking" },
  { label: "Car Unparking" },
]

const record = (label: string) =>
  fetch("/api/count", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  }).catch((err) => console.error("Failed to record count", err))

export function App() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 px-4 py-10">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        People Counter
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counters.map((counter) => (
          <Button
            key={counter.label}
            variant="outline"
            className="h-16"
            onClick={() => record(counter.label)}
          >
            {counter.label}
          </Button>
        ))}
      </div>
    </main>
  )
}

export default App
