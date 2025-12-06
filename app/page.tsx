import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-4 bg-base-200 text-base-900 font-sans">
      <div className="box p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2 text-center">
          Connect
          <br />
          Four
        </h1>

        <p className="mb-8 opacity-60 font-mono text-xs uppercase tracking-widest text-center">Select Game Mode</p>

        <div className="space-y-4">
          <Link className="button" href="/game">
            <span className="uppercase font-bold font-mono tracking-widest">Play Solo / Local</span>
            <span className="text-xs opacity-60 font-mono">1 Device • 2 Players</span>
          </Link>

          <Link className="button" href="/lobby">
            <span className="uppercase font-bold font-mono tracking-widest">Online Multiplayer</span>
            <span className="text-xs opacity-60 font-mono">2 Devices • Real-time</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
