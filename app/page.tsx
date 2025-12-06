import Link from 'next/link'
import { User, Globe } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="box p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2 text-center">
          Connect
          <br />
          Four
        </h1>

        <p className="mb-8 opacity-60 font-mono text-xs uppercase tracking-widest text-center">Select Game Mode</p>

        <div className="space-y-4">
          <Link className="button py-6" href="/game">
            <User />
            <span className="uppercase font-bold tracking-widest">Play Solo / Local</span>
            <span className="text-xs opacity-50">1 Device • 2 Players</span>
          </Link>

          <Link className="button py-6 relative" href="/lobby">
            <Globe />
            <span className="uppercase font-bold tracking-widest">Online Multiplayer</span>
            <span className="text-xs opacity-50">2 Devices • Real-time</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
