import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6x p-7x">
      <p className="text-text-subtitle text-type-sm tracking-widest uppercase">
        AIMS OS — Button variants
      </p>
      <div className="flex flex-wrap items-center gap-3x">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="main">Main Action</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3x">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="default">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3x">
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>
    </div>
  )
}

export default App
