'use client'

import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import Link from 'next/link'
import { ArrowDown, Check, ChevronLeft, Copy, RefreshCcw, Unplug } from 'lucide-react'

export const cn = (...inputs: any[]) => {
  return twMerge(clsx(inputs))
}

const COLS = 7
const ROWS = 6

enum Move {
  EMPTY,
  PLAYER_1,
  PLAYER_2,
}

enum PlayMode {
  LOCAL,
  ONLINE,
}

type Player = Exclude<Move, Move.EMPTY>

export default function GamePage() {
  const [board, setBoard] = useState<Move[][]>(() =>
    Array(COLS)
      .fill(0)
      .map(() => Array(ROWS).fill(Move.EMPTY)),
  )
  const [player, setPlayer] = useState<Player>(Move.PLAYER_1)
  const [win, setWin] = useState<[number, number][] | null>(null)
  const turnCount = useRef(0)
  const [mode, setMode] = useState<PlayMode>(PlayMode.LOCAL)
  const [lobbyCode, setLobbyCode] = useState('12345')

  function checkWin(board: Move[][], player: Player): [number, number][] | null {
    const WIN_LENGTH = 4

    const directions = [
      [0, 1], // Horizontal
      [1, 0], // Vertical
      [1, 1], // Diagonal (top-left to bottom-right)
      [1, -1], // Diagonal (top-right to bottom-left)
    ]

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        if (board[col][row] !== player) continue

        for (const [dx, dy] of directions) {
          const winningCells: [number, number][] = []

          for (let i = 0; i < WIN_LENGTH; i++) {
            const c = col + i * dx
            const r = row + i * dy

            if (c < 0 || c >= COLS || r < 0 || r >= ROWS || board[c][r] !== player) {
              break
            }

            winningCells.push([c, r])
          }

          if (winningCells.length === WIN_LENGTH) {
            return winningCells
          }
        }
      }
    }

    return null
  }

  function handleMove(colIdx: number) {
    const newBoard = [...board]
    const col = newBoard[colIdx]
    const rowIdx = col.findLastIndex(row => row === Move.EMPTY)

    if (rowIdx === -1) return
    col[rowIdx] = player

    setBoard(newBoard)
    const win = checkWin(newBoard, player)

    if (win) {
      setWin(win)
    } else if (turnCount.current === COLS * ROWS) {
      // draw
    } else {
      setPlayer(player === Move.PLAYER_1 ? Move.PLAYER_2 : Move.PLAYER_1)
      turnCount.current++
    }
  }

  function resetGame() {
    setBoard(
      Array(COLS)
        .fill(0)
        .map(() => Array(ROWS).fill(Move.EMPTY)),
    )
    setPlayer(Move.PLAYER_1)
    setWin(null)
    turnCount.current = 0
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 sm:p-6 md:px-12 md:py-8 flex justify-between border-b border-base-300">
        <div className="flex flex-col gap-2">
          {/* back button */}
          <Link
            href="/"
            className="self-start flex items-center gap-1 text-xs font-mono uppercase tracking-widest hover:underline opacity-50 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={10} />
            Menu
          </Link>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">
            Connect <br /> Four
          </h1>

          {/* lobby code */}
          <div className="flex gap-1">
            <span className="px-2 py-1 bg-base-900 text-base-50 text-xs font-mono uppercase tracking-widest">
              {mode === PlayMode.LOCAL ? 'Local mode' : `CODE: #${lobbyCode}`}
            </span>

            {mode === PlayMode.ONLINE && <CopyButton />}
          </div>
        </div>

        <div className="flex flex-col self-end gap-4 text-xs font-mono tracking-widest">
          {/* leave match button */}
          {mode === PlayMode.ONLINE && (
            <Link href="/" className="flex items-center gap-2 uppercase hover:underline text-red-600">
              <Unplug size={14} />
              Leave Match
            </Link>
          )}

          {/* reset button */}
          <button onClick={resetGame} className="flex uppercase items-center gap-2 cursor-pointer group">
            <RefreshCcw
              size={14}
              className={cn('transition-transform duration-700 group-hover:rotate-180', win && 'rotate-180')}
            />
            Reset Board
          </button>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col justify-center items-center">
        {/* board */}
        <div className="box flex cursor-pointer">
          {board.map((col, cIdx) => (
            <div key={cIdx} className="group relative" onClick={() => handleMove(cIdx)}>
              <ArrowDown className="hidden group-hover:block absolute left-1/2 bottom-full -translate-x-1/2 -translate-y-4 size-4 sm:size-5 md:size-6 animate-bounce opacity-50" />

              {col.map((cell, rIdx) => {
                const isWin = win?.some(([c, r]) => c === cIdx && r === rIdx)

                return (
                  <div
                    key={rIdx}
                    className={cn(
                      'relative w-[12vw] max-w-20 aspect-square border-r border-b border-slate-200',
                      isWin && 'bg-base-900 border-base-900',
                    )}
                  >
                    {/* piece */}
                    {cell !== Move.EMPTY && (
                      <div
                        style={{ ['--row']: rIdx + 1 }}
                        className={cn(
                          'size-full rounded-full scale-70 absolute animate-drop',
                          cell === Move.PLAYER_1 && 'bg-base-900',
                          cell === Move.PLAYER_2 && 'border-8 border-base-900',
                          isWin && 'invert',
                        )}
                      ></div>
                    )}

                    {/* hover indicator */}
                    {cell === Move.EMPTY && (
                      <div className="absolute inset-0 rounded-full bg-current/5 scale-30 hidden group-hover:block" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* current player */}
        <div className="mt-8 flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <Player name="Player 1" active={player === Move.PLAYER_1} />
          <span className="opacity-30">VS</span>
          <Player name="Player 2" active={player === Move.PLAYER_2} />
        </div>

        {/* waiting for player 2 */}
        {mode === PlayMode.ONLINE && (
          <div className="modal">
            <div className="box p-6 max-w-sm text-center">
              <p className="mb-4 font-mono text-sm uppercase tracking-widest">
                Waiting for Player 2<span className="text-[8px]">...</span>
              </p>
              <div className="relative p-2 mb-2 border border-base-900 bg-base-200/50">
                <span className="font-bold text-xl tracking-widest select-all">{lobbyCode}</span>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <CopyButton />
                </div>
              </div>
              <p className="text-xs opacity-50 uppercase">Share this code with your friend</p>
            </div>
          </div>
        )}

        {/* win modal */}
        {win && (
          <div className="modal">
            <div className="text-center">
              <h2 className="mb-2 sm:mb-4 text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter uppercase wrap-break-word">
                {player === Move.PLAYER_1 && 'Player 1 Wins'}
                {player === Move.PLAYER_2 && 'Player 2 Wins'}
              </h2>

              <div className="mt-8 sm:mt-12">
                <button
                  onClick={resetGame}
                  className="button button-alt uppercase mx-auto px-6 py-2 sm:px-8 sm:py-3 text-xs tracking-widest font-bold"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full p-6 md:px-12 flex text-base-50 border-t border-base-300 text-xs font-mono uppercase tracking-widest"></footer>
    </div>
  )
}

const Player = ({ name, active }: { name: string; active: boolean }) => {
  return (
    <div className={cn('flex items-center gap-2 transition-opacity', active ? 'opacity-100' : 'opacity-30')}>
      <div className="size-2 rounded-full bg-base-900"></div>
      <span className="underline decoration-dotted">{name}</span>
    </div>
  )
}

const CopyButton = () => {
  const [isCopied, setIsCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText('12345')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <button
      onClick={copyCode}
      aria-label="Copy lobby code"
      className="size-6 inline-grid place-items-center hover:opacity-50 cursor-pointer outline-offset-0!"
    >
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
