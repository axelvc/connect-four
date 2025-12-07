'use client'

import { useEffectEvent, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import { ArrowDown, Check, Copy, RefreshCcw, Unplug, Globe, X } from 'lucide-react'
import { useGame } from '@/hooks/useGame'
import { useLobby, LobbyStatus } from '@/hooks/useLobby'
import { MessageHandler, P2PEventType } from '@/lib/p2p'
import { GameStatus, Player } from '@/lib/connnect_four'

export enum PlayMode {
  LOCAL,
  ONLINE,
}

export const cn = (...inputs: unknown[]) => {
  return twMerge(clsx(inputs))
}

export default function GamePage() {
  const [mode, setMode] = useState<PlayMode>(PlayMode.LOCAL)
  const [joinCode, setJoinCode] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const game = useGame()
  const lobby = useLobby({
    onConnect: useEffectEvent(() => {
      reset(true, true)
    }),
    onMessage: useEffectEvent<MessageHandler>(msg => {
      switch (msg.type) {
        case P2PEventType.MOVE:
          move(msg.payload as number, true)
          break
        case P2PEventType.RESET:
          reset(true)
          break
      }
    }),
    onDisconnect: useEffectEvent(() => {
      reset(true, true)
    }),
  })

  const isOnline = mode === PlayMode.ONLINE
  const isIdle = lobby.status === LobbyStatus.IDLE
  const isWaiting = lobby.status === LobbyStatus.WAITING
  const isConnected = lobby.status === LobbyStatus.CONNECTED
  const isPlaying = game.status === GameStatus.IN_PROGRESS

  function move(col: number, isRemote: boolean = false) {
    if (isOnline && !isRemote && lobby.myTurn !== game.player) return
    game.move(col)

    if (isOnline && isRemote) return
    lobby.send(P2PEventType.MOVE, col)
  }

  function reset(isRemote = false, clearHistory = false) {
    game.reset(clearHistory)

    if (isOnline && isRemote) return
    lobby.send(P2PEventType.RESET)
  }

  function joinRoom() {
    if (!joinCode) return
    lobby.join(joinCode)
    setJoinCode('')
  }

  function leaveRoom() {
    lobby.disconnect()
    setMode(PlayMode.LOCAL)
  }

  function copyCode() {
    navigator.clipboard.writeText(lobby.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col uppercase">
      <header className="bg-base-200 w-full p-4 sm:p-6 md:px-12 md:py-8 flex justify-between border-b border-base-300">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter leading-none">
          Connect <br /> Four
        </h1>

        <div className="flex flex-col self-end gap-4 text-xs font-mono tracking-widest">
          {/* leave match button */}
          {isOnline && (
            <button onClick={leaveRoom} className="flex items-center gap-2 hover:underline text-red-600 cursor-pointer">
              <Unplug size={14} />
              Leave Match
            </button>
          )}

          {!isOnline && (
            <button
              onClick={() => setMode(PlayMode.ONLINE)}
              className="flex items-center gap-2 hover:underline text-blue-500 cursor-pointer"
            >
              <Globe size={14} />
              Play Online
            </button>
          )}

          {/* reset button */}
          <button onClick={() => reset()} className="flex items-center gap-2 cursor-pointer group">
            <RefreshCcw
              size={14}
              className={cn('transition-transform duration-700 group-hover:rotate-180', !isPlaying && 'rotate-180')}
            />
            Reset Board
          </button>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col justify-center items-center">
        {/* board */}
        <div className="box flex cursor-pointer">
          {game.board.map((col, cIdx) => (
            <div key={cIdx} className="group relative" onClick={() => move(cIdx)}>
              <ArrowDown className="hidden group-hover:block absolute left-1/2 bottom-full -translate-x-1/2 -translate-y-4 size-4 sm:size-5 md:size-6 animate-bounce opacity-50" />

              {col.map((cell, rIdx) => {
                const isWin = game.winMatch?.some(([c, r]) => c === cIdx && r === rIdx)

                return (
                  <div
                    key={rIdx}
                    className={cn(
                      'relative w-[12vw] max-w-20 aspect-square border-r border-b border-slate-200',
                      isWin && 'bg-base-900 border-base-900',
                    )}
                  >
                    {/* piece */}
                    {cell !== null && (
                      <div
                        style={{ ['--row']: rIdx + 1 }}
                        className={cn(
                          'size-full rounded-full scale-70 absolute animate-drop',
                          cell === Player.PLAYER_1 && 'bg-base-900',
                          cell === Player.PLAYER_2 && 'border-8 border-base-900',
                          isWin && 'invert',
                        )}
                      ></div>
                    )}

                    {/* hover indicator */}
                    {cell === null && (
                      <div className="absolute inset-0 rounded-full bg-current/5 scale-30 hidden group-hover:block" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* current player */}
        <div className="mt-8 flex items-center gap-4 text-xs font-mono tracking-widest">
          <div
            className={cn(
              'flex items-center gap-2 transition-opacity',
              game.player === Player.PLAYER_1 ? 'opacity-100' : 'opacity-30',
            )}
          >
            <div className="size-2 rounded-full bg-base-900"></div>
            <span className="underline decoration-dotted">Player 1</span>
          </div>
          <span className="opacity-30">VS</span>
          <div
            className={cn(
              'flex items-center gap-2 transition-opacity',
              game.player === Player.PLAYER_2 ? 'opacity-100' : 'opacity-30',
            )}
          >
            <div className="size-2 rounded-full border border-base-900"></div>
            <span className="underline decoration-dotted">Player 2</span>
          </div>
        </div>

        {/* Online Setup Modal */}
        {isOnline && !isConnected && (
          <div className="modal">
            <div className="box p-6 max-w-sm text-center w-full relative">
              <button onClick={leaveRoom} className="absolute top-2 left-2 cursor-pointer">
                <X size={14} />
              </button>

              {isWaiting && (
                <>
                  <p className="mb-4 font-mono text-sm tracking-widest">
                    Waiting for Player 2<span className="text-[8px]">...</span>
                  </p>

                  <div className="flex">
                    <input
                      readOnly
                      value={lobby.code}
                      className="grow p-3 h-11 bg-base-200/50 border border-base-900 font-mono text-sm"
                    />

                    <button onClick={copyCode} aria-label="Copy lobby code" className="button ml-2 p-3 size-11">
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs opacity-50">Share this code with your friend</p>

                  <button
                    onClick={lobby.reset}
                    className="text-xs underline opacity-50 hover:opacity-100 mt-6 tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}

              {isIdle && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      className="grow p-3 bg-base-200/50 border border-base-900 font-mono text-sm focus:bg-transparent transition-colors"
                    />
                    <button onClick={joinRoom} className="button px-6 text-sm">
                      Join
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-base-400">
                    <div className="h-px bg-current opacity-50 grow"></div>
                    <span className="font-mono text-xs">OR</span>
                    <div className="h-px bg-current opacity-50 grow"></div>
                  </div>

                  <button onClick={lobby.create} className="button button-alt py-4 w-full text-sm">
                    Create Match
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* win modal */}
        {!isPlaying && (
          <div className="modal">
            <div className="text-center">
              <h2 className="mb-2 sm:mb-4 text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter wrap-break-word">
                {game.status === GameStatus.DRAW && 'Draw'}
                {game.status === GameStatus.WINNER &&
                  (game.player === Player.PLAYER_1 ? 'Player 1 Wins' : 'Player 2 Wins')}
              </h2>

              <div className="mt-8 sm:mt-12">
                <button
                  onClick={() => reset()}
                  className="button button-alt mx-auto px-6 py-2 sm:px-8 sm:py-3 text-xs tracking-widest font-bold"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full px-4 py-6 sm:p-6 md:px-12 flex items-center bg-base-200 text-base-900 border-t border-base-300 text-xs font-mono tracking-widest">
        {/* status */}
        <span
          className={cn(
            'px-2 py-1 bg-base-900 text-base-50',
            isOnline &&
              isConnected &&
              game.player !== lobby.myTurn &&
              'bg-transparent border border-base-900 text-base-900',
          )}
        >
          {mode === PlayMode.LOCAL
            ? 'Local mode'
            : isIdle
            ? 'Online mode'
            : isWaiting
            ? 'Waiting for player 2'
            : lobby.myTurn === game.player
            ? 'My turn'
            : 'Opponent turn'}
        </span>

        {/* history */}
        <span className="ml-auto">
          {game.history.slice(-10).map((player, index) => {
            const onlineMode = isOnline && isConnected && isPlaying

            return (
              <span
                key={index}
                className={cn(
                  'size-4 inline-grid place-items-center border',
                  !onlineMode &&
                    (player === Player.PLAYER_1
                      ? 'border-base-900 bg-base-900 text-base-50'
                      : 'border-base-900 text-base-900'),
                  onlineMode &&
                    (player === Player.PLAYER_1
                      ? 'border-emerald-400 bg-emerald-400 text-emerald-900'
                      : 'border-rose-400 bg-rose-400 text-rose-900'),
                )}
              >
                {!onlineMode && (player === Player.PLAYER_1 ? '1' : '2')}
                {onlineMode && (player === lobby.myTurn ? 'W' : 'L')}
              </span>
            )
          })}
        </span>
      </footer>
    </div>
  )
}
