import { useRef, useState } from 'react'

export enum Player {
  PLAYER_1,
  PLAYER_2,
}

export enum GameStatus {
  IN_PROGRESS,
  WINNER,
  DRAW,
}

export const COLS = 7
export const ROWS = 6

type WinMatch = [number, number][]

const createBoard = (): Player[][] =>
  Array(COLS)
    .fill(0)
    .map(() => Array(ROWS).fill(null))

export function useGame() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IN_PROGRESS)
  const [player, setPlayer] = useState<Player>(Player.PLAYER_1)
  const [board, setBoard] = useState<Player[][]>(createBoard)
  const winMatch = useRef<WinMatch | null>(null)
  const turnCount = useRef(1)

  function _checkWin() {
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
          const winningCells: WinMatch = []

          for (let i = 0; i < WIN_LENGTH; i++) {
            const c = col + i * dx
            const r = row + i * dy

            if (c < 0 || c >= COLS || r < 0 || r >= ROWS || board[c][r] !== player) {
              break
            }

            winningCells.push([c, r])
          }

          if (winningCells.length === WIN_LENGTH) {
            winMatch.current = winningCells
            return
          }
        }
      }
    }
  }

  function move(colIdx: number) {
    const col = board[colIdx]
    const rowIdx = col.findLastIndex(row => row === null)

    if (rowIdx === -1) return
    col[rowIdx] = player

    setBoard(board)
    _checkWin()

    if (winMatch.current) {
      setStatus(GameStatus.WINNER)
    } else if (turnCount.current === COLS * ROWS) {
      console.log('draw')
      setStatus(GameStatus.DRAW)
    } else {
      setPlayer(player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1)
      turnCount.current++
    }
  }

  function reset() {
    setBoard(createBoard())
    setPlayer(Player.PLAYER_1)
    setStatus(GameStatus.IN_PROGRESS)
    winMatch.current = null
    turnCount.current = 1
  }

  return {
    // props
    status,
    board,
    player,
    get winMatch(): WinMatch | null {
      return winMatch.current
    },
    // methods
    move,
    reset,
  }
}
