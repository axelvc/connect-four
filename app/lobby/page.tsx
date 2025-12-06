'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function LobbyPage() {
  const [lobbyId, setLobbyId] = useState('')

  function createLobbyGame() {
    console.log('create lobby game')
  }

  function joinLobby() {
    console.log('join lobby')
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="box relative max-w-md w-full p-8">
        <Link href="/" className="absolute top-4 left-4 p-2 opacity-50 hover:opacity-100 transition-opacity">
          <ChevronLeft size={20} />
        </Link>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tighter uppercase text-center">
          Online <br /> Lobby
        </h1>

        <div className="mt-8 space-y-6">
          <button
            onClick={createLobbyGame}
            className="button py-4 w-full uppercase text-sm bg-base-900 text-base-50 hover:bg-base-800!"
          >
            Create Match
          </button>

          <div className="flex items-center gap-2 text-base-400">
            <div className="h-px bg-current opacity-50 grow"></div>
            <span className="font-mono text-xs uppercase">OR</span>
            <div className="h-px bg-current opacity-50 grow"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              value={lobbyId}
              onChange={e => setLobbyId(e.target.value)}
              className="grow p-3 bg-base-200/50 border border-base-900 font-mono text-sm uppercase focus:bg-transparent transition-colors"
            />
            <button onClick={joinLobby} className="button px-6 uppercase text-sm">
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
